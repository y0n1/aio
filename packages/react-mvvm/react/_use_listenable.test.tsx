import "../tests/_setup_tests.ts";
import { assertEquals, assertStrictEquals } from "@std/assert";
import { act, renderHook } from "@testing-library/react";
import { useListenable } from "./use_listenable.ts";
import { CounterNotifier } from "../tests/_fixtures/_counter.ts";
import { ChangeNotifier } from "../core/change_notifier.ts";

// ============================================================================
// BASIC SUBSCRIPTION TESTS
// ============================================================================

Deno.test("useListenable subscribes to listenable on mount", () => {
  const notifier = new CounterNotifier();

  assertEquals(notifier.hasListeners, false);

  const { unmount } = renderHook(() => useListenable(notifier));

  assertEquals(notifier.hasListeners, true);

  unmount();
  notifier.dispose();
});

Deno.test("useListenable unsubscribes from listenable on unmount", () => {
  const notifier = new CounterNotifier();

  const { unmount } = renderHook(() => useListenable(notifier));

  assertEquals(notifier.hasListeners, true);

  unmount();

  assertEquals(notifier.hasListeners, false);
  notifier.dispose();
});

Deno.test("useListenable subscribes exactly one listener", () => {
  const notifier = new CounterNotifier();
  let addListenerCallCount = 0;

  // Track addListener calls
  const originalAdd = notifier.addListener.bind(notifier);
  notifier.addListener = (listener, options) => {
    addListenerCallCount++;
    originalAdd(listener, options);
  };

  const { unmount } = renderHook(() => useListenable(notifier));

  // Should only add one listener
  assertEquals(addListenerCallCount, 1);
  assertEquals(notifier.hasListeners, true);

  unmount();
  notifier.dispose();
});

Deno.test("useListenable removes listener exactly once on unmount", () => {
  const notifier = new CounterNotifier();
  let removeListenerCallCount = 0;

  // Track removeListener calls
  const originalRemove = notifier.removeListener.bind(notifier);
  notifier.removeListener = (listener) => {
    removeListenerCallCount++;
    originalRemove(listener);
  };

  const { unmount } = renderHook(() => useListenable(notifier));

  assertEquals(removeListenerCallCount, 0);

  unmount();

  // Should remove exactly one listener
  assertEquals(removeListenerCallCount, 1);
  assertEquals(notifier.hasListeners, false);

  notifier.dispose();
});

// ============================================================================
// RERENDER BEHAVIOR TESTS
// ============================================================================

Deno.test("useListenable causes rerender when listenable notifies", () => {
  const notifier = new CounterNotifier();
  let renderCount = 0;

  const { unmount } = renderHook(() => {
    renderCount++;
    useListenable(notifier);
    return notifier.count;
  });

  const initialRenderCount = renderCount;

  act(() => {
    notifier.increment();
  });

  // Should have triggered a rerender
  assertEquals(renderCount, initialRenderCount + 1);

  unmount();
  notifier.dispose();
});

Deno.test("useListenable triggers multiple rerenders for multiple notifications", () => {
  const notifier = new CounterNotifier();
  let renderCount = 0;

  const { unmount } = renderHook(() => {
    renderCount++;
    useListenable(notifier);
    return notifier.count;
  });

  const initialRenderCount = renderCount;

  act(() => {
    notifier.increment();
    notifier.increment();
    notifier.increment();
  });

  // Should have triggered rerenders (note: React may batch these)
  assertEquals(renderCount >= initialRenderCount + 1, true);

  unmount();
  notifier.dispose();
});

Deno.test("useListenable doesn't trigger rerenders after unmount", () => {
  const notifier = new CounterNotifier();
  let renderCount = 0;

  const { unmount } = renderHook(() => {
    renderCount++;
    useListenable(notifier);
    return notifier.count;
  });

  unmount();

  const unmountedRenderCount = renderCount;

  act(() => {
    notifier.increment();
  });

  // Should not have triggered additional rerenders after unmount
  assertEquals(renderCount, unmountedRenderCount);

  notifier.dispose();
});

// ============================================================================
// LISTENABLE CHANGE TESTS
// ============================================================================

Deno.test("useListenable resubscribes when listenable changes", () => {
  const firstNotifier = new CounterNotifier(10);
  const secondNotifier = new CounterNotifier(20);

  let currentNotifier = firstNotifier;

  const { rerender, unmount } = renderHook(() =>
    useListenable(currentNotifier)
  );

  assertEquals(firstNotifier.hasListeners, true);
  assertEquals(secondNotifier.hasListeners, false);

  currentNotifier = secondNotifier;
  rerender();

  assertEquals(firstNotifier.hasListeners, false);
  assertEquals(secondNotifier.hasListeners, true);

  unmount();
  firstNotifier.dispose();
  secondNotifier.dispose();
});

Deno.test("useListenable unsubscribes from old listenable when prop changes", () => {
  const firstNotifier = new CounterNotifier();
  const secondNotifier = new CounterNotifier();

  let currentNotifier = firstNotifier;

  const { rerender, unmount } = renderHook(() =>
    useListenable(currentNotifier)
  );

  assertEquals(firstNotifier.hasListeners, true);
  assertEquals(secondNotifier.hasListeners, false);

  currentNotifier = secondNotifier;
  rerender();

  assertEquals(firstNotifier.hasListeners, false);
  assertEquals(secondNotifier.hasListeners, true);

  unmount();
  firstNotifier.dispose();
  secondNotifier.dispose();
});

Deno.test("useListenable subscribes to new listenable when changed", () => {
  const firstNotifier = new CounterNotifier();
  const secondNotifier = new CounterNotifier();

  let currentNotifier = firstNotifier;
  let renderCount = 0;

  const { rerender, unmount } = renderHook(() => {
    renderCount++;
    useListenable(currentNotifier);
  });

  const renderCountBeforeSwitch = renderCount;

  currentNotifier = secondNotifier;
  rerender();

  // Should be subscribed to second notifier
  assertEquals(secondNotifier.hasListeners, true);

  act(() => {
    secondNotifier.increment();
  });

  // Should have caused a rerender
  assertEquals(renderCount > renderCountBeforeSwitch, true);

  unmount();
  firstNotifier.dispose();
  secondNotifier.dispose();
});

Deno.test("useListenable stops responding to old listenable after change", () => {
  const firstNotifier = new CounterNotifier();
  const secondNotifier = new CounterNotifier();

  let currentNotifier = firstNotifier;
  let renderCount = 0;

  const { rerender, unmount } = renderHook(() => {
    renderCount++;
    useListenable(currentNotifier);
  });

  currentNotifier = secondNotifier;
  rerender();

  const renderCountAfterSwitch = renderCount;

  act(() => {
    firstNotifier.increment();
  });

  // Should not have caused a rerender (no longer subscribed)
  assertEquals(renderCount, renderCountAfterSwitch);

  unmount();
  firstNotifier.dispose();
  secondNotifier.dispose();
});

// ============================================================================
// MEMORY LEAK PREVENTION TESTS
// ============================================================================

Deno.test("useListenable doesn't leak listeners after multiple mounts/unmounts", () => {
  const notifier = new CounterNotifier();

  assertEquals(notifier.hasListeners, false);

  // Mount and unmount multiple times
  for (let i = 0; i < 5; i++) {
    const { unmount } = renderHook(() => useListenable(notifier));

    assertEquals(notifier.hasListeners, true);
    unmount();
    assertEquals(notifier.hasListeners, false);
  }

  notifier.dispose();
});

Deno.test("useListenable doesn't leak listeners after multiple listenable changes", () => {
  const notifiers = Array.from({ length: 5 }, (_, i) => new CounterNotifier(i));

  let currentIndex = 0;

  const { rerender, unmount } = renderHook(() =>
    useListenable(notifiers[currentIndex])
  );

  // Change through all notifiers
  for (let i = 1; i < notifiers.length; i++) {
    currentIndex = i;
    rerender();

    // Only current notifier should have listeners
    for (let j = 0; j < notifiers.length; j++) {
      assertEquals(notifiers[j].hasListeners, j === i);
    }
  }

  unmount();

  // After unmount, no notifier should have listeners
  for (const notifier of notifiers) {
    assertEquals(notifier.hasListeners, false);
    notifier.dispose();
  }
});

Deno.test("useListenable cleans up properly with rapid listenable changes", () => {
  const notifiers = Array.from(
    { length: 10 },
    (_, i) => new CounterNotifier(i),
  );

  let currentIndex = 0;

  const { rerender, unmount } = renderHook(() =>
    useListenable(notifiers[currentIndex])
  );

  // Rapidly change between notifiers
  for (let i = 0; i < 20; i++) {
    currentIndex = i % notifiers.length;
    rerender();
  }

  // Only the current notifier should have listeners
  for (let i = 0; i < notifiers.length; i++) {
    if (i === currentIndex) {
      assertEquals(notifiers[i].hasListeners, true);
    } else {
      assertEquals(notifiers[i].hasListeners, false);
    }
  }

  unmount();

  // After unmount, no notifier should have listeners
  for (const notifier of notifiers) {
    assertEquals(notifier.hasListeners, false);
    notifier.dispose();
  }
});

// ============================================================================
// REACT STRICT MODE TESTS
// ============================================================================

Deno.test("useListenable works correctly in React StrictMode", () => {
  const notifier = new CounterNotifier();

  const { unmount } = renderHook(() => useListenable(notifier), {
    reactStrictMode: true,
  });

  // Should be subscribed
  assertEquals(notifier.hasListeners, true);

  unmount();

  // Should be unsubscribed
  assertEquals(notifier.hasListeners, false);
  notifier.dispose();
});

Deno.test("useListenable triggers rerenders in React StrictMode", () => {
  const notifier = new CounterNotifier();
  let renderCount = 0;

  const { unmount } = renderHook(() => {
    renderCount++;
    useListenable(notifier);
  }, { reactStrictMode: true });

  const initialRenderCount = renderCount;

  act(() => {
    notifier.increment();
  });

  // Should have triggered rerenders
  assertEquals(renderCount > initialRenderCount, true);

  unmount();
  notifier.dispose();
});

// ============================================================================
// EDGE CASES AND ERROR HANDLING TESTS
// ============================================================================

Deno.test("useListenable handles disposed listenable gracefully", () => {
  const notifier = new CounterNotifier();

  const { unmount } = renderHook(() => useListenable(notifier));

  assertEquals(notifier.hasListeners, true);

  // Dispose the notifier while component is still mounted
  notifier.dispose();

  assertEquals(notifier.hasListeners, false);

  // Should not throw error when unmounting
  unmount();
});

Deno.test("useListenable handles same listenable reference across rerenders", () => {
  const notifier = new CounterNotifier();

  const { rerender, unmount } = renderHook(() => useListenable(notifier));

  assertEquals(notifier.hasListeners, true);

  // Rerender with same notifier
  rerender();

  // Should still have exactly one listener
  assertEquals(notifier.hasListeners, true);

  unmount();

  assertEquals(notifier.hasListeners, false);
  notifier.dispose();
});

Deno.test("useListenable works with different IListenable implementations", () => {
  class CustomListenable extends ChangeNotifier {
    #value = "custom";

    get value(): string {
      return this.#value;
    }

    setValue(newValue: string): void {
      this.#value = newValue;
      this.notifyListeners();
    }
  }

  const customListenable = new CustomListenable();
  let renderCount = 0;

  const { unmount } = renderHook(() => {
    renderCount++;
    useListenable(customListenable);
  });

  assertEquals(customListenable.hasListeners, true);

  const initialRenderCount = renderCount;

  act(() => {
    customListenable.setValue("changed");
  });

  // Should have triggered a rerender
  assertEquals(renderCount, initialRenderCount + 1);

  unmount();

  assertEquals(customListenable.hasListeners, false);
  customListenable.dispose();
});

Deno.test("useListenable maintains subscription with multiple hook instances", () => {
  const notifier = new CounterNotifier();

  const { unmount: unmount1 } = renderHook(() => useListenable(notifier));
  const { unmount: unmount2 } = renderHook(() => useListenable(notifier));
  const { unmount: unmount3 } = renderHook(() => useListenable(notifier));

  // All three should be subscribed
  assertEquals(notifier.hasListeners, true);

  unmount1();
  assertEquals(notifier.hasListeners, true); // Still have 2 more

  unmount2();
  assertEquals(notifier.hasListeners, true); // Still have 1 more

  unmount3();
  assertEquals(notifier.hasListeners, false); // All unsubscribed

  notifier.dispose();
});

Deno.test("useListenable callback identity is stable across notifications", () => {
  const notifier = new CounterNotifier();
  const listeners = new Set<VoidFunction>();

  // Track all listeners added
  const originalAdd = notifier.addListener.bind(notifier);
  notifier.addListener = (listener, options) => {
    listeners.add(listener);
    originalAdd(listener, options);
  };

  const { unmount } = renderHook(() => useListenable(notifier));

  assertEquals(listeners.size, 1);
  const [listener] = listeners;

  act(() => {
    notifier.increment();
  });

  // After notification, should still be the same listener
  assertEquals(listeners.size, 1);
  assertStrictEquals([...listeners][0], listener);

  unmount();
  notifier.dispose();
});

// ============================================================================
// INTEGRATION WITH OTHER HOOKS TESTS
// ============================================================================

Deno.test("useListenable can be used with multiple listenables in one component", () => {
  const notifier1 = new CounterNotifier(1);
  const notifier2 = new CounterNotifier(2);

  const { unmount } = renderHook(() => {
    useListenable(notifier1);
    useListenable(notifier2);
  });

  assertEquals(notifier1.hasListeners, true);
  assertEquals(notifier2.hasListeners, true);

  unmount();

  assertEquals(notifier1.hasListeners, false);
  assertEquals(notifier2.hasListeners, false);

  notifier1.dispose();
  notifier2.dispose();
});

Deno.test("useListenable rerenders when any of multiple listenables notify", () => {
  const notifier1 = new CounterNotifier();
  const notifier2 = new CounterNotifier();
  let renderCount = 0;

  const { unmount } = renderHook(() => {
    renderCount++;
    useListenable(notifier1);
    useListenable(notifier2);
  });

  const initialRenderCount = renderCount;

  act(() => {
    notifier1.increment();
  });

  const renderCountAfterFirst = renderCount;
  assertEquals(renderCountAfterFirst > initialRenderCount, true);

  act(() => {
    notifier2.increment();
  });

  // Should have triggered another rerender
  assertEquals(renderCount > renderCountAfterFirst, true);

  unmount();
  notifier1.dispose();
  notifier2.dispose();
});

Deno.test("useListenable with conditional listenable subscription", () => {
  const notifier1 = new CounterNotifier();
  const notifier2 = new CounterNotifier();
  let useFirst = true;

  const { rerender, unmount } = renderHook(() => {
    const notifier = useFirst ? notifier1 : notifier2;
    useListenable(notifier);
  });

  assertEquals(notifier1.hasListeners, true);
  assertEquals(notifier2.hasListeners, false);

  useFirst = false;
  rerender();

  assertEquals(notifier1.hasListeners, false);
  assertEquals(notifier2.hasListeners, true);

  unmount();
  notifier1.dispose();
  notifier2.dispose();
});

// ============================================================================
// NOTIFICATION BATCHING TESTS
// ============================================================================

Deno.test("useListenable batches multiple notifications within act", () => {
  const notifier = new CounterNotifier();
  let renderCount = 0;

  const { unmount } = renderHook(() => {
    renderCount++;
    useListenable(notifier);
    return notifier.count;
  });

  const initialRenderCount = renderCount;

  act(() => {
    notifier.increment();
    notifier.increment();
    notifier.increment();
  });

  // React should batch these updates into a single render
  // The exact count depends on React's batching behavior,
  // but it should be less than 3 additional renders
  assertEquals(renderCount < initialRenderCount + 3, true);
  assertEquals(renderCount >= initialRenderCount + 1, true);

  unmount();
  notifier.dispose();
});
