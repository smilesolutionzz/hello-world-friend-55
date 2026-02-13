import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Brain, Target, Shield, BookOpen, BarChart3, Trophy, AlertTriangle, TrendingUp, Zap, CheckCircle, FileText, MessageSquare, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { useNavigate } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

// ─── 문항 데이터 ───
const QUESTIONS = [
  // A. 자기인식 (1-5)
  { id: 1, text: '나는 지금 내 판단에 감정이 섞였는지 구분할 수 있다.', category: 'selfAwareness' },
  { id: 2, text: '나는 "모른다/확신 없다"를 비교적 빠르게 인정한다.', category: 'selfAwareness' },
  { id: 3, text: '의사결정 전, 목적을 한 문장으로 정리한다.', category: 'selfAwareness' },
  { id: 4, text: '내 컨디션(피로·불안)이 판단에 영향을 주는 걸 인지한다.', category: 'selfAwareness' },
  { id: 5, text: '상대가 이해 못하면 내 설명을 먼저 점검한다.', category: 'selfAwareness' },
  // B. 점검력 (6-10)
  { id: 6, text: '중요한 결정은 근거(숫자·사례)를 최소 1개 확인한다.', category: 'verification' },
  { id: 7, text: '"이게 틀렸다면 왜 틀릴까?"를 미리 생각한다.', category: 'verification' },
  { id: 8, text: '직감이 강해도 반대 의견을 일부러 찾아본다.', category: 'verification' },
  { id: 9, text: 'KPI나 지표 없이는 실행을 보류한다.', category: 'verification' },
  { id: 10, text: '실패 시 사람보다 구조·가설을 먼저 본다.', category: 'verification' },
  // C. 조절력 (11-15)
  { id: 11, text: '이미 쓴 돈·시간 때문에 계속 끌고 가는 편이다.', category: 'regulation', reverse: true },
  { id: 12, text: '틀리면 빨리 수정하는 게 낫다고 생각한다.', category: 'regulation' },
  { id: 13, text: '내가 없어도 돌아가게 프로세스를 만든다.', category: 'regulation' },
  { id: 14, text: '감정이 흔들릴 땐 결정을 하루 미룬다.', category: 'regulation' },
  { id: 15, text: '내 역할을 실행자보다 시스템 설계자로 본다.', category: 'regulation' },
  // D. 학습력 (16-20)
  { id: 16, text: '주요 결정은 기록하고 결과를 복기한다.', category: 'learning' },
  { id: 17, text: '피드백을 공격이 아닌 데이터로 받아들인다.', category: 'learning' },
  { id: 18, text: '잘된 이유보다 안된 이유를 더 분석한다.', category: 'learning' },
  { id: 19, text: '같은 실수를 막는 규칙을 만든다.', category: 'learning' },
  { id: 20, text: '조언은 실험 단위로 적용한다.', category: 'learning' },
];

const LIKERT_OPTIONS = [
  { value: 1, label: '전혀 아니다' },
  { value: 2, label: '아니다' },
  { value: 3, label: '보통' },
  { value: 4, label: '그렇다' },
  { value: 5, label: '매우 그렇다' },
];

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  selfAwareness: { label: '자기인식', icon: <Brain className="w-5 h-5" />, color: 'text-violet-600' },
  verification: { label: '점검력', icon: <Target className="w-5 h-5" />, color: 'text-blue-600' },
  regulation: { label: '조절력', icon: <Shield className="w-5 h-5" />, color: 'text-amber-600' },
  learning: { label: '학습력', icon: <BookOpen className="w-5 h-5" />, color: 'text-emerald-600' },
};

// ─── 결과 레벨 ───
interface LevelInfo {
  name: string;
  diagnosis: string;
  message: string;
  color: string;
  bgGradient: string;
  icon: React.ReactNode;
  training: { title: string; items: string[] };
}

const getLevelInfo = (score: number): LevelInfo => {
  if (score >= 85) return {
    name: '스케일형 메타 CEO',
    diagnosis: '판단 정확도와 수정 속도가 매우 높습니다.',
    message: '확장 가능한 구조를 만들 수 있는 단계입니다.',
    color: 'text-emerald-700',
    bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
    icon: <Trophy className="w-8 h-8 text-emerald-600" />,
    training: {
      title: '스케일업 루틴',
      items: [
        'KPI 2개만 유지하고 나머지는 위임하라',
        '대표 부재 48시간 테스트를 월 1회 실행하라',
        '의사결정 위임 매트릭스를 문서화하라',
        '분기별 "시스템 스트레스 테스트"를 돌려라',
      ],
    },
  };
  if (score >= 70) return {
    name: '성장형 메타 운영자',
    diagnosis: '기본기는 탄탄하나 특정 상황에서 감정 개입 가능성 있음.',
    message: '결정 구조를 고정하면 성과가 안정됩니다.',
    color: 'text-blue-700',
    bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
    icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
    training: {
      title: '30일 시스템화 루틴',
      items: [
        '결정 템플릿을 문서화하라 (목적→근거→반증→실행)',
        '주간 복기 시간을 금요일 30분으로 고정하라',
        '"감정 태그" 일지를 7일간 기록하라',
        '반복 결정 3개를 SOP로 전환하라',
      ],
    },
  };
  if (score >= 55) return {
    name: '감정개입 구간',
    diagnosis: '노력 대비 성과 변동이 큰 상태.',
    message: '고집·매몰비용 관리가 핵심입니다.',
    color: 'text-amber-700',
    bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
    icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
    training: {
      title: '14일 안정화 루틴',
      items: [
        '"하루 보류 규칙"을 즉시 적용하라 — 큰 결정은 24시간 후 결정',
        '반증 질문 3개를 매 결정 전 체크하라',
        '매몰비용 체크리스트를 만들어라 (이미 투입한 것 vs 앞으로의 기대값)',
        '감정 흔들림 시 "5분 타이머"를 설정하라',
      ],
    },
  };
  return {
    name: '착각 리스크 구간',
    diagnosis: '구조 점검 없이 실행량만 많은 상태일 가능성.',
    message: '지금은 리셋이 필요한 시점입니다.',
    color: 'text-red-700',
    bgGradient: 'from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
    icon: <Zap className="w-8 h-8 text-red-600" />,
    training: {
      title: '7일 리셋 루틴',
      items: [
        'Day 1-2: 지금 하는 일을 한 줄로 정리하라',
        'Day 3-4: KPI 1개만 정하라 (나머지 전부 보류)',
        'Day 5-6: 오퍼를 절반으로 축소하라',
        'Day 7: "내가 빠져도 돌아가는가?" 질문 1개에 답하라',
      ],
    },
  };
};

// ─── 컴포넌트 ───
const BusinessMetacognitionTest: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleAnswer = (questionId: number, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    // 자동으로 다음 문항으로
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
    const total = Object.values(categoryScores).reduce((a, b) => a + b, 0);
    return { categoryScores, total };
  };

  const allAnswered = Object.keys(answers).length === QUESTIONS.length;

  // ─── INTRO ───
  if (phase === 'intro') {
    return (
      <div>
        <UnifiedNavigation />
        <div className="min-h-screen bg-background pt-4">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Button variant="ghost" size="sm" onClick={() => navigate('/premium-assessment')} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />뒤로
            </Button>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-200 dark:to-slate-400 mb-6 shadow-lg">
                <Brain className="w-10 h-10 text-white dark:text-slate-900" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                사업가 메타인지 레벨 테스트
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                대표·원장·1인창업자를 위한 판단력 자가진단
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4 mb-10">
              {[
                { icon: <BarChart3 className="w-5 h-5" />, label: '20문항 · 약 3분 소요' },
                { icon: <Target className="w-5 h-5" />, label: '4개 하위 지표: 자기인식 / 점검력 / 조절력 / 학습력' },
                { icon: <Brain className="w-5 h-5" />, label: '레벨별 맞춤 훈련법 즉시 제공' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50">
                  <div className="text-primary">{item.icon}</div>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
              ))}
            </motion.div>

            <p className="text-xs text-muted-foreground text-center mb-6">
              이 검사는 당신의 '사업적 메타인지' 수준을 측정합니다.<br />
              감정이 아닌 구조와 판단의 관점에서 솔직하게 응답해주세요.
            </p>

            <Button onClick={() => setPhase('test')} className="w-full h-14 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl">
              검사 시작하기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── TEST ───
  if (phase === 'test') {
    const q = QUESTIONS[currentQ];
    const progress = ((currentQ + (answers[q.id] ? 1 : 0)) / QUESTIONS.length) * 100;
    const catMeta = CATEGORY_META[q.category];

    return (
      <div>
        <UnifiedNavigation />
        <div className="min-h-screen bg-background pt-4">
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            {/* 상단 */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="sm" onClick={() => {
                if (currentQ > 0) setCurrentQ(currentQ - 1);
                else setPhase('intro');
              }}>
                <ArrowLeft className="w-4 h-4 mr-1" />이전
              </Button>
              <span className="text-sm font-mono text-muted-foreground">{currentQ + 1} / {QUESTIONS.length}</span>
            </div>

            <Progress value={progress} className="h-1.5 mb-8" />

            {/* 카테고리 태그 */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`${catMeta.color}`}>{catMeta.icon}</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{catMeta.label}</span>
              {q.reverse && <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-medium">역문항</span>}
            </div>

            {/* 질문 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-lg md:text-xl font-bold text-foreground leading-relaxed mb-8">
                  {q.text}
                </h2>

                {/* 리커트 선택 */}
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
                          selected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {opt.value}
                        </div>
                        <span className={`text-sm md:text-base font-medium ${selected ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {opt.label}
                        </span>
                        {selected && <CheckCircle className="w-5 h-5 text-primary ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* 다음/완료 버튼 */}
            <div className="mt-8 flex gap-3">
              {currentQ < QUESTIONS.length - 1 ? (
                <Button
                  onClick={() => setCurrentQ(currentQ + 1)}
                  disabled={!answers[q.id]}
                  className="flex-1 h-12 rounded-xl"
                >
                  다음 <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={() => setPhase('result')}
                  disabled={!allAnswered}
                  className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900"
                >
                  결과 확인하기
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULT ───
  const { categoryScores, total } = calculateResults();
  const level = getLevelInfo(total);

  const radarData = Object.entries(categoryScores).map(([key, score]) => ({
    subject: CATEGORY_META[key].label,
    value: score,
    fullMark: 25,
  }));

  // 약점 영역
  const weakest = Object.entries(categoryScores).sort((a, b) => a[1] - b[1])[0];
  const weakLabel = CATEGORY_META[weakest[0]].label;
  const riskSummary = `${weakLabel} 영역이 ${weakest[1]}점으로 가장 낮습니다. 이 영역의 개선이 전체 메타인지 수준 향상의 핵심입니다.`;

  return (
    <div>
      <UnifiedNavigation />
      <div className="min-h-screen bg-background pt-4">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Button variant="ghost" size="sm" onClick={() => navigate('/premium-assessment')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />심층테스트 목록
          </Button>

          {/* ─── 레벨 카드 ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 md:p-8 rounded-2xl bg-gradient-to-br ${level.bgGradient} border border-border mb-8`}
          >
            <div className="flex items-start gap-4 mb-4">
              {level.icon}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">당신의 레벨</p>
                <h2 className={`text-2xl md:text-3xl font-bold ${level.color}`}>{level.name}</h2>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-black text-foreground">{total}</span>
              <span className="text-lg text-muted-foreground font-medium">/ 100점</span>
            </div>
            <p className="text-base text-foreground font-medium mb-2">{level.diagnosis}</p>
            <p className="text-sm text-muted-foreground italic">"{level.message}"</p>
          </motion.div>

          {/* ─── 레이더 차트 ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 rounded-2xl border border-border bg-card mb-8"
          >
            <h3 className="text-lg font-bold text-foreground mb-4">4대 지표 분석</h3>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 25]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Radar name="점수" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* 하위 점수 바 */}
            <div className="mt-4 space-y-3">
              {Object.entries(categoryScores).map(([key, score]) => {
                const meta = CATEGORY_META[key];
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

          {/* ─── 리스크 요약 ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-5 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 mb-8"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-foreground text-sm mb-1">내 리스크 요약</h4>
                <p className="text-sm text-foreground">{riskSummary}</p>
              </div>
            </div>
          </motion.div>

          {/* ─── 공통 1일 10분 루틴 ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-6 rounded-2xl border border-border bg-card mb-6"
          >
            <h3 className="text-lg font-bold text-foreground mb-1">매일 10분, 메타인지 루틴</h3>
            <p className="text-xs text-muted-foreground mb-4">모든 레벨 공통 — 하루 5줄 기록</p>
            <div className="space-y-2.5">
              {[
                '오늘의 결정 1개',
                '그 결정의 근거 1개',
                '반증(틀릴 가능성) 1개',
                '그때의 감정 상태',
                '다음에 바꿀 것 1개',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-foreground font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ─── 레벨별 훈련법 ─── */}
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
              {level.training.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ─── CTA 버튼 ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="space-y-3 mb-8"
          >
            <Button
              onClick={() => navigate('/token-subscription')}
              className="w-full h-14 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-base font-semibold"
            >
              <FileText className="w-5 h-5 mr-2" />
              의사결정 템플릿 PDF 받기
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/report-generator')}
              className="w-full h-14 rounded-xl text-base font-semibold border-2"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              AIHPro 대표 메타 리포트 받기
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/expert-hiring')}
              className="w-full h-14 rounded-xl text-base font-semibold border-2"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              전문가 코칭 연결
            </Button>
          </motion.div>

          {/* 면책 */}
          <p className="text-[11px] text-muted-foreground text-center leading-relaxed mb-8">
            이 검사는 자기 점검을 위한 자가진단 도구이며, 의학적·법률적 판단의 근거로 사용할 수 없습니다.<br />
            보다 전문적인 진단이 필요하시면 전문가 상담을 권장합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessMetacognitionTest;
