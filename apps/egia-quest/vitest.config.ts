import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/tests/**/*.test.{ts,tsx}"],
    setupFiles: ["src/tests/setup-network-guard.ts"],
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 5_000,
  },
});
