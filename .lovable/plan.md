# 단일 상품 BM 메모리 등록 계획

이전 답변에서 옛날 가격(₩990 / ₩3,900 / ₩9,900)을 잘못 언급한 일이 재발하지 않도록, **단건 검사·리포트·월정액 구독은 폐기됐고 ₩19,900 30일 마음 변화 트랙 단일 상품으로 통일됨**을 메모리에 영구 기록합니다.

## 작업 내용

### 1. 신규 메모리 파일 생성
**경로:** `mem://product/single-product-bm-ko`
**type:** `feature`
**내용 요지:**
- 개인 사용자 BM은 사실상 2개:
  1. **30일 마음 변화 트랙** (`mind_track_30`, 일시불, 자동결제 없음, 7일 환불) — 코드 상수 `MIND_TRACK_PRICE` / `MIND_TRACK_ORIGINAL_PRICE`에서 읽기
  2. **전문가 1:1 상담 매칭** (`src/lib/expertPricing.ts` 단가, 구독자 자동 할인 + 월 1회 무료 크레딧 RPC)
- 보조: B2B 기관 플랜 (`b2b_*_plans` DB)
- **폐기된 항목 (재도입 금지):** 단건 검사(SINGLE_TEST_PRICE), 단건 리포트(SINGLE_REPORT_PRICE), 월간/연간 구독(subscription_monthly/yearly). 옛 상수들은 모두 `MIND_TRACK_PRICE`로 매핑된 하위 호환 껍데기일 뿐 — UI에서 단건/구독 선택 화면을 만들지 않음.
- 결제 진입점은 `PayButton` / `PaymentModal` / `MindTrackCheckoutHero` → 모두 `pay('mind_track_30')` 호출.
- 가격 숫자는 절대 메모리/코드에 하드코딩하지 말고 항상 `src/constants/tokenCosts.ts`에서 import.

### 2. 메모리 인덱스 업데이트
**경로:** `mem://index.md`
- **Core 섹션 보강**: Pricing 룰에 "단건 검사·리포트·월/연 구독은 폐기 — 자체 결제 상품은 ₩19,900 30일 트랙 단일 상품 + 전문가 상담 단건 2종뿐. 옛 990/3,900/9,900은 영구 폐기" 한 줄 추가.
- **Memories 섹션**: `[Single-product BM](mem://product/single-product-bm-ko)` 항목 추가.
- 기존 `[Token decommission]`, `[Pricing constants]` 항목과 상호참조되도록 설명 한 줄 다듬기.
- ⚠️ `code--write`는 파일 전체를 덮어쓰므로 기존 인덱스의 모든 줄을 보존하면서 위 두 변경만 반영.

### 3. (선택) 기존 관련 메모리 정리 검토
- `mem://product/token-system-decommission-ko`: 본문에 옛 가격(990/3,900/9,900) 예시가 박혀 있다면 "₩19,900 단일 상품으로 통일됨"으로 갱신.
- `mem://ux/landing-page-saas-conversion-ko`: 스틱키 변환 바가 "3개 CTA"로 적혀 있다면 단일 CTA(₩19,900 30일 트랙)로 메모 보정. *(코드 실태 먼저 확인 후 결정)*

## 코드 변경 없음
이 계획은 **메모리 룰만** 갱신합니다. `tokenCosts.ts` 등 코드의 하위 호환 상수는 그대로 두고, 향후 답변·작업에서 자동으로 단일 상품 룰이 적용되게 합니다.

## 승인 후 실행 순서
1. `mem://product/single-product-bm-ko` 생성
2. `mem://index.md` 전체 재작성 (Core 한 줄 + Memories 한 줄 추가)
3. (선택) 위 2개 기존 메모리 본문 점검 후 필요 시 갱신
