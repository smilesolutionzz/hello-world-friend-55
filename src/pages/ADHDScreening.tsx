import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Home, Brain, AlertTriangle, CheckCircle2, 
  ArrowRight, ArrowLeft, RefreshCw, FileText,
  Clock, Users, BookOpen, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginRequiredOverlay from '@/components/auth/LoginRequiredOverlay';
import SEOHead from '@/components/common/SEOHead';
import { useLanguage } from '@/i18n/LanguageContext';

interface Question {
  id: number;
  category: 'attention' | 'activity' | 'selfcontrol';
  ko: string;
  en: string;
}

const questions: Question[] = [
  { id: 1, category: 'attention', ko: '세부 사항에 주의를 기울이지 못하거나 학교 과제에서 부주의한 실수를 합니다.', en: 'Has difficulty paying attention to details or makes careless mistakes in schoolwork.' },
  { id: 2, category: 'attention', ko: '과제나 놀이 활동에서 지속적으로 주의를 유지하기 어렵습니다.', en: 'Has difficulty sustaining attention in tasks or play activities.' },
  { id: 3, category: 'attention', ko: '다른 사람이 직접 말할 때 경청하지 않는 것처럼 보입니다.', en: 'Does not seem to listen when spoken to directly.' },
  { id: 4, category: 'attention', ko: '지시를 따르지 않고 과제를 완수하지 못합니다.', en: 'Does not follow through on instructions and fails to finish tasks.' },
  { id: 5, category: 'attention', ko: '과제와 활동을 체계적으로 조직하는 데 어려움이 있습니다.', en: 'Has difficulty organizing tasks and activities.' },
  { id: 6, category: 'attention', ko: '지속적인 정신적 노력이 필요한 과제를 피하거나 싫어합니다.', en: 'Avoids or dislikes tasks that require sustained mental effort.' },
  { id: 7, category: 'activity', ko: '손발을 가만히 두지 못하거나 의자에서 몸을 꿈틀거립니다.', en: 'Fidgets with hands or feet or squirms in seat.' },
  { id: 8, category: 'activity', ko: '앉아 있어야 할 상황에서 자리를 떠납니다.', en: 'Leaves seat in situations where remaining seated is expected.' },
  { id: 9, category: 'activity', ko: '부적절한 상황에서 과도하게 뛰어다니거나 기어오릅니다.', en: 'Runs about or climbs excessively in inappropriate situations.' },
  { id: 10, category: 'activity', ko: '조용히 여가 활동에 참여하기 어렵습니다.', en: 'Has difficulty playing or engaging in leisure activities quietly.' },
  { id: 11, category: 'activity', ko: '"끊임없이 움직이는" 것처럼 행동하거나 "모터가 달린 것처럼" 행동합니다.', en: 'Acts as if "driven by a motor" or is constantly on the go.' },
  { id: 12, category: 'activity', ko: '과도하게 말을 많이 합니다.', en: 'Talks excessively.' },
  { id: 13, category: 'selfcontrol', ko: '질문이 끝나기 전에 대답을 불쑥 내뱉습니다.', en: 'Blurts out answers before questions are completed.' },
  { id: 14, category: 'selfcontrol', ko: '자기 차례를 기다리기 어렵습니다.', en: 'Has difficulty waiting for their turn.' },
  { id: 15, category: 'selfcontrol', ko: '다른 사람의 활동을 방해하거나 끼어듭니다.', en: 'Interrupts or intrudes on others\' activities.' },
  { id: 16, category: 'selfcontrol', ko: '결과를 생각하지 않고 행동합니다.', en: 'Acts without thinking about consequences.' },
  { id: 17, category: 'selfcontrol', ko: '감정 조절에 어려움이 있습니다.', en: 'Has difficulty regulating emotions.' },
  { id: 18, category: 'selfcontrol', ko: '위험한 활동을 즐기거나 위험을 무시합니다.', en: 'Enjoys risky activities or ignores danger.' },
];

interface ScreeningResult {
  riskLevel: 'low' | 'moderate' | 'high';
  attentionScore: number;
  activityScore: number;
  selfcontrolScore: number;
  totalScore: number;
  recommendations: string[];
  nextSteps: string[];
}

export default function ADHDScreening() {
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [phase, setPhase] = useState<'intro' | 'questions' | 'analyzing' | 'result'>('intro');
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);

  const progress = (Object.keys(answers).length / questions.length) * 100;

  const answerOptions = isEnglish
    ? [
        { value: 0, label: 'Never', color: 'bg-green-100 hover:bg-green-200 text-green-700' },
        { value: 1, label: 'Sometimes', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' },
        { value: 2, label: 'Often', color: 'bg-orange-100 hover:bg-orange-200 text-orange-700' },
        { value: 3, label: 'Very Often', color: 'bg-red-100 hover:bg-red-200 text-red-700' },
      ]
    : [
        { value: 0, label: '전혀 없음', color: 'bg-green-100 hover:bg-green-200 text-green-700' },
        { value: 1, label: '가끔', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' },
        { value: 2, label: '자주', color: 'bg-orange-100 hover:bg-orange-200 text-orange-700' },
        { value: 3, label: '매우 자주', color: 'bg-red-100 hover:bg-red-200 text-red-700' },
      ];

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: value }));
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
  };

  const handleSubmit = () => {
    setPhase('analyzing');
    let prog = 0;
    const interval = setInterval(() => {
      prog += 3;
      setAnalyzingProgress(prog);
      if (prog >= 100) { clearInterval(interval); calculateResult(); }
    }, 50);
  };

  const calculateResult = () => {
    const attentionScore = questions.filter(q => q.category === 'attention').reduce((s, q) => s + (answers[q.id] || 0), 0);
    const activityScore = questions.filter(q => q.category === 'activity').reduce((s, q) => s + (answers[q.id] || 0), 0);
    const selfcontrolScore = questions.filter(q => q.category === 'selfcontrol').reduce((s, q) => s + (answers[q.id] || 0), 0);
    const totalScore = attentionScore + activityScore + selfcontrolScore;
    const percentage = (totalScore / (questions.length * 3)) * 100;

    let riskLevel: 'low' | 'moderate' | 'high';
    let recommendations: string[];
    let nextSteps: string[];

    if (percentage < 30) {
      riskLevel = 'low';
      recommendations = isEnglish
        ? ['No significant attention difficulties observed at this time', 'Maintain regular daily routines', 'Continue periodic developmental monitoring']
        : ['현재 주의력 관련 어려움이 크게 나타나지 않습니다', '규칙적인 생활 패턴을 유지해주세요', '정기적인 발달 모니터링을 권장합니다'];
      nextSteps = isEnglish
        ? ['Re-assessment recommended in 6 months', 'Continue daily observation', 'Consult a professional if needed']
        : ['6개월 후 재검사 권장', '일상적인 발달 관찰 지속', '필요시 전문가 상담'];
    } else if (percentage < 60) {
      riskLevel = 'moderate';
      recommendations = isEnglish
        ? ['Some attention-related difficulties are observed', 'Structured environment and routines may help', 'Consider professional consultation']
        : ['일부 주의력 관련 어려움이 관찰됩니다', '구조화된 환경과 루틴이 도움될 수 있습니다', '전문가 상담을 고려해보세요'];
      nextSteps = isEnglish
        ? ['Professional counseling recommended', 'Re-assessment in 3 months', 'Start behavior observation journal']
        : ['전문 심리상담사와 상담 권장', '3개월 후 재검사', '행동 관찰 일지 작성 시작'];
    } else {
      riskLevel = 'high';
      recommendations = isEnglish
        ? ['Significant attention-related difficulties are present', 'Professional assessment is necessary', 'Early intervention can be effective']
        : ['주의력 관련 어려움이 두드러지게 나타납니다', '전문가의 정밀 진단이 필요합니다', '조기 개입이 효과적일 수 있습니다'];
      nextSteps = isEnglish
        ? ['Specialist consultation recommended', 'Comprehensive psychological assessment recommended', 'Establish a support system with school/institution']
        : ['소아정신과 전문의 상담 권장', '종합 심리검사 권장', '학교/기관과 협력 체계 구축'];
    }

    setResult({ riskLevel, attentionScore, activityScore, selfcontrolScore, totalScore, recommendations, nextSteps });
    setPhase('result');
  };

  const resetTest = () => {
    setPhase('intro');
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setAnalyzingProgress(0);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'attention': return { label: isEnglish ? 'Attention' : '주의력', icon: BookOpen, color: 'bg-blue-100 text-blue-600' };
      case 'activity': return { label: isEnglish ? 'Activity' : '활동성', icon: Activity, color: 'bg-orange-100 text-orange-600' };
      case 'selfcontrol': return { label: isEnglish ? 'Self-Control' : '자기조절', icon: Clock, color: 'bg-purple-100 text-purple-600' };
      default: return { label: '', icon: Brain, color: '' };
    }
  };

  return (
    <>
      <SEOHead 
        title={isEnglish ? "Attention Self-Check - AIHPRO" : "주의력 자가점검 - AIHPRO | 아동 집중력 체크"}
        description={isEnglish ? "A self-screening tool that systematically evaluates attention, activity, and self-regulation." : "주의력, 활동성, 자기조절 능력을 체계적으로 평가하는 자가점검 도구입니다."}
        keywords={isEnglish ? "attention check,focus screening,ADHD,self-assessment,AIHPRO" : "주의력검사,집중력체크,아동발달,자가점검,AIHPRO"}
        canonicalUrl="https://aihpro.app/adhd-screening"
      />
      <LoginRequiredOverlay>
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
          <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <Home className="w-5 h-5 mr-2" />
                {isEnglish ? 'Home' : '홈으로'}
              </Button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                {isEnglish ? 'Attention Self-Check' : '주의력 자가점검'}
              </h1>
              <div className="w-20" />
            </div>
          </header>

          <main className="container mx-auto px-4 py-8 max-w-2xl">
            <AnimatePresence mode="wait">
              {phase === 'intro' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <Card className="bg-gradient-to-br from-teal-500 to-blue-600 text-white mb-6">
                    <CardContent className="py-8 text-center">
                      <Brain className="w-16 h-16 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold mb-2">{isEnglish ? 'Attention Self-Check' : '주의력 자가점검'}</h2>
                      <p className="opacity-90">{isEnglish ? 'A self-screening tool for attention and self-regulation' : '주의력과 자기조절 능력을 점검하는 자가체크 도구입니다'}</p>
                    </CardContent>
                  </Card>

                  <Card className="mb-6">
                    <CardContent className="py-6">
                      <h3 className="font-bold mb-4">📋 {isEnglish ? 'Test Guide' : '검사 안내'}</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5" />
                          <span>{isEnglish ? '18 questions, approx. 5-10 minutes' : '총 18문항, 약 5-10분 소요'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5" />
                          <span>{isEnglish ? 'Evaluates 3 domains: Attention, Activity, Self-Control' : '주의력, 활동성, 자기조절 3개 영역 평가'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5" />
                          <span>{isEnglish ? 'Please respond based on behavior over the past 6 months' : '최근 6개월간의 행동을 기준으로 응답해주세요'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                          <span>{isEnglish ? 'This is a self-screening tool. Accurate assessment requires professional consultation.' : '이 검사는 자가점검용이며, 정확한 평가는 전문가 상담이 필요합니다'}</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { icon: BookOpen, label: isEnglish ? 'Attention' : '주의력', desc: isEnglish ? 'Focus, Organization' : '집중, 조직력' },
                      { icon: Activity, label: isEnglish ? 'Activity' : '활동성', desc: isEnglish ? 'Activity Level' : '활동 수준' },
                      { icon: Clock, label: isEnglish ? 'Self-Control' : '자기조절', desc: isEnglish ? 'Behavior Control' : '행동 조절' },
                    ].map((item, i) => (
                      <Card key={i}>
                        <CardContent className="py-4 text-center">
                          <item.icon className="w-8 h-8 mx-auto mb-2 text-teal-500" />
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Button className="w-full bg-gradient-to-r from-teal-500 to-blue-600" size="lg" onClick={() => setPhase('questions')}>
                    {isEnglish ? 'Start Assessment' : '검사 시작하기'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              )}

              {phase === 'questions' && (
                <motion.div key={currentQuestion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>{isEnglish ? 'Progress' : '진행률'}</span>
                      <span>{currentQuestion + 1} / {questions.length}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {(() => {
                    const category = getCategoryLabel(questions[currentQuestion].category);
                    return (
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${category.color}`}>
                        <category.icon className="w-4 h-4" />
                        {category.label} {isEnglish ? '' : '영역'}
                      </div>
                    );
                  })()}

                  <Card className="mb-6">
                    <CardContent className="py-8">
                      <p className="text-lg font-medium text-center leading-relaxed">
                        {isEnglish ? questions[currentQuestion].en : questions[currentQuestion].ko}
                      </p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {answerOptions.map(option => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(option.value)}
                        className={`p-4 rounded-xl text-center font-medium transition-all ${option.color} ${
                          answers[questions[currentQuestion].id] === option.value ? 'ring-2 ring-offset-2 ring-teal-500' : ''
                        }`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {isEnglish ? 'Previous' : '이전'}
                    </Button>
                    {Object.keys(answers).length === questions.length && (
                      <Button className="bg-gradient-to-r from-teal-500 to-blue-600" onClick={handleSubmit}>
                        {isEnglish ? 'View Results' : '결과 확인'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}

              {phase === 'analyzing' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-24 h-24 mx-auto mb-8">
                    <Brain className="w-full h-full text-teal-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-4">{isEnglish ? 'AI is analyzing your results' : 'AI가 결과를 분석하고 있어요'}</h2>
                  <div className="w-64 mx-auto bg-gray-200 rounded-full h-3 mb-2">
                    <motion.div className="bg-gradient-to-r from-teal-500 to-blue-600 h-3 rounded-full" style={{ width: `${analyzingProgress}%` }} />
                  </div>
                  <p className="text-gray-500">{analyzingProgress}%</p>
                </motion.div>
              )}

              {phase === 'result' && result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={`mb-6 ${
                    result.riskLevel === 'low' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                    result.riskLevel === 'moderate' ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                    'bg-gradient-to-br from-red-500 to-rose-600'
                  } text-white`}>
                    <CardContent className="py-8 text-center">
                      {result.riskLevel === 'low' ? <CheckCircle2 className="w-16 h-16 mx-auto mb-4" /> : <AlertTriangle className="w-16 h-16 mx-auto mb-4" />}
                      <h2 className="text-2xl font-bold mb-2">
                        {result.riskLevel === 'low' ? (isEnglish ? 'Low Risk' : '낮은 위험도') :
                         result.riskLevel === 'moderate' ? (isEnglish ? 'Moderate Risk' : '중간 위험도') :
                         (isEnglish ? 'High Risk' : '높은 위험도')}
                      </h2>
                      <p className="opacity-90">{isEnglish ? 'Total Score' : '총점'}: {result.totalScore} / {questions.length * 3}</p>
                    </CardContent>
                  </Card>

                  <Card className="mb-6">
                    <CardHeader><CardTitle>{isEnglish ? 'Domain Scores' : '영역별 점수'}</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { label: isEnglish ? 'Attention' : '주의력', score: result.attentionScore, max: 18, color: 'bg-blue-500' },
                          { label: isEnglish ? 'Activity' : '활동성', score: result.activityScore, max: 18, color: 'bg-orange-500' },
                          { label: isEnglish ? 'Self-Control' : '자기조절', score: result.selfcontrolScore, max: 18, color: 'bg-purple-500' },
                        ].map(item => (
                          <div key={item.label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{item.label}</span>
                              <span>{item.score} / {item.max}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${(item.score / item.max) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mb-6">
                    <CardHeader><CardTitle>💡 {isEnglish ? 'Analysis Results' : '분석 결과'}</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="mb-6">
                    <CardHeader><CardTitle>📋 {isEnglish ? 'Next Steps' : '다음 단계'}</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.nextSteps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="flex-1" onClick={resetTest}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {isEnglish ? 'Retake Test' : '다시 검사하기'}
                    </Button>
                    <Button className="flex-1" onClick={() => navigate('/experts')}>
                      <Users className="w-4 h-4 mr-2" />
                      {isEnglish ? 'Book Expert Consultation' : '전문가 상담 예약'}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => navigate('/growth-report')}>
                      <FileText className="w-4 h-4 mr-2" />
                      {isEnglish ? 'View Growth Report' : '성장 리포트 보기'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </LoginRequiredOverlay>
    </>
  );
}
