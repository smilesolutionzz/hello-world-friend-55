# E2E 결제 시나리오 — 실결제 1건 검증

목적: **결제 → 권한 부여 → 리포트 노출**까지 한 명의 사용자 흐름을 로그로 추적.

대상 상품: `mind_track_7` (₩7,900)

---

## 사전 준비

1. Toss 테스트 또는 라이브 키가 Secrets에 설정됨
2. 테스트 계정으로 로그인 (`test+e2e@aihpro.app`)
3. 관리자 계정으로 `/admin/payment-monitor` 별도 탭 열어둠

---

## 시나리오 단계

| # | 동작 | 기대 결과 | 검증 SQL/로그 |
|---|---|---|---|
| 1 | `/mind-track` 접속 후 목표 선택 | onboarding event 기록 | `SELECT * FROM mind_track_onboarding_events ORDER BY created_at DESC LIMIT 1` |
| 2 | `/pricing` 진입 → "7일 시작하기" 클릭 | `mind_track_enrollments` row created (status=pending) | `SELECT * FROM mind_track_enrollments WHERE user_id=:uid ORDER BY created_at DESC LIMIT 1` |
| 3 | Toss 결제창 진입 → 카드 결제 완료 | `payment_initiated` analytics event | Edge Function: `unified-payment` 로그에 `create-payment` 200 |
| 4 | `/payment-complete` 콜백 도달 | `toss_payments.status='DONE'` | `SELECT status, approved_at FROM toss_payments WHERE order_id=:order` |
| 5 | 자동 권한 부여 | `mind_track_enrollments.status='active'`, `started_at` 채워짐 | 같은 row 재조회 |
| 6 | `/mind-track` 다시 진입 | Day 1 미션 카드 노출 | UI 확인 + `mind_track_daily_missions` row |
| 7 | 7일차 완주 → 리포트 트리거 | `mind_track_milestone_reports` row 생성 | `SELECT * FROM mind_track_milestone_reports WHERE user_id=:uid` |
| 8 | `/my-journey` 진입 | 리포트 카드 노출 + PDF 다운로드 가능 | UI 확인 |

---

## 자동 검증 쿼리

론칭 후 첫 결제 들어왔을 때 운영팀이 한 번 돌려봄:

```sql
-- 가장 최근 mind_track 결제와 권한 상태를 한 줄로
SELECT
  tp.order_id,
  tp.status                      AS payment_status,
  tp.amount,
  tp.approved_at,
  e.status                       AS enrollment_status,
  e.started_at,
  EXTRACT(EPOCH FROM (e.started_at - tp.approved_at)) AS grant_lag_seconds
FROM toss_payments tp
LEFT JOIN mind_track_enrollments e ON e.user_id = tp.user_id
WHERE tp.created_at > now() - interval '1 day'
ORDER BY tp.created_at DESC
LIMIT 1;
```

**Pass 기준**: `payment_status='DONE'` AND `enrollment_status='active'` AND `grant_lag_seconds < 10`

---

## 실패 시 롤백

| 증상 | 조치 |
|---|---|
| 결제는 됐는데 권한 미부여 | `mind_track_enrollments` 수동 UPDATE → status='active', started_at=now() |
| 영수증 메일 미수신 | Resend 대시보드 확인, 수동 재발송 |
| 리포트 미생성 | `mind-track-milestone-report` Edge Function 수동 invoke |
