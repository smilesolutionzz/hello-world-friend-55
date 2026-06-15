---
name: Therapy notes KidsNote-style system
description: 주간 치료노트 — 사진 업로드 → Gemini Vision OCR → AI 주간 리포트 → 치료사 편집 → 보호자 AIHPRO 웹 공유
type: feature
---
**핵심 흐름**: 치료사가 회기 일지 사진을 `/b2b-center/app/intelligence/therapy-notes` 에서 업로드 → `analyze-session-upload` 엣지가 Gemini Vision으로 OCR + 활동/감정/목표/진전도 JSON 추출 → 주간 단위로 `generate-weekly-therapy-note` 호출 → AI 초안 생성 → 치료사가 편집(AI 확장/부드럽게/부모친화/줄이기 4가지 rewrite) → 발행 시 `center_parent_reports.status='published'` → 보호자는 `/parent/center` 에서 키즈노트 스타일 피드로 확인 + 이모지 반응/댓글.

**테이블**:
- `center_session_uploads` — 사진 업로드 + OCR + 추출. RLS: 센터 멤버만.
- `center_parent_reports` 확장 — `period_type`('weekly'|'monthly'), `week_key`, `source_upload_ids`, `ai_draft_json`, `edited_html`, `title`, `published_at`. 보호자는 `linked_user_id` 매칭 + `status='published'` 일 때만 read.
- `center_parent_report_comments` — 댓글/이모지 반응.
- `center_clients.linked_user_id` — 보호자 매칭 (기존 컬럼 재사용).

**스토리지**: 버킷 `center-session-uploads` (private). 엣지 함수가 service_role로 ensureBucket() — 직접 SQL/storage.buckets INSERT 금지(blocked).

**RPC**: `get_my_linked_children()` — 보호자가 자기 자녀 목록 조회.

**엣지 함수**: 3개 — `analyze-session-upload`, `generate-weekly-therapy-note`, `expand-therapy-note`. 모두 Lovable AI Gateway + `google/gemini-3-flash-preview`.

**보호자 매칭**: 기존 `center_client_invites` 흐름을 통해 보호자 회원가입 시 `center_clients.linked_user_id` 채워야 함 (별도 Phase에서 보강).
