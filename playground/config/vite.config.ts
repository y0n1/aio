import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import denoWorkspace from "@y0n1/vite-plugin-deno-workspace";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@y0n1/react-mvvm": path.resolve(
        "..",
        "packages",
        "react-mvvm",
        "mod.ts",
      ),
    },
  },
  plugins: [
    denoWorkspace({
      workspacePath: path.resolve("..", "deno.jsonc"),
    }),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
});
