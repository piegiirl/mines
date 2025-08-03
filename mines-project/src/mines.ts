import type { Phase, PhaseHandler } from "./types";

class PhaseMachine {
  private GridCells: Array<HTMLDivElement> = [];
  private openCell: number = 0;
  private currentCellId: number = 0;
  private phases: Record<Phase, PhaseHandler> = {
    idle: async () => {
      document.getElementById("button-cash-out")!.style.display = "none";
      document.getElementById("button-bet")!.style.display = "block";
      this.GridCells = Array.from({ length: 25 }, (_, i) => i + 1).map(
        (_) => document.getElementById(`${_}`)! as HTMLDivElement
      );
      this.GridCells.forEach((element) => element.classList.add("disabled"));
      this.openCell = 0;
      this.openCell = 0;
      const buttonBet = document.getElementById("button-bet")!;
await new Promise<void>((resolve) => {
        const onClick = () => {
          buttonBet.removeEventListener("pointerdown", onClick);
          resolve();
        };

        buttonBet.addEventListener("pointerdown", onClick);
      });
      return "playing";
    },
    playing: async () => {
      document.getElementById("button-cash-out")!.style.display = "block";
      this.GridCells.forEach((element) => element.classList.add("active"));
      function waitForDivClick(cleanup: ()=>{}) {
        return new Promise((resolve) => {
          function clickHandler(e: Event) {
            if (e.target instanceof HTMLDivElement) {
              const id = parseInt(e.target.id);
              console.log(e.target);
              if (!isNaN(id) && id >= 1 && id <= 25) {
                cleanup(); // Чистит
                resolve({ type: "div", divId: id });
              }
            }
          }
          document.addEventListener("click", clickHandler);
          // Store handler for cleanup
          //@ts-ignore
          document._divClickHandler = clickHandler;
        });
      }

      // Для кэш аута
      function createCashOutPromise(cleanup: ()=>{}) {
        const button = document.getElementById("button-cash-out")!;
        return new Promise((resolve) => {
          const clickHandler = () => {
            cleanup(); // Чистит
            resolve({ type: "cashOut" });
          };
          button.addEventListener("click", clickHandler);
          //@ts-ignore
          button._clickHandler = clickHandler;
        });
      }
      const cleanup = () => {
        //@ts-ignore
        if (document._divClickHandler) {
          //@ts-ignore
            document.removeEventListener('click', document._divClickHandler);
            //@ts-ignore
            delete document._divClickHandler;
        }

        const cashOut = document.getElementById('button-cash-out')!;
        //@ts-ignore
        if (cashOut._clickHandler) {
          //@ts-ignore
            cashOut.removeEventListener('click', cashOut._clickHandler);
            //@ts-ignore
            delete cashOut._clickHandler;
        }
    };
    
    // СОздаем промисы гонки
    //@ts-ignore
    const divPromise = waitForDivClick(cleanup);
    //@ts-ignore
    const cashOutPromise = createCashOutPromise(cleanup);
    
    const result = await Promise.race([divPromise, cashOutPromise]);
    if(result === "cashOut"){
      return "win";
    }else {
      //@ts-ignore
      this.currentCellId = result.divId;
      console.log(result);
      return "revealing";
    }
    },
    revealing: async () => {
      console.log(this.currentCellId);
      document.getElementById("button-cash-out")!.style.visibility = "disabled";
      this.openCell++;
      if (this.openCell >= 5) {
        document
          .getElementById("" + this.currentCellId)!
          .classList.toggle("flipped");
        document.getElementById("" + this.currentCellId)!.classList.add("loss");
        return "loss";
      } else {
        console.log(this.currentCellId);
        document
          .getElementById("" + this.currentCellId)!
          .classList.toggle("flipped");
        document.getElementById("" + this.currentCellId)!.classList.add("win");
        return "playing";
      }
    },
    loss: async () => {
      this.GridCells.forEach((element) => element.classList.remove("win"));
      this.GridCells.forEach((element) => element.classList.remove("loss"));
      this.GridCells.forEach((element) => element.classList.remove("flipped"));
      return "idle";
    },
    win: async () => {
      return "idle"
    },
  };
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
