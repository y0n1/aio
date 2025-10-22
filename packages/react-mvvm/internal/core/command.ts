import { ChangeNotifier } from "./change_notifier.ts";

/** Represents a synchronous action. */
export type Action<TArgs extends unknown[]> = (...args: TArgs) => void;
/** Represents an asynchronous action. */
export type AsyncAction<TArgs extends unknown[]> = (
  ...args: TArgs
) => Promise<void>;
/** Represents an action that can be either synchronous or asynchronous. */
export type ActionLike<TArgs extends unknown[]> =
  | Action<TArgs>
  | AsyncAction<TArgs>;

/**
 * A command is a class that encapsulates a view model action, and exposes the different states that an action can be at any given time.
 *
 * @template TActionArgs - The argument types accepted by the action.
 *
 * @example
 * const saveCmd = new Command(async (payload: MyPayload) => {
 *   await api.save(payload);
 * });
 *
 * // In a component:
 * <button onClick={() => saveCmd.execute(myPayload)} disabled={saveCmd.running}>
 *   {saveCmd.running ? "Saving..." : "Save"}
 * </button>
 */
export class Command<TActionArgs extends unknown[]> extends ChangeNotifier {
  /** Indicates if the command ran to completion without error. */
  #completed: boolean;
  /**
   * Whether the command has successfully completed execution.
   * Set to false before each execution; set to true if no error occurs.
   */
  get completed(): boolean {
    return this.#completed;
  }

  /** Holds the Error instance if the command fails, otherwise null. */
  #error: Error | null;
  /**
   * The error thrown during execution, or null if none.
   * Cleared on each execution start.
   */
  get error(): Error | null {
    return this.#error;
  }

  /** True while the command is executing, false otherwise. */
  #running: boolean;
  /**
   * Whether the command is currently executing.
   * Used for showing loading indicators and disabling repeated triggers.
   */
  get running(): boolean {
    return this.#running;
  }

  /** The function to execute as the command. */
  #action: ActionLike<TActionArgs>;

  /**
   * Create a new command for the given action.
   * @param action The function to execute. Can be sync or async.
   */
  constructor(action: ActionLike<TActionArgs>) {
    super();
    this.#error = null;
    this.#running = false;
    this.#completed = false;
    this.#action = action;

    this.execute = this.execute.bind(this);
    this.clear = this.clear.bind(this);
  }

  /**
   * Execute the action.
   * Notifies listeners before, after, and on error.
   * Does not re-enter if already running.
   * @param args Arguments to pass to the action.
   */
  async execute(...args: TActionArgs): Promise<void> {
    if (this.#running) {
      // Prevent concurrent/re-entrant execution
      return;
    }

    this.#running = true;
    this.#completed = false;
    this.#error = null;
    this.notifyListeners();

    try {
      await this.#action(...args);
      this.#completed = true;
      this.notifyListeners();
    } catch (error) {
      this.#error = error as Error;
    } finally {
      this.#running = false;
      this.notifyListeners();
    }
  }

  /**
   * Reset the command state (error, completed, running).
   * Useful to clear errors or completion flags before next use.
   */
  clear(): void {
    this.#running = false;
    this.#completed = false;
    this.#error = null;
  }
}
