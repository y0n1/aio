import { IDisposable } from "./disposable.ts";

/**
 * Interface for objects that can notify listeners of changes.
 */
export interface IListenable extends IDisposable {
  /**
   * Checks if there are any listeners registered.
   */
  get hasListeners(): boolean;

  /**
   * Checks if a specific listener is registered.
   */
  hasListener(listener: VoidFunction): boolean;

  /**
   * Registers a listener to be notified when changes occur.
   */
  addListener(listener: VoidFunction, options?: IAddListenerOptions): void;

  /**
   * Removes a listener from the list of listeners.
   */
  removeListener(listener: VoidFunction): void;

  /**
   * Notifies all listeners of a change.
   */
  notifyListeners(): void;
}

/**
 * Options for registering a listener.
 *
 * @property once - If true, the listener will be removed after its first invocation.
 */
export interface IAddListenerOptions {
  once?: boolean;
}
