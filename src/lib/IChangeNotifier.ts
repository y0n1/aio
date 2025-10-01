import type { ChangeEvent } from "./ChangeEvent.ts";

export type IChangeEventListener = <
    TInvoker extends object,
    TChanges extends Array<[string, unknown]>,
>(
    event: ChangeEvent<TInvoker, TChanges>,
) => void;

export interface IChangeNotifier {
    get hasListeners(): boolean;
    notifyListeners(invoker: this, ...changes: Array<[string, unknown]>): void;
    addListener(listener: IChangeEventListener): void;
    removeListener(listener: IChangeEventListener): void;
}
