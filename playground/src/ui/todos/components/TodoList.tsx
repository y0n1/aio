import React, { useMemo } from "react";
import { TodoListViewModel } from "../view-models/TodoListViewModel.ts";
import { CountersStore } from "../../../data/stores/todos/CountersStore.ts";
import { TodosStoreLocal } from "../../../data/stores/todos/TodosStoreLocal.ts";
import { TodosServiceLocal } from "../../../data/services/TodosServiceLocal.ts";
import { TodoListView } from "../view/TodoListView.tsx";
import { useViewModel } from "@y0n1/react-mvvm";

export const TodoList = (): React.ReactNode => {
  const todosService = useMemo(() => Object.seal(new TodosServiceLocal()), []);
  const todosStore = useMemo(
    () => Object.seal(new TodosStoreLocal(todosService)),
    [],
  );
  const countersStore = useMemo(() => Object.seal(new CountersStore()), []);
  const viewModel = useViewModel(
    TodoListViewModel,
    "Let's write todos!",
    todosStore,
    countersStore,
  );

  return (
    <TodoListView
      counters={viewModel.counters}
      draft={viewModel.draft}
      onDraftChange={viewModel.draftChange}
      todos={viewModel.todos}
      onAddTodo={viewModel.addTodo}
      onToggleTodo={viewModel.toggleTodo}
      onRemoveTodo={viewModel.removeTodo}
    />
  );
};
TodoList.displayName = "TodoList";
