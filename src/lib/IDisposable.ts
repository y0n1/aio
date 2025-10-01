export interface IDisposable {
    dispose(): void;
    get isDisposed(): boolean;
}