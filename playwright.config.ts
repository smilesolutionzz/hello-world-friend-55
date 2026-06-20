import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:8080",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["iPhone 13"], browserName: "chromium" } },
    { name: "firefox",  use: { ...devices["iPhone 13"], browserName: "firefox"  } },
    { name: "webkit",   use: { ...devices["iPhone 13"], browserName: "webkit"   } },
  ],
});
