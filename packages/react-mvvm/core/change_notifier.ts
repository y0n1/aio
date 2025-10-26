import { IAddListenerOptions, IListenable } from "./listenable.ts";
import { IDisposable } from "./disposable.ts";

/**
 * ChangeNotifier provides a mechanism for notifying listeners when changes occur.
 *
 * @description
 * This class is intended to be used as a base for observable objects that need to notify subscribers
 * when changes occur. Listeners can be registered with optional configuration, such as one-time invocation.
 *
 * It is O(1) for adding and removing listeners and O(N) for dispatching notifications (where N is the number of listeners).
 *
 * @example
 * ```ts
 * class MyModel extends ChangeNotifier {
 *   set value(val: number) {
 *     this.#value = val;
 *     this.notifyListeners();
 *   }
 * }
 *
 * const model = new MyModel();
 * model.addListener(() => {
 *   console.log("Value changed!");
 * });
 * model.value = 42; // Listener is notified
 * ```
 *
 * @public
 */
export class ChangeNotifier implements IListenable, IDisposable, Disposable {
  #instanceId: string = crypto.randomUUID();

  /**
   * Internal map of listeners and their associated options.
   * @private
   */
  #listeners: Map<VoidFunction, IAddListenerOptions | undefined>;

  /**
   * Indicates whether this ChangeNotifier has been disposed.
   * @private
   */
  #isDisposed: boolean;

  /**
   * Initializes a new instance of the ChangeNotifier class.
   */
  constructor() {
    this.#listeners = new Map();
    this.#isDisposed = false;
  }

  get instanceId(): string {
    return this.#instanceId;
  }

  /**
   * Indicates whether there are any registered listeners.
   *
   * @returns {boolean} True if at least one listener is registered and the notifier is not disposed; otherwise, false.
   */
  get hasListeners(): boolean {
    return this.#listeners.size > 0 && !this.#isDisposed;
  }

  /**
   * Indicates whether this ChangeNotifier has been disposed.
   *
   * @returns {boolean} True if the ChangeNotifier has been disposed; otherwise, false.
   */
  get isDisposed(): boolean {
    return this.#isDisposed;
  }

  /**
   * Checks if a specific listener is currently registered.
   *
   * @param listener - The listener function to check for registration.
   * @returns {boolean} True if the listener is registered; otherwise, false.
   *
   * @description
   * Use this method to determine whether a specific listener has already been registered.
   */
  hasListener(listener: VoidFunction): boolean {
    return this.#listeners.has(listener);
  }

  /**
   * Notifies all registered listeners of a change event.
   *
   * @description
   * Each listener will be called. If a listener was registered with the `once` option, it will be removed after being notified.
   */
  notifyListeners(): void {
    if (this.#isDisposed) {
      return;
    }

    for (const [listener, options] of this.#listeners.entries()) {
      listener();
      if (options?.once) {
        this.#listeners.delete(listener);
      }
    }
  }

  /**
   * Registers a change event listener.
   *
   * @param listener - The function to be called when a change event occurs.
   * @param options - Optional configuration for the listener. See {@linkcode IAddListenerOptions}.
   *
   * @description
   * If the listener is already registered, the listener will be updated.
   */
  addListener(
    listener: VoidFunction,
    options?: IAddListenerOptions,
  ): void {
    if (this.#isDisposed) {
      return;
    }
    this.#listeners.set(listener, options);
  }

  /**
   * Removes a previously registered change event listener.
   *
   * @param listener - The listener function to remove.
   *
   * @description
   * If the listener is not registered, this method does nothing.
   */
  removeListener(listener: VoidFunction): void {
    if (this.#isDisposed) {
      return;
    }
    this.#listeners.delete(listener);
  }

  /**
   * Disposes the ChangeNotifier, removing all listeners and preventing further notifications.
   *
   * @description
   * Future calls to any method will do nothing.
   */
  dispose(): void {
    this.#isDisposed = true;
    this.#listeners.clear();
  }

  [Symbol.dispose](): void {
    this.dispose();
  }
}
