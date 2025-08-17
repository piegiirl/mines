import { makeAutoObservable, reaction, autorun } from "mobx";
import { randomSafeClick } from "./utils";
export class MathStore {
  openCell: number = 0;
  multiplier: number = 0;
  safeClicks: number = 0;
  safeCells: number = 0;
  get mathMulti() {
    this.multiplier = Number((0.98 * (this.safeClicks + 1) / (this.safeClicks - this.openCell + 1)).toFixed(2));
    return this.multiplier;
  }
  plusOpenCell(){
    this.openCell++;
  }
  deleteOpenCell(){
    return this.openCell = 0;
  }
  set setSafeCells(mines: number){
    this.safeCells = 25 - mines;
  }
  get getRandomSafeClicks(){
    return this.safeClicks = randomSafeClick(0, this.safeCells);
  }
  constructor() {
    makeAutoObservable(this);
    reaction(
      () => this.multiplier,
      (multiplier) => {
        console.log("multiplier: ",`${multiplier}`);
      }
    );
    reaction(
      () => this.openCell,
      (openCell) => {
        console.log("OpenCell: ", `${openCell}`);
      }
    );
    reaction(
      () => this.safeCells,
      (safeCells) => {
        console.log("SafeCells: ", `${safeCells}`);
      }
    );
    reaction(
      () => this.safeClicks,
      (safeClicks) => {
        console.log("SafeClicks: ", `${safeClicks}`);
      }
    );
  }
}