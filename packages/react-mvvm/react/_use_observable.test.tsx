import "../tests/_setup_tests.ts";
import { assertEquals, assertStrictEquals } from "@std/assert";
import { act, renderHook } from "@testing-library/react";
import { useObservable } from "./use_observable.ts";
import { Observable } from "../core/observable.ts";

// All tests run with StrictMode enabled to ensure proper cleanup behavior
const STRICT_MODE = { reactStrictMode: true };

// ============================================================================
// BASIC SUBSCRIPTION TESTS
// ============================================================================

Deno.test("useObservable subscribes to observable on mount", () => {
  const observable = new Observable(0);
  let activeSubscriptions = 0;

  // Track active subscriptions (subscribe - unsubscribe)
  const originalSubscribe = observable.subscribe.bind(observable);
  observable.subscribe = (listener, options) => {
    activeSubscriptions++;
    const unsubscribe = originalSubscribe(listener, options);
    return () => {
      activeSubscriptions--;
      unsubscribe();
    };
  };

  const { unmount } = renderHook(() => useObservable(observable), STRICT_MODE);

  // Should have exactly one active subscription, even in StrictMode
  assertEquals(activeSubscriptions, 1);

  unmount();
});

Deno.test("useObservable unsubscribes from observable on unmount", () => {
  const observable = new Observable(0);
  let activeSubscriptions = 0;

  // Track active subscriptions
  const originalSubscribe = observable.subscribe.bind(observable);
  observable.subscribe = (listener, options) => {
    activeSubscriptions++;
    const unsubscribe = originalSubscribe(listener, options);
    return () => {
      activeSubscriptions--;
      unsubscribe();
    };
  };

  const { unmount } = renderHook(() => useObservable(observable), STRICT_MODE);

  assertEquals(activeSubscriptions, 1);

  unmount();

  // Should have cleaned up all subscriptions
  assertEquals(activeSubscriptions, 0);
});

Deno.test("useObservable subscribes exactly one listener", () => {
  const observable = new Observable(0);
  let activeSubscriptions = 0;

  // Track active subscriptions
  const originalSubscribe = observable.subscribe.bind(observable);
  observable.subscribe = (listener, options) => {
    activeSubscriptions++;
    const unsubscribe = originalSubscribe(listener, options);
    return () => {
      activeSubscriptions--;
      unsubscribe();
    };
  };

  const { unmount } = renderHook(() => useObservable(observable), STRICT_MODE);

  // Should have exactly one active subscription, even in StrictMode
  assertEquals(activeSubscriptions, 1);

  unmount();
});

Deno.test("useObservable cleans up all subscriptions on unmount", () => {
  const observable = new Observable(0);
  let activeSubscriptions = 0;

  // Track active subscriptions
  const originalSubscribe = observable.subscribe.bind(observable);
  observable.subscribe = (listener, options) => {
    activeSubscriptions++;
    const unsubscribe = originalSubscribe(listener, options);
    return () => {
      activeSubscriptions--;
      unsubscribe();
    };
  };

  const { unmount } = renderHook(() => useObservable(observable), STRICT_MODE);

  assertEquals(activeSubscriptions, 1);

  unmount();

  // Should have no active subscriptions after unmount
  assertEquals(activeSubscriptions, 0);
});

// ============================================================================
// VALUE RETRIEVAL TESTS
// ============================================================================

Deno.test("useObservable returns the initial value", () => {
  const observable = new Observable(42);

  const { result, unmount } = renderHook(
    () => useObservable(observable),
    STRICT_MODE,
  );

  assertEquals(result.current, 42);

  unmount();
});

Deno.test("useObservable returns the updated value after change", () => {
  const observable = new Observable(10);

  const { result, unmount } = renderHook(
    () => useObservable(observable),
    STRICT_MODE,
  );

  assertEquals(result.current, 10);

  act(() => {
    observable.value = 20;
  });

  assertEquals(result.current, 20);

  unmount();
});

Deno.test("useObservable returns the latest value after multiple changes", () => {
  const observable = new Observable(0);

  const { result, unmount } = renderHook(
    () => useObservable(observable),
    STRICT_MODE,
  );

  act(() => {
    observable.value = 1;
    observable.value = 2;
    observable.value = 3;
  });

  assertEquals(result.current, 3);

  unmount();
});

Deno.test("useObservable works with string values", () => {
  const observable = new Observable("initial");

  const { result, unmount } = renderHook(
    () => useObservable(observable),
    STRICT_MODE,
  );

  assertEquals(result.current, "initial");

  act(() => {
    observable.value = "updated";
  });

  assertEquals(result.current, "updated");

  unmount();
});

Deno.test("useObservable works with object values", () => {
  const initialObj = { count: 0 };
  const observable = new Observable(initialObj);

  const { result, unmount } = renderHook(
    () => useObservable(observable),
    STRICT_MODE,
  );

  assertStrictEquals(result.current, initialObj);

  const newObj = { count: 1 };
  act(() => {
    observable.value = newObj;
  });

  assertStrictEquals(result.current, newObj);

  unmount();
});

Deno.test("useObservable works with null and undefined values", () => {
  const observable = new Observable<number | null | undefined>(null);

  const { result, unmount, rerender } = renderHook(
    () => useObservable(observable),
    STRICT_MODE,
  );

  assertStrictEquals(result.current, null);

  act(() => {
    observable.value = undefined;
  });

  assertStrictEquals(result.current, undefined);

  act(() => {
    observable.value = 42;
  });

  assertEquals(result.current, 42);

  unmount();
});

// ============================================================================
// RERENDER BEHAVIOR TESTS
// ============================================================================

Deno.test("useObservable causes rerender when value changes", () => {
  const observable = new Observable(0);
  let renderCount = 0;

  const { unmount } = renderHook(() => {
    renderCount++;
    return useObservable(observable);
  }, STRICT_MODE);

  const initialRenderCount = renderCount;

  act(() => {
    observable.value = 1;
  });

  // Should have triggered at least one rerender
  assertEquals(renderCount > initialRenderCount, true);

  unmount();
});

Deno.test("useObservable triggers multiple rerenders for multiple value changes", () => {
  const observable = new Observable(0);
  let renderCount = 0;

  const { unmount } = renderHook(() => {
    renderCount++;
    return useObservable(observable);
  }, STRICT_MODE);

  const initialRenderCount = renderCount;

  act(() => {
    observable.value = 1;
    observable.value = 2;
    observable.value = 3;
  });

  // Should have triggered rerenders (note: React may batch these)
  assertEquals(renderCount >= initialRenderCount + 1, true);

  unmount();
});

Deno.test("useObservable doesn't trigger rerenders after unmount", () => {
  const observable = new Observable(0);
  let renderCount = 0;

  const { unmount } = renderHook(() => {
    renderCount++;
    return useObservable(observable);
  }, STRICT_MODE);

  unmount();

  const unmountedRenderCount = renderCount;

  act(() => {
    observable.value = 100;
  });

  // Should not have triggered additional rerenders after unmount
  assertEquals(renderCount, unmountedRenderCount);
});

Deno.test("useObservable doesn't trigger rerender when value doesn't change", () => {
  const observable = new Observable(42);
  let renderCount = 0;

  const { unmount } = renderHook(() => {
    renderCount++;
    return useObservable(observable);
  }, STRICT_MODE);

  const initialRenderCount = renderCount;

  act(() => {
    // Set to the same value - Observable shouldn't notify
    observable.value = 42;
  });

  // Should not have triggered a rerender
  assertEquals(renderCount, initialRenderCount);

  unmount();
});

// ============================================================================
// OBSERVABLE CHANGE TESTS
// ============================================================================

Deno.test("useObservable resubscribes when observable changes", () => {
  const firstObservable = new Observable(10);
  const secondObservable = new Observable(20);

  let firstActiveSubscriptions = 0;
  let secondActiveSubscriptions = 0;

  // Track active subscriptions
  const originalFirstSubscribe = firstObservable.subscribe.bind(
    firstObservable,
  );
  firstObservable.subscribe = (listener, options) => {
    firstActiveSubscriptions++;
    const unsubscribe = originalFirstSubscribe(listener, options);
    return () => {
      firstActiveSubscriptions--;
      unsubscribe();
    };
  };

  const originalSecondSubscribe = secondObservable.subscribe.bind(
    secondObservable,
  );
  secondObservable.subscribe = (listener, options) => {
    secondActiveSubscriptions++;
    const unsubscribe = originalSecondSubscribe(listener, options);
    return () => {
      secondActiveSubscriptions--;
      unsubscribe();
    };
  };

  let currentObservable = firstObservable;

  const { rerender, unmount } = renderHook(
    () => useObservable(currentObservable),
    STRICT_MODE,
  );

  assertEquals(firstActiveSubscriptions, 1);
  assertEquals(secondActiveSubscriptions, 0);

  currentObservable = secondObservable;
  rerender();

  assertEquals(firstActiveSubscriptions, 0);
  assertEquals(secondActiveSubscriptions, 1);

  unmount();
});

Deno.test("useObservable unsubscribes from old observable when prop changes", () => {
  const firstObservable = new Observable(10);
  const secondObservable = new Observable(20);

  let firstActiveSubscriptions = 0;
  let secondActiveSubscriptions = 0;

  // Track active subscriptions
  const originalFirstSubscribe = firstObservable.subscribe.bind(
    firstObservable,
  );
  firstObservable.subscribe = (listener, options) => {
    firstActiveSubscriptions++;
    const unsubscribe = originalFirstSubscribe(listener, options);
    return () => {
      firstActiveSubscriptions--;
      unsubscribe();
    };
  };

  const originalSecondSubscribe = secondObservable.subscribe.bind(
    secondObservable,
  );
  secondObservable.subscribe = (listener, options) => {
    secondActiveSubscriptions++;
    const unsubscribe = originalSecondSubscribe(listener, options);
    return () => {
      secondActiveSubscriptions--;
      unsubscribe();
    };
  };

  let currentObservable = firstObservable;

  const { rerender, unmount } = renderHook(
    () => useObservable(currentObservable),
    STRICT_MODE,
  );

  assertEquals(firstActiveSubscriptions, 1);
  assertEquals(secondActiveSubscriptions, 0);

  currentObservable = secondObservable;
  rerender();

  // First should be unsubscribed, second should be subscribed
  assertEquals(firstActiveSubscriptions, 0);
  assertEquals(secondActiveSubscriptions, 1);

  unmount();
});

Deno.test("useObservable returns correct value after observable change", () => {
  const firstObservable = new Observable(10);
  const secondObservable = new Observable(20);

  let currentObservable = firstObservable;

  const { result, rerender, unmount } = renderHook(
    () => useObservable(currentObservable),
    STRICT_MODE,
  );

  assertEquals(result.current, 10);

  currentObservable = secondObservable;
  rerender();

  assertEquals(result.current, 20);

  unmount();
});

Deno.test("useObservable responds to new observable changes after switching", () => {
  const firstObservable = new Observable(10);
  const secondObservable = new Observable(20);

  let currentObservable = firstObservable;
  let renderCount = 0;

  const { result, rerender, unmount } = renderHook(() => {
    renderCount++;
    return useObservable(currentObservable);
  }, STRICT_MODE);

  currentObservable = secondObservable;
  rerender();

  const renderCountAfterSwitch = renderCount;

  act(() => {
    secondObservable.value = 30;
  });

  // Should have caused a rerender
  assertEquals(renderCount > renderCountAfterSwitch, true);
  assertEquals(result.current, 30);

  unmount();
});

Deno.test("useObservable stops responding to old observable after change", () => {
  const firstObservable = new Observable(10);
  const secondObservable = new Observable(20);

  let currentObservable = firstObservable;
  let renderCount = 0;

  const { result, rerender, unmount } = renderHook(() => {
    renderCount++;
    return useObservable(currentObservable);
  }, STRICT_MODE);

  currentObservable = secondObservable;
  rerender();

  const renderCountAfterSwitch = renderCount;
  const valueAfterSwitch = result.current;

  act(() => {
    firstObservable.value = 999;
  });

  // Should not have caused a rerender (no longer subscribed)
  assertEquals(renderCount, renderCountAfterSwitch);
  assertEquals(result.current, valueAfterSwitch);

  unmount();
});

// ============================================================================
// MEMORY LEAK PREVENTION TESTS
// ============================================================================

Deno.test("useObservable doesn't leak subscriptions after multiple mounts/unmounts", () => {
  const observable = new Observable(0);
  let activeSubscriptions = 0;

  // Track active subscriptions
  const originalSubscribe = observable.subscribe.bind(observable);
  observable.subscribe = (listener, options) => {
    activeSubscriptions++;
    const unsubscribe = originalSubscribe(listener, options);
    return () => {
      activeSubscriptions--;
      unsubscribe();
    };
  };

  assertEquals(activeSubscriptions, 0);

  // Mount and unmount multiple times
  for (let i = 0; i < 5; i++) {
    const { unmount } = renderHook(
      () => useObservable(observable),
      STRICT_MODE,
    );

    assertEquals(activeSubscriptions, 1);
    unmount();
    assertEquals(activeSubscriptions, 0);
  }
});

Deno.test("useObservable doesn't leak subscriptions after multiple observable changes", () => {
  const observables = Array.from({ length: 5 }, (_, i) => new Observable(i));

  let activeSubscriptionCounts = new Array(5).fill(0);

  // Track active subscriptions for each observable
  observables.forEach((obs, idx) => {
    const originalSubscribe = obs.subscribe.bind(obs);
    obs.subscribe = (listener, options) => {
      activeSubscriptionCounts[idx]++;
      const unsubscribe = originalSubscribe(listener, options);
      return () => {
        activeSubscriptionCounts[idx]--;
        unsubscribe();
      };
    };
  });

  let currentIndex = 0;

  const { rerender, unmount } = renderHook(() =>
    useObservable(observables[currentIndex])
  );

  // Change through all observables
  for (let i = 1; i < observables.length; i++) {
    currentIndex = i;
    rerender();

    // Only current observable should have active subscription
    for (let j = 0; j < observables.length; j++) {
      assertEquals(activeSubscriptionCounts[j], j === i ? 1 : 0);
    }
  }

  unmount();

  // After unmount, no observable should have active subscriptions
  for (let j = 0; j < observables.length; j++) {
    assertEquals(activeSubscriptionCounts[j], 0);
  }
});

Deno.test("useObservable cleans up properly with rapid observable changes", () => {
  const observables = Array.from(
    { length: 10 },
    (_, i) => new Observable(i),
  );

  let activeSubscriptionCounts = new Array(10).fill(0);

  // Track active subscriptions for each observable
  observables.forEach((obs, idx) => {
    const originalSubscribe = obs.subscribe.bind(obs);
    obs.subscribe = (listener, options) => {
      activeSubscriptionCounts[idx]++;
      const unsubscribe = originalSubscribe(listener, options);
      return () => {
        activeSubscriptionCounts[idx]--;
        unsubscribe();
      };
    };
  });

  let currentIndex = 0;

  const { rerender, unmount } = renderHook(() =>
    useObservable(observables[currentIndex])
  );

  // Rapidly change between observables
  for (let i = 0; i < 20; i++) {
    currentIndex = i % observables.length;
    rerender();
  }

  // Only the current observable should have an active subscription
  for (let i = 0; i < observables.length; i++) {
    if (i === currentIndex) {
      assertEquals(activeSubscriptionCounts[i], 1);
    } else {
      assertEquals(activeSubscriptionCounts[i], 0);
    }
  }

  unmount();

  // After unmount, no observable should have active subscriptions
  for (let i = 0; i < observables.length; i++) {
    assertEquals(activeSubscriptionCounts[i], 0);
  }
});

// ============================================================================
// REACT STRICT MODE TESTS
// ============================================================================

Deno.test("useObservable works correctly in React StrictMode", () => {
  const observable = new Observable(42);
  let activeSubscriptions = 0;

  // Track active subscriptions
  const originalSubscribe = observable.subscribe.bind(observable);
  observable.subscribe = (listener, options) => {
    activeSubscriptions++;
    const unsubscribe = originalSubscribe(listener, options);
    return () => {
      activeSubscriptions--;
      unsubscribe();
    };
  };

  const { result, unmount } = renderHook(
    () => useObservable(observable),
    STRICT_MODE,
  );

  // Should be subscribed
  assertEquals(activeSubscriptions, 1);
  assertEquals(result.current, 42);

  unmount();

  // Should be unsubscribed
  assertEquals(activeSubscriptions, 0);
});

Deno.test("useObservable returns correct value in React StrictMode", () => {
  const observable = new Observable("strict mode test");

  const { result, unmount } = renderHook(
    () => useObservable(observable),
    STRICT_MODE,
  );

  assertEquals(result.current, "strict mode test");

  act(() => {
    observable.value = "updated in strict mode";
  });

  assertEquals(result.current, "updated in strict mode");

  unmount();
});

Deno.test("useObservable triggers rerenders in React StrictMode", () => {
  const observable = new Observable(0);
  let renderCount = 0;

  const { result, unmount } = renderHook(() => {
    renderCount++;
    return useObservable(observable);
  }, STRICT_MODE);

  const initialRenderCount = renderCount;

  act(() => {
    observable.value = 100;
  });

  // Should have triggered rerenders
  assertEquals(renderCount > initialRenderCount, true);
  assertEquals(result.current, 100);

  unmount();
});

// ============================================================================
// EDGE CASES AND ERROR HANDLING TESTS
// ============================================================================

Deno.test("useObservable handles same observable reference across rerenders", () => {
  const observable = new Observable(42);
  let subscribeCallCount = 0;

  // Track subscribe calls
  const originalSubscribe = observable.subscribe.bind(observable);
  observable.subscribe = (listener, options) => {
    subscribeCallCount++;
    return originalSubscribe(listener, options);
  };

  const { result, rerender, unmount } = renderHook(
    () => useObservable(observable),
    STRICT_MODE,
  );

  const initialSubscribeCount = subscribeCallCount;
  assertEquals(result.current, 42);

  // Rerender with same observable
  rerender();

  // Should not subscribe again
  assertEquals(subscribeCallCount, initialSubscribeCount);
  assertEquals(result.current, 42);

  unmount();
});

Deno.test("useObservable maintains subscription with multiple hook instances", () => {
  const observable = new Observable(0);
  let activeSubscriptions = 0;

  // Track active subscriptions
  const originalSubscribe = observable.subscribe.bind(observable);
  observable.subscribe = (listener, options) => {
    activeSubscriptions++;
    const unsubscribe = originalSubscribe(listener, options);
    return () => {
      activeSubscriptions--;
      unsubscribe();
    };
  };

  const { result: result1, unmount: unmount1 } = renderHook(
    () => useObservable(observable),
    STRICT_MODE,
  );
  const { result: result2, unmount: unmount2 } = renderHook(
    () => useObservable(observable),
    STRICT_MODE,
  );
  const { result: result3, unmount: unmount3 } = renderHook(
    () => useObservable(observable),
    STRICT_MODE,
  );

  // All three should be subscribed
  assertEquals(activeSubscriptions, 3);
  assertEquals(result1.current, 0);
  assertEquals(result2.current, 0);
  assertEquals(result3.current, 0);

  act(() => {
    observable.value = 10;
  });

  assertEquals(result1.current, 10);
  assertEquals(result2.current, 10);
  assertEquals(result3.current, 10);

  unmount1();
  assertEquals(activeSubscriptions, 2);

  unmount2();
  assertEquals(activeSubscriptions, 1);

  unmount3();
  assertEquals(activeSubscriptions, 0);
});

Deno.test("useObservable callback identity is stable across notifications", () => {
  const observable = new Observable(0);
  let currentListener: ((value: number) => void) | null = null;
  let activeListenerCount = 0;

  // Track the active listener
  const originalSubscribe = observable.subscribe.bind(observable);
  observable.subscribe = (listener, options) => {
    activeListenerCount++;
    currentListener = listener;
    const unsubscribe = originalSubscribe(listener, options);
    return () => {
      activeListenerCount--;
      if (currentListener === listener) {
        currentListener = null;
      }
      unsubscribe();
    };
  };

  const { unmount } = renderHook(() => useObservable(observable), STRICT_MODE);

  assertEquals(activeListenerCount, 1);
  const listener = currentListener;

  act(() => {
    observable.value = 1;
  });

  // After notification, should still be the same listener
  assertEquals(activeListenerCount, 1);
  assertStrictEquals(currentListener, listener);

  unmount();
});

// ============================================================================
// INTEGRATION WITH OTHER HOOKS TESTS
// ============================================================================

Deno.test("useObservable can be used with multiple observables in one component", () => {
  const observable1 = new Observable(1);
  const observable2 = new Observable(2);

  let activeSubscriptions1 = 0;
  let activeSubscriptions2 = 0;

  // Track subscriptions
  const originalSubscribe1 = observable1.subscribe.bind(observable1);
  observable1.subscribe = (listener, options) => {
    activeSubscriptions1++;
    const unsubscribe = originalSubscribe1(listener, options);
    return () => {
      activeSubscriptions1--;
      unsubscribe();
    };
  };

  const originalSubscribe2 = observable2.subscribe.bind(observable2);
  observable2.subscribe = (listener, options) => {
    activeSubscriptions2++;
    const unsubscribe = originalSubscribe2(listener, options);
    return () => {
      activeSubscriptions2--;
      unsubscribe();
    };
  };

  const { result, unmount } = renderHook(() => {
    const val1 = useObservable(observable1);
    const val2 = useObservable(observable2);
    return { val1, val2 };
  }, STRICT_MODE);

  assertEquals(activeSubscriptions1, 1);
  assertEquals(activeSubscriptions2, 1);
  assertEquals(result.current.val1, 1);
  assertEquals(result.current.val2, 2);

  unmount();

  assertEquals(activeSubscriptions1, 0);
  assertEquals(activeSubscriptions2, 0);
});

Deno.test("useObservable rerenders when any of multiple observables change", () => {
  const observable1 = new Observable(10);
  const observable2 = new Observable(20);
  let renderCount = 0;

  const { result, unmount } = renderHook(() => {
    renderCount++;
    const val1 = useObservable(observable1);
    const val2 = useObservable(observable2);
    return { val1, val2 };
  });

  const initialRenderCount = renderCount;

  act(() => {
    observable1.value = 100;
  });

  const renderCountAfterFirst = renderCount;
  assertEquals(renderCountAfterFirst > initialRenderCount, true);
  assertEquals(result.current.val1, 100);
  assertEquals(result.current.val2, 20);

  act(() => {
    observable2.value = 200;
  });

  // Should have triggered another rerender
  assertEquals(renderCount > renderCountAfterFirst, true);
  assertEquals(result.current.val1, 100);
  assertEquals(result.current.val2, 200);

  unmount();
});

Deno.test("useObservable with conditional observable subscription", () => {
  const observable1 = new Observable(10);
  const observable2 = new Observable(20);
  let useFirst = true;

  let activeSubscriptions1 = 0;
  let activeSubscriptions2 = 0;

  // Track subscriptions
  const originalSubscribe1 = observable1.subscribe.bind(observable1);
  observable1.subscribe = (listener, options) => {
    activeSubscriptions1++;
    const unsubscribe = originalSubscribe1(listener, options);
    return () => {
      activeSubscriptions1--;
      unsubscribe();
    };
  };

  const originalSubscribe2 = observable2.subscribe.bind(observable2);
  observable2.subscribe = (listener, options) => {
    activeSubscriptions2++;
    const unsubscribe = originalSubscribe2(listener, options);
    return () => {
      activeSubscriptions2--;
      unsubscribe();
    };
  };

  const { result, rerender, unmount } = renderHook(() => {
    const observable = useFirst ? observable1 : observable2;
    return useObservable(observable);
  }, STRICT_MODE);

  assertEquals(activeSubscriptions1, 1);
  assertEquals(activeSubscriptions2, 0);
  assertEquals(result.current, 10);

  useFirst = false;
  rerender();

  assertEquals(activeSubscriptions1, 0);
  assertEquals(activeSubscriptions2, 1);
  assertEquals(result.current, 20);

  unmount();
});

// ============================================================================
// NOTIFICATION BATCHING TESTS
// ============================================================================

Deno.test("useObservable batches multiple value changes within act", () => {
  const observable = new Observable(0);
  let renderCount = 0;

  const { result, unmount } = renderHook(() => {
    renderCount++;
    return useObservable(observable);
  }, STRICT_MODE);

  const initialRenderCount = renderCount;

  act(() => {
    observable.value = 1;
    observable.value = 2;
    observable.value = 3;
  });

  // React should batch these updates into a single render
  // The exact count depends on React's batching behavior,
  // but it should be less than 3 additional renders
  assertEquals(renderCount < initialRenderCount + 3, true);
  assertEquals(renderCount >= initialRenderCount + 1, true);
  assertEquals(result.current, 3);

  unmount();
});

Deno.test("useObservable returns latest value after batched updates", () => {
  const observable = new Observable("initial");

  const { result, unmount } = renderHook(
    () => useObservable(observable),
    STRICT_MODE,
  );

  act(() => {
    observable.value = "first";
    observable.value = "second";
    observable.value = "third";
    observable.value = "final";
  });

  // Should have the final value
  assertEquals(result.current, "final");

  unmount();
});

// ============================================================================
// TYPE SAFETY TESTS
// ============================================================================

Deno.test("useObservable preserves type information for primitives", () => {
  const numberObs = new Observable(42);
  const stringObs = new Observable("test");
  const booleanObs = new Observable(true);

  const { result: numberResult, unmount: unmount1 } = renderHook(
    () => useObservable(numberObs),
    STRICT_MODE,
  );
  const { result: stringResult, unmount: unmount2 } = renderHook(
    () => useObservable(stringObs),
    STRICT_MODE,
  );
  const { result: booleanResult, unmount: unmount3 } = renderHook(
    () => useObservable(booleanObs),
    STRICT_MODE,
  );

  assertEquals(typeof numberResult.current, "number");
  assertEquals(typeof stringResult.current, "string");
  assertEquals(typeof booleanResult.current, "boolean");

  unmount1();
  unmount2();
  unmount3();
});

Deno.test("useObservable works with complex types", () => {
  type User = { id: number; name: string };
  const user: User = { id: 1, name: "Alice" };
  const observable = new Observable<User>(user);

  const { result, unmount } = renderHook(
    () => useObservable(observable),
    STRICT_MODE,
  );

  assertEquals(result.current.id, 1);
  assertEquals(result.current.name, "Alice");

  act(() => {
    observable.value = { id: 2, name: "Bob" };
  });

  assertEquals(result.current.id, 2);
  assertEquals(result.current.name, "Bob");

  unmount();
});

Deno.test("useObservable works with array types", () => {
  const observable = new Observable<number[]>([1, 2, 3]);

  const { result, unmount } = renderHook(
    () => useObservable(observable),
    STRICT_MODE,
  );

  assertEquals(result.current, [1, 2, 3]);

  act(() => {
    observable.value = [4, 5, 6, 7];
  });

  assertEquals(result.current, [4, 5, 6, 7]);

  unmount();
});
