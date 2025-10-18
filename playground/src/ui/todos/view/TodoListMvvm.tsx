import { useViewModel } from "@y0n1/react-mvvm";
import { TodoListView } from "./TodoListView.tsx";
import { TodoListViewModel } from "../view-models/TodoListViewModel.ts";
import { TodosCountersStore } from "../../../data/stores/todos/TodosCountersStore.ts";
import { TodosStoreLocal } from "../../../data/stores/todos/TodosStoreLocal.ts";
import { useMemo } from "react";

export const TodoListMvvm = (): React.ReactNode => {
  const todosStore = useMemo(() => new TodosStoreLocal(), []);
  const countersStore = useMemo(() => new TodosCountersStore(), []);
  const vm = useViewModel(
    TodoListViewModel,
    "Let's write todos!",
    todosStore,
    countersStore,
  );

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
