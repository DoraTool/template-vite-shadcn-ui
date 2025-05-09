import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const { componentSpecTree } = require("./specai-vite-plugin");

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentSpecTree()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
