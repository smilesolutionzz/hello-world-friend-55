import { useEffect, useState, lazy, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, Brain, Baby, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import SEOHead from '@/components/common/SEOHead';

// 두 거대한 페이지를 lazy import → 첫 진입 시 활성 탭만 로드
const Assessment = lazy(() => import('@/pages/Assessment'));
const PremiumAssessment = lazy(() => import('@/pages/PremiumAssessment'));

type TabKey = 'quick' | 'deep' | 'all';

const TABS: { key: TabKey; label: string; sub: string; icon: typeof Sparkles }[] = [
  { key: 'all', label: '전체', sub: '모든 검사 보기', icon: Layers },
  { key: 'quick', label: '무료 빠른 체크', sub: '3분 · 무료', icon: Sparkles },
  { key: 'deep', label: '심층 전문 분석', sub: '10~15분 · 리포트 ₩3,900', icon: Brain },
];

/**
 * `/assessment`와 `/premium-assessment`를 하나의 허브로 통합.
 * - 탭 전환은 내부 state + ?tab= 쿼리로 동기화
 * - 기존 Assessment.tsx / PremiumAssessment.tsx는 변경 없이 그대로 mount
 * - 각 컴포넌트가 자체 SEO/Nav를 가지고 있어 중복 방지를 위해 여기서는 SEO만 최상위 처리
 */
const UnifiedAssessmentHub = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = (searchParams.get('tab') as TabKey) || 'all';
  const [activeTab, setActiveTab] = useState<TabKey>(
    ['quick', 'deep', 'all'].includes(initialTab) ? initialTab : 'all'
  );

  useEffect(() => {
    const t = searchParams.get('tab') as TabKey;
    if (t && ['quick', 'deep', 'all'].includes(t) && t !== activeTab) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    const next = new URLSearchParams(searchParams);
    if (key === 'all') {
      next.delete('tab');
    } else {
      next.set('tab', key);
    }
    setSearchParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SEOHead
        title="심리 검사 통합 허브 | AIHPRO"
        description="무료 빠른 체크부터 임상 통계 기반 심층 분석까지, 한 곳에서 모든 검사를 받아보세요."
        canonicalUrl="https://aihpro.app/assessment"
      />
      <UnifiedNavigation />

      {/* Hero + Tabs */}
      <div className="pt-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-3 border-primary/30 text-primary">
              <Sparkles className="w-3 h-3 mr-1" />
              검사는 모두 무료 · 결과 리포트만 유료
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              마음 건강 검사 허브
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              가볍게 시작해서 깊이 들여다보세요. 검사 결과는 30일 마음 챌린지의 시작점이 됩니다.
            </p>
          </div>

          {/* Tab buttons */}
          <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-3xl mx-auto mb-6">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`relative rounded-xl border p-3 md:p-4 text-left transition-all ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground shadow-md'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                  <p className="font-semibold text-sm md:text-base leading-tight">{tab.label}</p>
                  <p className={`text-[11px] mt-0.5 ${isActive ? 'opacity-90' : 'text-muted-foreground'}`}>
                    {tab.sub}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active panel — 기존 페이지를 그대로 mount */}
      <Suspense
        fallback={
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <div className="-mt-16">
          {/* 음의 마진으로 내부 페이지의 pt-16(자체 nav 자리)와 hero 중복을 시각적으로 줄임 */}
          {activeTab === 'quick' && <Assessment />}
          {activeTab === 'deep' && <PremiumAssessment />}
          {activeTab === 'all' && (
            <>
              <Assessment />
              <div className="border-t border-border my-8" />
              <PremiumAssessment />
            </>
          )}
        </div>
      </Suspense>
    </>
  );
};

export default UnifiedAssessmentHub;
