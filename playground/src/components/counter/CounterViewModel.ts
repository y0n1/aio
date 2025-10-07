import { ViewModelBase } from "@y0n1/react-mvvm";

export class CounterViewModel extends ViewModelBase {
  static get displayName() {
    return "CounterViewModel";
  }

  #count: number;

  constructor() {
    super();
    this.enableLogging();
    this.#count = 0;
    
    this.increase = this.increase.bind(this);
    this.decrease = this.decrease.bind(this);
  }

  get count(): number {
    return this.#count;
  }

  set count(value: number) {
    this.#count = value;
    this.notifyListeners(this, ["count", this.#count]);
  }

  increase(): void {
    this.count++;
  }

  decrease(): void {
    this.count--;
  }
}
