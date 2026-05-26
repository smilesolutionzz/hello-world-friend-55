# Phase 3 — B2C 무료권 연동 · 인텔리전스 · 온보딩

센터에 등록된 이용자(부모)가 AIHPRO B2C 기능(Mind Track 7일, 자가검사, 리포트)을 **무료로** 사용하고, 그 데이터가 자동으로 센터 콘솔의 인텔리전스로 흘러들어오게 만든다. 동시에 센터 담당자가 헤매지 않도록 가이드 페이지와 체크리스트 위젯을 제공한다.

---

## 01. B2C 무료권 연동 (초대 링크 + 센터 코드)

### 데이터 모델 (마이그레이션 1건)

```
center_client_invites
  - id, organization_id, client_id (center_clients FK)
  - invite_token (uuid, unique)        ← 링크용
  - center_code (text, 6자리, unique)   ← 수동 입력용
  - status: pending | claimed | revoked
  - claimed_by_user_id, claimed_at
  - expires_at (기본 30일)

center_b2c_grants                       ← 무료권 부여 기록
  - id, organization_id, client_id, user_id
  - grants: jsonb { mind_track_7: true, assessments_unlimited: true }
  - granted_at, source: invite|code|manual
```

`center_clients`에 `linked_user_id uuid` 컬럼 추가 (부모 계정과 매핑).

### 동선 A — 초대 링크 (메인)
1. 센터 콘솔 → 이용자 상세에서 **"AIHPRO 초대 보내기"** 버튼
2. invite_token 발급 → 카카오/SMS/복사 가능한 링크 `aihpro.app/center-invite/:token`
3. 부모가 링크 클릭 → 전용 환영 페이지(센터명·아이 이름 표시) → 가입/로그인
4. 가입 직후 `claim-center-invite` edge function 호출 → grant 자동 생성

### 동선 B — 센터 코드 (보조)
- 이용자 마이페이지 또는 `/center-invite` 에 "센터 코드 입력" 필드
- 6자리 코드 입력 시 동일 claim 로직 실행

### 무료권 적용
- `useEntitlements` 훅 신설: `center_b2c_grants` + 기존 구독 합쳐서 권한 판단
- Mind Track / 자가검사 결제 게이트에서 grant 보유자는 우회

---

## 02. 인텔리전스 데이터 파이프라인

부모 계정의 B2C 활동을 센터 콘솔로 **읽기 전용**으로 노출. 합의 기반(초대 수락 = 동의).

### 노출 범위 (확정)
1. **자가검사 결과 요약** — 검사명, 점수 단계(낮음·중간·높음), 일시. 응답 원문은 제외
2. **Mind Track 진행률** — Day별 완주 여부, 핵심 인사이트 1줄
3. **리포트 링크** — 부모가 받은 전문가 리포트(PDF) 안전 링크
4. **위기 알림 + 관찰 일지** — 고위험 점수 발생 시 콘솔 푸시, ABA 관찰 일지 요약

### 뷰 (DB)
- `center_intelligence_assessments` — assessment_results를 client_id로 조인
- `center_intelligence_mind_track` — mind_track_enrollments + day_progress 집계
- `center_intelligence_reports` — share_reports 링크
- `center_intelligence_alerts` — risk_level='high' 발생 시 자동 인서트
- RLS: organization member만 SELECT, linked_user_id 매핑된 데이터만

### UI 통합
- **`/intelligence/parent-reports`** (기존): 자가검사 + 리포트 + Mind Track 진행률 카드로 재구성
- **`/intelligence/ops-dashboard`** (기존): 위기 알림 위젯 + 미연동 이용자 비율 KPI 추가
- **이용자 상세 페이지**(`/console/clients/:id`, 신규): 해당 이용자의 모든 인텔리전스 한눈에

---

## 03. 부모 온보딩 (B2C 측)

- **`/center-invite/:token`** — 환영 페이지 (센터 로고/명, 아이 이름, 무료권 안내, 가입 CTA)
- **`/center-invite`** — 코드 입력 페이지
- 가입 후 **3단계 환영 시트**: ① 무료권 확인 ② 첫 검사 추천 ③ Mind Track 시작
- 마이페이지에 "연결된 센터" 배지

---

## 04. 센터 담당자 가이드 + 체크리스트

### `/b2b-center/app/guide` 신규 페이지
- 6단계 튜토리얼 (스크린샷 + 영상 placeholder)
  1. 엑셀로 이용자 일괄 등록
  2. 일정/프로그램 설정
  3. **이용자에게 AIHPRO 초대 보내기**
  4. 인텔리전스에서 자가검사 결과 확인
  5. 위기 알림 대응
  6. 부모 면담 활용

### 콘솔 대시보드 상단 `OnboardingChecklist` 위젯
- 5단계 체크리스트, 각 항목 클릭 시 해당 가이드 섹션으로 스크롤
  - [ ] 첫 이용자 등록
  - [ ] 첫 초대 발송
  - [ ] 첫 부모 가입 확인
  - [ ] 첫 인텔리전스 데이터 수신
  - [ ] 알림 설정
- DB: `center_onboarding_progress` (organization_id, step_key, completed_at)
- 모두 완료되면 위젯 자동 숨김 + 축하 toast

---

## 05. 기술 세부

- **Edge functions**: `claim-center-invite` (token/code → grant 생성, 멱등성), `send-center-invite` (카카오 알림톡 placeholder → 일단 링크 복사만)
- **Demo 모드**: 모든 신규 페이지에 demo seed 추가 (DemoModeBanner 패턴 유지)
- **권한**: `useEntitlements` 훅이 grant + subscription + trial 모두 통합
- **디자인**: 기존 White Minimalism + Gold(#C8B88A) 유지, 01·02·03 번호 섹션, rounded-3xl
- **i18n**: 한국어 우선, /en 라우트에서 영문 fallback

---

## 06. 산출물 (요약)

```
신규 페이지
  /center-invite, /center-invite/:token              (B2C)
  /b2b-center/app/guide                              (가이드)
  /b2b-center/app/clients/:id                        (이용자 상세)

신규 컴포넌트
  OnboardingChecklist, InviteSendDialog,
  CenterBadge, EntitlementGate

신규 훅/lib
  useEntitlements, lib/b2bCenter/invites.ts

신규 edge functions
  claim-center-invite, send-center-invite

마이그레이션 1건
  center_client_invites, center_b2c_grants,
  center_onboarding_progress, center_clients.linked_user_id,
  4개 intelligence view + RLS
```

승인하시면 마이그레이션 → 백엔드 → 프론트엔드 순으로 빌드 들어갑니다.
