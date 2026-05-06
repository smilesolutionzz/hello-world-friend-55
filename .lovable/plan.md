
# AIHPRO 6월 론칭 개발 계획 (D-30 ~ D-Day)

현재 상태: 일일 코칭 메일(01~09 정렬), `mind_track_30` 단일 상품, 전문가 상담 BM, B2B Job Coach 기반 구축 완료. 이제 "팔리는 상태"에서 "안정적으로 굴러가는 론칭 상태"로 만드는 단계.

오늘(5/6) 기준 → **6월 1일 정식 론칭** 목표.

---

## 핵심 원칙

- 신규 기능 추가 최소화. **품질·안정성·전환율**에 집중.
- 단일 상품(`mind_track_30` ₩19,900) + 전문가 상담의 깔끔한 퍼널.
- 일일 코칭 메일이 핵심 리텐션 엔진 → 30일 완주율을 KPI로.

---

## Week 1 (5/7 ~ 5/13) — 메일 시스템 안정화

**01. 일일 코칭 메일 30일치 QA**
- Day 1, 7, 15, 21, 30 실제 발송 → 번호(01~09), CTA, 모바일 렌더링 검증
- 이미 보낸 두 명(kijung, tntjr91) 피드백 수집
- Edge Function `send-daily-coaching-email` 에러 로그 모니터링 및 재시도 로직 점검

**02. 콘텐츠 회고 흐름 검증**
- `daily_coaching_email_log` 와 `user_coaching_goals` 연동 확인
- 사용자가 메일 받고 → `/mind-track` 들어왔을 때 "오늘 콘텐츠"가 메일과 동일한지 일치 검증

**03. 발송 스케줄러 점검**
- cron(매일 KST 오전 7시) 정상 동작 / 누락 시 알림 / 중복 발송 방지 키 확인

---

## Week 2 (5/14 ~ 5/20) — 결제·구독 안정화

**04. `mind_track_30` 결제 풀 플로우 E2E 테스트**
- 토스 결제 → `unified-payment` → enrollment 생성 → 첫 메일 발송까지 한 사이클 검증
- 결제 실패/취소 시 사용자 안내 + 자동 환불 가능성 점검

**05. 전문가 상담 단건 결제 검증**
- `match-consultation-expert` AI 매칭 정확도 / 상담 패키지 가격 일관성 (코드/DB 일치)
- 구독자 할인 (`expertPricing.ts`) 적용 확인

**06. 결제 영수증·약관·환불 정책**
- 30일 마음 트랙 환불 규정 명문화 (예: 7일 이내 미사용 시 환불)
- 영수증 메일 템플릿 점검

---

## Week 3 (5/21 ~ 5/27) — 전환 퍼널·랜딩 최적화

**07. 랜딩(`/`) → `mind_track_30` 결제 전환 측정**
- 스티키 CTA, 비교 표(ChatGPT vs AIHPRO), 입증 배지 노출 확인
- 무료 체험(즉석 AI 분석, 트라이얼 검사) → 결제 유도 동선 점검

**08. 결제 후 리텐션**
- `PostPaymentConversionFlow` 가 30일 트랙으로 자연스럽게 안내하는지
- `/my-journey` 길이별 트래킹 대시보드 데이터 정상 표시

**09. 모바일 결제 퍼널 3단계**
- iOS Safari / Android Chrome / Capacitor 앱 모두에서 overflow-x 없음, 결제 성공 콜백 정상

---

## Week 4 (5/28 ~ 6/3) — 보안·법적·인프라

**10. RLS·보안 점검**
- `security--run_security_scan` 돌리고 신규 finding 0건 만들기
- `user_coaching_goals`, `daily_coaching_email_log` RLS 재확인 (본인만 접근)

**11. 법적 문서 최종화**
- 이용약관, 개인정보처리방침, 환불정책, 비의료 코칭 면책 (`MedicalDisclaimer`) 상단 노출
- `<14세` 보호자 동의 (`GuardianConsentDialog`) 동작 확인

**12. 인프라·관측**
- Supabase 인스턴스 사이즈 점검 (메일 발송 시 부하 대비)
- Edge Function 에러율 / 알림 채널 (운영자 메일) 셋업
- Naver/Google SEO 메타 < 40/80자 재검수, sitemap 갱신

---

## Week 5 (6/4 ~ 6/10) — 소프트 론칭 & 마케팅 가동

**13. 베타 사용자 30명 초대**
- 유튜브 23K 구독자 중 신청자 → 무료 30일 마음 트랙 제공 → 피드백
- 일일 메일 오픈율/클릭률 측정 (목표: 오픈 40%, 클릭 15%)

**14. 유튜브 CTA 정비**
- 영상 끝 카드/설명란 → `/mind-track` 직링크
- 사전 예약된 교육 콘텐츠 5편 업로드

**15. 정식 론칭(D-Day, 6/15 권장)**
- 프레스 릴리즈 / 맘카페 시딩 / 인스타 광고 소액 시작
- 24시간 운영 모니터링 당직 체계

---

## KPI (론칭 후 30일)

```text
신규 가입         : 1,000명
mind_track_30 결제: 50명 (전환 5%)
30일 완주율       : 40%
일일메일 오픈율   : 40%+
전문가 상담 전환  : 결제자의 15%
MRR              : ₩1,000,000+
```

## 기술 세부사항 (참고용)

- 메일: `supabase/functions/send-daily-coaching-email` + `_shared/transactional-email-templates/daily-coaching.tsx`
- 결제: `unified-payment` Edge Function 단일 진입점
- 매칭: `match-consultation-expert` (AI 기반)
- 가격: `src/constants/tokenCosts.ts` + `b2b_*_plans` DB (하드코딩 금지)
- 모델: Gemini 3.1 (`reasoning.effort: medium`), 일일 메일은 비용·품질 균형상 현재 모델 유지 권장

---

## 의사결정 필요 항목

1. **D-Day 확정**: 6/1 vs 6/15 (베타 2주 권장 → 6/15)
2. **베타 인원**: 30명 vs 100명
3. **환불 정책**: 7일 무조건 환불 vs 첫 메일 미수신 시만
4. **유튜브 광고 예산**: 월 50만 vs 200만

승인하시면 **Week 1의 "01. 메일 30일치 QA"부터** 바로 착수하겠습니다.
