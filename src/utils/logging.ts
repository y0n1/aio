import type { ChangeEvent } from "../lib/ChangeEvent.ts";

export const logChange = (
    e: ChangeEvent<object, Array<[string, unknown]>>,
) => {
    const { invoker, changes } = e.detail;
    console.log(
        `<${invoker.constructor.displayName} ${
            changes.map(([prop, value]) => `${prop}="${JSON.stringify(value)}"`)
        } />`,
    );
};
