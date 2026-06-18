## 문제

SMS 발송 실패 토스트가 떴는데, 실제 Twilio 에러 코드/메시지가 어디에도 안 보여서 원인을 특정할 수 없습니다. (Edge Function 로그에 Twilio 응답을 안 남기고 있고, 프론트도 일반 메시지만 표시)

가능성: ① Korea Geo Permission 미반영 / ② From 번호 형식 / ③ Trial 계정 → 미인증 수신번호 차단 (Trial은 수신번호도 verify 필요) / ④ SID·Token 오타.

## 변경

**1. `supabase/functions/create-parent-share-link/index.ts`**
- Twilio 호출 후 `!twResp.ok` 일 때 `console.error("[twilio] send failed", { status, code, message, more_info })` 로 상세 로그 출력
- 비밀키 일부 누락 시에도 `console.warn` 로 어떤 secret이 missing인지 표시 (값은 안 찍음)

**2. `src/components/b2b-center/ShareWithParentDialog.tsx`**
- 응답의 `sms_result.message` / `sms_result.code` 를 토스트 description에 노출 (ex: "Twilio 21608: The number +82... is unverified...")
- 그러면 사용자가 보자마자 원인을 알 수 있음

## 다음 단계

배포 후 다시 "공유하기" 시도 → 토스트에 뜨는 실제 Twilio 에러 코드를 알려주시면 즉시 해결책 제시:
- `21608` → Trial 계정, 수신번호 verify 필요
- `21408` → Geo Permission 미설정
- `21211` → 번호 형식 오류
- `20003` → 인증 실패 (SID/Token)
