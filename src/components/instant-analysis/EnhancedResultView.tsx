import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, ArrowRight, Brain, CheckCircle, Target, Heart, Clock, Zap,
  FileText, Shield, TrendingUp, Eye, AlertTriangle, Activity,
  ChevronDown, ChevronUp, Lightbulb, BookOpen, Users, BarChart3,
  Layers, Compass, Flame, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface EnhancedResultViewProps {
  analysisResult: any;
  inputText: string;
  reportImages: string[];
  tableOfContents: Array<{ index: number; title: string }> | null;
  onReset: () => void;
}

// Animated circular gauge
const CircularGauge = ({ value, label, color, size = 100 }: { value: number; label: string; color: string; size?: number }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const getColor = () => {
    if (value >= 70) return 'text-emerald-400';
    if (value >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`text-lg font-bold ${getColor()}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {animatedValue}
          </motion.span>
        </div>
      </div>
      <span className="text-[10px] text-white/50 text-center leading-tight">{label}</span>
    </div>
  );
};

// Risk meter bar
const RiskMeter = ({ level, label }: { level: string; label: string }) => {
  const levels = ['낮음', '중간', '높음'];
  const idx = levels.indexOf(level);
  const percentage = idx === 0 ? 25 : idx === 1 ? 55 : 85;
  const colors = ['from-emerald-500 to-green-400', 'from-amber-500 to-orange-400', 'from-red-500 to-rose-400'];
  const bgColor = colors[idx] || colors[0];

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/60">{label}</span>
        <Badge className={`text-[10px] ${idx === 2 ? 'bg-red-500/20 text-red-300' : idx === 1 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
          {level}
        </Badge>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${bgColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
};

// Expandable section
const ExpandableSection = ({ icon: Icon, title, badge, children, defaultOpen = false, gradientFrom, gradientTo, borderColor }: {
  icon: any; title: string; badge?: string; children: React.ReactNode;
  defaultOpen?: boolean; gradientFrom: string; gradientTo: string; borderColor: string;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} backdrop-blur-xl rounded-2xl border ${borderColor} overflow-hidden`}
    >
      <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 md:p-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
          <h4 className="text-sm md:text-base font-bold text-white">{title}</h4>
          {badge && <Badge className="text-[10px] bg-white/10 text-white/70">{badge}</Badge>}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-5 pb-4 md:pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const EnhancedResultView = ({ analysisResult, inputText, reportImages, tableOfContents, onReset }: EnhancedResultViewProps) => {
  const navigate = useNavigate();
  const reports = analysisResult.comprehensiveReports;
  const deepAnalysis = analysisResult.deepAnalysis;

  // Radar chart data
  const radarData = reports?.developmentAssessment ? [
    { subject: '인지', value: reports.developmentAssessment.cognitive || 60, fullMark: 100 },
    { subject: '언어', value: reports.developmentAssessment.language || 60, fullMark: 100 },
    { subject: '운동', value: reports.developmentAssessment.motor || 60, fullMark: 100 },
    { subject: '사회성', value: reports.developmentAssessment.social || 60, fullMark: 100 },
    { subject: '정서', value: reports.psychologicalAnalysis?.emotionalStability || 60, fullMark: 100 },
  ] : [];

  const psychTheories = [
    { name: 'Beck의 인지모델', insight: '부정적 자동사고 패턴이 감지되며, 인지 재구성이 필요할 수 있습니다.' },
    { name: 'Bowlby 애착이론', insight: '안정적 애착 기반 형성이 현재 어려움 극복의 핵심 자원입니다.' },
    { name: 'Erikson 발달단계', insight: '현 발달 과업의 성공적 해결이 장기적 심리 안정에 기여합니다.' },
  ];

  const overallScore = reports?.developmentAssessment?.overall || analysisResult.confidence || 75;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-4"
    >
      {/* ── 1. 결과 헤더 + 종합 스코어 ── */}
      <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/10 p-4 md:p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 md:gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"
            >
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-white">AI 심층 분석 완료</h3>
              <p className="text-xs text-white/50">신뢰도 {analysisResult.confidence}% · 다중 모델 교차 검증</p>
            </div>
          </div>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs shrink-0">
            {analysisResult.type}
          </Badge>
        </div>

        {/* 종합 게이지 + 레이더 차트 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 왼쪽: 종합 점수 대형 게이지 */}
          <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-4 border border-white/5">
            <CircularGauge value={overallScore} label="종합 점수" color={overallScore >= 70 ? '#34d399' : overallScore >= 40 ? '#fbbf24' : '#f87171'} size={110} />
            <div className="mt-2 flex items-center gap-1">
              <Activity className="w-3 h-3 text-white/40" />
              <span className="text-[10px] text-white/40">100점 만점 기준</span>
            </div>
          </div>

          {/* 오른쪽: 레이더 차트 */}
          {radarData.length > 0 && (
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <ResponsiveContainer width="100%" height={140}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="#818cf8" fill="#818cf8" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
              <p className="text-center text-[10px] text-white/40">다차원 발달 프로파일</p>
            </div>
          )}
        </div>

        {/* 위험도 미터 */}
        <div className="mt-4 space-y-2">
          <RiskMeter level={analysisResult.severity} label="전체 위험도" />
          {reports?.expertOpinion && (
            <RiskMeter level={reports.expertOpinion.interventionNeeded} label="전문가 개입 필요도" />
          )}
        </div>
      </div>

      {/* ── 2. 심층 원인 분석 (Deep Analysis) ── */}
      {deepAnalysis && (
        <ExpandableSection
          icon={Brain}
          title="심층 원인 분석"
          badge="AI 다층 분석"
          defaultOpen={true}
          gradientFrom="from-violet-900/40" gradientTo="to-purple-900/40" borderColor="border-violet-500/20"
        >
          <p className="text-white/80 text-xs md:text-sm leading-relaxed mb-4">
            {deepAnalysis.rootCauseAnalysis}
          </p>
          {deepAnalysis.symptomPattern && (
            <div className="bg-violet-500/10 rounded-xl p-3 border border-violet-500/15 mb-3">
              <p className="text-violet-300 text-[10px] font-bold mb-1 flex items-center gap-1">
                <Eye className="w-3 h-3" /> 증상 패턴 분석
              </p>
              <p className="text-white/70 text-xs">{deepAnalysis.symptomPattern}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/15">
              <p className="text-emerald-300 text-[10px] font-bold mb-1.5 flex items-center gap-1">
                <Shield className="w-3 h-3" /> 보호요인
              </p>
              <ul className="text-white/70 text-[10px] md:text-xs space-y-1">
                {deepAnalysis.protectiveFactors?.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-1"><span className="text-emerald-400 mt-0.5">✓</span>{f}</li>
                ))}
              </ul>
            </div>
            <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/15">
              <p className="text-red-300 text-[10px] font-bold mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> 위험요인
              </p>
              <ul className="text-white/70 text-[10px] md:text-xs space-y-1">
                {deepAnalysis.riskFactors?.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-1"><span className="text-red-400 mt-0.5">⚠</span>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </ExpandableSection>
      )}

      {/* ── 3. 심리학 이론 기반 인사이트 ── */}
      <ExpandableSection
        icon={BookOpen}
        title="심리학 이론 기반 인사이트"
        badge="학술 근거"
        defaultOpen={true}
        gradientFrom="from-indigo-900/40" gradientTo="to-blue-900/40" borderColor="border-indigo-500/20"
      >
        <div className="space-y-2.5">
          {psychTheories.map((theory, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div>
                <p className="text-indigo-300 text-xs font-bold">{theory.name}</p>
                <p className="text-white/60 text-[10px] md:text-xs mt-0.5">{theory.insight}</p>
              </div>
            </div>
          ))}
        </div>
      </ExpandableSection>

      {/* ── 4. 추천 리포트 목차 ── */}
      {tableOfContents && tableOfContents.length > 0 && (
        <ExpandableSection
          icon={FileText}
          title="추천 리포트 목차"
          badge={`${tableOfContents.length}개 섹션`}
          defaultOpen={false}
          gradientFrom="from-blue-900/40" gradientTo="to-cyan-900/40" borderColor="border-blue-500/20"
        >
          <ul className="space-y-1.5">
            {tableOfContents.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-white/70 text-xs">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] flex items-center justify-center font-medium shrink-0">{item.index}</span>
                {item.title}
              </li>
            ))}
          </ul>
        </ExpandableSection>
      )}

      {/* ── 5. AI 전문가 조언 ── */}
      <ExpandableSection
        icon={Heart}
        title="AI 전문가의 조언"
        badge={analysisResult.severity}
        defaultOpen={true}
        gradientFrom="from-amber-900/30" gradientTo="to-orange-900/30" borderColor="border-amber-500/20"
      >
        <p className="text-white/80 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
          {analysisResult.detailedAdvice}
        </p>
      </ExpandableSection>

      {/* ── 6. 다차원 발달 프로파일 점수 카드 ── */}
      {reports?.developmentAssessment && (
        <ExpandableSection
          icon={BarChart3}
          title="다차원 발달 프로파일"
          badge="점수 상세"
          defaultOpen={false}
          gradientFrom="from-teal-900/30" gradientTo="to-emerald-900/30" borderColor="border-teal-500/20"
        >
          <div className="grid grid-cols-5 gap-2">
            <CircularGauge value={reports.developmentAssessment.cognitive} label="인지" color="#2dd4bf" size={70} />
            <CircularGauge value={reports.developmentAssessment.language} label="언어" color="#38bdf8" size={70} />
            <CircularGauge value={reports.developmentAssessment.motor} label="운동" color="#a78bfa" size={70} />
            <CircularGauge value={reports.developmentAssessment.social} label="사회성" color="#fb923c" size={70} />
            <CircularGauge value={reports.psychologicalAnalysis?.emotionalStability || 60} label="정서" color="#f472b6" size={70} />
          </div>
          <p className="text-white/60 text-xs mt-3 leading-relaxed">{reports.developmentAssessment.summary}</p>
        </ExpandableSection>
      )}

      {/* ── 7. 맞춤 솔루션 ── */}
      {analysisResult.recommendations && (
        <ExpandableSection
          icon={Target}
          title="맞춤 솔루션"
          defaultOpen={true}
          gradientFrom="from-cyan-900/30" gradientTo="to-blue-900/30" borderColor="border-cyan-500/20"
        >
          <div className="space-y-2">
            {analysisResult.recommendations.map((rec: string, i: number) => (
              <div key={i} className="flex items-start gap-2 bg-white/5 rounded-xl p-3 border border-white/5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-white/80 text-xs md:text-sm">{rec}</span>
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* ── 8. 단계별 로드맵 (타임라인 UI) ── */}
      {reports?.developmentRoadmap && (
        <ExpandableSection
          icon={Zap}
          title="단계별 성장 로드맵"
          badge="3단계"
          defaultOpen={true}
          gradientFrom="from-purple-900/30" gradientTo="to-pink-900/30" borderColor="border-purple-500/20"
        >
          <div className="relative space-y-0">
            {/* 타임라인 라인 */}
            <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-30" />

            {[
              { label: '단기 목표 (1-3개월)', items: reports.developmentRoadmap.immediate || reports.developmentRoadmap.shortTerm, color: 'blue', icon: Clock },
              { label: '중기 목표 (3-6개월)', items: reports.developmentRoadmap.shortTerm || reports.developmentRoadmap.mediumTerm, color: 'purple', icon: TrendingUp },
              { label: '장기 목표 (6-12개월)', items: reports.developmentRoadmap.longTerm, color: 'pink', icon: Star },
            ].map((phase, pi) => (
              <div key={pi} className="relative pl-8 pb-4">
                <div className={`absolute left-0 top-0 w-6 h-6 rounded-full bg-${phase.color}-500/20 border-2 border-${phase.color}-500/50 flex items-center justify-center`}>
                  <phase.icon className={`w-3 h-3 text-${phase.color}-400`} />
                </div>
                <p className={`text-${phase.color}-300 text-xs font-bold mb-1.5`}>{phase.label}</p>
                <ul className="space-y-1">
                  {phase.items?.map((item: string, i: number) => (
                    <li key={i} className="text-white/70 text-xs flex items-start gap-1.5">
                      <span className={`text-${phase.color}-400 mt-0.5`}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* ── 9. 강점/약점 분석 ── */}
      {reports?.strengthsWeaknesses && (
        <ExpandableSection
          icon={Layers}
          title="강점 · 개선 영역 분석"
          defaultOpen={false}
          gradientFrom="from-emerald-900/30" gradientTo="to-teal-900/30" borderColor="border-emerald-500/20"
        >
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-emerald-300 text-[10px] font-bold mb-2 flex items-center gap-1">
                <Flame className="w-3 h-3" /> 강점
              </p>
              <ul className="space-y-1.5">
                {reports.strengthsWeaknesses.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-white/70 text-[10px] md:text-xs flex items-start gap-1">
                    <span className="text-emerald-400">✦</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-amber-300 text-[10px] font-bold mb-2 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> 개선점
              </p>
              <ul className="space-y-1.5">
                {reports.strengthsWeaknesses.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="text-white/70 text-[10px] md:text-xs flex items-start gap-1">
                    <span className="text-amber-400">◆</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {reports.strengthsWeaknesses.growthDirection && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-white/50 text-[10px] font-bold mb-1">성장 방향</p>
              <p className="text-white/70 text-xs">{reports.strengthsWeaknesses.growthDirection}</p>
            </div>
          )}
        </ExpandableSection>
      )}

      {/* ── 10. 전문가 소견 ── */}
      {reports?.expertOpinion && (
        <ExpandableSection
          icon={Users}
          title="전문가 소견 및 권고"
          badge={reports.expertOpinion.urgency?.split('-')[0]?.trim()}
          defaultOpen={false}
          gradientFrom="from-rose-900/30" gradientTo="to-red-900/30" borderColor="border-rose-500/20"
        >
          {reports.expertOpinion.clinicalImpression && (
            <p className="text-white/80 text-xs leading-relaxed mb-3">{reports.expertOpinion.clinicalImpression}</p>
          )}
          <div className="space-y-1.5">
            {reports.expertOpinion.recommendations?.map((rec: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                <span className="text-rose-400 mt-0.5">▸</span>{rec}
              </div>
            ))}
          </div>
          {reports.expertOpinion.urgency && (
            <div className="mt-3 bg-rose-500/10 rounded-lg p-2 border border-rose-500/15">
              <p className="text-rose-300 text-[10px]">
                <strong>긴급도:</strong> {reports.expertOpinion.urgency}
              </p>
            </div>
          )}
        </ExpandableSection>
      )}

      {/* ── 11. AI 생성 리포트 이미지 ── */}
      {reportImages && reportImages.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 md:p-5">
          <h4 className="font-bold mb-3 text-white flex items-center gap-2 text-sm">
            🖼️ AI 분석 리포트 이미지
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {reportImages.map((imageUrl, index) => (
              <div key={index} className="relative group rounded-xl overflow-hidden border border-white/10 bg-slate-800/50 hover:border-amber-500/50 transition-all">
                <img src={imageUrl} alt={`분석 리포트 ${index + 1}`} className="w-full h-auto object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white/80 text-xs">실사 이미지 {index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 12. 9가지 종합 전문 리포트 CTA ── */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-5">
        <Button
          onClick={() => {
            localStorage.setItem('instant_analysis_result', JSON.stringify(analysisResult));
            localStorage.setItem('instant_analysis_input', inputText);
            navigate('/report-generator');
          }}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl"
        >
          <FileText className="w-5 h-5 mr-2" />
          9가지 종합 전문 리포트
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-center text-white/40 text-xs mt-2">Perplexity + Firecrawl 기반 학술 리포트</p>
      </div>

      {/* ── 13. CTA ── */}
      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">더 정확한 분석을 원하신다면?</p>
            <p className="text-white/60 text-xs">3분 온보딩으로 맞춤형 솔루션을 받아보세요</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              localStorage.setItem('instant_analysis_input', inputText);
              navigate('/assessment');
            }}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-5 rounded-xl"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            3분 정밀 분석
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10 py-5 rounded-xl"
          >
            다시 분석
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
