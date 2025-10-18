import "./_setup_tests.ts";
import {
  assert,
  assertEquals,
  assertNotStrictEquals,
  assertStrictEquals,
} from "@std/assert";
import { act, renderHook } from "@testing-library/react";
import { ChangeNotifier } from "../internal/core/change_notifier.ts";
import { useViewModel } from "../internal/react/use_view_model.ts";
import { CounterNotifier } from "./fixtures/counter.ts";

Deno.test("useChangeNotifier returns a non-disposed instance", () => {
  const { result } = renderHook(
    () => useViewModel(CounterNotifier),
    { reactStrictMode: true },
  );

  assertEquals(result.current.isDisposed, false);
});

Deno.test("useChangeNotifier disposes the notifier when the component unmounts", () => {
  const { result, unmount } = renderHook(
    () => useViewModel(CounterNotifier),
    { reactStrictMode: true },
  );

  unmount();

  assertEquals(result.current.isDisposed, true);
});

Deno.test("useChangeNotifier removes listeners when the component unmounts", () => {
  const { result, unmount } = renderHook(() => useViewModel(CounterNotifier), {
    reactStrictMode: true,
  });
  const notifier = result.current;

  unmount();

  assertEquals(notifier.hasListeners, false);
});

Deno.test("useChangeNotifier re-renders when the notifier dispatches", () => {
  let renderCount = 0;

  const { result, unmount } = renderHook(() => {
    renderCount += 1;
    return useViewModel(CounterNotifier);
  }, { reactStrictMode: true });

  const notifier = result.current;

  assertEquals(notifier.count, 0);

  act(() => {
    notifier.increment();
  });

  assert(renderCount > 0);
  assertEquals(notifier.count, 1);

  unmount();
});

Deno.test("useChangeNotifier returns the same instance after multiple renders", () => {
  const { result, rerender } = renderHook(
    () => useViewModel(CounterNotifier),
    { reactStrictMode: true },
  );

  const notifier = result.current;

  rerender();

  assertEquals(notifier, result.current);
});

Deno.test("useChangeNotifier returns a new instance after unmounting", () => {
  const { result, unmount } = renderHook(
    () => useViewModel(CounterNotifier),
    { reactStrictMode: true },
  );
  const firstInstance = result.current;

  unmount();

  assertEquals(firstInstance.hasListeners, false);

  const { result: nextRender } = renderHook(() =>
    useViewModel(CounterNotifier)
  );
  const secondInstance = nextRender.current;

  assertNotStrictEquals(secondInstance, firstInstance);
});

Deno.test("useChangeNotifier forwards constructor arguments to the notifier", () => {
  class ParameterizedNotifier extends ChangeNotifier {
    constructor(readonly initialValue: number, readonly label: string) {
      super();
    }
  }

  const { result } = renderHook(
    () => useViewModel(ParameterizedNotifier, 42, "counter"),
    { reactStrictMode: true },
  );

  const notifier = result.current;

  assertEquals(notifier.initialValue, 42);
  assertStrictEquals(notifier.label, "counter");
});
