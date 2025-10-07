import type { ChangeEvent } from "../core/ChangeEvent.ts";

export const logChange = (
    e: ChangeEvent<object, Array<[string, unknown]>>,
) => {
    const { invoker, changes } = e;
    console.log(
        `<${invoker.constructor.displayName} ${
            changes.map(([prop, value]) => `${prop}="${JSON.stringify(value)}"`)
        } />`,
    );
};
