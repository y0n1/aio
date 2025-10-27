# @y0n1/react-mvvm

A library for building React applications using the well-established
Model-View-ViewModel pattern. This package provides a lightweight set of
primitives for creating view-models that integrate seamlessly with React.

## Motivation

This library was largely inspired by
[Flutter's App architecture guide](https://docs.flutter.dev/app-architecture). I
strongly encourage you to invest some of your time and read it.

React is a powerful view library, not a full framework—leaving code organization
choices open-ended. As projects grow, app logic and "helper" functions easily
become scattered with no clear boundaries or domain ownership, and
object-oriented patterns are rarely practical in idiomatic React code. By
bridging the gap between idiomatic React code and the proven
Model-View-ViewModel (MVVM) pattern (as used in modern frameworks like Flutter,
SwiftUI, Angular, Jetpack Compose, .NET MAUI, and many others) you'll be able to
regain control over you application architecture, build scalable, maintainable
and well-structured enterprise-grade React applications.

## Features

- `ChangeNotifier` base class tracks listeners and emits change notifications.
- `useViewModel` A react hook that helps initialize and dispose a view-model for
  the lifetime of a component.
- `useListenable` A convenience react hook for updating components whenever a
  [IListenable](./core/listenable.ts) notifies of changes.
- `Observable<T>` wraps mutable values with change notifications and typed
  subscriptions.
- `Results` helps model success/failure outcomes without exceptions.
- `Command` encapsulates the lifecycle of an action, managing its execution
  state and result for use with UI components.
- Designed for Deno-first projects while remaining compatible with modern
  JavaScript/TypeScript frameworks and toolchains.

## Quick Start

Create a view-model by extending `ChangeNotifier` and expose the state your
component cares about:

```ts
import { ChangeNotifier, useViewModel } from "@y0n1/react-mvvm";

class CounterViewModel extends ChangeNotifier {
  #count = 0;

  get count(): number {
    return this.#count;
  }

  constructor() {
    super();
  }

  increment(): void {
    this.#count += 1;

    // Use this method to notify React of changes.
    // Must be called after all state modifications are done.
    this.notifyListeners();
  }
}

export function Counter(): React.ReactNode {
  const vm = useViewModel(CounterViewModel);

  return (
    <button onClick={vm.increment}>
      Count: {vm.count}
    </button>
  );
}
```

The `useViewModel` hook constructs the view-model once, subscribes the
component's state to future notifications, and automatically disposes the
instance when the component unmounts. **Any method that mutates state should
call `notifyListeners()` so the view re-renders**.

## Testing

Run the package test suite with Deno:

```sh
deno task test
```

The test uses `linkedom` to provide a DOM environment for React testing
utilities.

## License

Apache 2.0 © y0n1
