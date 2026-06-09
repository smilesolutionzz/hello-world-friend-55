## 문제

`/b2b-center/app/schedule` 좌측 사이드바의 "선생님별 일정" 영역은 현재 단순 체크박스 그룹입니다. 사용자가 선생님 이름을 클릭해도 "해당 선생님 일정만 보기" 동작이 일어나지 않아, "눌러도 안 뜬다"고 느껴집니다.

현재 동작:
- 라벨 클릭 → 체크박스만 토글 (다른 선생님은 그대로 표시)
- 솔로 선택 UI 없음

## 수정안

`src/pages/b2b-center/console/SchedulePage.tsx` 좌측 사이드바(256~302줄) 만 손봅니다. 본문 그리드/데이터 로직은 그대로.

1. 각 선생님 행을 **체크박스 + 이름 버튼** 2영역으로 분리
   - 체크박스: 기존처럼 다중 토글 (보이기/숨기기)
   - 이름 클릭: **솔로 모드** — 해당 선생님만 `true`, 나머지(및 `__none`) 전부 `false`
   - 이미 솔로 상태에서 같은 이름을 다시 클릭하면 → 전체 해제 복원 (전부 `true`)
2. 행 우측에 작게 "이 선생님만" 힌트를 hover 시 표시
3. "전체 / 해제" 토글 버튼은 그대로 유지
4. 상단 컨트롤바의 `Filter` 드롭다운(351~385줄)에도 동일한 "솔로 클릭" 패턴 적용 (모바일 일관성)

```text
┌─ 선생님별 일정 ─────────┐
│ ☑ ■ 김민지   언어    │ ← 이름 클릭 = 솔로
│ ☑ ■ 박서연   감통    │
│ ☐ ■ 이준호   놀이    │ ← 체크박스만 토글
│ ─────────────────── │
│ ☑ ▢ 미배정          │
└────────────────────┘
```

## 기술 메모

- 새 헬퍼 `soloTherapist(id: string)`:
  ```ts
  setTherapistFilter((p) => {
    const onlyThis = Object.keys(p).every((k) => (k === id ? p[k] : !p[k]));
    if (onlyThis) return Object.fromEntries(Object.keys(p).map((k) => [k, true]));
    return Object.fromEntries(Object.keys(p).map((k) => [k, k === id]));
  });
  ```
- `<label>` 안의 체크박스는 `onClick={(e) => e.stopPropagation()}` 로 솔로 트리거와 분리
- 이름 영역은 `<button type="button">` 으로 감싸 키보드 접근 유지
- 데이터 fetch / `visibleSessions` 필터 로직 변경 없음 (이미 `therapistFilter` 만 읽음)
