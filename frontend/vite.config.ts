import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/MonsterAgency/",
  plugins: [react()],
  test: {
    environment: "node",
  },
});
