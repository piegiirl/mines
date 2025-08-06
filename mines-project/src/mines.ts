import type { Phase, PhaseHandler } from "./types";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

class PhaseMachine {
  private GridCells: Array<HTMLDivElement> = [];
  private openCell: number = 0;
  private currentCellId: number = 0;
  private mines: number = 0;
  private safeCells: number = 0;
  private safeClick: number = 0;
  private clickedCells = new Set();

  randomSafeClick(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  pickRandomCells(arr: number[], count: number): number[] {
    const shuffled = arr.slice().sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private phases: Record<Phase, PhaseHandler> = {
    idle: async () => {
      const selectElement = document.querySelector('.mines-select') as HTMLSelectElement;
      const handleChange = (event: Event) => {
        this.mines = Number((event.target as HTMLSelectElement).value);
        this.safeCells = 25 - this.mines;
      }
      selectElement.addEventListener("change", handleChange);

      this.clickedCells.clear();
      this.GridCells.forEach((element) => element.classList.remove("flipped"));
      this.GridCells.forEach((element) => element.classList.remove("win"));
      this.GridCells.forEach((element) => element.classList.remove("loss"));
      document.getElementById("button-cash-out")!.style.display = "none";
      document.getElementById("button-bet")!.style.display = "block";
      this.GridCells = Array.from({ length: 25 }, (_, i) => i + 1).map(
        (_) => document.getElementById(`${_}`)! as HTMLDivElement
      );
      this.GridCells.forEach((element) => element.classList.add("disabled"));
      this.openCell = 0;
      const buttonBet = document.getElementById("button-bet")!;
      this.safeClick = this.randomSafeClick(0, this.safeCells);
      console.log("SafeClick: ",this.safeClick);

      await new Promise<void>((resolve) => {
        const onClick = () => {
          buttonBet.removeEventListener("pointerdown", onClick);
          resolve();
        };

        buttonBet.addEventListener("pointerdown", onClick);
      });
      selectElement.removeEventListener("change", handleChange, true);
      console.log("mines: ", this.mines, "safeCells: ", this.safeCells);
      return "playing";
    },
    playing: async () => {
      document.getElementById("button-cash-out")!.style.display = "block";
      this.GridCells.forEach((element) => element.classList.add("active"));
      function waitForDivClick(
        cleanup: () => {}
      ): Promise<{ type: "div"; divId: number }> {
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
      function createCashOutPromise(
        cleanup: () => {}
      ): Promise<{ type: "cashOut" }> {
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
          document.removeEventListener("click", document._divClickHandler);
          //@ts-ignore
          delete document._divClickHandler;
        }

        const cashOut = document.getElementById("button-cash-out")!;
        //@ts-ignore
        if (cashOut._clickHandler) {
          //@ts-ignore
          cashOut.removeEventListener("click", cashOut._clickHandler);
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
      if (result.type === "cashOut") {
        return "win";
      } else {
        //@ts-ignore
        this.currentCellId = result.divId;
        console.log(result);
        return "revealing";
      }
    },
    revealing: async () => {
      console.log(this.currentCellId);
      this.clickedCells.add(this.currentCellId);
      document.getElementById("button-cash-out")!.style.visibility = "disabled";
      this.openCell++;
      if (this.openCell > this.safeClick) {
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
      const unclicked = Array.from({ length: 25 }, (_, i) => i + 1).filter(
        (i) => !this.clickedCells.has(i)
      );
      console.log(unclicked);
      const arrayMines = this.pickRandomCells(unclicked, this.mines - 1);
      console.log(arrayMines);
      const minesSet = new Set(arrayMines);
      const starsSet = new Set(unclicked).difference(minesSet);
      Array.from(starsSet).forEach((id) => {
        console.log(id);
        document.getElementById("" + id)!.classList.add("flipped", "win");
      });
      arrayMines.forEach((id) => {
        console.log(id);
        document.getElementById("" + id)!.classList.add("flipped", "loss");
      });
      await sleep(2000);
      return "idle";
    },
    win: async () => {
      const unclicked = Array.from({ length: 25 }, (_, i) => i + 1).filter(
        (i) => !this.clickedCells.has(i)
      );
      console.log(unclicked);
      const arrayMines = this.pickRandomCells(unclicked, this.mines);
      console.log(arrayMines);
      const minesSet = new Set(arrayMines);
      const starsSet = new Set(unclicked).difference(minesSet);
      Array.from(starsSet).forEach((id) => {
        console.log(id);
        document.getElementById("" + id)!.classList.add("flipped", "win");
      });
      arrayMines.forEach((id) => {
        console.log(id);
        document.getElementById("" + id)!.classList.add("flipped", "loss");
      });
      await sleep(2000);

      return "idle";
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
