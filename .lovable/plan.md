# 일정 상세 "선생님 안 뜸" 원인 + 보완 플랜

## 원인 (코드 버그 아님)

- `SessionDetail`은 `therapists.find(t => t.id === s.therapist_id)`로 선생님을 찾고, 없으면 `—`만 표시합니다 (`SchedulePage.tsx:1522, 1564`).
- 현재 DB의 `center_sessions` 67,576건 중 **14,759건(22%)이 `therapist_id = NULL`** 입니다. 즉 "선생님이 안 뜨는" 일정은 실제로 **미배정 상태**입니다.
- 카드(chip)에서는 `"미배정"`이라고 쓰는데(라인 878), 상세 시트는 `—`라 일관성이 깨져서 "버그처럼" 보이는 게 진짜 문제입니다.

## 변경할 것

`src/pages/b2b-center/console/SchedulePage.tsx` 한 파일만 수정.

### 1. 상세 시트 라벨 일관화 — 라인 1564

```tsx
<DetailField
  k="선생님"
  v={th
    ? `${th.name}${th.role ? ` · ${th.role}` : th.title ? ` · ${th.title}` : ""}`
    : <span className="text-amber-600">미배정</span>}
/>
```

`—` 대신 카드와 동일하게 `미배정`을 노출 (앰버 톤으로 시선 유도).

### 2. 미배정일 때 "선생님 배정" 바로가기

`SessionDetail` 푸터 (기존 닫기 / 일정 수정 / 삭제 옆)에, `s.therapist_id`가 null이면:

```tsx
{!s.therapist_id && (
  <button onClick={onEdit} className="px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200">
    선생님 배정하기
  </button>
)}
```

→ 클릭 시 기존 `onEdit` 흐름으로 들어가서 `center_therapists` 셀렉트에서 바로 배정 가능.

### 3. (옵션) 미배정 카드 시각 표식

칩에서도 `th`가 없으면 좌측 컬러 바를 점선 회색(`border-l-2 border-dashed border-neutral-300`)으로 바꿔서, 캘린더에서 한눈에 "이 회기는 선생님 미배정"으로 인지 가능하게 함. 자리 차지·색은 유지.

## 변경하지 않을 것

- 데이터 자체 (NULL을 임의로 채우지 않음 — 기존 일정의 의미가 바뀌면 안 됨).
- 다른 페이지/스키마/RLS.

## 검증

- 데모 센터에서 `therapist_id IS NULL`인 일정 클릭 → 상세 시트에 `미배정` + `선생님 배정하기` 노출.
- 정상 배정된 일정 클릭 → 기존처럼 이름·역할 표시.
