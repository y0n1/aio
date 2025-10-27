import React, { useMemo } from "react";
import { Results, useListenable, useViewModel } from "@y0n1/react-mvvm";
import { TodoListViewModel } from "../view-models/TodoListViewModel.ts";
import { CountersStore } from "../../../data/stores/todos/CountersStore.ts";
import { TodosStoreLocal } from "../../../data/stores/todos/TodosStoreLocal.ts";
import { TodosServiceLocal } from "../../../data/services/TodosServiceLocal.ts";
import { TodoListView } from "./TodoListView.tsx";
import { TodoListLoadingView } from "./TodoListLoadingView.tsx";
import { TodoListErrorView } from "./TodoListErrorView.tsx";

export const TodoListScreen = (): React.ReactNode => {
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
  useListenable(viewModel.loadCmd);

  switch (viewModel.loadCmd.status) {
    case "idle":
    case "running":
      return <TodoListLoadingView />;
    case "done":
      if (Results.isSuccess(viewModel.loadCmd.result)) {
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
      } else {
        return (
          <TodoListErrorView
            errorMessage={viewModel.loadCmd.result!.error.message}
            onRetry={viewModel.loadCmd.execute}
          />
        );
      }
    default:
      return null;
  }
};
TodoListScreen.displayName = "TodoListScreen";
