export class ClockModel implements INotifyPropertyChanged {
    static readonly displayName = "ClockModel";

    constructor() {
        Object.bindAllMethods(this);
    }
}
