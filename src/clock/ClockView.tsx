import { forwardRef } from "react";

type ClockViewProps = {
    hours: string;
    minutes: string;
    seconds?: string | null;
    separator?: string;
};

export const ClockView = forwardRef<HTMLDivElement, ClockViewProps>((
    { hours, minutes, seconds, separator = ":" }: ClockViewProps,
    ref,
) => (
    <div ref={ref}>
        <span>{hours}</span>
        <span>{separator}</span>
        <span>{minutes}</span>
        <span>{separator}</span>
        <span>{seconds}</span>
        <span>{separator}</span>
    </div>
));
ClockView.displayName = "ClockView";
