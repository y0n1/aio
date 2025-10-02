import {
  ChangeNotifier,
  type IChangeEventListener,
  type IChangeNotifier,
} from "./ChangeNotifier.ts";
import type { IDisposable } from "./IDisposable.ts";

export type ViewModelConstructor<
  TArgs extends unknown[],
  TInstance extends ViewModelBase,
> = new (
  ...args: TArgs
) => TInstance;

export abstract class ViewModelBase implements IChangeNotifier, IDisposable {
  #instanceId: string;
  #changeNotifier: ChangeNotifier;

  constructor() {
    this.#changeNotifier = new ChangeNotifier();
    this.#instanceId = crypto.randomUUID();
  }

  get instanceId(): string {
    return this.#instanceId;
  }

  get hasListeners(): boolean {
    return this.#changeNotifier.hasListeners;
  }

  notifyListeners<TInvoker extends object>(invoker: TInvoker, ...changes: Array<[string, unknown]>): void {
    this.#changeNotifier.notifyListeners(invoker, ...changes);
  }

  addListener(listener: IChangeEventListener): void {
    this.#changeNotifier.addListener(listener);
  }

  removeListener(listener: IChangeEventListener): void {
    this.#changeNotifier.removeListener(listener);
  }

  [Symbol.dispose](): void {
    this.#changeNotifier[Symbol.dispose]();
  }

  get isDisposed(): boolean {
    return this.#changeNotifier.isDisposed;
  }
}
