import type { AddChangeEventListenerOptions } from "./AddChangeEventListenerOptions.ts";
import type { ChangeEventListener } from "./ChangeEventListener.ts";
import { ChangeEvent } from "./ChangeEvent.ts";

/**
 * The ChangeNotifier class provides a mechanism for managing and notifying change event listeners.
 *
 * @remarks
 * This class is intended to be used as a base for observable objects that need to notify subscribers
 * when changes occur. Listeners can be registered with optional configuration, such as one-time invocation.
 *
 * @example
 * ```ts
 * class MyModel extends ChangeNotifier {
 *   set value(val: number) {
 *     this._value = val;
 *     this.notifyListeners(this, ["value", val]);
 *   }
 * }
 *
 * const model = new MyModel();
 * model.addListener((event) => {
 *   console.log(event.changes);
 * });
 * model.value = 42; // Listener is notified
 * ```
 *
 * @public
 */
export class ChangeNotifier {
  /**
   * Returns the display name of the class.
   */
  static get displayName(): string {
    return "ChangeNotifier";
  }

  /**
   * Internal map of listeners and their associated options.
   */
  #listeners: Map<
    ChangeEventListener,
    AddChangeEventListenerOptions | undefined
  >;

  /**
   * Initializes a new instance of the ChangeNotifier class.
   */
  constructor() {
    this.#listeners = new Map();
  }

  /**
   * Indicates whether there are any registered change event listeners.
   *
   * @returns True if at least one listener is registered; otherwise, false.
   */
  get hasListeners(): boolean {
    return this.#listeners.size > 0;
  }

  /**
   * Notifies all registered listeners of a change event.
   *
   * @typeParam TInvoker - The type of the object invoking the notification.
   * @param invoker - The object that triggered the change.
   * @param changes - A list of property changes, each represented as a tuple of property name and new value.
   *
   * @remarks
   * Each listener will receive a {@link ChangeEvent} describing the changes.
   * If a listener was registered with the `once` option, it will be removed after being notified.
   */
  notifyListeners<TInvoker extends object>(
    invoker: TInvoker,
    ...changes: Array<[string, unknown]>
  ): void {
    const event = new ChangeEvent(invoker, changes);
    for (const [listener, options] of this.#listeners) {
      listener(event);
      if (options?.once) {
        this.#listeners.delete(listener);
      }
    }
  }

  /**
   * Registers a change event listener.
   *
   * @param listener - The function to be called when a change event occurs.
   * @param options - Optional configuration for the listener (e.g., `once` to remove after first call).
   *
   * @remarks
   * If the listener is already registered, this method does nothing.
   */
  addListener(
    listener: ChangeEventListener,
    options?: AddChangeEventListenerOptions,
  ): void {
    if (!this.#listeners.has(listener)) {
      this.#listeners.set(listener, options);
    }
  }

  /**
   * Removes a previously registered change event listener.
   *
   * @param listener - The listener function to remove.
   *
   * @remarks
   * If the listener is not registered, this method does nothing.
   */
  removeListener(listener: ChangeEventListener): void {
    this.#listeners.delete(listener);
  }
}
