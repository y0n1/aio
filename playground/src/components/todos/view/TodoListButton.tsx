import { css } from "@emotion/css";

const styles = css`
  background: #3e4564;
  border: 1px solid #30364b;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #e0e6ef;
  transition: background 0.3s, color 0.3s;

  &:hover {
    background: #30364b;
  }
  &:active {
    background: #232634;
  }
  & > span {
    font-size: 1.5rem;
    font-weight: 500;
    color: #e0e6ef;
    transition: background 0.3s, color 0.3s;
  }
`;

export const TodoListButton = (
  props: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">,
) => {
  return <button className={styles} {...props}>{props.children}</button>;
};
TodoListButton.displayName = "TodoListButton";
