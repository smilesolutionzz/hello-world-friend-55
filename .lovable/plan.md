# B2B 구조 정리 Phase 1: Cleanup + Hub

영업 미팅에서 한 줄로 보낼 수 있는 B2B 진입점을 만들고, 미사용 코드를 제거합니다.

---

## 1. 죽은 코드 제거

라우팅에 등록되지 않아 접근 불가능한 미사용 페이지를 삭제합니다.

- `src/pages/InstitutionAdmin.tsx` (744줄) 삭제
- `src/pages/InstitutionOnboarding.tsx` (418줄) 삭제
- `App.tsx`에 import가 남아있다면 정리 (없을 가능성 높음)
- 두 파일을 참조하는 다른 컴포넌트가 있는지 `rg`로 한 번 더 확인 후 안전하게 삭제

---

## 2. `/business` 허브 페이지 신규 생성

기존 흩어진 4개 B2B 페이지의 **단일 진입점**.

**파일:** `src/pages/Business.tsx`
**라우트:** `/business` (App.tsx에 등록)

### 페이지 구성 (위에서 아래로)

```text
[Hero]
  타이틀: "조직의 마음건강을 데이터로 관리합니다"
  서브: 익명성 보장 · HR은 집계만 열람 · 5명 미만 자동 마스킹
  CTA(메인): "도입 상담 신청" → /b2b-proposal
  CTA(보조): "데모 리포트 보기" → /b2b-demo-report

[ROI 한 줄 배너]
  "직원 1명 결근일 1일 = 평균 임금 손실 + 생산성 손실"
  (계산기는 추후 추가, 지금은 카피만)

[3-Step 도입 흐름]
  01 도입 문의 → 02 직원 익명 코칭 시작 → 03 부서별 집계 리포트

[B2B 자산 카드 그리드 — 4개]
  - 잡코치 솔루션 소개      → /b2b-jobcoach
  - HR 대시보드 미리보기    → /b2b-hr-dashboard
  - 화이트라벨 데모 리포트  → /b2b-demo-report
  - 도입 문의 / 견적 요청   → /b2b-proposal

[신뢰 지표]
  · 5명 미만 자동 마스킹
  · 직원 동의 기반 데이터 파이프라인
  · 비의료 코칭 도구 (MedicalDisclaimer 톤)

[Footer CTA]
  "도입 상담 신청" 버튼 1개
```

### 디자인 규칙 (메모리 준수)
- `bg-white`, `rounded-2xl/3xl`, 그라데이션/글래스 금지
- 골드 액센트 `#C8B88A`, 번호 `01/02/03`
- Pretendard(KR) + Space Grotesk(EN)
- 이모지 금지, 마크다운 표 금지
- "AI/진단" 단어 회피, "전문가 종합 분석" 톤
- `MedicalDisclaimer` / `CoachingBadge` 활용

### SEO
- Title: "AIHPRO 비즈니스 — 조직 마음건강 솔루션" (40자 이내)
- Description: 익명성·HR 집계·도입 흐름 한 줄 (80자 이내)

---

## 3. 헤더 진입점 추가

메모리 [B2B navigation]에 따르면 메인 nav에는 B2B를 숨기는 정책이 있으나, **`/business` 허브 1개는 예외로 추가**합니다 (영업 미팅 핵심 동선).

- 헤더 우측 보조 링크에 "기업 (Business)" 1개 추가 → `/business`
- 모바일 햄버거 메뉴에도 동일 항목 추가
- 기존 `/b2b-jobcoach`, `/b2b-proposal` 등은 nav에서 노출하지 않음 (허브를 통해 진입)

---

## 4. 검증

- `/business` 직접 방문 시 정상 렌더
- 4개 카드 클릭 시 각 페이지로 이동
- 모바일 800px 뷰포트에서 카드 그리드가 1열로 정렬
- `InstitutionAdmin` / `InstitutionOnboarding` 삭제 후 빌드 에러 없음

---

## 다루지 않는 것 (다음 Phase)

- Case Study 페이지 — 첫 고객 확보 후
- 보안/익명성 백서 — PDF로 별도 제작
- ROI 계산기 위젯 — `/business` 반응 보고 추가
- `/b2b-proposal` 스코프 재정의 — 별도 작업으로

승인하시면 바로 진행합니다.
