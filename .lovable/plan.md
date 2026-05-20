## 방향

`/check/done`의 메인 CTA를 **"7일 챌린지"**(자체 결제 상품)로 바꾸고, 기존 "우리 동네 기관 찾기"는 완전 제거. 보조 CTA는 **"맞춤 치료사 구독"** 진입점(그릿지 식 매칭 구독 모델). 위기 상황(점수가 매우 낮음)에서만 작은 안전망 링크로 `/expert-hiring?urgent=true` 노출.

## CTA 위계 (위→아래)

```text
[ 7일 챌린지 시작하기                          ]  ← 메인, 검정 큰 버튼
  맞춤 영역별 7일 부모 코칭 · ₩7,900 (가격은 코드에서)
[ 맞춤 치료사 구독 알아보기 →                  ]  ← 보조, 흰 버튼 + 골드 보더
  내 아이에 맞는 치료사 매칭 · 월간 정기 코칭

(점수 위험 구간일 때만 노출)
"걱정이 크다면 전문가에게 바로 도움받기" → /expert-hiring?urgent=true   ← 12px, 회색 텍스트 링크
```

## 1) 메인 CTA — "7일 챌린지"

- **라벨**: `7일 챌린지 시작하기`
- **서브 라벨**: `{선택 영역} 7일 부모 코칭 · ₩7,900` (가격은 `src/constants/tokenCosts.ts`의 `mind_track_7`에서 읽기, 하드코딩 금지)
- **이동**: `/mind-track?audience=child&from=check&area={area_code}` (기존 mind_track_7 결제 플로우 재사용)
- **스타일**: `h-14 rounded-2xl bg-slate-900 text-white text-[18px] font-semibold`

## 2) 보조 CTA — "맞춤 치료사 구독"

기존 `/expert-hiring`은 단건 상담. 사용자는 **그릿지 식 정기 매칭 구독**을 원함. 현재 그 정확한 페이지가 없으므로 **Day 4 도착지 라우트를 먼저 자리만 잡고 임시 안내 페이지로 연결**.

- **라벨**: `맞춤 치료사 구독 알아보기`
- **서브 라벨**: `내 아이에 맞는 치료사 매칭 · 월간 정기 코칭`
- **이동**: `/therapist-subscription?from=check&area={area_code}` (신규 임시 라우트)
- **임시 페이지 `src/pages/lite/TherapistSubscriptionTeaser.tsx`**:
  - "준비 중" 카드 + 가치 제안 3줄 (① 영역별 검증 치료사 매칭, ② 주 1회 화상/대면, ③ 월간 진척 리포트)
  - 메일 알림 신청 입력(선택, 옵셔널) — 지금은 폼만, 백엔드 연결은 Day 5+
  - 아래 작은 링크: "지금 1회 전문가 상담 받기" → `/expert-hiring` (단건 상담 대체 안내)
- **스타일**: `h-12 rounded-2xl bg-white border border-[#C8B88A]/40 text-slate-900 text-[15px] font-medium`

## 3) 위기 안전망 (조건부)

`score < 40` (또는 `area === 'emotion' && score < 50`)일 때만 메인/보조 CTA 아래 작은 회색 텍스트 링크 노출:
- 텍스트: `걱정이 크다면 전문가에게 바로 도움받기`
- 링크: `/expert-hiring?urgent=true`
- 스타일: `text-[12px] text-slate-400 underline underline-offset-2`

위기 임계값이 아니면 이 줄은 렌더하지 않음.

## 4) 카피 톤

- 보고서 본문 톤은 그대로(비위협). CTA 영역만 "해결책 제시" 톤으로 강화:
  - 카드 위 작은 헤더 한 줄: `다음 7일, 우리 아이에 맞게 시작해 볼게요`
- "진단/장애/치료" 단어 금지 규칙 유지.

## 5) 변경 파일

- `src/pages/lite/CheckDone.tsx` — CTA 블록 교체, 위기 안전망 조건부 렌더, 가격은 `MIND_TRACK_7` 상수에서 읽기
- `src/pages/lite/TherapistSubscriptionTeaser.tsx` — 신규(임시 티저 페이지)
- `src/App.tsx` — `/therapist-subscription` 라우트 등록
- `src/components/navigation/MobileBottomTab.tsx` — `hiddenPaths`에 `/therapist-subscription` 추가

## 6) 메모리 업데이트

새 규칙을 메모리에 저장:
- `mem://ux/conversion/check-done-cta-policy-ko` — 라이트 체크 결과 화면 CTA 정책 (7일 챌린지 메인, 치료사 구독 보조, 기관찾기는 위기 시 안전망)

## 검증

- `/check` → 영역 선택 → 3문항 응답 → `/check/done`에서 메인 CTA가 "7일 챌린지 시작하기 · ₩7,900"으로 보이는지
- 메인 CTA 클릭 시 `/mind-track?audience=child&from=check&area=…`로 이동
- 보조 CTA 클릭 시 임시 티저 페이지로 이동
- emotion 영역 + 30점으로 답해 위기 안전망 링크가 노출되는지
- language 영역 + 90점으로 답해 위기 안전망이 숨겨지는지
