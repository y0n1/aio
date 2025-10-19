# @y0n1/react-mvvm

Building React features with the Model-View-ViewModel pattern in TypeScript.
This package provides a lightweight set of primitives for creating view-models
that manage state, notify interested listeners, and integrate seamlessly with
React components.

## Features

- `useViewModel` React hook keeps a single view-model instance alive for the
  lifetime of a component.
- `ChangeNotifier` base class tracks listeners and emits change notifications.
- `Observable<T>` wraps mutable values with change notifications and typed
  subscriptions.
- `Results` helpers model success/failure outcomes without exceptions.
- Designed for Deno-first projects while remaining compatible with modern
  JavaScript/TypeScript frameworks and toolchains.

## Installation

The package is published for Deno via `jsr` and can be added to your `deno.json`
(or `deno.jsonc`) import map:

```jsonc
{
  "imports": {
    "@y0n1/react-mvvm": "jsr:@y0n1/react-mvvm"
  }
}
```

When working in a Node, Bun, or Vite project, you can install the npm
distribution instead:

```sh
npm install @y0n1/react-mvvm
```

After installation, import the APIs you need directly from the package entry
point (`mod.ts` for Deno or `dist/index.js` for npm-based builds).

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

The `useViewModel` hook constructs the view-model once, subscribes the component
to future notifications, and automatically disposes the instance when the
component unmounts. Any method that mutates state should call
`notifyListeners()` so the view re-renders.

## API Overview

- `useViewModel(ctor, ...args)` – creates and returns a persistent view-model
  instance.
- `useRerender()` – internal hook used for triggering renders; exported in case
  you need a lightweight rerender helper.
- `ChangeNotifier` – base class with listener management, `dispose()`, and
  `notifyListeners()`.
- `Observable<T>` – observable value with subscription support and optional
  one-time listeners.
- `Results` – `Success` / `Failure` tagged unions plus helpers for constructing
  them.
- Core interfaces: `IListenable`, `IAddListenerOptions`, and `IDisposable`.

Refer to the source files under `internal/` for more details and inline
documentation.

## Testing

Run the package test suite with Deno:

```sh
deno task test
```

The test setup relies on `linkedom` to provide a DOM environment for React
testing utilities.

## License

Apache 2.0 © y0n1
