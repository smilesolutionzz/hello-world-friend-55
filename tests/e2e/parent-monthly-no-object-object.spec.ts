/**
 * E2E: Parent monthly report mobile share view must never render "[object Object]".
 *
 * Cross-browser via Playwright (Chromium, Firefox, WebKit) — run with:
 *   bun playwright test tests/e2e/parent-monthly-no-object-object.spec.ts
 *
 * Requires env:
 *   E2E_PARENT_SESSION_TOKEN  — parent_phone_sessions.token
 *   E2E_PARENT_SHARE_TOKEN    — center_parent_share_links.token (matching session)
 *   E2E_PARENT_RESOURCE_ID    — center_parent_reports.id
 *   E2E_BASE_URL              — default http://localhost:8080
 */
import { test, expect } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:8080";
const SESSION_TOKEN = process.env.E2E_PARENT_SESSION_TOKEN!;
const SHARE_TOKEN = process.env.E2E_PARENT_SHARE_TOKEN!;
const RESOURCE_ID = process.env.E2E_PARENT_RESOURCE_ID!;

test.describe("Parent monthly report — no [object Object]", () => {
  test.beforeEach(() => {
    if (!SESSION_TOKEN || !SHARE_TOKEN || !RESOURCE_ID) {
      throw new Error("Missing E2E_PARENT_SESSION_TOKEN / E2E_PARENT_SHARE_TOKEN / E2E_PARENT_RESOURCE_ID");
    }
  });

  test("mobile share view never renders [object Object]", async ({ page, browserName }) => {
    // Seed the parent session into localStorage on the app origin BEFORE navigating
    // into the protected route. The page reads it via findParentSession().
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await page.evaluate(
      ([shareToken, payload]) => {
        localStorage.setItem(`aihpro_parent_session_${shareToken}`, payload);
      },
      [
        SHARE_TOKEN,
        JSON.stringify({
          parent_session_token: SESSION_TOKEN,
          resource_id: RESOURCE_ID,
        }),
      ] as const,
    );

    await page.goto(`${BASE_URL}/parent/reports/${RESOURCE_ID}`, { waitUntil: "networkidle" });

    // Wait for content beyond the loader
    await page.waitForFunction(
      () => !document.body.innerText.includes("불러오는 중") || document.body.innerText.length > 400,
      { timeout: 15_000 },
    );

    const bodyText = await page.locator("body").innerText();

    // Capture an artifact for cross-browser inspection
    await page.screenshot({
      path: `/tmp/browser/parent-monthly-${browserName}.png`,
    });

    // Hard assertion: never leak [object Object]
    expect(bodyText, "report body must not contain [object Object]").not.toContain("[object Object]");

    // Sanity: monthly-specific copy is shown, not the weekly fallback
    expect(bodyText).not.toContain("이번 주 하이라이트");
  });
});
