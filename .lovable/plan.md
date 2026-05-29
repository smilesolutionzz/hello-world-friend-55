# Action Track 전문가화 + 큐레이션 + 아침 코칭 메일 강화 플랜

## 목표

지금의 "오늘 미션"을 **오은영·최민준·ABA 행동분석가 수준의 명확한 솔루션 카드**로 격상합니다. 카드 하나에 (1) 진단 요약 → (2) 오늘 취할 액션 → (3) 그 근거 → (4) 뾰족하게 매칭된 영상 → (5) (발달 트랙) 관찰 포인트·추천 장난감/도서까지 한 흐름으로 제공합니다. 그리고 동일한 내용을 **해당 요일 아침에 코칭 이메일**로 자동 발송합니다.

---

## 01 데이터 모델 (마이그레이션 1건)

새 테이블 `mind_track_action_prescriptions` — 사용자×Day별로 생성된 전문가 솔루션 카드 캐시.

```text
mind_track_action_prescriptions
├─ enrollment_id (FK), day_number
├─ track_focus            (sleep / tantrum / aba_speech / adult_anxiety …)
├─ audience               (parent / adult / teen / child_dev)
├─ summary                전문가 한 줄 진단
├─ actions   jsonb        [{title, how, when, why, evidence_tag}]
├─ rationale jsonb        {framework: 'ABA'|'PCIT'|'CBT', key_principles[], citations[]}
├─ observation_points jsonb  발달 트랙 전용 (ABC 관찰 항목)
├─ video_picks jsonb      [{title, channel, youtube_id, why_this}]
├─ product_picks jsonb    [{name, why, age_range, link_hint, category}]  -- 제휴 링크 X, 큐레이션만
├─ email_status           pending / queued / sent / skipped
└─ generated_at, sent_at
```

UNIQUE(enrollment_id, day_number). RLS는 본인 enrollment만. service_role 풀권한.

기존 `mind_track_session_logs`, `aba_observations`, `user_coaching_goals` 그대로 둠.

---

## 02 큐레이션 화이트리스트 (코드 상수)

`src/lib/mindTrackCurationCatalog.ts` 신규.

- **채널/프로그램 화이트리스트**(메모리 정책상 외부 인물명 사용 가능 범위에서):
  - 부모/아동 일반: `금쪽같은 내 새끼`, `우리 아이가 달라졌어요`, `요즘 가족 금쪽수업`
  - 남아 양육: `최민준의 아들TV`
  - 영아·언어: `베싸TV`, `아기성장보고서`
  - ABA/발달지연: `ABA 부모교실`(국내 ABA 전문 채널), `Autism Family`
  - 성인 번아웃/불안: `정신과의사 정우열`, `닥터프렌즈`
  - 청소년: `오마이뉴스 청소년 코너`, `청소년 마음건강 EBS`
- 각 항목에 `tags: ['tantrum','sleep','aba_speech','burnout',...]`, `audience`, `age_range`, `evidence_strength`.
- 영상 추천은 **항상 이 화이트리스트에서 1순위 매칭**, 부족할 때만 YouTube Data API (`concernYoutubeQuery` 재활용)로 보강. 보강 결과는 `validate-mindtrack-videos`로 한 번 더 검증.

**추천 장난감/도서 카탈로그** (발달 트랙)
- 같은 파일에 `productCatalog`: 카테고리(언어자극·소근육·감각통합·정서조절·수면 루틴) × 연령대 × 근거 한 줄. 외부 구매 링크 없이 "검색 키워드"만 제공 (예: `"3세 언어자극 그림책 - 사물 카드"`).

---

## 03 전문가급 솔루션 엔진 (Edge Function)

새 함수 `supabase/functions/mind-track-action-prescribe/index.ts`

입력: `enrollment_id`, `day_number`, `audience`, `track_focus`, `recent_journal` (최근 2개 `mind_track_session_logs`), `aba_observations`(있으면).

처리:
1. **프레임워크 선택 로직**
   - `child_dev` + 행동 문제 → ABA(ABC 분석 + 강화/소거)
   - `parent` 양육 → PCIT 스타일(CDI/PDI 단계 언어)
   - `adult` 번아웃/불안 → CBT + 행동활성화
   - `teen` → 동기면담(MI) 톤
2. Gemini 3.1 `reasoning.effort: medium` 호출. 시스템 프롬프트에서 다음을 **JSON 강제 출력**:
   - `summary` (1문장 진단)
   - `actions[3]`: `{title, how(스크립트 예시 포함), when(시간/상황), why(메커니즘), evidence_tag}`
   - `rationale.key_principles[]` + `framework`
   - `observation_points[]` (child_dev일 때만): ABC 관찰 체크리스트
3. 영상·상품 매칭은 **LLM이 아니라 코드**가 수행:
   - `track_focus` + `audience` 태그로 화이트리스트 필터 → 상위 3개
   - 발달은 `productCatalog`에서 카테고리 매칭 상위 3개
4. 결과 전체를 `mind_track_action_prescriptions` upsert.

호출 시점:
- `/mind-track/workbook` 진입 시 오늘 Day 카드가 없으면 즉시 생성 (`supabase.functions.invoke`).
- 아래 아침 크론에서도 미생성 시 생성.

---

## 04 워크북 UI 카드

`src/components/mind-track/workbook/ActionPrescriptionCard.tsx` 신규.

세션 Day(`TwoWeekSessionView`)·일반 Day 모두 상단에 노출. 구성:
1. **전문가 진단** — `summary`, framework 배지(ABA/PCIT/CBT).
2. **오늘의 액션 3가지** — 각 액션은 카드: `언제 / 어떻게(스크립트) / 왜` 3 섹션. 체크박스로 완료 표시 → `mind_track_session_logs.answers.actions_done`에 기록.
3. **근거 패널** — "이 액션이 작동하는 이유" 토글, `key_principles` 불릿.
4. **추천 영상** — 화이트리스트 우선 3개, 각 카드에 `채널명 · 왜 지금 이 영상인지` 한 줄. 썸네일은 YouTube API.
5. **(발달 트랙 only) 관찰 체크리스트** — ABC(Antecedent-Behavior-Consequence) 입력 폼 → 기존 `aba_observations` 테이블에 저장.
6. **(발달 트랙 only) 추천 장난감/도서** — 카탈로그 3개, "왜 도움이 되는지" + 검색 키워드. 구매 링크/제휴 없음.

비세션 Day(`TwoWeekRestView`)는 액션 2개로 축소된 가벼운 버전.

---

## 05 아침 코칭 이메일

기존 `mind-track-mission-email-cron` 확장 (재배포).

- 한국 시간 매일 **07:00**에 active enrollment 순회.
- 각 사용자에 대해:
  1. 오늘 `mind_track_action_prescriptions` 없으면 `mind-track-action-prescribe` 호출.
  2. 새 템플릿 `daily-action-coaching.tsx`로 `send-transactional-email` invoke.
     - `templateData`: summary, actions[3], rationale 1줄, video_picks(상위 2개 링크), product_picks(발달만), 워크북 딥링크.
     - `idempotencyKey`: `action-coach-${enrollment_id}-${day_number}`.
  3. 성공 시 `email_status='sent'`, `sent_at` 기록.
- 비세션 Day는 "오늘은 가볍게 — 어제 관찰 회고 1줄" 변형 카피.

새 React Email 템플릿: `supabase/functions/_shared/transactional-email-templates/daily-action-coaching.tsx` — 흰 배경, gold(#C8B88A) 액센트, 액션 3개 + 영상 2개 + (조건부) 장난감 2개. 등록은 `registry.ts`.

이메일 거버넌스: 이미 발송 중인 `daily-coaching`과 충돌 방지 — `user_coaching_goals.daily_email_enabled=true` AND mind-track 활성이면 mind-track 액션 메일이 우선, 일반 데일리는 스킵.

---

## 06 트랙별 매칭 매트릭스 (요약)

```text
audience      track_focus           framework   화이트리스트 채널 예시
─────────────────────────────────────────────────────────────────────
parent        tantrum/discipline    PCIT        금쪽같은 내 새끼, 최민준 아들TV
parent        sleep                 행동수면     베싸TV, 우리 아이가 달라졌어요
child_dev     aba_speech/play       ABA         ABA 부모교실, 베싸TV
adult         burnout/anxiety       CBT+BA      정신과의사 정우열, 닥터프렌즈
teen          motivation/mood       MI          EBS 청소년 마음건강
```

매칭 규칙은 `mindTrackCurationCatalog.ts` 내부 함수 `pickContent(focus, audience, n)`로 캡슐화.

---

## 07 변경 파일 목록

신규
- `supabase/migrations/<new>.sql` (action_prescriptions 테이블 + GRANT + RLS)
- `supabase/functions/mind-track-action-prescribe/index.ts`
- `supabase/functions/_shared/transactional-email-templates/daily-action-coaching.tsx` + `registry.ts` 등록
- `src/lib/mindTrackCurationCatalog.ts`
- `src/lib/mindTrackActionPrescription.ts` (클라이언트 fetch/invoke 헬퍼)
- `src/components/mind-track/workbook/ActionPrescriptionCard.tsx`

수정
- `src/components/mind-track/workbook/TwoWeekSessionView.tsx` — 카드 상단 삽입
- `src/components/mind-track/workbook/TwoWeekRestView.tsx` — 라이트 버전 삽입
- `supabase/functions/mind-track-mission-email-cron/index.ts` — 액션 메일 분기 + 처방 보장
- `src/integrations/supabase/types.ts` — 마이그레이션 후 자동 갱신
- 메모리: `mem://features/mind-track/action-prescription-system-ko` 추가 + `mem://index.md` 1줄

---

## 08 정책·안전장치

- 위기 키워드 감지(`useMindTrackRiskDetection`) 시 액션 처방을 **표시 전 차단**하고 `/expert-hiring?urgent=true` CTA로 대체.
- 모든 추천 영상/상품은 외부 핫라인·의료적 단언 금지(기존 `MedicalDisclaimer` 톤 유지).
- 상품 큐레이션은 **제휴 링크·구매 버튼 없이 검색 키워드만**.
- LLM 출력은 `cleanMarkdown` + JSON 스키마 검증 통과 시에만 저장. 실패 시 fallback 카피("오늘은 어제 관찰을 다시 읽고 한 줄 메모만 남겨주세요").

---

## 09 구현 순서

1. 마이그레이션 작성 → 승인 → 실행.
2. 큐레이션 카탈로그 + 매칭 함수 (`mindTrackCurationCatalog.ts`).
3. `mind-track-action-prescribe` Edge Function + 배포.
4. `ActionPrescriptionCard` UI + 워크북 View 통합.
5. `daily-action-coaching` 템플릿 + 메일 크론 분기 + 배포.
6. 메모리 갱신, 회귀 테스트(타입체크, 워크북 진입).

---

## 10 오픈 질문

승인 전 한 가지만 확인 부탁드립니다:

- **상품 큐레이션 깊이**: 처음에는 발달 트랙(`child_dev`)에만 노출할까요, 아니면 부모 양육(`parent`)에도 "이번 주에 시도해볼 도구" 형태로 함께 노출할까요? (기본안은 발달 트랙 전용 / 부모는 영상만)
