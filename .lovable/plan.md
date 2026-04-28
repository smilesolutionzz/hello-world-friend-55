# AIHPRO UX/UI 컨설팅 리포트
SaaS 전환·리텐션·정보 구조 관점

---

## 0. 진단 방식
- 정적 코드 분석: Index, HeroSection, UnifiedNavigation, StickyConversionBar, Auth, /pages 디렉토리(100+ 파일)
- 메모리 정책(단일 상품 ₩19,900 mind_track_30, 휴먼터치 철학, 화이트 미니멀리즘) 대조
- 평가 기준: Acquisition → Activation → Conversion → Retention → Expansion 5단 SaaS 퍼널

---

## 1. 종합 평가 (요약)

| 항목 | 점수 | 한 줄 평 |
|---|---|---|
| 비주얼 완성도 | 8 / 10 | 페르소나별 Before/After 히어로는 동급 최강. |
| 정보 구조(IA) | 4 / 10 | **100+ 페이지 vs 단일 상품(mind_track_30)** — 심각한 부정합. |
| 전환 퍼널 | 5 / 10 | CTA가 5종 이상으로 분산(/mind-track, /assessment, /quiz, /token-subscription, /report-generator). |
| 리텐션 설계 | 7 / 10 | 30일 트랙·Daily/Weekly 메일·MyJourney 잘 갖춰짐. |
| B2B 명확성 | 4 / 10 | B2B 페이지 7개(JobCoach, HRDashboard, Kindergarten, Proposal, MyRequests, Demo, Application)가 진입 동선 없이 산재. |
| 일관성 | 5 / 10 | Index는 dark `bg-slate-900`, 결과/허브는 white minimal — **메모리의 "프리미엄 화이트" 원칙과 충돌**. |

**총평: 제품력은 충분하나 "한 화면 한 메시지" 원칙이 깨져 결제 전환에서 새고 있음.**

---

## 2. 핵심 문제 TOP 5 (우선순위순)

### 🔴 P0-1. CTA 카니발리제이션 (전환율 직격)
랜딩 한 페이지에서 **서로 다른 CTA가 최소 5개** 동시 노출:
- HeroSection 주: `/mind-track`
- HeroSection 보조: `/assessment`
- StickyConversionBar: `/quiz` ← **다른 곳에도 안 쓰이는 고립 라우트**
- Nav "검사·리포트": `/assessment`, `/premium-assessment`, `/report-generator`, `/mind-track`
- B2BEntryBanner: `/b2b-proposal`

→ 사용자는 "뭘 먼저 해야 하지?" 멈칫함. **단일 상품 BM(메모리 Core)인데 CTA는 멀티-상품 시대 잔재.**

### 🔴 P0-2. 다크 히어로 ↔ 화이트 미니멀리즘 일관성 붕괴
- `Index.tsx`: `bg-slate-900` + Hero `from-[#0a0e1a]`
- `UnifiedAssessmentHub`, 결과 페이지, 전문가 페이지: 화이트
→ 메모리 Core "프리미엄 화이트, 그라데이션 회피"와 정면 충돌. **첫인상부터 브랜드 약속을 어김.**

### 🟠 P1-3. 100+ 페이지 IA 비대화
`/pages` 100개 이상, 그 중 상품 결제로 직결되는 건 `mind_track_30` 단 하나.
- 14개 검사 페이지(MBTI/HanMedicine/EnergyFlow/Drawing/Fingerprint…) 중 `재미로` 카테고리는 메모리에서 폐기 결정됐는데도 라우트 잔존
- B2B 7개 페이지는 메인 nav에 없음(메모리 정책상 정상) → 그렇다면 **진입 동선이 무엇인지 사용자가 모름**

### 🟠 P1-4. Auth → 어디로? 동선 혼선
`Auth.tsx`:
- session 있으면 `/dashboard`로
- SIGNED_IN 이벤트는 `/needs-assessment`로
- Index는 신규 로그인 시 `PostSignupOnboarding` → 완료 시 `/mind-track`

**3개의 다른 행선지**가 경합 → 첫 사용자 경험에서 가장 뼈아픈 leak.

### 🟡 P2-5. 가격/상품 잔재 & 카피 일관성
- StickyConversionBar 카피 "1분 무료 마음 진단 · 7일 무료 체험" — **메모리에는 7일 무료 체험 정책이 명시되지 않음**(₩19,900 단건 트랙)
- "검사·리포트" 드롭다운에 `/report-generator` PREMIUM 배지가 있지만 단일 상품 BM에선 가격 모호
- 메모리 정책: "₩990/3,900/9,900 폐기" — 이를 참조하는 잔재 코드가 있는지 추가 점검 필요

---

## 3. 강점 (유지·강화 포인트)

1. **HeroSection 페르소나 캐러셀** — 워킹맘/전업맘/아빠/직장인 4종 Before-After 데이터 시각화. SaaS 랜딩 상위 5% 수준.
2. **CopilotBubble + 코파일럿플로우** — Wysa/Calm 대비 차별화된 가이드 시스템.
3. **MindTrack + MyJourney + Weekly/Daily Digest** — 리텐션 인프라가 이미 Calm 수준으로 구축됨.
4. **메모리 기반 가드레일**(가격 하드코딩 금지, 의료법 회피, 화이트 미니멀리즘)이 명문화돼 있음 — 이걸 **실제 코드에 강제**하기만 하면 됨.

---

## 4. 권장 액션 로드맵

### Sprint 1 (1주, 전환율 즉효)
- **CTA 단일화**: 모든 메인 CTA를 `/mind-track` 또는 `/quiz` 중 **하나로 통일**(권장: `/quiz` → 자동으로 `/mind-track` 결제 페이지로 연결되는 1분 진단)
- **Auth 후 라우팅 통합**: Auth.tsx의 `/dashboard`, `/needs-assessment` 분기 제거 → `/mind-track` 단일 경로
- StickyConversionBar 카피 점검: "7일 무료" 표현 제거 또는 메모리에 정책 등재

### Sprint 2 (2주, 브랜드 일관성)
- HeroSection 다크 → 화이트 미니멀로 리디자인 (또는 메모리 Core 수정해 다크 히어로 공식 인정)
- 결과/허브와 톤 일치
- Footer 직전 PartnerTrustSection까지 톤 통일

### Sprint 3 (3주, IA 정리)
- `/pages` 감사: `재미로` 카테고리 라우트 deprecate, NotFound로 리다이렉트
- B2B 7페이지 → `/expert-hiring`의 "기관 제휴" 탭 하위로 묶기(메모리 정책에 부합)
- 사이드바(`AppSidebar.tsx`) 메뉴와 `UnifiedNavigation`의 메뉴 항목 중복/충돌 정리

### Sprint 4 (4주, 데이터 검증)
- analytics--read_project_analytics 로 CTA별 클릭률·`/mind-track` 결제 전환율·이탈 페이지 측정
- 실데이터 기반으로 Sprint 1~3 의사결정 검증

---

## 5. 결정 필요 사항

플랜 승인 시 가장 먼저 착수할 항목을 골라주세요:

1. **CTA 단일화 + Auth 라우팅 통합** (전환율 즉효, 코드 변경 5~7개 파일)
2. **다크/화이트 톤 통일** (브랜드 일관성, HeroSection 리디자인 필요)
3. **B2B/검사 페이지 IA 정리** (장기 유지보수성, 라우트·메뉴 대수술)
4. **분석 데이터 먼저 측정** (의사결정 근거 확보 후 진행)

승인 + 우선순위 알려주시면 그 항목부터 코드 변경에 들어가겠습니다.
