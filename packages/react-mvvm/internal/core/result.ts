/**
 * Represents a successful computation or operation.
 *
 * @template T - The type of successful value.
 *
 * @example
 * const success: Success<number> = { ok: true, value: 42 };
 */
export type Success<T> = Readonly<{
  ok: true;
  value: T | void;
}>;

/**
 * Represents a failed computation or operation.
 *
 * @template E - The type of error value.
 *
 * @example
 * const failure: Failure<Error> = { ok: false, error: new Error("Something went wrong") };
 */
export type Failure<E> = Readonly<{
  ok: false;
  error: E;
}>;

/**
 * A type representing either a successful result or a failure.
 *
 * @template T - The type of successful value.
 * @template E - The type of error value.
 *
 * @example
 * const ok: Result<number, Error> = { ok: true, value: 42 };
 * const err: Result<number, Error> = { ok: false, error: new Error("Failure") };
 */
export type Result<T, E> = Success<T> | Failure<E>;

/**
 * A utility class for constructing typed Result objects.
 *
 * @example
 * const result = Results.Success(123); // { ok: true, value: 123 }
 * const errorResult = Results.Failure(new Error("fail")); // { ok: false, error: ... }
 */
export class Results {
  /**
   * Constructs a successful result.
   * @param value The value to wrap in success.
   * @returns A frozen Result object representing success.
   */
  static Success<T>(value?: T): Result<T, never> {
    return Object.freeze<Success<T>>({ ok: true, value });
  }

  /**
   * Constructs a failed result.
   * @param error The error value to wrap in failure.
   * @returns A frozen Result object representing failure.
   */
  static Failure<E>(error: E): Result<never, E> {
    return Object.freeze<Failure<E>>({ ok: false, error });
  }
}
