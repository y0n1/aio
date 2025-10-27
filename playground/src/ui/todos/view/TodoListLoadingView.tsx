import React from "react";
import { css, keyframes } from "@emotion/css";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const containerStyles = css`
  width: 100%;
  max-width: 30rem;
  min-width: 20rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding: 3.5rem 1.75rem;
  border-radius: 1rem;
  background: #1f2333;
  box-shadow: 0 12px 32px #0006;
  color: #f4f6ff;
`;

const spinnerStyles = css`
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #303851;
  border-top-color: #5c7cfa;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const textStyles = css`
  font-size: 1rem;
  color: #99a2cc;
  font-weight: 500;
`;

export const TodoListLoadingView = (): React.ReactNode => {
  return (
    <section
      className={containerStyles}
      aria-label="loading state"
      aria-live="polite"
    >
      <div className={spinnerStyles} role="status" aria-label="Loading" />
      <span className={textStyles}>Loading todos...</span>
    </section>
  );
};
TodoListLoadingView.displayName = "TodoListLoadingView";
