import { ChangeNotifier } from "./change_notifier.ts";
import { Result, Results } from "./result.ts";

/** Represents a synchronous action. */
export type Action<TResult, TArgs extends unknown[] = unknown[]> = (
  ...args: TArgs
) => Result<TResult, Error>;
/** Represents an asynchronous action. */
export type AsyncAction<TResult, TArgs extends unknown[] = unknown[]> = (
  ...args: TArgs
) => Promise<Result<TResult, Error>>;
/** Represents an action that can be either synchronous or asynchronous. */
export type ActionLike<TResult, TArgs extends unknown[] = unknown[]> =
  | Action<TResult, TArgs>
  | AsyncAction<TResult, TArgs>;

/**
 * A command encapsulates the lifecycle of an action.
 *
 * @remarks
 * The command's `status` property can be used to drive UI controls: e.g., disabling buttons during `"running"`, showing spinners, or displaying results after `"done"`.
 *
 * ### Status Semantics
 * The command's `status` property can be one of the following values:
 * - `"idle"`: The command has never been executed, or has been explicitly cleared via `clear()`. This is the default starting state.
 * - `"running"`: The command is actively executing its associated action. During this state, further execution requests will be ignored until the current execution completes.
 * - `"done"`: The command has completed its most recent execution, and the result (success or failure) is available. The command can be re-executed directly from this state without transitioning back to `"idle"`.
 *
 * ### Status Lifecycle
 * - Initial state: `idle` (no result)
 * - First execution: `idle` → `running` → `done`
 * - Re-execution: `done` → `running` → `done`
 * - After clear(): `done` → `idle` (ready for clean slate execution)
 *
 * ### Listener Notifications
 * Each execution triggers exactly two notifications:
 * 1. When transitioning to `"running"` (result is cleared to null)
 * 2. When transitioning to `"done"` (result is available)
 *
 * @template TActionArgs - The argument types accepted by the action.
 * @template TResult - The result type of the action.
 *
 * @example
 * const saveCmd = new Command(async (payload: MyPayload) => {
 *   try {
 *     return Results.Success(await api.save(payload));
 *   } catch (error) {
 *     return Results.Failure(error as Error);
 *   }
 * });
 *
 * // In a component:
 * <button onClick={() => saveCmd.execute(myPayload)} disabled={saveCmd.status === "running"}>
 *   {saveCmd.status === "running" ? "Saving..." : "Save"}
 * </button>
 */
export class Command<TResult, TActionArgs extends unknown[] = unknown[]>
  extends ChangeNotifier {
  #action: ActionLike<TResult, TActionArgs>;

  #status: "idle" | "running" | "done";
  get status(): "idle" | "running" | "done" {
    return this.#status;
  }

  #result: Result<TResult> | null;
  get result(): Result<TResult> | null {
    return this.#result;
  }

  constructor(action: ActionLike<TResult, TActionArgs>) {
    super();
    this.#action = action;
    this.#status = "idle";
    this.#result = null;

    this.execute = this.execute.bind(this);
  }

  /**
   * Executes the command's action with the provided arguments.
   *
   * @remarks
   * - If the command is already running, this method returns immediately to prevent concurrent or re-entrant execution.
   * - The method clears the previous result before execution (sets it to null).
   * - The status transitions to `"running"` and listeners are notified.
   * - After execution completes, the status transitions to `"done"` and listeners are notified again.
   * - Re-execution from `"done"` state transitions directly to `"running"` without passing through `"idle"`.
   *
   * @param args - The arguments to pass to the underlying action.
   * @returns A Promise that resolves when execution is complete.
   *
   * @example
   * ```ts
   * await command.execute(1, 2, 3);
   * ```
   */
  async execute(...args: TActionArgs): Promise<void> {
    if (this.status === "running") {
      // Prevent concurrent/re-entrant execution
      return;
    }

    this.#result = null;
    this.#status = "running";
    this.notifyListeners();

    try {
      this.#result = await this.#action(...args);
    } catch (error) {
      this.#result = Results.Failure(error as Error);
    } finally {
      this.#status = "done";
      this.notifyListeners();
    }
  }

  /**
   * Clears the command's result and resets its status to idle.
   *
   * @remarks
   * This method explicitly transitions the command to the `"idle"` state,
   * clearing any previous result. Use this when you want to reset the command
   * to a clean slate, as if it had never been executed.
   * Listeners are notified of this state change.
   */
  clear(): void {
    this.#result = null;
    this.#status = "idle";
    this.notifyListeners();
  }
}
