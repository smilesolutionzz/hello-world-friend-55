

## 문제
"긴급 전문가 연결"과 "전문가 상담 신청하기" 두 버튼이 사실상 같은 `/expert-hiring` 페이지로 이동합니다 (URL 쿼리 `?urgent=true`만 차이). 사용자 입장에서 화면이 동일하게 보여 두 CTA가 분리된 의미를 갖지 못합니다.

## 목표
두 버튼이 명확히 다른 흐름과 다른 화면으로 이동하도록 분리합니다.

## 변경안

**1. 긴급 전문가 연결 (빨강 버튼)**
- 이동 경로: `/expert-hiring/urgent-match` (신규 전용 페이지)
- 목적: 30분 이내 즉시 매칭 전용 페이지. 일반 전문가 검색 UI를 보여주지 않고, "긴급 매칭 요청 → 자동 배정 → 알림" 흐름에 집중.
- 화면 구성:
  - 상단: 위기 안내 배너 + 응답 시간 카운트(30분 이내)
  - 중단: "지금 매칭 요청" 단일 CTA → `urgent_match_requests` 또는 기존 booking 시스템에 `priority='urgent'` 레코드 생성 후 관리자/온콜 전문가에게 알림
  - 하단: 요청 후 "담당 상담사 배정 대기 중" 상태 표시
  - 일반 검색/필터 UI 없음 (혼동 방지)

**2. 전문가 상담 신청하기 (주황 버튼)**
- 이동 경로: `/expert-hiring` (기존 일반 검색/예약 페이지, 쿼리 없음)
- 목적: 기존처럼 전문가 목록을 둘러보고 본인이 원하는 시점에 예약
- 화면 변경 없음

**3. RedFlagAlertDialog 수정**
- `handleEmergencyMatch` → `navigate('/expert-hiring/urgent-match')`
- `handleConsultation` → `navigate('/expert-hiring')` (쿼리 제거)
- 두 버튼 위 짧은 설명 라벨 추가:
  - 긴급 버튼 하단: "30분 이내 자동 배정"
  - 일반 버튼 하단: "원하는 전문가 직접 선택"

**4. 라우팅**
- `src/App.tsx`에 `/expert-hiring/urgent-match` 라우트 추가
- 신규 페이지 `src/pages/UrgentExpertMatch.tsx` 생성

## 기술 작업 대상
- `src/components/assessment/RedFlagAlertDialog.tsx` (네비 경로 + 보조 라벨)
- `src/pages/UrgentExpertMatch.tsx` (신규)
- `src/App.tsx` (라우트 등록)
- 매칭 요청 저장: 기존 `consultation_bookings` 또는 신규 `urgent_match_requests` 테이블 (마이그레이션 필요시 추가)

## 완료 기준
- "긴급 전문가 연결" 클릭 → `/expert-hiring/urgent-match`의 단일 매칭 요청 화면 표시
- "전문가 상담 신청하기" 클릭 → 기존 `/expert-hiring` 전문가 검색/예약 화면 표시
- 두 화면이 시각적·기능적으로 명확히 구분됨
- 모바일/데스크톱 모두에서 동일하게 동작

