export interface IDisposable extends Disposable {
  dispose(): void;
  isDisposed: boolean;
}
