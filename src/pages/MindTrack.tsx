import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, CheckCircle2, ArrowRight,
  Shield, Zap, Loader2, Lightbulb, Target, Heart, MessageSquareHeart, Wand2,
} from 'lucide-react';

import { WORKBOOK_CHAPTERS } from '@/lib/mindTrackChapters';
import WorkbookSamplePreviewModal from '@/components/mind-track/WorkbookSamplePreviewModal';
import ActionBookPreviewSection from '@/components/mind-track/ActionBookPreviewSection';
import { Button } from '@/components/ui/button';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import Footer from '@/components/ui/footer';
import SEOHead from '@/components/common/SEOHead';
import CoachingBadge from '@/components/branding/CoachingBadge';
import { MedicalDisclaimer } from '@/components/legal/MedicalDisclaimer';

import { SmartScrollReveal } from '@/components/ui/smart-scroll-reveal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trackEvent } from '@/components/common/Analytics';
import { trackWorkbookFunnel } from '@/lib/workbookFunnelTracking';
import ChildDevConcernSection from '@/components/mind-track/ChildDevConcernSection';
import GoalSelfCheckSection, { type GoalCheckLevel } from '@/components/mind-track/GoalSelfCheckSection';
import SmartExpertSuggestion from '@/components/mind-track/SmartExpertSuggestion';
import TrackCategoryChips from '@/components/mind-track/TrackCategoryChips';
import TrackRecommendation from '@/components/mind-track/TrackRecommendation';
import TrackQuickPicker from '@/components/mind-track/TrackQuickPicker';
import StickyTrackCTA from '@/components/mind-track/StickyTrackCTA';
import AudienceHubSection from '@/components/mind-track/AudienceHubSection';
import MindTrackFromCheckView from '@/components/mind-track/MindTrackFromCheckView';
import { matchTrack, getAxis, recommendTracks, TRACK_TAGS, type CategoryAxis } from '@/lib/mindTrackCategories';
import type { MindTrackFocusId } from '@/lib/mindTrackFocusTracks';
import { getDayCopy, calcMindTrackCurrentDay } from '@/lib/mindTrackDayCopy';
import { MIND_TRACK_7_PRICE, MIND_TRACK_7_ORIGINAL_PRICE } from '@/constants/tokenCosts';
import { WORKBOOK_TOTAL_CHAPTERS } from '@/lib/mindTrackChapters';
// 결제자는 /mind-track/dashboard 전용 페이지로 자동 리다이렉트됨 (아래 분기 참고)

// /mind-track 페이지는 7일 트랙(₩7,900) 단일 진입점으로 운영
// 30일 옵션은 결제 페이지에서만 노출 (이 페이지에서는 일체 노출 금지)
const TRACK_PRICE = MIND_TRACK_7_PRICE;
const TRACK_ORIGINAL_PRICE = MIND_TRACK_7_ORIGINAL_PRICE;
const TRACK_TOTAL_DAYS = 7;
const REFUND_WINDOW_DAYS = 14;
const SAMPLE_CHAPTER_COUNT = WORKBOOK_TOTAL_CHAPTERS;

const focusGoals = [
  { id: 'sleep', icon: '🌙', title: '깊은 수면 회복', desc: '잠 못 드는 밤, 무거운 아침에서 벗어나기' },
  { id: 'stress', icon: '🌿', title: '스트레스 다스리기', desc: '일상 속 긴장과 압박감을 다루는 힘 기르기' },
  { id: 'mood', icon: '☀️', title: '감정 안정', desc: '오르내리는 기분을 부드럽게 조율하기' },
  { id: 'focus', icon: '🎯', title: '집중력 회복', desc: '산만함을 줄이고 일상 효율 끌어올리기' },
  { id: 'relationship', icon: '🤝', title: '관계 개선', desc: '가족·동료와의 소통 결을 다듬기' },
  { id: 'self', icon: '🪞', title: '자기 이해 심화', desc: '내 패턴을 알고 새로운 루틴 만들기' },
  { id: 'parenting', icon: '🤱', title: '육아 번아웃 회복', desc: '엄마·아빠의 지친 마음을 7일에 정돈하기' },
  { id: 'child_development', icon: '🌱', title: '아이 발달 코칭', desc: '연령별 발달 포인트와 부모 대응법 익히기' },
  { id: 'family_communication', icon: '💕', title: '아이와의 소통', desc: '훈육 갈등 줄이고 안정 애착 만들기' },
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
  const [selectedGoal, setSelectedGoal] = useState<string | null>(() => {
    const v = new URLSearchParams(location.search).get('goal');
    return v && focusGoals.some((g) => g.id === v) ? v : null;
  });
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(() => {
    const sp = new URLSearchParams(location.search);
    return !!(sp.get('category') || sp.get('tag'));
  });
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [postLoginRedirecting, setPostLoginRedirecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // 카테고리 필터 — URL 쿼리스트링이 단일 진실 (?category=concern&tag=sleep,stress)
  const initialAxis = (() => {
    const v = new URLSearchParams(location.search).get('category');
    return (['concern', 'lifeStage', 'role', 'intensity'].includes(v ?? '') ? v : 'concern') as CategoryAxis;
  })();
  const initialTags = (() => {
    const v = new URLSearchParams(location.search).get('tag');
    return v ? v.split(',').filter(Boolean) : [];
  })();
  const [categoryAxis, setCategoryAxis] = useState<CategoryAxis>(initialAxis);
  const [categoryTags, setCategoryTags] = useState<string[]>(initialTags);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasFilter = categoryAxis !== 'concern' || categoryTags.length > 0;
    if (hasFilter) {
      params.set('category', categoryAxis);
      if (categoryTags.length) params.set('tag', categoryTags.join(','));
      else params.delete('tag');
    } else {
      params.delete('category');
      params.delete('tag');
    }
    const next = params.toString();
    const newUrl = `${location.pathname}${next ? '?' + next : ''}${location.hash}`;
    const cur = `${location.pathname}${location.search}${location.hash}`;
    if (newUrl !== cur) window.history.replaceState(null, '', newUrl);
  }, [categoryAxis, categoryTags]); // eslint-disable-line react-hooks/exhaustive-deps

  // ?goal= URL 동기화 — 빠른 선택/딥링크 공유용
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (selectedGoal) params.set('goal', selectedGoal);
    else params.delete('goal');
    const next = params.toString();
    const newUrl = `${location.pathname}${next ? '?' + next : ''}${location.hash}`;
    const cur = `${location.pathname}${location.search}${location.hash}`;
    if (newUrl !== cur) window.history.replaceState(null, '', newUrl);
  }, [selectedGoal]); // eslint-disable-line react-hooks/exhaustive-deps

  // ?goal= 딥링크로 진입 시 goal-section으로 스크롤
  useEffect(() => {
    if (new URLSearchParams(location.search).get('goal')) {
      setTimeout(() => {
        document.getElementById('goal-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 카테고리 딥링크 진입 시 goal-section으로 자동 스크롤
  useEffect(() => {
    if (initialTags.length > 0 || new URLSearchParams(location.search).get('category')) {
      setTimeout(() => {
        document.getElementById('goal-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [sampleOpen, setSampleOpen] = useState(false);
  const [sampleSeed, setSampleSeed] = useState<{
    nickname?: string;
    trackTheme?: string;
    currentDay?: number;
    checkins?: any[];
    baselines?: any[];
  }>({});
  const sampleOpenedAtRef = React.useRef<number | null>(null);
  const sampleSeedRef = React.useRef<typeof sampleSeed>({});

  // helper: build personalization flags from current seed
  const buildPersonalizationFlags = () => {
    const s = sampleSeedRef.current || {};
    const checkinCount = s.checkins?.length || 0;
    const baselineCount = s.baselines?.length || 0;
    return {
      has_nickname: !!s.nickname && s.nickname !== '당신',
      has_track_theme: !!s.trackTheme,
      has_checkins: checkinCount > 0,
      has_baselines: baselineCount > 0,
      checkin_count: checkinCount,
      baseline_count: baselineCount,
      current_day: s.currentDay ?? 1,
      personalization_score:
        (s.nickname && s.nickname !== '당신' ? 1 : 0) +
        (s.trackTheme ? 1 : 0) +
        (checkinCount > 0 ? 1 : 0) +
        (baselineCount > 0 ? 1 : 0),
    };
  };

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

  // 스마트 전문가 제안용 시그널
  const [selfCheckLevel, setSelfCheckLevel] = useState<GoalCheckLevel | null>(null);
  const [selfCheckGoalId, setSelfCheckGoalId] = useState<string | null>(null);
  const [hasClickedCta, setHasClickedCta] = useState(false);

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
      const seed = { currentDay: 1 };
      sampleSeedRef.current = seed;
      setSampleSeed(seed);
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

      const seed = { nickname, trackTheme, currentDay, checkins, baselines };
      sampleSeedRef.current = seed;
      setSampleSeed(seed);
    } catch (e) {
      console.warn('[mind-track] sample seed load failed', e);
    }
  };

  const handleSampleOpenChange = (v: boolean) => {
    if (!v && sampleOpen && sampleOpenedAtRef.current) {
      const dwellMs = Date.now() - sampleOpenedAtRef.current;
      trackWorkbookFunnel('mt_workbook_sample_complete', {
        dwell_ms: dwellMs,
        dwell_seconds: Math.round(dwellMs / 1000),
        viewed_full: dwellMs > 8000,
        logged_in: !!user?.id,
        ...buildPersonalizationFlags(),
      });
      sampleOpenedAtRef.current = null;
    }
    setSampleOpen(v);
  };

  const handleStartCtaClick = (location: string) => {
    setHasClickedCta(true);
    const dwellMs = sampleOpenedAtRef.current ? Date.now() - sampleOpenedAtRef.current : 0;
    trackWorkbookFunnel('mt_workbook_sample_cta_click', {
      cta_location: location, // 'lock_card_cta' | 'sample_modal_cta'
      sample_open: sampleOpen,
      viewed_full: dwellMs > 8000,
      dwell_seconds: Math.round(dwellMs / 1000),
      logged_in: !!user?.id,
      price: TRACK_PRICE,
      ...buildPersonalizationFlags(),
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
        // HTML 태그/마크다운 잔여물 제거 (AI가 가끔 <b>, **, ``` 등을 남김)
        const cleaned = String(data.polished)
          .replace(/<\/?[a-zA-Z][^>]*>/g, '')
          .replace(/```[\s\S]*?```/g, '')
          .replace(/[*_`~]+/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/[ \t]+\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        setConcern(cleaned);
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
      navigate('/auth?redirect=' + encodeURIComponent('/mind-track?postLogin=1&trial=1'));
      return;
    }
    setLoading(true);
    try {
      const sp = new URLSearchParams(location.search);
      const audienceParam = (sp.get('audience') || 'child') as 'child' | 'adult' | 'parent' | 'teen';
      const { startMindTrackTrial } = await import('@/lib/mindTrackEnrollment');
      const res = await startMindTrackTrial({ goal: selectedGoal, concern }, audienceParam);
      if (!res.enrollmentId) throw new Error(res.error || '등록 실패');
      trackEvent('mind_track_trial_start', { goal: selectedGoal, audience: audienceParam });
      toast.success('3일 무료 체험을 시작합니다');
      navigate('/mind-track/dashboard');
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
        activeEnrollment.payment_status === 'completed' ||
        activeEnrollment.payment_status === 'trial') &&
      !postLoginRedirecting
    ) {
      const search = location.search || '';
      navigate(`/mind-track/dashboard${search}`, { replace: true });
    }
  }, [activeEnrollment?.id, activeEnrollment?.payment_status, postLoginRedirecting, navigate]);

  // 리다이렉트 직전 깜빡임 방지 — 결제자/체험자면 빈 화면 반환
  if (
    activeEnrollment &&
    (activeEnrollment.payment_status === 'paid' ||
      activeEnrollment.payment_status === 'completed' ||
      activeEnrollment.payment_status === 'trial') &&
    !postLoginRedirecting
  ) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // /check → /mind-track 진입 (from=check): 단순화된 전용 화면.
  // 체크 영역·연령·점수를 그대로 이어받아 큰 글씨로 보여주고
  // 한 개의 명확한 CTA(3일 무료 코칭 시작)만 노출.
  // ──────────────────────────────────────────────────────────
  {
    const sp = new URLSearchParams(location.search);
    if (sp.get('from') === 'check' && !activeEnrollment) {
      const areaParam = (sp.get('area') || 'language') as 'language' | 'emotion' | 'social' | 'focus';
      const age = sp.get('age');
      const scoreRaw = sp.get('score');
      const score = scoreRaw != null && !Number.isNaN(Number(scoreRaw)) ? Number(scoreRaw) : null;
      const audienceParam = (sp.get('audience') || 'child') as 'child' | 'adult' | 'parent' | 'teen';
      return (
        <>
          <SEOHead
            title={`${age ?? ''}세 발달 체크 이후 · 7일 부모 코칭 무료 체험 | AIHPRO`}
            description="방금 본 자녀 발달 체크 결과를 이어서 7일 부모 코칭으로. 카드 등록 없이 3일 무료 체험."
            canonicalUrl="https://aihpro.app/mind-track"
          />
          <div className="min-h-screen bg-white">
            <UnifiedNavigation />
            <MindTrackFromCheckView
              user={user}
              area={areaParam}
              age={age}
              score={score}
              audience={audienceParam}
            />
          </div>
        </>
      );
    }
  }

  // /check 결과에서 넘어온 부모를 위한 간결 뷰 (자녀 발달 컨텍스트 보존)
  {
    const sp = new URLSearchParams(location.search);
    if (sp.get('from') === 'check') {
      const area = (sp.get('area') as 'language' | 'emotion' | 'social' | 'focus') || 'language';
      const age = sp.get('age');
      const scoreRaw = sp.get('score');
      const score = scoreRaw != null && scoreRaw !== '' ? Number(scoreRaw) : null;
      const audience = (sp.get('audience') as 'child' | 'adult' | 'parent' | 'teen') || 'child';
      return (
        <>
          <SEOHead
            title="체크 결과로 시작하는 3일 무료 부모 코칭 | AIHPRO"
            description="방금 본 자녀 발달 체크 결과를 그대로 이어 받아, 카드 등록 없이 3일 무료로 부모 코칭을 시작하세요."
            canonicalUrl="https://aihpro.app/mind-track"
          />
          <UnifiedNavigation />
          <MindTrackFromCheckView user={user} area={area} age={age} score={score} audience={audience} />
        </>
      );
    }
  }

  return (
    <>
      <SEOHead
        title="7일 마음 트랙 · PMF 베타 전액 무료 | AIHPRO"
        description="진단·자기관찰·전문가 1:1·회복 루틴까지 7일에 압축. PMF 베타 기간 전액 무료. 완주하면 +23일 연장 옵션."
        canonicalUrl="https://aihpro.app/mind-track"
      />
      <div className="min-h-screen bg-white">
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
                const totalDays = TRACK_TOTAL_DAYS;
                const progressPct = Math.round((Math.min(day, totalDays) / totalDays) * 100);
                return (
                  <div className="bg-white rounded-3xl border border-[#C8B88A]/40 ring-1 ring-[#C8B88A]/15 shadow-sm p-6 md:p-7 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-emerald-500/15 text-emerald-700 border-0 text-xs">
                          진행 중
                        </Badge>
                        <span className="text-[11px] font-semibold tracking-wider text-[#8a7a4d] uppercase">
                          Day {String(day).padStart(2, '0')} / {totalDays} · {copy.phase}
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
                  <div className="bg-white rounded-3xl border-2 border-[#1a1a1a] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] p-6 md:p-8">
                    {/* 상단 강조 배지 */}
                    <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1a1a1a] text-white text-[11px] font-bold tracking-wide">
                        <Sparkles className="w-3 h-3" />
                        7일 마음 트랙
                      </div>
                      <div className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        PMF 베타 · 7일 전액 무료
                      </div>
                    </div>

                    {/* 한눈 헤드라인 */}
                    <h2 className="text-[30px] md:text-[40px] font-black text-foreground break-keep leading-[1.15] tracking-tight mb-3">
                      매일 5분,<br />
                      <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
                        7일이면 달라져요.
                      </span>
                    </h2>
                    <p className="text-[15px] text-foreground/70 break-keep leading-relaxed mb-6">
                      진단 · 자기관찰 · 전문가 1:1 · 회복 루틴까지<br />
                      <strong className="text-foreground">한 트랙에 압축</strong>했어요.
                    </p>

                    {/* 3가지 핵심만 — 한눈에 */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {[
                        { n: '5분', t: '하루 미션' },
                        { n: '7일', t: '완주 구조' },
                        { n: '1:1', t: '전문가 코칭' },
                      ].map((it) => (
                        <div key={it.n} className="rounded-2xl bg-[#FBF8F1] border border-[#C8B88A]/30 px-3 py-3 text-center">
                          <div className="text-xl md:text-2xl font-black text-[#1a1a1a] leading-none">{it.n}</div>
                          <div className="text-[11px] text-foreground/60 mt-1 font-medium">{it.t}</div>
                        </div>
                      ))}
                    </div>

                    <ActionBookPreviewSection
                      nickname={sampleSeed.nickname}
                      concern={concern}
                      goalId={selectedGoal}
                      goalLabel={focusGoals.find((g) => g.id === selectedGoal)?.title || null}
                      trackPrice={TRACK_PRICE}
                      loggedIn={isLoggedIn}
                      onOpenSampleModal={openSamplePreview}
                      onUnlockClick={(loc) => {
                        handleStartCtaClick(loc);
                        navigate(isLoggedIn ? '/token-subscription' : '/auth');
                      }}
                    />

                    {/* 가격 + 비교 — 한눈에 ‘싸다’ 인지 */}
                    <div className="mt-5 mb-4 p-4 rounded-2xl bg-[#FBF8F1] border border-[#C8B88A]/30">
                      <div className="flex items-end justify-between gap-3 flex-wrap">
                        <div>
                          <div className="text-[11px] text-foreground/55 line-through">
                            전문가 1:1 단회만 ₩60,000~
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a]">
                              ₩{TRACK_PRICE.toLocaleString()}
                            </span>
                            <span className="text-sm text-foreground/60 font-semibold">/ 7일 전체</span>
                          </div>
                          <div className="text-[11px] text-foreground/55 mt-0.5">
                            하루 ₩{Math.round(TRACK_PRICE / 7).toLocaleString()} · 커피 한 잔보다 저렴
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-1">
                            <Shield className="w-3 h-3" />
                            14일 100% 환불 보장
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        handleStartCtaClick('lock_card_cta');
                        navigate(isLoggedIn ? '/token-subscription' : '/auth');
                      }}
                      className="w-full h-14 rounded-2xl bg-[#1a1a1a] text-white hover:bg-black font-bold text-base"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      3일 무료로 시작하기
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    <div className="flex items-center justify-center gap-3 pt-3 text-[11px] text-foreground/55 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        카드 등록 없이 즉시 시작 · 언제든 중단
                      </span>
                    </div>
                  </div>
                );
            })()}
          </div>
        </section>

        {/* Audience Hub — 4개 트랙(child/teen/adult/parent) 진입 */}
        <AudienceHubSection />




        {/* 선택한 목표에 맞는 자가체크 — 목표 선택 시에만 펼쳐짐 */}
        <AnimatePresence mode="wait">
          {selectedGoal && (
            <motion.section
              key={selectedGoal}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="px-4 pb-10"
            >
              <div className="max-w-3xl mx-auto">
                {(selectedGoal === 'child_development' || selectedGoal === 'family_communication') ? (
                  <ChildDevConcernSection />
                ) : (
                  <GoalSelfCheckSection
                    goalId={selectedGoal}
                    onComplete={(level, goalId) => {
                      setSelfCheckLevel(level);
                      setSelfCheckGoalId(goalId);
                    }}
                  />
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>




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
                        내 트랙 찾기
                      </h2>
                      <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700 bg-emerald-50">
                        1분 · 무료 · 비로그인 OK
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      고민을 한 줄만 적어주시면, 짧은 리포트와 함께 가장 잘 맞는 7일 마음 트랙 3가지를 추천해드려요.
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
                      트랙을 찾는 중...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 mr-2" />
                      내 트랙 찾기
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 짧은 리포트 + TOP 3 트랙 추천 */}
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
                {/* 컴팩트 리포트 */}
                <Card className="border-slate-100 shadow-md bg-white rounded-3xl">
                  <CardContent className="p-6 md:p-7 space-y-5">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500" />
                      <h3 className="font-bold text-slate-900 text-lg">짧은 마음 리포트</h3>
                    </div>
                    <p className="text-slate-700 leading-relaxed break-keep text-sm md:text-base">
                      {report.summary}
                    </p>

                    <div className="space-y-3 pt-1">
                      <StateBar label="스트레스 부담감" value={report.currentState.stress} color="rose" inverse />
                      <StateBar label="마음의 에너지" value={report.currentState.energy} color="amber" />
                      <StateBar label="생각의 명료함" value={report.currentState.clarity} color="emerald" />
                    </div>

                    {((report.rootCauses?.length ?? 0) > 0 || (report.quickActions?.length ?? 0) > 0) && (
                      <Accordion type="multiple" className="border-t border-slate-100 pt-2">
                        {report.rootCauses?.length > 0 && (
                          <AccordionItem value="causes" className="border-b-0">
                            <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:no-underline py-2">
                              <span className="flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-500" />
                                짚어볼 만한 원인 {report.rootCauses.length}가지
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2 pt-1">
                                {report.rootCauses.map((c, i) => (
                                  <li key={i} className="flex gap-2 text-slate-700 text-sm leading-relaxed">
                                    <span className="text-amber-500 font-bold flex-shrink-0">{i + 1}.</span>
                                    <span className="break-keep">{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                        {report.quickActions?.length > 0 && (
                          <AccordionItem value="actions" className="border-b-0">
                            <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:no-underline py-2">
                              <span className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-emerald-600" />
                                오늘 바로 해볼 수 있는 것 {report.quickActions.length}가지
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2.5 pt-1">
                                {report.quickActions.map((a, i) => (
                                  <li key={i} className="flex gap-2.5 text-slate-700 text-sm leading-relaxed">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <span className="break-keep">{a}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                      </Accordion>
                    )}

                    <p className="text-[11px] text-slate-400">
                      ※ 셀프 리포트 기반 추정치예요. 의료적 진단이 아닙니다.
                    </p>
                  </CardContent>
                </Card>

                {/* TOP 3 트랙 추천 */}
                {(() => {
                  const matchedId = report.trackRecommendation.matchedGoal as MindTrackFocusId;
                  const matched = focusGoals.find((g) => g.id === matchedId);
                  // 1순위 매칭 트랙의 concern 태그를 시드로 유사 트랙 추출
                  const seedConcerns = TRACK_TAGS[matchedId]?.concern ?? [];
                  const others = recommendTracks({ riskConcerns: seedConcerns }, 5)
                    .filter((r) => r.trackId !== matchedId)
                    .slice(0, 2)
                    .map((r) => focusGoals.find((g) => g.id === r.trackId))
                    .filter(Boolean) as typeof focusGoals;

                  const handlePick = (id: string) => {
                    setSelectedGoal(id);
                    toast.success('트랙이 선택됐어요. 하단의 시작 버튼으로 이어가세요.');
                    document.getElementById('goal-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  };

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-1">
                        <Target className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-slate-900 text-lg">이 고민에 맞는 트랙 3가지</h3>
                      </div>

                      {/* 1순위 — 큰 카드 */}
                      {matched && (
                        <Card className="border-2 border-blue-200 shadow-md bg-white rounded-3xl">
                          <CardContent className="p-5 md:p-6 space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="text-3xl flex-shrink-0">{matched.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className="bg-blue-600 text-white text-[10px]">1순위 · 가장 잘 맞아요</Badge>
                                </div>
                                <div className="font-bold text-slate-900 mt-1.5">{matched.title}</div>
                                <div className="text-xs text-slate-500 mt-0.5 break-keep">{matched.desc}</div>
                              </div>
                            </div>

                            <div className="text-sm text-slate-700 leading-relaxed break-keep bg-slate-50 rounded-2xl p-3">
                              <span className="font-semibold text-slate-900">매칭 이유 · </span>
                              {report.trackRecommendation.reason}
                            </div>

                            <Button
                              onClick={() => handlePick(matched.id)}
                              className="w-full h-12 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold"
                            >
                              이 트랙 선택하기
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      )}

                      {/* 2~3순위 — 컴팩트 카드 */}
                      {others.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {others.map((g, i) => (
                            <button
                              key={g.id}
                              onClick={() => handlePick(g.id)}
                              className="text-left bg-white border border-slate-200 hover:border-slate-400 rounded-2xl p-4 transition-all"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] text-slate-500 font-semibold">{i + 2}순위</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="text-2xl flex-shrink-0">{g.icon}</div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 text-sm">{g.title}</div>
                                  <div className="text-xs text-slate-500 mt-0.5 break-keep line-clamp-2">{g.desc}</div>
                                </div>
                              </div>
                              <div className="mt-3 text-xs text-blue-600 font-semibold flex items-center gap-1">
                                선택하기 <ArrowRight className="w-3 h-3" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setAdvancedOpen(true);
                          setTimeout(() => {
                            document.getElementById('goal-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 50);
                        }}
                        className="w-full text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2 py-2"
                      >
                        다른 트랙도 모두 보기 →
                      </button>
                    </div>
                  );
                })()}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Goal Selection — Quick Picker (1 question → matched track) */}
        <SmartScrollReveal kind="cards" className="block">
          <section id="goal-section" className="px-4 pb-16 scroll-mt-24">
            <div className="max-w-3xl mx-auto">
              <TrackQuickPicker
                selectedGoal={selectedGoal}
                onSelect={(id) => setSelectedGoal(id)}
                onStart={handleStart}
                loading={loading}
                showAdvancedOpen={advancedOpen}
                onToggleAdvanced={() => setAdvancedOpen((v) => !v)}
              />

              {/* 고급 — 펼치면 AI 추천 + 4축 칩 + 9개 그리드 */}
              <AnimatePresence initial={false}>
                {advancedOpen && (
                  <motion.div
                    key="advanced-tracks"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-8 mt-2 border-t border-slate-200 space-y-5">
                      <TrackRecommendation
                        userId={user?.id}
                        selectedGoal={selectedGoal}
                        onSelect={(id) => setSelectedGoal(id)}
                      />

                      <div className="bg-white rounded-3xl border border-slate-200 p-4 md:p-5">
                        <TrackCategoryChips
                          axis={categoryAxis}
                          selectedTags={categoryTags}
                          onAxisChange={setCategoryAxis}
                          onTagsChange={setCategoryTags}
                        />
                      </div>

                      {(() => {
                        const filtered = focusGoals.filter((g) =>
                          matchTrack(g.id as MindTrackFocusId, categoryAxis, categoryTags)
                        );
                        const showFallback = categoryTags.length > 0 && filtered.length === 0;
                        const list = showFallback ? focusGoals : filtered;
                        return (
                          <>
                            {showFallback && (
                              <div className="text-center text-xs text-slate-500 mb-3">
                                선택한 조건과 맞는 트랙이 없어 전체 트랙을 보여드려요
                              </div>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                              {list.map((goal) => (
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
                          </>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </SmartScrollReveal>




        {/* FAQ Accordion */}
        <SmartScrollReveal kind="text" className="block">
          <section className="px-4 py-14 bg-white">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <Badge variant="outline" className="mb-3 text-xs">FAQ</Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 break-keep">
                  결제 전 가장 많이 묻는 질문
                </h2>
                <p className="text-sm text-slate-500 mt-2 break-keep">
                  궁금한 항목을 펼쳐서 확인해 보세요.
                </p>
              </div>
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="q1" className="border rounded-2xl px-4 bg-white">
                  <AccordionTrigger className="text-left text-sm font-semibold py-4 break-keep">
                    하루에 얼마나 시간이 걸리나요?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-slate-600 break-keep pb-4">
                    하루 평균 3분이면 충분해요. 짧은 셀프 체크 + 한 줄 일기 + 그날의 마이크로 액션으로 구성됩니다.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q2" className="border rounded-2xl px-4 bg-white">
                  <AccordionTrigger className="text-left text-sm font-semibold py-4 break-keep">
                    중간에 며칠 빠지면 어떻게 되나요?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-slate-600 break-keep pb-4">
                    빠진 날도 ‘건너뛴 일차’로 기록만 되고 트랙은 계속 이어집니다. 7일 안에 자기 페이스로 채워가면 되고, 완주하면 Day 07 변화 리포트가 평생 보관돼요.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q3" className="border rounded-2xl px-4 bg-white">
                  <AccordionTrigger className="text-left text-sm font-semibold py-4 break-keep">
                    의료 진단/치료 목적인가요?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-slate-600 break-keep pb-4">
                    아니요. 7일 마음 트랙은 자기이해·습관 설계·웰빙 가이드를 위한 코칭/분석 도구이며,
                    진단·치료를 대체하지 않습니다. 위기 상황은 화면 내 ‘긴급 전문가 연결’을 이용해 주세요.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q4" className="border rounded-2xl px-4 bg-white">
                  <AccordionTrigger className="text-left text-sm font-semibold py-4 break-keep">
                    환불 정책은 어떻게 되나요?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-slate-600 break-keep pb-4">
                    결제 후 {REFUND_WINDOW_DAYS}일 이내, 워크북 진행률 20% 미만이면 전액 환불이 가능합니다. 그 외 기준은 결제 페이지 약관을 따릅니다.
                  </AccordionContent>
                </AccordionItem>




                <AccordionItem value="q7" className="border rounded-2xl px-4 bg-white">
                  <AccordionTrigger className="text-left text-sm font-semibold py-4 break-keep">
                    전문가 개입(리뷰/상담/긴급/심화)은 별도 결제인가요?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-slate-600 break-keep pb-4">
                    네. 7일 마음 트랙(₩{TRACK_PRICE.toLocaleString()})에는 워크북과 AI 코칭 콘텐츠가 모두 포함되며, 전문가 리뷰·상담·긴급·심화 4종은 필요할 때만 단건으로 추가 결제하는 옵션입니다.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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

      {/* 타이밍 기반 전문가 연결 자동 제안 — 셀프체크/리포트/이탈 신호를 보고 알아서 권유 */}
      <StickyTrackCTA
        selectedGoal={selectedGoal}
        loading={loading}
        onStart={handleStart}
      />

      <SmartExpertSuggestion
        selfCheckLevel={selfCheckLevel}
        selfCheckGoalId={selfCheckGoalId}
        activeGoalId={selectedGoal}
        reportRiskHigh={
          !!report &&
          (report.currentState?.stress >= 70 ||
            report.currentState?.energy <= 30 ||
            report.currentState?.clarity <= 30)
        }
        ctaClicked={hasClickedCta}
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
