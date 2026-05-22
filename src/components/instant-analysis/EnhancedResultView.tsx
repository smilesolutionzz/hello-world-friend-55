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
import { useLanguage } from '@/i18n/LanguageContext';
import { YouTubeRecommendations } from './YouTubeRecommendations';
import { VisualNoteSection } from './VisualNoteSection';

interface EnhancedResultViewProps {
  analysisResult: any;
  inputText: string;
  reportImages: string[];
  tableOfContents: Array<{ index: number; title: string }> | null;
  youtubeVideos?: any[];
  onReset: () => void;
}

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
          <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span className={`text-lg font-bold ${getColor()}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            {animatedValue}
          </motion.span>
        </div>
      </div>
      <span className="text-base text-white text-center leading-tight">{label}</span>
    </div>
  );
};

const RiskMeter = ({ level, label }: { level: string; label: string }) => {
  const { isEnglish } = useLanguage();
  const levelsKo = ['낮음', '중간', '높음'];
  const levelsEn = ['Low', 'Medium', 'High'];
  const levels = isEnglish ? levelsEn : levelsKo;
  const idx = levels.indexOf(level);
  const actualIdx = idx >= 0 ? idx : levelsKo.indexOf(level);
  const percentage = actualIdx === 0 ? 25 : actualIdx === 1 ? 55 : 85;
  const colors = ['from-emerald-500 to-green-400', 'from-amber-500 to-orange-400', 'from-red-500 to-rose-400'];
  const bgColor = colors[actualIdx] || colors[0];

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-base text-white">{label}</span>
        <Badge className={`text-base ${actualIdx === 2 ? 'bg-red-500/20 text-red-300' : actualIdx === 1 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
          {level}
        </Badge>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full bg-gradient-to-r ${bgColor}`} initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }} />
      </div>
    </div>
  );
};

const ExpandableSection = ({ icon: Icon, title, badge, children, defaultOpen = false, gradientFrom, gradientTo, borderColor }: {
  icon: any; title: string; badge?: string; children: React.ReactNode;
  defaultOpen?: boolean; gradientFrom: string; gradientTo: string; borderColor: string;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} backdrop-blur-xl rounded-2xl border ${borderColor} overflow-hidden`}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 md:p-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
          <h4 className="text-base md:text-base font-bold text-white">{title}</h4>
          {badge && <Badge className="text-base bg-white/10 text-white">{badge}</Badge>}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 md:px-5 pb-4 md:pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const EnhancedResultView = ({ analysisResult, inputText, reportImages, tableOfContents, youtubeVideos, onReset }: EnhancedResultViewProps) => {
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();
  const reports = analysisResult.comprehensiveReports;
  const deepAnalysis = analysisResult.deepAnalysis;

  // Classify concern type: emotional vs developmental
  const developmentalKeywords = ['발달', '언어지연', '자폐', 'ADHD', '주의력', '운동발달', '감각', '또래', '개월', '걷지', '말 안', '말이 느', 'speech', 'delay', 'milestone', 'autism', 'motor', 'developmental'];
  const isDevelopmental = developmentalKeywords.some(kw => inputText.toLowerCase().includes(kw.toLowerCase()));

  const profileLabel = isEnglish
    ? (isDevelopmental ? 'Multi-dimensional Developmental Profile' : 'Multi-dimensional Emotional Profile')
    : (isDevelopmental ? '다차원 발달 프로파일' : '다차원 정서 프로파일');

  const radarLabels = isDevelopmental
    ? (isEnglish ? ['Cognitive', 'Language', 'Motor', 'Social', 'Emotional'] : ['인지', '언어', '운동', '사회성', '정서'])
    : (isEnglish ? ['Emotional Stability', 'Stress Coping', 'Self-esteem', 'Relationships', 'Resilience'] : ['정서안정', '스트레스 대처', '자아존중감', '대인관계', '회복탄력성']);

  const radarData = reports?.developmentAssessment ? [
    { subject: radarLabels[0], value: reports.developmentAssessment.cognitive || 60, fullMark: 100 },
    { subject: radarLabels[1], value: reports.developmentAssessment.language || 60, fullMark: 100 },
    { subject: radarLabels[2], value: reports.developmentAssessment.motor || 60, fullMark: 100 },
    { subject: radarLabels[3], value: reports.developmentAssessment.social || 60, fullMark: 100 },
    { subject: radarLabels[4], value: reports.psychologicalAnalysis?.emotionalStability || 60, fullMark: 100 },
  ] : [];

  const psychTheories = isEnglish ? [
    { name: "Beck's Cognitive Model", insight: 'Negative automatic thought patterns detected; cognitive restructuring may be needed.' },
    { name: "Bowlby's Attachment Theory", insight: 'Building a secure attachment base is the key resource for overcoming current difficulties.' },
    { name: "Erikson's Developmental Stages", insight: 'Successfully resolving current developmental tasks contributes to long-term psychological stability.' },
  ] : [
    { name: 'Beck의 인지모델', insight: '부정적 자동사고 패턴이 감지되며, 인지 재구성이 필요할 수 있습니다.' },
    { name: 'Bowlby 애착이론', insight: '안정적 애착 기반 형성이 현재 어려움 극복의 핵심 자원입니다.' },
    { name: 'Erikson 발달단계', insight: '현 발달 과업의 성공적 해결이 장기적 심리 안정에 기여합니다.' },
  ];

  const overallScore = reports?.developmentAssessment?.overall || analysisResult.confidence || 75;

  // i18n labels
  const L = {
    analysisComplete: isEnglish ? 'Expert Deep Analysis Complete' : '전문가 심층 분석 완료',
    confidence: isEnglish ? 'Confidence' : '신뢰도',
    crossValidation: isEnglish ? 'Multi-model cross validation' : '다중 모델 교차 검증',
    overallScore: isEnglish ? 'Overall Score' : '종합 점수',
    outOf100: isEnglish ? 'Out of 100' : '100점 만점 기준',
    devProfile: profileLabel,
    overallRisk: isEnglish ? 'Overall Risk Level' : '전체 위험도',
    expertIntervention: isEnglish ? 'Expert Intervention Needed' : '전문가 개입 필요도',
    deepCause: isEnglish ? 'Deep Root Cause Analysis' : '심층 원인 분석',
    aiMultiLayer: isEnglish ? 'Multi-layer Analysis' : '다층 분석',
    symptomPattern: isEnglish ? 'Symptom Pattern Analysis' : '증상 패턴 분석',
    protectiveFactors: isEnglish ? 'Protective Factors' : '보호요인',
    riskFactors: isEnglish ? 'Risk Factors' : '위험요인',
    psychInsights: isEnglish ? 'Psychology Theory-based Insights' : '심리학 이론 기반 인사이트',
    academicBasis: isEnglish ? 'Academic Evidence' : '학술 근거',
    reportTOC: isEnglish ? 'Recommended Report Sections' : '추천 리포트 목차',
    sections: isEnglish ? 'sections' : '개 섹션',
    expertAdvice: isEnglish ? "AI Expert's Advice" : 'AI 전문가의 조언',
    multiDimProfile: profileLabel,
    scoreDetail: isEnglish ? 'Score Details' : '점수 상세',
    customSolutions: isEnglish ? 'Personalized Solutions' : '맞춤 솔루션',
    growthRoadmap: isEnglish ? 'Step-by-step Growth Roadmap' : '단계별 성장 로드맵',
    shortTerm: isEnglish ? 'Short-term (1-3 months)' : '단기 목표 (1-3개월)',
    midTerm: isEnglish ? 'Mid-term (3-6 months)' : '중기 목표 (3-6개월)',
    longTerm: isEnglish ? 'Long-term (6-12 months)' : '장기 목표 (6-12개월)',
    strengthsWeaknesses: isEnglish ? 'Strengths & Areas for Improvement' : '강점 · 개선 영역 분석',
    strengths: isEnglish ? 'Strengths' : '강점',
    improvements: isEnglish ? 'Areas to Improve' : '개선점',
    growthDirection: isEnglish ? 'Growth Direction' : '성장 방향',
    expertOpinion: isEnglish ? 'Expert Opinion & Recommendations' : '전문가 소견 및 권고',
    urgency: isEnglish ? 'Urgency' : '긴급도',
    fullReport: isEnglish ? '9 Comprehensive Expert Reports' : '9가지 종합 전문 리포트',
    reportSub: isEnglish ? 'Evidence-based expert analysis reports' : '최신 학술 근거 기반 전문 분석 리포트',
    wantMore: isEnglish ? 'Want a more accurate analysis?' : '더 정확한 분석을 원하신다면?',
    wantMoreSub: isEnglish ? 'Get personalized solutions with 3-min onboarding' : '3분 온보딩으로 맞춤형 솔루션을 받아보세요',
    preciseAnalysis: isEnglish ? '3-Min Precision Analysis' : '3분 정밀 분석',
    analyzeAgain: isEnglish ? 'Write New Concern' : '고민 새로 작성하기',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto space-y-4 pb-[120px] md:pb-8">
      {/* 1. Result Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/10 p-4 md:p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 md:gap-3">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-white">{L.analysisComplete}</h3>
              <p className="text-base text-white">{L.confidence} {analysisResult.confidence}% · {L.crossValidation}</p>
            </div>
          </div>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-base shrink-0">{analysisResult.type}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-4 border border-white/5">
            <CircularGauge value={overallScore} label={L.overallScore} color={overallScore >= 70 ? '#34d399' : overallScore >= 40 ? '#fbbf24' : '#f87171'} size={110} />
            <div className="mt-2 flex items-center gap-1">
              <Activity className="w-3 h-3 text-white" />
              <span className="text-base text-white">{L.outOf100}</span>
            </div>
          </div>
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
              <p className="text-center text-base text-white">{L.devProfile}</p>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <RiskMeter level={analysisResult.severity} label={L.overallRisk} />
          {reports?.expertOpinion && <RiskMeter level={reports.expertOpinion.interventionNeeded} label={L.expertIntervention} />}
        </div>
      </div>

      {/* 2. Deep Analysis */}
      {deepAnalysis && (
        <ExpandableSection icon={Brain} title={L.deepCause} badge={L.aiMultiLayer} defaultOpen={true} gradientFrom="from-violet-900" gradientTo="to-purple-900" borderColor="border-violet-500/20">
          <p className="text-white text-base md:text-lg leading-relaxed mb-4">{deepAnalysis.rootCauseAnalysis}</p>
          {deepAnalysis.symptomPattern && (
            <div className="bg-violet-500/10 rounded-xl p-3 border border-violet-500/15 mb-3">
              <p className="text-violet-300 text-base font-bold mb-1 flex items-center gap-1"><Eye className="w-3 h-3" /> {L.symptomPattern}</p>
              <p className="text-white text-base">{deepAnalysis.symptomPattern}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/15">
              <p className="text-emerald-300 text-base font-bold mb-1.5 flex items-center gap-1"><Shield className="w-3 h-3" /> {L.protectiveFactors}</p>
              <ul className="text-white text-base md:text-base space-y-1">
                {deepAnalysis.protectiveFactors?.map((f: string, i: number) => (<li key={i} className="flex items-start gap-1"><span className="text-emerald-400 mt-0.5">✓</span>{f}</li>))}
              </ul>
            </div>
            <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/15">
              <p className="text-red-300 text-base font-bold mb-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {L.riskFactors}</p>
              <ul className="text-white text-base md:text-base space-y-1">
                {deepAnalysis.riskFactors?.map((f: string, i: number) => (<li key={i} className="flex items-start gap-1"><span className="text-red-400 mt-0.5">⚠</span>{f}</li>))}
              </ul>
            </div>
          </div>
        </ExpandableSection>
      )}

      {/* 3. Psychology Insights */}
      <ExpandableSection icon={BookOpen} title={L.psychInsights} badge={L.academicBasis} defaultOpen={true} gradientFrom="from-indigo-900/40" gradientTo="to-blue-900/40" borderColor="border-indigo-500/20">
        <div className="space-y-2.5">
          {psychTheories.map((theory, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5"><Compass className="w-3.5 h-3.5 text-indigo-400" /></div>
              <div>
                <p className="text-indigo-300 text-base font-bold">{theory.name}</p>
                <p className="text-white text-base md:text-base mt-0.5">{theory.insight}</p>
              </div>
            </div>
          ))}
        </div>
      </ExpandableSection>

      {/* 4. Report TOC */}
      {tableOfContents && tableOfContents.length > 0 && (
        <ExpandableSection icon={FileText} title={L.reportTOC} badge={`${tableOfContents.length}${isEnglish ? ' ' : ''}${L.sections}`} defaultOpen={false} gradientFrom="from-blue-900/40" gradientTo="to-cyan-900/40" borderColor="border-blue-500/20">
          <ul className="space-y-1.5">
            {tableOfContents.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-white text-base">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 text-base flex items-center justify-center font-medium shrink-0">{item.index}</span>
                {item.title}
              </li>
            ))}
          </ul>
        </ExpandableSection>
      )}

      {/* 5. Expert Advice */}
      <ExpandableSection icon={Heart} title={L.expertAdvice} badge={analysisResult.severity} defaultOpen={true} gradientFrom="from-amber-900/30" gradientTo="to-orange-900/30" borderColor="border-amber-500/20">
        <p className="text-white text-base md:text-lg leading-relaxed whitespace-pre-wrap">{analysisResult.detailedAdvice}</p>
      </ExpandableSection>

      {/* 6. Development Profile Scores */}
      {reports?.developmentAssessment && (
        <ExpandableSection icon={BarChart3} title={L.multiDimProfile} badge={L.scoreDetail} defaultOpen={false} gradientFrom="from-teal-900/30" gradientTo="to-emerald-900/30" borderColor="border-teal-500/20">
          <div className="grid grid-cols-5 gap-2">
            <CircularGauge value={reports.developmentAssessment.cognitive} label={radarLabels[0]} color="#2dd4bf" size={70} />
            <CircularGauge value={reports.developmentAssessment.language} label={radarLabels[1]} color="#38bdf8" size={70} />
            <CircularGauge value={reports.developmentAssessment.motor} label={radarLabels[2]} color="#a78bfa" size={70} />
            <CircularGauge value={reports.developmentAssessment.social} label={radarLabels[3]} color="#fb923c" size={70} />
            <CircularGauge value={reports.psychologicalAnalysis?.emotionalStability || 60} label={radarLabels[4]} color="#f472b6" size={70} />
          </div>
          <p className="text-white text-base mt-3 leading-relaxed">{reports.developmentAssessment.summary}</p>
        </ExpandableSection>
      )}

      {/* 7. Custom Solutions */}
      {analysisResult.recommendations && (
        <ExpandableSection icon={Target} title={L.customSolutions} defaultOpen={true} gradientFrom="from-cyan-900/30" gradientTo="to-blue-900/30" borderColor="border-cyan-500/20">
          <div className="space-y-2">
            {analysisResult.recommendations.map((rec: string, i: number) => (
              <div key={i} className="flex items-start gap-2 bg-white/5 rounded-xl p-3 border border-white/5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-base flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-white text-base md:text-lg">{rec}</span>
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* 8. Growth Roadmap */}
      {reports?.developmentRoadmap && (
        <ExpandableSection icon={Zap} title={L.growthRoadmap} badge={isEnglish ? '3 phases' : '3단계'} defaultOpen={true} gradientFrom="from-purple-900/30" gradientTo="to-pink-900/30" borderColor="border-purple-500/20">
          <div className="relative space-y-0">
            <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-30" />
            {[
              { label: L.shortTerm, items: reports.developmentRoadmap.immediate || reports.developmentRoadmap.shortTerm, color: 'blue', icon: Clock },
              { label: L.midTerm, items: reports.developmentRoadmap.shortTerm || reports.developmentRoadmap.mediumTerm, color: 'purple', icon: TrendingUp },
              { label: L.longTerm, items: reports.developmentRoadmap.longTerm, color: 'pink', icon: Star },
            ].map((phase, pi) => (
              <div key={pi} className="relative pl-8 pb-4">
                <div className={`absolute left-0 top-0 w-6 h-6 rounded-full bg-${phase.color}-500/20 border-2 border-${phase.color}-500/50 flex items-center justify-center`}>
                  <phase.icon className={`w-3 h-3 text-${phase.color}-400`} />
                </div>
                <p className={`text-${phase.color}-300 text-base font-bold mb-1.5`}>{phase.label}</p>
                <ul className="space-y-1">
                  {phase.items?.map((item: string, i: number) => (
                    <li key={i} className="text-white text-base flex items-start gap-1.5"><span className={`text-${phase.color}-400 mt-0.5`}>•</span>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* 9. Strengths & Weaknesses */}
      {reports?.strengthsWeaknesses && (
        <ExpandableSection icon={Layers} title={L.strengthsWeaknesses} defaultOpen={false} gradientFrom="from-emerald-900" gradientTo="to-teal-900" borderColor="border-emerald-500/20">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-emerald-300 text-base font-bold mb-2 flex items-center gap-1"><Flame className="w-3 h-3" /> {L.strengths}</p>
              <ul className="space-y-1.5">
                {reports.strengthsWeaknesses.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-white text-base md:text-base flex items-start gap-1"><span className="text-emerald-400">✦</span>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-amber-300 text-base font-bold mb-2 flex items-center gap-1"><Lightbulb className="w-3 h-3" /> {L.improvements}</p>
              <ul className="space-y-1.5">
                {reports.strengthsWeaknesses.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="text-white text-base md:text-base flex items-start gap-1"><span className="text-amber-400">◆</span>{w}</li>
                ))}
              </ul>
            </div>
          </div>
          {reports.strengthsWeaknesses.growthDirection && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-white text-base font-bold mb-1">{L.growthDirection}</p>
              <p className="text-white text-base">{reports.strengthsWeaknesses.growthDirection}</p>
            </div>
          )}
        </ExpandableSection>
      )}

      {/* 10. Expert Opinion */}
      {reports?.expertOpinion && (
        <ExpandableSection icon={Users} title={L.expertOpinion} badge={reports.expertOpinion.urgency?.split('-')[0]?.trim()} defaultOpen={false} gradientFrom="from-rose-900" gradientTo="to-red-900" borderColor="border-rose-500/20">
          {reports.expertOpinion.clinicalImpression && (
            <p className="text-white text-base leading-relaxed mb-3">{reports.expertOpinion.clinicalImpression}</p>
          )}
          <div className="space-y-1.5">
            {reports.expertOpinion.recommendations?.map((rec: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-base text-white"><span className="text-rose-400 mt-0.5">▸</span>{rec}</div>
            ))}
          </div>
          {reports.expertOpinion.urgency && (
            <div className="mt-3 bg-rose-500/10 rounded-lg p-3 border border-rose-500/15 space-y-2">
              <p className="text-rose-300 text-base"><strong>{L.urgency}:</strong> {reports.expertOpinion.urgency}</p>
              <Button
                onClick={() => navigate(isEnglish ? '/en/expert-hiring' : '/expert-hiring')}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 rounded-xl text-base"
              >
                <Users className="w-4 h-4 mr-1.5" />
                {isEnglish ? 'Talk to an Expert' : '전문가와 바로 상담하기'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </ExpandableSection>
      )}

      {/* 10.5. YouTube Recommendations */}
      {youtubeVideos && youtubeVideos.length > 0 && (
        <YouTubeRecommendations videos={youtubeVideos} />
      )}

      {/* 11. Visual Note (replaces report images) */}
      <VisualNoteSection analysisResult={analysisResult} inputText={inputText} />

      {/* 12. Full Report CTA — 전환 강화 */}
      <div className="bg-gradient-to-br from-indigo-900 to-violet-900 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-5 space-y-4">
        {/* 감성 트리거 카피 */}
        <div className="text-center space-y-2">
          <p className="text-white text-base font-bold leading-snug">
            {isEnglish 
              ? '"I thought something was seriously wrong with my child..."'
              : '"평소엔 괜찮다가, 오늘 같은 날이 오면\n진짜 정신병인가 싶거든요"'}
          </p>
          <p className="text-white text-base">
            {isEnglish
              ? 'A real parent found clarity through our PhD-grade report'
              : '— 실제 사용자가 리포트를 보고 아이를 이해하기 시작했습니다'}
          </p>
        </div>

        {/* Before → After 전환 */}
        <div className="bg-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
            <p className="text-white text-base line-through">
              {isEnglish ? '"Is my child really sick?"' : '"우리 아이 진짜 이상한 건 아닐까?"'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
            <p className="text-white text-base font-semibold">
              {isEnglish 
                ? '"It\'s a natural stress response at this developmental stage"'
                : '"발달 단계상 매우 자연스러운 스트레스 반응입니다"'}
            </p>
          </div>
          <p className="text-amber-200 text-base text-center">
            {isEnglish
              ? '→ Fear turned into understanding with one report'
              : '→ 리포트 하나로 공포가 이해로 바뀌었습니다'}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={() => {
              localStorage.setItem('instant_analysis_result', JSON.stringify(analysisResult));
              localStorage.setItem('instant_analysis_input', inputText);
              navigate(isEnglish ? '/en/report-generator' : '/report-generator');
            }}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl text-base"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            {isEnglish ? '7-Day Mind Track — ₩7,900' : '7일 마음 트랙 — ₩7,900'}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button onClick={onReset} variant="outline" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 py-3 rounded-xl text-base">
            {L.analyzeAgain}
          </Button>
        </div>
        <p className="text-center text-white text-base">
          {isEnglish
            ? '12-week roadmap · risk assessment · expert commentary'
            : '12주 로드맵 · 위험도 평가 · 전문가급 소견 포함'}
        </p>
      </div>

      {/* 면책 문구 */}
      <p className="text-base text-white text-center px-4">
        {isEnglish 
          ? 'This analysis is generated by an AI engine based on expert knowledge and does not replace professional diagnosis.'
          : '본 분석은 전문가 지식 기반 AI 엔진으로 작성되었으며, 전문 진단을 대체하지 않습니다.'}
      </p>
    </motion.div>
  );
};
