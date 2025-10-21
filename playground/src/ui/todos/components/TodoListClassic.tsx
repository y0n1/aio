import { useMemo, useState } from "react";
import { css } from "@emotion/css";
import { TodoListHeader } from "../view/TodoListHeader.tsx";
import { TodoListForm } from "../view/TodoListForm.tsx";
import { TodoListEmptyState } from "../view/TodoListEmptyState.tsx";
import { TodoListItems } from "../view/TodoListItems.tsx";
import type { TodoCounters } from "../../../domain/models/TodoCounters.ts";
import { Todo } from "../../../domain/models/Todo.ts";

export const TodoListClassic = (): React.ReactNode => {
  const vm = useTodoListViewModel();

  return (
    <TodoListView
      counters={vm.counts}
      draft={vm.draft}
      onDraftChange={vm.draftChange}
      todos={vm.todos}
      onAddTodo={vm.addTodo}
      onToggleTodo={vm.toggleTodo}
      onRemoveTodo={vm.removeTodo}
    />
  );
};
TodoListClassic.displayName = "TodoListClassic";

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
  onDraftChange: (text: string) => void;
  todos: Todo[];
  onAddTodo: VoidFunction;
  onToggleTodo: (id: string) => void;
  onRemoveTodo: (id: string) => void;
  counters: TodoCounters;
}

const TodoListView: React.FC<TodoListViewProps> = ({
  counters,
  draft,
  onAddTodo,
  onDraftChange,
  todos,
  onToggleTodo,
  onRemoveTodo,
}): React.ReactNode => (
  <section className={styles} aria-label="todo list">
    <TodoListHeader counters={counters} />
    <TodoListForm
      draft={draft}
      onSubmit={onAddTodo}
      onDraftChange={onDraftChange}
    />
    {todos.length === 0 ? <TodoListEmptyState /> : (
      <TodoListItems
        todos={todos}
        onToggle={onToggleTodo}
        onRemove={onRemoveTodo}
      />
    )}
  </section>
);
TodoListView.displayName = "TodoListView";

const useTodoListViewModel = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [draft, setDraft] = useState("");

  const counts = useMemo(() => {
    const completed = todos.filter((todo) => todo.completed).length;
    return {
      total: todos.length,
      completed,
      remaining: todos.length - completed,
    };
  }, [todos]);

  const addTodo = () => {
    const value = draft.trim();
    if (!value) {
      return;
    }

    setTodos((current) => [
      ...current,
      new Todo(crypto.randomUUID(), value, false),
    ]);
    setDraft("");
  };

  const toggleTodo = (id: string) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? new Todo(todo.id, todo.text, !todo.completed) : todo
      )
    );
  };

  const removeTodo = (id: string) => {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  };

  const draftChange = (value: string) => {
    setDraft(value);
  };

  return {
    todos,
    draft,
    counts,
    addTodo,
    toggleTodo,
    removeTodo,
    draftChange,
  };
};
