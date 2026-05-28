# 바우처 보유기관 자동 매칭 시스템

협력기관 47곳 + 향후 신규 기관에 대해 **사회서비스 전자바우처 제공기관 정보**를 공공데이터포털 API로 자동 매칭하고, 미매칭 기관은 운영자 자기신고 + 증빙 업로드로 보완합니다.

---

## 01. 데이터 소스

**공공데이터포털 (data.go.kr)**
- 후보 API:
  - `사회보장정보원_사회서비스 제공기관 정보` (사업유형·기관명·사업자번호·주소 반환)
  - `보건복지부_장애인활동지원기관 정보`
  - 보조: 보건복지부 지역사회서비스투자사업 제공기관 공시

**수집 대상 바우처 4종** (사용자 선택)
1. 발달재활서비스
2. 지역사회서비스투자사업
3. 장애인활동지원
4. 발달장애인 주간활동/방과후활동

---

## 02. 동작 흐름

```text
[관리자: 동기화 버튼]
        │
        ▼
edge function: voucher-sync
  1) partner_institutions 전체 순회
  2) 각 기관명/사업자번호로 공공데이터 API 조회
  3) 매칭 시 voucher_programs[] 업데이트
  4) voucher_verified_at = now()
        │
        ▼
[기관 카드/상세에 배지 노출]
"발달재활 · 지역사회 · 활동지원" chip

[미매칭 기관]
  → /partner-console 에서 운영자가 직접 체크 + 지정서 PDF 업로드
  → 관리자 승인 시 voucher_source='self_reported_verified' 로 배지 노출
```

---

## 03. 데이터 모델 (변경)

`partner_institutions` 컬럼 추가:
- `voucher_programs text[]` — `['dev_rehab', 'community', 'disability_activity', 'adult_day']`
- `voucher_source text` — `'api'` | `'self_reported_pending'` | `'self_reported_verified'`
- `voucher_business_no text` — API 조회 키 (사업자번호 10자리)
- `voucher_verified_at timestamptz`
- `voucher_evidence_url text` — 자기신고 시 지정서 PDF 경로

신규 테이블 `voucher_sync_logs`:
- `run_at`, `total`, `matched`, `unmatched`, `errors jsonb`, `triggered_by` (관리자만 INSERT/SELECT)

자기신고 증빙 Storage: 기존 `partner-media` 버킷 재사용, `{slug}/voucher/` 폴더.

---

## 04. UI 변경

### `/partner/:slug` (기관 상세)
- 히어로 옆에 배지 그룹: `발달재활` `지역사회` `활동지원` `주간활동/방과후`
- API 검증 시 골드(#C8B88A) 체크 아이콘 + "공공데이터 확인 YYYY.MM.DD"
- 자기신고 검증 시 동일 배지에 "기관 제출 자료 확인" 툴팁

### `/expert-hiring` 협력기관 카드
- 기존 chip(`프로그램 N · 도서 M`) 아래 한 줄: `바우처: 발달재활, 활동지원`
- 필터: 상단에 4개 바우처 토글, 다중 선택 가능

### `/partner-console` (운영자)
- 새 탭 **바우처 등록**
  - API 매칭 결과 표시(읽기 전용)
  - 미매칭이면 4종 체크박스 + 지정서 PDF 업로드 → "검토 요청"
  - 사업자번호 입력 폼(API 재매칭용)

### `/admin` 관리자
- 새 탭 **바우처 동기화**
  - "전체 동기화 실행" 버튼 (edge function 호출)
  - 최근 실행 로그(매칭/미매칭/오류)
  - 자기신고 검토 큐: 승인/반려

---

## 05. 기술 메모

**시크릿:** `PUBLIC_DATA_API_KEY` 1개 추가 (사용자가 data.go.kr에서 발급해 전달)

**Edge functions (신규 2개)**
- `voucher-sync` — 관리자 트리거, JWT verify + admin 체크. 기관 순회하며 4개 API 호출, 결과 upsert. Rate limit 대응: 200ms 간격 + 재시도 1회
- `voucher-self-report-review` — 관리자가 승인/반려 시 호출, `voucher_source` 업데이트

**매칭 규칙**
1. 1순위: `voucher_business_no` 정확 일치
2. 2순위: 기관명 정규화(공백·괄호 제거) + 시·도 일치
3. 미매칭은 로그 남기고 자기신고 안내

**스케줄:** 수동 트리거만 (월 1회 관리자가 클릭). 추후 pg_cron 매월 1일 자동 실행 옵션은 후속.

**디자인:** 화이트 미니멀 + 골드 액센트 유지, 배지는 `rounded-full border bg-white` + 골드 텍스트, 이모지 금지.

**비즈니스 영향:** 단일상품 BM(`mind_track_*`) 무관, 외부 신뢰 시그널 강화 목적.

---

## 06. 범위 / 비범위

**범위(이번 PR)**
- DB 컬럼 + 신규 로그 테이블 + Storage 폴더
- `voucher-sync` / `voucher-self-report-review` edge function
- 협력기관 카드 + 상세 배지 + 필터
- 콘솔 자기신고 탭
- 관리자 동기화 탭

**비범위(후속)**
- pg_cron 자동 스케줄
- 바우처 단가/한도 계산기
- 보호자가 자기 바우처로 결제 시뮬레이션
- 카카오 알림톡으로 운영자에게 자기신고 요청 발송
