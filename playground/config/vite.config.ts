import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import denoWorkspace from "@y0n1/vite-plugin-deno-workspace";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    denoWorkspace(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
});
