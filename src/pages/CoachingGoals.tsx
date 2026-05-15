import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Target, Mail, Check, ArrowRight, BellOff, Calendar, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { useSubscription } from '@/hooks/useSubscription';

interface Goal {
  id: string;
  goal_category: string;
  goal_description: string | null;
  current_day: number;
  total_days: number;
  daily_email_opt_in: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
}

const CATEGORIES = [
  { key: 'depression', label: '우울 관리', desc: '행동 활성화 · 인지 재구성', icon: Brain },
  { key: 'anxiety', label: '불안 조절', desc: '점진적 둔감화 · 호흡 조절', icon: Brain },
  { key: 'sleep', label: '수면 회복', desc: 'CBT-I 기반 수면 위생', icon: Brain },
  { key: 'adhd', label: 'ADHD 실행기능', desc: '시간 분할 · 외부 단서화', icon: Brain },
  { key: 'parenting', label: '양육 코칭', desc: '정서 코칭 · 한계 설정', icon: Brain },
  { key: 'stress', label: '스트레스 회복탄력성', desc: 'MBSR 기반 마음챙김', icon: Brain },
  { key: 'self_esteem', label: '자존감 강화', desc: '자기 자비 훈련', icon: Brain },
];

const CoachingGoals: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search] = useSearchParams();
  const { isPremiumUser, isLifetimeUser } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('depression');
  const [description, setDescription] = useState('');
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const isPremium = isPremiumUser() || isLifetimeUser();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth?redirect=/coaching-goals');
        return;
      }
      setUserId(session.user.id);
      const { data } = await supabase
        .from('user_coaching_goals')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setActiveGoal(data as Goal);
        setEmailOptIn(data.daily_email_opt_in);
      }
      setLoading(false);

      // ?unsubscribe=1 처리
      if (search.get('unsubscribe') === '1' && data) {
        await supabase.from('user_coaching_goals').update({ daily_email_opt_in: false }).eq('id', data.id);
        setEmailOptIn(false);
        toast({ title: '데일리 메일을 껐습니다', description: '언제든 다시 켤 수 있어요.' });
      }
    })();
  }, [navigate, search, toast]);

  const handleStart = async () => {
    if (!userId) return;
    if (!isPremium) {
      toast({ title: '프리미엄 구독이 필요해요', description: '7일 트랙 결제 후 코칭이 시작됩니다.' });
      navigate('/token-subscription');
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from('user_coaching_goals')
      .insert({
        user_id: userId,
        goal_category: selectedCategory,
        goal_description: description || null,
        daily_email_opt_in: emailOptIn,
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast({ title: '저장 실패', description: error.message, variant: 'destructive' });
      return;
    }
    setActiveGoal(data as Goal);
    toast({ title: '코칭이 시작됐습니다', description: '내일 오전 8시에 첫 메일이 도착해요.' });
  };

  const toggleOptIn = async (next: boolean) => {
    if (!activeGoal) return;
    setEmailOptIn(next);
    await supabase.from('user_coaching_goals').update({ daily_email_opt_in: next }).eq('id', activeGoal.id);
    toast({ title: next ? '데일리 메일 ON' : '데일리 메일 OFF' });
  };

  const stopGoal = async () => {
    if (!activeGoal) return;
    await supabase.from('user_coaching_goals')
      .update({ is_active: false, end_date: new Date().toISOString().slice(0, 10) })
      .eq('id', activeGoal.id);
    setActiveGoal(null);
    toast({ title: '코칭을 종료했습니다' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <UnifiedNavigation />
        <div className="container mx-auto px-4 pt-32 text-center text-muted-foreground">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-foreground">
      <UnifiedNavigation />
      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-20 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-blue-100">
            <Sparkles className="w-3 h-3" />
            AIHPRO Daily Coaching
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight break-keep">
            매일 아침 8시, 박사급 1:1 코칭이 도착합니다
          </h1>
          <p className="text-muted-foreground break-keep">
            7일간 매일 한 줄의 미션과 임상 근거가 담긴 메일을 받습니다. 자동 결제 없음, 언제든 끄기 가능.
          </p>
        </motion.div>

        {activeGoal ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border-2 border-foreground bg-white p-6 md:p-10 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center">
                <Calendar className="w-6 h-6 text-background" />
              </div>
              <div>
                <h2 className="text-xl font-bold">진행 중인 코칭</h2>
                <p className="text-xs text-muted-foreground">
                  {CATEGORIES.find(c => c.key === activeGoal.goal_category)?.label || activeGoal.goal_category} · 시작일 {activeGoal.start_date}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-serif text-5xl font-semibold">Day {String(activeGoal.current_day).padStart(2, '0')}</span>
                <span className="text-sm text-muted-foreground">/ {activeGoal.total_days}일</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-slate-900 to-blue-500 transition-all" style={{ width: `${(activeGoal.current_day / activeGoal.total_days) * 100}%` }} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-4 mb-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-semibold">데일리 코칭 메일</div>
                  <div className="text-xs text-muted-foreground">매일 오전 8시 (KST)</div>
                </div>
              </div>
              <Switch checked={emailOptIn} onCheckedChange={toggleOptIn} />
            </div>

            <Button variant="outline" onClick={stopGoal} className="w-full">
              <BellOff className="w-4 h-4 mr-2" />코칭 종료하기
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">01 · 목표 선택</div>
              <div className="grid sm:grid-cols-2 gap-3">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const active = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`text-left rounded-2xl border-2 p-4 transition-all ${active ? 'border-foreground bg-slate-50' : 'border-border bg-white hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${active ? 'text-foreground' : 'text-muted-foreground'}`} />
                        <span className="font-bold text-sm">{cat.label}</span>
                        {active && <Check className="w-4 h-4 ml-auto text-foreground" />}
                      </div>
                      <p className="text-xs text-muted-foreground break-keep">{cat.desc}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">02 · 추가 설명 (선택)</div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="예) 회사 스트레스로 잠을 잘 못 자요. 30일간 수면을 회복하고 싶어요."
                maxLength={300}
                rows={3}
                className="w-full rounded-xl border border-border bg-white p-4 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 resize-none"
              />
              <div className="text-[11px] text-muted-foreground mt-1 text-right">{description.length}/300</div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">03 · 데일리 메일</div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  <div>
                    <div className="text-sm font-semibold">매일 오전 8시 코칭 메일 받기</div>
                    <div className="text-xs text-muted-foreground">근거 기반 미션 + 임상 인사이트</div>
                  </div>
                </div>
                <Switch checked={emailOptIn} onCheckedChange={setEmailOptIn} />
              </div>
            </motion.div>

            <Button
              size="lg"
              onClick={handleStart}
              disabled={saving}
              className="w-full h-14 rounded-xl text-base font-bold bg-foreground text-background hover:bg-foreground/90"
            >
              {saving ? '시작 중...' : isPremium ? (
                <><Target className="w-5 h-5 mr-2" />7일 코칭 시작하기<ArrowRight className="w-5 h-5 ml-2" /></>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" />7일 트랙 결제하고 시작하기</>
              )}
            </Button>

            <p className="text-[11px] text-muted-foreground mt-4 text-center break-keep">
              ※ 본 서비스는 발달 코칭 및 의사결정 보조 도구이며, 의료 진단·치료를 대체하지 않습니다.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default CoachingGoals;
