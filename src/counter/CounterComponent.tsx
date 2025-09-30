import { CounterView } from "./CounterView.tsx";
import { useCounterViewModel } from "./useCounterViewModel.ts";

export const CounterComponent = (): React.ReactElement => {
    const vm = useCounterViewModel();

    return (
        <CounterView
            count={vm.count}
            onIncrease={vm.increase}
            onDecrease={vm.decrease}
        />
    );
};
CounterComponent.displayName = "CounterComponent";
