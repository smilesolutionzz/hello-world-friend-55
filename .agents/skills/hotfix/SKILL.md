---
name: hotfix
description: Customer-feedback hotfix loop — investigate root cause, fix, review, QA, ship, and canary-monitor. Triggers on `/hotfix`, `/investigate`, `/canary`, "핫픽스", "긴급 수정", "프로덕션 버그", or any customer-reported regression. Enforces a 3-strike investigation cap and post-deploy verification.
---

# /hotfix — Customer Feedback Hotfix Loop (30–60min)

End-to-end recipe for turning a customer report into a verified production fix.
Six phases. Do not skip phases. Stop and escalate on 3 failed hypotheses.

---

## Phase 1 — `/investigate` (root-cause, max 3 attempts)

**Input:** customer message, screenshot, or repro steps.

1. **Reproduce first.**
   - `code--read_session_replay` if user was just on the preview.
   - `code--read_console_logs search:"error"` + `code--read_network_requests search:"4|5"`.
   - For backend issues: `supabase--edge_function_logs` (last 1h) and `supabase--analytics_query` for spikes.
2. **Form hypothesis** → write one sentence: "I think X because Y."
3. **Verify with evidence** (file read, SQL select, log grep). Never assume.
4. **If 3 hypotheses fail in a row → STOP.** Post a `task_tracking` note listing
   what was tried and ask the user for more context. Do NOT keep guessing.

Output of this phase: a `## Root cause` paragraph + the exact file/line or
table/row that needs to change. Save to a task note.

---

## Phase 2 — Fix (minimal diff)

- Edit only what the root cause requires. No drive-by refactors.
- If schema change: `supabase--migration`. If data fix: `psql` insert/update via
  migration. Never both UI + schema in one hotfix unless coupled.
- Add or update one regression test in `src/test/` covering the exact bug.

---

## Phase 3 — `/review` (self-review before shipping)

Mental checklist:
- Does the diff match the root cause? (no scope creep)
- Any new `console.log`, `TODO`, `any` types, or commented-out code? Remove.
- RLS / auth touched? Re-run `security--run_security_scan` on changed tables.
- Pricing/feature memory rules from `mem://index.md` still respected?
- Are imports, types, and exports consistent? Run `lsp--code_intelligence` if unsure.

---

## Phase 4 — `/qa` (verify fix + adjacent flows)

1. **Direct verification** — reproduce the original steps in preview. Confirm fixed.
2. **Regression sweep** — exercise 2–3 adjacent flows that touch the same file/table.
   Use `code--read_session_replay` + console/network logs.
3. **Test run** — `bunx vitest run` for any test file you added or that imports the changed module.
4. **Edge function changes** — `supabase--test_edge_functions` for the touched function.

If anything regresses → back to Phase 1 with the new symptom.

---

## Phase 5 — `/ship` → `/land-and-deploy`

- Frontend: tell the user to click **Publish → Update**.
- Backend (edge functions / migrations): already auto-deploys; just confirm in logs.
- Post a short release note (1–2 lines) summarizing user-visible change.
- Always emit:
  ```
  <presentation-actions>
  <presentation-open-publish>Publish your app</presentation-open-publish>
  </presentation-actions>
  ```

---

## Phase 6 — `/canary` (post-deploy monitoring, ~15min window)

After publish:
1. `supabase--edge_function_logs` for the touched function — check error rate falls to baseline.
2. `supabase--analytics_query` on the relevant table for fresh writes succeeding.
3. `code--fetch_website` the production URL of the fixed route — screenshot + console.
4. If error rate stays elevated for >10min → roll back via Lovable version history
   and reopen the task. Do NOT iterate fixes live without rollback.

Report back to user:
- What was broken (1 line)
- Root cause (1 line)
- Fix (1 line)
- Canary status (errors/min before vs after)

---

## Rules

- **3-strike rule** in Phase 1 is non-negotiable.
- Korean prose, English technical terms. No emojis.
- Never skip Phase 6 — undetected regressions are worse than the original bug.
- If the bug is a payment, auth, or data-loss issue → tag Severity Critical and
  notify the user in chat before shipping, even if the fix looks trivial.
