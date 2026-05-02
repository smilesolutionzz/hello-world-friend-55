import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Calendar, CheckCircle2, ArrowRight, Award, BarChart3,
  Shield, Zap, Loader2, Lightbulb, Target, Heart, MessageSquareHeart, Wand2,
  BookOpen, Eye, FileText, Lock,
} from 'lucide-react';
import { WORKBOOK_CHAPTERS } from '@/lib/mindTrackChapters';
import WorkbookSamplePreviewModal from '@/components/mind-track/WorkbookSamplePreviewModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import Footer from '@/components/ui/footer';
import SEOHead from '@/components/common/SEOHead';
import CoachingBadge from '@/components/branding/CoachingBadge';
import { MedicalDisclaimer } from '@/components/legal/MedicalDisclaimer';
import HumanTouchManifesto from '@/components/branding/HumanTouchManifesto';
import { SmartScrollReveal } from '@/components/ui/smart-scroll-reveal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trackEvent } from '@/components/common/Analytics';
import { trackWorkbookFunnel } from '@/lib/workbookFunnelTracking';
import ChildDevConcernSection from '@/components/mind-track/ChildDevConcernSection';
import { getDayCopy, calcMindTrackCurrentDay } from '@/lib/mindTrackDayCopy';
// 결제자는 /mind-track/dashboard 전용 페이지로 자동 리다이렉트됨 (아래 분기 참고)

const TRACK_PRICE = 19900;

const focusGoals = [
  { id: 'sleep', icon: '🌙', title: '깊은 수면 회복', desc: '잠 못 드는 밤, 무거운 아침에서 벗어나기' },
  { id: 'stress', icon: '🌿', title: '스트레스 다스리기', desc: '일상 속 긴장과 압박감을 다루는 힘 기르기' },
  { id: 'mood', icon: '☀️', title: '감정 안정', desc: '오르내리는 기분을 부드럽게 조율하기' },
  { id: 'focus', icon: '🎯', title: '집중력 회복', desc: '산만함을 줄이고 일상 효율 끌어올리기' },
  { id: 'relationship', icon: '🤝', title: '관계 개선', desc: '가족·동료와의 소통 결을 다듬기' },
  { id: 'self', icon: '🪞', title: '자기 이해 심화', desc: '내 패턴을 알고 새로운 루틴 만들기' },
  { id: 'parenting', icon: '🤱', title: '육아 번아웃 회복', desc: '엄마·아빠의 지친 마음을 회복하는 30일' },
  { id: 'child_development', icon: '🌱', title: '아이 발달 코칭', desc: '연령별 발달 포인트와 부모 대응법 익히기' },
  { id: 'family_communication', icon: '💕', title: '아이와의 소통', desc: '훈육 갈등 줄이고 안정 애착 만들기' },
];

const dailyFlow = [
  { day: '1일차', title: '나의 출발점 기록', desc: '간단한 셀프 체크로 지금의 나를 정리' },
  { day: '2~7일차', title: '하루 3분 마음 루틴', desc: '맞춤 마이크로 액션을 매일 안내' },
  { day: '8~21일차', title: '실천하며 기록하기', desc: '매일 체크인 + 주간 인사이트 정리본' },
  { day: '22~29일차', title: '깊이 있는 코칭', desc: '맞춤 워크북과 AI 코파일럿 1:1 대화' },
  { day: '30일차', title: '나의 변화 리포트', desc: '시작과 지금을 비교하고 다음 한 달 가이드' },
];

interface ConcernReport {
  summary: string;
  rootCauses: string[];
  currentState: { stress: number; energy: number; clarity: number };
  quickActions: string[];
  trackRecommendation: {
    matchedGoal: string;
    reason: string;
    expectedChange: string;
  };
}

const MindTrack: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [postLoginRedirecting, setPostLoginRedirecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [sampleOpen, setSampleOpen] = useState(false);
  const [sampleSeed, setSampleSeed] = useState<{
    nickname?: string;
    trackTheme?: string;
    currentDay?: number;
    checkins?: any[];
    baselines?: any[];
  }>({});
  const sampleOpenedAtRef = React.useRef<number | null>(null);

  // 현재 URL이 별칭(/mind-track-workbook)인지 표준(/mind-track/workbook)인지 감지해
  // 워크북 이동 시 같은 형식 유지 — referrer 기반 일관성 확보
  const workbookBase = (() => {
    try {
      // location.pathname 또는 referrer 둘 다 체크
      const ref = typeof document !== 'undefined' ? document.referrer : '';
      if (location.pathname.startsWith('/mind-track-workbook')) return '/mind-track-workbook';
      if (ref.includes('/mind-track-workbook')) return '/mind-track-workbook';
      return '/mind-track/workbook';
    } catch {
      return '/mind-track/workbook';
    }
  })();
  const buildWorkbookUrl = (day: number, openMission = true) => {
    const params = new URLSearchParams();
    params.set('day', String(day));
    if (openMission) params.set('openMission', '1');
    return `${workbookBase}?${params.toString()}`;
  };

  // 진행 중인 30일 트랙 등록 정보 (있으면 개인화 배너 노출)
  const [activeEnrollment, setActiveEnrollment] = useState<{
    id: string;
    started_at: string;
    current_day: number;
    status: string;
    goal_focus: string | null;
    payment_status: string;
  } | null>(null);

  // 고민 진단 리포트
  const [concern, setConcern] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [report, setReport] = useState<ConcernReport | null>(null);
  const [polishing, setPolishing] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const examplePlaceholders = [
    '예) 요즘 잠자리에 누우면 잡생각이 멈추질 않고, 아침마다 너무 무기력해요...',
    '예) 회사에서 작은 일에도 짜증이 나고, 퇴근 후엔 아무것도 하기 싫어요.',
    '예) 아이가 말을 안 듣는데 화부터 나서, 그러고 나면 또 죄책감이 들어요.',
    '예) 사람들 앞에 서면 심장이 두근거리고 머릿속이 하얘져요.',
    '예) 미래가 막막해서 자꾸 불안하고, 작은 일도 결정하기가 힘들어요.',
    '예) 남편(아내)과 대화만 하면 싸우게 되고, 점점 거리감이 느껴져요.',
    '예) 다이어트를 시작했다가 무너지고를 반복해서 자존감이 바닥이에요.',
    '예) 친구 관계에서 자꾸 눈치를 보게 되고, 진짜 내 모습을 잃은 것 같아요.',
  ];

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      setAuthChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setAuthChecking(false);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // 진행 중인 등록 정보 fetch (있으면 개인화 배너)
  useEffect(() => {
    if (!user?.id) {
      setActiveEnrollment(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('mind_track_enrollments')
        .select('id, started_at, current_day, status, goal_focus, payment_status')
        .eq('user_id', user.id)
        .in('status', ['active', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.warn('[mind-track] enrollment fetch error:', error.message);
        return;
      }
      setActiveEnrollment(data ?? null);

      // 로그인 직후(?postLogin=1) + 결제 완료 enrollment가 있으면
      // → 안내 문구 노출 후 자동으로 워크북 해당 일차로 이동
      const postLogin = new URLSearchParams(location.search).get('postLogin') === '1';
      if (postLogin && data && data.payment_status === 'paid') {
        setPostLoginRedirecting(true);
        const day = calcMindTrackCurrentDay(data.started_at);
        setTimeout(() => {
          navigate(buildWorkbookUrl(day, true), { replace: true });
        }, 1200);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // 워크북 샘플 미리보기 — 닉네임/목표/체크인을 자동 주입 (동적 개인화)
  const openSamplePreview = async () => {
    sampleOpenedAtRef.current = Date.now();
    trackWorkbookFunnel('mt_workbook_sample_open', {
      logged_in: !!user?.id,
      has_active_enrollment: !!activeEnrollment,
      source: 'mind_track_lock_card',
    });
    // 비로그인: 모달만 샘플로 열기
    if (!user?.id) {
      setSampleSeed({ currentDay: 1 });
      setSampleOpen(true);
      return;
    }
    setSampleOpen(true);
    try {
      // 닉네임
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, nickname')
        .eq('user_id', user.id)
        .maybeSingle();

      // 온보딩 데이터 (목표 + concern + 기상시간 등)
      const { data: onboarding } = await supabase
        .from('user_onboarding_data')
        .select('primary_goal, free_text_concern')
        .eq('user_id', user.id)
        .maybeSingle();

      const goalId = activeEnrollment?.goal_focus || (onboarding as any)?.primary_goal;
      const matchedGoal = focusGoals.find((g) => g.id === goalId);
      const trackTheme = matchedGoal
        ? `${matchedGoal.title} · ${matchedGoal.desc}`
        : undefined;

      let checkins: any[] = [];
      let baselines: any[] = [];
      let currentDay = 1;

      if (activeEnrollment?.id) {
        currentDay = activeEnrollment.current_day || calcMindTrackCurrentDay(activeEnrollment.started_at) || 1;
        const sb: any = supabase;
        const [chkRes, bslRes] = await Promise.all([
          sb
            .from('mind_track_daily_checkins')
            .select('day_number, mood_score, energy_score, clarity_score, reflection_text, completed, created_at')
            .eq('enrollment_id', activeEnrollment.id)
            .order('day_number', { ascending: true }),
          sb
            .from('mind_track_baselines')
            .select('measurement_point, stress_score, energy_score, clarity_score')
            .eq('enrollment_id', activeEnrollment.id),
        ]);
        checkins = chkRes?.data || [];
        baselines = bslRes?.data || [];
      }

      const nickname =
        (profile as any)?.display_name ||
        (profile as any)?.nickname ||
        (onboarding as any)?.free_text_concern?.slice(0, 0) || // intentionally noop
        user?.email?.split('@')[0] ||
        '당신';

      setSampleSeed({ nickname, trackTheme, currentDay, checkins, baselines });
    } catch (e) {
      console.warn('[mind-track] sample seed load failed', e);
    }
  };

  const handleSampleOpenChange = (v: boolean) => {
    if (!v && sampleOpen && sampleOpenedAtRef.current) {
      const dwellMs = Date.now() - sampleOpenedAtRef.current;
      trackEvent('mt_workbook_sample_complete', {
        dwell_ms: dwellMs,
        dwell_seconds: Math.round(dwellMs / 1000),
        viewed_full: dwellMs > 8000,
        logged_in: !!user?.id,
      });
      sampleOpenedAtRef.current = null;
    }
    setSampleOpen(v);
  };

  const handleStartCtaClick = (location: string) => {
    trackEvent('mt_workbook_sample_cta_click', {
      cta_location: location,
      sample_open: sampleOpen,
      logged_in: !!user?.id,
      price: TRACK_PRICE,
    });
  };

  // 입력값이 비어있을 때만 5초마다 예시 placeholder 회전
  useEffect(() => {
    if (concern.length > 0) return;
    const t = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % examplePlaceholders.length);
    }, 5000);
    return () => clearInterval(t);
  }, [concern.length, examplePlaceholders.length]);

  const handlePolish = async () => {
    if (concern.trim().length < 2) {
      toast.error('다듬을 내용을 조금 더 적어주세요');
      return;
    }
    setPolishing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'mind-track-concern-polish',
        { body: { concern: concern.trim() } }
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.polished) {
        setConcern(data.polished);
        toast.success('AI가 자연스럽게 다듬었어요');
      }
    } catch (e: any) {
      toast.error(e.message || '다듬기에 실패했습니다');
    } finally {
      setPolishing(false);
    }
  };

  const handleGenerateReport = async () => {
    if (concern.trim().length < 5) {
      toast.error('고민을 조금 더 자세히 적어주세요 (5자 이상)');
      return;
    }
    setReportLoading(true);
    setReport(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        'mind-track-concern-report',
        { body: { concern: concern.trim(), goal: selectedGoal } }
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setReport(data as ConcernReport);

      // AI가 추천한 목표를 자동 선택
      if (data?.trackRecommendation?.matchedGoal) {
        setSelectedGoal(data.trackRecommendation.matchedGoal);
      }

      // 결과 섹션으로 부드럽게 스크롤
      setTimeout(() => {
        document.getElementById('concern-report-result')?.scrollIntoView({
          behavior: 'smooth', block: 'start',
        });
      }, 200);
    } catch (e: any) {
      toast.error(e.message || '리포트 생성에 실패했습니다');
    } finally {
      setReportLoading(false);
    }
  };

  const handleStart = async () => {
    if (!selectedGoal) {
      toast.error('먼저 집중 목표를 하나 선택해주세요');
      return;
    }
    if (!user) {
      navigate('/auth?redirect=' + encodeURIComponent('/mind-track?postLogin=1'));
      return;
    }
    setLoading(true);
    try {
      const { ensureMindTrackEnrollment } = await import('@/lib/mindTrackEnrollment');
      const res = await ensureMindTrackEnrollment({ goal: selectedGoal, concern });
      if (!res.enrollmentId) throw new Error(res.error || '등록 실패');
      toast.success('등록 완료! 결제 페이지로 이동합니다.');
      navigate('/pricing?product=mind_track_30');
    } catch (e: any) {
      toast.error(e.message || '등록 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const recommendedGoal = report
    ? focusGoals.find((g) => g.id === report.trackRecommendation.matchedGoal)
    : null;

  // ──────────────────────────────────────────────────────────
  // 결제 완료 사용자 → /mind-track/dashboard 전용 페이지로 자동 리다이렉트
  // 마케팅 페이지(/mind-track)는 비결제자 전용으로 완전 분리
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (
      activeEnrollment &&
      (activeEnrollment.payment_status === 'paid' ||
        activeEnrollment.payment_status === 'completed') &&
      !postLoginRedirecting
    ) {
      navigate('/mind-track/dashboard', { replace: true });
    }
  }, [activeEnrollment?.id, activeEnrollment?.payment_status, postLoginRedirecting, navigate]);

  // 리다이렉트 직전 깜빡임 방지 — 결제자면 빈 화면 반환
  if (
    activeEnrollment &&
    (activeEnrollment.payment_status === 'paid' ||
      activeEnrollment.payment_status === 'completed') &&
    !postLoginRedirecting
  ) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="30일 마음 변화 트랙 · 무료 고민 리포트"
        description="고민을 적으면 즉석 마음 리포트가 나오고, 나에게 맞춤 30일 변화 트랙을 제안받을 수 있어요."
        canonicalUrl="https://aihpro.app/mind-track"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
        <UnifiedNavigation />

        {/* 로그인 후 자동 이동 안내 — postLogin=1 + 결제 enrollment 존재 시 */}
        {postLoginRedirecting && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-blue-200 shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <div className="text-sm font-bold text-slate-900">로그인 완료 · 다음 단계로 이동 중…</div>
              <div className="text-[11px] text-slate-500">진행 중인 워크북 일차로 이동합니다</div>
            </div>
          </div>
        )}

        {/* 인증 확인 중 안내 (최초 진입 시 잠깐) */}
        {authChecking && (
          <div className="fixed top-20 right-4 z-40 bg-white border border-slate-200 shadow rounded-xl px-3 py-2 text-xs text-slate-600 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            로그인 상태 확인 중…
          </div>
        )}

        {/* 개발용 디버그 토글 (우하단 floating) — 운영자/QA 확인용 */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowDebug((v) => !v)}
            className="text-[10px] text-slate-400 hover:text-slate-700 bg-white/80 backdrop-blur border border-slate-200 rounded-full px-2 py-1 shadow-sm"
            aria-label="MindTrack 디버그 정보 토글"
          >
            {showDebug ? '× 디버그 닫기' : '🛠 MT 디버그'}
          </button>
          {showDebug && (
            <div className="mt-2 bg-slate-900 text-slate-100 text-[11px] font-mono rounded-xl p-3 shadow-2xl max-w-[280px] space-y-1">
              <div>user: {user?.id?.slice(0, 8) ?? '(none)'}</div>
              <div>auth checking: {String(authChecking)}</div>
              <div>enrollment: {activeEnrollment?.id?.slice(0, 8) ?? '(none)'}</div>
              <div>payment: {activeEnrollment?.payment_status ?? '-'}</div>
              <div>started_at: {activeEnrollment?.started_at ?? '-'}</div>
              <div>
                computed day:{' '}
                {activeEnrollment?.started_at
                  ? calcMindTrackCurrentDay(activeEnrollment.started_at)
                  : '-'}
              </div>
              <div>now: {new Date().toISOString()}</div>
              <div>workbook base: {workbookBase}</div>
              <div>postLogin: {String(postLoginRedirecting)}</div>
            </div>
          )}
        </div>

        {/* ────────────────────────────────────────────────────────
            진입 헤더 (Hero 위, 항상 노출) — 사용자 상태별 안내
            1) 진행 중(결제 완료): Day N/30 + 다음 미션 카드
            2) 결제했으나 baseline 미완료: 워크북 시작 카드
            3) 비로그인/미결제: 락 처리된 "구독 후 이용 가능" 안내
           ──────────────────────────────────────────────────────── */}
        <section className="px-4 pt-24 pb-6">
          <div className="max-w-3xl mx-auto">
            {(() => {
              // 1) 진행 중 — 가장 강력한 우선순위
              if (activeEnrollment && activeEnrollment.payment_status === 'paid') {
                const day = calcMindTrackCurrentDay(activeEnrollment.started_at);
                const copy = getDayCopy(day);
                const progressPct = Math.round((day / 30) * 100);
                return (
                  <div className="bg-white rounded-3xl border border-[#C8B88A]/40 ring-1 ring-[#C8B88A]/15 shadow-sm p-6 md:p-7 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-emerald-500/15 text-emerald-700 border-0 text-xs">
                          진행 중
                        </Badge>
                        <span className="text-[11px] font-semibold tracking-wider text-[#8a7a4d] uppercase">
                          Day {String(day).padStart(2, '0')} / 30 · {copy.phase}
                        </span>
                      </div>
                      <span className="text-xs text-foreground/60">{progressPct}% 완료</span>
                    </div>
                    <Progress value={progressPct} className="h-1.5" />
                    <div className="space-y-1.5">
                      <h2 className="text-xl md:text-2xl font-bold text-foreground break-keep leading-snug">
                        오늘의 미션 · {copy.title}
                      </h2>
                      <p className="text-sm md:text-base text-foreground/70 break-keep leading-relaxed">
                        {copy.description}
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate(buildWorkbookUrl(day, true))}
                      className="w-full h-12 text-base font-bold bg-[#1a1a1a] text-white hover:bg-black rounded-xl"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Day {String(day).padStart(2, '0')} 미션 시작
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <p className="text-[11px] text-foreground/50 text-center">
                      시작일 {new Date(activeEnrollment.started_at).toLocaleDateString('ko-KR')} 기준 · 매일 자정에 다음 일차로 자동 이동
                    </p>
                  </div>
                );
              }

              // 2) 로그인 + 결제했으나 enrollment 없음 (이론상 드묾) → 안내 카드
              // 3) 비로그인/미결제 — 통일된 "구독 후 이용 가능" 락 안내
              const isLoggedIn = !!user && !authChecking;
              return (
                <div className="bg-white rounded-3xl border border-[#C8B88A]/40 ring-1 ring-[#C8B88A]/15 shadow-sm p-6 md:p-7">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#C8B88A]/15 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-[#8a7a4d]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold tracking-wider text-[#8a7a4d] uppercase">
                        30 Day Mind Track
                      </p>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground break-keep leading-snug">
                        하루 3분, 30일 마음 변화 트랙
                      </h2>
                      <p className="text-sm text-foreground/70 mt-1 break-keep">
                        Day 01부터 Day 30까지 매일 맞춤 미션과 코칭 인사이트를 받아보세요.
                      </p>
                    </div>
                  </div>

                  {/* 30일 미리보기 — 항상 동일하게 보이는 락 처리 */}
                  <div className="grid grid-cols-10 gap-1 mb-4">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-md bg-[#FAF8F2] border border-[#C8B88A]/20 flex items-center justify-center text-[9px] font-semibold text-[#C8B88A]"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </div>
                    ))}
                  </div>

                  {/* 워크북 샘플 — 결제 전환 부스터 */}
                  <div className="mt-5 rounded-2xl border border-[#C8B88A]/30 bg-gradient-to-br from-[#FBF9F2] to-white p-4 md:p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#C8B88A]/20 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4.5 h-4.5 text-[#8a7a4d]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold tracking-wider text-[#8a7a4d] uppercase">
                            Workbook Preview
                          </p>
                          <h3 className="text-base md:text-lg font-bold text-foreground break-keep leading-snug">
                            30일 후 손에 남는 워크북 (PDF · A4 30+면)
                          </h3>
                          <p className="text-xs text-foreground/60 mt-0.5 break-keep">
                            매일 체크인이 한 권의 책으로 자동 정리돼요. 표지부터 졸업장까지 7개 챕터.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 챕터 목차 — 7장 한눈에 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      {WORKBOOK_CHAPTERS.slice(0, 7).map((ch, idx) => {
                        const Icon = ch.icon;
                        return (
                          <div
                            key={ch.id}
                            className="relative rounded-xl border border-[#C8B88A]/25 bg-white px-2.5 py-2 flex items-start gap-1.5"
                          >
                            <div className="w-6 h-6 rounded-md bg-[#FAF8F2] flex items-center justify-center shrink-0">
                              <Icon className="w-3 h-3 text-[#8a7a4d]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] font-mono text-[#C8B88A] tracking-wider">
                                CH {ch.chapterNo}
                              </p>
                              <p className="text-[11px] font-semibold text-foreground/85 leading-tight break-keep">
                                {ch.shortTitle}
                              </p>
                            </div>
                            {idx > 0 && (
                              <Lock className="absolute top-1.5 right-1.5 w-2.5 h-2.5 text-[#C8B88A]/60" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-[#C8B88A]/15">
                      <div className="flex items-center gap-1.5 text-[11px] text-foreground/55">
                        <FileText className="w-3 h-3" />
                        <span>실제 PDF 6장 샘플 · 닉네임으로 자동 채움</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openSamplePreview}
                        className="rounded-full border-[#C8B88A]/50 text-[#8a7a4d] hover:bg-[#C8B88A]/10 h-8 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        워크북 샘플 6장 미리보기
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-[#C8B88A]/20">
                    <div className="flex items-center gap-2 text-xs text-foreground/60">
                      <Shield className="w-3.5 h-3.5" />
                      <span>{isLoggedIn ? '구독 후 이용 가능' : '로그인 후 결제하면 즉시 시작'}</span>
                    </div>
                    <Button
                      onClick={() => {
                        handleStartCtaClick('lock_card_cta');
                        navigate(isLoggedIn ? '/token-subscription' : '/auth');
                      }}
                      size="sm"
                      className="rounded-full bg-[#1a1a1a] text-white hover:bg-black"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      ₩{TRACK_PRICE.toLocaleString()} 시작하기
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* Hero — 마케팅 메시지 (헤더 아래) */}
        <section className="relative pt-4 pb-10 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-5"
            >
              <div className="flex justify-center gap-2 flex-wrap">
                <CoachingBadge variant="pill" />
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  무료 고민 리포트 + 30일 트랙
                </Badge>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight break-keep">
                지금 마음에 걸리는 고민,<br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  3분 안에 정리해드릴게요
                </span>
              </h1>

              <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto break-keep leading-relaxed">
                고민을 한 줄 적으면 <strong className="text-slate-900">즉석 마음 리포트</strong>를 받고,<br className="hidden md:block" />
                나에게 꼭 맞는 <strong className="text-slate-900">30일 변화 트랙</strong>을 제안받을 수 있어요.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 아이 발달 걱정도 자가체크 + 7일 플랜 */}
        <section className="px-4 pb-10">
          <div className="max-w-3xl mx-auto">
            <ChildDevConcernSection />
          </div>
        </section>

        {/* 휴먼터치 매니페스토 — 따뜻형 카드 */}
        <SmartScrollReveal kind="text" className="px-4 pb-8 block">
          <HumanTouchManifesto variant="track" />
        </SmartScrollReveal>

        {/* 무료 고민 리포트 입력 */}
        <section className="px-4 pb-12">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-blue-100 shadow-xl bg-white">
              <CardContent className="p-6 md:p-8 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center flex-shrink-0">
                    <MessageSquareHeart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg md:text-xl font-bold text-slate-900">
                        무료 고민 리포트 받기
                      </h2>
                      <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700 bg-emerald-50">
                        무료 · 비로그인 OK
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      어떤 고민이든 편하게 적어주세요. 판단하지 않고 따뜻하게 정리해드려요.
                    </p>
                  </div>
                </div>

                <Textarea
                  value={concern}
                  onChange={(e) => setConcern(e.target.value)}
                  placeholder={examplePlaceholders[placeholderIdx]}
                  className="min-h-[120px] resize-none text-base leading-relaxed border-slate-200 focus:border-blue-400 transition-all"
                  maxLength={500}
                  disabled={reportLoading || polishing}
                />

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{concern.length} / 500</span>
                    <span className="hidden sm:inline">입력하신 내용은 저장되지 않아요</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePolish}
                    disabled={polishing || reportLoading || concern.trim().length < 2}
                    className="h-8 text-xs gap-1.5 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                  >
                    {polishing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        다듬는 중...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        AI로 자연스럽게 다듬기
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  onClick={handleGenerateReport}
                  disabled={reportLoading || concern.trim().length < 5}
                  className="w-full h-13 py-4 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
                >
                  {reportLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      마음을 들여다보는 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      무료 리포트 받기
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 고민 리포트 결과 */}
        <AnimatePresence>
          {report && (
            <motion.section
              id="concern-report-result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="px-4 pb-16"
            >
              <div className="max-w-3xl mx-auto space-y-5">
                {/* Summary */}
                <Card className="border-blue-100 shadow-md">
                  <CardContent className="p-6 md:p-7 space-y-4">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500" />
                      <h3 className="font-bold text-slate-900 text-lg">지금 마음 들여다보기</h3>
                    </div>
                    <p className="text-slate-700 leading-relaxed break-keep">{report.summary}</p>
                  </CardContent>
                </Card>

                {/* Current state bars */}
                <Card className="border-slate-100 shadow-sm">
                  <CardContent className="p-6 md:p-7 space-y-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      <h3 className="font-bold text-slate-900 text-lg">현재 마음 상태</h3>
                    </div>
                    <div className="space-y-4">
                      <StateBar label="스트레스 부담감" value={report.currentState.stress} color="rose" inverse />
                      <StateBar label="마음의 에너지" value={report.currentState.energy} color="amber" />
                      <StateBar label="생각의 명료함" value={report.currentState.clarity} color="emerald" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      ※ 셀프 리포트 기반 추정치. 의료적 진단이 아니에요.
                    </p>
                  </CardContent>
                </Card>

                {/* Root causes */}
                {report.rootCauses?.length > 0 && (
                  <Card className="border-slate-100 shadow-sm">
                    <CardContent className="p-6 md:p-7 space-y-4">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        <h3 className="font-bold text-slate-900 text-lg">짚어볼 만한 원인</h3>
                      </div>
                      <ul className="space-y-2">
                        {report.rootCauses.map((c, i) => (
                          <li key={i} className="flex gap-2 text-slate-700 text-sm leading-relaxed">
                            <span className="text-amber-500 font-bold flex-shrink-0">{i + 1}.</span>
                            <span className="break-keep">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Quick actions */}
                {report.quickActions?.length > 0 && (
                  <Card className="border-emerald-100 shadow-sm bg-emerald-50/30">
                    <CardContent className="p-6 md:p-7 space-y-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-bold text-slate-900 text-lg">오늘 바로 해볼 수 있는 것</h3>
                      </div>
                      <ul className="space-y-2.5">
                        {report.quickActions.map((a, i) => (
                          <li key={i} className="flex gap-2.5 text-slate-700 text-sm leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span className="break-keep">{a}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Track recommendation */}
                <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50">
                  <CardContent className="p-6 md:p-8 space-y-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-slate-900 text-lg">
                        이 고민에 딱 맞는 30일 트랙
                      </h3>
                    </div>

                    {recommendedGoal && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-blue-100">
                        <div className="text-3xl">{recommendedGoal.icon}</div>
                        <div>
                          <div className="font-bold text-slate-900">{recommendedGoal.title}</div>
                          <div className="text-xs text-slate-500">{recommendedGoal.desc}</div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="font-semibold text-slate-900 mb-1">왜 이 트랙인가요?</div>
                        <p className="text-slate-700 leading-relaxed break-keep">
                          {report.trackRecommendation.reason}
                        </p>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 mb-1">30일 후, 기대되는 변화</div>
                        <p className="text-slate-700 leading-relaxed break-keep">
                          {report.trackRecommendation.expectedChange}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <div className="text-2xl font-bold text-slate-900">₩19,900</div>
                        <div className="text-xs text-slate-500 line-through">₩39,800 · 14일 환불</div>
                      </div>
                      <Button
                        onClick={() => {
                          document.getElementById('goal-section')?.scrollIntoView({
                            behavior: 'smooth', block: 'start',
                          });
                        }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-6 rounded-xl font-bold"
                      >
                        30일 트랙으로 이어가기
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Goal Selection */}
        <SmartScrollReveal kind="cards" className="block">
          <section id="goal-section" className="px-4 pb-16 scroll-mt-24">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  30일 동안 집중할 목표를 골라주세요
                </h2>
                <p className="text-slate-600">선택한 목표에 맞춰 일일 코칭이 자동 설계돼요</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {focusGoals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`p-4 md:p-5 rounded-2xl border-2 text-left transition-all ${
                      selectedGoal === goal.id
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{goal.icon}</div>
                    <div className="font-bold text-slate-900 text-sm md:text-base mb-1">{goal.title}</div>
                    <div className="text-xs text-slate-500 break-keep">{goal.desc}</div>
                    {selectedGoal === goal.id && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </SmartScrollReveal>

        {/* 30 Day Flow */}
        <section className="px-4 pb-16 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-5xl mx-auto py-12">
            <div className="text-center mb-10">
              <Calendar className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">30일, 이렇게 진행돼요</h2>
              <p className="text-slate-600">하루 3~5분, 부담 없이 누적되는 변화</p>
            </div>
            <div className="space-y-3">
              {dailyFlow.map((step, i) => (
                <motion.div
                  key={step.day}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4 bg-white p-4 md:p-5 rounded-2xl border border-slate-200"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-blue-600">{step.day}</span>
                      <h3 className="font-bold text-slate-900">{step.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 break-keep">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Pillars */}
        <SmartScrollReveal kind="stats" className="block">
          <section className="px-4 py-16">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">왜 이 트랙이 다를까요</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-blue-100">
                  <CardContent className="p-6 space-y-3">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                    <h3 className="font-bold text-slate-900">눈에 보이는 변화</h3>
                    <p className="text-sm text-slate-600 break-keep">
                      1일차와 30일차의 셀프 체크 결과를 한눈에 비교. 막연한 후기가 아닌 내 데이터로 확인.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-purple-100">
                  <CardContent className="p-6 space-y-3">
                    <Zap className="w-8 h-8 text-purple-600" />
                    <h3 className="font-bold text-slate-900">매일 3분, 부담 ZERO</h3>
                    <p className="text-sm text-slate-600 break-keep">
                      명상 앱처럼 길지 않고, 검사처럼 무겁지 않아요. 출근길·점심시간에 끝나는 짧은 루틴.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-amber-100">
                  <CardContent className="p-6 space-y-3">
                    <Shield className="w-8 h-8 text-amber-600" />
                    <h3 className="font-bold text-slate-900">의료가 아닌 코칭</h3>
                    <p className="text-sm text-slate-600 break-keep">
                      진단·치료가 아닌 자기이해·습관설계·웰빙 가이드. 누구나 안심하고 시작할 수 있어요.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </SmartScrollReveal>

        {/* CTA */}
        <SmartScrollReveal kind="cta" className="block">
          <section className="px-4 py-16 bg-gradient-to-br from-blue-600 to-purple-600">
            <div className="max-w-3xl mx-auto text-center text-white space-y-6">
              <Award className="w-12 h-12 mx-auto opacity-90" />
              <h2 className="text-3xl md:text-4xl font-bold break-keep">
                30일 후, 한결 가벼워진 마음으로
              </h2>
              <p className="text-white/90 text-base md:text-lg break-keep">
                지금 시작하면 ₩19,900 (정가 ₩39,800)<br />
                7일 무료 체험 후 결제 · 언제든 해지 가능
              </p>
              <div className="pt-2">
                <Button
                  size="lg"
                  onClick={handleStart}
                  disabled={loading}
                  className="bg-white text-blue-700 hover:bg-slate-100 text-lg px-8 py-6 h-auto rounded-2xl shadow-2xl font-bold"
                >
                  {loading ? '등록 중...' : (
                    <>
                      {selectedGoal ? '30일 트랙 시작하기' : '먼저 목표를 선택해주세요'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-white/70 text-xs">
                결제는 다음 단계에서 진행됩니다 · 안전한 토스페이먼츠 결제
              </p>
            </div>
          </section>
        </SmartScrollReveal>

        <section className="px-4 py-8 max-w-4xl mx-auto">
          <MedicalDisclaimer variant="full" />
        </section>

        <Footer />
      </div>

      <WorkbookSamplePreviewModal
        open={sampleOpen}
        onOpenChange={handleSampleOpenChange}
        nickname={sampleSeed.nickname}
        trackTheme={sampleSeed.trackTheme}
        currentDay={sampleSeed.currentDay ?? 1}
        checkins={sampleSeed.checkins}
        baselines={sampleSeed.baselines}
        ctaPrice={TRACK_PRICE}
        onCtaClick={() => {
          handleStartCtaClick('sample_modal_cta');
          setSampleOpen(false);
          navigate(user?.id ? '/token-subscription' : '/auth');
        }}
      />
    </>
  );
};

// 상태 막대
function StateBar({
  label, value, color, inverse = false,
}: { label: string; value: number; color: 'rose' | 'amber' | 'emerald'; inverse?: boolean }) {
  const colorMap = {
    rose: 'bg-gradient-to-r from-rose-400 to-orange-400',
    amber: 'bg-gradient-to-r from-amber-400 to-yellow-400',
    emerald: 'bg-gradient-to-r from-emerald-400 to-teal-400',
  };
  const textColor = {
    rose: 'text-rose-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className={`text-sm font-bold tabular-nums ${textColor[color]}`}>{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorMap[color]}`}
        />
      </div>
    </div>
  );
}

export default MindTrack;
