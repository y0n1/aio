/**
 * Represents the result of an operation, which can either be a success or a failure.
 *
 * @template T - The type of the value returned on success.
 * @template E - The type of the error returned on failure (extends Error, defaults to Error).
 *
 * @example
 * // Creating a success result:
 * const success: IResult<number> = Results.OK(42);
 *
 * // Creating a failure result:
 * const failure: IResult<never, TypeError> = Results.Error(new TypeError("Oops!"));
 */
export type IResult<T, E extends Error = Error> =
  | SuccessResult<T>
  | FailureResult<E>;

/**
 * Represents a successful result.
 *
 * @template T - The type of the contained value.
 *
 * @example
 * const result = new SuccessResult(123);
 * if (result.type === "success") {
 *   console.log(result.value); // 123
 * }
 */
class SuccessResult<T> {
  /**
   * Discriminant property indicating a successful result.
   */
  readonly type: "success" = "success";
  /**
   * The successful value.
   */
  readonly value?: T;

  constructor(value?: T) {
    this.value = value;
  }
}

/**
 * Represents a failed result.
 *
 * @template E - The type of the contained error.
 *
 * @example
 * const result = new FailureResult(new Error("Failed"));
 * if (result.type === "failure") {
 *   console.log(result.error); // Error: Failed
 * }
 */
class FailureResult<E extends Error> {
  /**
   * Discriminant property indicating a failed result.
   */
  readonly type: "failure" = "failure";
  /**
   * The error value.
   */
  readonly error: E;

  constructor(error: E) {
    this.error = error;
  }
}

/**
 * Utility class for creating Result instances.
 *
 * @remarks
 * Use {@link Results.OK} to produce a successful result, and {@link Results.Error} to produce a failure result.
 *
 * @example
 * ```ts
 * const success = Results.OK(123);
 * const failure = Results.Error(new Error("Something went wrong"));
 * ```
 */
export class Results {
  /**
   * Creates a successful result carrying the provided value.
   * @param value - The value of a successful operation.
   * @returns An {@link IResult} representing success.
   */
  static OK<T>(value?: T): IResult<T, never> {
    return Object.freeze(new SuccessResult(value));
  }

  /**
   * Creates a failed result carrying the provided error.
   * @param error - The error describing why the operation failed.
   * @returns An {@link IResult} representing failure.
   */
  static Error<E extends Error>(error: E): IResult<never, E> {
    return Object.freeze(new FailureResult(error));
  }
}
