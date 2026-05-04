# AIHPRO B2B 심화 설계 문서 (파트너용 v2)

기존 `AIHPRO_B2B_파트너_공유_안내서.docx`를 잇는 **심화 편(v2)** 워드 파일을 새로 생성합니다. 두 가지 주제를 깊게 다룹니다.

## 산출물

`/mnt/documents/AIHPRO_B2B_심화설계_v2.docx` (새 파일, 기존 v1과 분리)

## 문서 구조 (2부 구성)

### 1부. HR 대시보드 심화 설계

1. **대시보드의 정체성**
   - HR이 보는 것 vs 보지 못하는 것 (한 줄 원칙)
   - "5명 미만 마스킹"의 사업적 이유 (개인정보보호법 + 직원 신뢰)

2. **집계 기준 (Aggregation Rules)**
   - 집계 단위: 부서(department_code) × 월(report_month)
   - 점수 3종: burnout / stress / satisfaction (avg, p50, p75)
   - 위험도 분포: low / mid / high 비율
   - 참여율 = participated_employees / total_employees
   - 이직 위험 점수 (turnover_risk_score) 산식 개념

3. **익명성 처리 4단계 파이프라인**
   ```
   [개인 응답] → [동의 토글 검사] → [부서 집계 ≥5명] → [HR 노출]
                  share_identity=false 강제
   ```
   - `employee_data_sharing_preferences` 토글별 매핑
   - 5명 미만 자동 마스킹: SQL view 레벨에서 차단
   - 위기 신호(allow_crisis_alert)만 예외적으로 익명 알림

4. **권한·보안 매트릭스**
   - 역할: 직원 / HR / 관리자 / 개발자 (4단계)
   - 테이블 × 역할 × 작업(R/W) 매트릭스 표
   - RLS 정책 핵심 3개 발췌 (employees own / institution staff / admin)
   - 감사 로그 (institution_data_access_logs 활용 방안)

5. **HR 대시보드 화면 구성안**
   - 상단: 4 KPI 카드 (참여율, 평균 번아웃, 고위험 비율, 이직위험)
   - 중단: 부서별 히트맵, 월별 추이 라인차트
   - 하단: AI 요약 카드 + 권장 액션, 위기 알림 배지

### 2부. 데이터 모델 심화

6. **B2B 도메인 ERD (텍스트 다이어그램)**
   ```text
   b2b_partner_institutions (회사)
     ├── employee_organization_links (직원 매핑)
     ├── employee_data_sharing_preferences (동의)
     ├── b2b_jobcoach_employee_sessions (익명 세션)
     └── b2b_jobcoach_team_reports (월간 부서 리포트)

   b2b_jobcoach_plans (요금제 카탈로그)
   b2b_jobcoach_inquiries (도입 문의)
     └── b2b_followup_queue (자동 메일 큐)

   b2b_funnel_events (전환 분석)
   ```

7. **테이블별 필드 사전 (Field Dictionary)**
   - 8개 핵심 테이블 각각:
     - 목적 1줄
     - 주요 필드 5~7개 (타입 / 의미 / 예시)
     - 키 관계
     - RLS 정책 요약

8. **b2b_funnel_events 적재 규칙 (Tracking Spec)**
   - 4개 이벤트 타입: page_view / cta_click / form_start / form_submit
   - 트래킹 대상 페이지 7개 (B2B_PATHS)
   - 세션 ID 생성 규칙 (sessionStorage, 8자 nanoid 변형)
   - 자동 추적: useB2BFunnelAutoTrack
   - 수동 추적: trackB2BEvent('cta_click', path, {button: 'demo'})
   - metadata JSONB 권장 키: button, variant, step, source
   - 적재 비용·인덱스 전략 (4개 인덱스)

9. **분석 지표 카탈로그**
   - 퍼널 단계: View → CTA → Start → Submit (단계별 전환율 정의)
   - 페이지별 전환율 = form_submit / page_view (unique session)
   - 핵심 KPI 5개: MQL 전환율, CPA, 페이지 이탈률, 평균 세션 시간, 리드 → 미팅 전환율
   - get_b2b_funnel_summary RPC 활용법
   - 향후 확장 아이디어: 코호트 분석, A/B 테스트 슬롯

10. **데이터 거버넌스**
    - 보존 기간 정책 (퍼널 90일 / 세션 2년 / 리포트 5년)
    - 직원 탈퇴 시 처리 (left_at + 익명화)
    - GDPR/개인정보보호법 대응 포인트

## 기술 구현

- Node.js + `docx` 라이브러리로 생성
- 폰트: Malgun Gothic, 골드 헤더(#C8B88A)
- 표·다이어그램은 Word 네이티브 표 사용 (마크다운 표 금지)
- 페이지 약 14~18쪽 예상
- 생성 후 PDF 변환 + 페이지별 이미지로 QA (레이아웃·잘림 검증)

## 실행 순서

1. `/tmp/gen_b2b_v2.mjs` 작성 (docx 빌더)
2. `node /tmp/gen_b2b_v2.mjs` → `/mnt/documents/AIHPRO_B2B_심화설계_v2.docx`
3. LibreOffice로 PDF 변환 → 페이지별 PNG → 시각 QA
4. 이슈 발견 시 수정·재생성
5. `<lov-artifact>` 태그로 사용자에게 전달

승인하시면 바로 작성 시작합니다.
