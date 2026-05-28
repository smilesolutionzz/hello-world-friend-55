## 운영키 적용 및 전국 동기화 실행

방금 보내주신 키(`8788...5469`)를 `SOCIAL_SERVICE_API_KEY` 시크릿에 업데이트한 뒤, 같은 키로 `voucher-sync` edge function의 admin 우회 헤더(`x-admin-secret`)를 호출해 전국 17개 시도 바우처 제공기관을 전수 수집합니다.

### 실행 순서
1. `secrets--update_secret`로 `SOCIAL_SERVICE_API_KEY` 값을 새 운영키로 교체 (보안 폼에 직접 붙여넣기 — 채팅창 평문 키는 노출되므로 적용 후 폐기 권장)
2. `supabase--curl_edge_functions`로 `/voucher-sync` 호출
   - 헤더: `x-admin-secret: <새 운영키>`
   - 첫 호출은 1개 시도(`sidos: ["11"]`)만 보내 인증·파싱 정상 확인
3. 정상이면 전체 17개 시도 전수 수집 실행 (1~3분 소요)
4. `voucher_directory` row 카운트와 `voucher_sync_logs` 마지막 row를 조회해 결과 검증
5. `/expert-hiring` "전국 바우처기관" 탭에서 실제 데이터 노출 확인

### 보안 메모
채팅에 평문으로 키를 붙여주셨기 때문에, 운영 안정화 후 data.go.kr에서 키 재발급(rotate)해 한 번 더 교체하는 것을 권장드립니다. 코드 변경은 없습니다.
