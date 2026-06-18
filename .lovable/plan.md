## 목표
이미 결제하고 연결한 Twilio를 살려서 부모 공유 링크 SMS 인증을 완성한다. (SMS 제거 옵션 폐기)

## 현재 상황
- `parent-otp-send`가 `signInWithOtp`(Supabase Auth)를 호출 → Supabase Auth에 SMS provider가 등록 안 돼서 503 "sms_provider_not_configured"
- Twilio는 연결됐지만 Supabase Auth가 아니라 **Lovable Connector Gateway**에 등록된 상태
- 따라서 Supabase Auth의 phone OTP 흐름을 쓰면 Twilio 키가 인식 안 됨

## 해결 방향: Twilio를 직접 호출하는 자체 OTP 시스템
Supabase Auth Phone provider 설정을 우회하고, Edge Function에서 Twilio Gateway로 직접 SMS를 쏜다. 인증 성공 시 부모 계정에 대해 **자체 세션 토큰**을 발급한다.

## 변경 내역

### 1. DB 마이그레이션
- `parent_otp_codes` 테이블 신설
  - `id`, `share_link_id`, `phone`, `code_hash`(SHA-256), `expires_at`(5분), `attempts`, `consumed_at`
  - RLS: 서비스 롤만 접근
- `parent_phone_sessions` 테이블 신설 (자체 세션)
  - `token`(랜덤 64자), `parent_phone_link_id`, `expires_at`(30일), `last_used_at`
  - 부모 페이지 인증 토큰으로 사용

### 2. Edge Function 재작성
- **`parent-otp-send`**: 
  - `signInWithOtp` 제거
  - guardian_phone 뒤 4자리 검증 → 6자리 OTP 생성 → SHA-256으로 `parent_otp_codes`에 저장
  - Twilio Gateway(`POST /Messages.json`)로 SMS 전송 (`To`=전체 번호, `From`=Twilio 발신번호 secret, `Body`="[AIHPRO] 인증번호 123456")
  - `LOVABLE_API_KEY` + `TWILIO_API_KEY` + `TWILIO_FROM_NUMBER` secret 사용
- **`parent-otp-verify`**:
  - `verifyOtp` 제거
  - `parent_otp_codes` 조회 → 시도 5회 제한 → 해시 비교 → 통과 시 `parent_phone_sessions` 발급
  - 기존 `upsert_parent_phone_link` RPC 호출은 유지 (부모↔아동 매핑)
  - 응답에 `parent_session_token` 포함

### 3. 프론트 변경
- `ParentShareLandingPage.tsx`: verify 응답의 `parent_session_token`을 `localStorage('aihpro_parent_session')`에 저장
- 부모 공개 페이지(추후 `/parent/reports/:id`, `/parent/notes/:id`)에서 이 토큰을 헤더로 보내 인증

### 4. 필요한 Secret
- `TWILIO_FROM_NUMBER` (Twilio 콘솔의 발신 가능 번호, E.164 형식)
  - 이건 사용자가 직접 등록한 발신번호여야 함 → `add_secret`으로 요청 예정

## 사용자에게 확인 필요
- Twilio 콘솔에 한국 SMS 발신 가능한 번호가 이미 있는지? (없으면 SMS가 전송 안 됨 — 한국은 발신번호 별도 등록 필요)
- 있으면 그 번호(E.164, 예: +12345678900)를 `TWILIO_FROM_NUMBER` secret으로 추가

(별개 작업: TherapyNotesPage 공유 버튼 추가 + `guardian_phone` 자동 채우기는 이 OTP가 동작한 다음에 묶어서 처리)