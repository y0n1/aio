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
export type Failure<E = Error> = Readonly<{
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
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * A utility class for constructing typed Result objects.
 *
 * @example
 * const result = Results.Success(123); // { ok: true, value: 123 }
 * const errorResult = Results.Failure(new Error("fail")); // { ok: false, error: ... }
 */
export class Results {
  static #assertIsResult<T, E = Error>(
    value: unknown,
  ): asserts value is Result<T, E> {
    if (
      typeof value !== "object" || value === null || value === undefined ||
      !("ok" in value) || typeof value.ok !== "boolean"
    ) {
      throw new TypeError("Value is not a Result");
    }
  }

  /**
   * Type guard to check if a value is a {@link Result}.
   *
   * @template T The type of the successful value.
   * @template E The type of the error value.
   * @param value The value to check.
   * @returns True if the value is a {@link Result}, false otherwise.
   *
   * @example
   * if (Results.isResult(someValue)) {
   *   // someValue is a Result
   * }
   */
  static isResult<T, E = Error>(value: unknown): value is Result<T, E> {
    try {
      Results.#assertIsResult<T, E>(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Type guard to determine if an unknown value is a {@link Success} result.
   *
   * @template T The type of the successful value.
   * @param value The value to check.
   * @throws {TypeError} If the value is not a {@link Success} result.
   * @returns True if the value is a {@link Success} result, false otherwise.
   */
  static isSuccess<T>(value: unknown): value is Success<T> {
    return Results.isResult(value) && value.ok && "value" in value;
  }

  /**
   * Type guard to determine if an unknown value is a {@link Failure} result.
   *
   * @template E The type of the error value.
   * @param value The value to check.
   * @throws {TypeError} If the value is not a {@link Failure} result.
   * @returns True if the value is a {@link Failure} result, false otherwise.
   */
  static isFailure<E = Error>(value: unknown): value is Failure<E> {
    return Results.isResult(value) && !value.ok && "error" in value;
  }

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
  static Failure<E = Error>(error: E): Result<never, E> {
    return Object.freeze<Failure<E>>({ ok: false, error });
  }
}
