# Noom-Grade Closing Plan — 마음트랙 30일 v2

답변 반영: **(1) 단일 결과 숫자**, **(2) 코치 비동기 채팅(현 AI/전문가 자원 그대로)**, **(3) Before/After 졸업 후기**, **(4) 스트릭+푸시 루프** 4가지 갭을 모두 닫고, BM은 **30일 후 자동갱신을 옵션**으로 추가합니다. 가격은 ₩19,900 단일 유지.

---

## 트랙 1 — 마음 컨디션 점수 시스템 (P0, 4일)

**목표:** 사용자가 30일 동안 "내 점수가 72 → 85로 올랐다"를 한 숫자로 보게 한다.

- 신규 테이블 `mind_condition_scores`: `user_id`, `score`(0–100), `dimensions`(jsonb: 정서·수면·관계·집중·회복탄력성), `source`(self_check / ai_inference / assessment), `recorded_at`
- 점수 산출 RPC `calculate_mind_condition_score(user_id)`: 최근 자가체크 + 워크북 진척도 + 감정 추적(`progress_tracking`) + 최근 검사 결과를 RCI 가중치로 0–100 정규화
- UI:
  - `/dashboard` 메인에 큰 점수 링 위젯 (`MindConditionRing`), Day1 vs 오늘 델타 표시 (+13)
  - `/my-journey`에 30일 라인 차트 추가 (이미 있는 longitudinal dashboard 확장)
  - 졸업 시 "졸업 카드" 자동 생성 — 닉네임/시작점수→종료점수/주요 변화 (PNG 공유용)
- 기록 트리거: 자가체크 제출, 워크북 단계 완료, 검사 완료 시 자동 insert

## 트랙 2 — 코치 비동기 채팅 (P0, 5일) — 현 자원 활용

방향: **AI 코치를 메인**으로, 위험 신호/사용자 요청 시 **기존 `/expert-hiring` 단건 상담으로 escalate**. 가격 변경 없음.

- 신규 테이블 `coach_conversations` (사용자당 1개), `coach_messages`(`role`: user/coach, `content`, `is_ai`, `expert_id` nullable, `created_at`)
- 신규 페이지 `/coach` — Noom-style 카톡 인터페이스 (AI 응답 마크다운 렌더, 풀 컨버세이션 히스토리 전송)
- Edge function `coach-reply`: Gemini 3.1, 시스템 프롬프트에 "이서연 코치" 페르소나(따뜻한 행동 코치, 비의료 톤, 위기 키워드 감지 시 `/expert-hiring?urgent=true` 안내)
- Daily nudge: 매일 오전 9시 AI가 먼저 메시지 1통 (cron + `coach-daily-nudge` edge fn)
- 위기/심층상담 요청 감지 시 채팅 안에 `<ExpertEscalationCard />` 노출 → 기존 expert-hiring 단건 상담으로 라우팅 (이미 있는 인프라 재사용)

## 트랙 3 — 졸업 후기 시스템 (P1, 3일)

- 신규 테이블 `graduation_stories`: `user_id`, `display_name`, `start_score`, `end_score`, `headline`(한줄), `body`, `is_published`, `consent_given`
- 졸업 시점(Day 30 자가체크 완료) 모달 자동 노출 → "이야기 남기기" 폼
- `/reviews` 페이지: 카드 그리드 (닉네임 · +N점 · 한줄 후기 · 변화 요약)
- 시드 5건은 운영팀이 어드민 수동 입력 (`/admin/stories` 관리 UI 포함)
- 랜딩페이지 `/mind-track` 하단 "30일 후, 이렇게 달라졌습니다" 섹션에 최근 6건 자동 노출

## 트랙 4 — 스트릭 + 푸시 압박 루프 (P1, 3일)

- 신규 테이블 `user_streaks`: `user_id`, `current_streak`, `longest_streak`, `last_check_at`, `freeze_used`(월 1회 끊김 방지)
- 자가체크/워크북/코치 메시지 중 1개라도 하면 그날 스트릭 +1
- UI:
  - 대시보드 우상단 🔥 N일 뱃지 (디자인: 골드 #C8B88A, 흰 배경 원칙 유지)
  - D-Day 카운터 ("30일 트랙 D-12")
  - 끊김 위험(20시 기준 미실행) → 푸시/이메일 알림 (web push + 이미 있는 `daily-coaching-email` 활용)
  - 7/14/30일 마일스톤 셀러브레이션 모달
- 기존 `daily_coaching_email_log`와 연동, 알림 빈도 사용자 설정 페이지 `/notifications`

## 트랙 5 — 30일 후 자동갱신 옵션 (P1, 4일)

자체 결제 단일상품 정책 유지 — `mind_track_30` 동일 ₩19,900을 30일마다 자동 청구하는 **선택 옵션**만 추가.

- 결제 페이지에 토글: "30일 후 자동 연장 (해지는 언제든지)" — 기본 OFF
- Toss Billing Key 플로우 활용 (이미 있는 `auto-renewal-status` 인프라 재사용)
- 컬럼 추가: `user_subscriptions.auto_renew`(bool), `next_charge_at`
- 갱신 D-3 알림 이메일 + 설정 페이지에서 1클릭 해지
- 갱신 실패 시 grace 3일 + 재시도 후 비활성

---

## 기술 세부

```text
DB 변경
├─ mind_condition_scores (신규)
├─ coach_conversations, coach_messages (신규)
├─ graduation_stories (신규)
├─ user_streaks (신규)
└─ user_subscriptions: + auto_renew, next_charge_at

Edge Functions (신규)
├─ calculate-mind-score (RPC 래퍼)
├─ coach-reply (Gemini 3.1 medium)
├─ coach-daily-nudge (cron)
└─ subscription-renew-charge (cron, Toss Billing)

UI 신규/확장
├─ src/components/mind-condition/MindConditionRing.tsx
├─ src/pages/Coach.tsx + CoachMessage 컴포넌트
├─ src/pages/Reviews.tsx (졸업 후기)
├─ src/components/streak/StreakBadge.tsx
└─ src/pages/CheckoutMindTrack.tsx 자동갱신 토글
```

가격 상수는 `src/constants/tokenCosts.ts`에서만 읽는 기존 정책 유지. 모든 신규 UI는 흰 배경 + `rounded-2xl/3xl` + 골드 액센트 표준 준수.

---

## 2주 실행 순서

| 일정 | 작업 |
|---|---|
| Day 1–4 | 트랙 1 (마음 컨디션 점수) — 가장 임팩트 큼, 모든 트랙의 기반 |
| Day 5–9 | 트랙 2 (코치 채팅) — Noom 카피의 핵심 차별화 |
| Day 10–12 | 트랙 4 (스트릭 루프) — 점수+채팅과 동시 가시화 |
| Day 13–15 | 트랙 3 (졸업 후기) — 시드 5건 + /reviews + 랜딩 노출 |
| Day 16–19 | 트랙 5 (자동갱신 옵션) — 결제/billing 안정화 |
| Day 20 | 통합 QA — 전체 30일 시뮬레이션, 푸시·이메일·갱신 점검 |

## Go/No-Go 게이트

- 점수 시스템: 새 사용자 가입→Day1 점수 자동 산출 < 2초
- 코치 채팅: 평균 응답 < 5초, 위기 키워드 감지율 100%
- 스트릭: 끊김 위험 알림 발송 정확도 > 95%
- 자동갱신: 모의 갱신 1회 성공 + 1클릭 해지 검증

## 메모리 영향

- `mem://product/single-product-bm-ko` 갱신: 자동갱신 옵션은 **단일 상품 내 옵션**임을 명시 (새 상품 아님)
- 신규 메모리 후보: mind condition score system, coach conversation system, streak system

승인하시면 트랙 1(마음 컨디션 점수)부터 마이그레이션 작성을 시작합니다.
