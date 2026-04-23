

# 리포트 품질 점검 결과 + 메인페이지 슬림화 진단

## 1. 리포트 품질 진단 (가장 중요)

### 발견된 문제

`premium_report_history` 테이블 직접 조회 결과 (최근 30일 27개 리포트):

| 항목 | 수치 | 상태 |
|---|---|---|
| 총 생성 | 27개 | — |
| **빈 리포트 (parseError)** | **4개 (15%)** | 심각 |
| 가장 최근 2건 (4/22, 4/20 03:22) | 모두 실패 | 위험 |
| 정상 생성 케이스 | 23개 | 양호 |

### 실패 케이스 상세

**케이스 A — 4/22, "경열맘"**
- 9개 섹션 전부 `"이 섹션의 분석이 생성되지 않았습니다 (AI content가 비어있음)"` 로 저장
- 데이터: `progressTracking 2건`, 나머지 0건 → 입력 데이터 거의 없음
- 메타데이터 `userInfo.age: -17974` (생년월일 미입력 → 음수 나이 계산 버그)

**케이스 B — 4/20 03:22**
- "JSON 파싱 실패" 사유로 빈 리포트 저장
- AI가 응답은 했으나 JSON 파싱 단계에서 깨짐

### 코드 추적 결과 (`generate-expert-report/index.ts`)

```text
Gemini 3.1 Pro (medium effort, 48k tokens)
  ↓ content < 50자면
GPT-5.2 재시도 (32k tokens)
  ↓ 그래도 실패면
placeholderReport("AI content가 비어있음") → DB 저장
```

문제점:
1. **입력 데이터가 너무 적은 경우** (assessments 0, observations 0) AI가 할 말이 없어 빈 응답 → 그대로 저장
2. **음수 나이 (-17974)** 등 유효성 미검증 입력 → AI 혼란
3. **placeholder 리포트도 그대로 DB에 저장** → 사용자는 결제했는데 빈 리포트 받음 (환불 분쟁 위험)
4. **에지 함수 로그가 비어 있음** → 운영 모니터링 사각지대

### 정상 리포트 품질 (4/20 03:18 등)
- 길이 충분 (17,275자), 임상 어조 적절
- "AIHPRO 다차원 분석", 종단 추적, 4주/8주/12주 로드맵 모두 생성
- 톤·구조 모두 메모리 정책(전문가 어조, 이모지 X, 넘버링)에 부합 → 잘 작동 중

### 권장 조치 (다음 메시지에서 구현)

**A. 리포트 생성 게이트 (사전 검증)**
- 데이터 0~소량이면 생성 자체를 차단하고 "검사 N개 이상 필요" 안내
- 음수 나이/이상 입력은 즉시 400 반환

**B. 실패 시 DB 저장 차단**
- `parseError === true` 또는 유효 섹션 0개면 DB 저장 SKIP + 사용자에게 "다시 시도" 응답
- 이미 차감된 크레딧/이용권 자동 환원

**C. 모니터링 대시보드**
- `/admin` 에 "리포트 품질" 카드: 최근 7일 실패율, 파싱 실패 케이스 목록, 평균 섹션 수
- 실패율 5% 초과 시 관리자 알림

**D. 기존 빈 리포트 정리**
- 4개의 placeholder 리포트는 사용자에게 "재생성 무료" 알림 후 삭제 또는 재생성

## 2. 메인페이지 정보 과부하 진단

### 현재 섹션 구성 (`src/pages/Index.tsx`)

```text
1. Hero
2. Testimonial (후기)
2.5 RealFeedback (카톡 피드백)
3. ReportPreview
3.5 HumanTouchManifesto
4. VideoObservationShowcase
5. ExpertTeam (이미 숨김 처리됨)
6. EmotionalHook
7. PartnerTrust (50+ 제휴기관)
8. SubscriptionValue
9. CTABanner
+ Footer / StickyConversionBar / SocialProofToast / CopilotBubble
```

총 9~10개 본문 섹션 + 떠있는 4개 위젯 → 모바일에서 스크롤 피로도 매우 높음.

### 슬림화 권고 (우선순위 순)

| 섹션 | 권고 | 사유 |
|---|---|---|
| **2 Testimonial + 2.5 RealFeedback** | **둘 중 하나로 통합** | 같은 "사회적 증거" 중복 — RealFeedback(카톡)이 더 임팩트 있으니 그것만 유지 |
| **3.5 HumanTouchManifesto** | **제거 또는 푸터 위로 이동** | 구독/CTA 흐름을 끊는 철학 텍스트 — 리포트/About 페이지로 이동이 적합 |
| **6 EmotionalHook** | **제거** | Hero + Testimonial로 이미 감성 후킹 충족, 중복 |
| **7 PartnerTrust** | **유지하되 슬림 (로고만 1줄)** | 50+ 기관 신뢰는 중요하나 현재 비중 큼 |
| **4 VideoObservationShowcase** | **유지** | WOW 팩터 — 차별화 핵심 |
| **3 ReportPreview** | **유지** | 결제 전환 직결 |
| **8 Subscription + 9 CTA** | **하나로 통합** | 둘 다 구독/결제 CTA — 중복 |
| **CopilotBubble + StickyConversionBar + SocialProofToast** | **모바일에서 2개만 노출** | 떠있는 위젯 4개는 화면을 가림 |

### 슬림화 후 목표 구성 (7개 → 5개 본문)

```text
1. Hero (그대로)
2. RealFeedback (카톡 후기 — Testimonial 통합)
3. ReportPreview (전환 핵심)
4. VideoObservation (WOW)
5. Subscription + 최종 CTA (통합)
+ PartnerTrust 슬림 1줄 (Footer 직전)
+ Footer
```

스크롤 30~40% 감소 예상, 결제 CTA 도달률 상승 기대.

## 작업 범위 (다음 메시지에서 진행)

리포트 품질 안정화가 더 시급합니다. 다음 4가지를 순서대로 진행 권장:

1. **리포트 생성 게이트 + 실패 시 DB 저장 차단 + 크레딧 자동 환원** (긴급)
2. **`/admin` 리포트 품질 모니터링 카드 추가** 
3. **기존 빈 리포트 4건 사용자 알림/재생성 처리**
4. **메인페이지 슬림화** (위 표대로 섹션 통합/제거)

각 항목 진행 전 추가 확인 사항이 있으면 알려주세요. 어디까지 한 번에 진행할지 정해주시면 바로 구현 들어갑니다.

