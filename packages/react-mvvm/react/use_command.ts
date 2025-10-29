import { useCallback, useRef, useState } from "react";
import { type ActionLike } from "../core/command.ts";
import { type Result, Results } from "../core/result.ts";

export interface ICommandState<TResult> {
  status: "idle" | "running" | "done";
  result: Result<TResult, Error> | null;
}

export interface ICommand<TResult, TActionArgs extends unknown[] = unknown[]>
  extends ICommandState<TResult> {
  execute: (...args: TActionArgs) => Promise<void>;
  clear: VoidFunction;
}

/**
 * React hook to execute and track the status/result of an async action as a Command.
 *
 * Provides status (`idle`, `running`, `done`), the latest result (success/failure),
 * and imperative helpers to execute or clear the command's state.
 *
 * @typeParam TResult The result type returned by the command.
 * @typeParam TActionArgs Tuple of argument types for the action.
 * @param action An async function returning a `Result<TResult, Error>`.
 *
 * @returns {ICommand<TResult, TActionArgs>} An object exposing status, result, `execute`, and `clear`.
 *
 * @example
 * ```ts
 * const myAction = async (x: number) => Results.Success(x * 2);
 * const { status, result, execute, clear } = useCommand(myAction);
 * ```
 *
 * @remarks
 * - If called while `status` is `"running"`, additional executions are ignored for concurrency safety.
 * - On execution, state transitions: `idle` → `running` → `done`.
 * - On error, result is a failed `Result`.
 * - `clear()` resets state to `idle`.
 */
export function useCommand<TResult, TActionArgs extends unknown[] = unknown[]>(
  action: ActionLike<TResult, TActionArgs>,
): ICommand<TResult, TActionArgs> {
  const [{ status, result }, setState] = useState<ICommandState<TResult>>({
    status: "idle",
    result: null,
  });

  // Use a ref to track running status to avoid stale closures
  const isRunningRef = useRef(false);

  /**
   * Executes the underlying action, transitioning state through 'running', then 'done'.
   * Ignores invocation if already running.
   */
  const execute = useCallback(
    async (...args: TActionArgs) => {
      // Check ref to prevent concurrent execution
      if (isRunningRef.current) {
        return;
      }

      isRunningRef.current = true;
      setState({ status: "running", result: null });

      let result: Result<TResult, Error> | null = null;
      try {
        result = await action(...args);
      } catch (error) {
        result = Results.Failure(error as Error);
      } finally {
        isRunningRef.current = false;
        setState({ status: "done", result });
      }
    },
    [action], // Only depend on action, not status
  );

  /**
   * Clears command state back to 'idle'.
   */
  const clear = useCallback((): void => {
    setState({ status: "idle", result: null });
  }, []);

  return {
    status,
    result,
    execute,
    clear,
  };
}
