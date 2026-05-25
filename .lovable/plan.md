
# AIHPRO B2B 발달치료센터 솔루션 — `/b2b-center` (V2 풀스펙)

케어플센터(₩44,000/월) **전체 메뉴 트리 정면 대체** + AIHPRO만 가능한 **임상 인텔리전스 레이어** 탑재. 가격은 ₩39,000/월로 정면 비교.

## 1. 케어플 전체 메뉴 트리 (스크린샷 1~11 통합)

```
[게시판]     공지·자료·Q&A
[일정]       주간 캘린더 (치료사 라인, 회기 블럭)
[이용자 및 상담/평가]
  ├ 이용자 관리             (대기 81 / 등록 187 / 종결 3)
  └ 상담 및 평가 관리        (일정상태 / 기록 탭)
[재활 서비스]
  ├ 월 서비스 관리           (493회기 그리드)
  ├ 일일 서비스 관리          (오늘 회기)
  ├ 바우처 서비스 지원        (바우처 전용 처리)
  ├ 일별 접수인원 현황        (날짜별 인원)
  ├ 선생님별 이용자 현황      (치료사 그룹, 담당 이용자 칩)
  └ 기록 등록 현황            (회기 메모 작성률)
[수납]
  ├ 수납처리·수납내역·현황
  ├ 통계 (년간/분기/월/출석율)
  ├ 영수내역
  └ 부정결제 찾기 (전자바우처 대조)
[관리자]
  ├ 시스템 정보
  ├ 기관 정보 및 옵션 설정
  ├ 선생님 관리 (31명, 색상·직급·계정·로그인이력)
  ├ 프로그램 관리
  └ 바우처 관리
[고객지원]
  ├ FAQ
  ├ 온라인문의/문자서비스신청 (서비스문의/오류/불만/제안/알림톡)
  ├ 알림톡/문자발송 신청목록
  └ 유료계약 신청내역
```

## 2. AIHPRO 라우트 구조 (1:1 매핑 + 차별화 레이어)

```
/b2b-center                       공개 랜딩 (가격·비교·데모요청)
/b2b-center/import                엑셀 일괄 import 마법사 (포맷 자동 감지)
/b2b-center/app                   로그인 콘솔
  ├ /board                        게시판
  ├ /schedule                     주간 캘린더
  ├ /clients                      이용자 관리
  ├ /assessments                  상담·평가 관리
  ├ /services
  │   ├ /monthly                  월 서비스 관리
  │   ├ /daily                    일일 서비스 관리
  │   ├ /voucher                  바우처 서비스 지원
  │   ├ /attendance               일별 접수인원 현황
  │   ├ /by-therapist             선생님별 이용자 현황 ★
  │   └ /records-progress         기록 등록 현황
  ├ /billing
  │   ├ /process                  수납처리
  │   ├ /history                  수납내역
  │   ├ /stats                    통계 (년/분기/월/출석율)
  │   ├ /receipts                 영수내역
  │   └ /voucher-audit            부정결제 찾기
  ├ /admin
  │   ├ /system                   시스템 정보
  │   ├ /organization             기관 정보·옵션
  │   ├ /therapists               선생님 관리 (색상·계정)
  │   ├ /programs                 프로그램 관리
  │   └ /vouchers                 바우처 관리
  ├ /support
  │   ├ /faq
  │   ├ /inquiry                  온라인문의 (5종 라디오)
  │   ├ /notifications            알림톡/문자 발송이력
  │   └ /contract                 유료계약 신청내역
  └ /intelligence ★★★  [AIHPRO 차별화 단독 메뉴]
      ├ /parent-reports           이용자별 월간 부모 리포트 (PDF, Gemini 3.1)
      ├ /therapist-coaching       치료사 코칭 리포트
      ├ /ops-dashboard            운영 KPI 대시보드 (NSM·위험신호)
      └ /weekly-insights          주간 인사이트 메일 (자동발송)
```

## 3. 엑셀 일괄 Import (최우선 기능)

**1회 업로드로 전체 데이터 이관** — 2가지 포맷 자동 감지:

**포맷 A — 케어플 다운로드 엑셀 그대로**
- 월 서비스 관리·이용자 관리·선생님별 이용자 현황 등 각각 다운로드한 파일을 헤더 시그니처로 자동 분류
- 사전 정의된 케어플 컬럼 매핑 테이블

**포맷 B — AIHPRO 표준 템플릿 (8시트 워크북)**
- `clients` / `therapists` / `programs` / `vouchers` / `sessions` / `payments` / `assessments` / `org_info`
- 템플릿 다운로드 버튼 제공

**플로우**: 업로드 → SheetJS 파싱 → 포맷 판정 → 매핑 미리보기(드롭다운 수정) → 검증(필수·날짜·중복) → 배치 upsert → 결과 요약(이용자 187 / 치료사 31 / 회기 493 / 수납 N 완료)

## 4. 화면별 핵심 위젯

**캘린더** — 주/일/월/4일/목록 토글, 치료사 색상 라인, 상태 패턴(예정·완료·취소·취소이월=빗금·취소보강), 회기 클릭 사이드시트, 유료계약 D-N 배너

**이용자 관리** — 상태 칩 카운터, 통합검색, 등록·일괄등록·다운로드, 행 클릭 우측 슬라이드(회기/수납/평가/부모리포트 발행)

**선생님별 이용자 현황 ★** — 치료사 카드 + 담당 이용자 칩(이름·성별·생년월일), 인원수, 다운로드

**선생님 관리** — 31명 도넛차트(정상/잠금/퇴사), 캘린더색상 토글, 직급·계정·최종로그인 컬럼, 계정상태 토글

**수납 통계** — 년간 라인차트, 분기별 매출 4분할, 월별 출석율 탭, 영수증 PDF

**부정결제 찾기** — 전자바우처 엑셀(장애아동가족지원/지역사회투자사업) 업로드 → `sessions` 대조 → 불일치 리포트

**고객지원** — 라디오 5종(서비스문의/오류/불만/제안/알림톡), 알림톡 발송 이력, 유료계약 신청 트래커

## 5. AIHPRO 차별화 (`/intelligence`)

**A. 부모 월간 리포트** — 이용자별 회기 누적 → Gemini 3.1 `reasoning.effort: medium` → PDF, 표 금지, 골드 액센트, 브랜딩 헤더. 일괄 카카오/이메일 발송, 발행 이력 보관
**B. 치료사 코칭 리포트** — 담당 회기 패턴·취소율·시간대·프로그램 다양도 → 강점/개선/다음달 목표
**C. 운영 KPI 대시보드** — NSM(활성/회기/매출/출석률/치료사가동률), 위험신호(취소율 급증·바우처만료 D-30), AI 요약 카드
**D. 주간 인사이트 메일** — 화요일 자동발송 (pg_cron + 엣지함수)

## 6. 가격·진입

- 랜딩: 케어플 ₩44,000/월 vs AIHPRO **₩39,000/월** (부모리포트·치료사 코칭 무제한 포함)
- 결제 게이트 없음 → 「데모 요청」 폼 → 영업
- `src/constants/tokenCosts.ts`에 `B2B_CENTER_MONTHLY: 39000` 추가 (메모리 정책 준수)

## 7. 기술 스펙

**프론트엔드**
- 신규 페이지: `src/pages/b2b-center/*` (Landing, Import, App 네스티드 라우트)
- 신규 컴포넌트: `src/components/b2b-center/*` (Calendar, ClientTable, ByTherapistView, BillingChart, ImportWizard, VoucherAudit, TherapistAdmin, ProgramAdmin, ParentReportButton, OpsDashboard 등)
- `xlsx` (SheetJS) 추가
- 캘린더: `react-big-calendar` (또는 모바일 대응 자체 grid)
- 디자인: 화이트 미니멀, `bg-white`/`rounded-2xl`, 골드 #C8B88A 액센트, Pretendard

**백엔드 (Supabase) — 신규 테이블 14개**
- `center_organizations` / `center_members` / `center_clients` / `center_therapists` / `center_programs` / `center_vouchers` / `center_sessions` / `center_payments` / `center_receipts` / `center_assessments` / `center_inquiries` / `center_notifications_log` / `center_import_jobs` / `center_parent_reports`
- RLS: `has_center_role(center_id, role)` SECURITY DEFINER로 격리
- 인덱스: `(center_id, date)`, `(center_id, client_id)`, `(center_id, therapist_id)`

**엣지 함수**
- `import-center-excel` — 포맷 감지·매핑·배치 upsert
- `generate-parent-report` — Gemini 3.1
- `generate-therapist-coaching`
- `audit-voucher-mismatch`
- `send-center-weekly-insights` — pg_cron 화요일 자동발송

**스토리지** — `center-imports`(비공개), `center-reports`(PDF, 비공개)

## 8. MVP 단계 (스코프가 크므로 3단계 분할)

**Phase 1 — Import + 읽기 콘솔 (먼저 빌드)**
- 랜딩 페이지 + 비교/가격
- 엑셀 import 마법사 + `import-center-excel` 엣지
- DB 스키마 14개 + RLS
- 이용자·치료사·회기·수납 읽기 전용 테이블
- 선생님별 이용자 현황 뷰
- 일별 접수인원·기록 등록 현황

**Phase 2 — 캘린더 + CRUD + 부모 리포트**
- 캘린더 (편집)
- 이용자·회기·치료사·프로그램·바우처 CRUD
- 상담·평가 관리
- 수납처리·영수증
- 부모 월간 리포트 PDF

**Phase 3 — 부정결제 + 코칭 + 운영 KPI + 고객지원**
- 부정결제 찾기
- 치료사 코칭 리포트
- 운영 KPI 대시보드 + 주간 인사이트 메일
- FAQ/문의/알림톡/유료계약 모듈

## 9. 메모리 정책 준수

- 가격 코드 상수에서만 읽기 (tokenCosts.ts)
- "AI" 단어 회피 → "전문가 종합 분석"
- Markdown 표 금지 → 카드/문단 리포트
- 의료적 진단 표현 금지 → "발달 코칭·운영 인사이트"
- 화이트 미니멀, 골드 액센트, Pretendard, Instrument Serif
- 위기 신호 검출 시 `/expert-hiring?urgent=true`로 라우팅

## 10. 첫 빌드 진입점 (승인 시 Phase 1)

1. DB 마이그레이션 (14테이블 + RLS + 인덱스 + has_center_role)
2. `/b2b-center` 랜딩
3. 엑셀 import 마법사 + 엣지 함수
4. 읽기 전용 콘솔 5종 (이용자/회기/수납/선생님별이용자/일별접수)
