import { css } from "@emotion/css";
import type { Todo } from "../models/Todo.ts";
import type { TodoCounters } from "../models/TodoCounters.ts";
import { TodoListHeader } from "./TodoListHeader.tsx";
import { TodoListForm } from "./TodoListForm.tsx";
import { TodoListEmptyState } from "./TodoListEmptyState.tsx";
import { TodoListItems } from "./TodoListItems.tsx";

const styles = css`
  width: 100%;
  max-width: 30rem;
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

interface TodoListViewProps {
  counters: Readonly<TodoCounters>;
  draft: string;
  onDraftChange: (value: string) => void;
  todos: Readonly<Todo[]>;
  onAdd: () => void;
  onRemove: (id: number) => void;
  onToggle: (id: number) => void;
}

export const TodoListView = (
  {
    counters,
    draft,
    onDraftChange,
    todos,
    onAdd,
    onRemove,
    onToggle,
  }: TodoListViewProps,
): React.ReactNode => (
  <section className={styles} aria-label="todo list">
    <TodoListHeader counters={counters} />
    <TodoListForm
      draft={draft}
      onSubmit={onAdd}
      onDraftChange={onDraftChange}
    />
    {todos.length === 0 ? <TodoListEmptyState /> : (
      <TodoListItems
        todos={todos}
        onToggle={onToggle}
        onRemove={onRemove}
      />
    )}
  </section>
);
TodoListView.displayName = "TodoListView";
