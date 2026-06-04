# 센터 스토어 (Center Storefront) — WAVE 1.5

## 무엇을 만드는가
B2B 센터 운영자가 콘솔 안에서:
1. **운영 프로그램** (예: ABA 8주 코스, 부모교육 4주) 카드 등록
2. **추천 교구·도서·자료** (외부 구매 링크 / Cafe24·쿠팡·자사몰) 카드 등록
3. 등록된 카드는 공개 페이지 `/center/{slug}` 또는 `/partner/{slug}` 에서 학부모가 바로 신청·구매 클릭

→ 케어플/바우처리에 없는 차별화 포인트. 케어플은 "고객/회기/수납"만, 우리는 "그 위에 센터가 자기 IP/굿즈도 팔 수 있게."

## 왜 새 테이블을 만들지 않는가
이미 다음이 존재합니다 (코드 확인 완료):
- `partner_programs`(title, category, target_age, duration_text, price_krw, cta_url, sort_order, is_published)
- `partner_products`(title, kind, author, price_krw, external_buy_url …)
- `partner_owners` (user_id ↔ partner_slug)
- `partner_content_clicks` (전환 추적)
- `src/pages/PartnerConsole.tsx` — 운영자 편집 UI 풀세트
- `src/pages/PartnerDetail.tsx` — 공개 노출 페이지
- 이미지 업로드 `partner-media` 버킷 + AI 카드 초안 함수 `partner-program-assistant` 까지

**그대로 재사용**합니다. 센터마다 partner_slug 하나를 자동 발급해 묶기만 하면 됩니다.

## 데이터 변경 (1 migration)
`center_organizations` 에 컬럼 1개 추가:
- `storefront_slug TEXT UNIQUE NULL` — 발급 전엔 null, 발급 시 partner_slug 와 동일 값.

RPC `ensure_center_storefront(_center_id uuid)`:
- 권한: 해당 센터의 owner/admin 만.
- 동작: slug 없으면 `center-{shortid}` 로 생성 → `center_organizations.storefront_slug` 업데이트 → `partner_owners`에 호출자 user_id로 row 삽입. 멱등.
- 결과로 slug 반환.

추가 테이블 없음. RLS는 기존 partner_* 정책 그대로 사용 (owner만 쓰기, 공개 SELECT는 is_published).

## 콘솔 UI 변경
사이드바에 신규 항목 1개:
- **스토어** (`/b2b-center/app/storefront`) — `Store` 아이콘

신규 페이지 `CenterStorefrontPage.tsx`:
- 진입 시 `ensure_center_storefront` 호출 → slug 확보
- 상단: "공개 URL: /center/{slug}" + 복사 + 새 탭 미리보기 버튼
- 본문: 기존 `PartnerConsole` 의 두 섹션(운영 프로그램 / 도서·굿즈) 를 그대로 임베드. `PartnerConsole` 의 데이터 로직을 작은 훅(`usePartnerCatalog(slug)`)으로 1차 추출해 재사용하거나, 가장 빠른 길은 `<PartnerConsole embeddedSlug={slug} hideHeader />` 식의 props 분기.
- AI 카드 초안 버튼은 기존 `partner-program-assistant` 그대로 사용 (기관명/유형을 센터 정보로 전달).

## 공개 노출
- 새 라우트 alias: `/center/:slug` → 내부적으로 `PartnerDetail` 재사용 (헤더 카피만 "센터" 톤으로 살짝 분기, `variant="center"`).
- 기존 `/partner/:slug` 도 계속 동작 (외부 협력기관용).
- 센터 공개 페이지 상단에 "상담 문의" CTA → 기존 `center_inquiries` 테이블로 인입 (이미 있음).

## 결제 모델
- v1: **외부 링크 방식만**. `external_buy_url` (자사몰/쿠팡/Cafe24/스마트스토어 어디든). 클릭 → `partner_content_clicks` 로깅.
- 이유: 결제·세금·환불을 센터가 자기 채널에서 처리. 우리는 노출/리드만. 법적·운영적 부담 0.
- v2 (선택, 이번 wave 아님): Stripe Connect 또는 토스 셀러 분배로 자체 체크아웃. 메모리에 남겨두고 PMF 후 결정.

## 작업 순서
1. Migration: `center_organizations.storefront_slug` + `ensure_center_storefront` RPC.
2. `src/lib/b2bCenter/centerStorefront.ts` — slug 발급/조회 헬퍼.
3. `src/pages/b2b-center/console/CenterStorefrontPage.tsx` — slug 보장 → PartnerConsole 재사용.
4. `PartnerConsole` 에 `embeddedSlug` / `hideChrome` props 추가 (기존 단독 사용은 유지).
5. `App.tsx` 라우팅: `/b2b-center/app/storefront` 추가, `/center/:slug` alias 추가.
6. `B2BCenterApp.tsx` 사이드바에 "스토어" 추가.
7. `PartnerDetail` 에 `variant` 분기로 카피만 살짝 조정.
8. 메모리 업데이트: `mem://features/b2b/center-storefront-ko`.

## 빠지는 것 (의도적)
- 결제·정산: v1 범위 외.
- 재고관리: 외부몰이 담당.
- 별도 CMS: AI 초안 버튼이 이미 카피라이팅을 대신함.

이렇게 가면 추가 테이블 1개도 없이, 며칠 안에 "센터가 자기 프로그램·교구를 학부모에게 직접 노출/판매하는" 모듈을 띄울 수 있습니다.
