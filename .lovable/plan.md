## 보안 경고 먼저

방금 채팅에 **Auth Token (`42bfef9525...`)** 을 그대로 붙여넣으셨습니다. 이 토큰은 Twilio 계정 전체를 제어할 수 있는 마스터 키이고, 이 대화 로그에 영구 기록됩니다. **반드시 지금 바로 폐기(rotate)하세요.**

1. https://console.twilio.com/ → 우상단 계정 메뉴 → **API keys & tokens**
2. **Auth Token** 옆 **Request a secondary token** → 생성 후 **Promote to primary** → 기존 토큰 폐기
3. 새 Auth Token을 받으면 그 값으로 아래 절차 진행

Service SID와 Account SID는 공개돼도 단독으로는 위험하지 않지만, Auth Token은 즉시 교체가 필수입니다.

---

## 설정 계획

Supabase Phone Auth 연동은 **코드 변경 없이 Supabase 대시보드에서만** 이뤄집니다. 보호자 리포트(`/r/:token`) OTP 흐름은 이미 구현돼 있으므로, 대시보드 설정만 마치면 바로 동작합니다.

### 1단계: Twilio 보안 강화 (발송 전 필수)

요금 폭탄/SMS 펌핑 사기 방지:

- Twilio Console → **Messaging → Settings → Geo Permissions**
  - **South Korea만 체크**, 나머지 국가 모두 해제
- Twilio Console → **Verify → Services → AIHPRO OTP → Fraud Guard**
  - **Enable Fraud Guard** ON
  - Rate limits: 시간당 5건/번호, 일일 10건/번호 권장

### 2단계: Supabase Dashboard에서 Phone Provider 설정

이 부분은 제가 직접 클릭할 수 없어 안내만 드립니다.

1. https://supabase.com/dashboard/project/hrcqxjetmzxoephgyjlb/auth/providers
2. **Phone** 항목 펼치기 → **Enable phone provider** 토글 ON
3. **SMS Provider** 드롭다운 → **Twilio Verify** 선택 (Twilio가 아니라 **Twilio Verify**)
4. 3개 값 입력:
   - **Twilio Account SID**: `AC440e2baa7d10e9f0174b4ce42a7c324c`
   - **Twilio Auth Token**: *(폐기 후 새로 발급받은 토큰)*
   - **Twilio Verify Service SID**: `VAdcae6043b14500a99f907ebac520cf88`
5. **OTP Expiry**: `300` (5분) 권장
6. **OTP Length**: `6`
7. **Save** 클릭

### 3단계: 테스트 결제 카드 등록

Twilio 무료 크레딧($15)은 한국 OTP 약 350건 분량입니다. 운영 전:

- Twilio Console → **Admin → Billing → Manage billing** → 카드 등록
- Auto-recharge: $20 충전 / $5 임계값 권장 (최소 한도)

### 4단계: 실제 발송 테스트

1. 브라우저 시크릿창에서 `/r/{발급된_토큰}` 접속
2. 본인 휴대폰 번호 입력 (E.164 형식: `+821012345678`)
3. SMS 수신 확인 → 6자리 코드 입력 → 리포트 열림

문제 발생 시 확인 위치:
- Supabase: https://supabase.com/dashboard/project/hrcqxjetmzxoephgyjlb/logs/explorer (Auth logs)
- Twilio: Console → **Monitor → Logs → Errors**

### 5단계 (선택): 비용 최적화 - 알리고 전환

월 OTP 1,000건 초과 시:
- Twilio: 1건 약 ₩55 → 월 ₩55,000
- 알리고: 1건 약 ₩12 → 월 ₩12,000

전환 시 Supabase **Send SMS Hook** (Edge Function) 추가 필요. 지금 단계에서는 불필요하며, 트래픽 늘면 별도 계획.

---

## 코드 변경

**없습니다.** 보호자 리포트의 Supabase Phone OTP 호출(`signInWithOtp({ phone })`, `verifyOtp`)이 이미 GuardianReportGate에 구현돼 있어, 대시보드 설정만으로 동작합니다.

---

**다음 액션:** 위 보안 경고대로 Auth Token을 지금 폐기해주세요. 새 토큰을 받으셨다고 알려주시면(여기 채팅에 붙여넣지 마세요), 다음 단계로 안내드리겠습니다.