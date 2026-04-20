import { useNavigate } from 'react-router-dom';
import { FileText, Users, TrendingUp, ArrowRight, CheckCircle, Sparkles, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/i18n/LanguageContext';
import { motion } from 'framer-motion';
import { SmartConsultMatcher } from '@/components/expert/SmartConsultMatcher';

interface PostPaymentFlowProps {
  testName: string;
  onViewReport: () => void;
}

const PostPaymentConversionFlow = ({ testName, onViewReport }: PostPaymentFlowProps) => {
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();

  const steps = isEnglish ? [
    {
      icon: FileText,
      badge: 'Report Ready',
      title: `${testName} analysis report has been generated`,
      description: 'Your personalized behavioral data-based analysis is ready to view',
      cta: 'View Report',
      ctaAction: onViewReport,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20',
    },
    {
      icon: Users,
      badge: 'Next Step',
      title: "Now it's time to get expert guidance",
      description: 'Connect with a specialist who can provide a tailored action plan based on your results',
      cta: 'Connect with Expert',
      ctaAction: () => navigate('/expert-hiring'),
      gradient: 'from-blue-500 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
    },
    {
      icon: TrendingUp,
      badge: 'Track Changes',
      title: 'Track behavioral changes over time',
      description: 'Receive periodic analysis reports based on accumulated behavioral data',
      cta: 'Start Change Tracking',
      ctaAction: () => navigate('/report-generator'),
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20',
    },
  ] : [
    {
      icon: FileText,
      badge: '분석 완료',
      title: `${testName} 상세 분석 리포트가 생성되었습니다`,
      description: '행동 데이터 기반의 맞춤형 분석을 지금 바로 확인하실 수 있습니다',
      cta: '리포트 확인하기',
      ctaAction: onViewReport,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20',
    },
    {
      icon: Users,
      badge: '다음 단계',
      title: '상태를 정확히 이해했다면, 이제 방향이 중요합니다',
      description: '전문가 상담을 통해 구체적인 맞춤 가이드를 받아보세요',
      cta: '전문가 상담 연결하기',
      ctaAction: () => navigate('/expert-hiring'),
      gradient: 'from-blue-500 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
    },
    {
      icon: TrendingUp,
      badge: '변화 추적',
      title: '행동 데이터 기반의 지속적인 변화 추적',
      description: '축적된 데이터를 기반으로 정기적인 분석과 변화 리포트를 제공합니다',
      cta: '변화 추적 시작하기',
      ctaAction: () => navigate('/report-generator'),
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20',
    },
  ];

  return (
    <div className="space-y-4 mt-8 mb-6">
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-3"
        >
          <CheckCircle className="w-7 h-7 text-emerald-600" />
        </motion.div>
        <h3 className="text-lg font-bold text-foreground">
          {isEnglish ? 'Analysis Complete' : '분석이 완료되었습니다'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {isEnglish
            ? 'Your behavioral data-based report is ready'
            : '행동 데이터 기반 분석 리포트가 준비되었어요'}
        </p>
      </div>

      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15 + 0.3 }}
        >
          <div className={`bg-white dark:bg-card rounded-2xl shadow-md border border-border/40 overflow-hidden`}>
            {/* Top accent */}
            <div className={`h-1 bg-gradient-to-r ${step.gradient}`} />
            
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${step.bgGradient} flex items-center justify-center`}>
                  <step.icon className="w-5 h-5 text-foreground/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
                      {step.badge}
                    </span>
                    {i === 0 && (
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-foreground leading-snug mb-1">
                    {step.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              <Button
                onClick={step.ctaAction}
                className={`w-full mt-4 bg-gradient-to-r ${step.gradient} hover:opacity-90 text-white rounded-xl h-10 text-sm font-semibold`}
              >
                {step.cta}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}

      {/* AI 전문가 매칭 — 결과 직후 황금 타이밍 */}
      {!isEnglish && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <SmartConsultMatcher triggerSource="post_report" compact />
        </motion.div>
      )}

      {/* HR 담당자 / 기관 운영자 바이럴 진입 */}
      {!isEnglish && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
        >
          <button
            onClick={() => navigate('/b2b-demo-report')}
            className="w-full text-left p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200/60 hover:border-teal-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                <Building2 className="w-5 h-5 text-teal-700" />
              </div>
              <div className="flex-1 min-w-0">
                <Badge variant="outline" className="text-[10px] border-teal-300 text-teal-700 bg-white mb-1">
                  HR 담당자 · 기관 운영자
                </Badge>
                <p className="text-sm font-semibold text-foreground leading-snug break-keep">
                  우리 회사·기관에도 이런 분석을 도입하고 싶으세요?
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 break-keep">
                  부서별 번아웃 히트맵·이직 위험 예측·익명 코칭 포함 화이트라벨 데모를 30초 만에
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-teal-700 shrink-0" />
            </div>
          </button>
        </motion.div>
      )}

      {/* Subtle data emphasis */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.95 }}
        className="text-center pt-2"
      >
        <p className="text-[11px] text-muted-foreground/70">
          {isEnglish
            ? '📊 All reports are generated based on your behavioral response data and AI-powered analysis'
            : '📊 모든 리포트는 행동 반응 데이터와 AI 분석 엔진을 기반으로 생성됩니다'}
        </p>
      </motion.div>
    </div>
  );
};

export default PostPaymentConversionFlow;
