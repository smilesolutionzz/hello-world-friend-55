## 목표
B2B 센터 콘솔 사이드바에 **베타 모드** 도입. 베타 모드가 켜져 있으면 핵심 5개 메뉴만 노출하고 사이드바 상단에 "베타 모드" 뱃지를 표시한다.

## 변경 파일

### 1. `src/config/betaMode.ts` (신규)
```ts
export const BETA_MODE = true;
```
- 한 곳에서 토글. 추후 env 연동 여지를 남기되 이번엔 상수.

### 2. `src/pages/b2b-center/B2BCenterApp.tsx` (수정)
- `NAV` 배열 타입에 `betaVisible: boolean` 필드 추가.
- 모든 항목에 `betaVisible` 명시:
  - `true`: `setup`, `schedule`, `clients`, `services/records`, `intelligence/therapy-notes`, `intelligence/parent-reports` (총 6개 — 사용자가 말한 "5개"지만 명시 항목은 6개이므로 그대로 6개 반영)
  - 그 외 모든 항목: `false`
- `BETA_MODE` import 후, `grouped` 계산 직전에 다음 줄 삽입:
  ```ts
  const visibleNav = BETA_MODE ? NAV.filter(n => n.betaVisible) : NAV;
  ```
- `grouped`가 `NAV` 대신 `visibleNav`를 사용하도록 변경.
- 사이드바 상단 기관 select 영역(`<p className="text-xs text-neutral-500 mb-1">기관</p>` 옆 또는 위)에 `BETA_MODE`일 때만 작은 뱃지 렌더:
  ```tsx
  {BETA_MODE && (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C8B88A]/15 text-[#8C7A3E] text-[10px] font-semibold tracking-wider mb-2">
      BETA
      <span className="font-normal text-[#8C7A3E]/80">베타 모드</span>
    </span>
  )}
  ```
  - 골드 액센트(`#C8B88A`) 유지, 화이트 미니멀 톤 준수, 이모지 없음.

## 확인 사항
- 사용자가 "5개"라 했지만 나열은 6개입니다(치료노트·부모 월간 리포트 둘 다 포함). **6개 모두 betaVisible: true로 진행**할 예정 — 다르면 알려주세요.
- 베타 모드 시 그룹 헤더(시작/일정/이용자 등)는 항목이 1개라도 있으면 표시되며, 항목 0개 그룹은 자동으로 사라집니다(현 reduce 로직 기준).
- `BETA_MODE=false`로 두면 기존 전체 메뉴가 그대로 노출됩니다(롤백 안전).

## 영향 범위
- 라우트 자체는 그대로 유지(직접 URL 접근 가능). 사이드바 노출만 필터링.
- 다른 페이지/로직 변경 없음.