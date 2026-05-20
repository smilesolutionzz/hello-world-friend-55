
# 부모챌린지 앱 전면 교체 계획 (Free PMF Build)

기존 `mind_track_*` 결제·블러·잠금 구조를 전부 비활성화하고, 기획서 그대로의 **6영역 × 3축 × 3문항 = 18문항 무료 체크 진단 + 7일 루프** 부모챌린지 앱을 새로 만든다. 비회원 끝까지, 결제·로그인·페이월 0.

---

## 1. 새 정보 구조 (라우트)

새 도메인 루트는 `/check`. 기존 페이지는 살아있되 진입점은 신규 흐름으로 모두 리다이렉트.

```text
/check                  → 홈 (영역 6개 카드)
/check/:area/level      → 기준선 입력 (개월수 / 학령 / 없음)
/check/:area/questions  → 3문항 (+ ⑤⑥ 안전 문항)
/check/:area/result     → 즉시 리포트 (4블록)
/check/:area/recheck    → 7일 재체크 진입
/check/:area/compare    → Day 0 vs Day 7 비교 + 분기
/check/safe-now         → 오버라이드 분기 (위기 자원 + 전문가 연결 최우선)
```

- `/` (Index)는 새 부모챌린지 홈으로 교체, 기존 랜딩 컴포넌트는 보존(`/legacy-home`로 임시 격리).
- `/mind-track*`, `/quiz` 등 기존 유료 진입점은 `/check`로 리다이렉트 (DB 마이그레이션 후).

## 2. 6영역 콘텐츠 (코드 상수로 박음)

`src/lib/check/areas.ts` 신규.

| # | area key | 라벨 | 응답자 | 기준선 | 안전 오버라이드 |
|---|----------|------|--------|--------|-----------------|
| 1 | language | 언어·발달 | 부모관찰 | 개월수(18~72) | X |
| 2 | emotion | 감정·행동 | 부모관찰 | 개월수 | X |
| 3 | social | 사회성·학교 | 부모관찰 | 개월수 | X |
| 4 | focus | 집중력 | 부모관찰 | 개월수 | X (ADHD 단어 금지) |
| 5 | youth_mind | 아동·청소년 심리 | 부모관찰 | 학령(초저/초고/중고) | ⭕ |
| 6 | parent_burnout | 학부모 번아웃 | 부모자가 | 없음 | ⭕ |

각 영역마다 `axes: [{ key, label, question }]` 3개 + `patterns: [{ combo, message_key }]` 5개 + (⑤⑥) `safety_questions: [{ key, question }]` 2개. 문장은 기획서 그대로 (구체 18문항 + 안전4문항 전부 박음).

## 3. 데이터 (Supabase 마이그레이션)

**신규 테이블 2개**, 기존 mind_track 테이블은 건드리지 않음 (격리 후 추후 정리).

```text
check_sessions
  id (uuid pk)
  area text                        -- language/emotion/.../parent_burnout
  level_basis text                 -- 'months' | 'school_age' | 'none'
  level_value text                 -- '25-36' or 'elementary_low' etc.
  email text NULL                  -- 7일 알림 옵션
  device_id text                   -- 비회원 식별 (localStorage uuid)
  user_id uuid NULL                -- 로그인 시 백필
  created_at, updated_at

check_responses
  id (uuid pk)
  session_id fk → check_sessions
  round_no int                     -- 0=최초, 1=7일 재체크
  axis1_score smallint             -- 1~5
  axis2_score smallint
  axis3_score smallint
  safety_flags jsonb               -- {self_harm: bool, daily_collapse: bool}
  pattern_code text                -- 판정 결과 ('low_good_good' 등)
  override_triggered boolean default false
  taken_at timestamptz
```

**RLS**: 비회원 흐름이 핵심이라 익명 INSERT 허용 + `device_id` 또는 `user_id` 기반 SELECT/UPDATE만 허용. 결과 조회는 `session_id` 직접 키로(공개 토큰 모델).

**7일 재체크 이메일**: `mind-track-reminder-cron` 패턴 재활용 → `check-recheck-reminder` edge function 신규.

## 4. UI/UX — 부모챌린지 앱 톤

전체 톤은 "Calm + Wysa + Noom Parent" 하이브리드. 기존 premium white minimalism은 유지하되, **챌린지 앱 특유의 데일리 카드/진행률/Day 표시**를 도입.

핵심 컴포넌트:
- `<AreaCard />` — 6개 카드, 부드러운 파스텔 도트 + 한 줄 설명
- `<LevelInput />` — 개월수 슬라이더(18~72) / 학령 3택 / 없음
- `<AxisQuestion />` — 5점 빈도 척도, 큰 버튼(48px+), 글자 16px+
- `<SafetyQuestion />` — ⑤⑥ 전용, 예/아니오 + 따뜻한 톤
- `<PatternReport />` — 4블록(한 줄 진단 / 살펴볼 점 3 / 집에서 해볼 것 3 / 다음 단계)
- `<CompareBars />` — Day0 vs Day7 축별 변화 막대 + 한 줄 해석
- `<OverrideBanner />` — 위기 자원(1393/1388/1577-0199) + 지역 전문가 연결 카드
- `<NaturalLink />` — 자녀 체크 후 "부모님, 괜찮으세요?" 카드 → 영역 6

**금지 원칙 코드로 박음**: 결제 컴포넌트(`PaymentModal`, `ResultPaywall`, `BlurredContent`) 새 흐름에서 import 금지. 진단 단어 화이트리스트 검사 유틸 `src/lib/check/wordGuard.ts` 추가.

## 5. 패턴 판정 로직

`src/lib/check/patternEngine.ts`:
```
classify(score) = score≤2 ? 'low' : score===3 ? 'mid' : 'good'
patternCode = `${a1}_${a2}_${a3}`
영역별 patterns 테이블에서 메시지 lookup, 없으면 fallback '경계선'
override: ⑤⑥ safety_flags 중 하나라도 true면 override_triggered=true → /check/:area/result 가 OverrideBanner 최상단 강제 렌더
```

## 6. 기존 시스템 처리

- `mind_track_*` 결제 상품·라우트·hook은 **비활성화 플래그**(`FEATURE_MIND_TRACK_PAID=false`) 뒤로 격리. 코드 제거가 아니라 차단 (Phase 후 정리).
- `/quiz`, `/mind-track-onboarding`, `MindTrackCheckoutHero`는 `/check`로 리다이렉트.
- 메인 메모리 Core Pricing 규칙은 **"PMF 기간 자체 결제 일시 중단, 전문가 상담만 유지"**로 갱신 필요 (기획서 = 전부 무료). 별도 메모리 업데이트 안 (구현 후 묻고 처리).
- 전문가 상담(`/expert-hiring`)은 그대로 유지 — Day 7 분기·오버라이드 CTA의 도착지로 재활용.

## 7. 구현 순서 (PR 단위)

1. **DB 마이그레이션** — `check_sessions`, `check_responses` + RLS + 익명 정책
2. **콘텐츠 상수** — `src/lib/check/areas.ts` (18문항 + 안전4문항 + 30개 패턴 메시지 4블록)
3. **라우트 + 7개 페이지 스캐폴딩** — 위 표대로
4. **부모챌린지 컴포넌트 8개** — 위 목록
5. **패턴 엔진 + 오버라이드 로직** + word guard
6. **이메일 재체크 cron** — Day 7 트리거 edge function
7. **Index 교체** — `/`를 새 홈으로, 구 진입점 리다이렉트
8. **자녀→번아웃 자연 연결 카드**
9. **Day0 vs Day7 비교 화면** (제품의 핵심 킥)
10. **세션 복구** — `device_id` 기반 localStorage 백업 + 7일 후 deep link

## 8. 이번 단계에서 안 하는 것 (의도적)

- 결제 시스템 제거 (격리만)
- 메모리/문서 일괄 갱신 (구현 후 한 번에)
- 인증/회원가입 강제 (전 흐름 비회원 유지)
- 30개 패턴 메시지 전부 카피라이팅 (스켈레톤 메시지 + 패턴별 TODO 주석으로 일단 깔고, 임상 검수 후 채움 — 사용자가 14년 임상 본인이 직접 채울 영역)

## 9. 미결 확인 (구현 전 확인 부탁)

- (a) **시각 톤**: 새 부모챌린지 홈 디자인은 redesign 스킬로 3개 방향 뽑아서 고르는 게 좋을지, 아니면 기존 premium white minimalism 그대로 가도 될지
- (b) **30개 패턴 메시지**: 스켈레톤(`"○○이는 ~한 힘은 자랐는데..."` placeholder) + TODO로 깔고 후속 채우기 vs 첫 영역(언어·발달) 5패턴만 완성본으로 박고 나머지 placeholder
- (c) **기존 mind_track 결제 안내**: 이미 결제한 사용자(`mind_track_enrollments` 보유)에게는 어떤 메시지? "PMF 검증을 위해 무료화, 잔여 권한 환불 안내" 배너 필요한지

이 3가지만 정해주면 위 1~10번 그대로 순차 구현 들어감.

