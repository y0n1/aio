import { ViewModel } from "../lib/ViewModel";

export class ClockViewModel extends ViewModel {
    static readonly displayName = "ClockViewModel";

    constructor(model: ClockModel) {
        super();
        Object.bindAllMethods(this);
    }

    get hours(): string {
        const date = new Date();
        return String(date.getHours()).padStart(2, "0");
    }

    get minutes(): string {
        const date = new Date();
        return String(date.getMinutes()).padStart(2, "0");
    }

    get seconds(): string {
        const date = new Date();
        return String(date.getSeconds()).padStart(2, "0");
    }
}
