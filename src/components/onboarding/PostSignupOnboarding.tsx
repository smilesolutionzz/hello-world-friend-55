import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Baby, User as UserIcon, ArrowRight, ArrowLeft,
  Sparkles, Shield, Heart, Brain, MessageCircle,
  CheckCircle2
} from 'lucide-react';

interface PostSignupOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const CONCERN_OPTIONS = [
  { label: '주의력/ADHD', icon: '🎯', key: 'attention' },
  { label: '정서/불안', icon: '💛', key: 'emotion' },
  { label: '발달 지연', icon: '🧒', key: 'development' },
  { label: '언어 발달', icon: '💬', key: 'language' },
  { label: '사회성', icon: '🤝', key: 'social' },
  { label: '학습/인지', icon: '📚', key: 'learning' },
  { label: '행동 문제', icon: '⚡', key: 'behavior' },
  { label: '수면/식습관', icon: '🌙', key: 'sleep' },
  { label: '스트레스', icon: '😓', key: 'stress' },
  { label: '사춘기/반항', icon: '🔥', key: 'puberty' },
  { label: '육아 번아웃', icon: '😵', key: 'burnout' },
  { label: '그냥 궁금해서', icon: '✨', key: 'curious' },
];

const BASELINE_QUESTIONS = [
  {
    id: 'daily_difficulty',
    question: '일상생활에서 어려움을 느끼는 정도는?',
    options: ['전혀 없음', '가끔', '자주', '매일'],
  },
  {
    id: 'emotional_state',
    question: '최근 2주간 정서 상태는 어땠나요?',
    options: ['매우 안정', '대체로 안정', '불안정할 때 있음', '많이 불안정'],
  },
  {
    id: 'sleep_quality',
    question: '수면의 질은 어떤가요?',
    options: ['매우 좋음', '보통', '좋지 않음', '심각하게 나쁨'],
  },
  {
    id: 'social_interaction',
    question: '또래/사회적 관계는 어떤가요?',
    options: ['매우 좋음', '보통', '어려움 있음', '많이 힘듦'],
  },
  {
    id: 'concern_duration',
    question: '현재 고민이 지속된 기간은?',
    options: ['최근 시작', '1~3개월', '3~6개월', '6개월 이상'],
  },
];

export const PostSignupOnboarding: React.FC<PostSignupOnboardingProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1: Subject
  const [subjectType, setSubjectType] = useState<'child' | 'self' | ''>('');
  const [childAge, setChildAge] = useState<number | null>(null);
  const [childGender, setChildGender] = useState<'male' | 'female' | ''>('');

  // Step 2: Concerns
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);

  // Step 3: Baseline
  const [baselineAnswers, setBaselineAnswers] = useState<Record<string, number>>({});

  const toggleConcern = (key: string) => {
    setSelectedConcerns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const canProceedStep0 = subjectType === 'self' || (subjectType === 'child' && childAge !== null);
  const canProceedStep1 = selectedConcerns.length > 0;
  const canProceedStep2 = Object.keys(baselineAnswers).length >= 3;

  const handleComplete = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await (supabase.from('user_onboarding_data') as any).upsert({
        user_id: user.id,
        subject_type: subjectType || 'child',
        child_age: childAge,
        child_gender: childGender || null,
        concern_keywords: selectedConcerns,
        baseline_answers: baselineAnswers,
        onboarding_completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      localStorage.setItem('onboarding_completed', 'true');
      
      toast({
        title: '✅ 프로필 설정 완료!',
        description: '맞춤 고민 리포트로 이동합니다.',
      });
      onClose();
      onComplete?.();
    } catch (err) {
      console.error('Onboarding save error:', err);
      localStorage.setItem('onboarding_completed', 'true');
      onClose();
      onComplete?.();
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = 3;
  const progressPercent = ((step + 1) / totalSteps) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] p-0 border-0 overflow-hidden bg-transparent shadow-2xl gap-0">
        <div className="relative bg-card rounded-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1.5 bg-muted">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/70"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Header */}
          <div className="px-6 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">맞춤 분석 설정</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {step + 1}/{totalSteps}
            </Badge>
          </div>

          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              {/* Step 0: Subject Selection */}
              {step === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">누구를 위한 분석인가요?</h2>
                    <p className="text-sm text-muted-foreground">대상에 맞는 정밀 분석을 제공합니다</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSubjectType('child')}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        subjectType === 'child'
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <Baby className={`w-8 h-8 mb-2 ${subjectType === 'child' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="font-semibold text-foreground">우리 아이</p>
                      <p className="text-xs text-muted-foreground mt-0.5">자녀 발달·심리 분석</p>
                    </button>
                    <button
                      onClick={() => { setSubjectType('self'); setChildAge(null); setChildGender(''); }}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        subjectType === 'self'
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <UserIcon className={`w-8 h-8 mb-2 ${subjectType === 'self' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="font-semibold text-foreground">나 자신</p>
                      <p className="text-xs text-muted-foreground mt-0.5">본인 심리·건강 분석</p>
                    </button>
                  </div>

                  {subjectType === 'child' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3"
                    >
                      <p className="text-sm font-medium text-foreground">아이 나이</p>
                      <div className="grid grid-cols-6 gap-1.5">
                        {Array.from({ length: 18 }, (_, i) => i + 1).map(age => (
                          <Button
                            key={age}
                            variant={childAge === age ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setChildAge(age)}
                            className="h-9 text-xs"
                          >
                            {age}세
                          </Button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <p className="text-sm font-medium text-foreground self-center mr-2">성별</p>
                        <Button
                          variant={childGender === 'male' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setChildGender('male')}
                        >
                          👦 남아
                        </Button>
                        <Button
                          variant={childGender === 'female' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setChildGender('female')}
                        >
                          👧 여아
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-between pt-2">
                    <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
                      나중에 할게요
                    </button>
                    <Button onClick={() => setStep(1)} disabled={!canProceedStep0}>
                      다음 <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Concern Keywords */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">어떤 부분이 궁금하세요?</h2>
                    <p className="text-sm text-muted-foreground">여러 개 선택할 수 있어요 (최소 1개)</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {CONCERN_OPTIONS.map(concern => (
                      <button
                        key={concern.key}
                        onClick={() => toggleConcern(concern.key)}
                        className={`p-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                          selectedConcerns.includes(concern.key)
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <span className="text-xl">{concern.icon}</span>
                        <span className="text-[11px] font-medium text-foreground leading-tight text-center">{concern.label}</span>
                      </button>
                    ))}
                  </div>

                  {selectedConcerns.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedConcerns.map(key => {
                        const c = CONCERN_OPTIONS.find(o => o.key === key);
                        return (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {c?.icon} {c?.label}
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
                      <ArrowLeft className="w-4 h-4 mr-1" /> 이전
                    </Button>
                    <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
                      다음 <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Baseline Quick Check */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">간편 상태 체크</h2>
                    <p className="text-sm text-muted-foreground">5문항으로 기초 상태를 파악합니다</p>
                  </div>

                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {BASELINE_QUESTIONS.map((q, qi) => (
                      <div key={q.id} className="space-y-1.5">
                        <p className="text-sm font-medium text-foreground">
                          <span className="text-primary mr-1">{qi + 1}.</span>
                          {q.question}
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {q.options.map((opt, oi) => (
                            <button
                              key={oi}
                              onClick={() => setBaselineAnswers(prev => ({ ...prev, [q.id]: oi }))}
                              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                                baselineAnswers[q.id] === oi
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border text-muted-foreground hover:border-primary/30'
                              }`}
                            >
                              {baselineAnswers[q.id] === oi && (
                                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                              )}
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-1" /> 이전
                    </Button>
                    <Button
                      onClick={handleComplete}
                      disabled={!canProceedStep2 || saving}
                      className="bg-gradient-to-r from-primary to-primary/80"
                    >
                      {saving ? '저장 중...' : '분석 시작하기'}
                      <Sparkles className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer trust badges */}
          <div className="px-6 pb-4 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 개인정보 보호</span>
            <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> AI 즉시 반영</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> 맞춤형 리포트</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
