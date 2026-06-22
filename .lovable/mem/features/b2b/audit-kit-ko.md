---
name: 지도점검 대응 키트
description: B2B Center 지도점검(연1회 감사) 대응 — 65항목 체크리스트 + AI 누락서류 초안 (발달재활서비스)
type: feature
---

**위치**: `/b2b-center/app/audit` (사이드바 "지도점검" 그룹). 컴포넌트: `AuditKitPage.tsx`.

**데이터**:
- `voucher_audit_categories`/`voucher_audit_items` (voucher_type_id = 발달재활서비스 `cd278a6e-41f9-43a8-a9a8-3ecc5485431c`)
- 65항목 시드 (item_code `DEV_*`, 8 카테고리: 시설/인력/회기·일지/회계/바우처청구/안전/개인정보/종사자교육)
- 각 항목: `source_citation` + `source_type`(`official`|`common`), `can_generate_doc`, `generate_prompt`
- 센터별 진행 상태: 신규 테이블 `center_audit_state` (center_id, audit_item_id, status: `pending`|`done`|`na`, note). RLS = center_members 멤버만.

**AI 초안 생성**: 기존 `expand-therapy-note` 엣지 재사용 (`instruction='professional'` + `generate_prompt` 전달). 신규 엣지 0개.

**UI 규칙**: 골드 액센트 #C8B88A, 그라데이션 금지. 도넛 진행률 + D-day(2026-09-15 가정). 공문 업로드 슬롯은 Phase 2(disabled).

**데모 모드**: `?demo=true` → 65항목 중 60%/10%/30% (done/na/pending) 시드 표시, 저장 차단.

**Phase 2 (보류)**: 공문 PDF 파싱·시·도별 항목 자동 보강·D-30 알림톡 발송.
