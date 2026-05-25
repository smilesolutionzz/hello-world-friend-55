## 변경 사항

### 1. `src/components/store/StoreSection.tsx`
- 모바일 가로 스크롤 카드 영역(`-mx-5 overflow-x-auto ...`) 제거
- PC 그리드 카드 영역(`hidden md:grid ...`) 제거
- 헤더(추천 스토어 라벨 + "우리 아이에게 꼭 맞는 발달 아이템 · 심리검사 패키지" 제목 + 전체보기 버튼)는 그대로 유지
- 결과: 클릭하면 외부 Cafe24 스토어로 이동하는 한 줄짜리 프로모 배너만 남음
- 사용하지 않는 `StoreProductCard` import 및 `mobileItems`/`desktopItems` 변수 제거

### 2. `src/data/storeProducts.ts` — 깨진 이미지 디버깅
- `p007 대근육 발달 점프 매트`의 Unsplash URL(`photo-1518830638800-0adb09a39ce0`)이 404 응답이라 카드에 사진이 안 뜨던 원인
- 점프 매트/체조 매트와 어울리는 유효한 Unsplash 이미지로 교체 (예: `photo-1571019613454-1cb2f99b2d8b` 류의 키즈/플레이 매트 이미지)
- StoreSection에서는 더 이상 카드를 렌더하지 않지만, 다른 화면(예: `/store` 페이지, `StoreProductCard`)에서 같은 데이터를 쓸 때 동일한 빈 이미지 버그가 나오지 않도록 데이터 자체를 고침

### 건드리지 않는 것
- `StoreProductCard.tsx` (다른 페이지에서 그대로 사용)
- `/store` 페이지의 전체 상품 목록
- 가격·뱃지·평점 등 메타데이터
