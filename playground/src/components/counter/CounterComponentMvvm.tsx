import { useViewModel } from "@y0n1/react-mvvm";
import { CounterView } from "./CounterView.tsx";
import { CounterViewModel } from "./CounterViewModel.ts";

export const CounterComponentMvvm = (): React.ReactNode => {
    const vm = useViewModel(CounterViewModel);

    return (
        <CounterView
            count={vm.count}
            onIncrease={vm.increase}
            onDecrease={vm.decrease}
        />
    );
};
CounterComponentMvvm.displayName = "CounterComponentMvvm";
