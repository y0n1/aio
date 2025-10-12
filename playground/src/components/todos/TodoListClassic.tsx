import { type ReactNode } from "react";
import { useTodoListViewModel } from "./useTodoListViewModel.ts";
import { TodoListView } from "./view/TodoListView.tsx";

export const TodoListClassic = (): ReactNode => {
  const vm = useTodoListViewModel();

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
