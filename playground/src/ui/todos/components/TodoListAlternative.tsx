import { useMemo } from "react";
import { useViewModel } from "@y0n1/react-mvvm";
import { TodoListView } from "../view/TodoListView.tsx";
import { TodoListViewModel } from "../view-models/TodoListViewModel.ts";
import { CountersStore } from "../../../data/stores/todos/CountersStore.ts";
import { TodosStoreLocal } from "../../../data/stores/todos/TodosStoreLocal.ts";

export const TodoListAlternative = (): React.ReactNode => {
  // These could be injected using a DI container like InversifyJS (or @y0n1/react-ioc ;-P)
  const todosStore = useMemo(() => Object.seal(new TodosStoreLocal()), []);
  const countersStore = useMemo(() => Object.seal(new CountersStore()), []);
  const vm = useViewModel(
    TodoListViewModel,
    "Let's write todos!",
    todosStore,
    countersStore,
  );

  return <TodoListView viewModel={vm} />;
};
TodoListAlternative.displayName = "TodoListAlternative";
