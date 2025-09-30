export interface IPropertyChangedEventArgs<TSubject extends object> {
    subject: TSubject;
    propertyName: keyof TSubject;
}

export class PropertyChangedEvent<TSubject extends object>
    extends CustomEvent<IPropertyChangedEventArgs<TSubject>> {
    static readonly displayName = "PropertyChangedEvent";
    static readonly eventName = "PROPERTY_CHANGED";

    constructor(
        subject: TSubject,
        propertyName: keyof TSubject,
    ) {
        super(PropertyChangedEvent.eventName, {
            detail: { subject, propertyName },
        });
    }
}
