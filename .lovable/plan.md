# 부모용 SMS OTP 자동로그인 시스템

## 목표

치료사가 "치료노트" 또는 "부모 월간리포트"를 생성 → **고유 공유 링크**를 카톡/문자로 부모에게 발송 → 부모가 링크 열면 **전화번호 OTP 인증** → 이후 같은 기기에서는 **자동 로그인** 상태로 본인 자녀 리포트 모두 열람.

## 사용자 흐름

```text
[치료사 화면]                    [부모]
1. 노트/리포트 작성              
2. "부모에게 공유" 클릭          
3. 부모 전화번호 입력            
4. 공유 링크 생성 +              → 카톡/문자 수신
   "복사 / 카톡 보내기" 버튼       (https://aihpro.app/r/<token>)
                                 
                                 5. 링크 클릭
                                 6. 전화번호 끝 4자리 확인 (소유권 체크)
                                 7. "인증번호 받기" → Twilio SMS
                                 8. 6자리 입력 → Supabase Phone OTP
                                 9. 로그인 완료 → 리포트 표시
                                 (이후 30일 자동로그인)
```

## 핵심 구성요소

### 01. 공유 링크 테이블 (신규)
`center_parent_share_links`
- `id` uuid PK
- `token` text unique (URL 안전 32자)
- `resource_type` enum (`therapy_note` | `parent_report`)
- `resource_id` uuid (해당 노트/리포트 id)
- `child_id` uuid
- `parent_phone_e164` text (예: `+821012345678`)
- `parent_phone_last4` text (소유권 1차 확인용)
- `created_by` uuid (치료사)
- `center_id` uuid
- `expires_at` timestamptz (기본 90일)
- `first_verified_at` / `last_accessed_at`
- `revoked_at` nullable

RLS: 치료사는 자기 센터 것만 생성/조회. 부모(익명) 접근은 토큰을 받는 edge function 경유.

### 02. 부모 계정 매핑 테이블
`parent_phone_links`
- `phone_e164` text PK
- `parent_user_id` uuid (auth.users)
- `children_ids` uuid[] (열람 권한 자녀들)
- 최초 OTP 통과 시 자동 생성/병합

### 03. Edge Functions
1. `create-parent-share-link` — 치료사가 호출. 링크 생성 + (옵션) Twilio로 즉시 SMS 발송.
2. `parent-share-resolve` — 토큰으로 리포트 메타데이터 일부만 반환 (자녀 이름, 전화번호 끝 4자리 마스킹).
3. `parent-otp-send` — 토큰+전화번호 확인 후 Supabase `auth.signInWithOtp({ phone })` 트리거 (이미 활성화한 Twilio 사용).
4. `parent-otp-verify` — OTP 검증 성공 시 `parent_phone_links` 갱신, 자녀 권한 부여.

### 04. 라우트 (프론트)
- `/r/:token` — `ParentShareLanding` (전화번호 끝 4자리 확인 → OTP 입력 → 리포트)
- `/parent/reports` — 로그인된 부모 대시보드 (자녀별 전체 리포트 목록)
- 치료사 콘솔 안에 "부모 공유" 다이얼로그 추가
  - `ParentReportsPage` / `TherapyNotesPage` 각 행에 "공유" 버튼

### 05. 자동로그인
- 이미 Supabase 세션이 살아있으면 (`getUser()` 성공) 토큰 페이지에서 OTP 스킵하고 바로 리포트 표시
- 단, 토큰의 `parent_phone_e164` 와 현재 로그인 부모의 전화번호가 일치할 때만
- Supabase 기본 refresh token 만료(30일) = 자동 로그인 유지 기간

## 기술 세부

- SMS 제공자: 이미 연동한 **Twilio Verify**. Supabase Auth가 `signInWithOtp({ phone })` 호출 시 자동 사용.
- 카톡 전송: 카카오 알림톡 별도 연동 전이라 1차는 **링크 복사 + "카톡으로 보내기"(웹 공유 API)** 로 시작. 향후 알림톡 추가.
- 전화번호 정규화: 입력은 `010-1234-5678` 자유, 저장은 항상 E.164 (`+821012345678`).
- 토큰: `crypto.randomUUID()` 대신 `crypto.getRandomValues` 22자 URL-safe.
- 보안 가드:
  - 동일 토큰 + 잘못된 전화번호 끝 4자리 5회 → 토큰 30분 잠금
  - OTP 60초 내 재요청 차단
  - `revoked_at` 있으면 즉시 403

## 작업 순서 (구현 시)

1. 마이그레이션: `center_parent_share_links` + `parent_phone_links` + GRANTs + RLS + 트리거
2. Edge functions 4개 작성 + 배포
3. 치료사 콘솔에 "부모 공유" 버튼 + 다이얼로그
4. `/r/:token` 부모 랜딩 페이지 (3-step: 확인 → OTP → 리포트)
5. `/parent/reports` 대시보드
6. 실제 핸드폰으로 end-to-end 테스트

## 미정 — 확인 필요

A. **공유 가능한 리소스 범위**: 지금은 (1) 치료노트 단건, (2) 월간 부모리포트 두 종류만이면 충분한가요? 아니면 다른 리포트(발달 검사, 영상 관찰 등)도 함께?

B. **카톡 전송 방법**:
   - (i) 1차는 "링크 복사 + 웹 공유" 만 (가장 빠름, 무료) 
   - (ii) 처음부터 Twilio SMS 자동발송 (유료, 즉시 작동)
   - (iii) 카카오 알림톡 연동 (한국에서 가장 자연스럽지만 사업자 인증 등 별도 작업 큼)

C. **인증 강도**: 전화번호 끝 4자리 확인 → OTP 의 2단계로 충분한가요? 아니면 OTP만으로 단순화?

D. **링크 만료**: 90일 기본값으로 가도 될까요? 더 짧게/길게?

위 4가지만 답해주시면 바로 구현 시작합니다.
