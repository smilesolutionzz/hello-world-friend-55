import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Baby, MessageCircle, ArrowRight, Heart, Brain, Shield } from 'lucide-react';
import { useTrialProfile } from '@/hooks/useTrialProfile';
import { motion, AnimatePresence } from 'framer-motion';

interface TrialOnboardingProps {
  onComplete: () => void;
}

const CONCERN_KEYWORDS = [
  { label: '발달 지연', icon: '🧒', key: 'development' },
  { label: '주의력/집중', icon: '🎯', key: 'attention' },
  { label: '정서/불안', icon: '💛', key: 'emotion' },
  { label: '언어 발달', icon: '💬', key: 'language' },
  { label: '사회성', icon: '🤝', key: 'social' },
  { label: '학습/인지', icon: '📚', key: 'learning' },
  { label: '행동 문제', icon: '⚡', key: 'behavior' },
  { label: '수면/식습관', icon: '🌙', key: 'sleep' },
  { label: '그냥 궁금해서', icon: '✨', key: 'curious' },
];

const TrialOnboarding: React.FC<TrialOnboardingProps> = ({ onComplete }) => {
  const { saveProfile } = useTrialProfile();
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [childAge, setChildAge] = useState('');
  const [selectedConcern, setSelectedConcern] = useState('');

  const handleSubmit = () => {
    if (!nickname.trim() || !childAge || !selectedConcern) return;
    
    saveProfile({
      nickname: nickname.trim(),
      childAge: parseInt(childAge),
      concernKeyword: selectedConcern,
    });
    onComplete();
  };

  const canProceedStep1 = nickname.trim().length >= 1;
  const canProceedStep2 = childAge !== '';
  const canSubmit = selectedConcern !== '';

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* 상단 브랜딩 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">3분 무료 체험</span>
          </div>
          <h1 className="text-2xl font-bold mb-1 text-foreground">간단 정보만 입력하고</h1>
          <p className="text-foreground/80 text-sm font-medium">AI 발달·심리 분석을 바로 체험하세요</p>
        </div>

        {/* 진행바 */}
        <div className="flex gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`} 
            />
          ))}
        </div>

        <Card className="border-primary/10 shadow-xl">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: 닉네임 */}
              {step === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">어떻게 불러드릴까요?</h2>
                      <p className="text-xs text-muted-foreground">닉네임 또는 호칭을 입력해주세요</p>
                    </div>
                  </div>
                  <div>
                    <Input
                      placeholder="예: 서준이맘, 하늘아빠"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="h-12 text-base"
                      maxLength={20}
                      autoFocus
                    />
                  </div>
                  <Button 
                    onClick={() => setStep(1)} 
                    disabled={!canProceedStep1} 
                    className="w-full h-12"
                  >
                    다음 <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: 아이 나이 */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Baby className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">아이 나이가 어떻게 되나요?</h2>
                      <p className="text-xs text-muted-foreground">연령에 맞는 분석을 제공합니다</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 16 }, (_, i) => i + 1).map((age) => (
                      <Button
                        key={age}
                        variant={childAge === String(age) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChildAge(String(age))}
                        className="h-10"
                      >
                        {age}세
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setStep(0)} className="flex-1">
                      이전
                    </Button>
                    <Button 
                      onClick={() => setStep(2)} 
                      disabled={!canProceedStep2} 
                      className="flex-1 h-12"
                    >
                      다음 <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: 고민 키워드 */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">어떤 부분이 궁금하세요?</h2>
                      <p className="text-xs text-muted-foreground">관심사에 맞춰 추천해드려요</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {CONCERN_KEYWORDS.map((concern) => (
                      <Button
                        key={concern.key}
                        variant={selectedConcern === concern.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedConcern(concern.key)}
                        className="h-auto py-3 flex-col gap-1 text-xs"
                      >
                        <span className="text-lg">{concern.icon}</span>
                        <span>{concern.label}</span>
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">
                      이전
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={!canSubmit} 
                      className="flex-1 h-12 bg-gradient-to-r from-primary to-purple-600"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      체험 시작하기
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* 하단 안내 */}
        <div className="text-center mt-4 space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 개인정보 안전</span>
            <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> AI 즉시 분석</span>
          </div>
          <p className="text-xs text-muted-foreground">
            이미 계정이 있으신가요?{' '}
            <a href="/auth" className="text-primary font-medium underline">로그인</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TrialOnboarding;
