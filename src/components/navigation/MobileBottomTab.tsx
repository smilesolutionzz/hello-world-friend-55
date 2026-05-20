import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, Sparkles, UserRound, LineChart, Users, Play, X, ArrowRight } from 'lucide-react';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useMindTrackDashboard } from '@/hooks/useMindTrackDashboard';
import { trackBottomTabClick, type BottomTabId } from '@/lib/bottomTabAnalytics';

/**
 * 핵심 기능 중심 하단바 (모바일 최적화)
 * - 가운데 "마음 트랙"을 골드 FAB로 강조하여 한눈에 핵심 상품 인지
 * - 큰 아이콘 + 또렷한 라벨로 가독성 확보
 * - 활성 탭은 골드 배경 pill로 시각화
 * - 모든 탭 클릭은 GA + user_analytics_events 에 기록되어 어드민에서 유입 경로 확인 가능
 */
const MobileBottomTab: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reportCredits, isSubscriber } = useAccessControl();
  const { state: mtState } = useMindTrackDashboard();
  const [trackPreviewOpen, setTrackPreviewOpen] = useState(false);

  const hiddenPaths = ['/auth', '/reset-password', '/admin', '/check', '/check/done', '/therapist-subscription', '/find-center'];
  const shouldHide = hiddenPaths.some((p) => location.pathname.startsWith(p));
  if (shouldHide) return null;

  const path = location.pathname;
  const getActiveTab = (): BottomTabId | '' => {
    // 마음 트랙 관련 (별칭/온보딩 포함)
    if (
      path.startsWith('/mind-track') ||
      path.startsWith('/track/') ||
      path.startsWith('/mind-track-workbook') ||
      path.startsWith('/onboarding/mind-track')
    ) return 'track';
    if (
      path.startsWith('/quiz') ||
      path.startsWith('/assessment') ||
      path.startsWith('/concern') ||
      path.startsWith('/free-trial-result')
    ) return 'quiz';
    if (
      path.startsWith('/my-journey') ||
      path.startsWith('/progress') ||
      path.startsWith('/journey')
    ) return 'journey';
    if (
      path.startsWith('/expert-hiring') ||
      path.startsWith('/booking') ||
      path.startsWith('/consultation') ||
      path.startsWith('/expert/') ||
      path.startsWith('/match-consultation')
    ) return 'expert';
    if (
      path.startsWith('/profile') ||
      path.startsWith('/settings') ||
      path.startsWith('/dashboard') ||
      path.startsWith('/rewards') ||
      path.startsWith('/my')
    ) return 'profile';
    return '';
  };

  const activeTab = getActiveTab();

  const navByTab = (tabId: BottomTabId): string => {
    switch (tabId) {
      case 'quiz': return '/quiz';
      case 'track': return '/mind-track';
      case 'journey': return '/my-journey';
      case 'expert': return '/expert-hiring';
      case 'profile': return '/profile';
    }
  };

  const handleTabClick = (tabId: BottomTabId, destination?: string) => {
    const dest = destination ?? navByTab(tabId);
    void trackBottomTabClick({ tab: tabId, destination: dest, from_path: path });
    navigate(dest);
  };

  // ── FAB(마음 트랙) 상태 계산 ─────────────────────────────
  const mtActive = mtState.kind === 'active' ? mtState : null;
  const mtNeedsBaseline = mtState.kind === 'needs_baseline';
  const progressPct = mtActive
    ? Math.round((Math.min(mtActive.completed, mtActive.totalDays) / mtActive.totalDays) * 100)
    : 0;

  const fabBadgeText = mtActive
    ? `${mtActive.currentDay}/${mtActive.totalDays}`
    : mtNeedsBaseline
    ? 'START'
    : !isSubscriber
    ? 'NEW'
    : '';

  const handleFabClick = () => {
    // 상태에 따라 즉시 목적지로 이동 (단, 같은 페이지에 이미 있으면 프리뷰 토글)
    if (mtActive) {
      const dest = '/mind-track/dashboard';
      if (path.startsWith('/mind-track/dashboard')) {
        setTrackPreviewOpen((v) => !v);
        return;
      }
      handleTabClick('track', dest);
      return;
    }
    if (mtNeedsBaseline) {
      const dest = '/mind-track/start';
      if (path.startsWith('/mind-track/start')) {
        setTrackPreviewOpen((v) => !v);
        return;
      }
      handleTabClick('track', dest);
      return;
    }
    handleTabClick('track');
  };

  const closePreview = () => setTrackPreviewOpen(false);

  const goTrackPrimary = () => {
    let dest = '/mind-track';
    if (mtActive) dest = '/mind-track/dashboard';
    else if (mtNeedsBaseline) dest = '/mind-track/start';
    closePreview();
    handleTabClick('track', dest);
  };

  const sideTabs: { id: BottomTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'quiz',    label: 'AI 검사',   icon: Brain },
    { id: 'journey', label: '나의 여정', icon: LineChart },
    { id: 'expert',  label: '전문가',    icon: Users },
    { id: 'profile', label: 'MY',        icon: UserRound },
  ];

  // 좌측 2개 / 가운데 트랙 / 우측 2개로 분할
  const leftTabs = [sideTabs[0], sideTabs[1]];
  const rightTabs = [sideTabs[2], sideTabs[3]];

  const renderTab = (tab: typeof sideTabs[number]) => {
    const isActive = activeTab === tab.id;
    const Icon = tab.icon;
    return (
      <button
        key={tab.id}
        onClick={() => handleTabClick(tab.id)}
        className="relative flex flex-col items-center justify-center gap-1 h-full active:scale-95 transition-transform min-w-[44px] min-h-[44px]"
        aria-label={tab.label}
        aria-current={isActive ? 'page' : undefined}
      >
        <div className={`flex items-center justify-center w-11 h-7 rounded-full transition-colors ${
          isActive ? 'bg-[#C8B88A]/15' : 'bg-transparent'
        }`}>
          <Icon
            className={`w-[22px] h-[22px] ${isActive ? 'text-[#8a7a4d] stroke-[2.4]' : 'text-muted-foreground stroke-[1.8]'}`}
          />
        </div>
        <span className={`text-[11px] leading-none break-keep tracking-tight ${
          isActive ? 'text-[#8a7a4d] font-bold' : 'text-muted-foreground font-medium'
        }`}>
          {tab.label}
        </span>

        {tab.id === 'profile' && reportCredits > 0 && (
          <span className="absolute top-0.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#1a1a1a] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {reportCredits}
          </span>
        )}
      </button>
    );
  };

  const trackActive = activeTab === 'track';

  return (
    <>
      {/* FAB 프리뷰 패널 */}
      {trackPreviewOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={closePreview}
            aria-hidden="true"
          />
          <div
            className="fixed left-3 right-3 z-50 bg-white rounded-2xl shadow-2xl border border-[#C8B88A]/30 p-4 md:hidden animate-in slide-in-from-bottom-2 duration-200"
            style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}
            role="dialog"
            aria-label="마음 트랙 빠른 시작"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-[#8a7a4d]" />
                  <span className="text-[11px] font-bold tracking-wider text-[#8a7a4d]">
                    {mtActive ? '오늘의 마음 트랙' : '마음 트랙 시작하기'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 break-keep">
                  {mtActive
                    ? `Day ${mtActive.currentDay} / ${mtActive.totalDays}`
                    : '기준 데이터로 트랙 시작'}
                </h4>
              </div>
              <button
                onClick={closePreview}
                className="p-1 text-gray-400 hover:text-gray-700"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {mtActive && (
              <div className="mb-3">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#C8B88A] to-[#8a7a4d] transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[11px] text-gray-500">
                  <span>완료 {mtActive.completed}일 · 진행률 {progressPct}%</span>
                  <span>
                    예상 소요 약 {Math.max(1, (mtActive.totalDays - mtActive.completed) * 5)}분/일
                  </span>
                </div>
              </div>
            )}

            {!mtActive && mtNeedsBaseline && (
              <p className="text-xs text-gray-600 break-keep leading-relaxed mb-3">
                결제가 완료됐어요. 기준 데이터를 입력하면 오늘부터 7일 코칭이 시작됩니다 (약 3분 소요).
              </p>
            )}

            <button
              onClick={goTrackPrimary}
              className="w-full bg-gray-900 text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
            >
              <Play className="w-4 h-4 fill-current" />
              {mtActive ? '오늘 미션 바로 시작' : '기준 데이터 입력하고 시작'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#C8B88A]/25 md:hidden"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.25rem)' }}
      >
        <div className="relative grid grid-cols-5 h-16 items-center">
          {/* 좌측 */}
          {leftTabs.map(renderTab)}

          {/* 가운데 FAB: 마음 트랙 (핵심 상품) */}
          <div className="flex items-start justify-center">
            <button
              onClick={handleFabClick}
              aria-label="마음 트랙"
              aria-current={trackActive ? 'page' : undefined}
              aria-expanded={trackPreviewOpen}
              className="relative -mt-7 flex flex-col items-center active:scale-95 transition-transform"
            >
              <div
                className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg ring-4 ring-white transition-all ${
                  trackActive
                    ? 'bg-gradient-to-br from-[#C8B88A] to-[#8a7a4d]'
                    : 'bg-gradient-to-br from-[#1a1a1a] to-[#3a3a3a]'
                }`}
              >
                <Sparkles className="w-6 h-6 text-white stroke-[2.2]" />
                {/* 진행률 링 (활성 트랙일 때) */}
                {mtActive && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 56 56">
                    <circle
                      cx="28" cy="28" r="26"
                      fill="none"
                      stroke="#C8B88A"
                      strokeWidth="2.5"
                      strokeDasharray={`${(progressPct / 100) * 163.36} 163.36`}
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                  </svg>
                )}
              </div>
              <span className={`mt-1 text-[11px] leading-none font-bold break-keep tracking-tight ${
                trackActive ? 'text-[#8a7a4d]' : 'text-[#1a1a1a]'
              }`}>
                마음 트랙
              </span>

              {fabBadgeText && (
                <span className={`absolute -top-2 right-0 translate-x-1/3 px-1.5 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center shadow-sm whitespace-nowrap ${
                  mtActive ? 'bg-[#8a7a4d]' : 'bg-[#C8B88A]'
                }`}>
                  {fabBadgeText}
                </span>
              )}
            </button>
          </div>

          {/* 우측 */}
          {rightTabs.map(renderTab)}
        </div>
      </nav>
    </>
  );
};

export { MobileBottomTab };
export default MobileBottomTab;
