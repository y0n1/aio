import { ChangeNotifier } from "./ChangeNotifier.ts";
import { IResult } from "./Result.ts";

/**
 * Represents an asynchronous command action that returns a {@link IResult} of type T (or an error of type E).
 *
 * @template T - The type of the result value.
 * @template E - The type of error, defaults to Error.
 *
 * This callable interface allows for:
 *  - No-argument execution, for parameterless commands
 *  - Execution with arbitrary arguments (as a rest parameter), for commands requiring runtime parameters
 *
 * Both call signatures return a Promise resolving to an {@link IResult}.
 *
 * @example
 * // Zero-argument usage:
 * const action: ICommandAction<number> = async () => Result.OK(42);
 * // With arguments:
 * const actionWithArgs: ICommandAction<number> = async (x: number, y: number) => Result.OK(x + y);
 * await actionWithArgs(1, 2); // Result<3>
 */
export interface ICommandAction<T, E extends Error = Error> {
  /**
   * Executes the command as a parameterless asynchronous function.
   * @returns A promise resolving to an {@link IResult} containing the command result or error.
   */
  (): Promise<IResult<T, E>>;
  /**
   * Executes the command action with arbitrary arguments.
   * @param args - Runtime arguments for the command.
   * @returns A promise resolving to an {@link IResult} containing the command result or error.
   */
  <TArgs extends unknown[]>(...args: TArgs): Promise<IResult<T, E>>;
}

/**
 * Command encapsulates an asynchronous action and exposes observable
 * execution state and result. It supports subscriber notifications on state change.
 *
 * @template T - The type of the value produced by the command.
 * @template E - The error type (extends Error, defaults to Error).
 *
 * @example
 * ```ts
 * const addCommand = new Command(async (a: number, b: number) => Results.OK(a + b));
 * await addCommand.execute(2, 3);
 * console.log(addCommand.result); // { type: 'success', value: 5 }
 * ```
 */
export class Command<T, E extends Error = Error> extends ChangeNotifier {
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
  #result: IResult<T, E> | null = null;

  /**
   * The result of the most recent execution of the command, or null if never executed or cleared.
   */
  get result(): IResult<T, E> | null {
    return this.#result;
  }

  /**
   * The wrapped asynchronous command action.
   * @private
   */
  #action: ICommandAction<T, E>;

  /**
   * Initializes a new Command with the specified action.
   * @param action - The function implementing the command. Must return a Promise<IResult<T, E>>.
   */
  constructor(action: ICommandAction<T, E>) {
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
  async execute<TArgs extends unknown[]>(...args: TArgs): Promise<void> {
    if (this.#running) {
      return Promise.resolve();
    }

    this.#running = true;
    this.#result = null;
    this.notifyListeners();

    try {
      // The ICommandAction can be called with (...args).
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
