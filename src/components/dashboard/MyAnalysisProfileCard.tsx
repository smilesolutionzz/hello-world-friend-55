import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sparkles, Pencil, ArrowRight, Baby, User as UserIcon, Loader2 } from 'lucide-react';
import { PostSignupOnboarding } from '@/components/onboarding/PostSignupOnboarding';

const CONCERN_LABEL: Record<string, string> = {
  attention: '주의력',
  emotion: '정서·불안',
  development: '발달 지연',
  language: '언어 발달',
  social: '사회성',
  learning: '학습·인지',
  behavior: '행동',
  sleep: '수면·식습관',
  stress: '스트레스',
  puberty: '사춘기',
  burnout: '육아 번아웃',
  curious: '궁금해서',
};

const BASELINE_META: { id: string; label: string; options: string[] }[] = [
  { id: 'daily_difficulty', label: '일상 어려움', options: ['전혀 없음', '가끔', '자주', '매일'] },
  { id: 'emotional_state', label: '정서 상태', options: ['매우 안정', '대체로 안정', '불안정 있음', '많이 불안정'] },
  { id: 'sleep_quality', label: '수면의 질', options: ['매우 좋음', '보통', '좋지 않음', '심각하게 나쁨'] },
  { id: 'social_interaction', label: '사회 관계', options: ['매우 좋음', '보통', '어려움 있음', '많이 힘듦'] },
  { id: 'concern_duration', label: '지속 기간', options: ['최근 시작', '1~3개월', '3~6개월', '6개월 이상'] },
];

interface OnboardingRow {
  subject_type: 'child' | 'self' | string | null;
  child_age: number | null;
  child_gender: string | null;
  concern_keywords: string[] | null;
  baseline_answers: Record<string, number> | null;
  onboarding_completed_at: string | null;
}

const MyAnalysisProfileCard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OnboardingRow | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: row } = await (supabase as any)
        .from('user_onboarding_data')
        .select('subject_type, child_age, child_gender, concern_keywords, baseline_answers, onboarding_completed_at')
        .eq('user_id', user.id)
        .maybeSingle();
      setData(row ?? null);
    } catch (err) {
      console.warn('[MyAnalysisProfileCard] load failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStart = () => {
    const concerns = (data?.concern_keywords ?? []).join(',');
    const params = new URLSearchParams();
    if (concerns) params.set('concern', concerns);
    navigate(`/mind-track${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const baseClass =
    'bg-white rounded-2xl border border-[#C8B88A]/40 ring-1 ring-[#C8B88A]/15 p-5 sm:p-6 shadow-sm';

  if (loading) {
    return (
      <div className={baseClass}>
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <Loader2 className="w-4 h-4 animate-spin" /> 맞춤 프로필 불러오는 중…
        </div>
      </div>
    );
  }

  // No data → CTA card
  if (!data || !data.onboarding_completed_at) {
    return (
      <>
        <div className={baseClass}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8B88A]/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#8a7a4d]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-foreground break-keep">
                맞춤 분석 프로필이 아직 없어요
              </h3>
              <p className="text-sm text-foreground/60 mt-1 break-keep">
                3분이면 끝나요. 한 번 설정하면 모든 검사·리포트·코칭이 내 상황에 맞게 바뀝니다.
              </p>
              <Button
                onClick={() => setEditorOpen(true)}
                className="mt-4 bg-[#1a1a1a] text-white hover:bg-[#000] rounded-full"
                size="sm"
              >
                <Sparkles className="w-4 h-4 mr-1.5" /> 맞춤 프로필 설정하기
              </Button>
            </div>
          </div>
        </div>
        <PostSignupOnboarding
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          onComplete={() => { setEditorOpen(false); load(); }}
        />
      </>
    );
  }

  // Has data → summary card
  const isChild = data.subject_type === 'child';
  const subjectLabel = isChild
    ? `우리 아이${data.child_age != null ? ` · 만 ${data.child_age}세` : ''}${
        data.child_gender === 'male' ? ' · 남아' : data.child_gender === 'female' ? ' · 여아' : ''
      }`
    : '나 자신';
  const concerns = (data.concern_keywords ?? []).slice(0, 8);
  const baselineSummary = BASELINE_META
    .map((b) => {
      const v = data.baseline_answers?.[b.id];
      if (v == null) return null;
      return { label: b.label, value: b.options[v] ?? '-' };
    })
    .filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <div className={baseClass}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#C8B88A]/15 flex items-center justify-center">
              {isChild ? <Baby className="w-4.5 h-4.5 text-[#8a7a4d]" /> : <UserIcon className="w-4.5 h-4.5 text-[#8a7a4d]" />}
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#8a7a4d] uppercase">My Analysis Profile</p>
              <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight">{subjectLabel}</h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditorOpen(true)}
            className="text-xs text-foreground/60 hover:text-foreground h-8 px-2"
          >
            <Pencil className="w-3.5 h-3.5 mr-1" /> 수정
          </Button>
        </div>

        {concerns.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-foreground/60 mb-2">관심 주제</p>
            <div className="flex flex-wrap gap-1.5">
              {concerns.map((k) => (
                <span
                  key={k}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#C8B88A]/10 text-[#8a7a4d] border border-[#C8B88A]/30"
                >
                  {CONCERN_LABEL[k] ?? k}
                </span>
              ))}
            </div>
          </div>
        )}

        {baselineSummary.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-medium text-foreground/60 mb-2">기초 상태 체크</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {baselineSummary.map((b) => (
                <div key={b.label} className="bg-[#FAF8F2] rounded-lg px-3 py-2 border border-[#C8B88A]/20">
                  <p className="text-[10px] text-foreground/50 leading-none mb-1">{b.label}</p>
                  <p className="text-xs font-semibold text-foreground">{b.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#C8B88A]/20">
          <p className="text-xs text-foreground/60 break-keep">
            이 프로필을 기반으로 모든 분석이 맞춤화됩니다
          </p>
          <Button onClick={handleStart} size="sm" className="rounded-full bg-[#1a1a1a] text-white hover:bg-black">
            맞춤 분석 시작 <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      <PostSignupOnboarding
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onComplete={() => { setEditorOpen(false); load(); }}
      />
    </>
  );
};

export default MyAnalysisProfileCard;
