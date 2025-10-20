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

Deno.test("useViewModel returns a non-disposed instance", () => {
  const { result } = renderHook(
    () => useViewModel(CounterNotifier),
    { reactStrictMode: true },
  );

  assertEquals(result.current.isDisposed, false);
});

Deno.test("useViewModel disposes the view-model when the component unmounts", () => {
  const { result, unmount } = renderHook(
    () => useViewModel(CounterNotifier),
    { reactStrictMode: true },
  );

  unmount();

  assertEquals(result.current.isDisposed, true);
});

Deno.test("useViewModel removes listeners when the component unmounts", () => {
  const { result, unmount } = renderHook(() => useViewModel(CounterNotifier), {
    reactStrictMode: true,
  });
  const viewmodel = result.current;

  unmount();

  assertEquals(viewmodel.hasListeners, false);
});

Deno.test("useViewModel re-renders when the view-model notifies listeners", () => {
  let renderCount = 0;

  const { result, unmount } = renderHook(() => {
    renderCount += 1;
    return useViewModel(CounterNotifier);
  }, { reactStrictMode: true });

  const viewmodel = result.current;

  assertEquals(viewmodel.count, 0);

  act(() => {
    viewmodel.increment();
  });

  assert(renderCount > 0);
  assertEquals(viewmodel.count, 1);

  unmount();
});

Deno.test("useViewModel returns the same instance after multiple renders", () => {
  const { result, rerender } = renderHook(
    () => useViewModel(CounterNotifier),
    { reactStrictMode: true },
  );

  const viewmodel = result.current;

  rerender();

  assertEquals(viewmodel, result.current);
});

Deno.test("useViewModel returns a new instance after unmounting", () => {
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

Deno.test("useViewModel forwards constructor arguments to the view-model", () => {
  class ParameterizedNotifier extends ChangeNotifier {
    #initialValue: number;
    get initialValue(): number {
      return this.#initialValue;
    }

    #label: string;
    get label(): string {
      return this.#label;
    }

    constructor(initialValue: number, label: string) {
      super();
      this.#initialValue = initialValue;
      this.#label = label;
    }
  }

  const { result } = renderHook(
    () => useViewModel(ParameterizedNotifier, 42, "counter"),
    { reactStrictMode: true },
  );

  const viewmodel = result.current;

  assertEquals(viewmodel.initialValue, 42);
  assertStrictEquals(viewmodel.label, "counter");
});
