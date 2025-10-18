import { css } from "@emotion/css";

const emptyStyles = css`
  margin: 0;
  padding: 1.5rem;
  border-radius: 0.85rem;
  background: #24293b;
  border: 1px dashed #303851;
  color: #8a94ba;
  text-align: center;
`;

export const TodoListEmptyState = () => (
  <p className={emptyStyles}>Nothing here yet — add your first todo!</p>
);
TodoListEmptyState.displayName = "TodoListEmptyState";
