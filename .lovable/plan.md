## 목표
경쟁사 페이지 구조/카피/디자인을 **언제든 1줄 명령으로 캡처**해서 `docs/benchmarks/`에 표준 포맷으로 저장하는 인프라를 만든다. 매번 수동으로 스크린샷 찍던 작업을 자동화한다.

## 결과물

```text
docs/benchmarks/
├── README.md                          # 사용법 + 갱신 주기
├── _scripts/
│   └── capture.ts                     # Firecrawl 호출 → 마크다운+스크린샷 저장
├── calm/
│   ├── overview.md                    # URL, 캡처일, 1줄 요약
│   ├── landing.md                     # 본문 마크다운 (Firecrawl scrape)
│   ├── landing.png                    # 풀페이지 스크린샷
│   ├── pricing.md / pricing.png
│   └── branding.json                  # 색/폰트 (Firecrawl branding)
├── wysa/        (동일 구조)
├── headspace/   (동일 구조)
└── mindcafe/    (마인드카페, 동일 구조)
```

## 단계

### 1. Firecrawl 커넥터 연결
- `standard_connectors--connect` (connector_id: `firecrawl`) 호출
- 사용자가 picker에서 기존 연결 선택 또는 신규 생성
- 연결 후 `FIRECRAWL_API_KEY`가 자동으로 환경변수로 주입됨

### 2. 캡처 스크립트 작성 (`docs/benchmarks/_scripts/capture.ts`)
Bun으로 실행하는 단일 스크립트:
- 입력: 경쟁사 슬러그(`calm`) + URL 1~N개
- Firecrawl REST v2 직접 호출 (`https://api.firecrawl.dev/v2/scrape`)
- formats: `['markdown', 'screenshot', 'branding']`
- onlyMainContent: true
- 결과를 `docs/benchmarks/{slug}/{page}.{md,png,json}`로 자동 분기 저장
- screenshot은 base64 → PNG 디코딩 후 저장

실행 예:
```
bun docs/benchmarks/_scripts/capture.ts calm \
  landing=https://www.calm.com \
  pricing=https://www.calm.com/subscribe
```

### 3. 4사 초기 캡처 실행
타깃 페이지(각 사 동일 패턴):
- Calm: landing, pricing, app-page
- Wysa: landing, pricing, for-employers
- Headspace: landing, pricing, science
- 마인드카페: landing, pricing, expert-list

### 4. `docs/benchmarks/README.md` 작성
- 폴더 구조 설명
- 캡처 갱신 명령어
- "신규 경쟁사 추가하는 법" 3줄 가이드
- 분석 시 메모리에 어떻게 반영하는지 규칙

### 5. 메모리 등록
`mem://research/competitor-benchmarks-ko` 추가:
- 위치(`docs/benchmarks/`), 갱신 주기(분기), 4사 슬러그
- index.md 1줄 추가

## 비포함 (이번 범위 밖)
- React UI에서 벤치마크 보여주는 페이지 (불필요 — 개발자 참고용)
- 자동 cron / GitHub Actions 스케줄링 (필요해지면 별도)
- 5번째 이상 경쟁사 (구조만 만들고 사용자가 추가)

## 기술 메모
- Firecrawl은 connector gateway를 **사용하지 않는** 직접 API 타입 → `FIRECRAWL_API_KEY` 환경변수로 직접 호출
- 스크립트는 로컬 실행 전용 (브라우저 노출 X) → API 키 안전
- 한 페이지당 약 1~2 크레딧 소비, 4사 × 3페이지 = 약 12 크레딧

## 예상 소요
약 20분 (커넥터 연결 1분 + 스크립트 작성 10분 + 4사 캡처 5분 + README/메모리 4분)
