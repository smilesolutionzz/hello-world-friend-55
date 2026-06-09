## 현재 상태 점검

`/b2b-center/app/schedule` 데이터 흐름:
- 한 번에 센터의 모든 세션을 가져옴 (`center_sessions` × 날짜 범위) → 클라이언트에서 `therapistFilter`로 필터링
- 즉 별도의 "선생님별 조회 API"는 없음. `teacherId` 같은 파라미터는 존재하지 않으며 필요도 없음 (모든 선생님 일정이 같은 쿼리에 들어옴)
- 솔로 클릭/체크박스 토글은 이미 들어가 있으나, 사이드바 상태와 표시 데이터 동기화 + 로딩/에러 표시가 약함

## 수정안 (SchedulePage.tsx 한 파일)

### 1. fetch 에러 상태 도입
- `const [error, setError] = useState<string | null>(null);` 추가
- 데이터 로딩 `useEffect` 내부에서 `try/catch` 로 감싸고 4개 쿼리 중 `.error`가 있으면 사용자 친화 메시지 저장
- 본문(`{loading ? ... : view === ...}`) 분기 위에 에러 분기 추가:
  ```text
  ⚠ 일정을 불러오지 못했어요.  [다시 시도]
  ```
- 사이드바에도 동일한 에러 토스트(작게)

### 2. 사이드바 상태 ↔ 표시 데이터 일치
- 사이드바 행마다 **표시 중인 세션 개수**(`visibleSessions` 기준) 를 우측 작은 배지로 표시
  - 체크 해제된 행 → 회색 0/—
  - solo 활성 행 → 굵게
- "전체 / 해제" 버튼 옆에 현재 보이는 세션 합계 (`표시: N건`) 추가
- 빈 상태(필터로 인해 0건): 본문에 `"필터로 모든 선생님이 해제되었어요. 전체 보기"` 한 줄 안내 + 버튼

### 3. 솔로 토글 복원 로직 보강
현재: `entries.every(([k,v]) => k===id ? v===true : v===false)` → 재클릭 시 전부 true
보강:
- 솔로 진입 직전의 사용자 체크 상태를 `useRef<Record<string,boolean> | null>(null)` 에 스냅샷
- 같은 선생님 재클릭 시:
  - 스냅샷이 있으면 → 스냅샷으로 정확히 복원
  - 스냅샷이 없거나 모두 false였으면 → 전부 true로 복원
- 다른 선생님 솔로로 옮겨가면 스냅샷 유지(첫 솔로 진입 시점만 캡처)
- "전체"/"해제" 버튼 또는 체크박스 직접 토글 시 스냅샷 무효화(`= null`)

### 4. 필터 키 동기화 useEffect 정리
- 현재 `therapists`와 `sessions` 양쪽 변경에 반응 → orphan therapist_id 까지 포함은 유지
- 단, 재마운트 시 사용자가 의도해서 끈 항목이 다시 `true`로 덮이지 않도록 `prev[t.id] ?? true` 유지 확인 (이미 OK)
- 추가: 더 이상 존재하지 않는 키(삭제된 선생님)는 `next`에서 제거 → 잔여 상태로 인한 불일치 방지

### 5. 모바일(상단 Filter 드롭다운) 동일 적용
- 250~270줄 사이 드롭다운 항목도 솔로 패턴/카운트 배지 일치

## 기술 메모

- API 변경 없음. Supabase 쿼리는 그대로 `eq("center_id", centerId)` + 기간. `teacherId` 파라미터는 도입하지 않음 (현재 단일 쿼리가 더 효율적).
- `visibleSessionsByTherapist` useMemo 신설:
  ```ts
  const countByT = useMemo(() => {
    const m: Record<string, number> = { __none: 0 };
    for (const s of sessions) {
      if (s.session_date < startStr || s.session_date > endStr) continue;
      if (!statusFilter[s.status]) continue;
      const k = s.therapist_id ?? "__none";
      m[k] = (m[k] ?? 0) + 1;
    }
    return m;
  }, [sessions, range, statusFilter]);
  ```
- 솔로 스냅샷: `const soloSnapshotRef = useRef<Record<string, boolean> | null>(null);`
- 에러 상태 메시지는 `s.error?.message ?? "알 수 없는 오류"` 사용
- `loading` 분기는 그대로 유지, error는 그 위에 우선 표시
