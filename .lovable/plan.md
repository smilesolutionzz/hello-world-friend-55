

## 목표
도메인 인증이 완료된 `aihpro.app`을 사용해 `tntjr91@kakao.com`로 데일리 코칭 테스트 이메일 실제 발송.

## 작업 내용

### 1. Resend 도메인 상태 검증
- `aihpro.app` 도메인이 실제로 `verified` 상태인지 Resend API로 확인
- 미인증 상태면 어떤 레코드가 빠졌는지 정확히 진단

### 2. 발송 함수의 From 주소 변경
**파일:** `supabase/functions/test-coaching-email-preview/index.ts`
- 현재: `onboarding@resend.dev` (테스트 도메인, 본인 외 발송 불가)
- 변경: `AIHPRO 데일리 코칭 <coaching@send.aihpro.app>` (인증된 도메인)

> 참고: SPF/DKIM/MX를 `send` 서브도메인에 추가했으므로 `from`은 반드시 `@send.aihpro.app` 사용

### 3. 실제 발송 실행
- `test-coaching-email-preview` 함수를 호출:
  - `to`: `tntjr91@kakao.com`
  - `nickname`: `수석님` (기본값 가능)
- Resend API 응답에서 `id` 확인 → 발송 성공 검증
- 실패 시 에러 메시지 분석 후 즉시 수정

### 4. 결과 보고
- 발송 성공: Resend message ID, 도착 예상 시간 안내
- 카카오 메일은 보통 1~2분 내 도착 (스팸함도 확인 안내)
- 실패 시: 에러 원인 + 다음 액션 제시

## 추가 작업 (옵션)

### 본 발송 함수도 동일 도메인으로 통일
**파일:** `supabase/functions/send-daily-coaching-email/index.ts`
- 매일 8AM KST 크론 발송도 `coaching@send.aihpro.app`로 통일
- 이렇게 하면 실제 구독자에게도 같은 브랜드로 발송됨

### 발신자 표시 이름 정리
- From: `AIHPRO 데일리 코칭 <coaching@send.aihpro.app>`
- Reply-To: `support@aihpro.app` (선택)

## 기술 메모
- 발송 도메인: `send.aihpro.app` (서브도메인 — Resend 표준)
- 인증 레코드: TXT(DKIM) + MX + TXT(SPF) 3종
- 발송 후 `daily_coaching_email_log` 테이블 기록 없음 (테스트 함수는 로그 미기록)
- 카카오 메일 도착 확인 후 → 매일 8AM KST 크론으로 정식 운영 시작

