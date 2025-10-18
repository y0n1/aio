import { useViewModel } from "@y0n1/react-mvvm";
import { TodoListView } from "./TodoListView.tsx";
import { TodoListViewModel } from "../view-models/TodoListViewModel.ts";

export const TodoListMvvm = (): React.ReactNode => {
  const vm = useViewModel(TodoListViewModel, "Let's write todos!");

  return (
    <TodoListView
      todos={vm.todos}
      onAdd={vm.addTodo}
      onRemove={vm.removeTodo}
      onToggle={vm.toggleTodo}
      draft={vm.draft}
      onDraftChange={vm.draftChange}
      counters={vm.counters}
    />
  );
};
TodoListMvvm.displayName = "TodoListMvvm";
