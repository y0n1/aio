import { useMemo } from "react";
import { type ActionLike, Command } from "../core/command.ts";
import { useListenable } from "./use_listenable.ts";

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
 * @returns {Command<TResult, TActionArgs>} A command object.
 *
 * @example
 * ```ts
 * const myAction = async (x: number) => Results.Success(x * 2);
 * const command = useCommand(myAction);
 * ```
 *
 * @remarks
 * - If called while `status` is `"running"`, additional executions are ignored for concurrency safety.
 * - On execution, state transitions: `idle` → `running` → `done`.
 * - On error, result is a failed `Result`.
 * - `command.clear()` resets state to `idle`.
 */
export function useCommand<TResult, TActionArgs extends unknown[] = unknown[]>(
  action: ActionLike<TResult, TActionArgs>,
): Command<TResult, TActionArgs> {
  const command = useMemo(
    () => Object.seal(new Command<TResult, TActionArgs>(action)),
    [action],
  );
  useListenable(command);
  return command;
}
