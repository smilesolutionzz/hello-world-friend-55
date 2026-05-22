## 목표
의료 진단 오해 리스크를 차단하기 위해 SEO 메타·검사 제목·결과 페이지 면책 고지를 일괄 정비합니다. AIHPRO는 "발달 코칭 & 의사결정 보조 도구"로 일관되게 포지셔닝합니다.

---

## 01. SEO 키워드·메타 리브랜딩

**index.html**
- `<title>`: "AI 심리검사·발달평가·전문상담 플랫폼" → "AI 마음 코칭·발달 분석·전문가 매칭"
- `<meta name="description">`: "ADHD·우울·스트레스 검사부터…" → "기분·집중력·스트레스 컨디션 체크부터 전문가 코칭까지"
- `<meta name="keywords">`: 전면 교체
  - 제거: 우울증테스트, 자가진단, ADHD검사, MBTI검사·테스트, 불안장애검사, 공황장애검사, 발달지연검사, 학습장애검사, 심리치료, 우울증극복, 불안해소
  - 추가: 마음코칭, 기분체크, 컨디션체크, 집중력체크, 성격분석, 회복탄력성분석, 발달분석, 마음건강, 코칭상담
- `og:title` / `og:description` / `twitter:*` / `me2:post_tag` 동일 톤으로 교체
- (참고) JSON-LD `<script>` 블록의 "우울증 자가진단/ADHD 선별검사" 문구도 함께 교체

**src/pages/Assessment.tsx (L820–825 SEOHead)**
- title: "AI 심리검사 — AIHPRO | ADHD·우울증·스트레스 자가진단" → "AI 마음 컨디션 체크 — AIHPRO | 기분·집중력·스트레스 코칭"
- description / keywords 동일 톤으로 교체

---

## 02. 간편 검사 제목·설명 리네이밍 (i18n)

**src/i18n/translations/ko.ts (L729–738)**
- `depressionTitle`: "우울감 자가체크" → "기분 컨디션 체크"
- `depressionDesc`: "우울감의 깊이와 일상 영향도를 정밀 측정합니다." → "최근 기분 변화와 일상 컨디션을 가볍게 점검합니다."
- `depressionFeatures`: "우울증 선별 기준" → "기분 패턴 분석", "전문가 상담 권고" → "전문가 매칭 안내"
- `adhdTitle`: "주의집중력 자가체크" → "집중력 컨디션 체크"
- `adhdDesc`: "ADHD 관련 증상의 유무와 정도를 빠르게 확인합니다." → "주의·집중 패턴과 일상 영향도를 가볍게 점검합니다."
- `adhdFeatures`: "주의력결핍/과잉행동 증상 체크" → "주의 패턴/활동성 패턴 분석"
- `panicTitle`: "불안감 수준 확인" → "불안 컨디션 체크"
- `panicDesc`/`panicFeatures`: "불안장애 선별" → "불안 패턴 분석"

**src/i18n/translations/ko.ts (L1097, L1117–1120 — 옛 심층 라벨)**
- `stressTitle`: "스트레스 자가진단" → "스트레스 컨디션 체크"
- `adhdTitle`: "ADHD 정밀검사" → "집중력 심층 분석"
- `adhdDesc`: "주의력결핍 과잉행동장애 심층분석." → "주의·집중 패턴 심층 코칭 분석."
- `depressionTitle`: "우울·불안 전문검사" → "기분·불안 심층 분석"
- `depressionDesc`: "임상급 우울증·불안장애 진단." → "전문가 톤의 기분·불안 컨디션 종합 분석."

**src/i18n/translations/en.ts (L709–718, L1084–1087)**
- 동일 변경: "Depression Self-Check" → "Mood Condition Check", "Attention Focus Self-Check" → "Focus Condition Check", "Clinical-grade depression & anxiety diagnosis" → "In-depth mood & anxiety condition analysis"

**src/i18n/translations/ko.ts L1608 / L1582 / L1016 (남은 "자가진단" 표현)**
- B2B 메타인지 영역의 "판단력 자가진단" → "판단력 컨디션 체크"

---

## 03. 종합 심리검사 리브랜딩

**ko.ts / en.ts**
- `premiumTitle`: "종합 심리분석" → "마음 컨디션 종합 분석"
- `premiumDesc`: "전문가 수준의 상세한 심리분석." → "전문가 톤의 마음 컨디션 종합 인사이트."
- `psychologicalTitle`: 현재 "연령별 맞춤체크" 유지 (이미 안전)
- `psychologicalDesc`: "연령대에 따라 맞춤형 심리상태를 종합적으로 점검합니다." → "연령대에 맞춰 마음 컨디션을 가볍게 점검합니다."

---

## 04. MedicalDisclaimer 결과 페이지 강제 노출

**현황**: 51개 result 컴포넌트 중 `MedicalDisclaimer` 또는 동등 면책 문구를 포함한 파일은 **0개**. (텍스트 노출은 있을 수 있으나 표준 컴포넌트 미사용)

**접근 방식 (중앙 집중형)**:
`src/pages/Assessment.tsx`의 18개 result-step 분기 블록에 `<MedicalDisclaimer variant="compact" className="mt-6" />`를 일괄 삽입.

대상 step 블록 (Assessment.tsx 라인 기준):
- L1367 language-result, L1447 depression-result, L1465 panic-result
- L1483 child-result, L1496 infant-result, L1509 adult-result
- L1541 adhd-result, L1574 stress-result
- L1608 bigfive-result, L1642 attachment-result
- L1812 developmental-delay-result, L1826 sensory-integration-result
- L1840 learning-disability-result, L1854 social-development-result
- L1869 challenging-behavior-result, L1879 adaptive-behavior-result
- L1889 selfesteem-result, L1907 career-result

**삽입 패턴** (각 result 블록 공통):
```tsx
<div className="container mx-auto max-w-4xl">
  <XxxResult ... />
  <MedicalDisclaimer variant="compact" className="mt-6" />  ← 추가
  <TrialUpsellBanner />  // 기존이 있는 경우 유지
</div>
```

**Assessment.tsx 밖에서 직접 라우팅되는 결과 페이지** (개별 추가 필요):
- `src/pages/FreeTrialResult.tsx`
- `src/pages/FunTestResult.tsx`
- `src/pages/AdvancedAdhdTest.tsx` (자체 결과 렌더)
- `src/pages/AnxietyPackage.tsx` / `DepressionPackage.tsx` / `StressPackage.tsx` (패키지 결과)

각 파일 최상단 import 추가 후 메인 결과 카드 아래 `<MedicalDisclaimer variant="compact" className="mt-6" />` 삽입.

---

## 작업 범위 요약
- 수정 파일: `index.html`, `src/pages/Assessment.tsx`, `src/i18n/translations/ko.ts`, `src/i18n/translations/en.ts`, 5개 독립 결과 페이지
- 추가 컴포넌트 임포트만 늘리고 신규 컴포넌트 생성 없음
- 메모리 Core 정책(진단/MBTI/PHQ-9 금지, 코칭 톤) 위반 포인트 일괄 제거

## 비기술 설명
"우울증/ADHD 자가진단"처럼 의료 진단처럼 들리는 표현을 SEO·검사 제목·결과 페이지에서 모두 "마음 컨디션 체크·코칭 분석"으로 바꾸고, 모든 검사 결과 화면 아래에 "이 결과는 의료 진단이 아닙니다"라는 표준 면책 고지가 자동으로 표시되도록 정리합니다.