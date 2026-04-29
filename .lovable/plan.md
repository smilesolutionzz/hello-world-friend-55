
# 4월 공동대표 회의자료 — Markdown 초안 생성 계획

목표: Claude Code로 가져가서 다듬고 PPTX/PDF로 변환할 **단일 Markdown 파일** 한 벌을 만든다. 3월 자료(`공동대표_회의자료_2026년3월.md`) 톤을 그대로 잇되, 4월의 핵심 변화(마음트랙 단일상품 BM, 워크북 리뉴얼, 코파일럿/검사 라우팅 정리, AI×Expert 철학)를 중심에 둔다.

## 산출물

- 파일: `/mnt/documents/공동대표_회의자료_2026년4월.md` (단일 파일)
- 형식: 3월 자료와 동일한 H1/H2/표/체크리스트 구조
- 후속: 회의 당일 PPTX는 Claude Code 쪽에서 이 MD를 슬라이드로 분해 (이번 작업에는 포함하지 않음 — "MD만"이 답변)

## 문서 목차 (8개 섹션)

```text
1. Executive Summary (한 페이지 요약)
   - 4월 핵심 1줄: "마음트랙 단일상품 BM 확정 + 30일 코칭 운영 인프라 완성"
   - KPI 스냅샷 (MAU, 결제, 마음트랙 가입자)

2. 4월 개발 변경사항 — 영역별 표
   2.1 비즈니스 모델
       - 단건 검사/월·연 구독 → ₩19,900 30일 마음트랙 단일상품으로 통일
       - 전문가 상담 단건 + 구독자 할인 + 무료 1회 자동지급 RPC
   2.2 마음트랙 워크북
       - DailyMissionPreview, WorkbookPreviewCard, MilestoneProgressBar
       - 미션 축(검사/영상/회고) 진행률 규칙 정리
       - 검사→워크북 복귀 시 회고 다이얼로그 자동 오픈
   2.3 검사 시스템
       - "검사 시작" 버튼 → 항상 /assessment?test=... 자체 검사로만 라우팅
       - mind_track_checkins 자동 저장 + 실패 리트라이 UI
   2.4 AI Copilot
       - /ai-copilot 라우트 신설, CopilotBubble 자동 오픈
       - 모바일 오버플로우 최적화
   2.5 안정성/UX
       - 모바일 타이포 표준, CTA 일원화, 아코디언 도입

3. 마음트랙 BM 단일화 스토리 (의사결정 근거)
   - Before: 토큰/단건 990원/구독 9,900·99,000원 — 가격 혼선, 결제 전환 낮음
   - After: ₩19,900 단일 결제 + 전문가 상담 단건만
   - 근거 3가지:
     a. PMF 가설 — Calm+Wysa 하이브리드, "30일 변화 트랙"이 명확한 약속
     b. 결제 단순화로 첫 결제 마찰 ↓
     c. 상담 BM과 분리 — 구독은 코칭, 상담은 휴먼 터치
   - 메모리 근거: mem://product/single-product-bm-ko, mem://strategy/pmf-positioning-2026-ko

4. 기능 카탈로그 (4월 기준 가동 중)
   - 마음트랙 30일 / 코파일럿 / 리포트 제너레이터 Pro / 전문가 매칭
   - B2B Job Coach (워크플레이스 멘탈헬스)
   - My Journey 종단 대시보드, Verification QR, Weekly Digest, Daily Coaching Email

5. UI/UX 비포·애프터
   - 캡처 자리표시자 6컷:
     [PLACEHOLDER: /pricing 비포·애프터]
     [PLACEHOLDER: /mind-track 워크북 리뉴얼]
     [PLACEHOLDER: 검사 결과 → 워크북 회고 자동 오픈]
     [PLACEHOLDER: /ai-copilot 모바일 최적화]
     [PLACEHOLDER: /expert-hiring 단건 상담 UI]
     [PLACEHOLDER: My Journey 대시보드]
   - 회의 전 수동 캡처해 끼워넣을 위치를 명시

6. 5월 로드맵
   - 마음트랙 D7/D14/D30 리텐션 측정 인프라
   - 영어버전 100% 완성 (3월 자료의 "4월 중순" 목표 이월분)
   - B2B Job Coach 파일럿 1곳 클로징
   - 전문가 상담 매칭 알고리즘 v2 (match-consultation-expert 고도화)

7. KPI 목표 (5월 / Q2)
   - 마음트랙 결제 가입자: 5월 50명 → 6월 150명
   - 결제 전환율(랜딩→결제): 3% 목표
   - D7 리텐션: 40%
   - 전문가 상담 1건 이상 사용자 비율: 결제자의 20%

8. 부록
   - 핵심 라우트 목록
   - 핵심 테이블 목록 (mind_track_*, user_subscriptions, b2b_jobcoach_*, consultation_*)
   - 의존 메모리 인덱스 발췌
```

## 데이터 자동 추출 소스

- **가격/상품**: `src/constants/tokenCosts.ts` (MIND_TRACK_PRICE 등) — 하드코딩 금지 룰 준수
- **마음트랙 구조**: `src/lib/mindTrackChapters.ts`, `mindTrackAssessmentMissions.ts`, `mindTrackMissionProgress.ts`, `mindTrackDayCopy.ts`
- **신규 컴포넌트**: `src/components/mind-track/*` (디렉터리 전체 목록 → 4월 신설/수정 분류)
- **라우트 변경**: `src/App.tsx` (특히 `/ai-copilot`, `/mind-track/*`)
- **상담 BM**: `src/lib/consultationOfferings.ts`, `src/lib/expertPricing.ts`
- **메모리 근거 인용**: mem://index.md의 Core 룰 + 관련 메모리 5개 (single-product-bm, pmf-positioning-2026, human-touch-philosophy, consultation-bm-expansion, jobcoach-workplace-mental-health)
- **3월 자료 톤 매칭**: `공동대표_회의자료_2026년3월.md` 헤더/표 스타일 그대로 차용

DB 실데이터(MAU, 결제수)는 답변에서 "코드/메모리만"으로 한정하셨으므로 이번에는 **자리표시자**(`[입력 필요: 5월 회의 직전 admin 대시보드에서 채우기]`)로 두고, 회의 직전 본인이 채우거나 별도 요청 시 DB 조회로 채워 넣는다.

## 작업 단계 (빌드 모드 진입 후)

1. 핵심 소스 파일 5개 일괄 read → 4월 신설/수정 컴포넌트 자동 분류
2. tokenCosts.ts에서 가격 상수 import한 표 생성
3. mem://의 single-product-bm / pmf-positioning-2026 메모리 본문 read
4. 위 8개 섹션을 채워 `/mnt/documents/공동대표_회의자료_2026년4월.md` 단일 파일로 출력
5. presentation-artifact 태그로 다운로드 링크 노출

## 비기술적 메모

- 가격 숫자는 메모리 룰상 코드에서 읽어 출력 (₩19,900 등). 본문에 박제하지 않고 "현재 정가: 코드 기준 ₩19,900" 식으로 표기.
- 이모지 미사용, 마크다운 표는 3월 자료처럼 본문 내 비교 표로만 사용 (리포트 톤 룰의 "표 금지"는 사용자 향 리포트에 적용되는 룰이며, 내부 회의자료는 3월 자료와 동일하게 표 사용).
- 분량 목표: 3월 자료와 비슷한 ~700줄 이내.

승인해 주시면 빌드 모드로 전환되는 다음 턴에 곧바로 파일 1개를 생성해 드리겠습니다.
