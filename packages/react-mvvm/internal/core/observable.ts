import { IAddListenerOptions } from "./listenable.ts";
import { ChangeNotifier } from "./change_notifier.ts";

/**
 * Observable provides a way to store a mutable value of type T and to observe changes to it.
 * Listeners can subscribe to receive updates whenever the value is changed.
 *
 * @template T - The type of the value being observed.
 *
 * @example
 * ```ts
 * const obs = new Observable(42);
 * const unsubscribe = obs.subscribe((val) => {
 *   console.log("Value changed:", val);
 * });
 * obs.value = 100; // logs: Value changed: 100
 * unsubscribe();
 * ```
 */
export class Observable<T> {
  /** The current value being observed */
  #value: T;

  /** Internal notifier for managing listeners */
  readonly #changeNotifier: ChangeNotifier = new ChangeNotifier();

  /**
   * Create a new Observable with an initial value.
   * @param value - The initial value.
   */
  constructor(value: T) {
    this.#value = value;
  }

  /**
   * Get the current value.
   */
  get value(): T {
    return this.#value;
  }

  /**
   * Set the value. Notifies listeners only if the value changes.
   * @param value - The new value to set.
   */
  set value(value: T) {
    if (this.#value === value) {
      return;
    }

    this.#value = value;
    this.#changeNotifier.notifyListeners();
  }

  /**
   * Subscribes a listener to changes of the value.
   * The listener will be called with the new value whenever the value changes.
   *
   * @param listener - A function called with the new value after every change.
   * @param options - Optional configuration for the listener. See {@linkcode IAddListenerOptions}.
   * @returns A function to unsubscribe the listener.
   */
  subscribe(
    listener: (value: T) => void,
    options?: IAddListenerOptions,
  ): VoidFunction {
    const wrappedListener = () => listener(this.#value);
    this.#changeNotifier.addListener(wrappedListener, options);
    return () => {
      this.#changeNotifier.removeListener(wrappedListener);
    };
  }
}
