import { css } from "@emotion/css";
import { TodoListHeader } from "./TodoListHeader.tsx";
import { TodoListForm } from "./TodoListForm.tsx";
import { TodoListEmptyState } from "./TodoListEmptyState.tsx";
import { TodoListItems } from "./TodoListItems.tsx";
import type { Todo } from "../../../models/domain/Todo.ts";
import type { TodoCounters } from "../../../models/domain/TodoCounters.ts";

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
  onDraftChange: (value: string) => void;
  todos: Todo[];
  onAddTodo: () => void;
  onRemoveTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
  counters: TodoCounters;
}

export const TodoListView: React.FC<
  React.PropsWithChildren<TodoListViewProps>
> = (props): React.ReactNode => (
  <section className={styles} aria-label="todo list">
    <TodoListHeader counters={props.counters} />
    <TodoListForm
      draft={props.draft}
      onSubmit={props.onAddTodo}
      onDraftChange={props.onDraftChange}
    />
    {props.todos.length === 0 ? <TodoListEmptyState /> : (
      <TodoListItems
        todos={props.todos}
        onToggle={props.onToggleTodo}
        onRemove={props.onRemoveTodo}
      />
    )}
  </section>
);

TodoListView.displayName = "TodoListView";
