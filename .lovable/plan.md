## 현재 상태 진단

기존 코드베이스에 이미 있는 것:
- **마음트랙 코어**: `/mind-track`, `MindTrackDashboard`, `MindTrackWorkbook`, Toss Billing(`mind_track_30` ₩19,900) — 이미 단일 상품 BM 메모리에 잠겨있음
- **B2B**: `/business`, `/b2b-proposal`, `/business-case-studies`, `B2BJobCoach`, `InstitutionClientDashboard`, `InstitutionApplication`
- **발달 검사**: `ChildPackage`, `ParentAssessment`, `ADHDScreening`, `AdvancedAdhdTest`, `GrowthDevelopmentReport`, `UnifiedAssessmentHub`
- **추천/리퍼럴**: `/referral`
- **운영자 소개**: `/about`
- **결제**: usePayment.ts에 `mind_track_30` 흐름 완성

따라서 클로드코드 조언 중 **새로 만들 가치가 있는 것만** 골라서 최소로 추가.

---

## 이번 라운드에 추가할 것 (placeholder만, 다음 단계에서 채움)

### A. 라우트 신설 (placeholder 페이지)
1. **`/track/adult`** — Coming Soon (성인 트랙 2차)
2. **`/track/teen`** — Coming Soon (청소년 트랙 2차)
3. **`/c/:slug`** — 발달센터별 추천 랜딩 (동적). 슬러그로 `organizations` 조회, 추천 코드 캡처해서 `localStorage` + 결제 시 enrollment에 전달
4. **`/beta`** — 베타 1기 모집 (쿼리 `?code=` 검증, 신청 폼)
5. **`/reviews`** — 졸업 후기 모음
6. **`/about/expert`** — 운영자 14년 임상 신뢰 페이지 (기존 `/about`와 별도 — 결제 직전 신뢰 시그널 전용)

### B. 라우트 alias (기존 페이지 재사용, 새 페이지 만들지 않음)
- `/track/child` → `/mind-track` 리다이렉트 (또는 동일 컴포넌트)
- `/b2b` → `/business`
- `/b2b/dev-center` → `/b2b-proposal?segment=dev-center`
- `/b2b/counseling` → `/b2b-proposal?segment=counseling`
- `/tests/child-development` → `/child-package` (기존 자녀 검사 패키지)
- `/app/parent` → `/dashboard` (DashboardRouter가 이미 역할별 라우팅)
- `/app/center` → `/institution-client-dashboard`
- `/app/center/clients` → `/institution-client-dashboard` (탭 파라미터)

### C. 명시적으로 **추가하지 않을** 것 (이미 충분 / 메모리 정책 위반)
- ❌ 새 검사 6종 seed (PHQ-A, SCARED, K-DST 등) — `IP risk mitigation` 메모리상 PHQ/MBTI 등 임상 도구명 사용 금지. 기존 자체 브랜딩 검사로 대체
- ❌ 새 Edge Function `score-assessment`, `invite-parent`, `toss-issue-billing-key`, `generate-graduation-pdf` — Toss billing은 `unified-payment`로 이미 작동, 점수 채점은 기존 `save-test-result` 등에 있음
- ❌ 가격 ₩99,000 / ₩69,000 / ₩49,000 하드코딩 — 메모리 잠금: **자체 결제는 `mind_track_30` ₩19,900 단일 상품**. 파트너/도매 가격은 상담 수익 셰어 로직으로 별도 처리
- ❌ Day 30 졸업 페이지 별도 신설 — `MindTrackDashboard`에 Day 30 섹션 추가가 더 적합

---

## 파일 변화 (모두 가벼움)

신규 placeholder 페이지 6개 (각 ~30줄, 디자인 토큰 사용, 다음 라운드에서 본문 채움):
- `src/pages/TrackAdultComingSoon.tsx`
- `src/pages/TrackTeenComingSoon.tsx`
- `src/pages/CenterReferralLanding.tsx` (`/c/:slug`)
- `src/pages/BetaRecruitment.tsx`
- `src/pages/Reviews.tsx`
- `src/pages/AboutExpert.tsx`

`src/App.tsx` Routes 블록에 8개 라우트 추가 (신규 6 + alias 2~3개 Navigate).

---

## 다음 라운드 후보 (지금은 안 만듦)

승인 시 이어서:
1. `/about/expert` 본문 디자인 (결제 전환용 신뢰 페이지)
2. `/c/:slug` 발달센터 organization 조회 + referrer 추적 로직
3. `/beta` 신청 폼 → `organizations.sales_status='pilot'` 등록 (DB 마이그레이션 필요)
4. `/reviews` — 졸업 후기 DB 스키마 + 메인 하단 위젯

---

## 확인 부탁

이 범위로 진행해도 될까? 특히:
- **가격 정책**: ₩99,000 등 새 가격은 메모리상 금지된 상태인데, 정말 단일 상품 정책을 깨고 새 가격 체계로 가고 싶은 거야? 아니면 기존 ₩19,900 마음트랙 30일 위에 파트너 셰어만 얹는 거야?
- **새 검사 6종**: 임상명(PHQ-A 등) 그대로 갈지, 아니면 기존처럼 자체 브랜딩으로 갈지?

이 두 가지는 답에 따라 다음 라운드 작업 범위가 크게 갈려.