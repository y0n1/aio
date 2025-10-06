export interface IDisposable {
    [Symbol.dispose](): void;
    get isDisposed(): boolean;
}
