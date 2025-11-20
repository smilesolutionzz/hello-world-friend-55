# 📊 분석 도구 설정 가이드

## 🎯 개요

이 프로젝트에는 다음 분석 도구들이 통합되어 있습니다:
1. **Google Analytics 4** - 트래픽 및 전환 분석
2. **Hotjar** - 사용자 행동 녹화 및 히트맵
3. **Microsoft Clarity** - 사용자 세션 녹화
4. **Supabase 자체 분석** - 커스텀 이벤트 트래킹
5. **A/B 테스트** - 실험 및 변형 테스트

---

## 📝 1단계: 각 서비스 계정 생성

### Google Analytics 4
1. [Google Analytics](https://analytics.google.com/) 접속
2. 새 속성 만들기
3. 측정 ID 확인 (형식: `G-XXXXXXXXXX`)

### Hotjar
1. [Hotjar](https://www.hotjar.com/) 가입
2. 새 사이트 추가
3. Site ID 확인 (숫자만)

### Microsoft Clarity
1. [Clarity](https://clarity.microsoft.com/) 가입
2. 새 프로젝트 생성
3. Project ID 확인

---

## 🔧 2단계: 환경 변수 설정

프로젝트 Settings → Secrets에서 다음 환경변수를 추가하세요:

```bash
# Google Analytics 4
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Hotjar
VITE_HOTJAR_SITE_ID=0000000

# Microsoft Clarity
VITE_CLARITY_PROJECT_ID=XXXXXXXXXX
```

---

## 📋 3단계: index.html 스크립트 업데이트

`index.html` 파일에서 다음 3곳의 플레이스홀더를 실제 ID로 교체하세요:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  gtag('config', 'G-XXXXXXXXXX', {  <!-- 여기를 실제 ID로 변경 -->
    page_path: window.location.pathname,
  });
</script>

<!-- Hotjar -->
<script>
  h._hjSettings={hjid:0000000,hjsv:6};  <!-- 여기를 실제 숫자로 변경 -->
</script>

<!-- Microsoft Clarity -->
<script>
  })(window, document, "clarity", "script", "XXXXXXXXXX");  <!-- 여기를 실제 ID로 변경 -->
</script>
```

---

## 🎯 4단계: 추적되는 이벤트 확인

### 자동 추적 이벤트
- ✅ 페이지 뷰
- ✅ 검사 시작
- ✅ 검사 완료
- ✅ 결과 확인
- ✅ 전문가 연결 클릭
- ✅ 결제 페이지 방문
- ✅ 결제 완료

### 커스텀 이벤트 추가 방법

```typescript
import { trackEvent } from '@/components/common/Analytics';
import { useEventTracking } from '@/hooks/useEventTracking';

// GA4, Hotjar, Clarity에 이벤트 전송
trackEvent('custom_event_name', {
  custom_param1: 'value1',
  custom_param2: 'value2'
});

// Supabase DB에도 저장하려면
const { trackEvent: trackToSupabase } = useEventTracking();
trackToSupabase('custom_event', { /* properties */ });
```

---

## 🧪 5단계: A/B 테스트 설정

### 데이터베이스에 실험 추가

Supabase Dashboard → `ab_test_experiments` 테이블에서:

```sql
INSERT INTO ab_test_experiments (
  experiment_name,
  is_active,
  variants,
  target_metric
) VALUES (
  'hero_cta_test',
  true,
  '[
    {"id": "control", "name": "control", "weight": 50},
    {"id": "variant_a", "name": "variant_a", "weight": 50}
  ]',
  'conversion_rate'
);
```

### 코드에서 사용

```typescript
import { useABTest } from '@/hooks/useABTest';

function MyComponent() {
  const { variant, isLoading, trackConversion } = useABTest('hero_cta_test');

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {variant === 'control' && <Button>기존 버튼</Button>}
      {variant === 'variant_a' && <Button>새로운 버튼</Button>}
      
      <button onClick={() => trackConversion('click', 1)}>
        전환 추적
      </button>
    </div>
  );
}
```

---

## 📊 6단계: 전환 퍼널 분석

### Supabase에서 쿼리

```sql
-- 페이지별 방문자 수
SELECT 
  page_path,
  COUNT(DISTINCT session_id) as visitors,
  COUNT(*) as page_views
FROM user_analytics_events
WHERE event_name = 'page_view'
GROUP BY page_path
ORDER BY visitors DESC;

-- 전환 퍼널 분석
WITH funnel AS (
  SELECT 
    session_id,
    MAX(CASE WHEN event_name = 'page_view' AND page_path = '/' THEN 1 ELSE 0 END) as visited_home,
    MAX(CASE WHEN event_name = 'funnel_assessment_start' THEN 1 ELSE 0 END) as started_test,
    MAX(CASE WHEN event_name = 'test_completed' THEN 1 ELSE 0 END) as completed_test,
    MAX(CASE WHEN event_name = 'funnel_payment_complete' THEN 1 ELSE 0 END) as paid
  FROM user_analytics_events
  GROUP BY session_id
)
SELECT 
  SUM(visited_home) as total_visitors,
  SUM(started_test) as test_starters,
  SUM(completed_test) as test_completers,
  SUM(paid) as paying_customers,
  ROUND(100.0 * SUM(started_test) / NULLIF(SUM(visited_home), 0), 2) as start_rate,
  ROUND(100.0 * SUM(completed_test) / NULLIF(SUM(started_test), 0), 2) as completion_rate,
  ROUND(100.0 * SUM(paid) / NULLIF(SUM(completed_test), 0), 2) as conversion_rate
FROM funnel;

-- A/B 테스트 결과 분석
SELECT 
  event_properties->>'experiment_name' as experiment,
  event_properties->>'variant' as variant,
  COUNT(DISTINCT CASE WHEN event_name = 'ab_test_assigned' THEN session_id END) as assigned_users,
  COUNT(DISTINCT CASE WHEN event_name = 'ab_test_conversion' THEN session_id END) as converted_users,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN event_name = 'ab_test_conversion' THEN session_id END) / 
    NULLIF(COUNT(DISTINCT CASE WHEN event_name = 'ab_test_assigned' THEN session_id END), 0), 2) as conversion_rate
FROM user_analytics_events
WHERE event_name IN ('ab_test_assigned', 'ab_test_conversion')
GROUP BY 1, 2
ORDER BY 1, 2;
```

---

## ✅ 7단계: 확인 사항

### 개발 환경에서 테스트
1. 콘솔에서 `📊 Page View:` 로그 확인
2. 콘솔에서 `📊 Event:` 로그 확인
3. Supabase `user_analytics_events` 테이블에 데이터 저장 확인

### 프로덕션 배포 후
1. Google Analytics 실시간 보고서 확인
2. Hotjar 녹화 시작 확인
3. Clarity 세션 녹화 확인

---

## 🎓 추가 리소스

- [Google Analytics 4 문서](https://support.google.com/analytics/answer/10089681)
- [Hotjar 가이드](https://help.hotjar.com/)
- [Microsoft Clarity 문서](https://learn.microsoft.com/en-us/clarity/)
- [Supabase 분석 가이드](https://supabase.com/docs/guides/platform/metrics)

---

## 🚨 주의사항

1. **개인정보 보호**: 민감한 개인정보는 절대 이벤트에 포함하지 마세요
2. **동의 관리**: 사용자에게 쿠키/분석 도구 사용 동의를 받으세요
3. **비용 관리**: Hotjar, Clarity는 무료 플랜 제한이 있으니 확인하세요
4. **성능 영향**: 너무 많은 이벤트 추적은 성능에 영향을 줄 수 있습니다

---

## 📞 문제 해결

### 이벤트가 추적되지 않는 경우
1. 콘솔 로그 확인
2. 네트워크 탭에서 API 호출 확인
3. Supabase 테이블 권한 확인
4. 환경변수가 제대로 설정되었는지 확인

### A/B 테스트가 작동하지 않는 경우
1. `ab_test_experiments` 테이블에 데이터가 있는지 확인
2. `is_active`가 `true`인지 확인
3. LocalStorage에 할당된 variant 확인
4. 브라우저 콘솔에서 에러 확인
