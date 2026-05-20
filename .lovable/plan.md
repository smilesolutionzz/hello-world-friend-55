# 기존 핵심 기능 × Mind Track 7일 — 역할 재정의 플랜

## 문제 인식

지금 `/check`(간편검사) · `/assessment`(심층검사) · `/metaverse-voice`(게임상담/VAD) · `/report-generator-pro`(전문가 리포트) · `/expert-hiring`(전문가 상담) 같은 핵심 자산이 **각자 따로 떠 있음**. 새로 만든 `mind_track_7`(7일 트랙)이 메인 결제 상품으로 자리잡으면서, **나머지 기능이 "이 7일 안에서 언제 쓰이는가"**가 불분명해진 상태.

이걸 풀어내는 통합 동선을 제안.

---

## 01. 기능별 역할 재정의 (Funnel Position)

```text
[ Top of Funnel : 무료 입구 ]
  └ /check  (간편검사 5~10문항)        ← 신규 진입자 호기심 해소
      → /check/done  → mind_track_7 결제 유도 (이미 적용됨)

[ Mid Funnel : 메인 결제 상품 ]
  └ /mind-track  (7일 트랙, ₩7,900 · 3일 무료체험)
      ├ Day 1   Heavy  → 베이스라인 진단  ▶ /assessment 의 핵심 척도 1개 임베드
      ├ Day 2~3 Light  → 5분 미션 카드
      ├ Day 4   Heavy  → 전문가 매칭     ▶ /expert-hiring AI 매칭 결과 임베드
      ├ Day 5~6 Light  → 5분 미션 + 셀프 리플렉션
      └ Day 7   Heavy  → 비교 리포트     ▶ /report-generator-pro 의 "간이판" 임베드

[ Bottom of Funnel : 업셀 ]
  ├ 7일 완주자 → mind_track_extend_23 (₩12,900) 또는 mind_track_30
  ├ 깊은 분석  → /report-generator-pro  (단건 결제 or 구독자 무료 1회)
  ├ 전문가 1:1 → /expert-hiring          (구독자 할인 + 월 무료 크레딧)
  └ 정서 환기  → /metaverse-voice (게임상담)   ← 미션 보조 도구로 위치 변경

[ 평생 자산 ]
  └ /my-journey  RCI 기반 종단 대시보드  ← 7일·30일·심층검사 결과를 한 곳에 누적
```

핵심: **`/check`은 "입구", `mind_track_7`은 "메인 코스", 나머지는 "코스 안에서 호출되거나 코스 후에 업셀되는 모듈"**로 위치를 명확히 한다.

---

## 02. Day별로 어떤 기존 기능을 끌어쓸지

| Day | 타입 | 호출되는 기존 기능 | 호출 방식 |
|-----|------|---------------------|-----------|
| Day 1 | Heavy | `/assessment` 의 audience별 핵심 척도 1개 (예: child→ABA 관찰, adult→번아웃, parent→양육스트레스) | Day1DiagnosisScreen 내부에서 임베드. 결과는 `baseline_data` jsonb에 저장 |
| Day 2 | Light | 셀프 미션 + (옵션) `/metaverse-voice` 짧은 정서 환기 5분 | 미션 카드 하단 "감정이 무거우면 게임상담 5분" 보조 링크 |
| Day 3 | Light | 셀프 미션 + `/concern-storage` 고민 메모 | 동일 패턴, 보조 링크 |
| Day 4 | Heavy | `/expert-hiring` AI 매칭 결과 (audience 태그 기반) | Day4ExpertMatchScreen 내부에서 추천 카드 표시, 결제는 expert-hiring 페이지로 이동. **스킵 가능** |
| Day 5 | Light | 셀프 미션 + `/voice-counseling` 1회 짧은 음성 일기 | 보조 링크 |
| Day 6 | Light | 셀프 미션 + ABA(child) / 셀프코칭(adult) 기록 폼 | 미션 카드에 폼 인라인 |
| Day 7 | Heavy | `/report-generator-pro` 의 **mind_7day 전용 간이 리포트** | Day7ReportScreen에서 baseline_data + 7일 체크인 데이터로 생성. PDF는 `day7_report_url`에 저장 |

→ 게임상담·음성상담·고민함은 **"Day 안에서 호출되는 보조 도구"**로 위치가 분명해짐. 단독으로도 쓰지만, 7일 트랙 안에서는 미션 보조로 등장.

---

## 03. 비-가입자 / 비-결제자 경로

```text
비가입자
  → /check (무료) → 결과 화면에서 mind_track_7 3일 무료체험 CTA

가입했지만 mind_track 미결제
  → /assessment 무료 트라이얼 3종(우울·스트레스·ADHD)만 노출
  → /metaverse-voice, /voice-counseling 은 짧은 무료 1회 (현 정책 유지)
  → 결과 페이지마다 mind_track_7 CTA

mind_track_7 결제자 (구독자)
  → Day 진행 중에는 위 표대로 기존 기능이 미션 안에서 호출됨
  → 트랙 외에도 /assessment 전체 · /report-generator-pro 1회/월 · /expert-hiring 할인 사용 가능
```

---

## 04. 구현 범위 (이 플랜에서 다룰 것)

이건 **"개념·동선 정리 플랜"**이지 곧바로 코드 대량 변경하는 플랜이 아님. 다음 한 가지만 합의되면 실제 코드 작업으로 넘어감:

**Phase A (작은 작업, 1턴)**
1. Day1DiagnosisScreen / Day4ExpertMatchScreen / Day7ReportScreen 안에서 **위 표대로 기존 기능을 실제로 호출**하도록 연결 (현재는 자체 더미 UI). 
2. Light Day 미션 카드 하단에 **보조 도구 링크 1줄** 추가 (게임상담/음성일기/고민함).
3. `/check/done` 결과 화면, `/assessment` 결과 화면, `/metaverse-voice` 종료 화면에 **"7일 트랙으로 이어가기" 동일 CTA 컴포넌트** 1개로 통일.

**Phase B (다음 턴 이후, 별도 결정 필요)**
- `/report-generator-pro`에 `mind_7day` 전용 리포트 템플릿 추가
- audience별 Day1 척도 매핑 테이블 (`mind_track_day1_assessment_map`) 정식화

---

## 05. 다루지 않는 것 (Out of Scope)

- 새 상품/가격 도입 (현재 mind_track 라인업 유지)
- 30일 트랙 콘텐츠 재설계
- B2B Job Coach / Find Center 동선 (별도 트랙)
- 게임상담 자체의 기능 변경 — 호출 위치만 재배치
- 30일 트랙 / teen audience (Phase 2)

---

## 다음 단계

Phase A부터 진행해도 될지, 아니면 위 표에서 **"이 Day엔 다른 기능을 붙이고 싶다"** 같은 조정이 있는지 알려주세요. 합의되면 Day1·4·7 화면에 실제 기존 기능을 끼워넣는 작업부터 시작하겠습니다.
