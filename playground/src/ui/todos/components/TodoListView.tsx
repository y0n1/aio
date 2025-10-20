import { css } from "@emotion/css";
import { TodoListHeader } from "../view/TodoListHeader.tsx";
import { TodoListForm } from "../view/TodoListForm.tsx";
import { TodoListEmptyState } from "../view/TodoListEmptyState.tsx";
import { TodoListItems } from "../view/TodoListItems.tsx";
import type { TodoCounters } from "../../../domain/models/TodoCounters.ts";
import type { Todo } from "../../../domain/models/Todo.ts";

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

interface TodoListViewProps {
  draft: string;
  draftChange: (text: string) => void;
  todos: Todo[];
  addTodo: VoidFunction;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  counters: TodoCounters;
}

export const TodoListView: React.FC<TodoListViewProps> = ({
  counters,
  draft,
  addTodo,
  draftChange,
  todos,
  toggleTodo,
  removeTodo,
}): React.ReactNode => (
  <section className={styles} aria-label="todo list">
    <TodoListHeader counters={counters} />
    <TodoListForm
      draft={draft}
      onSubmit={addTodo}
      onDraftChange={draftChange}
    />
    {todos.length === 0 ? <TodoListEmptyState /> : (
      <TodoListItems
        todos={todos}
        onToggle={toggleTodo}
        onRemove={removeTodo}
      />
    )}
  </section>
);
TodoListView.displayName = "TodoListView";
