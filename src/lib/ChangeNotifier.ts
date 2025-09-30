import type { IChangeNotifier } from "./IChangeNotifier.ts";
import type { IDisposable } from "./IDisposable.ts";
import { ChangeEvent } from "./ChangeEvent.ts";

/**
 * Base class for MVVM architecture that implements IChangeNotifier.
 * Uses EventTarget under the hood to manage listeners and notifications.
 */
export class ChangeNotifier implements IChangeNotifier, IDisposable {
    #eventTarget: EventTarget | null = new EventTarget();
    #listeners: Set<EventListener> = new Set();
    #isDisposed = false;

    get isDisposed(): boolean {
        return this.#isDisposed;
    }

    /**
     * Notify all listeners about changes.
     * @param invoker The instance invoking the change.
     * @param changes List of changes to notify listeners about.
     */
    notifyListeners(invoker: this, ...changes: unknown[]): void {
        if (!this.#eventTarget) return;
        const event = new ChangeEvent<this>(invoker, changes);
        this.#eventTarget.dispatchEvent(event);
    }

    /**
     * Add a listener for change notifications.
     * @param listener Callback to invoke on change.
     */
    addListener(listener: (event: ChangeEvent<this>) => void): void {
        if (!this.#eventTarget) return;
        // Wrap listener to accept Event, but cast to ChangeEvent inside
        const wrappedListener: EventListener = (evt: Event) => {
            listener(evt as ChangeEvent<this>);
        };
        this.#eventTarget.addEventListener(
            ChangeEvent.eventName,
            wrappedListener,
        );
        this.#listeners.add(wrappedListener);
    }

    /**
     * Remove a previously added change listener.
     * @param listener Callback to remove.
     */
    removeListener(listener: (event: ChangeEvent<this>) => void): void {
        if (!this.#eventTarget) return;
        // Find the wrapped listener by comparing toString
        for (const l of this.#listeners) {
            if (
                l.toString() === ((evt: Event) => {
                    listener(evt as ChangeEvent<this>);
                }).toString()
            ) {
                this.#eventTarget.removeEventListener(ChangeEvent.eventName, l);
                this.#listeners.delete(l);
                break;
            }
        }
    }

    /**
     * Dispose the ChangeNotifier, removing all listeners and nullifying its EventTarget.
     */
    [Symbol.dispose](): void {
        if (!this.#eventTarget) return;
        for (const listener of this.#listeners) {
            this.#eventTarget.removeEventListener(
                ChangeEvent.eventName,
                listener,
            );
        }
        this.#listeners.clear();
        this.#eventTarget = null;
        this.#isDisposed = true;
    }

    /**
     * Indicates whether there are any listeners currently registered.
     *
     * @returns `true` if one or more listeners are present; otherwise, `false`.
     */
    get hasListeners(): boolean {
        return this.#listeners.size > 0;
    }
}
