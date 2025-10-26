/**
 * NativeObservable stores a mutable value of type T and allows observers to receive updates whenever the value changes.
 * 
 * @description
 * This implementation uses the native EventTarget API under the hood to manage events and listeners.
 *
 * @template T - The type of the value being observed.
 *
 * @example
 * ```ts
 * const obs$ = new NativeObservable(42);
 * const unsubscribe = obs$.subscribe((v) => {
 *   console.log("number changed to ", v);
 * });
 * obs$.value = 100; // logs: number changed to 100
 * unsubscribe();
 * ```
 */
export class NativeObservable<T> {
  /** Internal notifier for managing listeners */
  #changeNotifier: EventTarget;

  /** The current value being observed */
  #value: T;

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
    this.#changeNotifier.dispatchEvent(new Event("change"));
  }

  /**
   * Create a new Observable with an initial value.
   * @param value - The initial value.
   */
  constructor(value: T) {
    this.#changeNotifier = new EventTarget();
    this.#value = value;
  }

  /**
   * Subscribes a listener to changes of the value.
   * The listener will be called with the new value whenever the value changes.
   *
   * @param listener - A function called with the new value after every change.
   * @param options - Optional configuration for the listener. See {@linkcode AddEventListenerOptions}.
   * @returns A function to unsubscribe the listener.
   */
  subscribe(
    listener: (value: T) => void,
    options?: AddEventListenerOptions,
  ): VoidFunction {
    const wrapped = () => listener(this.#value);
    this.#changeNotifier.addEventListener("change", wrapped, options);
    return () => {
      this.#changeNotifier.removeEventListener("change", wrapped);
    };
  }

  /**
   * Returns the underlying value of the observable.
   * Useful for coercion (e.g., `Number(observable)`).
   *
   * @returns The current value.
   * @see https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf
   */
  valueOf(): T {
    return this.#value;
  }

  /**
   * Returns a string representation of the NativeObservable.
   * @returns A string describing the observable and its current value.
   *
   * @example
   * const obs = new NativeObservable(42);
   * obs.toString(); // "NativeObservable(42)"
   *
   * @see https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/toString
   */
  toString(): string {
    return `NativeObservable(${this.#value})`;
  }
}
