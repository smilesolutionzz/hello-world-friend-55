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
  // Cross-browser: Chromium (Blink) + Firefox (Gecko). WebKit requires
  // libgstreamer which isn't available in this sandbox; enable locally with
  // `bunx playwright install --with-deps webkit` and re-add the project below.
  projects: [
    { name: "chromium", use: { ...devices["iPhone 13"], browserName: "chromium" } },
    { name: "firefox",  use: { ...devices["iPhone 13"], browserName: "firefox"  } },
  ],
});
