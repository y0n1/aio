import { useEffect, useMemo, useReducer } from "react";
import type { ViewModelBase, ViewModelConstructor } from "../core/ViewModelBase.ts";

/**
 * React hook for instantiating and subscribing to a ViewModel.
 *
 * This hook creates a new instance of the given ViewModel class and subscribes the component
 * to its change notifications. When the ViewModel notifies of changes, the component will re-render.
 * The ViewModel instance is memoized based on the class and constructor arguments.
 *
 * @template TViewModelClass - The constructor type of the ViewModel.
 * @param viewModelClass - The ViewModel class to instantiate.
 * @param args - Arguments to pass to the ViewModel constructor.
 * @returns The instantiated ViewModel.
 *
 * @example
 * ```tsx
 * const vm = useViewModel(CounterViewModel, args);
 * ```
 */
export function useViewModel<
  TViewModelClass extends ViewModelConstructor<
    ConstructorParameters<TViewModelClass>,
    InstanceType<typeof ViewModelBase>
  >,
>(
  viewModelClass: TViewModelClass,
  ...args: ConstructorParameters<TViewModelClass>
): InstanceType<TViewModelClass> {
  const [, updateView] = useReducer((b) => !b, true);
  const vm = useMemo(
    () => new viewModelClass(...args),
    [viewModelClass, ...args],
  ) as InstanceType<TViewModelClass>;

  useEffect(() => {
    vm.addListener(updateView);
    return () => {
      vm.removeListener(updateView);
    };
  }, [vm]);

  return vm;
}
