import type {
    IChangeEventListener,
    IChangeNotifier,
} from "./IChangeNotifier.ts";
import type { IDisposable } from "./IDisposable.ts";
import { ChangeEvent } from "./ChangeEvent.ts";

/**
 * Base class for MVVM architecture that implements IChangeNotifier.
 * Uses EventTarget under the hood to manage listeners and notifications.
 */
export class ChangeNotifier implements IChangeNotifier, IDisposable {
    static get displayName() {
        return "ChangeNotifier";
    }

    #eventTarget: EventTarget | null = new EventTarget();
    #listeners: Set<IChangeEventListener> | null = new Set();
    #isDisposed = false;

    get isDisposed(): boolean {
        return this.#isDisposed;
    }

    /**
     * Notify all listeners about changes.
     * @param invoker The instance invoking the change.
     * @param changes List of changes to notify listeners about.
     */
    notifyListeners(invoker: this, ...changes: Array<[string, unknown]>): void {
        if (this.#isDisposed) return;
        const event = new ChangeEvent(invoker, changes);
        this.#eventTarget!.dispatchEvent(event);
    }

    /**
     * Add a listener for change notifications.
     * @param listener Callback to invoke on change.
     */
    addListener(listener: IChangeEventListener): void {
        if (this.#isDisposed) return;
        this.#eventTarget!.addEventListener(
            ChangeEvent.eventName,
            listener as EventListener,
        );
        this.#listeners!.add(listener);
    }

    /**
     * Remove a previously added change listener.
     * @param listener Callback to remove.
     */
    removeListener(listener: IChangeEventListener): void {
        if (this.#isDisposed) return;
        this.#eventTarget!.removeEventListener(
            ChangeEvent.eventName,
            listener as EventListener,
        );
        if (this.#listeners!.has(listener)) {
            this.#listeners!.delete(listener);
        } else {
            console.warn("Attempted to remove a listener that was never added!");
        }
    }

    /**
     * Dispose the ChangeNotifier, removing all listeners and nullifying its EventTarget.
     */
    dispose(): void {
        if (this.#isDisposed) return;
        for (const listener of this.#listeners!) {
            this.#eventTarget!.removeEventListener(
                ChangeEvent.eventName,
                listener as EventListener,
            );
        }
        this.#listeners!.clear();
        this.#listeners = null;
        this.#eventTarget = null;
        this.#isDisposed = true;
    }

    /**
     * Indicates whether there are any listeners currently registered.
     *
     * @returns `true` if one or more listeners are present and it has not been disposed; otherwise, `false`.
     */
    get hasListeners(): boolean {
        return !this.#isDisposed && this.#listeners!.size > 0;
    }
}
