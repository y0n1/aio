import { css } from "@emotion/css";
import type { Todo } from "../models/Todo.ts";
import { TodoListItem } from "./TodoListItem.tsx";

const styles = css`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 16rem;
  overflow-y: auto;

`;

type TodoListItemsProps = {
  todos: Readonly<Todo[]>;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
};

export const TodoListItems = (
  { todos, onToggle, onRemove }: TodoListItemsProps,
) => (
  <ul className={styles}>
    {todos.map((todo) => (
      <TodoListItem
        key={todo.id}
        todo={todo}
        onToggle={onToggle}
        onRemove={onRemove}
      />
    ))}
  </ul>
);
TodoListItems.displayName = "TodoListItems";
