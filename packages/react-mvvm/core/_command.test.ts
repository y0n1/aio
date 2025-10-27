/**
 * Comprehensive test suite for the Command class.
 *
 * ## Test Coverage
 * This test suite covers the following aspects of the Command class:
 *
 * ### Core Functionality
 * - Initialization and default state
 * - Synchronous and asynchronous action execution
 * - Error handling (thrown errors and Result failures)
 * - Multiple sequential executions
 * - Command with various argument types (none, single, multiple)
 *
 * ### Status Management
 * - Status lifecycle: idle → running → done (first execution)
 * - Re-execution: done → running → done (no idle transition)
 * - Status persistence after completion
 * - Status behavior during async operations
 * - Re-entrant execution prevention
 * - Explicit clear: done → idle
 *
 * ### Result Management
 * - Result storage and retrieval
 * - Result replacement on subsequent executions
 * - Transitions between success and failure states
 * - Void/undefined result values
 *
 * ### Listener Notifications
 * - Two notifications per execution: running, done
 * - Listener addition and removal
 * - Listener removal during notification
 * - Once-option listeners (single invocation)
 * - Behavior after disposal
 *
 * ### Method Binding
 * - Execute method is bound to instance (destructuring safe)
 *
 * ## Status Lifecycle
 *
 * The command status follows this lifecycle:
 * 1. **idle** (initial state or after explicit clear())
 * 2. **running** (during action execution)
 * 3. **done** (after execution completes)
 *
 * ### Status Transitions
 * - Initial state: `idle` (result: null)
 * - First execution: `idle` → `running` → `done`
 * - Re-execution: `done` → `running` → `done` (no idle transition)
 * - After clear(): `done` → `idle`
 *
 * ### Two Notifications Per Execution
 * Each execution triggers exactly two listener notifications:
 * 1. Running notification (status: "running", result: null)
 * 2. Done notification (status: "done", result: success/failure)
 *
 * ### Re-entrant Execution Prevention
 * The command properly prevents concurrent execution by checking if status === "running".
 * Subsequent execute() calls while running will return immediately without starting a new execution.
 */

import { assert, assertEquals, assertStrictEquals } from "@std/assert";
import { Command } from "./command.ts";
import { type Result, Results } from "./result.ts";

type Snapshot = {
  status: "idle" | "running" | "done";
  result: "success" | "failure" | null;
};

const getResultStatus = (
  result: Result<unknown> | null,
): Snapshot["result"] => {
  if (!result) {
    return null;
  }
  return result.ok ? "success" : "failure";
};

Deno.test("Command initializes with default state", () => {
  const command = new Command(() => Results.Success());

  assertEquals(command.status, "idle");
  assertEquals(command.result, null);
});

Deno.test(
  "Command executes synchronous actions and updates status/result snapshots",
  async () => {
    let runCount = 0;
    const command = new Command(() => {
      runCount += 1;
      return Results.Success("ok");
    });
    const snapshots: Snapshot[] = [];

    command.addListener(() => {
      snapshots.push({
        status: command.status,
        result: getResultStatus(command.result),
      });
    });

    await command.execute();

    assertEquals(runCount, 1);
    assertEquals(snapshots, [
      { status: "running", result: null }, // Running notification
      { status: "done", result: "success" }, // Done notification
    ]);
    assertEquals(command.status, "done");
    const result = command.result;
    assert(result);
    assert(result.ok);
    assertStrictEquals(result.value, "ok");
  },
);

Deno.test(
  "Command keeps running until asynchronous actions resolve",
  async () => {
    const gate = Promise.withResolvers<void>();
    const command = new Command(async () => {
      await gate.promise;
      return Results.Success("done");
    });

    const execution = command.execute();

    // After execute is called, status becomes "running"
    assertEquals(command.status, "running");
    assertEquals(command.result, null);

    gate.resolve();
    await execution;

    assertEquals(command.status, "done");
    const result = command.result;
    assert(result);
    assert(result.ok);
    assertStrictEquals(result.value, "done");
  },
);

Deno.test("Command captures thrown errors as failure results", async () => {
  const failure = new Error("boom");
  const command = new Command(() => {
    throw failure;
  });
  const snapshots: Snapshot[] = [];

  command.addListener(() => {
    snapshots.push({
      status: command.status,
      result: getResultStatus(command.result),
    });
  });

  await command.execute();

  assertEquals(snapshots, [
    { status: "running", result: null }, // Running notification
    { status: "done", result: "failure" }, // Done notification (error caught)
  ]);
  assertEquals(command.status, "done");
  const result = command.result;
  assert(result);
  assert(!result.ok);
  assertStrictEquals(result.error, failure);
});

Deno.test("Command prevents re-entrant execution while running", async () => {
  const gate = Promise.withResolvers<void>();
  let runCount = 0;
  const command = new Command(async () => {
    runCount += 1;
    await gate.promise;
    return Results.Success("first");
  });

  const firstRun = command.execute();
  const secondRun = command.execute();

  // Status is "running" so second execution is ignored
  assertEquals(command.status, "running");

  await secondRun; // Completes immediately without executing
  assertEquals(runCount, 1); // Only one execution happened

  gate.resolve();
  await firstRun;

  // Only first execution ran
  assertEquals(runCount, 1);
  assertEquals(command.status, "done");
  const result = command.result;
  assert(result);
  assert(result.ok);
  assertStrictEquals(result.value, "first");
});

Deno.test(
  "Command status transitions from idle through running to done",
  async () => {
    const command = new Command(() => Results.Success("result"));
    const statusHistory: Array<"idle" | "running" | "done"> = [];

    assertEquals(command.status, "idle");
    statusHistory.push(command.status);

    command.addListener(() => {
      statusHistory.push(command.status);
    });

    await command.execute();

    // Status goes: idle (initial) -> running -> done
    assertEquals(statusHistory, ["idle", "running", "done"]);
    assertEquals(command.status, "done");
  },
);

Deno.test("Command stays in done state after completion", async () => {
  const command = new Command(() => Results.Success("value"));

  await command.execute();
  assertEquals(command.status, "done");

  // Status should remain "done"
  assertEquals(command.status, "done");
  const result = command.result;
  assert(result);
  assert(result.ok);
  assertStrictEquals(result.value, "value");
});

Deno.test("Command execute method is bound to instance", async () => {
  const command = new Command(() => Results.Success("bound"));
  const { execute } = command;

  await execute();

  assertEquals(command.status, "done");
  const result = command.result;
  assert(result);
  assert(result.ok);
  assertStrictEquals(result.value, "bound");
});

Deno.test("Command clears previous result on re-execution after done", async () => {
  let callCount = 0;
  const command = new Command(() => {
    callCount += 1;
    return Results.Success(callCount);
  });

  // First execution
  await command.execute();
  assertEquals(command.status, "done");
  let result = command.result;
  assert(result);
  assert(result.ok);
  assertStrictEquals(result.value, 1);

  // Second execution - should clear and re-run
  await command.execute();
  assertEquals(command.status, "done");
  result = command.result;
  assert(result);
  assert(result.ok);
  assertStrictEquals(result.value, 2);
  assertEquals(callCount, 2);
});

Deno.test(
  "Command re-execution transitions directly from done to running",
  async () => {
    const command = new Command(() => Results.Success("value"));
    const snapshots: Snapshot[] = [];

    // First execution
    await command.execute();
    assertEquals(command.status, "done");

    // Add listener after first execution
    command.addListener(() => {
      snapshots.push({
        status: command.status,
        result: getResultStatus(command.result),
      });
    });

    // Second execution transitions: done → running → done (no idle)
    await command.execute();

    assertEquals(snapshots, [
      { status: "running", result: null }, // Running notification
      { status: "done", result: "success" }, // Done notification
    ]);
  },
);

Deno.test(
  "Command with async action that returns Result correctly",
  async () => {
    const command = new Command(async (value: number) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return Results.Success(value * 2);
    });

    await command.execute(5);

    assertEquals(command.status, "done");
    const result = command.result;
    assert(result);
    assert(result.ok);
    assertStrictEquals(result.value, 10);
  },
);

Deno.test("Command with multiple arguments works correctly", async () => {
  const command = new Command((a: number, b: string, c: boolean) => {
    return Results.Success({ a, b, c });
  });

  await command.execute(42, "test", true);

  assertEquals(command.status, "done");
  const result = command.result;
  assert(result);
  assert(result.ok);
  assertEquals(result.value, { a: 42, b: "test", c: true });
});

Deno.test("Command with no arguments works correctly", async () => {
  let executed = false;
  const command = new Command(() => {
    executed = true;
    return Results.Success();
  });

  await command.execute();

  assertEquals(executed, true);
  assertEquals(command.status, "done");
  const result = command.result;
  assert(result);
  assert(result.ok);
});

Deno.test(
  "Command with async action that rejects is handled as failure",
  async () => {
    const error = new Error("async rejection");
    const command = new Command(async () => {
      await Promise.resolve();
      throw error;
    });

    await command.execute();

    assertEquals(command.status, "done");
    const result = command.result;
    assert(result);
    assert(!result.ok);
    assertStrictEquals(result.error, error);
  },
);

Deno.test("Command can be executed multiple times sequentially", async () => {
  let executions = 0;
  const command = new Command(() => {
    executions += 1;
    return Results.Success(executions);
  });

  await command.execute();
  assertEquals(command.status, "done");
  let result = command.result;
  assert(result);
  assert(result.ok);
  assertEquals(result.value, 1);

  await command.execute();
  assertEquals(command.status, "done");
  result = command.result;
  assert(result);
  assert(result.ok);
  assertEquals(result.value, 2);

  await command.execute();
  assertEquals(command.status, "done");
  result = command.result;
  assert(result);
  assert(result.ok);
  assertEquals(result.value, 3);

  assertEquals(executions, 3);
});

Deno.test("Command result is replaced on each execution", async () => {
  let value = 1;
  const command = new Command(() => {
    const current = value;
    value += 1;
    return Results.Success(current);
  });

  await command.execute();
  let result = command.result;
  assert(result);
  assert(result.ok);
  assertEquals(result.value, 1);

  await command.execute();
  result = command.result;
  assert(result);
  assert(result.ok);
  assertEquals(result.value, 2);
});

Deno.test(
  "Command result changes from success to failure on subsequent execution",
  async () => {
    let shouldFail = false;
    const error = new Error("intentional failure");
    const command = new Command(() => {
      if (shouldFail) {
        return Results.Failure(error);
      }
      return Results.Success("ok");
    });

    await command.execute();
    let result = command.result;
    assert(result);
    assert(result.ok);
    assertEquals(result.value, "ok");

    shouldFail = true;
    await command.execute();
    result = command.result;
    assert(result);
    assert(!result.ok);
    assertStrictEquals(result.error, error);
  },
);

Deno.test(
  "Command result changes from failure to success on subsequent execution",
  async () => {
    let shouldFail = true;
    const error = new Error("intentional failure");
    const command = new Command(() => {
      if (shouldFail) {
        return Results.Failure(error);
      }
      return Results.Success("ok");
    });

    await command.execute();
    let result = command.result;
    assert(result);
    assert(!result.ok);
    assertStrictEquals(result.error, error);

    shouldFail = false;
    await command.execute();
    result = command.result;
    assert(result);
    assert(result.ok);
    assertEquals(result.value, "ok");
  },
);

Deno.test(
  "Command notifies listeners exactly twice per execution",
  async () => {
    const command = new Command(() => Results.Success("value"));
    let notificationCount = 0;

    command.addListener(() => {
      notificationCount += 1;
    });

    await command.execute();

    assertEquals(notificationCount, 2);
  },
);

Deno.test(
  "Command with void success result stores undefined value",
  async () => {
    const command = new Command(() => Results.Success());

    await command.execute();

    assertEquals(command.status, "done");
    const result = command.result;
    assert(result);
    assert(result.ok);
    assertEquals(result.value, undefined);
  },
);

Deno.test("Command listener can be removed during notification", async () => {
  const command = new Command(() => Results.Success("value"));
  const calls: string[] = [];

  const listener1 = () => {
    calls.push("listener1");
  };

  const listener2 = () => {
    calls.push("listener2");
    command.removeListener(listener3);
  };

  const listener3 = () => {
    calls.push("listener3");
  };

  command.addListener(listener1);
  command.addListener(listener2);
  command.addListener(listener3);

  await command.execute();

  // listener3 is removed on first notification, so it never runs
  // listener1 and listener2 are called for both notifications (running, done)
  assertEquals(calls, [
    "listener1",
    "listener2",
    "listener1",
    "listener2",
  ]);
});

Deno.test("Command works correctly after being disposed", async () => {
  let executed = false;
  const command = new Command(() => {
    executed = true;
    return Results.Success("value");
  });

  const listener = () => {
    throw new Error("Should not be called after dispose");
  };
  command.addListener(listener);

  command.dispose();

  // Command should still execute but not notify listeners
  await command.execute();

  assertEquals(executed, true);
  assertEquals(command.status, "done");
  const result = command.result;
  assert(result);
  assert(result.ok);
  assertEquals(result.value, "value");
  assertEquals(command.isDisposed, true);
  assertEquals(command.hasListeners, false);
});

Deno.test(
  "Command with listener added using once option is called only once per execution",
  async () => {
    const command = new Command(() => Results.Success("value"));
    let callCount = 0;

    command.addListener(() => {
      callCount += 1;
    }, { once: true });

    await command.execute();

    // Listener should be called once (on first notification) then removed
    assertEquals(callCount, 1);

    // Execute again, listener should not be called
    await command.execute();
    assertEquals(callCount, 1);
  },
);

Deno.test("Command clear() transitions status from done to idle", async () => {
  const command = new Command(() => Results.Success("value"));
  const snapshots: Snapshot[] = [];

  // Execute command
  await command.execute();
  assertEquals(command.status, "done");
  const result = command.result;
  assert(result);
  assert(result.ok);

  // Add listener to track clear notification
  command.addListener(() => {
    snapshots.push({
      status: command.status,
      result: getResultStatus(command.result),
    });
  });

  // Clear should transition to idle and notify
  command.clear();

  assertEquals(command.status, "idle");
  assertEquals(command.result, null);
  assertEquals(snapshots, [
    { status: "idle", result: null }, // Clear notification
  ]);
});

Deno.test(
  "Command execution after clear() starts from idle state",
  async () => {
    const command = new Command(() => Results.Success("value"));
    const snapshots: Snapshot[] = [];

    // Execute and clear
    await command.execute();
    command.clear();
    assertEquals(command.status, "idle");

    // Add listener to track next execution
    command.addListener(() => {
      snapshots.push({
        status: command.status,
        result: getResultStatus(command.result),
      });
    });

    // Execute again from idle
    await command.execute();

    assertEquals(snapshots, [
      { status: "running", result: null }, // Running notification
      { status: "done", result: "success" }, // Done notification
    ]);
    assertEquals(command.status, "done");
  },
);
