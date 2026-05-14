# Quiz 결과 화면 — Soft Funnel CTA 리뉴얼

## 목표
현재 Quiz 결과 화면의 단일 CTA(₩19,900 결제만)로 인한 거부감을 줄이고, 결제 거절 유저에게도 다음 행동(무료 체험·전문가 상담·이메일 리드)을 제공해 funnel 이탈을 회수한다. **Primary 결제 CTA의 시각 위계는 그대로 유지**.

## 수정 대상
- `src/pages/Quiz.tsx` (line 1013~1058 영역, Pricing CTA 카드 직후)

## 변경 후 구조

```
[Pricing CTA 카드 — 그대로 유지]
  ₩19,900 결제하고 30일 트랙 시작 (Primary, 시각 강조 유지)
  └ "7일 100% 환불 보장" 문구는 그대로

[NEW] 결제 카드 바로 아래에 "아직 망설여진다면?" 섹션
  ┌─────────────────────────────────────┐
  │ 아직 결정하기 어렵다면              │
  │ 다른 방법으로 먼저 경험해 보세요    │
  ├─────────────────────────────────────┤
  │ ① 무료 자가 진단 더 해보기          │
  │    → /assessments (3개 무료 트라이얼)│
  │                                     │
  │ ② 전문가에게 먼저 상담받기          │
  │    → /expert-hiring                  │
  │                                     │
  │ ③ 내 리포트 미리보기 이메일로 받기  │
  │    → 비로그인이면 회원가입 유도     │
  │      로그인이면 즉시 발송           │
  └─────────────────────────────────────┘
```

## 디자인 원칙
- 메모리 준수: `bg-white` + `rounded-3xl`, no gradients/glass, gold 액센트(#C8B88A)는 구분선에만
- 3개 옵션은 **outline/ghost 스타일**로 결제 CTA보다 약하게
- 아이콘만 사용 (이모지 금지)
- "결제 안 해도 돼요" 같은 직접적 회피 문구는 금지 — "다른 방법으로 시작하기" 톤
- Mobile: 세로 stack, Desktop(md+): 3-column grid

## 기술 세부

### 1. 새 컴포넌트
`src/components/quiz/QuizSoftFunnelCTA.tsx` 신규 생성
- props: `userEmail?: string`, `isAuthenticated: boolean`
- 3개 카드 렌더링
- ③ 이메일 리포트는 기존 lead capture 패턴 활용 (이미 있는지 먼저 확인)

### 2. 이메일 리포트 발송
이미 존재하는 edge function 우선 활용 검토:
- `send-quiz-report-email` 또는 유사 함수 검색
- 없으면 단순 lead 저장만 (`quiz_email_leads` 테이블) + 추후 발송
- **이번 plan에서는 lead 저장까지만**, 실제 메일 발송은 별도 task

### 3. 라우팅
- ① `/assessments` (메모리 [Trial tests funnel] 무료 카테고리로 진입)
- ② `/expert-hiring` (메모리 [Expert matching] 표준 라우트)
- ③ 회원가입 모달 또는 `/auth?redirect=/quiz&action=email_report`

### 4. 전환 추적
3개 CTA 모두 `trackEvent('quiz_soft_cta_click', { option })` 호출 (기존 tracking 헬퍼 사용)

## 메모리 신규 추가
- `mem://ux/conversion/quiz-soft-funnel-ko` — Quiz 결과 화면은 Primary 결제 + 3개 Secondary 무료 옵션(자가진단·전문가상담·이메일 리포트) 구조 유지

## 비범위 (이번엔 안 함)
- 3일 무료체험 / 토스 빌링키 자동결제 — BM 정책·결제 인프라 검토 필요, 별도 plan
- Quiz를 홈 진입 첫 화면으로 강제 — SEO/B2B 리스크, PostHog 데이터 본 뒤 결정
- 메일 실제 발송 로직 — lead 저장만 우선

## 검증
- `/quiz` 끝까지 진행 → Primary CTA 시각 위계 유지 확인
- 3개 secondary 버튼 라우팅 정상 동작
- 모바일 viewport (791px)에서 stack 레이아웃 깨지지 않음
