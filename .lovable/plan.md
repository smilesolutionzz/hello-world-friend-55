
## 심층검사 결제 단일화 — ₩19,900 30일 마음 트랙

레거시 단건 결제(₩990 검사 / ₩3,900 리포트) 잔재를 모두 제거하고, B2C 유료 진입점은 **₩19,900 30일 마음 트랙** 단일 상품으로 통일합니다. B2B는 별도 모델 그대로 유지.

### 정리 대상 (사용자 노출 영역)

1. **`src/components/assessment/UnifiedAssessmentHub.tsx`**
   - `'심층 전문 분석' sub: '10~15분 · 리포트 ₩3,900'` → `'10~15분 · 30일 마음 트랙 ₩19,900'`

2. **`src/components/payments/MobilePaymentFlow.tsx`**
   - 검사 ₩990 / 리포트 ₩3,900 카드 2개 제거
   - "30일 마음 변화 트랙 ₩19,900" 단일 카드 + "30일 환불 보장" 배지로 대체
   - 결제 호출 시 `pay('mind_track_30')`로 통일

3. **`src/components/landing/SubscriptionValueSection.tsx`**
   - `SINGLE_REPORT_PRICE` 표기 → `MIND_TRACK_PRICE` (₩19,900) + 가치 카피 재정리

4. **`src/components/payments/PaymentModal.tsx`**
   - 단건(test/report) vs 구독 분기 로직 제거
   - 모달 전체를 "30일 마음 트랙 단일 상품" 카드로 단순화 (원가 ₩49,000 → ₩19,900, 60% OFF, 환불 보장)

5. **`src/i18n/translations/ko.ts` / `en.ts`**
   - `assessments.price`: `'990원'` / `'₩990'` → `'30일 마음 트랙 ₩19,900'` / `'30-day Mind Track ₩19,900'`

6. **`src/pages/About.tsx`** (FAQ)
   - "비용은 얼마인가요?" 답변을 단일 상품(₩19,900 / 30일 / 환불 보장 / 무료 체험검사 3종) 기준으로 재작성

7. **`src/pages/TermsOfService.tsx`** & **`src/pages/RefundPolicy.tsx`**
   - 단건 ₩990·₩3,900, 월간 ₩9,900, 연간 ₩99,000 조항 삭제
   - "30일 마음 트랙 ₩19,900 · 30일 내 100% 환불" 단일 조항으로 교체

### 정리 대상 (코드/상수)

8. **`src/hooks/usePayment.ts`**
   - `PRODUCTS`에서 `single_test`, `single_report`, `subscription_monthly`, `subscription_yearly`, `pass_30` 제거
   - `mind_track_30` 단일 항목만 정식 등록 (₩19,900, 원가 ₩49,000, 60% OFF)
   - `paySubscription()`도 `pay('mind_track_30')` 호출로 변경

9. **`src/constants/tokenCosts.ts`**
   - `SINGLE_TEST_PRICE`, `SINGLE_REPORT_PRICE`, `SUBSCRIPTION_PRICE`, `SUBSCRIPTION_YEARLY_PRICE` 등 별칭 상수 deprecated 처리(계속 `MIND_TRACK_PRICE` 동일 값 유지하되 신규 사용 금지 주석 추가)

### 제외 (의도적으로 건드리지 않음)

- **B2B 영역**: `BusinessModelSection.tsx` B2B 카드, `/b2b`, `/b2b-proposal`, 기관 대시보드 — 별도 모델
- **사업계획서 문서**: `StartupPackage.tsx`, `K-STARTUP_*.md`, `공동대표_회의자료_*.md` — 내부/투자용 historical 문서 (사용자 노출 X)
- **전문가 상담료 ₩49,000** (`expertPricing.ts`) — 별개 상품

### 검증

- `/depth-test`(심층검사 허브), `/mind-track`, `/quiz` 결과, `/pricing`, 결제 모달, About FAQ, 이용약관/환불정책에서 ₩990·₩3,900·₩9,900 표기 0건 확인
- grep 재실행: `990원|₩990|3,900원|₩3,900|9,900원/월` → 노출 페이지에서 빈 결과
