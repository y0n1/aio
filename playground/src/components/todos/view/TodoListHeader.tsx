import { css } from "@emotion/css";
import type { TodoCounters } from "../models/TodoCounters.ts";

const style = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  text-align: left;

  & > h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  & > span {
    font-size: 0.9rem;
    color: #99a2cc;
  }
`;

type TodoListHeaderProps = {
  counters: Readonly<TodoCounters>;
};

export const TodoListHeader = ({ counters }: TodoListHeaderProps) => (
  <header className={style}>
    <h2>Todo List</h2>
    <span>
      {counters.completed} completed • {counters.total} total
    </span>
  </header>
);
TodoListHeader.displayName = "TodoListHeader";
