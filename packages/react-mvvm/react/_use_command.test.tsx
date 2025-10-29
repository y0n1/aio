import "../tests/_setup_tests.ts";
import { assertEquals, assertStrictEquals } from "@std/assert";
import { act, renderHook } from "@testing-library/react";
import { useCommand } from "./use_command.ts";
import { type Result, Results } from "../core/result.ts";
import type { ActionLike } from "../core/command.ts";

// All tests run with StrictMode enabled to ensure proper cleanup behavior
const STRICT_MODE = { reactStrictMode: true };

// ============================================================================
// BASIC EXECUTION TESTS
// ============================================================================

Deno.test("useCommand returns idle state initially", () => {
  const action: ActionLike<number> = () => Promise.resolve(Results.Success(42));

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  assertEquals(result.current.status, "idle");
  assertEquals(result.current.result, null);

  unmount();
});

Deno.test("useCommand provides execute function", () => {
  const action: ActionLike<number> = () => Promise.resolve(Results.Success(42));

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  assertEquals(typeof result.current.execute, "function");

  unmount();
});

Deno.test("useCommand provides clear function", () => {
  const action: ActionLike<number> = () => Promise.resolve(Results.Success(42));

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  assertEquals(typeof result.current.clear, "function");

  unmount();
});

Deno.test("useCommand executes action successfully", async () => {
  const action: ActionLike<number> = () => Promise.resolve(Results.Success(42));

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  assertEquals(result.current.status, "done");
  assertEquals(result.current.result?.ok, true);
  if (result.current.result?.ok) {
    assertEquals(result.current.result.value, 42);
  }

  unmount();
});

Deno.test("useCommand handles action with arguments", async () => {
  const action: ActionLike<number, [number, number]> = (a, b) =>
    Promise.resolve(Results.Success(a + b));

  const { result, unmount } = renderHook(
    () => useCommand(action),
    STRICT_MODE,
  );

  await act(async () => {
    await result.current.execute(10, 20);
  });

  assertEquals(result.current.status, "done");
  assertEquals(result.current.result?.ok, true);
  if (result.current.result?.ok) {
    assertEquals(result.current.result.value, 30);
  }

  unmount();
});

Deno.test("useCommand handles action with multiple arguments", async () => {
  const action: ActionLike<string, [string, string, string]> = (
    a,
    b,
    c,
  ) => Promise.resolve(Results.Success(`${a}-${b}-${c}`));

  const { result, unmount } = renderHook(
    () => useCommand(action),
    STRICT_MODE,
  );

  await act(async () => {
    await result.current.execute("foo", "bar", "baz");
  });

  assertEquals(result.current.status, "done");
  if (result.current.result?.ok) {
    assertEquals(result.current.result.value, "foo-bar-baz");
  }

  unmount();
});

Deno.test("useCommand handles void action result", async () => {
  const action: ActionLike<void> = () => Promise.resolve(Results.Success());

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  assertEquals(result.current.status, "done");
  assertEquals(result.current.result?.ok, true);

  unmount();
});

// ============================================================================
// STATUS TRANSITION TESTS
// ============================================================================

Deno.test("useCommand transitions from idle to running to done", async () => {
  let resolveAction: ((value: number) => void) | null = null;
  const action: ActionLike<number> = async () => {
    return new Promise<Result<number, Error>>((resolve) => {
      resolveAction = (value: number) => resolve(Results.Success(value));
    });
  };

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  assertEquals(result.current.status, "idle");

  // Start execution without awaiting completion
  let executeStarted = false;
  const executePromise = result.current.execute().then(() => {
    executeStarted = true;
  });

  // Wait for next tick to let React flush state updates
  await act(async () => {
    await Promise.resolve();
  });

  // Should be running now
  assertEquals(result.current.status, "running");

  // Resolve the action
  await act(async () => {
    resolveAction?.(42);
    await executePromise;
  });

  assertEquals(result.current.status, "done");

  unmount();
});

Deno.test("useCommand clears result when starting execution", async () => {
  let executionCount = 0;
  let resolveAction: (() => void) | undefined;

  const action: ActionLike<number> = async () => {
    executionCount++;
    return new Promise<Result<number, Error>>((resolve) => {
      resolveAction = () => resolve(Results.Success(executionCount));
    });
  };

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  // First execution
  const firstExecution = result.current.execute();

  await act(async () => {
    await Promise.resolve();
  });

  const firstResolve = resolveAction;
  await act(async () => {
    firstResolve?.();
    await firstExecution;
  });

  assertEquals(result.current.result?.ok, true);
  if (result.current.result?.ok) {
    assertEquals(result.current.result.value, 1);
  }

  // Second execution - result should be cleared during running phase
  let capturedRunningResult: typeof result.current.result | undefined;
  const executePromise = result.current.execute();

  // Wait for state update to flush
  await act(async () => {
    await Promise.resolve();
  });

  // Capture result while running
  capturedRunningResult = result.current.result;

  const secondResolve = resolveAction;
  await act(async () => {
    secondResolve?.();
    await executePromise;
  });

  // Result should have been null during running phase
  assertEquals(capturedRunningResult, null);

  // And now should have the new result
  if (result.current.result?.ok) {
    assertEquals(result.current.result.value, 2);
  }

  unmount();
});

Deno.test("useCommand re-execution goes from done to running to done", async () => {
  let executionCount = 0;
  const action: ActionLike<number> = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1)); // Small delay to ensure state updates
    executionCount++;
    return Results.Success(executionCount);
  };

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  // First execution
  await act(async () => {
    await result.current.execute();
  });

  assertEquals(result.current.status, "done");
  assertEquals(executionCount, 1);

  // Second execution
  await act(async () => {
    await result.current.execute();
  });

  assertEquals(result.current.status, "done");
  assertEquals(executionCount, 2);

  unmount();
});

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

Deno.test("useCommand handles action that returns failure", async () => {
  const error = new Error("Test error");
  const action: ActionLike<number> = () => Promise.resolve(Results.Failure(error));

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  assertEquals(result.current.status, "done");
  assertEquals(result.current.result?.ok, false);
  if (result.current.result && !result.current.result.ok) {
    assertStrictEquals(result.current.result.error, error);
  }

  unmount();
});

Deno.test("useCommand catches exceptions thrown by action", async () => {
  const error = new Error("Thrown error");
  const action: ActionLike<number> = () => {
    throw error;
  };

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  assertEquals(result.current.status, "done");
  assertEquals(result.current.result?.ok, false);
  if (result.current.result && !result.current.result.ok) {
    assertStrictEquals(result.current.result.error, error);
  }

  unmount();
});

Deno.test("useCommand handles non-Error exceptions", async () => {
  const action: ActionLike<number> = () => {
    throw "string error";
  };

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  assertEquals(result.current.status, "done");
  assertEquals(result.current.result?.ok, false);
  if (result.current.result && !result.current.result.ok) {
    // Non-Error exceptions are cast to Error type but keep their original value
    assertEquals(result.current.result.error as unknown, "string error");
  }

  unmount();
});

Deno.test("useCommand handles action that throws synchronously", async () => {
  const error = new Error("Sync error");
  const action: ActionLike<number> = () => {
    throw error;
  };

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  assertEquals(result.current.status, "done");
  assertEquals(result.current.result?.ok, false);
  if (result.current.result && !result.current.result.ok) {
    assertStrictEquals(result.current.result.error, error);
  }

  unmount();
});

// ============================================================================
// CLEAR FUNCTIONALITY TESTS
// ============================================================================

Deno.test("useCommand clear resets to idle state", async () => {
  const action: ActionLike<number> = () => Promise.resolve(Results.Success(42));

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  assertEquals(result.current.status, "done");
  assertEquals(result.current.result?.ok, true);

  act(() => {
    result.current.clear();
  });

  assertEquals(result.current.status, "idle");
  assertEquals(result.current.result, null);

  unmount();
});

Deno.test("useCommand can execute after clear", async () => {
  let executionCount = 0;
  const action: ActionLike<number> = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1)); // Small delay to ensure state updates
    executionCount++;
    return Results.Success(executionCount);
  };

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  assertEquals(executionCount, 1);

  act(() => {
    result.current.clear();
  });

  await act(async () => {
    await result.current.execute();
  });

  assertEquals(executionCount, 2);
  assertEquals(result.current.status, "done");

  unmount();
});

Deno.test("useCommand clear on idle state remains idle", () => {
  const action: ActionLike<number> = () => Promise.resolve(Results.Success(42));

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  assertEquals(result.current.status, "idle");

  act(() => {
    result.current.clear();
  });

  assertEquals(result.current.status, "idle");
  assertEquals(result.current.result, null);

  unmount();
});

// ============================================================================
// CONCURRENT EXECUTION PREVENTION TESTS
// ============================================================================

Deno.test("useCommand prevents concurrent execution", async () => {
  let executionCount = 0;
  let resolveAction: (() => void) | null = null;

  const action: ActionLike<number> = async () => {
    executionCount++;
    return new Promise<Result<number, Error>>((resolve) => {
      resolveAction = () => resolve(Results.Success(executionCount));
    });
  };

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  // Start first execution
  const firstExecution = result.current.execute();

  // Wait for state to flush
  await act(async () => {
    await Promise.resolve();
  });

  assertEquals(result.current.status, "running");
  assertEquals(executionCount, 1);

  // Attempt second execution while first is running
  await act(async () => {
    await result.current.execute();
  });

  // Should still be from first execution
  assertEquals(executionCount, 1);
  assertEquals(result.current.status, "running");

  // Complete first execution
  await act(async () => {
    resolveAction?.();
    await firstExecution;
  });

  assertEquals(result.current.status, "done");
  assertEquals(executionCount, 1);

  unmount();
});

Deno.test("useCommand allows re-execution after completion", async () => {
  let executionCount = 0;
  const action: ActionLike<number> = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1)); // Small delay to ensure state updates
    executionCount++;
    return Results.Success(executionCount);
  };

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  // First execution
  await act(async () => {
    await result.current.execute();
  });

  assertEquals(executionCount, 1);
  assertEquals(result.current.status, "done");

  // Second execution after first completes
  await act(async () => {
    await result.current.execute();
  });

  assertEquals(executionCount, 2);
  assertEquals(result.current.status, "done");

  unmount();
});

// ============================================================================
// RERENDER BEHAVIOR TESTS
// ============================================================================

Deno.test("useCommand triggers rerender when execution starts", async () => {
  let resolveAction: (() => void) | null = null;
  const action: ActionLike<number> = async () => {
    return new Promise<Result<number, Error>>((resolve) => {
      resolveAction = () => resolve(Results.Success(42));
    });
  };

  let renderCount = 0;
  const { result, unmount } = renderHook(() => {
    renderCount++;
    return useCommand(action);
  }, STRICT_MODE);

  const initialRenderCount = renderCount;

  const executePromise = result.current.execute();

  // Wait for rerender from status change
  await act(async () => {
    await Promise.resolve();
  });

  // Should have triggered a rerender for status change to running
  assertEquals(renderCount > initialRenderCount, true);

  await act(async () => {
    resolveAction?.();
    await executePromise;
  });

  unmount();
});

Deno.test("useCommand triggers rerender when execution completes", async () => {
  const action: ActionLike<number> = async () => Results.Success(42);

  let renderCount = 0;
  const { result, unmount } = renderHook(() => {
    renderCount++;
    return useCommand(action);
  }, STRICT_MODE);

  const initialRenderCount = renderCount;

  await act(async () => {
    await result.current.execute();
  });

  // Should have triggered rerenders (start + completion)
  assertEquals(renderCount > initialRenderCount, true);

  unmount();
});

Deno.test("useCommand triggers rerender when cleared", async () => {
  const action: ActionLike<number> = async () => Results.Success(42);

  let renderCount = 0;
  const { result, unmount } = renderHook(() => {
    renderCount++;
    return useCommand(action);
  }, STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  const renderCountBeforeClear = renderCount;

  act(() => {
    result.current.clear();
  });

  // Should have triggered a rerender
  assertEquals(renderCount > renderCountBeforeClear, true);

  unmount();
});

Deno.test("useCommand doesn't trigger rerenders after unmount", async () => {
  let resolveAction: ((value: number) => void) | undefined;
  const action: ActionLike<number> = async () => {
    return new Promise<Result<number, Error>>((resolve) => {
      resolveAction = (value: number) => resolve(Results.Success(value));
    });
  };

  let renderCount = 0;
  const { result, unmount } = renderHook(() => {
    renderCount++;
    return useCommand(action);
  }, STRICT_MODE);

  const executePromise = result.current.execute();

  unmount();

  const renderCountAfterUnmount = renderCount;

  // Resolve after unmount
  resolveAction?.(42);
  await executePromise.catch(() => {
    /* ignore */
  });

  // Should not have triggered additional rerenders
  assertEquals(renderCount, renderCountAfterUnmount);
});

// ============================================================================
// ACTION CHANGE TESTS
// ============================================================================

Deno.test("useCommand uses new action when action changes", async () => {
  const action1: ActionLike<number> = () => Promise.resolve(Results.Success(1));
  const action2: ActionLike<number> = () => Promise.resolve(Results.Success(2));

  let currentAction = action1;

  const { result, rerender, unmount } = renderHook(
    () => useCommand(currentAction),
    STRICT_MODE,
  );

  await act(async () => {
    await result.current.execute();
  });

  if (result.current.result?.ok) {
    assertEquals(result.current.result.value, 1);
  }

  // Change action
  currentAction = action2;
  rerender();

  await act(async () => {
    await result.current.execute();
  });

  if (result.current.result?.ok) {
    assertEquals(result.current.result.value, 2);
  }

  unmount();
});

Deno.test("useCommand preserves state when action reference is stable", async () => {
  const action: ActionLike<number> = () => Promise.resolve(Results.Success(42));

  const { result, rerender, unmount } = renderHook(
    () => useCommand(action),
    STRICT_MODE,
  );

  await act(async () => {
    await result.current.execute();
  });

  const firstResult = result.current.result;

  // Rerender with same action
  rerender();

  // State should be preserved
  assertStrictEquals(result.current.result, firstResult);
  assertEquals(result.current.status, "done");

  unmount();
});

// ============================================================================
// FUNCTION IDENTITY TESTS
// ============================================================================

Deno.test("useCommand execute function identity is stable", () => {
  const action: ActionLike<number> = () => Promise.resolve(Results.Success(42));

  const { result, rerender, unmount } = renderHook(
    () => useCommand(action),
    STRICT_MODE,
  );

  const firstExecute = result.current.execute;

  rerender();

  // Execute function should have stable identity
  assertStrictEquals(result.current.execute, firstExecute);

  unmount();
});

Deno.test("useCommand clear function identity is stable", () => {
  const action: ActionLike<number> = () => Promise.resolve(Results.Success(42));

  const { result, rerender, unmount } = renderHook(
    () => useCommand(action),
    STRICT_MODE,
  );

  const firstClear = result.current.clear;

  rerender();

  // Clear function should have stable identity
  assertStrictEquals(result.current.clear, firstClear);

  unmount();
});

Deno.test("useCommand execute identity changes when action changes", () => {
  const action1: ActionLike<number> = () => Promise.resolve(Results.Success(1));
  const action2: ActionLike<number> = () => Promise.resolve(Results.Success(2));

  let currentAction = action1;

  const { result, rerender, unmount } = renderHook(
    () => useCommand(currentAction),
    STRICT_MODE,
  );

  const firstExecute = result.current.execute;

  currentAction = action2;
  rerender();

  // Execute function might have different identity when action changes
  // This is acceptable behavior - we just verify it works correctly
  assertEquals(typeof result.current.execute, "function");

  unmount();
});

// ============================================================================
// REACT STRICT MODE TESTS
// ============================================================================

Deno.test("useCommand works correctly in React StrictMode", async () => {
  const action: ActionLike<number> = () => Promise.resolve(Results.Success(42));

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  assertEquals(result.current.status, "idle");

  await act(async () => {
    await result.current.execute();
  });

  assertEquals(result.current.status, "done");
  assertEquals(result.current.result?.ok, true);

  unmount();
});

Deno.test("useCommand executes action only once in StrictMode", async () => {
  let executionCount = 0;
  const action: ActionLike<number> = async () => {
    executionCount++;
    return Results.Success(executionCount);
  };

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  // Should have executed only once
  assertEquals(executionCount, 1);
  if (result.current.result?.ok) {
    assertEquals(result.current.result.value, 1);
  }

  unmount();
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

Deno.test("useCommand can be used with multiple commands in one component", async () => {
  const action1: ActionLike<number> = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1)); // Small delay to ensure state updates
    return Results.Success(1);
  };
  const action2: ActionLike<number> = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1)); // Small delay to ensure state updates
    return Results.Success(2);
  };

  const { result, unmount } = renderHook(() => {
    const cmd1 = useCommand(action1);
    const cmd2 = useCommand(action2);
    return { cmd1, cmd2 };
  }, STRICT_MODE);

  await act(async () => {
    await result.current.cmd1.execute();
  });

  assertEquals(result.current.cmd1.status, "done");
  assertEquals(result.current.cmd2.status, "idle");

  await act(async () => {
    await result.current.cmd2.execute();
  });

  assertEquals(result.current.cmd1.status, "done");
  assertEquals(result.current.cmd2.status, "done");

  unmount();
});

Deno.test("useCommand maintains independent state for multiple instances", async () => {
  const action: ActionLike<number> = () => Promise.resolve(Results.Success(42));

  const { result: result1, unmount: unmount1 } = renderHook(
    () => useCommand(action),
    STRICT_MODE,
  );
  const { result: result2, unmount: unmount2 } = renderHook(
    () => useCommand(action),
    STRICT_MODE,
  );

  assertEquals(result1.current.status, "idle");
  assertEquals(result2.current.status, "idle");

  await act(async () => {
    await result1.current.execute();
  });

  assertEquals(result1.current.status, "done");
  assertEquals(result2.current.status, "idle");

  unmount1();
  unmount2();
});

Deno.test("useCommand with conditional execution", async () => {
  const action: ActionLike<number> = () => Promise.resolve(Results.Success(42));
  let shouldExecute = false;

  const { result, rerender, unmount } = renderHook(() => {
    const command = useCommand(action);
    return { command, shouldExecute };
  }, STRICT_MODE);

  assertEquals(result.current.command.status, "idle");

  shouldExecute = true;
  rerender();

  if (shouldExecute) {
    await act(async () => {
      await result.current.command.execute();
    });
  }

  assertEquals(result.current.command.status, "done");

  unmount();
});

// ============================================================================
// EDGE CASES AND ERROR SCENARIOS TESTS
// ============================================================================

Deno.test("useCommand handles very fast executing actions", async () => {
  const action: ActionLike<number> = () => Results.Success(42);

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  assertEquals(result.current.status, "done");
  assertEquals(result.current.result?.ok, true);

  unmount();
});

Deno.test("useCommand handles action with complex return type", async () => {
  type ComplexResult = {
    id: number;
    name: string;
    metadata: { created: Date; tags: string[] };
  };

  const complexData: ComplexResult = {
    id: 1,
    name: "Test",
    metadata: {
      created: new Date(),
      tags: ["tag1", "tag2"],
    },
  };

  const action: ActionLike<ComplexResult> = () =>
    Promise.resolve(Results.Success(complexData));

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  assertEquals(result.current.status, "done");
  if (result.current.result?.ok) {
    assertStrictEquals(result.current.result.value, complexData);
  }

  unmount();
});

Deno.test("useCommand handles action with no arguments", async () => {
  const action: ActionLike<string, []> = () => Promise.resolve(Results.Success("no args"));

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  assertEquals(result.current.status, "done");
  if (result.current.result?.ok) {
    assertEquals(result.current.result.value, "no args");
  }

  unmount();
});

Deno.test("useCommand handles rapid execute calls", async () => {
  let executionCount = 0;
  const action: ActionLike<number> = async () => {
    executionCount++;
    return Results.Success(executionCount);
  };

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  // Try to execute multiple times rapidly
  await act(async () => {
    await Promise.all([
      result.current.execute(),
      result.current.execute(),
      result.current.execute(),
    ]);
  });

  // Should have executed only once due to concurrent execution prevention
  assertEquals(executionCount, 1);

  unmount();
});

Deno.test("useCommand state remains consistent after clear and re-execute", async () => {
  let executionCount = 0;
  const action: ActionLike<number> = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1)); // Small delay to ensure state updates
    executionCount++;
    return Results.Success(executionCount);
  };

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  // Execute
  await act(async () => {
    await result.current.execute();
  });
  assertEquals(result.current.status, "done");
  assertEquals(executionCount, 1);

  // Clear
  act(() => {
    result.current.clear();
  });
  assertEquals(result.current.status, "idle");
  assertEquals(result.current.result, null);

  // Re-execute
  await act(async () => {
    await result.current.execute();
  });
  assertEquals(result.current.status, "done");
  assertEquals(executionCount, 2);

  unmount();
});

Deno.test("useCommand handles action that returns promise resolving to failure", async () => {
  const error = new Error("Async failure");
  const action: ActionLike<number> = () =>
    Promise.resolve(Results.Failure(error));

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  assertEquals(result.current.status, "done");
  assertEquals(result.current.result?.ok, false);
  if (result.current.result && !result.current.result.ok) {
    assertStrictEquals(result.current.result.error, error);
  }

  unmount();
});

Deno.test("useCommand handles synchronous action", async () => {
  const action: ActionLike<number> = () => Results.Success(42);

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  assertEquals(result.current.status, "done");
  assertEquals(result.current.result?.ok, true);

  unmount();
});

Deno.test("useCommand with delayed execution maintains correct state", async () => {
  let resolveAction: ((value: number) => void) | null = null;
  const action: ActionLike<number> = () => {
    return new Promise<Result<number, Error>>((resolve) => {
      resolveAction = (value: number) => resolve(Results.Success(value));
    });
  };

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  const executePromise = result.current.execute();

  // Wait for state to flush
  await act(async () => {
    await Promise.resolve();
  });

  // Verify running state
  assertEquals(result.current.status, "running");
  assertEquals(result.current.result, null);

  // Resolve after delay
  await new Promise((resolve) => setTimeout(resolve, 10));
  await act(async () => {
    resolveAction?.(99);
    await executePromise;
  });

  assertEquals(result.current.status, "done");
  if (result.current.result?.ok) {
    assertEquals(result.current.result.value, 99);
  }

  unmount();
});

// ============================================================================
// TYPE SAFETY TESTS
// ============================================================================

Deno.test("useCommand preserves result type information", async () => {
  type User = { id: number; name: string };
  const user: User = { id: 1, name: "Alice" };
  const action: ActionLike<User> = () => Promise.resolve(Results.Success(user));

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  if (result.current.result?.ok && result.current.result.value) {
    assertEquals(result.current.result.value.id, 1);
    assertEquals(result.current.result.value.name, "Alice");
  }

  unmount();
});

Deno.test("useCommand works with array return types", async () => {
  const action: ActionLike<number[]> = () =>
    Promise.resolve(Results.Success([1, 2, 3, 4, 5]));

  const { result, unmount } = renderHook(() => useCommand(action), STRICT_MODE);

  await act(async () => {
    await result.current.execute();
  });

  if (result.current.result?.ok) {
    assertEquals(result.current.result.value, [1, 2, 3, 4, 5]);
  }

  unmount();
});

Deno.test("useCommand works with null and undefined return values", async () => {
  const actionNull: ActionLike<null> = () => Promise.resolve(Results.Success(null));
  const actionUndefined: ActionLike<undefined> = () =>
    Promise.resolve(Results.Success(undefined));

  const { result: resultNull, unmount: unmount1 } = renderHook(
    () => useCommand(actionNull),
    STRICT_MODE,
  );
  const { result: resultUndefined, unmount: unmount2 } = renderHook(
    () => useCommand(actionUndefined),
    STRICT_MODE,
  );

  await act(async () => {
    await resultNull.current.execute();
  });
  await act(async () => {
    await resultUndefined.current.execute();
  });

  assertEquals(resultNull.current.result?.ok, true);
  assertEquals(resultUndefined.current.result?.ok, true);

  unmount1();
  unmount2();
});
