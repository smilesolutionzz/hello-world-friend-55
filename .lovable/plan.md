## Dead Route / Broken Link Cleanup (P0 Launch Blocker)

Goal: eliminate every `navigate(...)` / `<Link to=...>` / `<a href=...>` that points to a path **not registered** in `src/App.tsx`. These cause 404s mid-funnel and kill conversion.

### Audit result — confirmed dead links

| # | Dead path | Where it's called | Fix |
|---|-----------|-------------------|-----|
| 1 | `/assessment/depression-test` | `components/onboarding/ImprovedOnboarding.tsx:127` | Re-route to `/depression-package` (existing route) |
| 2 | `/assessment/personality-test` | `ImprovedOnboarding.tsx:130` | Re-route to `/assessment/mbti-test` |
| 3 | `/assessment/relationship-test` | `ImprovedOnboarding.tsx:124` | Re-route to `/assessment/relationship-style-test` |
| 4 | `/expert-matching` | `urgency/QuickMatchCTA.tsx`, `landing/SimplifiedCoreServices.tsx`, `onboarding/QuickOnboarding.tsx` | Re-route to `/expert-hiring` |
| 5 | `/highlight-auth` | `pages/InstitutionClientDashboard.tsx:56` | Re-route to `/auth` |
| 6 | `/simple-observation` | `pages/HighlightDashboard.tsx:524` | Re-route to `/observation` |
| 7 | `/token-purchase?...` | `paywall/BlurredContent.tsx`, `landing/ARRForecastSection.tsx` (×2) | Re-route to `/pricing` (single-product BM — token bundles deprecated) |
| 8 | `/life-achievement-*` (history/stats/leaderboard/badges/community) | `assessment/LifeAchievementResult.tsx` (5 buttons) | Remove these buttons (feature scope deprecated; no destination exists) |
| 9 | `/demo/AIHPRO_Demo_Report.docx` download link | `report/ReportContentShowcase.tsx:189` | Verify file exists in `public/demo/`; if not, remove the download anchor |

### Defensive fallback

Add a catch-all `<Route path="*" element={<NotFound />} />` audit — confirm it's already last in `App.tsx` and that `NotFound` page CTAs route to `/` and `/mind-track` (no further dead links).

### Out of scope for this pass

- Routes that DO exist but have suspicious behavior (e.g. `/payment` redirecting to `/token-subscription`). Will keep as-is.
- The `/components/...` and `/pages/...` strings in the scan were import paths, not router links — ignored.

### Files to edit (8 files)

1. `src/components/onboarding/ImprovedOnboarding.tsx`
2. `src/components/urgency/QuickMatchCTA.tsx`
3. `src/components/landing/SimplifiedCoreServices.tsx`
4. `src/components/onboarding/QuickOnboarding.tsx`
5. `src/pages/InstitutionClientDashboard.tsx`
6. `src/pages/HighlightDashboard.tsx`
7. `src/components/paywall/BlurredContent.tsx`
8. `src/components/landing/ARRForecastSection.tsx`
9. `src/components/assessment/LifeAchievementResult.tsx`
10. `src/components/report/ReportContentShowcase.tsx` (verify or remove)

### Verification after edits

Re-run the link diff:
```
rg -nP '(to="|navigate\(['"'"']|href=")/[a-z][\w/-]*' src -o | sort -u   diff against   rg -oP 'path="(/[^"]*)"' src/App.tsx
```
Expected: zero unmatched paths (excluding external URLs and dynamic params).

### Estimated effort

~15 minutes. All changes are pure string swaps or button removals — zero risk to working features.
