/**
 * A function that is called whenever the observed value changes.
 *
 * @template T - The type of the value being observed.
 * @param value - The next value of the observable.
 */
export type Observer<T> = (value: T) => void;

/**
 * Represents a value that can be observed for changes.
 *
 * The `Observable<T>` class allows multiple observers to subscribe and receive updates
 * whenever the internal value changes. Observers are notified whenever the value is updated via `next`.
 *
 * @typeParam T - The type of the value being observed.
 *
 * @example
 * ```ts
 * const observable = new Observable<number>(0);
 * const unsubscribe = observable.subscribe(value => {
 *   console.log('Value changed:', value);
 * });
 * observable.next(1); // Logs: Value changed: 1
 * unsubscribe(); // Stops receiving updates
 * ```
 */
export class Observable<T> {
    static get displayName() {
        return "Observable";
    }

    #observers: Set<Observer<T>> = new Set();
    #value: T;

    constructor(initialValue: T) {
        this.#value = initialValue;
    }

    /**
     * Subscribes an observer to receive updates whenever the observable's value changes.
     *
     * @param observer - A function that will be called with the observable's value whenever it changes.
     * @returns A function to unsubscribe the observer, stopping further notifications.
     */
    subscribe(observer: Observer<T>): () => void {
        this.#observers.add(observer);

        return () => {
            this.#observers.delete(observer);
        };
    }

    /**
     * Emits a new value to all registered observers.
     *
     * Updates the internal value with the provided `value` and notifies each observer
     * by invoking their callback with the new value.
     *
     * @param value - The new value to emit to observers.
     */
    next(value: T): void {
        if (Object.is(this.#value, value)) {
            return;
        }

        this.#value = value;
        for (const observer of this.#observers) {
            observer(value);
        }
    }

    /**
     * Gets the current value of the observable.
     *
     * @returns The current value of type `T`.
     */
    get value(): T {
        return this.#value;
    }
}
