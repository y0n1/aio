import "./setup.ts";
import {
  assertEquals,
  assertNotStrictEquals,
  assertStrictEquals,
} from "@std/assert";
import { act, renderHook } from "@testing-library/react";
import { ChangeNotifier } from "../core/ChangeNotifier.ts";
import { useChangeNotifier } from "../react/useChangeNotifier.ts";
import { CounterNotifier } from "./fixtures/Counter.ts";

Deno.test("useChangeNotifier re-renders when the notifier dispatches", () => {
  let renderCount = 0;

  const { result, unmount } = renderHook(() => {
    renderCount += 1;
    return useChangeNotifier(CounterNotifier);
  });

  const notifier = result.current;

  assertEquals(renderCount, 1);
  assertEquals(notifier.count, 0);

  act(() => {
    notifier.increment();
  });

  assertEquals(renderCount, 2);
  assertEquals(notifier.count, 1);

  unmount();
});

Deno.test("useChangeNotifier returns the same instance after multiple renders", () => {
  const { result, rerender } = renderHook(() =>
    useChangeNotifier(CounterNotifier)
  );

  const notifier = result.current;

  rerender();

  assertEquals(notifier, result.current);
});

Deno.test("useChangeNotifier returns a new instance after unmounting", () => {
  const { result, unmount } = renderHook(() => useChangeNotifier(CounterNotifier));
  const firstInstance = result.current;

  unmount();

  assertEquals(firstInstance.hasListeners, false);

  const { result: nextRender } = renderHook(() => useChangeNotifier(CounterNotifier));
  const secondInstance = nextRender.current;

  assertNotStrictEquals(secondInstance, firstInstance);
});

Deno.test("useChangeNotifier forwards constructor arguments to the notifier", () => {
  class ParameterizedNotifier extends ChangeNotifier {
    constructor(readonly initialValue: number, readonly label: string) {
      super();
    }
  }

  const { result } = renderHook(() =>
    useChangeNotifier(ParameterizedNotifier, 42, "counter")
  );

  const notifier = result.current;

  assertEquals(notifier.initialValue, 42);
  assertStrictEquals(notifier.label, "counter");
});
