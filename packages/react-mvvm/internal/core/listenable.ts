export interface IListenable {
  addListener(listener: VoidFunction, options?: IAddListenerOptions): void;
  removeListener(listener: VoidFunction): void;
  notifyListeners(): void;
}

export interface IAddListenerOptions {
  once?: boolean;
}
