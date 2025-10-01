import { useViewModel } from "../lib/useViewModel.ts";
import { CounterView } from "./CounterView.tsx";
import { CounterViewModel } from "./CounterViewModel.ts";

export const CounterComponentMvvm = (): React.ReactNode => {
    const vm = useViewModel(CounterViewModel, 0);

    return vm
        ? (
            <CounterView
                count={vm.count}
                onIncrease={vm.increase}
                onDecrease={vm.decrease}
            />
        )
        : null;
};
CounterComponentMvvm.displayName = "CounterComponentMvvm";
