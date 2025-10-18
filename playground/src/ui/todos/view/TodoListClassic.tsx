import { TodoListView } from "./TodoListView.tsx";
import { useTodoListClassicViewModel } from "../view-models/useTodoListViewModel.ts";

export const TodoListClassic = (): React.ReactNode => {
  const vm = useTodoListClassicViewModel();

  return (
    <TodoListView
      counters={vm.counts}
      draft={vm.draft}
      onDraftChange={vm.handleDraftChange}
      todos={vm.todos}
      onAdd={vm.addTodo}
      onToggle={vm.toggleTodo}
      onRemove={vm.removeTodo}
    />
  );
};
TodoListClassic.displayName = "TodoListClassic";
