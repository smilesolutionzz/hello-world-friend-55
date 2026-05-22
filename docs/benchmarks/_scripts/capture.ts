#!/usr/bin/env bun
/**
 * docs/benchmarks/_scripts/capture.ts
 *
 * 경쟁사 페이지를 Firecrawl v2 API로 캡처해서
 * docs/benchmarks/{slug}/{page}.{md,png,json} 에 저장한다.
 *
 * 사용 예:
 *   bun docs/benchmarks/_scripts/capture.ts calm \
 *     landing=https://www.calm.com \
 *     pricing=https://www.calm.com/subscribe
 *
 * 환경변수:
 *   FIRECRAWL_API_KEY (Lovable Firecrawl 커넥터에서 자동 주입)
 *
 * 출력:
 *   docs/benchmarks/{slug}/overview.md      - 캡처 인덱스 (URL/일자)
 *   docs/benchmarks/{slug}/{page}.md        - 본문 markdown
 *   docs/benchmarks/{slug}/{page}.png       - 풀페이지 스크린샷
 *   docs/benchmarks/{slug}/{page}.branding.json - 색/폰트
 */

import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";

const API_KEY = process.env.FIRECRAWL_API_KEY;
if (!API_KEY) {
  console.error("✗ FIRECRAWL_API_KEY 환경변수가 없습니다.");
  process.exit(1);
}

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";
const PROJECT_ROOT = resolve(import.meta.dir, "..", "..", "..");

type CaptureResult = {
  page: string;
  url: string;
  ok: boolean;
  error?: string;
};

async function scrape(url: string): Promise<any> {
  const res = await fetch(`${FIRECRAWL_V2}/scrape`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown", "screenshot", "branding"],
      onlyMainContent: true,
      waitFor: 1500,
    }),
  });
  const json: any = await res.json();
  if (!res.ok) {
    throw new Error(
      `Firecrawl ${res.status}: ${json?.error ?? JSON.stringify(json).slice(0, 200)}`,
    );
  }
  // v2 returns { success, data: { markdown, screenshot, branding, metadata } }
  return json.data ?? json;
}

async function saveScreenshot(filePath: string, screenshot: string) {
  // Firecrawl returns either a URL or base64 data URI / raw base64
  if (screenshot.startsWith("http")) {
    const res = await fetch(screenshot);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(filePath, buf);
    return;
  }
  const base64 = screenshot.includes(",")
    ? screenshot.split(",")[1]
    : screenshot;
  await writeFile(filePath, Buffer.from(base64, "base64"));
}

async function capturePage(
  slug: string,
  page: string,
  url: string,
): Promise<CaptureResult> {
  const dir = resolve(PROJECT_ROOT, "docs/benchmarks", slug);
  await mkdir(dir, { recursive: true });

  try {
    console.log(`  → ${page.padEnd(16)} ${url}`);
    const data = await scrape(url);

    if (data.markdown) {
      const header = `# ${slug} / ${page}\n\n- Source: ${url}\n- Captured: ${new Date().toISOString()}\n\n---\n\n`;
      await writeFile(resolve(dir, `${page}.md`), header + data.markdown);
    }
    if (data.screenshot) {
      await saveScreenshot(resolve(dir, `${page}.png`), data.screenshot);
    }
    if (data.branding) {
      await writeFile(
        resolve(dir, `${page}.branding.json`),
        JSON.stringify(data.branding, null, 2),
      );
    }
    return { page, url, ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`    ✗ ${msg}`);
    return { page, url, ok: false, error: msg };
  }
}

async function writeOverview(slug: string, results: CaptureResult[]) {
  const dir = resolve(PROJECT_ROOT, "docs/benchmarks", slug);
  const lines: string[] = [
    `# ${slug} — 벤치마크 개요`,
    "",
    `- Captured: ${new Date().toISOString()}`,
    `- Pages: ${results.filter((r) => r.ok).length}/${results.length}`,
    "",
    "## 캡처된 페이지",
    "",
  ];
  for (const r of results) {
    const status = r.ok ? "✓" : "✗";
    lines.push(`- ${status} **${r.page}** — [${r.url}](${r.url})`);
    if (!r.ok) lines.push(`    - ERROR: ${r.error}`);
  }
  lines.push("", "## 분석 노트", "", "_(작성하기)_", "");
  await writeFile(resolve(dir, "overview.md"), lines.join("\n"));
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(
      "Usage: bun docs/benchmarks/_scripts/capture.ts <slug> <page>=<url> [<page>=<url> ...]",
    );
    process.exit(1);
  }
  const [slug, ...pairs] = args;

  const targets = pairs.map((p) => {
    const idx = p.indexOf("=");
    if (idx === -1) throw new Error(`잘못된 형식: ${p} (page=url 형태여야 함)`);
    return { page: p.slice(0, idx), url: p.slice(idx + 1) };
  });

  console.log(`\n▸ ${slug} — ${targets.length}개 페이지 캡처 시작\n`);

  const results: CaptureResult[] = [];
  for (const t of targets) {
    results.push(await capturePage(slug, t.page, t.url));
    // 짧은 딜레이로 rate-limit 회피
    await new Promise((r) => setTimeout(r, 800));
  }

  await writeOverview(slug, results);

  const ok = results.filter((r) => r.ok).length;
  console.log(`\n▸ 완료: ${ok}/${results.length} 페이지 저장됨`);
  console.log(`  → docs/benchmarks/${slug}/\n`);

  if (ok === 0) process.exit(1);
}

main().catch((e) => {
  console.error("✗ 치명적 오류:", e);
  process.exit(1);
});
