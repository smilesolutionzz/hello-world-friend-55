## Day 16 코칭 메일 FFFD 깨짐 수정 계획

### 문제 요약
- DB의 `mission_content`는 깨끗한데, React Email `renderAsync` 결과 HTML에 U+FFFD 15개 발생
- 원인: `fetchYouTubeVideos`로 받아온 영상 메타데이터(`title`, `channelTitle`, `reason`)가 sanitize 되지 않은 채 템플릿에 주입됨
- 추세 악화: Day 12: 0 → 13: 9 → 14: 5 → 15: 5 → 16: 15

### 수정 파일
`supabase/functions/send-daily-coaching-email/index.ts` (또는 동등 위치)

### 변경사항

**1. YouTube 메타데이터 sanitize**
- `fetchYouTubeVideos` 결과 매핑 시 `title`, `channelTitle`, `reason` 각각 `sanitize()` 통과
- AI가 생성한 `reason` 필드가 가장 큰 오염원으로 추정

**2. 최종 안전망 (renderAsync 직후)**
```ts
let html = await renderAsync(...);
const fffdCount = (html.match(/\uFFFD/g) || []).length;
if (fffdCount > 0) {
  console.warn('[FFFD] removed', fffdCount, 'replacement chars from final HTML');
  html = html.replace(/\uFFFD/g, '');
}
```
어떤 경로로든 FFFD가 들어와도 발송 전 제거.

**3. 검증 정규식 업데이트**
섹션 번호가 바뀐 것을 반영:
- `03 · 임상적 근거` → `05 · 임상적 근거`
- `04 · 오늘의 추천 영상` → `07 · 오늘의 추천 영상`
- `05 · 오늘의 기록` → `09 · 오늘의 기록`

**4. 필드별 FFFD 카운트 로깅**
디버깅용으로 `mission_content`, `videos[].title/channelTitle/reason`, 최종 html 각 단계의 FFFD 수를 로그에 남김. 차후 회귀 발생 시 즉시 원인 파악 가능.

### 검증
- 배포 후 한 명의 테스트 계정에 Day 16 재발송 트리거
- `email_send_log` 확인 + 실제 받은편지함 본문에 � 없는지 육안 확인
- Edge function 로그에서 단계별 FFFD 카운트 0 확인

### 범위 외
- 코칭 콘텐츠/디자인 변경 없음
- 다른 템플릿(주간 다이제스트 등) 변경 없음
