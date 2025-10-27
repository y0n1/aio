import React, { useMemo } from "react";
import { TodoListViewModel } from "../view-models/TodoListViewModel.ts";
import { CountersStore } from "../../../data/stores/todos/CountersStore.ts";
import { TodosStoreLocal } from "../../../data/stores/todos/TodosStoreLocal.ts";
import { TodosServiceLocal } from "../../../data/services/TodosServiceLocal.ts";
import { TodoListView } from "../view/TodoListView.tsx";
import { Results, useListenable, useViewModel } from "@y0n1/react-mvvm";
import { TodoListLoadingView } from "../view/TodoListLoadingView.tsx";
import { TodoListErrorView } from "../view/TodoListErrorView.tsx";

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
TodoList.displayName = "TodoList";

const Logger: React.FC<{ args: unknown[] }> = (props): React.ReactNode => {
  console.log(props.args);
  return null;
};
Logger.displayName = "Logger";
