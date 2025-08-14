import type { Phase, PhaseHandler } from "./types";
import { randomSafeClick } from "./utils";
import { pickRandomCells } from "./utils";
import { BalanceStore } from "./balanceStore";
import { reaction } from "mobx";
import { autorun} from "mobx";
import { MathStore } from "./mathStore";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

class PhaseMachine {
  private GridCells: Array<HTMLDivElement> = [];
  private currentCellId: number = 0;
  private mines: number = 1;
  private clickedCells = new Set();
  private balanceStore = new BalanceStore();
  private mathStore = new MathStore();
  private multi: number = 1.01;
  
  private phases: Record<Phase, PhaseHandler> = {
    idle: async () => {
      this.mathStore.deleteOpenCell();

      const disposeReaction = reaction(
        () => this.balanceStore.balance, // следим только за balance
        (balance) => console.log("balance changed to", this.balanceStore.balance)
      );
      const selectElement = document.querySelector(
        ".mines-select"
      ) as HTMLSelectElement;
      this.mathStore.setSafeCells = this.mines;
      const handleChange = (event: Event) => {
        this.mines = Number((event.target as HTMLSelectElement).value);
        this.mathStore.setSafeCells = this.mines;
      };
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

      const buttonBet = document.getElementById("button-bet")!;
      this.mathStore.getRandomSafeClicks;

      await new Promise<void>((resolve) => {
        const onClick = () => {
          buttonBet.removeEventListener("pointerdown", onClick);
          resolve();
        };

        buttonBet.addEventListener("pointerdown", onClick);
      });
      selectElement.removeEventListener("change", handleChange, true);

      console.log("mines: ", this.mines);
      this.balanceStore.placeBet(1);
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
      this.mathStore.plusOpenCell();
      if (this.mathStore.openCell > this.mathStore.safeClicks) {
        document
          .getElementById("" + this.currentCellId)!
          .classList.toggle("flipped");
        document.getElementById("" + this.currentCellId)!.classList.add("loss");
        return "loss";
      } else {
        autorun(() => {
        document.getElementById("multiplierDisplay")!.innerHTML = `${this.multi}`;
      })
        console.log(this.currentCellId);
        document
          .getElementById("" + this.currentCellId)!
          .classList.toggle("flipped");
        document.getElementById("" + this.currentCellId)!.classList.add("win");
        this.multi = this.mathStore.mathMulti;

        return "playing";
      }
    },

    loss: async () => {
      const unclicked = Array.from({ length: 25 }, (_, i) => i + 1).filter(
        (i) => !this.clickedCells.has(i)
      );
      //console.log(unclicked);
      const arrayMines = pickRandomCells(unclicked, this.mines - 1);
      //console.log(arrayMines);
      const minesSet = new Set(arrayMines);
      const starsSet = new Set(unclicked).difference(minesSet);
      Array.from(starsSet).forEach((id) => {
        //console.log(id);
        document.getElementById("" + id)!.classList.add("flipped", "win");
      });
      arrayMines.forEach((id) => {
        //console.log(id);
        document.getElementById("" + id)!.classList.add("flipped", "loss");
      });
      await sleep(2000);
      return "idle";
    },

    win: async () => {
      this.balanceStore.winBet(10,this.multi);
      const unclicked = Array.from({ length: 25 }, (_, i) => i + 1).filter(
        (i) => !this.clickedCells.has(i)
      );
      //console.log(unclicked);
      const arrayMines = pickRandomCells(unclicked, this.mines);
      //console.log(arrayMines);
      const minesSet = new Set(arrayMines);
      const starsSet = new Set(unclicked).difference(minesSet);
      Array.from(starsSet).forEach((id) => {
        //console.log(id);
        document.getElementById("" + id)!.classList.add("flipped", "win");
      });
      arrayMines.forEach((id) => {
        //console.log(id);
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
