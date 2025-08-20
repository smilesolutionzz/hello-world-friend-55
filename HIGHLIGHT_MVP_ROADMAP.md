# HIGHLIGHT MVP 1주일 구현 로드맵

## 📋 현재 상황 분석
기존 AIHPRO 코드베이스를 활용하여 HIGHLIGHT 플랫폼으로 재구성
- ✅ Supabase 인증 시스템 구축됨
- ✅ 테스트/평가 시스템 기본 구조 존재
- ✅ 결제 시스템 (Stripe/Toss) 구현됨
- ✅ PDF 생성 기능 존재
- ✅ 어드민 기능 기본 구조 존재

## 🗓️ 1주일 개발 스케줄

### Day 1-2: 인증 시스템 & 기본 구조
- [x] Supabase Auth 기본 설정 완료
- [ ] 소셜 로그인 구조 확장 (카카오, 구글)
- [ ] 사용자 프로필 테이블 최적화
- [ ] 반응형 로그인/회원가입 UI 개선

### Day 3-4: 3분 테스트 시스템
- [ ] Typebot 3종 템플릿 연동 구조
- [ ] 테스트 결과 저장 스키마 설계
- [ ] 시각화 컴포넌트 (바차트/레이다차트) 구현
- [ ] 결과 페이지 UI/UX 최적화

### Day 5: PDF & 알림 시스템
- [ ] 기존 PDF 생성 기능 HIGHLIGHT용 커스터마이징
- [ ] AI 분석 + 전문가 피드백 인터페이스
- [ ] 카카오 알림톡 연동 설정

### Day 6: 구독/결제 최적화
- [ ] 기존 결제 시스템을 HIGHLIGHT 플랜에 맞게 수정
- [ ] 무료/유료 플랜 구분 로직
- [ ] 구독 혜택 관리 시스템

### Day 7: 어드민 대시보드 & 테스트
- [ ] 검사 결과 관리 인터페이스
- [ ] 전문가 코멘트 시스템
- [ ] 전체 시스템 통합 테스트

## 📁 추천 폴더 구조

```
src/
├── components/
│   ├── auth/                 # 인증 관련
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── SocialLogin.tsx
│   ├── tests/                # 3분 테스트
│   │   ├── TypebotEmbed.tsx
│   │   ├── TestSelector.tsx
│   │   └── ResultsVisualization.tsx
│   ├── reports/              # 리포트 관련
│   │   ├── PDFGenerator.tsx
│   │   ├── AIAnalysis.tsx
│   │   └── ExpertFeedback.tsx
│   ├── subscription/         # 구독 관련
│   │   ├── PlanSelector.tsx
│   │   ├── PaymentForm.tsx
│   │   └── BenefitsDisplay.tsx
│   └── admin/                # 어드민
│       ├── TestResultsList.tsx
│       ├── UserManagement.tsx
│       └── ExpertDashboard.tsx
├── pages/
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   ├── TestTaking.tsx
│   ├── Results.tsx
│   ├── Subscription.tsx
│   └── Admin.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useSubscription.ts
│   ├── useTestResults.ts
│   └── useTypebot.ts
├── services/
│   ├── typebotService.ts
│   ├── pdfService.ts
│   ├── kakaoService.ts
│   └── subscriptionService.ts
└── types/
    ├── auth.ts
    ├── tests.ts
    ├── subscription.ts
    └── admin.ts
```

## 🗄️ 데이터베이스 스키마 (Supabase)

### 핵심 테이블 설계

```sql
-- 사용자 프로필
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 테스트 유형
CREATE TABLE test_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- '언어검사', '회복력테스트', 'ADHD검사'
  typebot_url TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 3,
  description TEXT
);

-- 테스트 결과
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  test_type_id UUID REFERENCES test_types(id),
  scores JSONB NOT NULL, -- {language: 85, attention: 70, ...}
  raw_data JSONB, -- Typebot 원본 응답
  ai_analysis TEXT,
  expert_feedback TEXT,
  pdf_url TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 구독 관리
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  plan_type TEXT NOT NULL, -- 'free', 'premium'
  status TEXT DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  stripe_subscription_id TEXT
);
```

## 🔧 핵심 기능 구현 우선순위

### 1. 최소 기능 (MVP Core)
- ✅ 이메일 로그인/회원가입
- 🔄 1개 테스트 (ADHD) Typebot 연동
- 🔄 기본 결과 시각화 (바차트)
- 🔄 PDF 다운로드
- 🔄 기본 구독 플랜

### 2. 확장 기능 (Week 2+)
- 소셜 로그인 (카카오, 구글)
- 3종 테스트 완전 연동
- 레이다 차트 시각화
- AI 분석 고도화
- 카카오 알림톡
- 어드민 대시보드 고도화

## 💡 기술 스택 결정

### Frontend
- **React + TypeScript** (기존 유지)
- **Tailwind CSS** (디자인 시스템)
- **Recharts** (차트 라이브러리)
- **React-PDF** (PDF 생성)

### Backend
- **Supabase** (데이터베이스 + 인증)
- **Edge Functions** (서버리스 로직)
- **Stripe** (결제 처리)

### 외부 연동
- **Typebot** (테스트 진행)
- **카카오톡 비즈니스** (알림톡)

## 📈 성공 지표 (MVP 완료 기준)

1. ✅ 사용자가 회원가입 → 테스트 진행 → 결과 확인까지 완주 가능
2. ✅ PDF 리포트 다운로드 정상 작동
3. ✅ 결제 시스템 정상 작동 (테스트 결제)
4. ✅ 반응형 UI (모바일 정상 작동)
5. ✅ 기본 어드민 기능 (결과 조회)

## 🚀 런칭 전 체크리스트

- [ ] 모든 페이지 모바일 최적화 확인
- [ ] 결제 플로우 End-to-End 테스트
- [ ] PDF 생성 속도 및 품질 확인
- [ ] Typebot 임베드 안정성 검증
- [ ] 보안 및 데이터 보호 정책 적용
- [ ] 기본 에러 핸들링 및 로딩 상태 구현

## 💰 예상 개발 비용 (시간 기준)

- **인증 시스템**: 8시간
- **테스트 연동**: 16시간  
- **결과 시각화**: 12시간
- **PDF 생성**: 8시간
- **결제 시스템**: 8시간
- **어드민 기능**: 8시간
- **통합 & 테스트**: 8시간

**총 68시간 (약 1.7주 풀타임)**

---

*이 로드맵은 기존 코드베이스를 최대한 활용하여 빠른 MVP 구현을 목표로 합니다.*