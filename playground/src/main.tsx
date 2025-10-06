import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { injectGlobal } from "@emotion/css";

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
injectGlobal`
  button {
    background: #3e4564;
    border: 1px solid #30364b;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    margin: 0 0.65rem;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    color: #e0e6ef;
    transition: background 0.3s, color 0.3s;
  }
  button:hover {
    background: #30364b;
  }
  button:active {
    background: #232634;
  }
  button > span {
    font-size: 1.5rem;
    font-weight: 500;
    color: #e0e6ef;
    transition: background 0.3s, color 0.3s;
  }`;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
