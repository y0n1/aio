import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import denoWorkspacePlugin from "@y0n1/vite-plugin-deno-workspace";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    denoWorkspacePlugin(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
});
