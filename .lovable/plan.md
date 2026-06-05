## 원인

`/concern-storage` 진입 시 콘솔 에러:
```
code: 57014  message: canceling statement due to statement timeout
```

DB 확인 결과 `public.concern_storage` 는 **148 rows / 390 MB**.
- `report_images` 컬럼에 base64 PNG가 통째로 저장되어 한 사용자(toss@naver.com) 한 명만 29건에 **96MB**.
- `ConcernStorageList.fetchConcerls()` 는 `select('*')` 로 모든 컬럼을 한 번에 가져오기 때문에 PostgREST가 수십 MB의 JSON을 직렬화하다가 8초 statement timeout에 걸림.

즉 RLS·인덱스 문제가 아니라 **`select *` + base64 이미지 페이로드**가 문제.

## 수정 방향 (프론트만 손대면 끝)

1. `src/components/concern/ConcernStorageList.tsx`
   - 목록 fetch 시 `report_images` 를 제외한 컬럼만 명시적으로 select:
     ```
     .select('id, concern_text, analysis_type, analysis_severity, analysis_advice, recommended_tests, full_analysis, created_at')
     .limit(100)
     ```
   - 카드를 펼칠 때(`AccordionItem` open) 처음 한 번만 해당 id의 `report_images` 를 따로 fetch 해서 state에 머지하는 lazy loader 추가 (`fetchReportImages(id)`).
   - 타입 `ConcernData.report_images` 는 그대로 두고 초기값은 `undefined`. 펼치기 전에는 "리포트 이미지" 섹션을 렌더하지 않음.

2. 안전망: fetch 함수에 `AbortController` 와 사용자에게 보이는 빈 상태 fallback 유지 (기존 toast 그대로).

## 기술 메모

- 단일 select 사이즈를 ~100KB 수준으로 줄여 timeout 회피.
- DB 마이그레이션·RLS·인덱스 변경 없음 (필요시 추후 `(user_id, created_at desc)` 인덱스 별도 검토).
- 다른 컴포넌트(`WriteConcern`, `InstantAIAnalysis`) 는 영향 없음 — insert 경로 그대로.

## 변경 파일
- `src/components/concern/ConcernStorageList.tsx` (fetch select 컬럼 축소 + lazy `report_images` 로더 추가)
