import { useEffect, useRef, useState } from "react";
import type { ChangeNotifier } from "./ChangeNotifier.ts";
import type { ChangeEvent } from "./ChangeEvent.ts";
import type { IChangeNotifier } from "./IChangeNotifier.ts";
import type { IDisposable } from "./IDisposable.ts";

type ViewModelClassConstructor<
  T extends IChangeNotifier & IDisposable,
  TArgs extends unknown[],
> = new (
  ...args: TArgs
) => T;

export function useViewModel<
  TViewModelClass extends ViewModelClassConstructor<
    ChangeNotifier,
    ConstructorParameters<TViewModelClass>
  >,
>(
  viewModelClass: TViewModelClass,
  ...args: ConstructorParameters<TViewModelClass>
): InstanceType<TViewModelClass> | null {
  const [, setState] = useState(true);
  const updateView = () => setState((s) => !s);

  const viewModel = useRef<InstanceType<TViewModelClass> | null>(
    new viewModelClass(...args) as InstanceType<
      TViewModelClass
    >,
  );
  viewModel.current!.addListener(updateView);
  viewModel.current!.addListener(logChange);

  useEffect(() => {
    return () => {
      // viewModel.current?.removeListener(updateView);
      viewModel.current?.dispose();
      viewModel.current = null;
    };
  }, []);

  console.log(
    `ID: ${
      (viewModel.current as unknown as { instanceId: string }).instanceId
    } | isDisposed: ${viewModel.current?.isDisposed}`,
  );
  return viewModel.current;
}

const logChange = (
  e: ChangeEvent<object, Array<[string, unknown]>>,
) => {
  const { invoker, changes } = e.detail;
  console.log(
    `<${invoker.constructor.displayName} ${
      changes.map(([prop, value]) => `${prop}="${JSON.stringify(value)}"`)
    } />`,
  );
};
