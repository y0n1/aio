import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import deno from "@deno/vite-plugin";

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
    deno(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
});
