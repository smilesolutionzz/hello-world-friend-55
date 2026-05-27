## 목표

`/` (메인) 진입 시 현재 노출되는 LiteHome("우리 아이 발달, 1분 만에 가볍게 체크") 화면을 **모달**로 띄우고, 뒤 배경(첫 화면)을 두 번째 이미지의 **AIHPRO 대시보드(MobileHome)** 로 바꾼다.

## 변경 방식

`src/pages/Index.tsx`의 `LITE_MODE` 분기를 다음과 같이 교체:

1. **기본 화면**: `LiteHome` 대신 `MobileHome`을 렌더 (현재 `/m`/`/home` 등에서 쓰이는 컴포넌트 재사용 — 이미 존재, 신규 코드 없음).
2. **위에 모달**: 기존 `LiteHome` 내용을 그대로 담은 `LiteHomeModal` (신규, shadcn `Dialog` 래퍼)을 자동 오픈.
   - 본문은 `LiteHome`의 카피·CTA를 그대로 이식 (별도 컴포넌트로 분리해 양쪽에서 공유).
   - "발달체크 시작하기" → `/check`로 이동 (기존 `LITE_PRIMARY_CTA` 그대로).
   - 닫기 / "홈으로 가기" → 모달 닫고 뒤 대시보드 노출.
   - "로그인" → `/auth`.

## 모달 노출 정책 (재방문 시 깜빡임 방지)

- `localStorage.aihpro:lite-cta-modal-shown` 으로 **세션당 1회만 자동 오픈**.
- 우상단에 작은 "발달체크" 플로팅 버튼을 추가해 사용자가 언제든 다시 열 수 있도록 함.
- `?cta=1` 쿼리로 강제 오픈 가능 (광고 랜딩용).

## 기술 세부

- 신규: `src/components/landing/LiteCTAContent.tsx` — 기존 `LiteHome` 본문 추출 (재사용용).
- 신규: `src/components/landing/LiteCTAModal.tsx` — shadcn `Dialog` 기반, `LiteCTAContent`를 감싼다. 모바일에서 풀스크린에 가깝게 (`max-w-md`, `rounded-3xl`, `p-0`).
- `LiteHome.tsx`는 `LiteCTAContent`를 그대로 호출하도록 단순화 (기존 진입점 보존 — B2B/`?intro` 등 다른 경로에서 사용 가능).
- `Index.tsx`의 `if (LITE_MODE)` 블록:
  ```tsx
  return (
    <>
      <SEOHead ... />
      <MobileHome />
      <LiteCTAModal defaultOpen={!seenBefore || forcedByQuery} />
    </>
  );
  ```
- SEO: `SEOHead` title/description은 기존 라이트 카피 유지 (검색 노출 메시지는 그대로 "발달 체크").
- `LITE_MODE` 플래그 자체는 유지 — 롤백/재활용 용도.

## QA 체크리스트

- 최초 진입: 대시보드가 뒤에 보이고 발달체크 모달이 자동 오픈.
- 모달 닫기 후 새로고침: 같은 세션이면 자동 오픈 안 됨, 우상단 "발달체크" 버튼으로 다시 열 수 있음.
- `?cta=1`: 항상 자동 오픈.
- 모바일/데스크톱 모두 모달 안에서 카피 잘림 없음 (`break-keep`).
- 모달 내 CTA 클릭 → `/check` 정상 이동.
- 로그인 사용자에게도 모달이 그대로 노출 (대시보드 위 오버레이).

## 영향 없음

- `/check`, `/mind-track`, B2B 라우트 등 다른 페이지는 변경 없음.
- `LiteHome` 컴포넌트는 보존, 다른 곳에서 import 시 그대로 동작.
