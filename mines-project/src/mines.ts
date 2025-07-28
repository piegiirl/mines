import type { Phase, PhaseHandler } from "./types";

class PhaseMachine {
    private GridCells: Array<HTMLDivElement> = [];
    private openCell: number = 0;
    private currentCellId: number = 0;
    private phases: Record<Phase, PhaseHandler> ={
        idle: async () => {
            document.getElementById("button-bet")!.style.visibility = "visible"; 
            this.GridCells = Array.from({length: 25}, (_, i) => i + 1).map(_=>document.getElementById(`${_}`)! as HTMLDivElement);
            this.GridCells.forEach(element =>  element.classList.add("disabled"));
            this.openCell = 0;
            return "playing";
        },
        playing: async () => {
          document.getElementById("button-bet")!.style.visibility = "hidden"; 
          document.getElementById("button-cash-out")!.style.visibility = "visible";
          this.GridCells.forEach(element =>  element.classList.add("active")); 
          function waitForDivClick() {
            return new Promise<{divId: number}>((resolve) => {
            function clickHandler(e: Event) {
            if (e.target instanceof HTMLDivElement) {
              const id = parseInt(e.target.id);
              if(!isNaN(id) && id >= 1 && id <= 25) {        
                document.removeEventListener('click', clickHandler);
                resolve({
                  divId: id,
                });
              }
            }  
          }
          document.addEventListener('click', clickHandler);
          });
        }
        const result = await waitForDivClick();
        this.currentCellId = result.divId;
        console.log(result);
        return "revealing";
        },
        revealing: async () => {
          console.log(this.currentCellId);
          document.getElementById("button-cash-out")!.style.visibility = "disabled";
          this.openCell++;
          if (this.openCell >= 5){
            document.getElementById(""+this.currentCellId)!.classList.toggle('flipped');
            document.getElementById(""+this.currentCellId)!.classList.add('loss');
            return "loss";
          } else {
            document.getElementById(""+this.currentCellId)!.classList.toggle('flipped');
            document.getElementById(""+this.currentCellId)!.classList.add('win');
            return "playing";
          }
        }
    } 
    constructor() {
    this.execute("idle");
  }

  async execute(phase: Phase) {
    console.groupEnd();
    console.group(`Phase {${phase}}`);
    const nextPhase: Phase = await this.phases[phase]();
    this.execute(nextPhase);
  }
}
new PhaseMachine();
