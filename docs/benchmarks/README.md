# 경쟁사 벤치마크

PMF 비교 대상 4사의 랜딩·가격·핵심 페이지를 **자동으로 캡처**해서 마크다운·스크린샷·브랜딩 토큰을 보관합니다. 디자인/카피/CTA 패턴을 참고할 때 여기를 먼저 봅니다.

## 폴더 구조

```text
docs/benchmarks/
├── README.md                       (이 파일)
├── _scripts/capture.ts             Firecrawl v2 캡처 스크립트
└── {slug}/
    ├── overview.md                 캡처 인덱스 + 분석 노트
    ├── {page}.md                   본문 markdown (onlyMainContent)
    ├── {page}.png                  풀페이지 스크린샷
    └── {page}.branding.json        색/폰트/spacing 토큰
```

## 현재 대상 4사

| Slug         | 회사       | 포지셔닝                           |
| ------------ | ---------- | ---------------------------------- |
| `calm`       | Calm       | 수면·명상 구독 (글로벌 1위)        |
| `wysa`       | Wysa       | AI 챗봇 코칭 + 인간 코치 (글로벌)  |
| `headspace`  | Headspace  | 명상 + 정신건강 B2C/B2B            |
| `mindcafe`   | 마인드카페 | 한국 1:1 비대면 상담 마켓플레이스  |

## 캡처하기

### 신규 캡처 / 갱신

```bash
# 단일 회사
bun docs/benchmarks/_scripts/capture.ts calm \
  landing=https://www.calm.com \
  pricing=https://www.calm.com/subscribe
```

각 페이지마다 `.md`, `.png`, `.branding.json` 3종이 만들어지고, 마지막에 `overview.md`가 갱신됩니다.

### 신규 경쟁사 추가하는 법

1. slug 정한다 (`woebot`, `betterhelp` 등)
2. 위 명령에서 slug와 URL만 바꿔서 실행
3. 끝. 폴더가 자동 생성됩니다.

## 갱신 주기

- **분기 1회** (3·6·9·12월 1주차) 재캡처를 원칙으로 합니다.
- 경쟁사가 큰 리뉴얼을 했다는 신호가 보이면 즉시 재캡처.

## 사용 환경

- `FIRECRAWL_API_KEY` 환경변수 필요 (Lovable Firecrawl 커넥터로 자동 주입됨)
- 페이지 1개당 약 1~2 크레딧 소비
- 결과는 git에 커밋 (스크린샷 포함 — 변화 추적용)

## 분석 워크플로우

1. `overview.md`의 "분석 노트" 섹션에 발견 사항 정리
2. 우리에게 적용할 만한 패턴은 **메모리에 룰로 등록** (`mem://style/...` 또는 `mem://ux/...`)
3. 직접 카피하지 말고, 변형해서 적용 (IP 리스크 방지)
