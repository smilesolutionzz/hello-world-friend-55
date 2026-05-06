# B2B 운영 MVP 패키지 (5개 트랙 일괄 구축)

론칭 6월 기준 — B2B 영업·운영 파이프라인을 한 사이클로 닫는 작업입니다. 5개 작업을 순차/병렬로 구축합니다.

---

## 01. 리드 게이트 (케이스 스터디 / 보안 백서)

**목표:** 무료 다운로드 직전에 이메일 폼을 노출 → `b2b_inquiries`에 자동 적재 → 자동 follow-up 메일.

**구현**
- 신규 컴포넌트 `LeadCaptureGate.tsx` (이메일·소속·역할·관심자료 입력)
- `BusinessCaseStudies.tsx` / `SampleReport.tsx` (보안 백서 PDF) 다운로드 버튼을 게이트 뒤로 래핑
- 새 테이블 `b2b_lead_downloads` (asset_key, email, company, role, ip, user_agent, downloaded_at)
- 제출 시:
  1. `b2b_lead_downloads` insert
  2. `b2b_inquiries` upsert (status=`new`, source=`lead_magnet:<asset_key>`)
  3. `b2b_followup_queue` enqueue (D+0 자료 메일, D+3 케이스 메일)
- PDF는 게이트 통과 후 토큰화된 signed URL로 제공 (스토리지 `b2b-resources` 버킷, RLS public read off)

---

## 02. 잡코치 결제·계약 플로우 (견적서 → 인보이스)

**목표:** 플랜 선택 → 견적서 PDF 자동 생성 → 관리자 승인 → 토스 결제/세금계산서.

**구현**
- `JobCoachPricingTiers`에 "견적서 받기" CTA 추가 (인원수·기간·플랜 입력)
- 신규 테이블:
  - `b2b_quotes` (id, inquiry_id, plan_key, employee_count, months, unit_price, total, vat, status[draft/sent/accepted/rejected/expired], pdf_url, valid_until)
  - `b2b_invoices` (id, quote_id, invoice_no, billing_period, amount, vat, status[issued/paid/overdue/void], paid_at, toss_payment_key)
- 신규 Edge Function `generate-quote-pdf`: pdf-lib로 견적서 PDF 생성 → Storage `b2b-quotes` 버킷 업로드 → signed URL 반환
- 신규 Edge Function `issue-b2b-invoice`: quote 승인 시 인보이스 행 생성 + PDF 생성 + 토스 결제 링크(이미 있는 PayButton 흐름 재사용) 발급
- 어드민 칸반(아래 #5)에서 "견적 승인" 버튼 → invoice 자동 발행 → 메일 발송 (`send-transactional-email`)

---

## 03. 회사 초대 코드 (직원 자동 소속 연결)

**목표:** `EmployeeOrgJoinCard`가 현재 institution UUID 직접 입력 방식 → 사람이 외울 수 있는 8자리 코드로 교체.

**구현**
- `b2b_partner_institutions`에 `join_code TEXT UNIQUE`, `join_code_expires_at` 컬럼 추가
- `email_domain_whitelist TEXT[]` 컬럼 추가 (도메인 자동 매칭용)
- 신규 RPC `generate_institution_join_code(institution_id)` — 8자리 영숫자, security definer
- 신규 RPC `redeem_join_code(code, department)` — 코드 검증 + `employee_organization_links` insert + 기본 sharing prefs 생성 (트랜잭션)
- 신규 Edge Function `auto-link-by-email-domain`: 회원가입 시 trigger로 호출 — 이메일 도메인이 화이트리스트에 있으면 자동 link
- 어드민 `InstitutionManagement`에 "초대 코드 발급/회전/QR" 섹션 추가
- `EmployeeOrgJoinCard` 수정: UUID 입력 → 8자리 코드 입력으로 UX 변경

---

## 04. HR 대시보드 실데이터 연결

**목표:** `useCorporateAnalytics` mock → 실제 `b2b_jobcoach_employee_sessions` 집계.

**구현**
- 신규 SQL view `v_b2b_dept_weekly_aggregates`:
  - 부서별·주차별 평균 stress/burnout/satisfaction, 세션 수, 위험 직원 수
  - **5명 미만 부서는 마스킹** (메모리 룰: B2B Employee Data Pipeline)
- 신규 view `v_b2b_company_overview` (전체 평균, 추이, 위험 비율, 코칭 사용률)
- `useCorporateAnalytics.ts` 재작성:
  - 현재 사용자의 institution_id를 `employee_organization_links` 또는 `institution_admins`에서 조회
  - view 두 개 select → 가공
- RLS: 두 view에 institution admin만 select 가능한 정책 + has_role 체크
- HR 대시보드 UI에 "주간 트렌드" / "부서 히트맵" 차트 추가 (recharts)
- 5명 미만 마스킹 시 "데이터 보호 — 표본 부족" 카드로 대체 표시

---

## 05. B2B 통합 칸반 보드 (어드민)

**목표:** `b2b_inquiries` + `b2b_jobcoach_inquiries` + `b2b_lead_downloads` + `b2b_quotes`를 한 보드에서 상태별로 운영.

**구현**
- 신규 컴포넌트 `B2BKanbanBoard.tsx` — 컬럼: New → Contacted → Qualified → Quote Sent → Won → Lost
- 카드: 회사명, 담당자, 인원, 관심 플랜, 마지막 활동, 리드 점수, 견적 상태 뱃지
- 드래그 앤 드롭으로 status 변경 (`@dnd-kit` 이미 설치됨, 확인 필요 — 없으면 간단한 select로 대체)
- 카드 클릭 → 상세 모달 (메모, 활동 타임라인, 견적 발행 버튼, 메일 발송 버튼)
- AdminDashboard에 "B2B 칸반" 탭 추가 (기존 `b2b_inbox` 탭 대체 또는 추가)
- 자동 리마인더:
  - `b2b-followup-dispatcher` 확장 — 상태별 SLA 위반 감지
    - `new` 24h 무응답 → 담당자에게 슬랙형 알림(메일)
    - `contacted` 3일 무응답 → 자동 nudge 메일
    - `quote_sent` 7일 무응답 → 만료 알림
  - 신규 templates: `b2b-internal-sla-alert`, `b2b-quote-followup`
- pg_cron job 1시간 주기 (이미 있음, 재사용)

---

## 데이터베이스 변경 요약

새 테이블: `b2b_lead_downloads`, `b2b_quotes`, `b2b_invoices`
컬럼 추가: `b2b_partner_institutions.join_code`, `join_code_expires_at`, `email_domain_whitelist`
새 view: `v_b2b_dept_weekly_aggregates`, `v_b2b_company_overview`
새 RPC: `generate_institution_join_code`, `redeem_join_code`
새 Storage 버킷: `b2b-resources` (private), `b2b-quotes` (private)
모든 신규 테이블에 RLS 적용 — admin/institution_admin만 접근

## 신규 Edge Functions

- `generate-quote-pdf` — 견적서 PDF
- `issue-b2b-invoice` — 인보이스 발행 + 메일
- `auto-link-by-email-domain` — 도메인 매칭 자동 소속 연결
- `b2b-followup-dispatcher` 확장 — SLA 알림

## 작업 순서 (한 메시지에 일괄)

1. DB 마이그레이션 (테이블/컬럼/뷰/RPC/RLS/스토리지)
2. Edge Functions 4종
3. `LeadCaptureGate` + 다운로드 페이지 게이트
4. 견적·인보이스 UI (`JobCoachPricingTiers` 확장 + 어드민 발행 화면)
5. 초대 코드 UI (`InstitutionManagement` + `EmployeeOrgJoinCard` 리팩터)
6. `useCorporateAnalytics` 실데이터 + HR 대시보드 차트
7. `B2BKanbanBoard` + AdminDashboard 탭 등록
8. follow-up dispatcher 확장 + 템플릿

승인 주시면 위 순서로 한 번에 구현하겠습니다.
