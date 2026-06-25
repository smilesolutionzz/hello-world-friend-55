
## 목표
치료사가 가입 후 스스로 (1) 센터에 합류하고, (2) 본인 담당 아동의 주간 노트를 쓰고, (3) 본인 담당 아동 프로필의 일부 필드를 수정할 수 있게 합니다.

---

## 01. 초대코드 기반 센터 매칭

기존 이메일 매칭(`claim_therapist_account`)은 가입 이메일 오타·다른 메일 사용 시 끊깁니다. 6자리 코드로 교체합니다.

**스키마**
- `center_therapists`에 `invite_code text unique`, `invite_code_expires_at timestamptz`, `invite_redeemed_at timestamptz` 추가
- 관리자가 치료사 등록/편집 시 코드 자동 생성(6자, 영대문자+숫자, 30일 유효)

**RPC**
- `redeem_therapist_invite_code(_code text)` — security definer
  - 로그인 사용자 필요, 코드 검증·만료 체크, `center_therapists.user_id = auth.uid()` set, `invite_redeemed_at` 기록
  - 이미 다른 user가 redeem 했으면 거부

**UI**
- `/b2b-center/app/admin/therapists` 행마다 "초대코드 복사" 버튼 + "재발급"
- `/therapist/claim`(신규) — 로그인 후 6자리 코드 입력 → 성공 시 `/therapist/my-schedule`
- 기존 이메일 자동 claim 로직은 호환용으로 남김(있으면 활용, 없으면 코드 입력 유도)

---

## 02. 치료사 본인 주간노트 작성

**RLS 추가** (`center_parent_reports`)
- "Therapists can insert/update weekly reports for own clients": 본인 `therapist_id` 가 담당한 세션을 가진 `client_id`에 한해 insert/update 허용, `period_type='weekly'` 한정
- 발행(`status='published'`)도 본인 작성 row만 허용

**UI 신설** `/therapist/my-notes`
- 본인 담당 아동 목록(이미 ByTherapistPage 로직 재사용)
- 아동 선택 → 주차 선택(이번 주/지난 주) → 해당 주 본인 세션의 `meta.records` 자동 수집
- "AI 초안 생성" → 기존 `generate-weekly-therapy-note` 호출(인풋: 본인 세션 ID만)
- 편집기 + AI 확장(`expand-session-record` 재사용) + 발행 버튼
- 발행 시 `period_type='weekly'`, `source_upload_ids`에 세션 ID 저장 → 월간 리포트 트랙 분리에 자동 연동

**엣지 함수 보강**
- `generate-weekly-therapy-note`: 호출자가 치료사면 본인 세션만 필터하도록 `auth.uid()` → `center_therapists.user_id` 매핑 후 `therapist_id` 자동 제한

---

## 03. 본인 담당 아동 프로필 일부 수정

치료사에게 노출할 수 있는 안전한 필드만 허용:
- 수정 가능: `notes`(치료 메모), `guardian_phone`, 비상 연락처, 알러지/주의사항 같은 free-text 필드
- 수정 불가: `name`, `birth_date`, `linked_user_id`, 결제·바우처 관련 컬럼 — 관리자 전용

**RLS**
- 기존 "Therapists can view clients of own sessions" SELECT 정책 유지
- 신규 "Therapists can update limited fields on own clients" UPDATE 정책 + 트리거로 보호 필드 변경 시 raise
  - `prevent_therapist_protected_field_changes()` BEFORE UPDATE 트리거: `auth.uid()` 가 치료사 role 이고 보호 필드 OLD≠NEW 면 exception

**UI**
- `/therapist/my-clients/:id`(신규) — 프로필 카드 + 수정 가능 필드만 노출, 잠긴 필드는 readonly + "관리자에게 요청" 안내

---

## 영향 받는 파일

**마이그레이션 1건**
- `center_therapists`에 초대코드 컬럼·인덱스
- `redeem_therapist_invite_code` RPC
- `center_parent_reports` 치료사 INSERT/UPDATE 정책
- `center_clients` 치료사 제한 UPDATE 정책 + 보호 필드 트리거

**프론트**
- 신규: `src/pages/TherapistClaim.tsx`, `src/pages/TherapistMyNotes.tsx`, `src/pages/TherapistMyClientDetail.tsx`
- 수정: 라우터(App), `src/pages/b2b-center/console/TherapistsPage` 코드 표시, `TherapistMySchedule` 헤더에 "주간노트" 탭 링크

**엣지**
- `supabase/functions/generate-weekly-therapy-note/index.ts`: 치료사 호출 분기

---

## 기술 메모
- 코드 생성: `crypto.randomUUID()` 베이스로 base32 6자, 충돌 시 재시도
- 트리거에서 role 확인은 `has_role(auth.uid(), 'therapist')` 가 아니라 `center_members.role='therapist'` 기준 (B2B는 별도 role 체계)
- 월간 리포트는 이미 트랙 분리 완료 → 치료사가 본인 트랙만 발행해도 자동으로 해당 트랙만 부모 월간에 포함

---

## 진행 순서
1. 마이그레이션 1건(스키마+RLS+RPC)
2. 관리자 페이지에 초대코드 UI
3. `/therapist/claim` 페이지 + 라우팅
4. `/therapist/my-notes` 페이지
5. `/therapist/my-clients/:id` 페이지
6. 엣지 함수 분기 추가

작업 분량이 큽니다(파일 7-8개). 이대로 진행하면 한 번에 다 만들어 드릴까요, 아니면 1·2(매칭 먼저) → 3(노트) → 4(프로필 수정) 순으로 단계 분할할까요?
