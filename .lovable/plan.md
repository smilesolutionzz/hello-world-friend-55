## 바우처 보유기관 자동 매칭 시스템 구현

odcloud.kr API 승인 완료. 5개 연도 UDDI 엔드포인트(2021/2019/2022/2023/2026)에서 사회서비스 전자바우처 제공기관 데이터를 끌고 와 협력기관과 매칭합니다.

### 1. 시크릿 등록
- `PUBLIC_DATA_API_KEY` — 일반 인증키 `8788d805b69734bbb56d7f023bfbd25b27c783d65dc507f4236596846fe65469`
  (Decoding 키이므로 URL 인코딩 없이 그대로 `serviceKey` 파라미터로 전달)

### 2. DB 마이그레이션
`partner_institutions`에 컬럼 추가:
- `voucher_programs text[]` — 매칭된 바우처 유형 (`발달재활`, `지역사회`, `장애인활동`, `발달장애인주간` 중 다중)
- `voucher_source text` — `'api_matched' | 'self_reported_pending' | 'self_reported_verified'`
- `voucher_business_no text` — 사업자등록번호 (매칭 키)
- `voucher_verified_at timestamptz`
- `voucher_evidence_url text` — 자기신고용 PDF (partner-media 버킷 재사용)

신규 테이블 `voucher_sync_logs`:
- `run_at`, `total`, `matched`, `unmatched`, `errors jsonb`, `triggered_by uuid`
- 관리자만 SELECT, service_role ALL

신규 테이블 `voucher_directory` (캐시):
- `business_no text`, `org_name text`, `address text`, `city text`, `voucher_type text`, `source_year text`, `raw jsonb`, `synced_at`
- (business_no, voucher_type) UNIQUE
- 인증 사용자 SELECT (지도/검색 노출용), service_role ALL

### 3. Edge Functions

**`voucher-sync`** (admin-only):
- 5개 UDDI 순회 → `https://api.odcloud.kr/api/3075166/v1/uddi:{ID}?serviceKey=...&perPage=1000&page=N`
- 페이지네이션 (page 1부터 totalCount 도달까지)
- `voucher_directory`에 upsert, 사업자번호·기관명·주소 정규화
- `partner_institutions` 순회하며 매칭:
  1순위: `voucher_business_no` 정확 매치
  2순위: 정규화된 기관명 + 시/구 매치
- 매칭 결과 `voucher_programs[]` 갱신, `voucher_source='api_matched'`, `voucher_verified_at=now()`
- 200ms rate limit, `voucher_sync_logs`에 기록

**`voucher-self-report-review`** (admin-only):
- 자기신고 건 승인/반려 → `voucher_source='self_reported_verified'`

### 4. UI 변경

**`/partner-console`** — 자기신고 탭 추가:
- 미매칭 시 표시: "API에서 우리 기관을 찾지 못했어요"
- 4개 바우처 체크박스 + 사업자등록번호 입력 + 증빙 PDF 업로드
- 제출 → `voucher_source='self_reported_pending'`

**`/partner/:slug`** — 바우처 배지 그룹 + 금색 체크 (검증 시)

**`/expert-hiring`** — 카드에 바우처 칩 + 4탭 필터 (발달재활/지역사회/장애인활동/발달장애인주간)

**관리자(`/admin`)** — 바우처 탭:
- "API 동기화 실행" 버튼 → `voucher-sync` 호출
- 최근 sync logs (matched/unmatched/errors)
- 자기신고 검토 큐 (PDF 미리보기 + 승인/반려)

### 범위 외 (다음 PR)
- pg_cron 자동 스케줄링 (먼저 수동 트리거로 운영)
- 보호자용 바우처 가격 시뮬레이터
- 카카오 알림톡 (자기신고 검토 요청)

승인하시면 시크릿 등록부터 진행합니다.