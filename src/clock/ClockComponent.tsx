import { useViewModel } from "../lib/useViewModelWithStore.ts";
import { ClockView } from "./ClockView";
import { ClockViewModel } from "./ClockViewModel";

export const ClockComponent = () => {
    const viewModel = useViewModel(ClockViewModel);
    return (
        <ClockView
            hours={viewModel.hours}
            minutes={viewModel.minutes}
            seconds={viewModel.seconds}
        />
    );
};
