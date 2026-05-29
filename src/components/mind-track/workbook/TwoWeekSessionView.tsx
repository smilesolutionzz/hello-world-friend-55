import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, BookOpen, MessageSquareHeart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  getSessionContent,
  getSessionIndex,
  TWO_WEEK_SESSION_DAYS,
} from '@/lib/mindTrack2WeekContent';
import type { MindTrackAudience } from '@/lib/mindTrackDayCopy';

type Step = 'coaching' | 'journal' | 'feedback';

interface Props {
  enrollmentId: string;
  day: number;
  audience: MindTrackAudience;
}

export default function TwoWeekSessionView({ enrollmentId, day, audience }: Props) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const content = useMemo(() => getSessionContent(day, audience), [day, audience]);
  const sessionIdx = getSessionIndex(day);

  const [step, setStep] = useState<Step>('coaching');
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 진행 상태 복원
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('mind_track_session_logs')
        .select('answers, feedback')
        .eq('enrollment_id', enrollmentId)
        .eq('day_number', day)
        .maybeSingle();
      if (cancelled) return;
      const a = (data?.answers as any) || [];
      if (Array.isArray(a)) setAnswers([a[0] || '', a[1] || '', a[2] || '']);
      if (typeof data?.feedback === 'string' && data.feedback) {
        setFeedback(data.feedback);
        setStep('feedback');
      }
    })();
    return () => { cancelled = true; };
  }, [enrollmentId, day]);

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-500">오늘은 세션이 없어요.</p>
      </div>
    );
  }

  const allAnswered = answers.every((a) => a.trim().length >= 5);

  const handleGenerateFeedback = async () => {
    if (!allAnswered) {
      toast.error('각 질문에 5자 이상 답해주세요');
      return;
    }
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('로그인이 필요합니다');
      setSubmitting(false);
      return;
    }
    try {
      const journalText = content.journalPrompts
        .map((q, i) => `Q${i + 1}. ${q}\nA. ${answers[i]}`)
        .join('\n\n');

      const { data, error } = await supabase.functions.invoke('mind-track-coaching-chat', {
        body: {
          systemPrompt: content.feedbackSystemPrompt,
          userMessage: journalText,
        },
      });
      if (error) throw error;
      const text: string = data?.message || data?.reply || '피드백을 생성하지 못했어요. 잠시 후 다시 시도해주세요.';
      setFeedback(text);
      setStep('feedback');

      await supabase.from('mind_track_session_logs').upsert([{
        enrollment_id: enrollmentId,
        user_id: user.id,
        day_number: day,
        step: 'completed',
        answers: answers as any,
        feedback: text,
        meta: { completed_at: new Date().toISOString() } as any,
      }], { onConflict: 'enrollment_id,day_number' });
    } catch (e: any) {
      const fallback = `오늘 기록을 잘 남기셨어요. 핵심 키워드는 "${answers[0].split(/\s|,|\./)[0] || '관찰'}" 같아요. 다음 세션까지 같은 장면을 한 번만 더 관찰해보세요.`;
      setFeedback(fallback);
      setStep('feedback');
      await supabase.from('mind_track_session_logs').upsert([{
        enrollment_id: enrollmentId,
        user_id: user.id,
        day_number: day,
        step: 'completed',
        answers: answers as any,
        feedback: fallback,
        meta: { completed_at: new Date().toISOString(), fallback: true } as any,
      }], { onConflict: 'enrollment_id,day_number' });
    } finally {
      setSubmitting(false);
    }
  };

  const StepBadge = ({ active, done, label, icon: Icon }: { active: boolean; done: boolean; label: string; icon: any }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition ${
      active ? 'bg-slate-900 text-white' : done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
    }`}>
      {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          onClick={() => navigate('/mind-track/dashboard')}
          className="text-sm text-slate-500 hover:text-slate-900 mb-6 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> 대시보드
        </button>

        <div className="mb-6">
          <p className="text-xs tracking-wider text-[#8a7a4d] font-semibold mb-2">
            DAY {day} · 세션 {sessionIdx + 1} / {TWO_WEEK_SESSION_DAYS.length}
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 break-keep">{content.title}</h1>
          <p className="text-slate-600 mt-2 break-keep">{content.goal}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <StepBadge active={step === 'coaching'} done={step !== 'coaching'} label="코칭" icon={Sparkles} />
          <StepBadge active={step === 'journal'} done={step === 'feedback'} label="관찰 일지" icon={BookOpen} />
          <StepBadge active={step === 'feedback'} done={!!feedback && step === 'feedback'} label="피드백" icon={MessageSquareHeart} />
        </div>

        {step === 'coaching' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl">
              <ul className="space-y-4">
                {content.coaching.map((line, i) => (
                  <li key={i} className="flex gap-3 text-slate-700 leading-relaxed break-keep">
                    <span className="text-[#C8B88A] font-bold">{String(i + 1).padStart(2, '0')}</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Button className="w-full mt-6 h-12 rounded-2xl text-base" onClick={() => setStep('journal')}>
              관찰 일지 작성하기 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {step === 'journal' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {content.journalPrompts.map((q, i) => (
              <Card key={i} className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl">
                <p className="text-sm font-semibold text-slate-900 mb-3 break-keep">
                  Q{i + 1}. {q}
                </p>
                <Textarea
                  value={answers[i]}
                  onChange={(e) => setAnswers((arr) => arr.map((a, j) => (j === i ? e.target.value : a)))}
                  placeholder="솔직하게 적어주세요. 짧아도 좋아요."
                  rows={3}
                  className="resize-none"
                />
              </Card>
            ))}
            <Button
              className="w-full h-12 rounded-2xl text-base"
              disabled={!allAnswered || submitting}
              onClick={handleGenerateFeedback}
            >
              {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />피드백 생성 중…</>) : '피드백 받기'}
            </Button>
          </motion.div>
        )}

        {step === 'feedback' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 sm:p-8 bg-white border border-[#C8B88A]/40 rounded-3xl">
              <div className="flex items-center gap-2 text-[#8a7a4d] text-sm font-semibold mb-4">
                <MessageSquareHeart className="w-4 h-4" /> 오늘의 코칭 피드백
              </div>
              <p className="text-slate-800 leading-relaxed whitespace-pre-line break-keep">{feedback}</p>
            </Card>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1 h-12 rounded-2xl" onClick={() => setStep('journal')}>
                일지 수정
              </Button>
              <Button className="flex-1 h-12 rounded-2xl" onClick={() => navigate('/mind-track/dashboard')}>
                완료
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
