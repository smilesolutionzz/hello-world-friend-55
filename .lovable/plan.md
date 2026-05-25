# B2B 전용 랜딩 페이지 신설 계획

## 1. 진입 동선 (헤더 토글)

`src/components/navigation/UnifiedNavigation.tsx`

- 현재 nav 중앙의 "기업" 메뉴 항목을 **우측 상단 모드 토글**로 승격
- 로고 옆 또는 우측 (로그인 버튼 왼쪽)에 다음 토글 추가:

```
[ 개인용  |  기업용 ]
```

- 클릭 시 `/` ↔ `/business` 전환
- 현재 경로가 `/business*`, `/b2b*` 면 "기업용" 활성 표시
- 모바일 햄버거 메뉴 상단에도 동일 토글 노출
- 기존 nav 배열의 "기업" 항목은 제거 (토글로 대체되어 중복)

## 2. /business 페이지 전면 리뉴얼

`src/pages/Business.tsx` (기존 6개 카드 허브 형태 → 풀 랜딩으로 교체)

상하 섹션 구조 (premium white minimalism, 골드 #C8B88A 액센트):

```
[Hero]
  - "조직의 마음건강을 데이터로 운영합니다"
  - 서브: 직원 익명 코칭 + 부서별 집계 리포트
  - CTA: [도입 상담 신청] [화이트라벨 데모 받기 30초]
  - 신뢰 배지: 5명 미만 마스킹 · 동의 기반 · 비의료 코칭

[솔루션 4개 카드] — 메인 콘텐츠
  1. 직장 정신건강 잡코치 (B2B JobCoach)
     - 번아웃 히트맵 · 익명 1:1 코칭 · ROI 추정
     - "자세히 보기" → #jobcoach 앵커 or /b2b-jobcoach 상세
  2. 학교 · 상담센터 · 복지기관
     - 월간 발달 코칭 리포트 · 지자체 보고 양식
     - "자세히 보기" → /b2b-proposal?segment=institution
  3. EAP / 임직원 상담 패키지
     - 전문가 상담 시간 묶음 (5/10/20/30h)
     - "자세히 보기" → /expert-hiring?b2b=1
  4. 화이트라벨 데모 리포트
     - 30초 샘플 PDF 생성기
     - "데모 만들기" → /b2b-demo-report

[3단계 도입 흐름]
  01 도입 문의 → 02 익명 코칭 시작 → 03 부서별 집계 리포트

[ROI 계산기]  — 기존 BusinessROICalculator 재사용

[가격/플랜 요약]
  - 직원 1인당 월 단가 + "전체 가격표" → /b2b-pricing
  - 가격은 useB2BJobcoachPlans 훅에서 DB로 읽기

[도입 사례 3개] — businessCaseStudies 데이터 활용
  - "전체 사례" → /business/case-studies

[보안 · 컴플라이언스 신뢰 섹션]
  - 5명 미만 마스킹, 동의 파이프라인, 비의료 코칭 디스클레이머

[Footer CTA]
  - [도입 상담 신청] (주) + [견적서 즉시 받기] (보조)
  - QuoteRequestDialog 연결
```

## 3. 분산 페이지 통합/리다이렉트

| 기존 경로 | 처리 |
|---|---|
| `/b2b-jobcoach` | **유지** (잡코치 상세 페이지) — /business 에서 카드 → 진입 |
| `/b2b-demo-report` | **유지** (데모 리포트 도구) |
| `/b2b-proposal` | **유지** (도입 제안서 도구) |
| `/b2b-pricing` | **유지** (전체 가격표) |
| `/business/case-studies` | **유지** |
| `/eap-service` | `/business#eap` 앵커로 **리다이렉트** (페이지 미존재 → 404 방지) |
| `/b2b-consulting` | `/business#contact` 로 **리다이렉트** |
| `/b2b` | 이미 `/business` 리다이렉트 (유지) |

`src/components/landing/B2BShowcaseSection.tsx` 의 끊어진 링크 (`/b2b-consulting`, `/eap-service`)를 `/business` 로 갱신.

## 4. 메인 페이지(`/`) 노출 정리

- `src/pages/Index.tsx`에서 `B2BShowcaseSection` 또는 `B2BEntryBanner` 중 **하나만 유지** (현재 둘 다 노출 가능). 하단 1개 "기업/기관이세요? → /business" 짧은 배너로 통일.
- 헤더 토글이 메인 진입점이므로 메인 배너는 보조 역할.

## 5. SEO

- title: "AIHPRO 기업용 — 조직 마음건강 SaaS" (<40자)
- desc: 직원 익명 코칭과 부서별 집계 리포트, EAP 패키지로 조직 마음건강을 데이터로 관리 (<80자)
- canonical: `/business`
- JSON-LD: Organization + Service

## 기술 세부 (개발자용)

- 신규 컴포넌트:
  - `src/components/navigation/AudienceModeToggle.tsx` — B2C/B2B 세그먼트 토글
  - `src/components/business/BusinessHero.tsx`
  - `src/components/business/SolutionMatrix.tsx` (4개 카드)
  - `src/components/business/BusinessSteps.tsx`
  - `src/components/business/BusinessFooterCTA.tsx`
- 기존 재사용: `BusinessROICalculator`, `BusinessSEO`, `QuoteRequestDialog`, `B2BJobCoachSection` 일부, `businessCaseStudies` 데이터
- 가격: `useB2BJobcoachPlans` 훅 사용 (DB → 하드코딩 금지)
- 라우트 추가: `/eap-service`, `/b2b-consulting` → `<Navigate to="/business" replace />` (앵커 hash 포함)
- 분석: `trackB2BEvent('mode_toggle', ...)`, 카드 클릭마다 `trackB2BEvent('solution_card_click', ...)`
- 디자인 토큰만 사용 (white, gold #C8B88A, rounded-2xl/3xl, no gradients)
- 모바일: break-keep, 4카드는 모바일 1열 / 태블릿 2열 / 데스크탑 4열

## 작업 순서

1. `AudienceModeToggle` 컴포넌트 + UnifiedNavigation 데스크탑/모바일 통합
2. `/business` 리뉴얼 (Hero → Solutions → Steps → ROI → Pricing → Cases → Trust → CTA)
3. `B2BShowcaseSection` / `B2BEntryBanner` 링크 정리 + Index.tsx 정돈
4. `/eap-service`, `/b2b-consulting` 리다이렉트 라우트 추가
5. 빌드 확인 + 모바일 뷰포트 점검
