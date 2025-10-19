import { ChangeNotifier } from "../../internal/core/change_notifier.ts";

/**
 * CounterNotifier is a view-model class implementing a simple counter.
 *
 * @example
 * ```ts
 * const counter = new CounterNotifier();
 * counter.increment();
 * console.log(counter.count); // 1
 * ```
 *
 * @extends ChangeNotifier
 */
export class CounterNotifier extends ChangeNotifier {
  #count: number;

  /**
   * Creates a CounterNotifier instance.
   * @param {number} [initialCount=0] - The initial value of the counter.
   */
  constructor(initialCount = 0) {
    super();
    this.#count = initialCount;
  }

  /**
   * Gets the current value of the counter.
   * @returns {number} The current count.
   */
  get count(): number {
    return this.#count;
  }

  /**
   * Increments the counter by 1 and notifies listeners.
   */
  increment(): void {
    this.#count += 1;
    this.notifyListeners();
  }
}
