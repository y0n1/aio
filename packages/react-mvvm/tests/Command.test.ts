import { assert, assertEquals, assertStrictEquals } from "@std/assert";

import { Command } from "../core/Command.ts";
import { type IResult, Results } from "../core/Result.ts";

Deno.test("execute toggles running state, preserves result, and notifies listeners", async () => {
  const notifications: Array<
    { running: boolean; result: Command<number>["result"] }
  > = [];
  const actionSnapshots: Array<boolean> = [];

  const command = new Command<number>(async (...args: [number?]) => {
    const [value = 0] = args;
    actionSnapshots.push(command.isRunning);
    await Promise.resolve();
    return Results.OK(value * 2);
  });

  command.addListener(() => {
    notifications.push({ running: command.isRunning, result: command.result });
  });

  assertStrictEquals(command.isRunning, false);
  assertStrictEquals(command.result, null);

  const execution = command.execute(21);

  assertStrictEquals(command.isRunning, true);
  assertStrictEquals(command.result, null);

  await execution;

  assertStrictEquals(command.isRunning, false);
  const result = command.result;
  assertDefined(result);
  const success = result as { type: "success"; value: number };
  assertStrictEquals(success.type, "success");
  assertStrictEquals(success.value, 42);

  assertEquals(actionSnapshots, [true]);
  assertEquals(notifications.length, 2);
  assertEquals(notifications[0], { running: true, result: null });
  const endNotification = notifications[1];
  assertStrictEquals(endNotification.running, false);
  assertStrictEquals(endNotification.result, command.result);
});

Deno.test("execute ignores concurrent invocations while running", async () => {
  let gateResolve!: () => void;
  const gate = new Promise<void>((resolve) => {
    gateResolve = resolve;
  });
  let actionCalls = 0;

  const command = new Command(async () => {
    actionCalls += 1;
    await gate;
    return Results.OK(actionCalls);
  });

  const firstExecution = command.execute();
  const secondExecution = command.execute();

  await secondExecution;
  assertStrictEquals(actionCalls, 1);
  assertStrictEquals(command.isRunning, true);

  gateResolve();
  await firstExecution;

  assertStrictEquals(command.isRunning, false);
  assertStrictEquals(actionCalls, 1);

  await command.execute();
  assertStrictEquals(actionCalls, 2);
  assertStrictEquals(command.isRunning, false);
});

Deno.test("clearResult resets result and notifies listeners", async () => {
  const snapshots: Array<IResult<string> | null> = [];

  const command = new Command<string>(async () => Results.OK("done"));
  command.addListener(() => {
    snapshots.push(command.result);
  });

  await command.execute();

  assertStrictEquals(command.result?.type, "success");
  assertStrictEquals(command.result?.value, "done");
  assertEquals(snapshots.length, 2);

  snapshots.length = 0;
  command.clearResult();

  assertStrictEquals(command.result, null);
  assertEquals(snapshots, [null]);
});

Deno.test("dispose clears the result and prevents future notifications", async () => {
  let notifications = 0;
  const command = new Command(async () => Results.OK("value"));

  command.addListener(() => {
    notifications += 1;
  });

  await command.execute();
  assertEquals(notifications, 2);

  notifications = 0;
  command.dispose();

  assertStrictEquals(command.result, null);
  assertEquals(notifications, 1);

  notifications = 0;
  await command.execute();

  assertEquals(notifications, 0);
  assertStrictEquals(command.isRunning, false);
});

function assertDefined<T>(value: T): asserts value is NonNullable<T> {
  assert(value !== null && value !== undefined);
}
