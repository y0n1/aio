import { useViewModel } from "../lib/useViewModel";
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
