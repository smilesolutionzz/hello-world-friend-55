
# 아이 발달 코칭 트랙 개인화

## 문제

현재 `child_development` 30일 미션은 모든 아이에게 동일한 문구("아이 감정 라벨링", "아이 강점 3개"…). 그러나:
- **연령대가 다름** — 영아(0-2), 유아(3-5), 학령기(6-12), 청소년(13-18) 발달 과제가 완전히 다름
- **페인포인트가 다름** — 수면/식사/언어 지연/또래 갈등/공부 거부/사춘기 반항 등
- **부모 목표가 다름** — 애착 형성 vs 자기조절 vs 학업동기 vs 분리

→ 공통 미션만으로는 "내 아이를 위한 코칭"이라는 가치 제안이 무너짐.

## 해결 방향

미션을 **3-Layer 구조**로 재설계:

```text
Layer 1: 부모 자신의 미션 (공통, 30일 고정)
  - 호흡, 자기관찰, 감정 라벨링 — 모든 부모에게 유효
  
Layer 2: 연령대 미션 (4개 연령 버킷별 30일)
  - 영아 / 유아 / 학령기 / 청소년
  - 각 버킷마다 발달 과제 기반 미션
  
Layer 3: 페인포인트 미션 (AI 개인화, 매일 1줄)
  - 온보딩에서 받은 주요 고민 + 아이 정보로
  - Gemini가 "오늘 ___아이에게 ___해보세요" 1줄 생성
```

## 온보딩 보강

`/onboarding` 또는 트랙 시작 시점에 추가 입력:
1. 아이 생년월일 (필수)
2. 아이 닉네임/호칭 (예: "민준이", "둘째")
3. 주요 고민 3개 선택 + 1개 자유 서술
   - 수면, 식사, 언어, 또래 관계, 분리불안, 짜증/떼, 학습, 형제 갈등, 미디어, 사춘기 등
4. 30일 후 보고 싶은 변화 1문장

저장: `user_child_profiles` 테이블 (user_id, child_nickname, birth_date, pain_points[], goal_text)

## 미션 데이터 재설계

`mindTrackTrackContent.ts`의 `child_development`를 분리:

```text
src/lib/mindTrackChildMissions.ts
  - CHILD_AGE_BUCKETS: 'infant' | 'toddler' | 'school' | 'teen'
  - getAgeBucket(birthDate) → bucket
  - CHILD_MISSIONS_BY_AGE: Record<bucket, DayDef[30]>
    - 영아: 애착, 옹알이 반응, 루틴, 안전 기지
    - 유아: 감정 어휘, 놀이 주도, 한계 설정, 분리연습
    - 학령기: 자기조절, 또래 코칭, 학습 동기, 자율성
    - 청소년: 경청, 사생활 존중, 가치 대화, 갈등 협상
```

미션 문구 안의 "아이"는 `{{childName}}` 토큰으로 치환 → 화면 렌더 시 닉네임 삽입.

## AI 페인포인트 줄 (Layer 3)

매일 1회 호출되는 신규 엣지 함수:
```text
supabase/functions/personalize-child-mission/
  입력: childProfile + day(1-30) + baseMission
  출력: { personalLine: string }  // 한 문장
  모델: Gemini 3.1, reasoning.effort: medium
  캐시: child_id + day → DB (mind_track_personal_lines)
```

UI에는 "오늘의 베이스 미션" 아래에 "민준이 맞춤 한 줄" 카드로 표시.

## UI 변화 (`/track-missions`)

`child_development` 트랙 선택 시:
1. 아이 프로필 미입력이면 입력 모달 (CTA: "내 아이에 맞게 시작하기")
2. 매트릭스에 아이 닉네임/연령 헤더 노출 ("민준이(만 4세) 30일 발달 코칭")
3. 매 Day 카드에 3-Layer 표시:
   - 부모 미션 (회색)
   - 연령 미션 (골드)
   - 맞춤 한 줄 (서브 박스, 로딩/생성)
4. 다른 트랙(uncertainty, anxiety 등)은 기존 공통 미션 유지

## 저장/접근 모델

- `user_child_profiles` — RLS: 본인만 select/insert/update
- `mind_track_personal_lines` — RLS: 본인만 select, edge function이 service_role로 insert
- 비로그인 사용자는 미리보기(연령 버킷 선택만으로 샘플 미션 1주차) → 가입 유도

## 다른 트랙은 어떻게?

같은 의문이 다른 트랙에도 적용됩니다:
- `relationship` → 파트너/가족/직장 중 선택
- `career` → 이직/창업/번아웃
- `sleep`, `anxiety`, `stress` → 페인포인트 자체가 명확해서 공통 미션도 의미 있음

→ **이번 작업은 child_development 우선**, 검증 후 relationship/career에 동일 패턴 확장.

## 산출물

1. DB 마이그레이션: `user_child_profiles`, `mind_track_personal_lines`
2. `src/lib/mindTrackChildMissions.ts` (4 연령 버킷 × 30일 = 120 미션 데이터)
3. `src/components/mind-track/ChildProfileSetup.tsx` (모달)
4. `src/pages/TrackMissions.tsx` 분기 — child_development는 새 렌더러 사용
5. `supabase/functions/personalize-child-mission/index.ts`
6. 메모리 1건: 트랙 개인화 정책

## 비기술 요약

- 아이 발달 트랙은 **아이 생년월일·닉네임·고민 3개**를 먼저 입력받게 함
- 미션은 ① 부모 공통 ② 연령대(4단계) ③ AI가 매일 1줄 맞춤 — 3겹으로 보여줌
- 다른 트랙(불안/수면/스트레스)은 그대로 유지, 검증 후 관계/커리어로 확장
