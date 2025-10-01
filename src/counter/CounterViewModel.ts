import { ChangeNotifier } from "../lib/ChangeNotifier.ts";

export class CounterViewModel extends ChangeNotifier {
  static get displayName() {
    return "CounterViewModel";
  }

  #instanceId = crypto.randomUUID();
  #count: number;

  constructor(initialValue = 0) {
    super();
    this.#count = initialValue;
    Object.bindAllMethods(this);
    // this.increase = this.increase.bind(this);
    // this.decrease = this.decrease.bind(this);
  }

  get instanceId(): string {
    return this.#instanceId;
  }

  get count(): number {
    return this.#count;
  }

  increase(): void {
    this.#count++;
    super.notifyListeners(this, ["count", this.#count]);
  }

  decrease(): void {
    this.#count--;
    super.notifyListeners(this, ["count", this.#count]);
  }
}
