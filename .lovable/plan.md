

## 목표
`tntjr91@kakao.com`으로 데일리 코칭 테스트 이메일을 실제로 발송하기.

## 현재 상태
- 이 프로젝트는 외부 Supabase에 연결되어 있어 **Lovable Emails 메뉴를 사용할 수 없음**
- 이메일 발송은 **Resend** (이미 `RESEND_API_KEY` 등록됨) 기반
- 발송 도메인 `notify.aihpro.app`이 Resend에서 **미인증** 상태 → 본인 외 주소로 발송 불가 (403 에러)

## 사용자가 직접 해야 할 일 (DNS 작업, 약 10분)

### 1단계 — Resend 대시보드에서 도메인 추가
1. https://resend.com/domains 접속 (이미 등록된 계정 로그인)
2. **Add Domain** 클릭
3. `notify.aihpro.app` 입력 → Region: `Tokyo (ap-northeast-1)` 선택 (한국 사용자에 최적)
4. Resend가 보여주는 DNS 레코드 4~5개 화면에 표시됨 (TXT 3개 + MX 1개)

### 2단계 — `aihpro.app` 도메인 등록업체에서 DNS 레코드 추가
- 가비아/Cloudflare/카페24 등 도메인을 구매한 곳의 관리 페이지 접속
- Resend가 알려준 TXT, MX 레코드 그대로 복사해서 추가
  - 예: `notify.aihpro.app` 호스트에 TXT/MX 추가
- 5분~1시간 후 Resend 대시보드에서 ✅ **Verified** 표시 확인

### 3단계 — 알려주시면 제가 즉시
- Resend "Verified" 됐다고 채팅에 알려주기만 하시면
- 제가 바로 `tntjr91@kakao.com`으로 Day 7 샘플 코칭 이메일 발송
- 발송 결과(Resend message ID, 카카오 도착 여부) 확인 후 보고

## 만약 DNS 작업이 어려우신 경우 (대안)
지금 당장 테스트만 하고 싶으시다면:
- `tntjr91@kakao.com` 대신 **Resend 계정 가입 시 사용한 본인 이메일 주소**를 알려주세요
- Resend는 미인증 상태에서도 계정 소유자 이메일로는 발송 허용 (`onboarding@resend.dev` from)
- 도메인 인증 없이 즉시 실제 코칭 이메일 미리보기 가능

## 기술 메모 (참고용)
- 발송 함수: `supabase/functions/send-daily-coaching-email/index.ts`
- 테스트 함수: `supabase/functions/test-coaching-email-preview/index.ts` (이미 배포됨)
- 크론: `send-daily-coaching-email-8am-kst` (매일 KST 08:00, 활성 상태)
- 발송 대상 조건: `user_coaching_goals.daily_email_opt_in = true` + 활성 구독

