# AIHPRO 론칭 체크리스트 (확정판)

작성일: 2026-05-18 · 책임자: 운영팀  
※ 모든 가격은 `src/constants/tokenCosts.ts`에서 읽음 (하드코딩 금지)

---

## 01. 환경 변수 / Secrets

| 키 | 위치 | 필수 | 검증 방법 |
|---|---|---|---|
| `VITE_SUPABASE_URL` | `.env` (자동) | ✅ | 빌드 시 자동 주입 |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` (자동) | ✅ | 빌드 시 자동 주입 |
| `TOSS_SECRET_KEY` | Supabase Secrets | ✅ | `unified-payment` Edge Function 로그 |
| `TOSS_CLIENT_KEY` | Supabase Secrets | ✅ | `usePayment` 초기 호출에서 `clientKey` 수신 |
| `LOVABLE_API_KEY` | Supabase Secrets | ✅ | AI Gateway 호출 200 OK |
| `RESEND_API_KEY` | Supabase Secrets | ✅ | 결제 영수증 메일 발송 테스트 |
| `KAKAO_JS_KEY` | 코드 상수 (Public) | ✅ | 공유 버튼 클릭 |

확인: Supabase Dashboard → Settings → Edge Functions → Secrets

---

## 02. Toss Payments 웹훅

| 항목 | 값 |
|---|---|
| 승인 콜백 URL | `https://aihpro.app/payment-complete?type={productType}` |
| 실패 콜백 URL | `https://aihpro.app/payment-complete?status=fail&type={productType}` |
| 가상계좌 입금 웹훅 | `https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/toss-webhook` |
| 결제 취소 웹훅 | 동일 (이벤트 타입으로 분기) |

검증: Toss 개발자 콘솔 → 테스트 결제 → 콜백 200 응답 확인

---

## 03. 가격표 (Single Source of Truth)

| SKU | 표시명 | 가격 | 상수 |
|---|---|---|---|
| `mind_track_7` | 7일 마음 변화 트랙 (메인) | ₩7,900 | `MIND_TRACK_7_PRICE` |
| `mind_track_30` | 30일 마음 변화 트랙 (보조) | ₩19,900 | `MIND_TRACK_PRICE` |
| `mind_track_extend_23` | 23일 연장권 (7일 완주자) | ₩12,900 | `usePayment.ts` PRODUCTS |
| 전문가 상담 (Standard) | 50분 텍스트 | `experts.consultation_rate_text` | DB |
| 전문가 상담 (Urgent/Emergency) | 1시간 화상 | DB | DB |

폐기 상품 (재도입 금지): `single_test`, `single_report`, `subscription_monthly`, `subscription_yearly` (호환 껍데기만 유지)

---

## 04. 쿠폰 / 할인

| 정책 | 적용 위치 |
|---|---|
| 신규 가입 2 크레딧 | `signup-incentive` 트리거 (자동) |
| 마음 트랙 50% 할인 | `MIND_TRACK_7_DISCOUNT_PERCENT` 상수 — 항시 적용 |
| 구독자 전문가 상담 할인 | `src/lib/expertPricing.ts` |
| 구독자 월 1회 무료 상담 | `grant_subscriber_consultation_credit()` RPC (자동) |

쿠폰 코드 시스템은 Phase 2 예정 (현재 없음)

---

## 05. 사용자 권한 / RLS

| 테이블 | 정책 요약 |
|---|---|
| `aba_observations` | `auth.uid() = user_id` 본인 CRUD |
| `user_roles` | 관리자만 관리, `has_role()` SECURITY DEFINER |
| `mind_track_enrollments` | 본인 SELECT/INSERT, Edge Function에서만 status 변경 |
| `toss_payments` | 본인 SELECT, Edge Function INSERT/UPDATE |
| `experts` | 공개 SELECT (게스트도 가능), 본인 UPDATE |

관리자 계정: `kijung_kku@naver.com` (영구), 추가 관리자는 `user_roles` 테이블 INSERT

---

## 06. 모니터링 & 알림

- 실시간 결제 대시보드: **`/admin/payment-monitor`** (성공률·오류율·평균 처리시간·최근 50건)
- 임계치 알림 (수동 운영): 성공률 < 90% 시 Slack/카톡으로 운영팀 알림 (Phase 2 자동화)
- Edge Function 로그: https://supabase.com/dashboard/project/hrcqxjetmzxoephgyjlb/functions

---

## 07. 론칭 전 최종 확인 (D-1)

- [ ] Toss 라이브 키 전환 (`TOSS_SECRET_KEY` / `TOSS_CLIENT_KEY`)
- [ ] 실결제 1건 (7,900원) e2e 통과 → `E2E_PAYMENT_SCENARIO.md` 참조
- [ ] `/admin/payment-monitor` 접속 가능 (관리자 계정)
- [ ] `aihpro.app` SSL 인증서 유효
- [ ] PWA 매니페스트 / favicon 정상
- [ ] 개인정보처리방침 / 의료 면책 문구 최신 버전
- [ ] 환불 정책 페이지 노출 (`/refund-policy`)
