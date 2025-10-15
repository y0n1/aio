export interface IDisposable {
  [Symbol.dispose](): void;
  isDisposed: boolean;
}
