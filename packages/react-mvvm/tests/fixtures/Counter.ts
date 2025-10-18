import { ChangeNotifier } from "../../internal/core/change_notifier.ts";

export class CounterNotifier extends ChangeNotifier {
  #count: number;

  constructor(initialCount = 0) {
    super();
    this.#count = initialCount;
  }

  get count(): number {
    return this.#count;
  }

  increment(): void {
    this.#count += 1;
    this.notifyListeners();
  }
}
