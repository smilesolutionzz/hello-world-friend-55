## 바우처 보유기관 자동 매칭 시스템

odcloud.kr API(승인 완료, `PUBLIC_DATA_API_KEY` 저장 완료)에서 5개 연도 사회서비스 전자바우처 제공기관 데이터를 끌어와, **(A) 우리 협력기관 47곳 자동 검증** + **(B) 보호자용 전국 바우처 기관 검색 페이지** 두 가지로 활용합니다.

### 1. DB 마이그레이션

`partner_institutions`에 컬럼 추가:
- `voucher_programs text[]` — `발달재활`, `지역사회`, `장애인활동`, `발달장애인주간` 다중
- `voucher_source text` — `api_matched` | `self_reported_pending` | `self_reported_verified`
- `voucher_business_no text`, `voucher_verified_at timestamptz`, `voucher_evidence_url text`

신규 `voucher_directory` (전국 캐시, **anon SELECT 공개**):
- `business_no`, `org_name`, `address`, `city`, `district`, `voucher_type`, `source_year`, `raw jsonb`, `synced_at`
- UNIQUE(business_no, voucher_type), 검색용 인덱스 (city, voucher_type, org_name trgm)

신규 `voucher_sync_logs` (관리자만):
- `run_at`, `total`, `matched`, `unmatched`, `errors jsonb`, `triggered_by`

### 2. Edge Functions

**`voucher-sync`** (admin-only)
- 5개 UDDI 페이지네이션 호출 → `voucher_directory` upsert
- `partner_institutions` 매칭 (사업자번호 1순위, 정규화 기관명+시군구 2순위)
- 매칭 시 `voucher_programs[]`, `voucher_source='api_matched'`, `voucher_verified_at=now()`
- 200ms rate limit, 로그 기록

**`voucher-self-report-review`** (admin-only)
- 자기신고 PDF 승인/반려

### 3. UI — (A) 협력기관 신뢰

- **`/expert-hiring`** 카드: 바우처 칩 (최대 2개 + "+N") + 상단 4탭 필터
- **`/partner/:slug`** 상세: 금색 검증 배지 그룹 ("✓ 발달재활 바우처 가능 · API 검증")
- **`/partner-console`**: 미매칭 시 자기신고 폼 (4개 체크박스 + 사업자번호 + 증빙 PDF, `partner-media` 버킷 재사용)

### 4. UI — (B) 보호자용 바우처 기관 찾기

- **`/voucher-finder`** 신규 페이지
  - 헤더: "우리 동네 바우처 지원 기관 찾기"
  - 필터: 지역 (시/도 → 시군구), 바우처 유형 4종
  - 결과 카드:
    - **우리 협력기관** → 상단 고정, 금색 테두리, "AIHPRO 검증 파트너" 배지, `/partner/:slug` 링크
    - **일반 기관** → `voucher_directory`에서 노출, 기관명·주소·바우처 유형만
  - 하단 sticky CTA: "전문가 1:1 매칭 받기" → `/expert-hiring`
- SEO: title "발달재활바우처 / 지역사회서비스 우리 동네 기관 찾기", 시군구별 동적 OG, `/voucher-finder/[city]/[type]` 정적 라우트 (Phase 2)
- 네비: `/find-center`(B2B bridge)와 구분 — `/voucher-finder`는 B2C 유입 전용

### 5. 관리자 (`/admin`)
- 바우처 탭 추가: "API 동기화 실행" 버튼, 최근 sync logs (matched/unmatched/errors), 자기신고 검토 큐 (PDF 미리보기)

### 기술 메모
- `serviceKey`는 Decoding 키 그대로 (URL 인코딩 X)
- 정규화: 기관명 공백·괄호·지점명 제거 후 비교, 주소는 시/구 단위 추출
- `voucher_directory.business_no`만으로는 부족할 수 있어 `(org_name, city)` 보조 인덱스 추가
- 5,000행/페이지 기준 4종 × 평균 2,000곳 = 약 8,000 행, 동기화 1회 < 30초 예상

### 범위 외 (다음 PR)
- pg_cron 주간 자동 동기화 (먼저 수동 트리거 운영 후 결정)
- 시군구별 정적 SEO 페이지 (`/voucher-finder/강남구/발달재활`)
- 카카오 알림톡 (자기신고 검토 요청)
- 바우처 가격 시뮬레이터

승인하시면 마이그레이션 → 엣지 함수 → A UI → B UI → 관리자 순으로 구현합니다.