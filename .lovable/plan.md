# 치료노트 키즈노트형 시스템

기존 `center_parent_reports` (월간 부모 리포트) 위에 **주간 치료노트 + 사진 OCR + 보호자 웹 뷰**를 얹는 방향. 새 테이블 최소화, 기존 흐름 재활용.

---

## 01. 데이터 모델 (마이그레이션 1개)

**신규 1테이블 + 기존 1테이블 컬럼 추가:**

- `center_session_uploads` (신규)
  - `client_id`, `therapist_id`, `session_date`, `image_url`, `ocr_text`, `ai_extracted` (jsonb: 활동/감정/목표/진전도), `status` ('pending'|'parsed'|'used'), `week_key` (e.g. `2026-W24`)
  - Storage 버킷: `center-session-uploads/{center_id}/{client_id}/{yyyy-mm-dd}-{uuid}.jpg` (private)
- `center_parent_reports`에 컬럼 추가
  - `period_type` ('weekly'|'monthly'), `week_key`, `source_upload_ids` uuid[], `ai_draft_json` jsonb, `edited_html` text
- RLS: 센터 멤버만 자신의 센터 데이터 access. 보호자 공개는 기존 `get_center_parent_report_by_token` RPC + 새로 `get_session_upload_image_by_token` (서명 URL) 추가하거나, 보호자 웹 뷰는 로그인 후 `center_clients.parent_user_id` 매칭으로 권한.

## 02. 보호자 인증 (AIHPRO 웹 로그인)

- `center_clients.parent_user_id` (uuid, nullable) 추가 — 부모 초대 수락 시 채워짐
- 초대 흐름 재활용: 기존 `center_client_invites` 사용 (이미 있음). 수락 페이지에서 부모가 AIHPRO 회원가입/로그인 후 매칭
- 보호자용 신규 페이지 `/parent/center` — 자기 자녀의 모든 주간 치료노트 타임라인 (키즈노트 피드 UI)

## 03. UI/페이지

### 치료사용 (B2B Center 콘솔, `/b2b-center/app/intelligence/`)

신규 페이지 1개 + 기존 페이지 확장:

- **신규: `TherapyNotesPage.tsx`** — `intelligence/therapy-notes`
  - 좌측: 이용자 선택 + 주차 선택
  - 중앙 상단 "이번 회기 일지 업로드" (드래그/카메라/파일) → Edge Function `analyze-session-upload` 호출 → OCR + 추출 → 카드로 표시
  - 중앙 하단 "이번주 치료노트 자동 생성" 버튼 → 해당 주 업로드 묶어 Gemini로 주간 노트 초안 생성 → 편집기 (Tiptap 또는 textarea + AI 확장 버튼)
  - 우측: "AI 확장하기 / 톤 바꾸기 / 부모 친화적으로" 도구 모음
  - "발행하고 보호자에게 공유" → `center_parent_reports.status='published'` + 알림 트리거

- **확장: `ParentReportsPage.tsx`** — 주간 탭 추가 (기존 월간 유지)

### 보호자용 (AIHPRO 웹)

- 신규 `/parent/center` (로그인 필요) — 키즈노트 스타일 피드 카드 + 댓글/이모지
- 댓글: `center_parent_report_comments` (간단 테이블)

## 04. Edge Functions

- **`analyze-session-upload`** (신규): 이미지 받음 → Gemini Vision (`google/gemini-3-flash-preview`)로 OCR + 활동/감정/목표/진전도 JSON 추출 → DB 저장
- **`generate-weekly-therapy-note`** (신규): 주차+client_id → 해당 주 모든 upload 묶음 → Gemini로 부모 친화적 주간 노트 작성 → `center_parent_reports` insert(draft)
- **`expand-therapy-note`** (신규, 또는 `ai-rewrite` 재사용 확인): 선택 영역 텍스트 + 명령("확장"/"부드럽게"/"전문가톤") → 재작성 반환

스토리지 버킷 생성: `center-session-uploads` (private)

## 05. 공유 흐름 (확정: AIHPRO 웹)

발행 시:
1. `center_parent_reports.status = 'published'`, `published_at = now()`
2. 보호자 매칭된 user_id에 `user_notifications` insert ("새 치료노트가 도착했어요")
3. 이메일/카카오는 Phase 2 — 우선 웹 알림만

(구글 스프레드시트는 이번 범위에서 제외 — 추후 옵션으로 토글)

## 06. 단계별 구현 순서

1. 마이그레이션: `center_session_uploads` 테이블 + `center_parent_reports` 컬럼 추가 + `center_clients.parent_user_id` + 스토리지 버킷 + RLS
2. Edge Function 3개 배포
3. `TherapyNotesPage` (치료사용) — 업로드 → AI 분석 → 주간 노트 생성 → 편집 → 발행
4. 보호자 페이지 `/parent/center` + 알림
5. 사이드바 메뉴에 "치료노트" 추가, `B2BCenterApp.tsx` `navItems` 업데이트

## 07. 디자인

- 흰 카드 (`bg-white rounded-2xl`), 금색 포인트 `#C8B88A`, Pretendard
- 키즈노트 느낌이지만 이모지/유아틱 컬러는 피함 — 부드러운 베이지 그라데이션 카드
- 업로드 영역은 점선 박스 + 드래그&드롭

## 08. 범위 제외 (Phase 2 후보)

- 구글 스프레드시트 자동 동기화
- 카카오/이메일 푸시 알림
- 보호자→치료사 음성 답글
- 동영상 업로드 (사진만)

---

**확정 사항 (답변 기반):**
- 공유 = AIHPRO 웹 (보호자 로그인, 댓글/이모지)
- 빈도 = 주 1회 일괄 업로드 → 주간 리포트
- 사진 분석 = Gemini Vision OCR + 활동/감정/목표 자동 추출 (치료사는 검토/편집)
