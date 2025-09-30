import { CounterView } from "./CounterView.tsx";
import { useViewModel } from "../lib/useViewModel.ts";
import { CounterViewModel } from "./CounterViewModel.ts";

export const CounterComponentV2 = (): React.ReactNode => {
    const vm = useViewModel(CounterViewModel, 0);

    return (
        <CounterView
            count={vm.count}
            onIncrease={vm.increase}
            onDecrease={vm.decrease}
        />
    );
};
CounterComponentV2.displayName = "CounterComponentV2";
