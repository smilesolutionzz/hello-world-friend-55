# 전국 바우처 제공기관 데이터 연동 계획

찾으신 API가 맞습니다: **한국사회보장정보원 사회서비스 제공기관 정보 검색** (REST/XML)
- 엔드포인트: `https://api.socialservice.or.kr:444/api/service/provider/providerList`
- 응답 필드: providerName, serviceName, serviceTypeName, address, loadAddress, sidoName, signguName, telNumber, ownerName, providerId, email, zip 등 — `voucher_directory`에 그대로 매핑 가능
- 페이지네이션: pageNo / numOfRows / totalCount

## 작업 단계

**1. 시크릿 정리**
- 기존 `PUBLIC_DATA_API_KEY`를 그대로 사용 (data.go.kr 일반 인증키와 동일하면 재사용, 아니면 `SOCIAL_SERVICE_API_KEY`로 별도 등록 요청)

**2. edge function 재작성: `voucher-sync`**
- 17개 시도 코드(`sido` 11~50) 루프
- 각 시도별로 pageNo 1부터 totalCount까지 numOfRows=500으로 전수 수집
- XML 응답을 파싱하여 `voucher_directory`에 upsert (key: providerId)
- 진행 상황 로깅, 실패 시 시도 단위 재시도

**3. 어드민 트리거**
- 관리자 페이지에서 "전국 동기화" 버튼 한 번 누르면 백그라운드 실행
- 결과 카운트(시도별 수집 건수, 총합) 표시

**4. 검증**
- `/expert-hiring` 의 `VoucherFinderSection` 에서 시도/시군구/서비스유형/기관명 검색이 전국 데이터로 동작하는지 확인

## 기술 메모
- API가 XML이므로 Deno에서 `deno-dom` 또는 정규식 기반 파서 사용 (의존성 최소화 위해 정규식 + 단순 태그 추출 권장)
- 1회성 전수 수집이라 timeout 회피 위해 시도 단위로 호출 분할 (한 번 호출당 시도 1~2개)
- `serviceType` 코드 매핑은 응답의 `serviceTypeName`을 그대로 저장 (이미 4가지 카테고리로 들어옴)

## 사전 확인 필요
이 API는 별도 활용신청 승인이 필요합니다 (화면의 "활용신청" 버튼). 이미 승인 받으셨나요?
- 받으셨다면: 인증키가 `PUBLIC_DATA_API_KEY`와 동일한지, 아니면 별도 키인지 알려주세요.
- 아직이면: 활용신청 → 자동승인 → 발급 키 공유 후 진행.