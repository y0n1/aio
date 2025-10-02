import { ViewModelBase } from "../lib/ViewModelBase.ts";

export class CounterViewModel extends ViewModelBase {
  static get displayName() {
    return "CounterViewModel";
  }

  #count: number;

  constructor() {
    super();
    this.#count = 0;
    Object.bindAllFunctions(this);
  }

  get count(): number {
    return this.#count;
  }

  increase(): void {
    this.#count++;
    this.notifyListeners(this, ["count", this.#count]);
  }

  decrease(): void {
    this.#count--;
    this.notifyListeners(this, ["count", this.#count]);
  }
}
