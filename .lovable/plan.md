# 화이트라벨 ↔ 부모 월간 리포트 실연결 검증 + 연결

## 1. 지금 상태 (조사 결과)

- **저장 경로**: `WhitelabelReportPreviewPage`의 "기관 브랜딩으로 저장" → `center_organizations.branding` JSONB (`{tagline, therapist, logoText, c1, c2, logoBg, logoFg}`) 에 정상 저장. ✅
- **샘플 미리보기 (`SampleParentReport.tsx`)**: 저장된 `branding`을 로드해서 헤더에 적용. ✅
- **실제 발행 경로 — 끊김 ❌**
  - 엣지 `generate-monthly-parent-report` 는 `center_organizations` 에서 `id, name` 만 가져오고 `branding` 컬럼을 무시함.
  - `ParentReportsPage` 의 실제 발행/보기 렌더러와 보호자가 보는 `/r/...` (`GuardianReportView`)에서 `branding` 을 사용하는 코드가 전혀 없음.
  - 즉, **저장은 되지만 발행된 리포트엔 반영되지 않는** 상태. 사용자가 의심한 그대로.

## 2. 할 일

### 2-1. 엣지 함수에서 branding 함께 로드 후 결과에 포함
`supabase/functions/generate-monthly-parent-report/index.ts`
- `center_organizations` select 에 `branding` 추가
- 생성 결과 payload + DB 저장 시 `meta.branding` (또는 `header_branding`) 필드로 함께 기록 → 발행 후에도 그 시점의 브랜딩이 박제되도록 (저장 후 브랜딩이 바뀌어도 과거 리포트는 그대로 유지).

### 2-2. 발행 리포트 렌더러에 branding 적용
- `ParentReportsPage` 의 상세 보기/미리보기 패널 (현재 일반 헤더 사용 중) 에 `SampleParentReport` 와 동일한 헤더 컴포넌트 분리 후 재사용.
- `/r/...` 보호자 공개 뷰 `GuardianReportView` 도 동일 헤더 적용 — `report.meta.branding` 우선, 없으면 `center_organizations.branding` fallback.
- PDF 다운로드도 같은 헤더 거쳐서 나가도록 (기존 `html2pdf` 흐름 그대로, 컴포넌트만 교체).

### 2-3. 공통 헤더 추출
`src/components/b2b-center/WhitelabelHeader.tsx` 신규
- props: `{ centerName, branding, period, therapist? }`
- 3곳에서 공유: `SampleParentReport`, `ParentReportsPage` 상세, `GuardianReportView`.
- 화이트라벨 미리보기 페이지의 인라인 헤더도 같은 컴포넌트로 교체 → 미리보기와 실제 발행이 1픽셀도 다르지 않게 보장.

### 2-4. 저장 후 UX 보강
- "기관 브랜딩으로 저장" 토스트에 **"다음 발행 리포트부터 자동 적용됩니다"** 문구 확정.
- 화이트라벨 페이지에 작은 배너: "최근 발행 리포트 N건에 브랜딩 미적용 — 재발행 시 자동 적용" (선택 — `center_parent_reports` 의 `meta.branding` 없는 것 카운트).

### 2-5. 검증 (사용자 액션 후 확인)
1. 화이트라벨 페이지에서 색상·기관명 변경 → 저장
2. `/b2b-center/app/parent-reports` 에서 임의 클라이언트 4월 리포트 재발행
3. 발행 결과·PDF·`/r/...` 공유 링크 셋 모두 동일 헤더로 보이는지 스크린샷 확인
4. 추가로 브랜딩 한 번 더 바꿔도 **이전 리포트는 박제된 옛 브랜딩** 유지하는지 확인

## 3. 범위 밖 (이번엔 안 함)

- 주간 치료노트 (`generate-weekly-therapy-note`) 에는 일단 적용 안 함 — 같은 패턴으로 한 번 더 작업.
- 로고 이미지 업로드 (현재는 이니셜 텍스트만). 별도 Phase.
- 다국어 헤더 카피.

## 4. 산출물

- `WhitelabelHeader.tsx` 신규
- `SampleParentReport.tsx`, `ParentReportsPage.tsx`, `GuardianReportView.tsx`, `WhitelabelReportPreviewPage.tsx` 4파일 수정
- `generate-monthly-parent-report/index.ts` 수정 (select + 결과 payload에 branding 포함)
- DB 스키마 변경 없음 (`center_organizations.branding`, `center_parent_reports.meta` 둘 다 기존 JSONB 재사용)
