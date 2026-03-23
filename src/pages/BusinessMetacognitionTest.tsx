import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Brain, Target, Shield, BookOpen, BarChart3, Trophy, AlertTriangle, TrendingUp, Zap, CheckCircle, FileText, MessageSquare, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { useNavigate } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { SubscriptionGuard } from '@/components/subscription/SubscriptionGuard';
import { useTranslation } from '@/i18n';

const getQuestions = (b: any) => [
  { id: 1, text: b.q1, category: 'selfAwareness' },
  { id: 2, text: b.q2, category: 'selfAwareness' },
  { id: 3, text: b.q3, category: 'selfAwareness' },
  { id: 4, text: b.q4, category: 'selfAwareness' },
  { id: 5, text: b.q5, category: 'selfAwareness' },
  { id: 6, text: b.q6, category: 'verification' },
  { id: 7, text: b.q7, category: 'verification' },
  { id: 8, text: b.q8, category: 'verification' },
  { id: 9, text: b.q9, category: 'verification' },
  { id: 10, text: b.q10, category: 'verification' },
  { id: 11, text: b.q11, category: 'regulation', reverse: true },
  { id: 12, text: b.q12, category: 'regulation' },
  { id: 13, text: b.q13, category: 'regulation' },
  { id: 14, text: b.q14, category: 'regulation' },
  { id: 15, text: b.q15, category: 'regulation' },
  { id: 16, text: b.q16, category: 'learning' },
  { id: 17, text: b.q17, category: 'learning' },
  { id: 18, text: b.q18, category: 'learning' },
  { id: 19, text: b.q19, category: 'learning' },
  { id: 20, text: b.q20, category: 'learning' },
];

interface LevelInfo {
  name: string;
  diagnosis: string;
  message: string;
  color: string;
  bgGradient: string;
  icon: React.ReactNode;
  training: { title: string; items: string[] };
}

const getLevelInfo = (score: number, b: any): LevelInfo => {
  if (score >= 85) return {
    name: b.scaleLevel,
    diagnosis: b.scaleDiag,
    message: b.scaleMsg,
    color: 'text-emerald-700',
    bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
    icon: <Trophy className="w-8 h-8 text-emerald-600" />,
    training: { title: b.scaleTrainTitle, items: b.scaleTrainItems },
  };
  if (score >= 70) return {
    name: b.growthLevel,
    diagnosis: b.growthDiag,
    message: b.growthMsg,
    color: 'text-blue-700',
    bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
    icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
    training: { title: b.growthTrainTitle, items: b.growthTrainItems },
  };
  if (score >= 55) return {
    name: b.emotionLevel,
    diagnosis: b.emotionDiag,
    message: b.emotionMsg,
    color: 'text-amber-700',
    bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
    icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
    training: { title: b.emotionTrainTitle, items: b.emotionTrainItems },
  };
  return {
    name: b.illusionLevel,
    diagnosis: b.illusionDiag,
    message: b.illusionMsg,
    color: 'text-red-700',
    bgGradient: 'from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
    icon: <Zap className="w-8 h-8 text-red-600" />,
    training: { title: b.illusionTrainTitle, items: b.illusionTrainItems },
  };
};

const BusinessMetacognitionTestInner: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const b = t.bizMeta;
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const QUESTIONS = getQuestions(b);

  const LIKERT_OPTIONS = [
    { value: 1, label: b.likert1 },
    { value: 2, label: b.likert2 },
    { value: 3, label: b.likert3 },
    { value: 4, label: b.likert4 },
    { value: 5, label: b.likert5 },
  ];

  const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    selfAwareness: { label: b.selfAwareness, icon: <Brain className="w-5 h-5" />, color: 'text-violet-600' },
    verification: { label: b.verification, icon: <Target className="w-5 h-5" />, color: 'text-blue-600' },
    regulation: { label: b.regulation, icon: <Shield className="w-5 h-5" />, color: 'text-amber-600' },
    learning: { label: b.learning, icon: <BookOpen className="w-5 h-5" />, color: 'text-emerald-600' },
  };

  const handleAnswer = (questionId: number, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    }
  };

  const calculateResults = () => {
    const categoryScores: Record<string, number> = { selfAwareness: 0, verification: 0, regulation: 0, learning: 0 };
    QUESTIONS.forEach((q) => {
      const raw = answers[q.id] || 3;
      const score = q.reverse ? (6 - raw) : raw;
      categoryScores[q.category] += score;
    });
    const total = Object.values(categoryScores).reduce((a, c) => a + c, 0);
    return { categoryScores, total };
  };

  const allAnswered = Object.keys(answers).length === QUESTIONS.length;

  // INTRO
  if (phase === 'intro') {
    return (
      <div>
        <UnifiedNavigation />
        <div className="min-h-screen bg-background pt-4">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Button variant="ghost" size="sm" onClick={() => navigate('/premium-assessment')} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />{b.prev}
            </Button>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-200 dark:to-slate-400 mb-6 shadow-lg">
                <Brain className="w-10 h-10 text-white dark:text-slate-900" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{b.title}</h1>
              <p className="text-muted-foreground text-sm md:text-base">{b.subtitle}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4 mb-10">
              {[
                { icon: <BarChart3 className="w-5 h-5" />, label: b.items20 },
                { icon: <Target className="w-5 h-5" />, label: b.indicators4 },
                { icon: <Brain className="w-5 h-5" />, label: b.customTraining },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50">
                  <div className="text-primary">{item.icon}</div>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
              ))}
            </motion.div>

            <p className="text-xs text-muted-foreground text-center mb-6 whitespace-pre-line">{b.introDesc}</p>

            <Button onClick={() => setPhase('test')} className="w-full h-14 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl">
              {b.startTest}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // TEST
  if (phase === 'test') {
    const q = QUESTIONS[currentQ];
    const progress = ((currentQ + (answers[q.id] ? 1 : 0)) / QUESTIONS.length) * 100;
    const catMeta = CATEGORY_META[q.category];

    return (
      <div>
        <UnifiedNavigation />
        <div className="min-h-screen bg-background pt-4">
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="sm" onClick={() => {
                if (currentQ > 0) setCurrentQ(currentQ - 1);
                else setPhase('intro');
              }}>
                <ArrowLeft className="w-4 h-4 mr-1" />{b.prev}
              </Button>
              <span className="text-sm font-mono text-muted-foreground">{currentQ + 1} / {QUESTIONS.length}</span>
            </div>

            <Progress value={progress} className="h-1.5 mb-8" />

            <div className="flex items-center gap-2 mb-4">
              <span className={`${catMeta.color}`}>{catMeta.icon}</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{catMeta.label}</span>
              {q.reverse && <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-medium">{b.reverseItem}</span>}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-lg md:text-xl font-bold text-foreground leading-relaxed mb-8">{q.text}</h2>

                <div className="space-y-3">
                  {LIKERT_OPTIONS.map((opt) => {
                    const selected = answers[q.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(q.id, opt.value)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          selected
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-border hover:border-primary/40 hover:bg-muted/50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>{opt.value}</div>
                        <span className={`text-sm md:text-base font-medium ${selected ? 'text-foreground' : 'text-muted-foreground'}`}>{opt.label}</span>
                        {selected && <CheckCircle className="w-5 h-5 text-primary ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex gap-3">
              {currentQ < QUESTIONS.length - 1 ? (
                <Button onClick={() => setCurrentQ(currentQ + 1)} disabled={!answers[q.id]} className="flex-1 h-12 rounded-xl">
                  {b.next} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={() => setPhase('result')} disabled={!allAnswered} className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900">
                  {b.viewResult}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RESULT
  const { categoryScores, total } = calculateResults();
  const level = getLevelInfo(total, b);
  const CATEGORY_META_RESULT: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    selfAwareness: { label: b.selfAwareness, icon: <Brain className="w-5 h-5" />, color: 'text-violet-600' },
    verification: { label: b.verification, icon: <Target className="w-5 h-5" />, color: 'text-blue-600' },
    regulation: { label: b.regulation, icon: <Shield className="w-5 h-5" />, color: 'text-amber-600' },
    learning: { label: b.learning, icon: <BookOpen className="w-5 h-5" />, color: 'text-emerald-600' },
  };

  const radarData = Object.entries(categoryScores).map(([key, score]) => ({
    subject: CATEGORY_META_RESULT[key].label,
    value: score,
    fullMark: 25,
  }));

  const weakest = Object.entries(categoryScores).sort((a, b) => a[1] - b[1])[0];
  const weakLabel = CATEGORY_META_RESULT[weakest[0]].label;

  return (
    <div>
      <UnifiedNavigation />
      <div className="min-h-screen bg-background pt-4">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Button variant="ghost" size="sm" onClick={() => navigate('/premium-assessment')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />{b.backToList}
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 md:p-8 rounded-2xl bg-gradient-to-br ${level.bgGradient} border border-border mb-8`}
          >
            <div className="flex items-start gap-4 mb-4">
              {level.icon}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{b.yourLevel}</p>
                <h2 className={`text-2xl md:text-3xl font-bold ${level.color}`}>{level.name}</h2>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-black text-foreground">{total}</span>
              <span className="text-lg text-muted-foreground font-medium">{b.outOf100}</span>
            </div>
            <p className="text-base text-foreground font-medium mb-2">{level.diagnosis}</p>
            <p className="text-sm text-muted-foreground italic">"{level.message}"</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 rounded-2xl border border-border bg-card mb-8"
          >
            <h3 className="text-lg font-bold text-foreground mb-4">{b.fourIndicators}</h3>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 25]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Radar name={b.selfAwareness} dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-3">
              {Object.entries(categoryScores).map(([key, score]) => {
                const meta = CATEGORY_META_RESULT[key];
                const pct = (score / 25) * 100;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <span className={meta.color}>{meta.icon}</span>{meta.label}
                      </span>
                      <span className="text-sm font-bold text-foreground">{score}/25</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-5 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 mb-8"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-foreground text-sm mb-1">{b.riskSummary}</h4>
                <p className="text-sm text-foreground">{`${weakLabel} - ${weakest[1]}/25`}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-6 rounded-2xl border border-border bg-card mb-6"
          >
            <h3 className="text-lg font-bold text-foreground mb-1">{b.dailyRoutineTitle}</h3>
            <p className="text-xs text-muted-foreground mb-4">{b.dailyRoutineDesc}</p>
            <div className="space-y-2.5">
              {b.dailyItems.map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                  <span className="text-foreground font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className={`p-6 rounded-2xl border border-border bg-gradient-to-br ${level.bgGradient} mb-8`}
          >
            <div className="flex items-center gap-2 mb-4">
              {level.icon}
              <h3 className="text-lg font-bold text-foreground">{level.training.title}</h3>
            </div>
            <div className="space-y-3">
              {level.training.items.map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="space-y-3 mb-8"
          >
            <Button onClick={() => navigate('/token-subscription')} className="w-full h-14 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-base font-semibold">
              <FileText className="w-5 h-5 mr-2" />{b.ctaPdf}
            </Button>
            <Button variant="outline" onClick={() => navigate('/report-generator')} className="w-full h-14 rounded-xl text-base font-semibold border-2">
              <BarChart3 className="w-5 h-5 mr-2" />{b.ctaReport}
            </Button>
            <Button variant="outline" onClick={() => navigate('/expert-hiring')} className="w-full h-14 rounded-xl text-base font-semibold border-2">
              <MessageSquare className="w-5 h-5 mr-2" />{b.ctaExpert}
            </Button>
          </motion.div>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed mb-8 whitespace-pre-line">{b.disclaimer}</p>
        </div>
      </div>
    </div>
  );
};

const BusinessMetacognitionTest: React.FC = () => {
  const { t } = useTranslation();
  return (
    <SubscriptionGuard consumeAt="result" featureName={t.testPages.businessMetacognition} trialKey="PSYCHOLOGICAL_TEST">
      <BusinessMetacognitionTestInner />
    </SubscriptionGuard>
  );
};

export default BusinessMetacognitionTest;
