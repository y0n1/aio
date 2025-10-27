# Agent Guidelines for react-mvvm Package

## Conception

You are a professional developer, well-acquainted with the following principles
and technologies.

### Principles

- Object-oriented design
- Functional programming
- Test-driven development
- MVVM (Model-View-ViewModel) architecture pattern

### Technologies

- React, TypeScript, JavaScript, HTML, CSS
- Deno, Node.js
- @testing-library/react, linkedom

## Code Organization Guidelines

- React-related modules (hooks, components) must be placed inside the
  [react](./react/) directory.
- Core functionality (ViewModels, Commands, Observables) lives inside the
  [core](./core/) directory.
- Testing functionality (utility functions, fakes, mocks, test doubles, etc.)
  must be placed inside the [tests](./tests/) directory.
- Files beginning with an underscore are not meant to be published. Therefore
  they won't be included in the published artifact.
- Public API exports are defined in [mod.ts](./mod.ts).

## MVVM Pattern Guidelines

### ViewModels

- ViewModels should extend `ChangeNotifier` to provide change notification
  capabilities.
- ViewModels must call `notifyListeners()` after any state mutation.
- ViewModels should implement the `IDisposable` interface and clean up resources
  in `dispose()`.
- Use private fields (with `#` syntax) for internal state.
- Expose only necessary public getters and methods to the view.
- ViewModels should not import or depend on React directly.

### Commands

- Use the `Command` class for async operations (e.g., API calls, form
  submissions).
- Commands automatically track execution state (running, completed, failed).
- Commands should return `Result<T, E>` types for explicit error handling.
- Subscribe to command changes with `useListenable()` to update UI based on
  execution state.

### Observables

- Use `Observable<T>` for reactive state management within ViewModels.
- Use `useObservable()` hook to subscribe to observables in React components.
- Observables should be disposed when no longer needed.

### Results

- Use `Result<T, E>` to model success/failure outcomes without exceptions.
- Prefer pattern matching with `match()` method for handling results.
- Results make error handling explicit and type-safe.

## Naming Conventions

- ViewModels: `*ViewModel` (e.g., `TodoListViewModel`, `CounterViewModel`)
- Test files: `_*.test.ts` or `_*.test.tsx` (e.g., `_use_listenable.test.tsx`)
- Private fields: Use `#` prefix (e.g., `#count`, `#todos`)
- Interfaces: Use `I` prefix when appropriate (e.g., `IListenable`,
  `IDisposable`)
- React hooks: Use `use*` prefix (e.g., `useViewModel`, `useListenable`)

## Testing Guidelines

### General Testing Practices

- Test files are not meant to be published; they follow the name of the module
  being tested, ending with a `.test.ts` or `.test.tsx` (when JSX is used inside
  the test suite) suffix (e.g., `_use_listenable.test.tsx` and
  `useListenable.ts`, or `_use_view_model.test.ts` and `use_view_model.ts`).
- Tests use `Deno.test` with `@std/assert` and the `linkedom` package to provide
  a DOM environment for React testing utilities.
- React tests use `@testing-library/react` with `renderHook` for individual hook
  testing.
- Tests are organized into clear sections with descriptive comments.
- Tests are very comprehensive, covering subscriptions, rerenders, memory leaks,
  StrictMode, edge cases, error scenarios, etc.

### ViewModel Testing

- Test ViewModels in isolation without rendering React components when possible.
- Verify that `notifyListeners()` is called after state changes.
- Test disposal and cleanup of resources.
- Mock dependencies (services, stores) appropriately.

### Hook Testing

- Use `renderHook` from `@testing-library/react` for testing custom hooks.
- Test subscription behavior and cleanup on unmount.
- Verify rerenders occur when expected.
- Test React StrictMode compatibility (double invocation of effects).

### Memory Leak Testing

- Verify that subscriptions are properly cleaned up.
- Ensure ViewModels are disposed when components unmount.
- Check for lingering listeners after disposal.

## Memory Management Guidelines

- Always dispose of ViewModels when components unmount (handled automatically by
  `useViewModel`).
- Clean up Observable subscriptions when no longer needed.
- Remove listeners from Listenables in cleanup functions.
- Commands should be disposed if they hold resources.
- Test suites should verify proper cleanup to prevent memory leaks.

## Example Patterns

### Basic ViewModel

```typescript
class MyViewModel extends ChangeNotifier {
  #data: string[] = [];

  get data(): string[] {
    return this.#data;
  }

  constructor(private service: IMyService) {
    super();
  }

  async loadData(): Promise<void> {
    this.#data = await this.service.fetchData();
    this.notifyListeners();
  }

  override dispose(): void {
    // Clean up resources
    super.dispose();
  }
}
```

### ViewModel with Command

```typescript
class MyViewModel extends ChangeNotifier {
  readonly loadCommand: Command<void, string[]>;

  get data(): string[] {
    return this.loadCommand.result?.valueOrNull() ?? [];
  }

  constructor(private service: IMyService) {
    super();
    this.loadCommand = new Command(() => this.service.fetchData());
  }

  override dispose(): void {
    this.loadCommand.dispose();
    super.dispose();
  }
}
```
