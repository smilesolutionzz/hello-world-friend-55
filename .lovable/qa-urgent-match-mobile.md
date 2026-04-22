# QA 체크리스트 — `/expert-hiring/urgent-match` (모바일)

## 터치 타겟 (WCAG 2.5.5 / Apple HIG: 최소 44×44pt)
- [x] 뒤로 버튼: `min-h-[44px] h-11` (44px)
- [x] 스티키 CTA "지금 긴급 매칭 요청하기": `min-h-[56px] h-14` (56px)
- [x] 스티키 "내 요청 내역" 버튼: `min-h-[48px] h-12 min-w-[48px]` (48px)
- [x] 데스크톱 보조 CTA: `h-12` (48px)

## 레이아웃 안전 영역
- 컨테이너 하단 패딩: `calc(env(safe-area-inset-bottom) + 96px)`
  - 96px = 버튼 56px + 상하 패딩 20px + 여유 20px
- 스티키 바 자체: `paddingBottom: max(env(safe-area-inset-bottom), 0.5rem)`
- 결과: 카드/타이머 콘텐츠가 어떤 디바이스에서도 스티키 CTA와 겹치지 않음

## 디바이스별 검증 매트릭스
| 디바이스 | 뷰포트 | 노치/세이프 영역 | 확인 포인트 |
|---|---|---|---|
| iPhone SE (1세대) | 320×568 | 없음 | 스크롤 시 CTA가 모든 콘텐츠 아래 표시 |
| iPhone SE (2/3세대) | 375×667 | 없음 | 동일 |
| iPhone 12/13/14 | 390×844 | 노치 + 홈 인디케이터 | `safe-area-inset-bottom`이 홈바와 겹치지 않음 |
| iPhone 14 Pro Max | 430×932 | 다이내믹 아일랜드 + 홈 인디케이터 | 동일 |
| Galaxy S8/S20 | 360×800 | 제스처 바 | 스티키 바가 시스템 제스처 영역과 분리 |
| Pixel 7 | 412×915 | 제스처 바 | 동일 |

## 단계별(Stage) 동작
- **idle**: 빨간 CTA 한 개, 56px 높이 — 첫 진입 시 즉시 탭 가능
- **requesting**: 로딩 인디케이터 표시, CTA 영역 높이 유지(레이아웃 점프 방지)
- **waiting**: 좌측 타이머, 우측 "내 요청 내역" 버튼 — 두 영역 모두 48px+

## 회귀 방지
- `min-h-[...]` 하드 가드를 사용해 상위 `Button` variant 변경 시에도 터치 영역 보존
- `active:scale-[0.98]` 시각 피드백으로 탭 인식 확인
