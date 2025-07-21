import type { Phase, PhaseHandler } from "./types";

class PhaseMachine {
    private GridCells: Array<HTMLDivElement> = [];
    private phases: Record<Phase, PhaseHandler> ={
        idle: async () => {
            document.getElementById("button-bet")!.style.visibility = "visible"; 
            let openCell = 0;
            this.GridCells = Array.from({length: 25}, (_, i) => i + 1).map(_=>document.getElementById(`${_}`)! as HTMLDivElement);
            this.GridCells.forEach(element =>  element.classList.add("disabled"));
            return "playing";
        },
        playing: async () => {

            return "";
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
