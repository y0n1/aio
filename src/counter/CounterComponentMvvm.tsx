// import { useViewModelFactory } from "../lib/useViewModelFactory.ts";
import { useViewModel } from "../lib/useViewModel.ts";
import { CounterView } from "./CounterView.tsx";
import { CounterViewModel } from "./CounterViewModel.ts";

// const initialValue = 0;

export const CounterComponentMvvm = (): React.ReactNode => {
    // const vm = useViewModelFactory(() => new CounterViewModel(initialValue), [
    //     CounterViewModel,
    //     initialValue,
    // ]);
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
