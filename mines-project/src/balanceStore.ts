import { makeAutoObservable, reaction, autorun } from "mobx";

export class BalanceStore {
  balance: number = 1000;
  bet: number = 1;
  placeBet(amount: number) {
    if (amount > this.balance) {
      console.error("Insufficient balance");
      return false;
    }
    console.log("placebet")
    this.balance -= amount;
    this.bet = amount;

    return true;
  }
  constructor() {
    makeAutoObservable(this);
    reaction(
      () => this.balance,
      (balance, previousBalance) => {
        console.log(`Balance changed: ${previousBalance} → ${balance}`);
        // мы тут код вставим который <div> с балансом обновит когда он у нас будет, пока в консоль смотрим
      }
    );
  }
}
