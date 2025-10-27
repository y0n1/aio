import React from "react";
import { css } from "@emotion/css";
import { TodoListButton } from "./TodoListButton.tsx";

const containerStyles = css`
  width: 100%;
  max-width: 30rem;
  min-width: 20rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2.5rem 1.75rem;
  border-radius: 1rem;
  background: #1f2333;
  box-shadow: 0 12px 32px #0006;
  color: #f4f6ff;
  text-align: center;
`;

const iconStyles = css`
  font-size: 3rem;
  line-height: 1;
  opacity: 0.9;
`;

const titleStyles = css`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #f4f6ff;
`;

const messageContainerStyles = css`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`;

const messageStyles = css`
  font-size: 0.95rem;
  color: #99a2cc;
  line-height: 1.5;
`;

const codeStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: auto;
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  background: #262c40;
  border: 1px solid #303851;
  border-radius: 0.85rem;
  color: #e8ecf8;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.85rem;
  word-break: break-word;
  text-align: left;
`;

interface TodoListErrorViewProps {
  errorMessage: string;
  onRetry: () => void;
}

export const TodoListErrorView = (
  props: TodoListErrorViewProps,
): React.ReactNode => {
  return (
    <section className={containerStyles} aria-label="error state">
      <div className={iconStyles}>⚠️</div>
      <div className={messageContainerStyles}>
        <h2 className={titleStyles}>Unable to Load Todos</h2>
        <p className={messageStyles}>
          Something went wrong while loading your todos.
        </p>
        <code className={codeStyles}>{props.errorMessage}</code>
      </div>
      <TodoListButton type="button" onClick={props.onRetry}>
        Try Again
      </TodoListButton>
    </section>
  );
};
TodoListErrorView.displayName = "TodoListErrorView";
