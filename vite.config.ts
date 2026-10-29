import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `./` keeps built asset paths portable on GitHub Pages, including project repositories.
export default defineConfig({
  base: "./",
  plugins: [react()]
});
