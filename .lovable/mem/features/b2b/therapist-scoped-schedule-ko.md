---
name: B2B 치료사 권한 분리 — 본인 일정만 조회
description: center_sessions/center_clients SELECT 정책을 owner/admin/viewer로 한정. 치료사는 본인 담당 세션·이용자만 노출. 페이지는 /therapist/my-schedule
type: feature
---
- `center_sessions_select_admin` / `center_clients_select_admin`: 관리자/뷰어만 전체 조회
- 치료사(`role='therapist'`)는 기존 dedicated 정책 "Therapists can view own sessions" / "Therapists can view clients of own sessions"로만 접근
- 본인 일정 페이지: `src/pages/TherapistMySchedule.tsx` (/therapist/my-schedule), `claim_therapist_account` RPC로 계정 연결
- 상태 변경(완료/취소/되돌리기)는 본인 세션만 가능 ("Therapists can update own session status")
