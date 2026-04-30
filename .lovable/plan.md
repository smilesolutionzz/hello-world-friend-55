## 목표

오늘 VC 미팅용 IR Deck을 `AIHPRO_IR_Deck_2026.04.29.pptx` 기반으로 v2 업데이트하여 `/mnt/documents/AIHPRO_IR_Deck_2026.04.30_v2.pptx`로 제공합니다.

## v1 → v2 변경 포인트

1. **로드맵 슬라이드 전면 교체** — 4월 토대 다지기 완료 → 5월 하드닝 스프린트(시드 30~50명 내부 검증) → 6월 GA 정식 론칭(₩19,900 마음트랙 마케팅 ON, 영문판 동시 공개, B2B Job Coach 파일럿 클로징)
2. **트랙션/지표 슬라이드 추가** — v1에서 제외했던 지표 슬라이드를 "보수적 추정치" 라벨로 신설:
   - 5월 내부 KPI: 시드 30~50명, D7 리텐션 ≥ 40%, 결제 후 워크북 D3 진입 ≥ 70% (모두 "내부 추정치" 명시)
   - 6월 KPI 목표: 결제 가입자 150명, 전환율 3%, 상담 사용 비율 20% (모두 "추정치" 라벨)
3. **The Ask 업데이트** — 자금 사용처를 5월 하드닝 + 6월 GA + B2B GTM에 정렬
4. **표지 날짜** — 2026.04.30
5. **나머지 9장(Cover 일부, Problem, Solution, Product, Market, Why Now, BM, Moat, Competition, Team)** — v1 그대로 유지

## 슬라이드 구성 (총 13장, +1)

```text
01 Cover               — 비전 + 2026.04.30
02 Problem             — 한국 멘탈헬스 단편화 (유지)
03 Solution            — 하이브리드(AI×전문가×Human Touch) (유지)
04 Product             — 4 코어 모듈 (유지)
05 Market              — 디지털 멘탈헬스 트렌드 (유지)
06 Why Now             — 추론 AI 성숙 + 인식 변화 (유지)
07 Business Model      — Mind Track 30(₩19,900) → 상담 → B2B (유지)
08 Moat                — 종단 데이터 + 검증 전문가망 + 신뢰 (유지)
09 Competition         — 일반 AI/단발 검사 대비 포지셔닝 (유지)
10 Roadmap (NEW)       — 4월 완료 / 5월 하드닝 / 6월 GA / Q3-Q4
11 Traction (NEW)      — 5·6월 KPI, 모두 "내부 추정치" 라벨
12 Team                — 공동대표 구조 (유지)
13 The Ask             — Use of Funds: 제품/임상망/B2B GTM
```

## 디자인 가이드 (메모리 준수)

- 화이트 미니멀, 골드 액센트 `#C8B88A`
- 한글 본문 Pretendard 계열, 헤드라인 Instrument Serif
- 이모지 금지, Markdown 표 금지, "AI 진단" 표현 금지
- 가격은 `MIND_TRACK_PRICE` 기준 ₩19,900으로만 표기 (구 990/3,900/9,900 절대 금지)
- 모든 정량 수치 슬라이드 하단에 "본 수치는 내부 보수적 추정치이며 실측치가 아닙니다" 디스클레이머 고정

## 작업 순서 (빌드 모드 진입 후)

1. v1 빌드 스크립트(`/tmp/build_ir.js`) 잔존 여부 확인 → 없으면 새로 작성
2. v2 스크립트로 13장 PPTX 생성 (`pptxgenjs`)
3. LibreOffice로 PDF 변환 → `pdftoppm`로 슬라이드별 JPG 추출
4. 13장 전수 시각 QA — 텍스트 잘림/오버랩/저대비/플레이스홀더 잔존 점검, 발견 시 수정 후 재렌더
5. 최종 파일을 `/mnt/documents/AIHPRO_IR_Deck_2026.04.30_v2.pptx`로 저장
6. `<lov-artifact>` 태그로 다운로드 링크 제공

## 산출물

- `/mnt/documents/AIHPRO_IR_Deck_2026.04.30_v2.pptx` (한국어, 13장, Seed/Pre-A 톤, 보수적 추정치 라벨링)
