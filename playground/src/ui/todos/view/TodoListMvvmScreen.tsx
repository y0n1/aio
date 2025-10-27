import { useMemo } from "react";
import { useViewModel } from "@y0n1/react-mvvm";
import { TodoListView } from "./TodoListView.tsx";
import { TodoListViewModel } from "../view-models/TodoListViewModel.ts";
import { CountersStore } from "../../../data/stores/todos/CountersStore.ts";
import { TodosStoreLocal } from "../../../data/stores/todos/TodosStoreLocal.ts";
import { TodosServiceLocal } from "../../../data/services/TodosServiceLocal.ts";

export const TodoListMvvmScreen = (): React.ReactNode => {
  // These could be injected using a DI container like InversifyJS (or @y0n1/react-ioc ;-P)
  const todosService = useMemo(() => Object.seal(new TodosServiceLocal()), []);
  const todosStore = useMemo(
    () => Object.seal(new TodosStoreLocal(todosService)),
    [],
  );
  const countersStore = useMemo(() => Object.seal(new CountersStore()), []);
  const vm = useViewModel(
    TodoListViewModel,
    "Let's write todos!",
    todosStore,
    countersStore,
  );

  return (
    <TodoListView
      counters={vm.counters}
      draft={vm.draft}
      onDraftChange={vm.draftChange}
      todos={vm.todos}
      onAddTodo={vm.addTodo}
      onToggleTodo={vm.toggleTodo}
      onRemoveTodo={vm.removeTodo}
    />
  );
};
TodoListMvvmScreen.displayName = "TodoListMvvmScreen";
