import { useMemo } from "react";
import { css } from "@emotion/css";
import { useViewModel } from "@y0n1/react-mvvm";
import { TodoListHeader } from "../view/TodoListHeader.tsx";
import { TodoListForm } from "../view/TodoListForm.tsx";
import { TodoListEmptyState } from "../view/TodoListEmptyState.tsx";
import { TodoListItems } from "../view/TodoListItems.tsx";
import { TodoListViewModel } from "../view-models/TodoListViewModel.ts";
import { CountersStore } from "../../../data/stores/todos/CountersStore.ts";
import { TodosStoreLocal } from "../../../data/stores/todos/TodosStoreLocal.ts";

const styles = css`
  width: 100%;
  max-width: 30rem;
  min-width: 20rem;
  max-height: calc(100% - 8rem);
  min-height: 16rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.75rem;
  border-radius: 1rem;
  background: #1f2333;
  box-shadow: 0 12px 32px #0006;
  color: #f4f6ff;
`;

export const TodoList = (): React.ReactNode => {
  const todosStore = useMemo(() => Object.seal(new TodosStoreLocal()), []);
  const countersStore = useMemo(() => Object.seal(new CountersStore()), []);
  const viewModel = useViewModel(
    TodoListViewModel,
    "Let's write todos!",
    todosStore,
    countersStore,
  );

  return (
    <section className={styles} aria-label="todo list">
      <TodoListHeader counters={viewModel.counters} />
      <TodoListForm
        draft={viewModel.draft}
        onSubmit={viewModel.addTodo}
        onDraftChange={viewModel.draftChange}
      />
      {viewModel.todos.length === 0 ? <TodoListEmptyState /> : (
        <TodoListItems
          todos={viewModel.todos}
          onToggle={viewModel.toggleTodo}
          onRemove={viewModel.removeTodo}
        />
      )}
    </section>
  );
};
TodoList.displayName = "TodoList";
