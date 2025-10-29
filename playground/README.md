# React MVVM Playground

A demonstration application showcasing the `@y0n1/react-mvvm` package and the
Model-View-ViewModel (MVVM) pattern in React. This playground implements a Todo
List application using MVVM architecture to demonstrate real-world usage of
ViewModels, Commands, and the separation of concerns between UI and business
logic.

## What's Inside

This playground demonstrates:

- **ViewModels** - Encapsulation of business logic and state management separate
  from UI components
- **Commands** - Lifecycle management for async operations (loading, error
  handling)
- **Change Notifications** - Reactive updates using the `ChangeNotifier` pattern
- **Stores & Services** - Data layer separation with clear boundaries
- **Result Types** - Type-safe error handling without exceptions
- **Comparison** - Classic React (hooks) vs MVVM implementation side-by-side

## Quick Start

### Prerequisites

- [Deno](https://deno.land/) (recommended) or Node.js 18+

### Run the Playground

```bash
# 
# Or with Deno
deno task dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## Project Structure

```
playground/
├── src/
│   ├── models/           # Domain models and API models
│   │   ├── domain/       # Business entities (Todo, TodoCounters)
│   │   └── apis/         # API response models
│   ├── data/             # Data layer
│   │   ├── services/     # Data fetching/persistence services
│   │   └── stores/       # State management stores
│   └── ui/               # Presentation layer
│       └── todos/
│           ├── components/       # React components
│           ├── view-models/      # ViewModels (business logic)
│           └── view/             # Presentational components
```

## MVVM in Action

### The ViewModel

ViewModels encapsulate all business logic, state management, and side effects:

```typescript
class TodoListViewModel extends ChangeNotifier {
  #draft: string;
  #todosStore: ITodosStore;

  get todos(): Todo[] {
    return this.#todosStore.todos;
  }

  addTodo(): void {
    if (!this.#draft.trim()) return;

    this.#todosStore.add(new Todo(crypto.randomUUID(), this.#draft, false));
    this.#draft = "";
    this.notifyListeners(); // Trigger UI update
  }

  // ... more methods
}
```

### The View

React components become pure presentational layers:

```tsx
export const TodoListMvvm = (): React.ReactNode => {
  const vm = useViewModel(TodoListViewModel, todosStore, countersStore);

  return (
    <TodoListView
      todos={vm.todos}
      draft={vm.draft}
      onAddTodo={vm.addTodo}
      onDraftChange={vm.draftChange}
    />
  );
};
```

## Key Features Demonstrated

### 1. **Separation of Concerns**

Business logic lives in ViewModels, not in React components. This makes logic
testable without rendering components.

### 2. **Commands for Async Operations**

Commands automatically track execution state (running, completed, failed):

```typescript
const loadCmd = new Command(() => todosService.fetchAll());
// UI can react to loadCmd.status: "idle" | "running" | "done" | "failed"
```

### 3. **Type-Safe Error Handling**

Using `Result<T, E>` instead of try-catch:

```typescript
const result = todosStore.find(id);
if (!result.ok) {
  console.warn(result.error);
  return;
}
const todo = result.value;
```

### 4. **Automatic Cleanup**

ViewModels are automatically disposed when components unmount, preventing memory
leaks.

## Comparisons

The playground includes both:

- **Classic React** implementation (`TodoListClassic.tsx`) - using hooks and
  local state
- **MVVM** implementation (`TodoListMvvm.tsx`) - using ViewModels

Compare them to see the architectural differences and benefits of MVVM for
larger applications.

## Learn More

- [@y0n1/react-mvvm Documentation](../packages/react-mvvm/README.md)
- [MVVM Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel)
- [Flutter App Architecture Guide](https://docs.flutter.dev/app-architecture)
  (inspiration)

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **@y0n1/react-mvvm** - MVVM primitives for React
- **Deno** - Runtime and package management (optional)

## Development

Everything is already wired up, if you use VSCode. Just Clone this repository,
and hit `F5`.

```bash
# Run tests
deno task test

# Format code
deno task format

# Lint code
deno task lint
```

## License

Apache 2.0 © y0n1
