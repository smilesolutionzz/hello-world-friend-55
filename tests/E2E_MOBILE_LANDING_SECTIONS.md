# E2E: Mobile Landing — Sequential Section Reveal

목적: 모바일 뷰포트에서 메인페이지의 각 섹션이 빈 화면 없이 순차적으로 노출되는지 확인.

## 사전 준비
- 뷰포트: 390x844 (iPhone 12/13/14) 및 360x800 (저가형 안드로이드) 두 케이스 테스트
- URL: `/?reveal-debug=1` (디버그 배지 + 콘솔 로그 활성화)

## 시나리오

### 1) 초기 로딩
- [ ] Hero 섹션이 즉시 보인다 (opacity 1).
- [ ] Hero 아래에는 빈 검정/흰 화면 대신 **SectionPlaceholder skeleton**이 보인다.
- [ ] 콘솔에 `[reveal] {label: 'hero', inView: true}` 가 찍힌다.

### 2) 순차 스크롤 (각 200~400px 단위로 천천히 내림)
스크롤하며 다음 섹션이 차례대로 placeholder → 실제 콘텐츠로 교체되는지 확인:

| 순서 | 라벨            | 기대 상태                              |
|------|-----------------|----------------------------------------|
| 1    | feedback        | placeholder → cards stagger fade-in    |
| 2    | hub             | placeholder → cards stagger fade-in    |
| 3    | report-preview  | placeholder → image fade + scale       |
| 4    | mindtrack30     | placeholder → image fade + scale       |
| 5    | subscription    | placeholder → cta fade + scale         |
| 6    | cta-banner      | placeholder → cta fade + scale         |
| 7    | partners        | placeholder → stats fade               |

각 단계마다 우측 상단 디버그 배지 색이 **빨강(hide) → 초록(show)** 으로 바뀌어야 한다.

### 3) 콘솔/DOM 검증 스니펫
DevTools Console에서 실행:
```js
// 모든 reveal 컨테이너의 가시성 상태
[...document.querySelectorAll('[data-reveal-label]')]
  .map(el => ({
    label: el.dataset.revealLabel,
    inView: el.dataset.revealInview,
    opacity: getComputedStyle(el).opacity,
    height: el.getBoundingClientRect().height,
  }));

// LazyLoad 컨테이너 hydration 상태
[...document.querySelectorAll('[data-lazy-label]')]
  .map(el => ({
    label: el.dataset.lazyLabel,
    visible: el.dataset.lazyVisible,
  }));
```

### 4) 합격 기준
- 페이지 어느 지점에서도 height > 200px 이면서 opacity = 0 인 reveal 컨테이너가 존재하지 않는다.
- 모든 LazyLoad 컨테이너는 사용자가 해당 위치로 스크롤하기 전부터 `data-lazy-visible="true"` 로 전환된다 (rootMargin 400px).
- 사용자가 60% 이상 스크롤한 시점에서 모든 섹션이 `inView: true` 상태이다.

### 5) 회귀 케이스
- `prefers-reduced-motion: reduce` 활성화 시에도 모든 섹션이 즉시 보인다 (애니메이션 없이 opacity 1).
- 네트워크 throttling Fast 3G 환경에서도 placeholder가 깜빡임 없이 표시된 후 콘텐츠로 교체된다.

## 디버그 모드 토글
- URL 쿼리: `?reveal-debug=1`
- 또는 콘솔: `localStorage.setItem('reveal-debug', '1'); location.reload()`
- 해제: `localStorage.removeItem('reveal-debug')`
