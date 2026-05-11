## 목표

네 가지 요청을 단일 흐름으로 처리합니다.

1. `mt_onboarding_state` + `childProfileId` 기반 복원 강화
2. mind_track_30 결제 → 온보딩 → Day 1 E2E 점검
3. personalize 호출 화면에 항상 `requestId` + 마지막 에러(코드/메시지) 표시
4. 결제 없이 mind_track_30 권한만 임시 발급해 `/onboarding/mind-track`을 즉시 진입할 수 있는 개발자 도구

---

## 1. 온보딩 복원 강화 (`MindTrackOnboarding.tsx`)

현재 복원 로직의 약점:
- 서버 `stage_enter` 이벤트에서 `last` stage만 가져오고, 응답 도착 전 이미 로컬 state를 덮어써 race가 발생함
- `stage_enter`가 `useEffect`에서 매 변경마다 발화되어 복원 직후 `welcome`으로 다시 덮어씀
- `childProfileId`가 비어 있는데 `audience==='child'` + `pain_points` 이상에서 새로고침하면 프로필 재생성이 일어날 수 있음
- 페이지 입장 시 `welcome`이 강제로 한 번 그려진 뒤 깜빡이며 복원됨

개선:
- `restoreReady` 플래그 추가: 로컬 + 서버 복원이 모두 완료되기 전에는 `stage_enter` 로깅과 `localStorage` 쓰기를 건너뜀
- 서버 측 복원 시 마지막 `stage_enter` 외에 가장 최근 `save_profile_done` 이벤트의 `meta.childProfileId`를 함께 복구
- 서버에 `user_child_profiles`가 이미 존재하면(닉네임 일치) `childProfileId`를 채워 중복 insert 방지
- 복원 후 `personalize` 단계로 돌아왔는데 이미 캐시(`mind_track_personal_lines`)가 있으면 자동으로 `preview`로 진행
- "초기화" 디버그 버튼: localStorage 키 2개 + 서버 이벤트는 그대로 두되 클라 상태만 리셋

---

## 2. personalize 디버그 패널 (`PersonalizingScreen` + `TrackMissions` 카드)

현재는 에러 상태에서만 `requestId`를 노출. 항상 보이도록 변경:

- `PersonalizingScreen` 하단에 고정 디버그 박스 추가
  - `requestId`: 성공/실패/시도 중 모두 표시 (없으면 `(아직 발급 전)`)
  - `lastError`: `code` + `message` (없으면 `—`)
  - `attempts`: `attempt/maxAttempts`, `phase`, `nextDelayMs`
  - 우측에 "복사" 버튼(Clipboard) — 디버그 문자열 한 줄 복사
- `TrackMissions.tsx` 미션 카드의 personalLine 영역에서도 동일한 한 줄 디버그 푸터 노출(텍스트 작게, muted)

비즈니스 로직은 건드리지 않음 — `personalizeChildMission.ts`는 이미 `onAttempt` + `requestId`를 노출하므로 UI만 보강.

---

## 3. 결제 우회 — 임시 mind_track_30 권한 발급 도구

새 페이지 `/dev/mind-track-grant` (`src/pages/DevMindTrackGrant.tsx`)

- 현재 로그인 유저 정보 표시
- 버튼: "임시 mind_track_30 활성화"
  - 클라이언트에서 `ensureMindTrackEnrollment()` 호출 후
  - 새 edge function `dev-grant-mind-track`으로 `payment_status='completed'`, `started_at=now()` 패치
  - 성공 시 `/onboarding/mind-track`으로 이동
- 버튼: "온보딩 상태 초기화" — 로컬 키 + 본인 `mind_track_onboarding_events`/`user_child_profiles`/`mind_track_personal_lines` 삭제
- 접근 가드: 프로덕션 도메인(`aihpro.app`, `aihpro.life`)에서는 admin(`has_role`)만, 그 외(localhost / lovable preview)는 모든 로그인 유저 허용
- 라우트는 `App.tsx`에 lazy 추가, 메인 네비에는 노출하지 않음

새 edge function `supabase/functions/dev-grant-mind-track/index.ts`
- JWT 검증 → 호출자 본인의 enrollment만 `completed`로 승격
- 프로덕션 호스트에서 호출 시 `has_role(uid,'admin')`이 아니면 403
- `mind_track_30` 단일 상품 정책 준수 (`track_type='mind_30day'` 고정)

---

## 4. mind_track_30 E2E 점검 (수정 직후 수행)

순서:
1. `secrets--fetch_secrets`로 `LOVABLE_API_KEY` 등 키 존재 확인
2. `supabase--read_query`로 `mind_track_onboarding_events`, `mind_track_personal_lines`, `mind_track_enrollments` 스키마/RLS 확인 + 누락 마이그레이션 여부 점검
3. dev grant로 권한 부여 → `/onboarding/mind-track` 진입
4. `child` 분기로 닉네임/생일/페인포인트/목표 입력 → personalize → preview → Day 1
5. 중간 새로고침 2회(audience 단계 직후, personalize 도중) → 단계가 정확히 복원되는지 확인
6. `supabase--curl_edge_functions`로 `personalize-child-mission`을 직접 호출해 `requestId` + 캐시 hit 동작 확인
7. `supabase--edge_function_logs`로 `personalize.start → ai_done → ok` 로그 흐름 확인

---

## 변경 파일 요약

- `src/pages/MindTrackOnboarding.tsx` — 복원 race 제거, 캐시 자동 진행, 디버그 패널 추가
- `src/pages/TrackMissions.tsx` — personalize 디버그 푸터 (한 줄)
- `src/pages/DevMindTrackGrant.tsx` (신규) — 결제 우회 진입 도구
- `src/App.tsx` — `/dev/mind-track-grant` 라우트
- `supabase/functions/dev-grant-mind-track/index.ts` (신규) — enrollment 승격 + 호스트 가드
- (필요 시) `supabase/migrations/...` — RLS 누락분 보강

---

## 비고

- 가격/상품 ID는 메모리 정책대로 `src/constants/tokenCosts.ts`에서 읽고 하드코딩하지 않습니다 (`mind_track_30` 단일 상품 유지).
- 디자인 토큰만 사용, 새로운 컬러 클래스 없음.
- "결제 없이 권한 발급"은 의도적으로 라우트가 숨겨져 있고 프로덕션은 admin 전용으로 보호합니다.
