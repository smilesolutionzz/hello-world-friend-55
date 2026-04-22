
목표: 지금 막힌 6가지를 한 번에 정리해서, 실제 사용자 기준으로 “약속한 기능이 정말 작동하는 상태”로 맞춥니다.

1. 1:1 코칭 메일 미수신 수정
- 30일 트랙 구매자도 코칭 메일 발송 대상에 포함되도록 발송 조건을 다시 맞춥니다.
- 현재 코칭 메일 발송 로직은 `user_coaching_goals`가 있어도 `user_subscriptions(status=active, subscription_type in premium/paid)`를 추가로 요구하고 있어, 30일 트랙 구매 흐름과 어긋날 가능성이 큽니다.
- `send-daily-coaching-email`가 실제로 매일 오전 8시(KST)에 실행되도록 스케줄도 함께 점검/설정합니다.
- 발송 실패 시 조용히 넘어가지 않도록 로그와 사용자 안내 문구도 보강합니다.

2. 스트레스·번아웃 추천에서 우울감 검사 제거
- `우울·무기력`과 `스트레스·번아웃`이 서로 다른 경로를 추천하도록 정리합니다.
- 특히 `ConcernBasedRecommender`의 `stress` 추천 목록에서 `우울감 검사`를 제거하고, 번아웃/직장 스트레스/회복 관련 검사 또는 상담으로 바꿉니다.
- 관련 패키지 페이지도 같이 맞춰서, 사용자가 어디서 들어와도 “스트레스→우울검사”로 꼬이지 않게 정리합니다.

3. AI 음성 상담 정상화
- AI가 먼저 멋대로 말하기 시작하는 문제를 막습니다.
- 현재 음성 세션 시작 시 `response.create`가 자동 호출되어, 사용자가 말하기 전에 AI가 먼저 대답하는 흐름이 있습니다. 이 자동 시작을 모드별로 분리합니다.
- 자유 상담에서는 사용자가 먼저 말하거나 명시적으로 시작 버튼을 눌렀을 때만 응답하도록 바꿉니다.
- 마이크 상태를 더 명확히 보이게 하고, “연결됨 / 듣는 중 / 음성 인식 중 / AI 응답 중” 상태를 분리합니다.
- 사용자 발화가 실제로 인식됐을 때만 채팅에 반영되도록 정리해서, “내가 안 썼는데 혼자 입력되는 느낌”을 없앱니다.
- 필요하면 현재의 완전 자동 상시 청취 방식 대신, 더 안전한 명시적 말하기 버튼 방식으로 바꿉니다.

4. 전문가 상담 신청 후 404 수정
- 내부에서 404를 만드는 잘못된 경로를 제거합니다.
- 현재 상담 종료 후 `/consultation/:id/review`로 이동하는 코드가 있는데, 실제 라우터에는 이 경로가 없습니다.
- 이 부분은:
  - 실제 리뷰 페이지 라우트를 추가하거나,
  - 기존 `BookingReviewModal` 기반으로 예약내역 페이지 안에서 처리하도록 바꿉니다.
- 또한 “내역 확인”, “예약 내역”, “상담 내역”으로 연결되는 버튼을 전부 실제 존재하는 경로로 통일합니다.

5. “전문가 검사 신청”이 Smile Solution으로 가는 문제 수정
- `ReportGeneratorPro`의 CTA가 외부 `https://smilesolution.kr`로 연결되어 있는데, 이를 AIHPRO 내부 경로로 교체합니다.
- 사용 목적에 맞게 `/expert-hiring` 또는 실제 전문가 검사 신청 플로우로 연결해, 외부 이탈이 없도록 바꿉니다.
- 관련 번역/CTA 문구도 함께 점검해서 “전문가 검사 신청”이 항상 같은 의미로 동작하게 만듭니다.

6. 데모 리포트 다운로드 복구
- 현재 `/demo/AIHPRO_데모_리포트.docx` 링크는 코드에는 있는데 실제 파일이 없는 상태로 보입니다.
- 실제 데모 파일을 `public/demo/` 아래에 배치하거나, 버튼을 존재하는 파일 경로로 교체합니다.
- 브라우저 다운로드가 확실히 되도록 MIME/경로를 맞추고, 필요하면 PDF 버전도 함께 제공합니다.

기술 작업 대상
- `supabase/functions/send-daily-coaching-email/index.ts`
- 관련 스케줄 migration 또는 cron 설정
- `src/components/assessment/ConcernBasedRecommender.tsx`
- 필요 시 `src/components/assessment/StressPackage.tsx`
- `src/components/metaverse/MetaverseVoiceCounseling.tsx`
- `src/utils/RealtimeAudio.ts`
- 필요 시 `supabase/functions/get-realtime-token/index.ts`
- `src/components/consultation/ConsultationInterface.tsx`
- `src/App.tsx`
- `src/pages/ReportGeneratorPro.tsx`
- `src/components/report/ReportContentShowcase.tsx`
- `public/demo/*`

완료 기준
- 30일 트랙 사용자가 코칭 목표를 저장하면 메일 발송 대상에 정상 포함됨
- 스트레스·번아웃 추천에서 우울감 검사가 빠짐
- 음성 상담에서 AI가 멋대로 선발화/자가입력하지 않고, 마이크 인식 상태가 명확함
- 상담 내역/리뷰 흐름에서 404가 사라짐
- 전문가 검사 신청이 외부 사이트가 아니라 내부 플로우로 이동함
- 데모 리포트 다운로드 버튼이 실제 파일을 정상 다운로드함

검증 방법
- 코칭 목표 생성 → 발송 대상 조건 확인
- 고민 추천에서 `우울·무기력` / `스트레스·번아웃` 각각 클릭해 추천 카드 비교
- 음성 상담 진입 후: 권한 허용, 사용자 발화, AI 응답, 텍스트 입력 각각 확인
- 전문가 신청 후 “내역 확인” 클릭
- 리포트 페이지의 “전문가 검사 신청” 클릭
- “데모 리포트 다운로드” 클릭
