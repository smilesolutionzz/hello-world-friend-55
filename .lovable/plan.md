# B2B 센터 접근 흐름 전면 개선

`/b2b-center` 진입~콘솔 사용까지의 전 여정을 자연스럽게 다듬고, 메인 홈에서 발달치료센터 운영자가 본인용 진입로를 한눈에 찾을 수 있게 CTA를 추가합니다.

## 작업 범위

### 01. 3스텝 온보딩 가이드 (랜딩 → import → 콘솔)
`/b2b-center` 랜딩 하단과 `/b2b-center/import` 상단에 공통 진행 표시기 추가.

```text
[ 01 기관 만들기 ] ── [ 02 엑셀 이관 ] ── [ 03 콘솔 사용 ]
       ●                    ○                  ○
```

- 컴포넌트: `src/components/b2b-center/CenterOnboardingStepper.tsx`
- 현재 단계 prop으로 받음 (`step: 1 | 2 | 3`)
- 화이트 미니멀, 골드 #C8B88A 액센트, 숫자 01·02·03 (메모리 톤 정책)
- 콘솔 첫 진입 시 1회만 보이는 환영 카드 ("센터가 준비됐어요. 먼저 일정·이용자를 확인해보세요") — localStorage 플래그

### 02. 초대 링크로 치료사·관리자 합류 플로우
센터 owner가 다른 사용자를 `center_members` 에 추가할 수 있는 초대 시스템.

**DB (마이그레이션 1개)**
- 새 테이블 `center_invites(id, center_id, email, role, token, invited_by, expires_at, accepted_at, created_at)`
- RLS: owner/admin만 SELECT/INSERT, 본인 이메일 INVITE는 SELECT 가능
- RPC `create_center_invite(_center_id, _email, _role)` SECURITY DEFINER → 토큰 발급
- RPC `accept_center_invite(_token)` SECURITY DEFINER → `center_members` upsert + 토큰 소진

**UI**
- `/b2b-center/app/admin/organization` 안에 "구성원 초대" 섹션
  - 이메일 + 역할(owner/admin/therapist/viewer) 입력 → 초대 링크 복사 버튼
  - 현재 멤버 목록 + 역할 표시
- `/b2b-center/invite/:token` 신규 페이지
  - 로그인 안 됐으면 `/auth?redirect=...` 로
  - 로그인 됐으면 "OO 센터에 합류" CTA → `accept_center_invite` 호출 → `/b2b-center/app`

### 03. 데모 모드 (`?demo=1`) — 로그인 없이 콘솔 미리보기
영업 자료·스크린샷·잠재고객 체험용. DB 쓰기는 일절 없음.

- `src/lib/b2bCenter/demoData.ts` — mock 기관 1개 + 이용자 12명 + 치료사 5명 + 회기 60건 + 수납 30건 하드코딩
- `B2BCenterApp.tsx` 에 `useSearchParams().get('demo') === '1'` 분기:
  - 로그인 체크 우회
  - `listMyCenters` 대신 mock 반환
  - 상단에 "데모 모드 — 데이터는 저장되지 않습니다" 골드 배너 + "지금 시작하기" CTA
- 콘솔 페이지들의 데이터 hook이 데모 모드면 mock 사용 (`useCenterDemoContext`)
- 모든 변경 버튼은 클릭 시 "데모 모드에서는 변경할 수 없어요" 토스트

### 04. "기관 없음" 빈 상태 개선
현재 단순 텍스트 → 친절한 가이드 카드로 교체.

- 3개 카드 그리드 (rounded-2xl, 화이트):
  1. **엑셀 이관 시작** — 케어플 다운로드 파일 그대로 업로드 가능 (→ /import)
  2. **빈 기관 만들기** — 이름만 입력해 즉시 생성 (인라인 폼, createCenter 호출)
  3. **초대 받았나요?** — 초대 링크 입력 (→ /b2b-center/invite/:token)
- 하단에 "먼저 둘러볼게요" 보조 링크 → `?demo=1` 진입

### 05. 메인 홈에서 B2B 진입 CTA 추가 ★
사용자가 새로 요청한 핵심. 발달치료센터 운영자가 자연스럽게 도달하도록 진입로 노출.

**위치 전략 (메모리 [B2B navigation visibility] 준수 — 메인 nav는 깔끔하게 유지)**

1. **`/expert-hiring` 페이지 하단**에 기존 B2B 영역에 "발달치료센터 운영자이신가요?" 카드 추가 → `/b2b-center`
2. **`/find-center` 하단** "센터를 운영하고 계신가요? 운영 솔루션 보기" 텍스트 링크 → `/b2b-center`
3. **푸터** `src/components/Footer.tsx` (또는 메인 푸터 위치) "비즈니스" 컬럼에 항목 추가:
   - 직장 멘탈케어 (/b2b-jobcoach)
   - **발달치료센터 솔루션 (/b2b-center)** ← 신규
   - B2B 데모 리포트 (/b2b-demo-report)
4. **메인 홈 `/`** 의 비즈니스/파트너 섹션 하단(존재할 경우)에 한 줄 배너:
   > "발달치료센터 운영하시나요? 케어플 대비 ₩5,000 저렴한 운영 솔루션 보기 →"
   클릭 시 `/b2b-center`. 가격은 `tokenCosts.ts`의 `B2B_CENTER_MONTHLY` 상수에서 읽기.

## 기술 세부사항

**신규 파일**
- `src/components/b2b-center/CenterOnboardingStepper.tsx`
- `src/components/b2b-center/EmptyCenterState.tsx`
- `src/components/b2b-center/DemoModeBanner.tsx`
- `src/components/b2b-center/InviteMemberPanel.tsx`
- `src/pages/b2b-center/B2BCenterInvite.tsx`
- `src/lib/b2bCenter/demoData.ts`
- `src/lib/b2bCenter/inviteClient.ts`
- `supabase/migrations/{ts}_center_invites.sql`

**수정 파일**
- `src/pages/b2b-center/B2BCenterLanding.tsx` — 스테퍼 + 데모 진입 보조 CTA
- `src/pages/b2b-center/B2BCenterImport.tsx` — 스테퍼
- `src/pages/b2b-center/B2BCenterApp.tsx` — 데모 모드 분기 + 빈상태 컴포넌트 교체
- `src/lib/b2bCenter/centerClient.ts` — `useCenterDemoContext` 헬퍼 추가
- `src/pages/b2b-center/console/*` — 데모 컨텍스트 일괄 적용
- `src/App.tsx` (또는 라우터 파일) — `/b2b-center/invite/:token` 라우트
- `src/pages/expert-hiring/*` 또는 `/expert-hiring` 페이지 — B2B 센터 카드
- `src/pages/FindCenter.tsx` — 운영자용 텍스트 링크
- 메인 푸터 컴포넌트 — 비즈니스 컬럼 항목 추가
- 메인 홈 — 한 줄 배너 (해당 섹션 존재 시)
- `src/constants/tokenCosts.ts` — `B2B_CENTER_MONTHLY` 노출 확인

**보안**
- `center_invites` RLS는 owner/admin만 INSERT, 토큰은 `gen_random_bytes(24)` 기반
- RPC SECURITY DEFINER + `search_path = public`
- 초대 만료 기본 7일, 1회 소진

**메모리 정책 준수**
- 가격은 항상 `tokenCosts.ts` 에서 읽기 (하드코딩 금지)
- "AI" 단어 회피, "전문가 종합 분석" 톤 유지
- 화이트 미니멀 + rounded-2xl + 골드 #C8B88A
- 메인 nav 오염 금지 (푸터·관련 페이지 하단만 사용)

## 결과물 (사용자 시나리오)

- **신규 운영자**: 메인 → 푸터/배너에서 "발달치료센터 솔루션" 발견 → `/b2b-center` 랜딩 → 스테퍼 보고 흐름 이해 → "데모 둘러보기"로 콘솔 미리 체험 → "지금 시작" → import에서 기관 생성 → 콘솔 진입 시 환영 카드 + 빈상태 가이드
- **합류 치료사**: 초대 링크 수신 → `/b2b-center/invite/:token` → 로그인 → 한 번 클릭으로 합류 완료 → 콘솔 진입
- **잠재고객/세일즈**: `?demo=1` URL 공유만으로 로그인 없이 전체 콘솔 체험
