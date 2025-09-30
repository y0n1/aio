import type { ChangeEvent } from "./ChangeEvent.ts";

export interface IChangeNotifier {
    get hasListeners(): boolean;
    notifyListeners(invoker: this, ...changes: unknown[]): void;
    addListener(listener: (event: ChangeEvent<this>) => void): void;
    removeListener(listener: (event: ChangeEvent<this>) => void): void;
}
