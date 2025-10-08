import {
  act,
  assertEquals,
  assertNotStrictEquals,
  assertStrictEquals,
  renderHook,
} from "../test_deps.ts";

import { ChangeNotifier } from "../core/ChangeNotifier.ts";
import { useViewModel } from "./useViewModel.ts";

class CounterViewModel extends ChangeNotifier {
  #count = 0;

  get count(): number {
    return this.#count;
  }

  increment(): void {
    this.#count += 1;
    this.notifyListeners();
  }
}

class ParameterizedViewModel extends ChangeNotifier {
  constructor(readonly initialValue: number) {
    super();
  }
}

Deno.test("useViewModel re-renders when the ViewModel notifies listeners", () => {
  const { result, unmount } = renderHook(() => useViewModel(CounterViewModel));

  const vm = result.current;

  assertEquals(vm.count, 0);
  assertStrictEquals(result.all.length, 1);

  act(() => {
    vm.increment();
  });

  assertEquals(result.all.length, 2);
  assertEquals(result.current.count, 1);
  assertStrictEquals(result.current, vm);

  unmount();
  assertEquals(vm.hasListeners, false);
});

Deno.test("useViewModel memoizes the ViewModel instance for unchanged inputs", () => {
  const { result, rerender, unmount } = renderHook(
    ({ initialValue }: { initialValue: number }) =>
      useViewModel(ParameterizedViewModel, initialValue),
    { initialProps: { initialValue: 1 } },
  );

  const firstInstance = result.current;

  rerender({ initialValue: 1 });
  assertStrictEquals(result.current, firstInstance);

  rerender({ initialValue: 2 });
  assertNotStrictEquals(result.current, firstInstance);

  unmount();
});
