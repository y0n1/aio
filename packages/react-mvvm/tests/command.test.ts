import { assertEquals, assertStrictEquals } from "@std/assert";
import { Command } from "../internal/core/command.ts";

Deno.test("Command initializes with default state", () => {
  const command = new Command(() => {});

  assertEquals(command.running, false);
  assertEquals(command.completed, false);
  assertEquals(command.error, null);
});

Deno.test(
  "Command executes synchronous actions and updates state transitions",
  async () => {
    let runCount = 0;
    const command = new Command(() => {
      runCount += 1;
    });
    const snapshots: Array<{
      running: boolean;
      completed: boolean;
      error: Error | null;
    }> = [];

    command.addListener(() => {
      snapshots.push({
        running: command.running,
        completed: command.completed,
        error: command.error,
      });
    });

    await command.execute();

    assertEquals(runCount, 1);
    assertEquals(snapshots, [
      { running: true, completed: false, error: null },
      { running: true, completed: true, error: null },
      { running: false, completed: true, error: null },
    ]);
    assertEquals(command.running, false);
    assertEquals(command.completed, true);
    assertEquals(command.error, null);
  },
);

Deno.test(
  "Command keeps running until asynchronous actions resolve",
  async () => {

    const gate = Promise.withResolvers<void>();
    const command = new Command(async () => {
      await gate.promise;
    });

    const execution = command.execute();

    assertEquals(command.running, true);
    assertEquals(command.completed, false);
    assertEquals(command.error, null);

    gate.resolve();
    await execution;

    assertEquals(command.running, false);
    assertEquals(command.completed, true);
    assertEquals(command.error, null);
  },
);

Deno.test("Command captures errors and clears running state", async () => {
  const failure = new Error("boom");
  const command = new Command(() => {
    throw failure;
  });
  const snapshots: Array<{
    running: boolean;
    completed: boolean;
    error: Error | null;
  }> = [];

  command.addListener(() => {
    snapshots.push({
      running: command.running,
      completed: command.completed,
      error: command.error,
    });
  });

  await command.execute();

  assertStrictEquals(command.error, failure);
  assertEquals(command.completed, false);
  assertEquals(command.running, false);
  assertEquals(snapshots, [
    { running: true, completed: false, error: null },
    { running: false, completed: false, error: failure },
  ]);
});

Deno.test("Command prevents re-entrant execution while running", async () => {
  const gate = Promise.withResolvers<void>();
  let runCount = 0;
  const command = new Command(async () => {
    runCount += 1;
    await gate.promise;
  });

  const firstRun = command.execute();
  const secondRun = command.execute();

  await secondRun;
  assertEquals(runCount, 1);
  assertEquals(command.running, true);

  gate.resolve();
  await firstRun;

  assertEquals(runCount, 1);
  assertEquals(command.running, false);
  assertEquals(command.completed, true);
});

Deno.test("Command.clear resets the state after execution", async () => {
  const failure = new Error("boom");
  const command = new Command(() => {
    throw failure;
  });

  await command.execute();

  assertEquals(command.running, false);
  assertEquals(command.completed, false);
  assertStrictEquals(command.error, failure);

  command.clear();

  assertEquals(command.running, false);
  assertEquals(command.completed, false);
  assertEquals(command.error, null);
});
