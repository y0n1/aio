import { ChangeNotifier } from "./ChangeNotifier.ts";
import { IResult } from "./Result.ts";

export type ICommandAction<TValue = void, TError extends Error = Error> = (
  // deno-lint-ignore no-explicit-any
  ...args: any[]
) => Promise<IResult<TValue, TError>>;

/**
 * Command encapsulates an asynchronous action and exposes observable
 * execution state and result. It supports subscriber notifications on state change.
 *
 * @template TValue - The type of the value produced by the command.
 * @template TError - The error type (extends Error, defaults to Error).
 *
 * @example
 * ```ts
 * const addCommand = new Command(async (a: number, b: number) => Results.OK(a + b));
 * await addCommand.execute(2, 3);
 * console.log(addCommand.result); // { type: 'success', value: 5 }
 * ```
 */
export class Command<TValue = void, TError extends Error = Error>
  extends ChangeNotifier {
  /**
   * Indicates whether the command is currently executing.
   * @private
   */
  #running: boolean = false;

  /**
   * Returns true when the command is currently running/executing.
   */
  get isRunning(): boolean {
    return this.#running;
  }

  /**
   * Stores the most recent IResult produced by command execution, or null before execution.
   * @private
   */
  #result: IResult<TValue, TError> | null = null;

  /**
   * The result of the most recent execution of the command, or null if never executed or cleared.
   */
  get result(): IResult<TValue, TError> | null {
    return this.#result;
  }

  /**
   * The wrapped asynchronous command action.
   * @private
   */
  #action: ICommandAction<TValue, TError>;

  /**
   * Initializes a new Command with the specified action.
   * @param action - The function implementing the command. Must return a Promise<IResult<T, E>>.
   */
  constructor(action: ICommandAction<TValue, TError>) {
    super();
    this.#action = action;
  }

  /**
   * Executes the command asynchronously. Sets state and notifies listeners before and after running.
   * Ignores concurrent invocations while running.
   *
   * @param args - Arguments to pass to the command action.
   * @returns A Promise that resolves when execution is complete.
   *
   * @example
   * await command.execute(1, "input");
   */
  async execute(
    ...args: Parameters<ICommandAction<TValue, TError>>
  ): Promise<void> {
    if (this.#running) {
      return Promise.resolve();
    }

    this.#running = true;
    this.#result = null;
    this.notifyListeners();

    try {
      this.#result = await this.#action(...args);
    } finally {
      this.#running = false;
      this.notifyListeners();
    }
  }

  /**
   * Clears the last result value, setting {@link result} to null and notifying listeners.
   */
  clearResult(): void {
    this.#result = null;
    this.notifyListeners();
  }

  /**
   * Disposes this command and notifies listeners. Clears the result and marks this as disposed.
   */
  override dispose(): void {
    this.clearResult();
    super.dispose();
  }

  /**
   * Disposal via the Symbol.dispose protocol.
   * @internal
   */
  override [Symbol.dispose](): void {
    this.dispose();
  }
}
