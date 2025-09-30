import { ViewModel } from "../lib/ViewModel.ts";

export class CounterViewModel extends ViewModel {
  static readonly displayName = "CounterViewModel";

  #count: number;

  constructor(initialValue = 0) {
    super();
    Object.bindAllMethods(this);
    this.#count = initialValue;
  }

  get count(): number {
    return this.#count;
  }

  increase(): void {
    this.#count++;
    super.notifyChange(this, "count");
  }

  decrease(): void {
    this.#count--;
    super.notifyChange(this, "count");
  }
}
