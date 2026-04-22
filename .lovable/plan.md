

## AI 다듬기 고도화 + 자동 리포트 연결

`/quiz`의 6단계(고민 적기) 화면을 강화해서 ① 더 풍성한 AI 다듬기 ② 진행 중 잠금 ③ 새로고침 후 유지 ④ 다듬기 완료 시 바로 리포트 미리보기로 연결되도록 만듭니다.

### 1. 엣지 함수 — 더 확장된 문장 생성

`supabase/functions/mind-track-concern-polish/index.ts`
- 현재: 1~3문장으로 "다듬기"만 함
- 개선: **4~7문장 / 250~450자**로 풍부하게 확장
  - 일상에 미치는 영향, 가장 힘든 순간, 동반되는 마음 상태를 자연스럽게 덧붙임
  - 사용자가 말하지 않은 구체적 사건·관계·원인은 만들어내지 않음 ("~한 느낌이 들어요" 식으로 부드럽게)
  - 1인칭 자연체 유지, 의료/진단 표현 금지
- 시스템 프롬프트 + 사용자 메시지 양쪽 모두 "확장" 지침으로 변경

### 2. `src/pages/Quiz.tsx` — 다듬기 UI/UX

**Concern 단계(6단계) 텍스트영역에 추가:**
- 우측 하단에 "✨ AI로 확장하기" 버튼(`Wand2` 아이콘)
- 입력이 5자 이상일 때만 활성화
- 글자 수 카운터(`{concern.length} / 1000`) 표시

**진행 중 잠금 + 진행 표시:**
- `isExpanding` 상태로 클릭 즉시 잠금
- 다듬는 동안:
  - `Textarea`를 `disabled` 처리 + 살짝 흐리게(`opacity-60`)
  - 텍스트영역 위에 반투명 오버레이 + 스피너 + 가짜 진행률("AI가 당신의 고민을 더 깊이 풀어쓰는 중... 35%")
  - 진행률은 200ms 간격으로 0→90%까지 자동 증가, 응답 도착하면 100%로 점프
  - "AI 확장하기" 버튼은 로딩 스피너로 교체, "이전/내 플랜 만들기" 버튼도 비활성화
- 중복 클릭 방지: `if (isExpanding) return` 가드

**완료 시 동작:**
- 응답 텍스트로 `data.concern` 교체
- 토스트: "AI가 고민을 더 자세히 풀어드렸어요"
- **자동으로 다음 단계 진입**: `setStep('analyzing')` → 기존 95% 진행 애니메이션 → `'plan'`(가짜 PDF 블러 미리보기 + 변화 차트 + 페르소나 카드)로 자연 연결
  - 사용자가 한 번 더 다듬기를 보고 싶을 수도 있어, "결과 확인 후 더 다듬기" 토스트 액션 버튼은 제공하지 않고 단방향 진행으로 단순화

### 3. 새로고침 후에도 결과 유지

**저장 트리거:**
- AI 다듬기 성공 직후 + concern 단계에서 textarea blur 시
- 비로그인: `localStorage.setItem('quiz_concern_polished', JSON.stringify({ concern, polished: true, ts }))`
- 로그인: 기존 `user_onboarding_data.free_text_concern`에 즉시 upsert (현재는 결제 직전에만 저장 → 즉시 저장으로 앞당김)

**복원 로직:**
- Quiz 마운트 시 `useEffect`에서:
  - 로그인 사용자: `user_onboarding_data` select → `free_text_concern`이 있으면 `data.concern`에 채움
  - 비로그인: `localStorage.quiz_concern_polished` 읽어서 채움
- 새로고침 후에도 텍스트박스에 다듬어진 글이 그대로 보임
- "AI 다듬기 완료됨" 배지(`✨ AI 확장 완료 · 지난 결과 유지됨`)가 텍스트영역 위에 표시되어 결과가 살아있음을 인지

### 4. 다듬기 → 리포트 미리보기 연결

이미 `step === 'plan'` 화면에는 가짜 PDF 블러 + 변화 차트 + 페르소나 카드가 구현되어 있음(이전 작업).

새 흐름:
```
[6단계 concern]
   ↓ "✨ AI로 확장하기" 클릭
[입력 잠금 + 진행률 표시 (3~6초)]
   ↓ 응답 도착
[textarea에 확장된 글 표시 + 토스트]
   ↓ 자동 (700ms 후)
[analyzing 단계 (95% 애니메이션, 4~5초)]
   ↓ 자동
[plan 단계 = 30일 리포트 미리보기]
   - 가짜 PDF 카드 (상단 노출 + 하단 블러 + 🔒 14페이지 잠김)
   - Before/After 변화 차트
   - 페르소나 카드 3개
   - "30일 마음 트랙 시작 ₩19,900" 강력 CTA
```

수동으로 "내 플랜 만들기"를 누르지 않아도, AI 확장만으로 곧장 리포트 미리보기에 도달합니다. 확장 없이 직접 작성한 사용자는 기존처럼 "내 플랜 만들기" 버튼을 눌러 동일한 plan 화면에 진입합니다.

### 변경 파일

- `supabase/functions/mind-track-concern-polish/index.ts` — 시스템 프롬프트를 4~7문장 확장형으로 업그레이드
- `src/pages/Quiz.tsx` — 
  - `isExpanding`, `expandProgress` 상태 추가
  - Concern 단계에 AI 확장 버튼 + 잠금 오버레이 + 진행률 UI
  - 마운트 시 localStorage / `user_onboarding_data` 복원
  - 다듬기 즉시 저장 (localStorage + DB upsert)
  - 다듬기 성공 → 700ms 후 자동 `setStep('analyzing')` → `'plan'`(이미 구현된 PDF 블러 미리보기)

기존에 잘 동작하는 plan 화면(가짜 PDF, 차트, 페르소나, CTA)은 그대로 유지하고, 진입 경로만 자연스럽게 자동 연결합니다.

