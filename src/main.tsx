import "./lib/polyfills.ts";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { injectGlobal } from "@emotion/css";

// Global dark mode theme
injectGlobal`
  html, body {
    background: #181a20;
    color: #e0e6ef;
    font-family: 'Inter', system-ui, sans-serif;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    transition: background 0.3s, color 0.3s;
  }
  a {
    color: #8ab4f8;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  ::selection {
    background: #26304a;
  }
  .App {
    max-width: 600px;
    margin: 2rem auto;
    background: #232634;
    border-radius: 1rem;
    box-shadow: 0 2px 16px #0008;
    padding: 2rem 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
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
  }
`;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />,
  </StrictMode>,
);
