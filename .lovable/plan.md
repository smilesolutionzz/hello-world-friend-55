

## AIHPRO PM 미팅용 1장 PDF 요약본

오늘 개발회사 PM 미팅에서 AIHPRO 플랫폼을 한 장으로 보여줄 수 있는 **A4 1페이지 PDF 브리프**를 만듭니다. 실무 협업용 캐주얼 톤이라 표·다이어그램 위주로 정보 밀도를 높이고, 디자인은 깔끔하게만 갑니다.

### 결과물
- `/mnt/documents/AIHPRO_PM_Brief_v1.pdf` (A4 세로, 1페이지)

### 페이지 구성 (위→아래)

**1. 헤더 (상단 ~12%)**
- 좌: AIHPRO 로고/워드마크 + 한 줄 태그라인 ("AI × 임상통계 기반 발달 코칭 & 의사결정 보조 플랫폼")
- 우: 도메인(aihpro.app), 작성일, "PM 미팅용 브리프 v1"

**2. 제품·기능 구조 (상단 블록, ~30%)**
3열 카드 레이아웃으로 핵심 서비스 묶음 표시:
- **분석/리포트**: 즉석 AI 분석, 20+ 심리검사(체험/프리미엄), AI 리포트 생성기 Pro, My Journey(종단 분석)
- **관찰·상담 데이터**: 관찰일지(텍스트/영상), 금쪽상담소(게임·음성), 변화 추적
- **B2C·B2B 전환**: 전문가 매칭(/expert-hiring), 리워드, B2B Job Coach, 화이트라벨 리포트

각 카드 하단에 대표 라우트(`/report-generator-pro`, `/observation`, `/b2b-jobcoach` 등) 명시.

**3. 기술 스택·아키텍처 (중단 블록, ~30%)**
좌측: 스택 표
| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TS, Tailwind, shadcn/ui, Framer Motion |
| Backend | Lovable Cloud (Supabase) — Postgres + RLS, Edge Functions (Deno) |
| AI | Lovable AI Gateway · Gemini 3 Flash/Pro, Whisper STT, Gemini Vision |
| Payments | Toss Payments (빌링키 자동결제) |
| Infra | Custom domain aihpro.app, Capacitor (모바일 래핑) |

우측: 데이터 흐름 ASCII 다이어그램
```text
User ─▶ React App ─▶ Edge Function ─▶ AI Gateway (Gemini)
                 │                  │
                 ▼                  ▼
          Supabase (RLS)      Polling/DB Save
                 │
                 ▼
        리포트 / 종단분석 / B2B 집계
```
하단 한 줄: "임상 통계 엔진(RCI/SEM/Cronbach α) + 데이터-투-HTML 매핑 아키텍처"

**4. 개발 로드맵·협업 범위 (하단 블록, ~25%)**
2열 구성:

좌 — **현재 상태(Done)**
- MVP 운영 중, 결제·구독·자동갱신 가동
- 리포트 생성기 Pro, My Journey, B2B Job Coach 라이브
- 50개 제휴기관 쇼케이스, 전문가 매칭 운영

우 — **다음 단계 / 협업 요청 영역**
- 모바일 앱 안정화 (Capacitor 빌드·푸시·앱스토어 심사)
- 결제/구독 엣지케이스 QA, Toss 빌링키 장애 복구 로직
- B2B HR 대시보드 고도화 (집계/마스킹 정책)
- 리포트 생성 지연·타임아웃 완화 (DB 폴링 강화)
- 보안: RLS 정책 정기 감사, 스토리지 버킷 권한 점검

**5. 푸터 (~3%)**
- 연락처/도메인, 비의료·코칭 도구 면책 한 줄

### 디자인 가이드
- 톤: 실무 캐주얼. 흰 배경, 골드 액센트(#C8B88A) 최소, 본문은 짙은 회색
- 폰트: ReportLab 기본(Helvetica) — 한글 렌더링을 위해 시스템에 설치된 Pretendard/Noto Sans KR TTF를 등록해서 사용 (없으면 Noto Sans CJK 폴백)
- 카드/표는 얇은 회색 보더, 섹션 헤더만 골드 underline
- 이모지 없음, 임상/AI 표현은 메모리 규칙대로 "전문 분석" 톤 유지

### 기술 구현 계획 (default 모드 진입 후)
1. `/tmp/build_pm_brief.py` 작성 — ReportLab Platypus 기반 A4 1페이지
2. 한글 폰트 등록 (`pdfmetrics.registerFont`) — Pretendard 또는 Noto Sans KR
3. 3개 섹션을 `Table` + `Paragraph`로 조합, 1페이지 안에 들어가도록 폰트/패딩 조정
4. `/mnt/documents/AIHPRO_PM_Brief_v1.pdf` 출력
5. **QA**: `pdftoppm`으로 JPG 변환 → `code--view`로 검사 → 잘림/겹침/한글 깨짐 확인 → 필요 시 수정 후 재생성
6. `<lov-artifact>` 태그로 다운로드 제공

### 확인 사항
- 회사명/대표자명/연락처 같은 식별 정보는 넣지 않고 도메인(aihpro.app)만 표기합니다 (메모리상 닉네임/도메인 원칙).
- 1페이지를 넘기면 안 되므로 위 4개 블록을 정보 우선순위대로 압축합니다. 미팅에서 말로 보강할 항목은 카드 안에 키워드만 남깁니다.

승인해주시면 바로 PDF 생성 + QA 돌려서 다운로드 링크 드릴게요.

