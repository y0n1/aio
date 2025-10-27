import { css, cx } from "@emotion/css";
import type { Todo } from "../../../models/domain/Todo.ts";
import { TodoListButton } from "./TodoListButton.tsx";

const itemStyles = css`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #262c40;
  border-radius: 0.85rem;
  border: 1px solid #303851;
`;

const checkboxStyles = css`
  width: 1.1rem;
  height: 1.1rem;
  cursor: pointer;
  accent-color: #5c7cfa;
`;

const todoTextStyles = css`
  flex: 1;
  font-size: 1rem;
  color: #e8ecf8;
  word-break: break-word;
  transition: opacity 0.2s ease;
`;

const completedStyles = css`
  opacity: 0.5;
  text-decoration: line-through;
`;

type TodoListItemProps = {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

export const TodoListItem = (
  { todo, onToggle, onRemove }: TodoListItemProps,
) => (
  <li className={itemStyles}>
    <input
      className={checkboxStyles}
      form="TodoListForm"
      type="checkbox"
      checked={todo.completed}
      onChange={() => onToggle(todo.id)}
      aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
    />
    <span className={cx(todoTextStyles, todo.completed && completedStyles)}>
      {todo.text}
    </span>
    <TodoListButton
      type="button"
      form="TodoListForm"
      onClick={() => onRemove(todo.id)}
    >
      Remove
    </TodoListButton>
  </li>
);
TodoListItem.displayName = "TodoListItem";
