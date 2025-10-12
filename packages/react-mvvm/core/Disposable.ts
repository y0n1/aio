export interface Disposable {
  [Symbol.dispose](): void;
  isDisposed: boolean;
}