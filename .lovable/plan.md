
## 목표

치료사가 같은 회기를 두 곳(`services/records`의 텍스트 입력, `intelligence/therapy-notes`의 사진 업로드)에 따로 기록하던 흐름을, **치료노트** 한 화면에서 모두 처리하도록 통합합니다. 회기기록 텍스트와 사진 OCR이 **동등한 입력원**으로 합쳐져 주간 AI 노트가 생성됩니다.

## 새 치료노트 화면 구성 (단일 진입)

라우트 `/b2b-center/app/intelligence/therapy-notes` 한 곳에 모든 흐름을 둡니다. `services/records`는 동일 라우트로 리다이렉트하고 사이드바에서 제거(또는 "치료노트"로 라벨 통합)합니다.

화면 레이아웃:

```text
┌──────────────────────────────────────────────────────────┐
│ 이용자 선택 · 주차(week picker)                          │
├──────────────────────────────────────────────────────────┤
│ [이번 주 회기 타임라인]                                  │
│  · 회기 카드 = (일자/시간/상태/선생님/프로그램)          │
│  · 카드 펼치기 → 상담내용 / 기록내용 / 특이사항 textarea │
│  · 카드 우측 → "사진 첨부" 버튼 (해당 회기에 사진 묶음) │
├──────────────────────────────────────────────────────────┤
│ [주간 AI 치료노트]                                       │
│  · "주간 노트 자동 생성" 버튼                            │
│  · 생성된 초안 편집 → 저장 → 발행 → 보호자 공유          │
└──────────────────────────────────────────────────────────┘
```

회기 카드는 기존 `SessionRecordsPage`의 카드 UI/저장 로직을 그대로 옮겨와 사용합니다.

## 데이터 모델

추가 마이그레이션 없음. 기존 컬럼만 활용:

- 회기별 텍스트: `center_sessions.meta.records = { consult, record, special }` (현행 그대로)
- 회기별 사진: `center_session_uploads` — 업로드 시 `session_date`만이 아니라 **해당 `center_sessions.id`**도 함께 저장하도록 `analyze-session-upload`에 `sessionId` 파라미터를 추가하고, `center_session_uploads.meta.session_id`에 보관(컬럼 추가 없이 JSONB로). 미연결 사진은 기존처럼 날짜 기준으로 처리.

## AI 생성 로직 변경

`supabase/functions/generate-weekly-therapy-note/index.ts`의 프롬프트 구성에 **회기기록 텍스트**를 추가합니다:

```text
[치료사가 직접 작성한 회기기록]
- {일자} 상담내용: ...
- {일자} 기록내용: ...
- {일자} 특이사항: ...

[치료사 일지(사진)에서 추출한 내용]
(기존 uploadSummary)
```

- 두 입력원을 동등 비중으로 결합. 둘 중 하나만 있어도 동작.
- `hasSessions`/`hasUploads` 분기는 유지하되, `hasRecords`(텍스트 기록 존재 여부) 추가.
- 빈 케이스 경고 메시지는 "이번 주 기록이 없어요"로 통합.

## 사이드바/네비게이션

`B2BCenterApp.tsx`:
- "일일 서비스 관리 (회기기록)" 항목 제거.
- "치료노트 (주간·AI)" → "치료노트 (회기기록 · 주간노트)"로 라벨 변경.
- "월 서비스 관리"는 현황 대시보드 성격이라 **유지**.
- `services/records` 라우트는 호환을 위해 남기되 `Navigate to="../intelligence/therapy-notes"`로 리다이렉트.

## 영향 받는 파일

- `src/pages/b2b-center/console/TherapyNotesPage.tsx` — 회기 카드 섹션 신설, `center_sessions` 조회/저장 로직 흡수, 사진 첨부를 회기 카드 안으로 이동.
- `src/pages/b2b-center/console/SessionRecordsPage.tsx` — 삭제 또는 리다이렉트 shim으로 축소.
- `src/pages/b2b-center/B2BCenterApp.tsx` — 메뉴 항목 정리, 라우트 리다이렉트.
- `supabase/functions/generate-weekly-therapy-note/index.ts` — 프롬프트에 회기기록 텍스트 합치기.
- `supabase/functions/analyze-session-upload/index.ts` — `sessionId` 옵션 수용.
- `src/pages/b2b-center/console/GuidePage.tsx` — 안내 문구 갱신.

## 영향 없는 항목

- 부모 월간 리포트(`SampleParentReport`)·화이트라벨 템플릿·발행/공유 흐름은 그대로.
- 월 서비스 관리(달력 뷰)는 유지.
- 데이터 스키마/RLS 변경 없음.

## 단계

1. AI 프롬프트에 회기기록 텍스트 합치기 (엣지 함수).
2. `TherapyNotesPage`에 회기 카드 섹션 추가 + 사진 첨부를 카드 단위로 묶기.
3. 사이드바/라우팅 정리, 리다이렉트 shim.
4. Guide 페이지 문구 업데이트.
