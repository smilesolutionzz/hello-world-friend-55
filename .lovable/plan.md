## 목표

`/b2b-center` 운영자(이수석)가 베타 5곳의 진행 상황을 한 화면에서 보고, 매주 부모 활성률을 판단할 수 있게 하는 **베타 트래커** 페이지를 신설합니다. 이번 작업은 운영/관측 화면만 만들고, 베타 자체 로직(MethodA 공유, 리포트 발행)은 손대지 않습니다.

## 만들 것

### 1. 새 페이지 `/b2b-center/admin/beta-tracker`
운영자(`primary admin`)만 접근. 좌측 사이드바에 "베타 트래커" 메뉴 추가.

**상단 KPI 카드 4개** (이번 주, 월~일 기준 자동 계산)
- 부모 활성률 ⭐ = (리포트 링크를 1회 이상 연 부모 수) ÷ (이번 주 발행된 리포트의 수신 부모 수)
- 이번 주 발행 수 = `center_parent_reports` + 공유된 `therapy_notes` 합계
- 이번 주 사진 업로드 수 = `center_session_uploads` 카운트
- 부모 재방문률 = 같은 부모(phone hash)가 2주 연속 열어본 비율

### 2. 베타 센터 5곳 트래커 테이블
관리자가 어떤 센터를 "베타 5곳"으로 표시할지 토글(`center_organizations.is_beta_partner`). 표시된 센터만 표에 노출.

| 컬럼 | 의미 |
|---|---|
| 센터명 | `center_organizations.name` |
| 코호트 주차 | 베타 시작일(`beta_started_at`)부터 경과 주 |
| 온보딩 상태 | 5단계 setup 위저드 진행률 |
| 첫 사진 업로드 | 날짜 / "아직 없음" |
| 첫 리포트 발행 | 날짜 / "아직 없음" |
| 첫 부모 열람 | 날짜 / "아직 없음" |
| 이번 주 부모 활성률 | % + 색상(50%↑녹, 30↑황, 그 외 적) |
| 비고 | inline 메모 |

행 클릭 → 해당 센터의 주차별 미니 차트(부모 활성률 8주 트렌드).

### 3. 주간 회고 메모
페이지 하단에 "1주차/2주차…" 텍스트 영역 1개. `beta_retros` 테이블에 저장. 매주 금요일 회고를 남기는 용도.

### 4. 사이드바 가시성
`primary admin`(`kijung_kku@naver.com`)일 때만 메뉴 노출. 일반 센터 사용자는 안 보임.

## 데이터 (마이그레이션 1개)

```sql
ALTER TABLE public.center_organizations
  ADD COLUMN IF NOT EXISTS is_beta_partner boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS beta_started_at date,
  ADD COLUMN IF NOT EXISTS beta_notes text;

CREATE TABLE public.beta_retros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL UNIQUE,
  body text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.beta_retros TO authenticated;
GRANT ALL ON public.beta_retros TO service_role;
ALTER TABLE public.beta_retros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "primary admin only" ON public.beta_retros
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

지표는 모두 기존 테이블(`center_parent_reports`, `center_parent_share_links`, `center_session_uploads`, `center_sessions`)에서 클라이언트 집계. 별도 ETL 없음.

## 파일 (예상)
- `supabase/migrations/<ts>_beta_tracker.sql` (마이그레이션 툴)
- `src/pages/b2b-center/admin/BetaTrackerPage.tsx` (신규)
- `src/components/b2b-center/admin/BetaKpiCards.tsx`
- `src/components/b2b-center/admin/BetaCohortTable.tsx`
- `src/components/b2b-center/admin/BetaRetroEditor.tsx`
- `src/hooks/useBetaMetrics.ts` — 주차/지표 집계
- 라우터(`src/App.tsx` 또는 b2b-center 라우터): `/b2b-center/admin/beta-tracker`
- 사이드바: `src/components/b2b-center/AppSidebar.tsx`에 admin-only 항목 추가

## 범위 밖 (이번엔 안 함)
- 자동 알림/이메일
- 부모 인터뷰 수집 폼
- PMF 결정 자동 판정(50%×8주) — 화면에 숫자만 보여주고 판단은 사람이
- 비-운영자 권한 확장
