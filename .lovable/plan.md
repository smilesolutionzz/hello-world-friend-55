## 문제

`/check` 페이지에서 "다음" 버튼을 눌러도 다음 단계로 넘어가지 않습니다.

원인: 전역 `MobileBottomTab`(가운데 "마음 트랙" FAB 포함)이 모든 페이지 하단에 떠 있는데, `/check`의 fixed 하단 CTA(`다음` 버튼)와 겹쳐 있어서 사용자가 누른 위치가 실제로는 하단 탭바의 FAB 영역으로 들어가 버립니다. (스크린샷에서도 "다음" 버튼 위에 "마음 트랙" FAB가 덮여 있음)

## 수정 내용 (1파일만 수정)

`src/components/navigation/MobileBottomTab.tsx`
- `hiddenPaths` 배열에 `/check` 추가
- `/check`, `/check/done`에서는 전역 하단 탭바를 숨겨서 페이지 자체 CTA만 보이도록 함

```ts
const hiddenPaths = ['/auth', '/reset-password', '/admin', '/check'];
```

이렇게 하면:
- `/check` (Step 1, Step 2), `/check/done` 모두 하단 탭바가 사라지고
- 페이지 하단 고정 CTA("다음" / "결과 보기")가 클릭 가능해집니다.

다른 라우트/기능에는 영향 없음. DB/로직 변경 없음.

## 검증

- `/check`로 이동 → 나이 선택 + 영역 선택 → "다음" 클릭 시 Step 2로 전환되는지 확인
- Step 2에서 3문항 모두 응답 → "결과 보기" → `/check/done` 이동 확인
