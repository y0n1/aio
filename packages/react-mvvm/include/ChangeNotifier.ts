import type { IDisposable } from "./IDisposable.ts";
import { ChangeEvent } from "./ChangeEvent.ts";

export type IChangeEventListener = <
  TInvoker extends object,
  TChanges extends Array<[string, unknown]>,
>(
  event: ChangeEvent<TInvoker, TChanges>,
) => void;

export interface IChangeEventListenerOptions {
  once?: boolean;
}

export interface IChangeNotifier {
  get hasListeners(): boolean;
  notifyListeners<TInvoker extends object>(
    invoker: TInvoker,
    ...changes: Array<[string, unknown]>
  ): void;
  addListener(
    listener: IChangeEventListener,
    options?: IChangeEventListenerOptions,
  ): void;
  removeListener(listener: IChangeEventListener): void;
}

export class ChangeNotifier implements IChangeNotifier, IDisposable {
  //   static get ChangeEvent() {
  //     return class ChangeEvent<
  //       TInvoker extends object = object,
  //       TChanges extends Array<[string, unknown]> = Array<[string, unknown]>,
  //     > {
  //       static get displayName() {
  //         return "ChangeEvent";
  //       }

  //       static get eventName() {
  //         return "__CHANGE_EVENT__";
  //       }

  //       #invoker: TInvoker;
  //       #changes: TChanges;

  //       constructor(invoker: TInvoker, changes: TChanges) {
  //         this.#invoker = invoker;
  //         this.#changes = changes;
  //       }
  //     };
  //   }

  static get displayName() {
    return "ChangeNotifier";
  }

  #listeners:
    | Map<IChangeEventListener, IChangeEventListenerOptions | undefined>
    | null;
  #isDisposed: boolean;

  constructor() {
    this.#listeners = new Map();
    this.#isDisposed = false;
  }

  get isDisposed(): boolean {
    return this.#isDisposed;
  }

  notifyListeners<TInvoker extends object>(
    invoker: TInvoker,
    ...changes: Array<[string, unknown]>
  ): void | Error {
    if (this.#isDisposed) return new Error("ChangeNotifier is disposed");
    const event = new ChangeEvent(invoker, changes);
    for (const [listener, options] of this.#listeners!) {
      listener(event);
      if (options?.once) {
        this.#listeners!.delete(listener);
      }
    }
  }

  addListener(
    listener: IChangeEventListener,
    options?: IChangeEventListenerOptions,
  ): void | Error {
    if (this.#isDisposed) return new Error("ChangeNotifier is disposed");
    if (!this.#listeners!.has(listener)) {
      this.#listeners!.set(listener, options);
    } else if (JSON.stringify(options) !== JSON.stringify(this.#listeners!.get(listener))) {
      this.#listeners!.set(listener, options);
    }
  }

  removeListener(listener: IChangeEventListener): void | Error {
    if (this.#isDisposed) return new Error("ChangeNotifier is disposed");
    if (this.#listeners!.has(listener)) {
      this.#listeners!.delete(listener);
    }
  }

  [Symbol.dispose](): void | Error {
    if (this.#isDisposed) return new Error("ChangeNotifier is disposed");
    this.#listeners!.clear();
    this.#listeners = null;
    this.#isDisposed = true;
  }

  get hasListeners(): boolean {
    return this.#listeners!.size > 0;
  }
}
