# 마음 트랙 카테고리 재편 회의 결론

## 1. 핵심 아이디어

현재 9개 트랙이 personal/family 2그룹으로만 묶여 있어 사용자가 "내 상황에 뭘 골라야 하지?"에서 막힘. 트랙 자체는 그대로 두고, **태그 메타데이터를 추가**해 4가지 축으로 다중 분류한 뒤, "AI 추천 우선 + 카테고리 보조" UI로 재구성한다.

트랙 콘텐츠(30일 30개) 자체는 변경 없음. 분류·필터·진입 동선만 손본다.

## 2. 분류 체계 (4축 동시 적용)

각 트랙은 4개 축의 태그를 가진다.

- **고민/증상** — `sleep` `stress` `mood` `anxiety` `focus` `relationship` `self` `parenting` `family`
- **생애주기** — `youth`(청년) `worker`(직장인) `parent`(부모) `midlife`(중장년) `senior`(시니어)
- **역할/상황** — `personal` `parent` `couple` `manager`
- **목표 기간/난이도** — 현재 30일 단일 → 우선 `focus_30`(30일 집중)으로 표기, `light_5`(5분 가볍게)·`deep_90`(90일 심화)는 향후 확장 자리만 마련

매핑은 `MIND_TRACK_FOCUSES`에 `tags: { concern[], lifeStage[], role[], intensity[] }` 필드를 추가해 단일 진실 공급원에 보관.

## 3. 트랙 선택 UI (`/mind-track`)

상단부터 아래로:

```text
[1] AI 추천 카드 (1~3개)
    └ 가장 최근 검사/온보딩 응답 기반. "당신에게 맞는 트랙" 헤드라인.

[2] 카테고리 칩 라인 (가로 스크롤)
    "내 고민으로" | "내 나이로" | "역할로" | "기간으로"
    └ 칩 선택 시 아래 카드 그리드가 즉시 필터링 (다중 선택 가능)

[3] 9개 트랙 카드 그리드
    └ 필터 결과 0건이면 "전체 트랙 보기" 폴백
```

- 추천 로직: `assessment_results` 최신 1건의 위험 도메인 + `user_onboarding_data`의 `age_range`/`role`을 본 뒤 태그 교집합 점수가 높은 트랙 top3.
- 추천 근거가 없으면 추천 섹션 숨기고 카테고리 칩 + 전체 그리드만 표시 (기존 UX와 동일).
- 칩은 한 번에 한 축만 활성화(라디오) + 그 축 안에서는 다중 선택. 다축 동시 필터는 1차 범위 외(과복잡).

## 4. 진입점 연결

- **Index(랜딩)** — 기존 마음 트랙 섹션의 9개 카드 대신 "AI가 추천하는 3개 + 카테고리로 둘러보기" 미니 위젯으로 교체. CTA는 `/mind-track?category=concern` 식 딥링크.
- **검사 결과 페이지(MindTrackCheckResult, Assessment 결과 화면)** — 결과 카드 하단 "이 결과에 맞는 마음 트랙 보기" CTA에 `?category=concern&tag=sleep` 같은 쿼리 부착. `/mind-track` 진입 즉시 해당 칩 프리셀렉트.
- 신규 페이지/라우트 추가 없음.

## 5. 작업 범위 (파일)

신규
- `src/lib/mindTrackCategories.ts` — 4축 카테고리 정의 + 라벨 + 트랙→태그 매핑 + `recommendTracks(profile)` 헬퍼.
- `src/components/mind-track/TrackCategoryChips.tsx` — 가로 스크롤 칩 + 다중 선택 상태.
- `src/components/mind-track/TrackRecommendation.tsx` — AI 추천 카드 섹션.

수정
- `src/lib/mindTrackFocusTracks.ts` — 각 트랙에 `tags` 필드 추가(타입 확장 + 9개 데이터 채우기).
- `src/pages/MindTrack.tsx` — 추천 → 칩 → 그리드 구조로 레이아웃 재배치 + URL 쿼리(`?category=&tag=`) 동기화.
- `src/pages/Index.tsx` 마음 트랙 섹션 — 추천 위젯 + 카테고리 진입 CTA.
- `src/pages/MindTrackCheckResult.tsx` — 결과 도메인 → `?category=concern&tag=` 딥링크.
- `src/pages/Assessment.tsx` 결과 단계 CTA — 동일 패턴 딥링크.

## 6. 비범위(이번엔 안 함)

- 90일/5분 트랙 신설 — UI 자리만 마련, 콘텐츠는 후속.
- B2B Job Coach 트랙 — 별도 파이프라인.
- 카테고리별 SEO 허브 페이지(`/mind-track/catalog`) — 회의 결과 보류, 검색 유입 데이터 본 뒤 결정.
- 결제 흐름·`mind_track_30` 단일 상품 정책 — 변경 없음.

## 7. 기술 메모

- 칩 상태/필터 상태는 URL 쿼리스트링이 단일 진실. 새로고침/공유 가능.
- 추천 로직은 클라이언트 사이드 점수 매칭(Edge Function 불필요). 데이터 부족 시 graceful degrade.
- 메모리 정책 준수: 이모지 미사용(트랙 아이콘은 기존 `icon` 필드 유지하되 카테고리 칩에는 점 아이콘+라벨만), `bg-white` `rounded-2xl/3xl`, 그라데이션 금지, Pretendard.
- 가격/상품 표기 변동 없음 (단일 상품 정책 유지).
