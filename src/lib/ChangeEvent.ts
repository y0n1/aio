export class ChangeEvent<TInvoker extends object = object, TChanges = unknown[]>
    extends CustomEvent<{ invoker: TInvoker; changes: TChanges }> {
    static displayName = "ChangeEvent";
    static eventName = "SYNTH_CHANGE";

    constructor(invoker: TInvoker, changes: TChanges) {
        super(ChangeEvent.eventName, {
            detail: { invoker, changes },
        });
    }
}
