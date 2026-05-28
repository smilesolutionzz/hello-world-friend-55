## 엔드포인트 교체 후 전국 동기화 재시도

사용자가 알려주신 정식 엔드포인트(`http://api.socialservice.or.kr/api/service/provider/providerList`)로 `voucher-sync` edge function의 `API_BASE` 상수를 교체하고, 같은 키로 전국 17개 시도 전수 수집을 실행합니다.

### 변경 사항
- `supabase/functions/voucher-sync/index.ts`
  - `API_BASE`를 `https://api.socialservice.or.kr:444/...` → `http://api.socialservice.or.kr/api/service/provider/providerList`로 교체
  - 그 외 파싱·매칭·삭제·재삽입 로직은 그대로 유지

### 실행 순서
1. 위 한 줄 수정 후 `voucher-sync` 자동 재배포
2. 인증 검증을 위해 먼저 `sidos: ["11"]` (서울 1개 시도)만 호출 — `x-admin-secret` 헤더에 `SOCIAL_SERVICE_API_KEY` 사용
3. 200 + `totalCount > 0` 확인되면 본 호출(17개 시도 전수, 1~3분)
4. `voucher_directory` row 카운트 + `voucher_sync_logs` 최신 row 검증
5. `/expert-hiring` "전국 바우처기관" 탭에서 실제 데이터 노출 확인

### 메모
- 공공데이터포털 가이드상 http/https 모두 허용되지만 일부 운영키는 http에서만 200이 떨어지는 케이스가 있어, 사용자가 알려주신 http 경로를 그대로 사용합니다.
- 1시도 테스트가 또 `SERVICE KEY IS NOT REGISTERED ERROR`로 떨어지면 키 자체가 미승인이라는 뜻이므로, 그때는 코드가 아니라 socialservice.or.kr 마이페이지의 "운영계정 신청" 또는 "Decoding 키" 사용 여부를 다시 확인해야 합니다.
