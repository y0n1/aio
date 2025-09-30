import { useEffect, useRef } from "react";
import type { ViewModel } from "./ViewModel.ts";
import type { PropertyChangedEvent } from "./PropertyChangedEvent.ts";

type ViewModelConstructor<T extends ViewModel> = {
  // deno-lint-ignore no-explicit-any
  new (...args: any[]): T;
  displayName: string;
};

export function useViewModel<T extends ViewModel>(
  viewModelClass: ViewModelConstructor<T>,
  ...args: ConstructorParameters<typeof viewModelClass>
): T {
  // const [, setState] = useState(true);

  // const updateView = useCallback(() => {
  //   setState((v) => !v);
  // }, []);

  const viewModel = useRef<T>(new viewModelClass(...args));

  useEffect(() => {
    if (!viewModel.current) {
      viewModel.current = new viewModelClass(...args);
    }

    // viewModel.current.onDidPropertyChange(updateView);
    viewModel.current.onDidPropertyChange(logChange);
    // updateView();

    return () => {
      if (viewModel.current) {
        // viewModel.current.dispose(updateView);
        viewModel.current.dispose(logChange);
        viewModel.current;
      }
    };
  }, []);

  return viewModel.current;
}

// deno-lint-ignore no-explicit-any
const logChange = (e: PropertyChangedEvent<any>) => {
  const { propertyName, subject } = e.detail;
  // For debugging purpose
  // eslint-disable-next-line no-console
  console.log(
    `[${subject.constructor.displayName}] changed its '${
      String(propertyName)
    }' property to ${subject[propertyName]}`,
  );
};
