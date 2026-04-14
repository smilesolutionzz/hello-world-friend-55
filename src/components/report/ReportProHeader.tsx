import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Lock, Microscope } from 'lucide-react';
import SEOHead from '@/components/common/SEOHead';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

interface ReportProHeaderProps {
  isLoggedIn: boolean | null;
  isPremium: boolean;
}

const ReportProHeader: React.FC<ReportProHeaderProps> = ({ isLoggedIn, isPremium }) => {
  const navigate = useNavigate();
  const { isEnglish, localePath } = useLanguage();
  const t = (ko: string, en: string) => isEnglish ? en : ko;

  return (
    <>
      <SEOHead
        title="AI 종합 리포트 - AIHPRO | 박사급 심리·발달 분석 리포트"
        description="500+ 논문과 15개 심리이론 기반 AI 종합 리포트. 검사 결과, 상담 내용, 관찰 기록을 통합 분석한 박사급 임상 수준 보고서."
        keywords="심리리포트,종합분석리포트,AI분석보고서,발달평가리포트,심리검사결과"
        canonicalUrl="https://aihpro.app/report-generator"
      />
      <Button onClick={() => navigate(localePath('/'))} variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground gap-2">
        <ArrowLeft className="w-4 h-4" /> {t('뒤로가기', 'Back')}
      </Button>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
          <Crown className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-primary">Premium Personal Report</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black leading-tight text-white">
          {t('학부모용 AI 종합 리포트', 'Parent-Friendly AI Report')}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          {isEnglish ? (
            <>Powered by <strong className="text-white">14-year expert-designed engine</strong><br className="hidden md:block" />
            Visual infographics + Easy language + Expert-level clinical analysis</>
          ) : (
            <><strong className="text-white">14년 전문가 설계</strong> 빅데이터 분석 엔진<br className="hidden md:block" />
            시각적 인포그래픽 + 쉬운 말 설명 + 전문가급 임상 해설</>
          )}
        </p>

        <div className="flex flex-wrap justify-center gap-1.5 max-w-xl mx-auto">
          {(isEnglish 
            ? ['Visual Infographic', 'Traffic Light System', 'Scenario Guide', 'Parent Care', 'Expert Referral']
            : ['비주얼 인포그래픽', '신호등 시스템', '시나리오별 가이드', '부모 케어', '전문가 연계']
          ).map((tag) => (
            <span key={tag} className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-white/5 text-white/50 border border-white/10">
              {tag}
            </span>
          ))}
        </div>

        {isLoggedIn && (
          <div>
            {isPremium ? (
              <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5 text-xs">
                <Crown className="w-3.5 h-3.5 mr-1.5" /> {t('프리미엄 · 무제한 생성', 'Premium · Unlimited Generation')}
              </Badge>
            ) : (
              <Badge variant="outline" className="border-white/20 text-white/60 px-4 py-1.5 text-xs">
                <Lock className="w-3.5 h-3.5 mr-1.5" /> {t('프리미엄 구독 필요', 'Premium Subscription Required')}
              </Badge>
            )}
          </div>
        )}
      </motion.div>
    </>
  );
};

export default ReportProHeader;
