import { useViewModel } from "@y0n1/react-mvvm";
import { TodoListView } from "./TodoListView.tsx";
import { TodoListViewModel } from "../view-models/TodoListViewModel.ts";
import { TodosCountersStore } from "../../../data/stores/todos/TodosCountersStore.ts";
import { TodosStoreLocal } from "../../../data/stores/todos/TodosStoreLocal.ts";
import { useMemo } from "react";

export const TodoListAlternative = (): React.ReactNode => {
  // These could be injected using a DI container like InversifyJS (or @y0n1/react-ioc ;-P)
  const todosStore = useMemo(() => new TodosStoreLocal(), []);
  const countersStore = useMemo(() => new TodosCountersStore(), []);
  const vm = useViewModel(
    TodoListViewModel,
    "Let's write todos!",
    todosStore,
    countersStore,
  );

  return <TodoListView viewModel={vm} />;
};
TodoListAlternative.displayName = "TodoListAlternative";
