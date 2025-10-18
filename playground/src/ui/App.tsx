import { css } from "@emotion/css";
import { TodoListMvvm } from "./todos/view/TodoListMvvm.tsx";

const styles = css`
  min-height: 24rem;
  background: #232634;
  border-radius: 1rem;
  box-shadow: 0 2px 16px #0008;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  height: 100%;
`;

export default function App(): React.ReactNode {
  return (
    <div className={styles}>
      <h1>MVVM Playground</h1>

      <TodoListMvvm />
    </div>
  );
}
