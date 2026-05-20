## Day 2 — 라이트 발달체크 신규 흐름

기존 복잡한 진단(`/mind-track`, `/assessment` 등)은 Day 1에서 숨겼고, 별도의 가벼운 흐름을 새로 만든다. **삭제 0, 신규 분리.**

---

### 1. 새 라우트 / 진입점

- `src/config/liteMode.ts` → `LITE_PRIMARY_CTA.href`를 `/check`로 교체
- `src/App.tsx`에 `/check` 라우트 추가 → 신규 페이지 `src/pages/lite/CheckFlow.tsx`
- 비회원도 100% 통과 가능. 어디서도 로그인/결제/회원가입 요구 금지

### 2. CheckFlow 페이지 구조 (모바일 우선, 본문 17px+, break-keep)

**Step 1 — 자녀 정보 (입력 2개만)**
- 자녀 나이: 큰 글씨 드롭다운 (개월/만 나이 토글, 기본=만 나이 1~12세 + 0~24개월)
- 가장 걱정되는 영역 1개 (카드 4개 중 택1, 카드 높이 80px+, 아이콘+한 줄 설명):
  - `language` 언어·발달
  - `emotion` 감정·행동
  - `social` 사회성·학교
  - `focus` 집중력

**Step 2 — 선택 영역 3문항**
- 한 화면에 3문항 동시 노출, 각 문항 5점 척도(전혀 아니다 / 별로 / 보통 / 자주 / 매우 그렇다)
- 상단 진행바(1/1)
- 문항은 부모 일상 언어, 전문용어 금지

**공통**
- 하단 고정 '다음/제출' 버튼 (높이 56px, w-full, `fixed bottom-0`)
- 상태는 React 로컬 + `sessionStorage`(`lite_check_draft`)에만 저장 (DB write는 Day 3 결과 화면에서)
- 진입 시 `audience=child` 쿼리 보존

### 3. DB — `lite_assessments` 신규 테이블

기존 `assessments` 테이블은 PRO 흐름이 점유 중이므로 충돌 방지 위해 **별도 테이블**로 분리.

```text
lite_assessments
  - area_code      text    PK part   (language|emotion|social|focus)
  - question_no    int     PK part   (1|2|3)
  - prompt         text              (부모 언어 문항)
  - weight         numeric default 1 (배점 가중치, 향후 조정용)
  - reverse_scored boolean default false
  - min_age_months int     default 0
  - max_age_months int     default 999
  - is_active      boolean default true
```

- RLS: 누구나 SELECT 가능 (`USING (true)`), INSERT/UPDATE/DELETE는 차단(시드만 마이그레이션으로)
- 시드: 4영역 × 3문항 = 12행. **내가 14년 임상 톤으로 초안 작성 → 사용자 검수 후 commit**

### 4. 문항 초안 (검수용, 라이선스 free 표현으로 직접 작성)

**언어·발달 (language)**
1. 또래에 비해 새로운 단어를 익히는 속도가 느리다고 느낀다
2. 자기 생각을 문장으로 이어 말하는 것을 어려워한다
3. 질문을 했을 때 동문서답을 하거나 핵심을 놓치는 경우가 잦다

**감정·행동 (emotion)**
1. 사소한 일에 짜증이나 울음이 평소보다 오래 간다
2. 화가 났을 때 스스로 진정하는 데 시간이 오래 걸린다
3. 기분이 갑자기 가라앉거나 의욕이 없어 보이는 날이 자주 있다

**사회성·학교 (social)**
1. 또래와 어울리기보다 혼자 있는 시간을 더 편해한다
2. 친구와의 다툼이나 오해가 반복적으로 일어난다
3. 새로운 환경(학교·학원·모임)에 적응하는 것을 힘들어한다

**집중력 (focus)**
1. 한 가지 일을 끝까지 마무리하지 못하고 다른 것으로 옮겨간다
2. 지시를 듣고도 중간에 잊거나 다른 행동을 한다
3. 앉아서 해야 하는 활동(숙제·식사)을 끝까지 지속하기 어렵다

> 모두 정문항(reverse 없음), 5점 척도, 점수 높을수록 우려 ↑.

### 5. 작업 순서

1. **(검수 게이트)** 위 12문항 초안 OK 여부 확인 — 수정 지시 받으면 반영
2. `lite_assessments` 마이그레이션 + 시드 INSERT
3. `CheckFlow.tsx` (Step1/Step2 단일 컴포넌트, 하단 고정 CTA)
4. 라우트 등록 + LITE CTA → `/check`로 교체
5. 결과 페이지(`/check/result`)는 **Day 3에서** 별도 작업 (지금은 제출 시 `console.log` + 임시 완료 화면)

### 6. 작업 후 사용자에게 안내

- 미리보기 띄울 경로: `/check` (모바일 390 뷰)
- 검수 포인트: 카드 크기, 문항 가독성(17px+), 하단 버튼 누름성, 다음 버튼 → 3문항 화면 전환

---

**확인 부탁드립니다:**
1. 위 12개 문항 초안 그대로 가도 될지, 영역별로 수정/대체할 것이 있는지
2. 자녀 나이 입력을 '만 나이 단일'로 갈지, '개월 ↔ 만 나이' 토글까지 둘지 (토글이 부모층에 더 친절하지만 입력 1개 늘어남)

승인하시면 마이그레이션부터 시작합니다.