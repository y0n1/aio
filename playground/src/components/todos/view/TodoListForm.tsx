import { css } from "@emotion/css";
import { TodoListButton } from "./TodoListButton.tsx";

const formStyles = css`
  display: flex;
  gap: 0.5rem;
  width: 100%;
`;

const srOnlyStyles = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const inputStyles = css`
  flex: 1;
  background: #2a3046;
  border: 1px solid #383f58;
  border-radius: 0.65rem;
  padding: 0.6rem 0.75rem;
  color: #e0e6ef;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #5c7cfa;
    box-shadow: 0 0 0 2px #5c7cfa33;
  }
`;

type TodoListViewFormProps = {
  draft: string;
  onSubmit: () => void;
  onDraftChange: (value: string) => void;
};

export const TodoListForm = ({
  draft,
  onSubmit,
  onDraftChange,
}: TodoListViewFormProps) => (
  <form
    id="TodoListForm"
    className={formStyles}
    onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }}
  >
    <label className={srOnlyStyles} htmlFor="TodoListForm-input">
      Add todo
    </label>
    <input
      id="TodoListForm-input"
      className={inputStyles}
      value={draft}
      placeholder="Try typing 'Ship feature PR'"
      onChange={(e) => onDraftChange(e.target.value)}
    />
    <TodoListButton type="submit">Add</TodoListButton>
  </form>
);
TodoListForm.displayName = "TodoListForm";
