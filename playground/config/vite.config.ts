import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  resolve: {
    alias: {
      "@y0n1/react-mvvm": path.resolve(
        __dirname,
        "../../packages/react-mvvm/mod.ts",
      ),
    },
  },
});
