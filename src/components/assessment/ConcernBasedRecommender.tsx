import { useState } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/i18n/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ConcernBasedRecommenderProps {
  onSelectTest: (testKey: string) => void;
  onNavigate: (path: string) => void;
}

interface Recommendation {
  testKey: string;
  title: string;
  reason: string;
  badge: string;
  route?: string;
  gradient: string;
}

const concerns = [
  { emoji: '😢', label: '우울·무기력', key: 'depressed' },
  { emoji: '😰', label: '불안·긴장', key: 'anxious' },
  { emoji: '🧒', label: '아이 발달 걱정', key: 'child-dev' },
  { emoji: '📚', label: '집중력·ADHD', key: 'adhd' },
  { emoji: '😤', label: '스트레스·번아웃', key: 'stress' },
  { emoji: '💔', label: '관계·애착', key: 'relationship' },
  { emoji: '🧠', label: '기억력·치매 걱정', key: 'cognitive' },
  { emoji: '🎯', label: '진로·적성', key: 'career' },
  { emoji: '👶', label: '육아 힘듦', key: 'parenting' },
];

const concernsEn = [
  { emoji: '😢', label: 'Depression', key: 'depressed' },
  { emoji: '😰', label: 'Anxiety', key: 'anxious' },
  { emoji: '🧒', label: 'Child Development', key: 'child-dev' },
  { emoji: '📚', label: 'Focus·ADHD', key: 'adhd' },
  { emoji: '😤', label: 'Stress·Burnout', key: 'stress' },
  { emoji: '💔', label: 'Relationships', key: 'relationship' },
  { emoji: '🧠', label: 'Memory·Dementia', key: 'cognitive' },
  { emoji: '🎯', label: 'Career·Aptitude', key: 'career' },
  { emoji: '👶', label: 'Parenting Struggles', key: 'parenting' },
];

const recommendationMap: Record<string, { ko: Recommendation[]; en: Recommendation[] }> = {
  depressed: {
    ko: [
      { testKey: 'depression', title: '우울감 검사 (BDI-II)', reason: '최근 2주간의 기분 상태를 전문 척도로 측정해요', badge: '무료', gradient: 'from-blue-500/10 to-indigo-500/10' },
      { testKey: 'selfesteem', title: '자아가치 검사', reason: '우울감의 근본 원인인 자존감 수준을 확인해요', badge: '프리미엄', gradient: 'from-purple-500/10 to-pink-500/10' },
      { testKey: 'ai-chat', title: 'AI 상담 챗봇', reason: '지금 바로 마음을 털어놓고 싶다면', badge: '즉시 가능', route: '/ai-counseling', gradient: 'from-emerald-500/10 to-teal-500/10' },
    ],
    en: [
      { testKey: 'depression', title: 'Depression Test (BDI-II)', reason: 'Measure your mood over the past 2 weeks', badge: 'Free', gradient: 'from-blue-500/10 to-indigo-500/10' },
      { testKey: 'selfesteem', title: 'Self-Esteem Assessment', reason: 'Check your self-worth — a root cause of depression', badge: 'Premium', gradient: 'from-purple-500/10 to-pink-500/10' },
      { testKey: 'ai-chat', title: 'AI Counseling Chat', reason: 'Talk to AI right now if you need support', badge: 'Instant', route: '/ai-counseling', gradient: 'from-emerald-500/10 to-teal-500/10' },
    ],
  },
  anxious: {
    ko: [
      { testKey: 'stress', title: '스트레스 검사', reason: '불안의 원인이 될 수 있는 스트레스 수준을 확인해요', badge: '무료', gradient: 'from-amber-500/10 to-orange-500/10' },
      { testKey: 'depression', title: '우울감 검사', reason: '불안과 함께 오는 우울 증상을 체크해요', badge: '무료', gradient: 'from-blue-500/10 to-indigo-500/10' },
      { testKey: 'bigfive', title: '성격 5요인 검사', reason: '불안에 취약한 성격 특성을 파악해요', badge: '프리미엄', gradient: 'from-violet-500/10 to-purple-500/10' },
    ],
    en: [
      { testKey: 'stress', title: 'Stress Assessment', reason: 'Check stress levels that may cause anxiety', badge: 'Free', gradient: 'from-amber-500/10 to-orange-500/10' },
      { testKey: 'depression', title: 'Depression Test', reason: 'Check for depressive symptoms alongside anxiety', badge: 'Free', gradient: 'from-blue-500/10 to-indigo-500/10' },
      { testKey: 'bigfive', title: 'Big Five Personality', reason: 'Identify personality traits vulnerable to anxiety', badge: 'Premium', gradient: 'from-violet-500/10 to-purple-500/10' },
    ],
  },
  'child-dev': {
    ko: [
      { testKey: 'developmental-delay', title: '발달 지연 선별 검사', reason: '우리 아이 발달이 또래와 비교해 어느 수준인지 확인해요', badge: '프리미엄', gradient: 'from-pink-500/10 to-rose-500/10' },
      { testKey: 'social-development', title: '사회성 발달 검사', reason: '또래 관계와 사회적 기술을 평가해요', badge: '프리미엄', gradient: 'from-cyan-500/10 to-blue-500/10' },
      { testKey: 'adhd', title: 'ADHD 선별 검사', reason: '주의력과 과잉행동 수준을 확인해요', badge: '무료', gradient: 'from-teal-500/10 to-emerald-500/10' },
    ],
    en: [
      { testKey: 'developmental-delay', title: 'Developmental Screening', reason: 'Compare your child\'s development with peers', badge: 'Premium', gradient: 'from-pink-500/10 to-rose-500/10' },
      { testKey: 'social-development', title: 'Social Development', reason: 'Evaluate peer relationships and social skills', badge: 'Premium', gradient: 'from-cyan-500/10 to-blue-500/10' },
      { testKey: 'adhd', title: 'ADHD Screening', reason: 'Check attention and hyperactivity levels', badge: 'Free', gradient: 'from-teal-500/10 to-emerald-500/10' },
    ],
  },
  adhd: {
    ko: [
      { testKey: 'adhd', title: 'ADHD 선별 검사', reason: '주의력 결핍과 과잉행동 정도를 측정해요', badge: '무료', gradient: 'from-teal-500/10 to-emerald-500/10' },
      { testKey: 'learning-disability', title: '학습 장애 선별 검사', reason: 'ADHD와 함께 올 수 있는 학습 어려움을 확인해요', badge: '프리미엄', gradient: 'from-indigo-500/10 to-blue-500/10' },
      { testKey: 'brain-training', title: '두뇌 훈련 게임', reason: '집중력을 재미있게 키워보세요', badge: '게임', route: '/brain-training', gradient: 'from-yellow-500/10 to-amber-500/10' },
    ],
    en: [
      { testKey: 'adhd', title: 'ADHD Screening', reason: 'Measure attention deficit and hyperactivity', badge: 'Free', gradient: 'from-teal-500/10 to-emerald-500/10' },
      { testKey: 'learning-disability', title: 'Learning Disability Screening', reason: 'Check learning difficulties that may accompany ADHD', badge: 'Premium', gradient: 'from-indigo-500/10 to-blue-500/10' },
      { testKey: 'brain-training', title: 'Brain Training Games', reason: 'Build focus through fun games', badge: 'Game', route: '/brain-training', gradient: 'from-yellow-500/10 to-amber-500/10' },
    ],
  },
  stress: {
    ko: [
      { testKey: 'stress', title: '스트레스 검사', reason: '현재 스트레스 수준을 정확히 파악해요', badge: '무료', gradient: 'from-amber-500/10 to-orange-500/10' },
      { testKey: 'depression', title: '우울감 검사', reason: '번아웃이 우울로 이어지고 있진 않은지 확인해요', badge: '무료', gradient: 'from-blue-500/10 to-indigo-500/10' },
      { testKey: 'han-medicine', title: '사상체질 검사', reason: '체질별 맞춤 스트레스 해소법을 찾아보세요', badge: '프리미엄', route: '/han-medicine-test', gradient: 'from-green-500/10 to-emerald-500/10' },
    ],
    en: [
      { testKey: 'stress', title: 'Stress Assessment', reason: 'Accurately measure your current stress level', badge: 'Free', gradient: 'from-amber-500/10 to-orange-500/10' },
      { testKey: 'depression', title: 'Depression Test', reason: 'Check if burnout is leading to depression', badge: 'Free', gradient: 'from-blue-500/10 to-indigo-500/10' },
      { testKey: 'han-medicine', title: 'Constitution Analysis', reason: 'Find stress relief methods suited to your body type', badge: 'Premium', route: '/han-medicine-test', gradient: 'from-green-500/10 to-emerald-500/10' },
    ],
  },
  relationship: {
    ko: [
      { testKey: 'attachment', title: '애착유형 검사', reason: '나의 관계 패턴과 애착 스타일을 이해해요', badge: '프리미엄', gradient: 'from-pink-500/10 to-rose-500/10' },
      { testKey: 'bigfive', title: '성격 5요인 검사', reason: '관계에 영향을 주는 성격 특성을 파악해요', badge: '프리미엄', gradient: 'from-violet-500/10 to-purple-500/10' },
      { testKey: 'selfesteem', title: '자아가치 검사', reason: '관계 불안의 원인이 자존감일 수 있어요', badge: '프리미엄', gradient: 'from-amber-500/10 to-yellow-500/10' },
    ],
    en: [
      { testKey: 'attachment', title: 'Attachment Style', reason: 'Understand your relationship patterns', badge: 'Premium', gradient: 'from-pink-500/10 to-rose-500/10' },
      { testKey: 'bigfive', title: 'Big Five Personality', reason: 'Identify traits affecting relationships', badge: 'Premium', gradient: 'from-violet-500/10 to-purple-500/10' },
      { testKey: 'selfesteem', title: 'Self-Esteem Assessment', reason: 'Low self-esteem may cause relationship anxiety', badge: 'Premium', gradient: 'from-amber-500/10 to-yellow-500/10' },
    ],
  },
  cognitive: {
    ko: [
      { testKey: 'brain-training', title: '두뇌 훈련 게임', reason: '기억력·집중력을 게임으로 테스트하고 훈련해요', badge: '게임', route: '/brain-training', gradient: 'from-yellow-500/10 to-amber-500/10' },
      { testKey: 'stress', title: '스트레스 검사', reason: '스트레스가 인지기능 저하의 원인일 수 있어요', badge: '무료', gradient: 'from-amber-500/10 to-orange-500/10' },
      { testKey: 'depression', title: '우울감 검사', reason: '우울증도 기억력 저하를 유발할 수 있어요', badge: '무료', gradient: 'from-blue-500/10 to-indigo-500/10' },
    ],
    en: [
      { testKey: 'brain-training', title: 'Brain Training Games', reason: 'Test and train memory & focus through games', badge: 'Game', route: '/brain-training', gradient: 'from-yellow-500/10 to-amber-500/10' },
      { testKey: 'stress', title: 'Stress Assessment', reason: 'Stress can cause cognitive decline', badge: 'Free', gradient: 'from-amber-500/10 to-orange-500/10' },
      { testKey: 'depression', title: 'Depression Test', reason: 'Depression can also cause memory issues', badge: 'Free', gradient: 'from-blue-500/10 to-indigo-500/10' },
    ],
  },
  career: {
    ko: [
      { testKey: 'career', title: '직업적성 검사', reason: '나에게 맞는 직업 유형을 찾아보세요', badge: '프리미엄', gradient: 'from-amber-500/10 to-yellow-500/10' },
      { testKey: 'bigfive', title: '성격 5요인 검사', reason: '성격 특성으로 진로 적합도를 분석해요', badge: '프리미엄', gradient: 'from-violet-500/10 to-purple-500/10' },
      { testKey: 'selfesteem', title: '자아가치 검사', reason: '자기 확신이 진로 결정에 영향을 줘요', badge: '프리미엄', gradient: 'from-pink-500/10 to-rose-500/10' },
    ],
    en: [
      { testKey: 'career', title: 'Career Aptitude', reason: 'Find the career type that suits you', badge: 'Premium', gradient: 'from-amber-500/10 to-yellow-500/10' },
      { testKey: 'bigfive', title: 'Big Five Personality', reason: 'Analyze career fit through personality traits', badge: 'Premium', gradient: 'from-violet-500/10 to-purple-500/10' },
      { testKey: 'selfesteem', title: 'Self-Esteem Assessment', reason: 'Self-confidence affects career decisions', badge: 'Premium', gradient: 'from-pink-500/10 to-rose-500/10' },
    ],
  },
  parenting: {
    ko: [
      { testKey: 'stress', title: '스트레스 검사', reason: '육아 스트레스 수준을 먼저 확인해보세요', badge: '무료', gradient: 'from-amber-500/10 to-orange-500/10' },
      { testKey: 'depression', title: '우울감 검사', reason: '육아 번아웃이 우울로 이어지진 않았나요?', badge: '무료', gradient: 'from-blue-500/10 to-indigo-500/10' },
      { testKey: 'developmental-delay', title: '아이 발달 선별 검사', reason: '아이 발달 상태를 전문적으로 확인해요', badge: '프리미엄', gradient: 'from-pink-500/10 to-rose-500/10' },
    ],
    en: [
      { testKey: 'stress', title: 'Stress Assessment', reason: 'Check your parenting stress level first', badge: 'Free', gradient: 'from-amber-500/10 to-orange-500/10' },
      { testKey: 'depression', title: 'Depression Test', reason: 'Has parenting burnout led to depression?', badge: 'Free', gradient: 'from-blue-500/10 to-indigo-500/10' },
      { testKey: 'developmental-delay', title: 'Child Development Screening', reason: 'Professionally assess your child\'s development', badge: 'Premium', gradient: 'from-pink-500/10 to-rose-500/10' },
    ],
  },
};

const testStepMap: Record<string, string> = {
  depression: 'depression-test',
  stress: 'stress-test',
  adhd: 'adhd-test',
  bigfive: 'bigfive-test',
  attachment: 'attachment-test',
  career: 'career-test',
  selfesteem: 'selfesteem-test',
  'developmental-delay': 'developmental-delay-test',
  'social-development': 'social-development-test',
  'learning-disability': 'learning-disability-test',
  'sensory-integration': 'sensory-integration-test',
};

export const ConcernBasedRecommender = ({ onSelectTest, onNavigate }: ConcernBasedRecommenderProps) => {
  const { isEnglish } = useLanguage();
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const activeConcerns = isEnglish ? concernsEn : concerns;

  const handleSelect = (key: string) => {
    if (selectedConcern === key) {
      setSelectedConcern(null);
      return;
    }
    setIsAnalyzing(true);
    setSelectedConcern(key);
    setTimeout(() => setIsAnalyzing(false), 600);
  };

  const handleTestClick = (rec: Recommendation) => {
    if (rec.route) {
      onNavigate(rec.route);
    } else {
      const step = testStepMap[rec.testKey];
      if (step) {
        onSelectTest(step);
      }
    }
  };

  const recs = selectedConcern
    ? recommendationMap[selectedConcern]?.[isEnglish ? 'en' : 'ko'] || []
    : [];

  return (
    <div className="mb-8">
      <div className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {isEnglish ? 'What concerns you?' : '어떤 고민이 있으신가요?'}
          </span>
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
            AI {isEnglish ? 'Recommend' : '추천'}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 mb-1">
          {activeConcerns.map((c) => (
            <button
              key={c.key}
              onClick={() => handleSelect(c.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedConcern === c.key
                  ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedConcern && (
            <motion.div
              key={selectedConcern}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                  <span>{isEnglish ? 'AI is analyzing your concern...' : 'AI가 고민을 분석하고 있어요...'}</span>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    {isEnglish ? '✨ Recommended for you based on your concern' : '✨ 고민에 맞는 추천 검사예요'}
                  </p>
                  {recs.map((rec, i) => (
                    <button
                      key={rec.testKey}
                      onClick={() => handleTestClick(rec)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r ${rec.gradient} border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all group text-left`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-foreground">{rec.title}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              rec.badge === '무료' || rec.badge === 'Free'
                                ? 'border-emerald-400/50 text-emerald-600'
                                : rec.badge === '게임' || rec.badge === 'Game'
                                ? 'border-yellow-400/50 text-yellow-600'
                                : rec.badge === '즉시 가능' || rec.badge === 'Instant'
                                ? 'border-teal-400/50 text-teal-600'
                                : 'border-purple-400/50 text-purple-600'
                            }`}
                          >
                            {rec.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{rec.reason}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
