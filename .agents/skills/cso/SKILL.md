---
name: cso
description: Run a Chief Security Officer-style audit on the codebase — OWASP Top 10 (2021) + STRIDE threat model. Use when the user types `/cso`, "보안 감사", "security audit", or asks for an exploit-level review of the project. Produces a numbered findings report with exploit scenarios.
---

# /cso — Security Audit (OWASP Top 10 + STRIDE)

Goal: in 15–30 minutes, produce a single audit report at
`docs/security/AUDIT-YYYY-MM-DD.md` covering OWASP Top 10 (2021) and STRIDE,
with an **exploit scenario** for every finding.

## Workflow

1. **Run automated scanners in parallel**
   - `security--run_security_scan` — RLS, PII exposure, storage buckets
   - `supabase--linter` — SECURITY DEFINER, search_path, postgres CVEs
   - `code--dependency_scan` — npm CVEs
   - `seo_chat--list_findings` (optional) — leaked secrets in HTML

2. **Static code sweep** (parallel `rg`):
   - Secrets: `rg -n "service_role|SERVICE_ROLE|sk_live|sk_test" src/ supabase/`
   - SQL strings: `rg -n "execute_sql|rpc\(.*\$\{" supabase/`
   - `dangerouslySetInnerHTML`: `rg -n "dangerouslySetInnerHTML" src/`
   - Hardcoded admin checks: `rg -n "localStorage.*admin|isAdmin.*=.*true" src/`
   - Unvalidated input → external URL: `rg -n "window\.open\(|location\.href.*=.*\$\{" src/`
   - Edge function CORS `*`: `rg -n "Access-Control-Allow-Origin.*\\*" supabase/functions/`

3. **Map every finding to:**
   - OWASP Top 10 (2021) category — A01 BAC, A02 Crypto, A03 Injection, A04 Insecure Design, A05 Misconfig, A06 Vulnerable Components, A07 AuthN, A08 Integrity, A09 Logging, A10 SSRF
   - STRIDE — Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege

4. **Write report** at `docs/security/AUDIT-YYYY-MM-DD.md`. Required sections:
   - Executive summary (counts by severity, top 3 risks)
   - Findings table (numbered, no markdown table — use `## 01. Title` blocks)
   - Per finding: **OWASP/STRIDE tag · Severity · Exploit scenario · Fix · File/Table**
   - Appendix: scanner raw counts, accepted risks

5. **Do NOT auto-fix.** Report only. User triages.

## Severity rubric

- **Critical** — unauthenticated PII/secret exfil, RLS bypass, RCE
- **High** — authenticated cross-tenant read/write, privilege escalation
- **Medium** — info disclosure to authenticated peers, missing rate-limit
- **Low** — defense-in-depth (search_path, OTP expiry, postgres patch)

## Output rules

- No emojis. Use numbered headings (01, 02, ...).
- Every finding MUST have an exploit scenario in `curl` / SQL / UI-step form.
- Cite file paths or table names. Never speculate without evidence.
- Korean prose, English technical terms.
