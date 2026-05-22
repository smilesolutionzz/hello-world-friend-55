---
name: retro
description: Weekly retrospective and next-week planning. Triggers on "/retro", "주간 회고", "weekly retro", "retrospective", "다음 주 계획". Aggregates git activity (commits, LOC, test ratio, peak hours) across the current project and produces a Korean retro report with next-week priorities. Use "/retro global" to sweep all sibling projects under the workspace.
---

# /retro — Weekly Retrospective + Next-Week Plan

15-minute loop. Produces `docs/retro/RETRO-YYYY-WW.md` (ISO week) with metrics, narrative, and a top-3 plan for next week. No emojis, Korean prose, professional tone (per project Core memory).

## Scope

- **`/retro`** — current project only (default).
- **`/retro global`** — sweeps all sibling projects under the workspace root (via `cross_project--list_projects` + per-project git stats) and produces a consolidated cross-project report at `docs/retro/RETRO-YYYY-WW-global.md`.

## Metrics (last 7 days, Mon–Sun of current ISO week)

Always compute, even when noisy. If a metric is missing, write "측정 불가" with the reason — never fabricate.

1. **Commits** — count, top 5 by message, authors.
2. **LOC** — `+added / -removed`, net delta, top 3 files by churn.
3. **Test ratio** — `test_loc_changed / total_loc_changed` (count any `*.test.*`, `*.spec.*`, `__tests__/`, `tests/` paths as tests). Report as percentage. Flag if <10%.
4. **Peak hours** — commits bucketed by hour-of-day (local TZ = Asia/Seoul). Report top 3 hour buckets.
5. **Hotspots** — files touched in 3+ commits this week (refactor candidates).
6. **AI-tool footprint** — count files under `.agents/skills/`, `.workspace/skills/`, `docs/benchmarks/`, `docs/security/`, `docs/retro/` changed this week. Use as a proxy for "AI tooling investment."

## Procedure

### Phase 1 — Collect (parallel)

Run these as a single parallel batch. Use `${SINCE}` = ISO date 7 days ago at 00:00 local.

```bash
SINCE=$(date -d "7 days ago" +%Y-%m-%d)
git log --since="$SINCE" --pretty=format:'%h|%an|%ai|%s' > /tmp/retro_commits.txt &
git log --since="$SINCE" --numstat --pretty=format:'---%h|%ai' > /tmp/retro_numstat.txt &
git log --since="$SINCE" --name-only --pretty=format:'' | sort | uniq -c | sort -rn > /tmp/retro_hotspots.txt &
wait
```

For `/retro global`, call `cross_project--list_projects`, then for each project repeat the collect step inside that project's worktree (use `cross_project--read_project_file` to peek at recent commits via a small helper script, or note "외부 프로젝트 git 접근 불가, 수동 입력 필요" if cross-project git is unavailable).

### Phase 2 — Compute

One Python/Node script in `/tmp/retro.py` that:
- Parses `/tmp/retro_commits.txt` → commit count, author breakdown, hour histogram.
- Parses `/tmp/retro_numstat.txt` → total +/-, per-file churn, test vs non-test split (regex on path).
- Parses `/tmp/retro_hotspots.txt` → files with count ≥3.
- Emits a single JSON blob to stdout for the report writer.

Keep the script under 80 lines. Do not pip-install anything.

### Phase 3 — Narrative (Korean, no emojis)

Write `docs/retro/RETRO-{YYYY}-W{WW}.md` with this exact section order:

```
# 주간 회고 — YYYY년 W주차 (M월 D일 ~ M월 D일)

## 01. 핵심 지표
- 커밋: N건 (저자 A: x, B: y)
- 변경량: +A / -B (순증 C)
- 테스트 비율: P% (목표 20%)
- 피크 시간대: HH시, HH시, HH시
- AI 도구 투자: N개 파일 (skills/, docs/benchmarks/, docs/security/)

## 02. 진행한 일
{commit 메시지에서 의미 단위로 그룹핑한 3-6줄 요약. 단순 나열 금지.}

## 03. 잘된 점
{지표·산출물 근거로 2-3개. 추측 금지.}

## 04. 아쉬운 점 / 리스크
{테스트 비율 저조, 핫스팟 파일, 야간 커밋 비중 등 데이터 근거로 2-3개.}

## 05. 핫스팟 (3회 이상 수정된 파일)
{파일별 수정 횟수와 리팩터 권고. 없으면 "해당 없음".}

## 06. 다음 주 Top 3
1. {구체적 산출물 단위. "개선"·"강화" 같은 모호어 금지.}
2. ...
3. ...

## 07. 측정 노트
{누락된 지표·가정·범위. /retro global 인 경우 프로젝트별 합산 방식 명시.}
```

### Phase 4 — Apply

- Write the file via `code--write`.
- If `docs/retro/` doesn't exist, create it implicitly via the write.
- Print a 5-line chat summary: 이번 주 핵심 지표 + Top 3 + 리포트 경로.

## Rules

- **No fabrication.** If git is empty or shallow, say so and stop.
- **No emojis, no markdown tables.** Use the numbered section format above (project Core memory).
- **Korean prose**, English for code/tool names only.
- **One-shot.** Don't ask clarifying questions unless `/retro global` and cross-project access is ambiguous.
- **Stale check.** If a retro file for the same ISO week already exists, suffix with `-v2`, `-v3` (per project artifact iteration convention).
- **Privacy.** Never include commit hashes longer than 7 chars or author emails in the report body.

## Cross-references

- Companion skills: `/cso` (security audit), `/hotfix` (incident loop), competitor benchmarks under `docs/benchmarks/`.
- This skill is the only one that writes under `docs/retro/`. Other skills must not touch that folder.
