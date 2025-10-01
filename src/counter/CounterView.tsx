import { forwardRef } from "react";

interface CounterViewProps {
    count: number;
    onIncrease: () => void;
    onDecrease: () => void;
}

export const CounterView = forwardRef<HTMLDivElement, CounterViewProps>((
    props,
    ref,
) => (
    <div ref={ref}>
        <button type="button" onClick={props.onDecrease}>-</button>
        <span>{props.count}</span>
        <button type="button" onClick={props.onIncrease}>+</button>
    </div>
));
CounterView.displayName = "CounterView";
