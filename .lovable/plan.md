# 협력기관 프로그램·도서 홍보 마켓

`/expert-hiring` 협력기관(47곳) 섹션에 각 기관이 직접 **운영 프로그램**과 **추천 도서/굿즈**를 썸네일과 함께 노출할 수 있는 마켓 레이어를 추가합니다. 기관은 전용 콘솔에서 콘텐츠를 직접 등록하고, 방문자는 카드 → 상세 → 외부 신청/구매 링크로 전환됩니다.

---

## 01. 사용자 흐름

1. 방문자: `/expert-hiring` → "협력기관(47곳)" 탭
   - 기관 카드 하단에 "운영 프로그램 N · 추천 도서 M" 미리보기 chip
   - 카드 클릭 → `/partner/:slug` 기관 상세 페이지
     - **프로그램 섹션**: 썸네일 그리드, 가격·기간·대상연령·정원·신청 버튼(외부 링크/카카오 채널/전화)
     - **도서·굿즈 섹션**: 썸네일 + 가격 + 외부 구매 링크(Cafe24/스마트스토어/예스24 등)
2. 기관 운영자: `/partner-console` (로그인 + `partner_owner` 권한 필요)
   - 기관 프로필(대표 이미지·소개·연락처) 편집
   - 프로그램 CRUD (썸네일 업로드, 카테고리, 가격, 대상, CTA URL)
   - 도서·굿즈 CRUD (썸네일, 가격, 외부 구매 링크, 짧은 추천 문구)
   - 노출 순서 드래그 정렬, 게시/비공개 토글
3. 관리자(`/admin`): 신규 기관 승인 + 게시물 모더레이션 탭

---

## 02. 데이터 모델 (신규 4개 + 1개 컬럼)

- `partner_institutions`에 `slug text unique`, `owner_user_id uuid`, `cover_image_url text`, `intro text`, `contact_kakao text`, `contact_phone text`, `is_published bool default false` 추가 (없는 컬럼만)
- `partner_programs` — `institution_id`, `title`, `thumbnail_url`, `category`, `target_age`, `duration_text`, `price_krw`, `currency`, `cta_label`, `cta_url`, `description`, `sort_order`, `is_published`
- `partner_products` (도서/굿즈) — `institution_id`, `title`, `thumbnail_url`, `kind('book'|'goods'|'kit')`, `author`, `price_krw`, `external_buy_url`, `description`, `sort_order`, `is_published`
- `partner_owners` — `institution_id`, `user_id`, `role('owner'|'editor')` (운영자 권한 매핑)
- `partner_content_clicks` — `institution_id`, `content_type`, `content_id`, `user_id?`, `created_at` (전환 추적)

### RLS 요약
- 공개 SELECT: `partner_programs/products` where `is_published=true` AND 기관 `is_published=true` (anon/authenticated)
- 운영자 CRUD: `partner_owners`에 매핑된 user만, 자기 기관 한정
- `partner_owners` 본인 행만 SELECT, 관리자(`has_role(uid,'admin')`) 전체
- `partner_content_clicks` INSERT anon 허용 / SELECT 운영자·관리자

### Storage
- 새 버킷 `partner-media` (public read, 운영자만 write, 본인 기관 폴더 한정)

---

## 03. UI 구성

### 협력기관 카드 (기존 `ExpertHiring.tsx` 협력기관 탭)
- 카드 하단에 chip 2개: `프로그램 N` `도서 M` (값이 0이면 미노출)
- 클릭 → `/partner/:slug` 라우트

### `/partner/:slug` (신규 페이지)
- 히어로: cover_image + 기관명 + 인증 배지 + 소개
- 탭 2개: **운영 프로그램** / **추천 도서·굿즈**
- 카드 그리드(모바일 2열 / md 3열 / lg 4열), `rounded-2xl bg-white shadow-sm`, 가격 정렬 옵션
- 하단 CTA: 카톡 문의 / 전화 / 위치
- 클릭 시 `partner_content_clicks`에 INSERT (전환 트래킹)

### `/partner-console` (신규)
- 좌측: 기관 프로필 · 프로그램 · 도서/굿즈 · 통계 탭
- 프로그램/도서 등록 폼: 썸네일 드래그 업로드(Supabase Storage), 가격(₩), CTA URL, 게시 토글, 미리보기
- 통계 탭: 노출/클릭 수 (지난 30일)

### `/admin` CRM 허브
- 새 탭 "협력기관 콘텐츠": 미게시/신규 등록 모더레이션 큐 + 운영자 초대 링크 발급

---

## 04. 기술 메모

- 디자인: 기존 화이트 미니멀 + 골드 액센트(`#C8B88A`) 유지, 그라데이션·이모지 금지
- 상태관리: React Query (`partner_programs`, `partner_products` per slug)
- 파일 업로드: Supabase Storage `partner-media/{institution_id}/...`, 클라이언트에서 1200px webp 리사이즈
- 라우팅: `App.tsx`에 `/partner/:slug`, `/partner-console`, 가드는 `useAuthGuard` + `partner_owners` 체크 훅
- 기존 하드코드된 `src/data/partnerInstitutions.ts`는 DB 시드 + 폴백으로 유지 (slug 매핑 마이그레이션)
- `tokenCosts.ts` 가격 정책과 무관(외부 결제 링크만), 자체 결제 흐름 없음 — 메모리상 단일상품 BM 위배 없음
- 콘솔 가격 입력은 KRW 정수, DB에는 `price_krw`로 저장. 가격 노출은 컴포넌트에서 `₩{n.toLocaleString()}`

---

## 05. 범위·비범위

**범위(이번 PR)**
- DB 스키마 + Storage 버킷
- `/partner/:slug` 공개 페이지
- `/partner-console` 프로필·프로그램·도서 CRUD
- 협력기관 카드에 chip + 라우팅
- 관리자 모더레이션 탭 1개

**비범위(후속)**
- 자체 결제·장바구니(외부 링크만 사용)
- 리뷰·평점 시스템
- 프로그램 예약 캘린더(현재는 외부 CTA만)
- 이메일 알림(클릭 임계치 도달 시) — Resend 연동은 다음 단계

---

## 06. 확인 필요

1. **결제 방식**: 외부 구매·신청 링크만 노출(스마트스토어/카페24/카카오 채널 등)으로 진행해도 될까요, 아니면 자체 결제까지 붙여야 할까요? (현재 단일상품 BM 정책상 외부 링크 권장)
2. **운영자 권한 부여**: `partner_owners` 매핑은 관리자가 수동 초대(메일/링크) 방식으로 시작해도 괜찮을까요?
3. **도서 외 굿즈/키트도 함께 허용**할지 (`kind` 컬럼으로 분리 노출 가능)
