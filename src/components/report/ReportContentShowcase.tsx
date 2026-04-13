import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  Brain, Heart, TrendingUp, Target, LineChart, Users, Shield, Activity,
  BarChart3, FileText, Microscope, ArrowDown, Gamepad2, MessageSquare,
  ClipboardList, Eye as EyeIcon, Stethoscope, BookOpen, Sparkles,
  ChevronRight, Layers, ImageIcon, Map, PieChart
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

// ── 리포트 플로우 (목차 구성) ──
const REPORT_FLOW_KO = [
  { step: '01', title: '리포트 커버 & 데이터 개요', desc: '분석 대상, 연령, 데이터 소스 수, 분석일시를 요약한 전문 표지', icon: FileText, color: 'from-slate-500 to-slate-700' },
  { step: '02', title: '발달 단계별 맞춤 가이드', desc: '아동 연령에 맞는 발달 이정표·정서 특성·핵심 관찰 포인트 안내', icon: BookOpen, color: 'from-sky-500 to-blue-600' },
  { step: '03', title: '9가지 전문 분석 섹션', desc: '인지·정서·사회성·행동 등 다층 분석 + 인포그래픽 시각화', icon: Microscope, color: 'from-violet-500 to-purple-600' },
  { step: '04', title: '인포그래픽 & 차트', desc: '점수 게이지, 레이더 차트, 신호등 위험도, 또래 비교 그래프', icon: PieChart, color: 'from-emerald-500 to-teal-600' },
  { step: '05', title: '맞춤형 로드맵 & 예후', desc: '3/6/12개월 실천 가이드, 개입 전략, 전문가 연계 판단', icon: Map, color: 'from-orange-500 to-amber-600' },
  { step: '06', title: '1장 비주얼 노트 요약', desc: '핵심 지표를 한 장으로 압축한 인포그래픽 카드 (PNG 저장 가능)', icon: ImageIcon, color: 'from-pink-500 to-rose-600' },
];

const REPORT_FLOW_EN = [
  { step: '01', title: 'Report Cover & Data Overview', desc: 'Professional cover summarizing subject, age, data sources, and analysis date', icon: FileText, color: 'from-slate-500 to-slate-700' },
  { step: '02', title: 'Age-Based Development Guide', desc: 'Developmental milestones, emotional traits, and key observation points for the child\'s age', icon: BookOpen, color: 'from-sky-500 to-blue-600' },
  { step: '03', title: '9 Professional Analysis Sections', desc: 'Multi-layered analysis of cognition, emotions, social skills, behavior + infographics', icon: Microscope, color: 'from-violet-500 to-purple-600' },
  { step: '04', title: 'Infographics & Charts', desc: 'Score gauges, radar charts, traffic-light risk levels, peer comparison graphs', icon: PieChart, color: 'from-emerald-500 to-teal-600' },
  { step: '05', title: 'Custom Roadmap & Prognosis', desc: '3/6/12-month action guides, intervention strategies, professional referral guidance', icon: Map, color: 'from-orange-500 to-amber-600' },
  { step: '06', title: 'Visual Note Summary', desc: 'One-page infographic card condensing key metrics (PNG export available)', icon: ImageIcon, color: 'from-pink-500 to-rose-600' },
];

// ── 데이터 소스 → 분석 매핑 ──
const DATA_MAPPING_KO = [
  {
    source: '심리검사 결과',
    icon: ClipboardList,
    sourceColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    targets: ['종합 발달 프로파일', '심리·정서 심층 분석', '강점·약점 매트릭스', '또래 비교 분석'],
    targetColors: ['text-blue-300', 'text-rose-300', 'text-green-300', 'text-indigo-300'],
  },
  {
    source: 'AI 관찰일지',
    icon: EyeIcon,
    sourceColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    targets: ['심리·정서 심층 분석', '맞춤형 개입 프로그램', '가족 지원 가이드'],
    targetColors: ['text-rose-300', 'text-purple-300', 'text-fuchsia-300'],
  },
  {
    source: '게임 상담 (해바라기 마을)',
    icon: Gamepad2,
    sourceColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    targets: ['종합 발달 프로파일', '강점·약점 매트릭스', '발달 로드맵 & 예후'],
    targetColors: ['text-blue-300', 'text-green-300', 'text-orange-300'],
  },
  {
    source: '음성 상담 기록',
    icon: MessageSquare,
    sourceColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    targets: ['심리·정서 심층 분석', '맞춤형 개입 프로그램', '전문가 소견서'],
    targetColors: ['text-rose-300', 'text-purple-300', 'text-teal-300'],
  },
  {
    source: '부모 고민 기록',
    icon: Heart,
    sourceColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    targets: ['가족 지원 가이드', '맞춤형 개입 프로그램', '종합 요약 및 제언'],
    targetColors: ['text-fuchsia-300', 'text-purple-300', 'text-violet-300'],
  },
];

const DATA_MAPPING_EN = [
  {
    source: 'Psychological Assessments',
    icon: ClipboardList,
    sourceColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    targets: ['Development Profile', 'Emotional Analysis', 'Strengths Matrix', 'Peer Comparison'],
    targetColors: ['text-blue-300', 'text-rose-300', 'text-green-300', 'text-indigo-300'],
  },
  {
    source: 'AI Observation Logs',
    icon: EyeIcon,
    sourceColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    targets: ['Emotional Analysis', 'Intervention Program', 'Family Guide'],
    targetColors: ['text-rose-300', 'text-purple-300', 'text-fuchsia-300'],
  },
  {
    source: 'Game Counseling',
    icon: Gamepad2,
    sourceColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    targets: ['Development Profile', 'Strengths Matrix', 'Roadmap & Prognosis'],
    targetColors: ['text-blue-300', 'text-green-300', 'text-orange-300'],
  },
  {
    source: 'Voice Counseling',
    icon: MessageSquare,
    sourceColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    targets: ['Emotional Analysis', 'Intervention Program', 'Expert Opinion'],
    targetColors: ['text-rose-300', 'text-purple-300', 'text-teal-300'],
  },
  {
    source: 'Parent Concerns',
    icon: Heart,
    sourceColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    targets: ['Family Guide', 'Intervention Program', 'Summary & Recommendations'],
    targetColors: ['text-fuchsia-300', 'text-purple-300', 'text-violet-300'],
  },
];

// ── 9가지 섹션 (개선) ──
const SECTIONS_KO = [
  { title: '종합 발달 프로파일', icon: Brain, color: 'from-blue-500 to-cyan-500', dataSources: ['심리검사', '게임상담'], highlight: '인지·언어·사회정서·운동 영역 통합 분석' },
  { title: '심리·정서 심층 분석', icon: Heart, color: 'from-pink-500 to-rose-500', dataSources: ['심리검사', '관찰일지', '음성상담'], highlight: '불안·우울·자존감·스트레스 반응 패턴' },
  { title: '강점·약점 매트릭스', icon: TrendingUp, color: 'from-green-500 to-emerald-500', dataSources: ['심리검사', '게임상담'], highlight: '레이더 차트 기반 시각화' },
  { title: '맞춤형 개입 프로그램', icon: Target, color: 'from-purple-500 to-violet-500', dataSources: ['관찰일지', '음성상담', '고민기록'], highlight: '인지행동 전략·놀이치료 접근' },
  { title: '발달 로드맵 & 예후', icon: LineChart, color: 'from-orange-500 to-amber-500', dataSources: ['게임상담', '심리검사'], highlight: '3/6/12개월 예후 예측' },
  { title: '또래 비교 분석', icon: Users, color: 'from-indigo-500 to-blue-500', dataSources: ['심리검사'], highlight: 'AIHPRO 빅데이터 규준 백분위' },
  { title: '전문가 소견서', icon: Shield, color: 'from-teal-500 to-cyan-500', dataSources: ['음성상담', '심리검사'], highlight: '임상 수준 AI 분석 소견' },
  { title: '가족 지원 가이드', icon: Activity, color: 'from-fuchsia-500 to-pink-500', dataSources: ['관찰일지', '고민기록'], highlight: '맞춤형 양육 전략·정서코칭' },
  { title: '종합 요약 및 제언', icon: BarChart3, color: 'from-violet-500 to-purple-500', dataSources: ['전체 통합'], highlight: '핵심 발견점 + 실천 제언' },
];

const SECTIONS_EN = [
  { title: 'Development Profile', icon: Brain, color: 'from-blue-500 to-cyan-500', dataSources: ['Assessments', 'Game'], highlight: 'Integrated cognitive, language, social-emotional, motor analysis' },
  { title: 'Emotional Deep Analysis', icon: Heart, color: 'from-pink-500 to-rose-500', dataSources: ['Assessments', 'Observations', 'Voice'], highlight: 'Anxiety, depression, self-esteem, stress patterns' },
  { title: 'Strengths & Weaknesses', icon: TrendingUp, color: 'from-green-500 to-emerald-500', dataSources: ['Assessments', 'Game'], highlight: 'Radar chart visualization' },
  { title: 'Intervention Program', icon: Target, color: 'from-purple-500 to-violet-500', dataSources: ['Observations', 'Voice', 'Concerns'], highlight: 'CBT strategies, play therapy' },
  { title: 'Roadmap & Prognosis', icon: LineChart, color: 'from-orange-500 to-amber-500', dataSources: ['Game', 'Assessments'], highlight: '3/6/12-month prognosis' },
  { title: 'Peer Comparison', icon: Users, color: 'from-indigo-500 to-blue-500', dataSources: ['Assessments'], highlight: 'AIHPRO big data percentiles' },
  { title: 'Expert Opinion', icon: Shield, color: 'from-teal-500 to-cyan-500', dataSources: ['Voice', 'Assessments'], highlight: 'Clinical-level AI analysis' },
  { title: 'Family Guide', icon: Activity, color: 'from-fuchsia-500 to-pink-500', dataSources: ['Observations', 'Concerns'], highlight: 'Custom parenting strategies' },
  { title: 'Summary & Recommendations', icon: BarChart3, color: 'from-violet-500 to-purple-500', dataSources: ['All integrated'], highlight: 'Key findings + action items' },
];

type TabType = 'flow' | 'sections' | 'mapping';

const ReportContentShowcase: React.FC = () => {
  const { isEnglish } = useLanguage();
  const t = (ko: string, en: string) => isEnglish ? en : ko;
  const [activeTab, setActiveTab] = useState<TabType>('flow');
  const [activeSection, setActiveSection] = useState(0);

  const REPORT_FLOW = isEnglish ? REPORT_FLOW_EN : REPORT_FLOW_KO;
  const DATA_MAPPING = isEnglish ? DATA_MAPPING_EN : DATA_MAPPING_KO;
  const SECTIONS = isEnglish ? SECTIONS_EN : SECTIONS_KO;

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'flow', label: t('리포트 구성', 'Report Structure'), icon: <Layers className="w-3.5 h-3.5" /> },
    { key: 'sections', label: t('9가지 분석', '9 Analyses'), icon: <Microscope className="w-3.5 h-3.5" /> },
    { key: 'mapping', label: t('데이터 연결', 'Data Mapping'), icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="max-w-5xl mx-auto mb-10"
    >
      {/* 헤더 */}
      <div className="text-center mb-5">
        <h2 className="text-lg md:text-xl font-bold text-white flex items-center justify-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" />
          {t('리포트에 담기는 내용', 'What\'s Inside Your Report')}
        </h2>
        <p className="text-muted-foreground text-xs mt-1">
          {t('5가지 데이터가 9가지 전문 분석으로 통합됩니다', '5 data sources integrated into 9 professional analyses')}
        </p>
      </div>

      {/* 탭 */}
      <div className="flex justify-center gap-1 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── TAB 1: 리포트 구성 플로우 ── */}
        {activeTab === 'flow' && (
          <motion.div
            key="flow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {REPORT_FLOW.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-center gap-3 bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/8 transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-md`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary/70">{item.step}</span>
                    <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.desc}</p>
                </div>
                {idx < REPORT_FLOW.length - 1 && (
                  <ArrowDown className="w-3.5 h-3.5 text-white/20 shrink-0 hidden md:block" />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── TAB 2: 9가지 분석 섹션 ── */}
        {activeTab === 'sections' && (
          <motion.div
            key="sections"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-3">
              {SECTIONS.map((section, idx) => {
                const IconComp = section.icon;
                const isActive = activeSection === idx;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveSection(idx)}
                    className={`relative p-3 md:p-4 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/10'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center mb-2`}>
                      <IconComp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <p className="text-[10px] md:text-xs font-semibold text-white leading-tight">{section.title}</p>
                    {isActive && (
                      <motion.div layoutId="section-indicator" className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* 선택 섹션 상세 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 bg-white/5 rounded-xl border border-white/10 p-4 md:p-5"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${SECTIONS[activeSection].color} shrink-0`}>
                    {React.createElement(SECTIONS[activeSection].icon, { className: "w-5 h-5 text-white" })}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white mb-1">{SECTIONS[activeSection].title}</h4>
                    <p className="text-xs text-primary font-semibold mb-2">✨ {SECTIONS[activeSection].highlight}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SECTIONS[activeSection].dataSources.map((ds, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] bg-white/5 border-white/15 text-muted-foreground">
                          {ds}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── TAB 3: 데이터→분석 매핑 ── */}
        {activeTab === 'mapping' && (
          <motion.div
            key="mapping"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <p className="text-center text-[11px] text-muted-foreground mb-2">
              {t('각 데이터 소스가 리포트의 어떤 섹션에 반영되는지 확인하세요', 'See how each data source feeds into report sections')}
            </p>
            {DATA_MAPPING.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 rounded-xl border border-white/10 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${item.sourceColor}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">{item.source}</span>
                  <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
                </div>
                <div className="flex flex-wrap gap-1.5 pl-12">
                  {item.targets.map((target, i) => (
                    <span key={i} className={`text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 ${item.targetColors[i]} font-medium`}>
                      → {target}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReportContentShowcase;
