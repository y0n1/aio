/**
 * Represents an object that can be disposed to free resources.
 */
export interface IDisposable {
  /**
   * Disposes of the object, performing necessary cleanup.
   */
  dispose(): void;

  /**
   * Indicates whether the object has already been disposed.
   */
  isDisposed: boolean;
}
