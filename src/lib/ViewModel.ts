import type { IChangeNotifier } from "./IChangeNotifier.ts";
import { PropertyChangedEvent } from "./PropertyChangedEvent.ts";

type IPropertyChangedEventListener<TSubject extends object> = (
  ev: PropertyChangedEvent<TSubject>,
) => void;

export class ViewModel implements IChangeNotifier {
  readonly #eventTarget = new EventTarget();

  dispose(listener: IPropertyChangedEventListener<this>): void {
    this.#eventTarget.removeEventListener(
      PropertyChangedEvent.eventName,
      listener as EventListenerOrEventListenerObject,
    );
  }

  onDidPropertyChange(
    listener: IPropertyChangedEventListener<this>,
    options?: Pick<AddEventListenerOptions, "once">,
  ): void {
    this.#eventTarget.addEventListener(
      PropertyChangedEvent.eventName,
      listener as EventListenerOrEventListenerObject,
      options,
    );
  }

  notifyChange(
    subject: this,
    changedProperty: keyof this,
  ): void {
    const event = new PropertyChangedEvent(subject, changedProperty);
    this.#eventTarget.dispatchEvent(event);
  }
}
