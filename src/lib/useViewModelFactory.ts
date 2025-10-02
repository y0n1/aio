import { useEffect, useMemo, useReducer, useRef } from "react";
import type { ViewModelBase } from "./ViewModelBase.ts";
import { logChange } from "../utils/logging.ts";

/**
 * Returns a stable reference to an array as long as its shallow contents do not change.
 * If the array length or any element changes (by reference), a new reference is returned.
 * Useful for React dependency arrays to avoid unnecessary recalculations.
 *
 * @param arr - The array to track for shallow stability.
 * @returns A stable array reference unless shallow contents change.
 */
function useShallowStableArray<T extends readonly unknown[]>(arr: T): T {
  const ref = useRef<T>(arr);
  if (
    ref.current.length !== arr.length ||
    arr.some((v, i) => v !== ref.current[i])
  ) {
    ref.current = arr;
  }
  return ref.current;
}

/**
 * React hook for creating and managing a ViewModel instance with a factory function.
 *
 * This hook memoizes the ViewModel instance using the provided factory and dependency array,
 * subscribes the component to ViewModel changes, and handles cleanup on unmount.
 * In development, listeners are simply removed on unmount; in production, the ViewModel is disposed.
 *
 * @template TViewModel - The type of the ViewModel, extending ViewModelBase.
 * @param factory - A function that returns a new instance of the ViewModel.
 * @param deps - Dependency array for memoizing the ViewModel instance; the first element MUST BE the ViewModel constructor, followed by its arguments if it has any.
 * @returns The memoized ViewModel instance.
 */
export function useViewModelFactory<TViewModel extends ViewModelBase>(
  factory: () => TViewModel,
  deps: readonly unknown[],
): TViewModel {
  if (deps.length === 0) {
    throw new Error(
      "useViewModelFactory: deps array must not be empty, you must provide the ViewModel constructor, followed by its arguments if it has any.",
    );
  }
  
  const [, updateView] = useReducer((b) => !b, true);

  const stableDeps = useShallowStableArray(deps);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const vm = useMemo(factory, stableDeps);

  useEffect(() => {
    console.log(
      `[DID MOUNT] VMID: ${vm.instanceId} | Disposed: ${vm.isDisposed}`,
    );
    vm.addListener(updateView);
    vm.addListener(logChange);
    return () => {
      console.log(
        `[WILL UNMOUNT] VMID: ${vm.instanceId} | Disposed: ${vm.isDisposed}`,
      );
      if (!import.meta.env.DEV) {
        console.log(`[WILL DISPOSE] VMID: ${vm.instanceId}`);
        vm[Symbol.dispose]();
      } else {
        console.log(`[WILL REMOVE LISTENERS] VMID: ${vm.instanceId}`);
        vm.removeListener(updateView);
        vm.removeListener(logChange);
      }
    };
  }, [vm]);

  return vm;
}
