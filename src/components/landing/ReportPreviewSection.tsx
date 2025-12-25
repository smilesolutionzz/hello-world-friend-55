import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Brain, Target, Heart, Lightbulb, Users, TrendingUp, Shield, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ReportPreviewSection = () => {
  const navigate = useNavigate();

  const reportSections = [
    { icon: Brain, title: '핵심 발달 분석', preview: '언어 발달: 또래 대비 약 6개월 지연 관찰됨. 표현 언어보다 수용 언어 능력이...' },
    { icon: Target, title: '강점 & 잠재력', preview: '시각적 학습 능력 우수, 창의적 문제해결에서 뛰어난 접근 방식 보임...' },
    { icon: Heart, title: '정서적 특성', preview: '정서 조절: 좌절 상황에서 감정 표현이 과격해지는 경향. 안정적 환경에서는...' },
    { icon: Lightbulb, title: '맞춤 개입 전략', preview: '1) 시각적 스케줄 활용 권장 2) 감각 통합 활동 일 15분 권장...' },
    { icon: Users, title: '가정 내 실천 가이드', preview: '아침 루틴: 그림 카드 활용한 순서 안내. 저녁 루틴: 감정 일기 함께 작성...' },
    { icon: TrendingUp, title: '발달 예측 & 경과', preview: '현재 개입 시 6개월 후 예상: 언어 표현력 20% 향상, 또래 상호작용...' },
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-4">
            샘플 미리보기
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
            실제 분석 리포트는 이렇게 옵니다
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto">
            AI가 수집된 데이터를 기반으로 9가지 영역의 전문가급 분석을 제공합니다
          </p>
        </motion.div>

        {/* Report Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          {/* Report Header */}
          <div className="bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-t-2xl p-4 md:p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-white/50 text-xs mb-1">2025년 1월 6일 생성</p>
                <h3 className="text-white font-bold text-lg">전문가급 발달 분석 리포트</h3>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-xs">from</p>
                <p className="text-amber-400 font-medium text-sm">AIHPRO</p>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="bg-amber-50/95 border-x border-b border-amber-200/50 rounded-b-2xl p-4 md:p-6 space-y-4">
            {/* Summary Section */}
            <div className="bg-white rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-slate-800">📋 종합 요약</h4>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  <span><strong>주요 관찰:</strong> 또래 대비 언어 발달 지연, 사회성 발달 정상 범위</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span><strong>강점 영역:</strong> 시각적 학습, 창의적 문제해결, 미술 활동 흥미</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span><strong>권장 개입:</strong> 언어치료 주 2회, 감각통합 활동, 시각적 스케줄 활용</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span><strong>예상 경과:</strong> 조기 개입 시 6개월 내 유의미한 개선 기대</span>
                </p>
              </div>
            </div>

            {/* Detailed Sections */}
            <div className="bg-white rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-slate-800">📊 상세 분석 (9개 섹션)</h4>
              </div>
              <div className="space-y-3">
                {reportSections.map((section, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                    <div className="p-1.5 bg-amber-100 rounded-lg shrink-0">
                      <section.icon className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-slate-700 text-sm">{section.title}</h5>
                      <p className="text-xs text-slate-500 truncate">{section.preview}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-xs text-slate-400 pt-2">
              본 리포트는 AI 분석 결과이며, 전문가 상담을 대체하지 않습니다.
            </p>
          </div>

          {/* Footer note */}
          <p className="text-center text-white/40 text-xs mt-4">
            * 위는 샘플 예시이며, 실제 리포트는 입력된 데이터 기반으로 개인화되어 제공됩니다.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center mt-10"
        >
          <Button
            onClick={() => navigate('/report-generator')}
            className="px-8 py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/25"
          >
            나만의 리포트 생성하기
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ReportPreviewSection;
