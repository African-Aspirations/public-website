import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  use: { baseURL: "http://localhost:4322", channel: process.env.CI ? undefined : "chrome" },
  webServer: {
    command: "bun tests/serve-dist.ts",
    url: "http://localhost:4322/404.html",
    reuseExistingServer: true,
  },
  reporter: "list",
});
