---
name: B2B Center admin-wedge pivot (Tieum feedback)
description: B2B Center 베타 피드백 반영 — 부모리포트 wedge 폐기, 원장 행정 자동화 4종(바우처일지·지도점검·수납·케어플이관)을 Phase 1 wedge로
type: feature
---

**배경**: 틔움발달센터 김선길 대표(베타 1호) 피드백 — "부모리포트는 해도 그만 안해도 그만. 원장이 돈 내는 이유는 행정 고통 해방이다. 케어플 갈아탈 이유가 부모리포트로는 약하다."

**Phase 1 wedge (현재)**:
1. 바우처 일지 자동 작성 — 한 줄 메모 or 사진 → AI 장문 → 인쇄/철. 백필 모드 (`therapy-notes` + `expand-therapy-note`)
2. 지도점검 대응 키트 — 누락 서류 자동 진단 + 양식 자동 생성 (`voucher_audit_*` 테이블)
3. 수납·미수금 자동화 — 매달 본인부담금 안내 문자 자동 발송 (`BillingStatsPage` + 메시징 모듈)
4. 케어플 마이그레이션 마법사 — CSV/스크린샷 → AI 컬럼 매핑 → 일괄 import (`OnboardingWizardPage` + `center_import_jobs`)
- 보조: AI 운영 가이드 챗봇 (바우처 FAQ)

**Phase 2 (보류)**: 부모 월간 리포트, 화이트라벨 정교화, 스토어/광고 수익화. 부모 락인은 Phase 1 KPI 트리거 후로.

**랜딩(`B2BCenterLanding.tsx`)**: H1 = "바우처 일지·지도점검·수납. AI가 다 합니다." 비교표 vs 케어플은 행정 자동화 항목 중심. 부모리포트는 "보조" 라벨로 강등.

**금지**: 부모리포트를 다시 메인 wedge로 끌어올리지 말 것. 영업 메시지는 항상 "원장 행정 해방" 우선.
