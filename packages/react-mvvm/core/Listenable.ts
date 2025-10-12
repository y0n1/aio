export interface Listenable {
  addListener(listener: VoidFunction, options?: AddListenerOptions): void;
  removeListener(listener: VoidFunction): void;
}

export interface AddListenerOptions {
  once?: boolean;
}
