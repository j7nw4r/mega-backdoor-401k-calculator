import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  // Cloudflare Pages serves from the project root, so the default base is fine.
  plugins: [react(), tailwindcss()],
  test: {
    // The projection engine is pure, so a node environment is enough and fast.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
