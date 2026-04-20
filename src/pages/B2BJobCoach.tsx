import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import B2BJobCoachSection from '@/components/b2b/B2BJobCoachSection';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const B2BJobCoach: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>AIHPRO 잡코치 - 직장 내 마음건강 AI+휴먼 케어</title>
        <meta
          name="description"
          content="번아웃·이직 위험을 조기 감지하고 검증된 임상 전문가와 익명 연결하는 차세대 EAP. 기존 EAP 대비 60% 저렴."
        />
        <link rel="canonical" href="https://aihpro.app/b2b-jobcoach" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* 상단 미니 히어로 */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full mb-5">
                <Briefcase className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">For HR Leaders</span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-5 break-keep leading-tight">
                임직원의 마음 건강이<br />
                회사의 <span className="text-blue-300">생산성</span>입니다
              </h1>
              <p className="text-base md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto break-keep leading-relaxed">
                AI가 위험을 감지하고, 사람이 마음을 어루만집니다.<br />
                <strong className="text-white">진정한 휴먼터치 EAP</strong>를 경험하세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 font-bold h-12 px-8"
                  onClick={() => {
                    document.getElementById('jobcoach-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  플랜 살펴보기
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white font-bold h-12 px-8"
                  onClick={() => navigate('/b2b-demo-report')}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  샘플 리포트 보기
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div id="jobcoach-section">
          <B2BJobCoachSection />
        </div>
      </div>
    </>
  );
};

export default B2BJobCoach;
