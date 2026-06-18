
요청하신 4가지 항목 — 기능 목록, DB 스키마, 가입 센터/사용 로그, 변경 이력 — 을 정리한 현황 리포트입니다. (코드 자체는 연결된 GitHub 리포에서 받으시면 됩니다. Lovable 좌측 하단 + 메뉴 → GitHub → "Open on GitHub"로 접근 가능, 또는 워크스페이스 GitHub 연결 계정의 리포 목록에서 확인.)

---

## 1. B2B Center 콘솔 — 기능/화면 전체 목록과 작동 상태

라우트 prefix: `/b2b-center/app/...` (실제 코드: `src/App.tsx` 라인 616~)

| 영역 | 경로 | 화면 | 상태 | 비고 |
|---|---|---|---|---|
| 진입 | `/b2b-center` | 랜딩 (요금/3대 핵심기능) | 완성 | 60일 무료체험 안내 |
| 진입 | `/b2b-center/app` | 콘솔 진입 (조직 선택) | 완성 | "콘솔 입장" 가능 여부 표시 추가됨 |
| 진입 | `/b2b-center/import` | 데이터 임포트 (엑셀/시트) | 완성 | 42건 import job 존재 |
| 진입 | `/b2b-center/migrate` | 마이그레이션 도우미 | 완성 | |
| 진입 | `/b2b-center/invite/:token` | 직원 초대 수락 | 완성 | |
| 온보딩 | `app/setup` | 5단계 온보딩 위저드 | 완성 | WAVE 1 인프라 |
| 인텔리전스 | `app/intelligence/ops-dashboard` | 운영 대시보드 (KPI) | 완성 (기본 지표) | index 진입 시 자동 라우팅 |
| 인텔리전스 | `app/intelligence/parent-reports` | 학부모 리포트 | 완성 | 데이터 12건 |
| 인텔리전스 | `app/intelligence/therapy-notes` | 치료노트 | 완성 | |
| 이용자 | `app/clients` | 이용자(아동/성인) 관리 | 완성 | 2,632명 등록 |
| 일정 | `app/schedule` | 주간 일정 / 회기 캘린더 | 완성 | 85,006 세션 |
| 서비스 | `app/services/by-therapist` | 치료사별 회기 | 완성 | |
| 서비스 | `app/services/attendance` | 출결 관리 | 완성 | |
| 서비스 | `app/services/monthly` | 월별 서비스 집계 | 완성 | |
| 서비스 | `app/services/records` | 회기 기록 보기 | 완성 | |
| 수납 | `app/billing/process` | 당일 수납 처리 | 완성 (방금 작업) | 일별 자동 등록 지원 |
| 수납 | `app/billing/stats` | 수납 통계(일별 피벗+월마감) | 완성 (방금 리팩토링) | 데이터 없으면 가장 최근 회기일로 자동 점프, 미수금/탭6종 |
| 수납 | `app/billing/voucher-audit` | 바우처 감사 체크리스트 | 완성 (UI) | 카테고리/항목 시드 필요할 수 있음 |
| 수납 | `app/billing/voucher-claims` | 전자바우처 청구(.xlsx 생성) | 완성 (WAVE 1) | 청구 데이터 0건 — 실사용 검증 전 |
| 데이터 | `app/data/voucher-excel` | 바우처 엑셀 임포트 | 완성 | |
| 운영 | `app/admin/therapists` | 치료사 관리 | 완성 | 148명 등록 |
| 운영 | `app/admin/programs` | 프로그램(서비스 종류) | 완성 | 223건 |
| 운영 | `app/admin/organization` | **기관 정보 입력/수정** | 완성 (방금 신규) | 사업자번호/주소/연락처/계약만료/스토어슬러그 |
| 평가 | `app/assessments` | 센터 평가 결과 | 완성 (기본) | |
| 스토어 | `app/storefront` | 센터 스토어프론트 관리 | 완성 | |
| 공개 | `/center/:slug` | 외부 공개 스토어 | 완성 | partner_programs/products 재사용 |
| 가이드 | `app/guide` | 사용 가이드 | 완성 | |

부분 구현/검증 필요:
- `voucher-claims`: UI/스키마 완성, 실제 청구 데이터 0건 (실 워크플로우 미검증)
- `billing/stats` 월마감(`center_billing_closings`): 0건, 로직만 존재
- `ops-dashboard`: 기본 KPI만, 부서/매출 트렌드 위젯 확장 여지

(B2B Center 외 메인 SaaS 기능 — `/mind-track`, `/expert-hiring`, `/report-generator-pro`, `/find-center`, `/b2b-jobcoach` 등 — 도 정리가 필요하시면 별도 리포트로 분리하겠습니다. 이 리포트는 최근 작업 흐름을 따라 B2B Center에 집중했습니다.)

---

## 2. Supabase DB 스키마

전체 public 스키마 테이블 수: **약 360개**
B2B Center 직접 관련 테이블 (총 25개):

```text
center_organizations (14col)  ── 기관 마스터 (plan, trial_ends_at, storefront_slug)
 ├─ center_members             멤버 권한
 ├─ center_clients (16)        이용자 (2,632행)
 ├─ center_therapists (16)     치료사 (148행)
 ├─ center_programs (9)        서비스 종류 (223행)
 ├─ center_sessions (17)       회기 (85,006행) ── client_id/therapist_id/program_id
 │   └─ center_session_uploads 회기 첨부
 ├─ center_payments (12)       수납 (0행)
 ├─ center_billing_closings    월마감 (0행)
 ├─ center_voucher_claims      전자바우처 청구 (0행)
 │   └─ center_voucher_claim_items
 ├─ center_vouchers            바우처 잔량
 ├─ center_parent_reports (25) 학부모 리포트 (12행)
 │   └─ center_parent_report_comments
 ├─ center_assessments (10)    평가
 ├─ center_invites             직원 초대
 ├─ center_client_invites      이용자 초대
 ├─ center_import_jobs (11)    임포트 작업 (42행)
 ├─ center_onboarding_progress 온보딩 진척
 ├─ center_notifications_log
 ├─ center_support_tickets
 ├─ center_b2c_grants          B2C 무료 권한 부여
 ├─ center_receipts            영수증
 ├─ center_directory           공개 디렉토리
 └─ center_inquiries           외부 문의
```

핵심 FK: 거의 모든 테이블이 `center_id → center_organizations.id`로 묶여있고, RLS는 `center_members` 기반으로 본인 소속 기관 데이터만 접근.

**전체 스키마(360+ 테이블 컬럼/관계/RLS)는 CSV 3종으로 export 가능합니다** — build 모드에서 다음을 실행하면 `/mnt/documents/aihpro-export/`에 저장 후 다운로드 링크 제공:
- `schema_columns.csv` (모든 테이블·컬럼·타입·기본값)
- `foreign_keys.csv` (테이블 간 FK 관계 전체)
- `rls_policies.csv` (RLS 정책 전체)

(현재는 plan 모드라 파일 쓰기가 차단되어 export 실행을 못했습니다.)

---

## 3. 현재 가입/이용 중인 센터 + 사용 로그

`center_organizations` 등록: **16개 (모두 trial)**. 실제 데이터 입력된 활성 센터:

| 기관명 | 이용자 | 치료사 | 회기 누적 | 최근 회기일 |
|---|---:|---:|---:|---|
| 한점미소발달센터 (메인) | 908 | 31 | 26,323 | 2026-12-29 |
| miso | 668 | 19 | 17,970 | 2026-12-29 |
| 한점미소발달센터 (지점2) | 354 | 26 | 14,619 | 2026-12-29 |
| 이수석 | 164 | 19 | 11,517 | 2026-12-26 |
| JOAN | 105 | 12 | 5,476 | 2026-12-29 |
| 한점미소발달센터 (지점3) | 78 | 13 | 5,476 | 2026-12-29 |
| 한점miso | 271 | 12 | 3,238 | 2026-12-29 |
| 테이크텐 | 3 | 2 | 273 | 2029-08-08* |
| 한점미소발달센터 (지점4) | 80 | 12 | 112 | 2026-05-30 |
| 하석호 | 1 | 2 | 2 | 2026-06-24 |

\* 테스트성 미래 날짜 1건 의심
나머지 6개 기관은 등록만 되어있고 데이터 0 (빈 셸 / 중복 생성 추정 — 정리 권장).

**사용 로그 성격의 데이터**:
- 회기(`center_sessions`): 85,006행 ← 가장 활성 신호
- 임포트 작업(`center_import_jobs`): 42회 (시트/엑셀 흡수)
- 수납(`center_payments`): **0건** ← 실 운영에서 아직 수납 입력 없음 (방금 일별 자동등록 도입했으니 사용 시작 단계)
- 학부모 리포트: 12건
- 바우처 청구: 0건

별도 "활동 로그" 테이블(`audit_log` 류)은 없습니다. 필요하시면 추가 설계 가능.

---

## 4. 변경 이력 / PRD 문서

- 별도 `CHANGELOG.md` / `PRD.md` 파일은 리포에 없습니다.
- 사실상의 변경 이력 = **Supabase 마이그레이션 파일** (`supabase/migrations/*.sql`).
  - 2026-05-25 ~ 2026-06-17 사이 **30+ 마이그레이션** (B2B 센터 WAVE 1 집중기).
  - GitHub에서 리포의 `supabase/migrations/` 폴더 = 시간순 DB 변경 로그.
- 기획/정책 메모는 **프로젝트 메모리**(mem://...)에 분산 저장. 예: B2B Center WAVE 1, Center Storefront, 60일 무료 등 — 이게 사실상의 mini-PRD 역할.
- `docs/` 폴더에는 `benchmarks/`(경쟁사 캡처), `security/`만 존재.

---

## 다음 단계 (Build 모드 전환 시)

승인해주시면 build 모드에서:
1. `/mnt/documents/aihpro-export/` 에 CSV 3종 export (스키마/FK/RLS) → 다운로드 링크 제공
2. (옵션) `docs/PRD-B2B-CENTER.md` 자동 생성 — 이 리포트 + 메모리 합본
3. (옵션) `CHANGELOG.md` 초기 작성 — 마이그레이션 파일에서 역추출

GitHub 리포 주소는 Lovable 우측 상단 **GitHub 아이콘 → "Open in GitHub"** 또는 좌측 하단 + 메뉴 → GitHub에서 바로 열 수 있습니다. (워크스페이스 정책상 제가 직접 리포 URL을 출력할 수 없어 이 경로로 안내드립니다.)
