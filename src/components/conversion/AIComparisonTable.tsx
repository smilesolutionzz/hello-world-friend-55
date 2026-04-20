import React from 'react';
import { Check, X, Sparkles, ShieldCheck, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIComparisonTableProps {
  className?: string;
  variant?: 'default' | 'compact';
}

/**
 * 결제 페이지 핵심 전환 위젯: 일반 AI 챗봇(ChatGPT) vs AIHPRO 비교표.
 * '왜 ₩9,900을 내야 하는가?'에 대한 시각적 답변.
 */
const AIComparisonTable: React.FC<AIComparisonTableProps> = ({ className = '', variant = 'default' }) => {
  const allRows = [
    { key: '검증된 임상 통계 모델', desc: 'RCI, SEM, 95% CI', chatgpt: false, aihpro: true },
    { key: '연령 정규화 비교 (N=1,247)', desc: '같은 연령대 대비 백분위', chatgpt: false, aihpro: true },
    { key: '다중 데이터 삼각검증', desc: '검사+관찰+훈련+음성 7종 통합', chatgpt: false, aihpro: true },
    { key: '전문가 더블체크 옵션', desc: '필요 시 제휴 임상 전문가와 교차 검증 가능', chatgpt: false, aihpro: true },
    { key: '재검사 추적 및 변화 분석', desc: '3·6개월 알림 + 종단 비교', chatgpt: false, aihpro: true },
    { key: '구조화된 PDF/DOCX 리포트', desc: '병원·학교 제출 가능 형식', chatgpt: false, aihpro: true },
    { key: '결과의 일관성 (재현 가능)', desc: '같은 입력 → 같은 결과', chatgpt: false, aihpro: true },
    { key: '응답 속도', desc: '즉시 답변', chatgpt: true, aihpro: true },
    { key: '대화형 질의응답', desc: '자유로운 질문', chatgpt: true, aihpro: true },
  ];
  const isCompactVar = variant === 'compact';
  const rows = isCompactVar ? allRows.slice(0, 4) : allRows;
  const isCompact = isCompactVar;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`rounded-3xl border-2 border-slate-200 bg-white overflow-hidden shadow-sm ${className}`}
    >
      {/* 헤더 */}
      <div className="px-5 py-4 sm:px-6 sm:py-5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">왜 AIHPRO인가</span>
        </div>
        <h3 className="text-lg sm:text-2xl font-black text-slate-900 break-keep leading-tight">
          일반 AI 챗봇과 <span className="text-primary">무엇이 다른가요?</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 break-keep">
          ChatGPT는 텍스트를 '생성'합니다. AIHPRO는 데이터를 '분석'합니다.
        </p>
      </div>

      {/* 컬럼 헤더 */}
      <div className="grid grid-cols-[1fr_72px_72px] sm:grid-cols-[1fr_120px_120px] bg-slate-50/70 border-b border-slate-200">
        <div className="p-2.5 sm:p-3" />
        <div className="p-2.5 sm:p-3 text-center border-l border-slate-200">
          <div className="flex flex-col items-center gap-1">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500">일반 AI</span>
            <span className="text-[9px] text-slate-400 hidden sm:block">ChatGPT 등</span>
          </div>
        </div>
        <div className="p-2.5 sm:p-3 text-center border-l border-slate-200 bg-primary/5">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-[10px] sm:text-xs font-bold text-primary">AIHPRO</span>
            <span className="text-[9px] text-primary/70 hidden sm:block">임상 통계 엔진</span>
          </div>
        </div>
      </div>

      {/* 비교 행 */}
      <div className="divide-y divide-slate-100">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_72px_72px] sm:grid-cols-[1fr_120px_120px] hover:bg-slate-50/50 transition-colors"
          >
            <div className="p-2.5 sm:p-4">
              <div className="text-xs sm:text-sm font-semibold text-slate-800 break-keep leading-snug">
                {row.key}
              </div>
              {!isCompact && (
                <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 break-keep">
                  {row.desc}
                </div>
              )}
            </div>
            <div className="p-2.5 sm:p-4 flex items-center justify-center border-l border-slate-100">
              {row.chatgpt ? (
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              ) : (
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
              )}
            </div>
            <div className="p-2.5 sm:p-4 flex items-center justify-center border-l border-slate-100 bg-primary/[0.03]">
              {row.aihpro ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" strokeWidth={3} />
                </div>
              ) : (
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 푸터 */}
      <div className="px-5 py-4 sm:px-6 sm:py-5 bg-gradient-to-br from-primary/5 to-primary/10 border-t border-primary/10">
        <p className="text-xs sm:text-sm text-slate-700 break-keep leading-relaxed">
          <strong className="text-slate-900">AIHPRO는 일반 LLM이 아닙니다.</strong>{' '}
          검증된 임상 통계 모델(Cronbach's α, RCI, SEM)과 연령 정규화 표본을 결합한{' '}
          <span className="text-primary font-bold">전문 분석 엔진</span>이며,{' '}
          필요 시 제휴 임상 전문가와의 더블체크 옵션을 제공합니다.
        </p>
        <p className="text-[10px] sm:text-xs text-slate-500 mt-2 italic break-keep">
          ※ 의료 진단이 아닌 발달 코칭 및 의사결정 보조 도구입니다.
        </p>
      </div>
    </motion.div>
  );
};

export default AIComparisonTable;
