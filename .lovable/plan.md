## 현상

- `/voice-counseling` 진입 시 음성상담이 시작되지 않음.
- 콘솔 로그: `hasSession: false` (현재 세션 미로그인 상태).
- `supabase/functions/realtime-voice` 최근 로그 없음 → 클라이언트가 WebSocket 단계까지 도달하지 못함.

## 원인 (2가지가 겹쳐 있음)

1. 로그인 게이트
   - `src/pages/VoiceCounselingNew.tsx` 의 `runPreflight()` 가 access_token 없으면 즉시 `AUTH` 에러로 종료.
   - 사용자가 미로그인 상태로 들어오면 "로그인이 필요해요" 토스트만 뜨고 연결 시도 자체가 안 됨.
2. OpenAI Realtime 모델명이 만료된 별칭
   - `supabase/functions/realtime-voice/index.ts` 에서 `wss://api.openai.com/v1/realtime?model=gpt-realtime` 사용.
   - 현재 안정 모델명은 `gpt-4o-realtime-preview-2024-12-17` (또는 `gpt-4o-realtime-preview`). `gpt-realtime` 호출 시 OpenAI 가 즉시 끊어 클라에서 WS close 로 보임.

## 변경 사항

### 1. Edge function 모델 업데이트 + 진단 로그
- 파일: `supabase/functions/realtime-voice/index.ts`
  - 모델 문자열을 `gpt-4o-realtime-preview-2024-12-17` 로 교체.
  - OpenAI WS `onclose` 시 status code / reason 을 클라이언트로 한 번 forward (디버깅용 `{type:'upstream.closed', code, reason}`).
  - OPENAI_API_KEY 미설정 시 명확한 메시지 (이미 있음, 유지).
  - 배포(`supabase--deploy_edge_functions`).

### 2. 미로그인 사용자 허용 (게스트 모드)
- 파일: `supabase/functions/realtime-voice/index.ts`
  - `token` 파라미터가 비어 있어도 게스트로 허용 (현재는 401). 단, 게스트 호출에는 IP 기반 간단 카운터로 분당 1세션 제한 메모리 안내.
- 파일: `src/pages/VoiceCounselingNew.tsx`
  - `runPreflight` 에서 AUTH 실패해도 게스트로 진행하되, 상단에 "로그인하면 대화 기록이 저장돼요" 안내 + `Login` 버튼 노출.
  - `RealtimeVoiceChat.init()` 에서 토큰이 없을 때도 wss URL 을 만들도록 분기 (현재도 빈 문자열 그대로 전송됨 → 서버 401만 풀면 됨).
  - `persistSession()` 은 로그인된 경우에만 호출 (현재 로직 유지).

### 3. 사용자 가시적 에러 메시지 개선
- 파일: `src/pages/VoiceCounselingNew.tsx`
  - `onClose` 에서 `upstream.closed` 메시지 받으면 "음성 모델 연결에 실패했어요 (OpenAI)" 로 코드/이유 표시.
  - 재연결 3회 시도 후 실패하면 `History` / `Reload` 버튼 그대로 노출 (이미 있음).

## 검증

1. Edge function 배포 후 `supabase--curl_edge_functions` 가 아닌 브라우저에서 `/voice-counseling` 진입 → 마이크 권한 허용 → 코끼리 인사 음성 재생 확인.
2. 콘솔 로그에서 `📨 Received: session.created` → `Session configured` 순서 확인.
3. 미로그인 상태에서도 대화 시작이 되는지 확인.
4. `supabase--edge_function_logs realtime-voice` 에서 `Connected to OpenAI Realtime API` 로그 확인.

## 범위 밖

- TTS 음색/감성 톤, 새 코끼리 캐릭터 디자인.
- 대화 기록 UI 개선.
- ElevenLabs 대체 음성 엔진 전환.
