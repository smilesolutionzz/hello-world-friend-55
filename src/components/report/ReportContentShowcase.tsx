import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Brain, Heart, TrendingUp, Target, LineChart, Users, Shield, Activity,
  BarChart3, FileText, Stethoscope, Gamepad2, MessageSquare,
  ClipboardList, Eye as EyeIcon, BookOpen, Sparkles,
  ChevronRight, ChevronDown, Layers, ImageIcon, Map, PieChart, Download
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

// ── 실제 리포트에 담기는 10개 섹션 (상세 내용 포함) ──
const REPORT_SECTIONS = [
  {
    title: '발달 단계별 맞춤 가이드',
    icon: BookOpen,
    color: 'from-sky-500 to-blue-600',
    summary: '아동 연령에 맞는 발달 이정표와 정서 특성 안내',
    details: [
      '현재 발달 단계(영아기/유아기/학령기 등) 자동 판별',
      '해당 연령의 핵심 발달 과제 5가지 제시',
      '인지·언어·사회성·운동 영역별 기대 수준 안내',
      '부모가 주목해야 할 관찰 포인트 제공',
    ],
    dataSources: ['아동 생년월일', '성별'],
  },
  {
    title: '종합 발달 프로파일',
    icon: Brain,
    color: 'from-blue-500 to-cyan-500',
    summary: '인지·언어·사회정서·운동 영역 통합 점수 및 해석',
    details: [
      '영역별 점수 (100점 만점) + 또래 백분위 산출',
      '종합 발달 지수 계산 및 또래 평균 대비 위치',
      '각 영역별 강점과 약점 한눈에 비교',
      '신호등 위험도 표시 (🟢정상 🟡주의 🔴위험)',
    ],
    dataSources: ['심리검사', '게임상담'],
  },
  {
    title: '심리·정서 심층 분석',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    summary: '불안·우울·자존감·스트레스 반응 패턴 다층 분석',
    details: [
      '불안 수준 분석: 분리불안, 수행불안, 사회불안 세분화',
      '자존감 프로파일: 학업적/사회적/신체적 자존감 비교',
      '스트레스 반응 패턴: 내재화 vs 외현화 경향 분석',
      'T점수 기반 임상 심각도 분류',
    ],
    dataSources: ['심리검사', '관찰일지', '음성상담'],
  },
  {
    title: '강점·약점 매트릭스',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    summary: '레이더 차트 기반 핵심 강점과 지원 필요 영역 시각화',
    details: [
      '핵심 강점 영역 🟢 (상위 30% 이상) 목록',
      '지원 필요 영역 🟡 (하위 35% 이하) 목록',
      '각 강점/약점에 대한 구체적 근거 제시',
      '강점 활용 전략 + 약점 보완 전략 제안',
    ],
    dataSources: ['심리검사', '게임상담'],
  },
  {
    title: '맞춤형 개입 프로그램',
    icon: Target,
    color: 'from-purple-500 to-violet-500',
    summary: '12주 단계별 실천 가이드 (정서훈련→사회기술→자기조절)',
    details: [
      '1단계(1~4주): 정서 인식 훈련 - 감정 카드, 감정 일기',
      '2단계(5~8주): 사회 기술 훈련 - 역할극, 또래 활동',
      '3단계(9~12주): 자기조절 전략 - 거북이 기법, 호흡법',
      '각 단계별 체크리스트 및 성공 기준 제시',
    ],
    dataSources: ['관찰일지', '음성상담', '고민기록'],
  },
  {
    title: '발달 로드맵 & 예후',
    icon: LineChart,
    color: 'from-orange-500 to-amber-500',
    summary: '3/6/12개월 예후 예측 및 개입 효과 시뮬레이션',
    details: [
      '3개월 후: 단기 목표 및 예상 변화 수치',
      '6개월 후: 중기 목표 및 또래 비교 예측',
      '12개월 후: 장기 목표 및 종합 발달 지수 예측',
      '신뢰도 점수와 함께 예후 판정 제공',
    ],
    dataSources: ['게임상담', '심리검사'],
  },
  {
    title: '또래 비교 분석',
    icon: Users,
    color: 'from-indigo-500 to-blue-500',
    summary: 'AIHPRO 빅데이터 기반 동일 연령·성별 백분위 산출',
    details: [
      '영역별 백분위 순위 (상위 몇 %인지)',
      '동일 연령·성별 아동 대비 상대적 위치',
      '발달 이정표 달성 여부 체크',
      '특별히 뛰어난 영역과 지원 필요 영역 하이라이트',
    ],
    dataSources: ['심리검사'],
  },
  {
    title: '전문가 소견서',
    icon: Shield,
    color: 'from-teal-500 to-cyan-500',
    summary: 'AI 임상 분석 엔진 기반 전문가 수준 소견',
    details: [
      '종합적 발달 상태에 대한 임상 수준 소견',
      '주요 발견점 및 임상적 의미 해석',
      '추가 평가 필요 여부 판단',
      '전문 기관 연계 권고 사항',
    ],
    dataSources: ['음성상담', '심리검사'],
  },
  {
    title: '가족 지원 가이드',
    icon: Activity,
    color: 'from-fuchsia-500 to-pink-500',
    summary: '맞춤형 양육 전략 및 가정 실천 매뉴얼',
    details: [
      '감정 코칭 대화법 예시 (구체적 멘트 포함)',
      '일과표 활용법 및 환경 구조화 전략',
      '긍정 강화 방법 및 구체적 칭찬 예시',
      '스크린 타임 관리 및 또래 놀이 주선 가이드',
    ],
    dataSources: ['관찰일지', '고민기록'],
  },
  {
    title: '종합 요약 및 제언',
    icon: BarChart3,
    color: 'from-violet-500 to-purple-500',
    summary: 'Executive Summary + 핵심 발견점 + 실천 제언',
    details: [
      '종합 발달 지수 및 또래 대비 위치 요약',
      '최우선 지원 영역 + 권장 개입 전략',
      '핵심 강점 활용 방안',
      '12개월 예후 예측 및 후속 검사 일정 제안',
    ],
    dataSources: ['전체 통합'],
  },
];

// ── 데이터 소스 → 분석 매핑 ──
const DATA_SOURCES = [
  { name: '심리검사', icon: ClipboardList, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', sections: [1,2,3,5,6,7] },
  { name: 'AI 관찰일지', icon: EyeIcon, color: 'bg-green-500/20 text-green-400 border-green-500/30', sections: [2,4,8] },
  { name: '게임 상담', icon: Gamepad2, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', sections: [1,3,5] },
  { name: '음성 상담', icon: MessageSquare, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', sections: [2,4,7] },
  { name: '부모 고민', icon: Heart, color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', sections: [4,8,9] },
];

type TabType = 'sections' | 'mapping';

const ReportContentShowcase: React.FC = () => {
  const { isEnglish } = useLanguage();
  const t = (ko: string, en: string) => isEnglish ? en : ko;
  const [activeTab, setActiveTab] = useState<TabType>('sections');
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'sections', label: t('리포트 구성 (10개 섹션)', 'Report Structure (10 Sections)'), icon: <Layers className="w-3.5 h-3.5" /> },
    { key: 'mapping', label: t('데이터 → 분석 연결', 'Data → Analysis Mapping'), icon: <Sparkles className="w-3.5 h-3.5" /> },
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
          {t('5가지 데이터 소스가 10개 전문 분석 섹션으로 통합됩니다', '5 data sources integrated into 10 professional analysis sections')}
        </p>
      </div>

      {/* 데모 리포트 다운로드 */}
      <div className="flex justify-center mb-5">
        <a href="/demo/AIHPRO_Demo_Report.docx" download="AIHPRO_데모_리포트.docx">
          <Button variant="outline" className="border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 gap-2 rounded-xl px-6">
            <Download className="w-4 h-4" />
            {t('데모 리포트 다운로드 (.docx)', 'Download Demo Report (.docx)')}
          </Button>
        </a>
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
        {/* ── TAB 1: 리포트 섹션 (확장형) ── */}
        {activeTab === 'sections' && (
          <motion.div
            key="sections"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {REPORT_SECTIONS.map((section, idx) => {
              const isExpanded = expandedSection === idx;
              const IconComp = section.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <button
                    onClick={() => setExpandedSection(isExpanded ? null : idx)}
                    className={`w-full flex items-center gap-3 bg-white/5 rounded-xl border p-4 hover:bg-white/8 transition-all text-left ${
                      isExpanded ? 'border-primary/40 bg-primary/5' : 'border-white/10'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center shrink-0 shadow-md`}>
                      <IconComp className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-primary/60">{String(idx + 1).padStart(2, '0')}</span>
                        <h4 className="text-sm font-bold text-white truncate">{section.title}</h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{section.summary}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {section.dataSources.slice(0, 2).map((ds, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground hidden md:inline-block">{ds}</span>
                      ))}
                      <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-12 mr-4 mt-1 mb-2 p-4 bg-white/[0.03] rounded-lg border border-white/5 space-y-2">
                          <p className="text-[11px] text-primary font-semibold mb-2">{t('이 섹션에서 확인할 수 있는 내용:', 'What you\'ll find in this section:')}</p>
                          {section.details.map((detail, di) => (
                            <div key={di} className="flex items-start gap-2">
                              <span className="text-primary text-xs mt-0.5">•</span>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{detail}</p>
                            </div>
                          ))}
                          <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-white/5">
                            <span className="text-[9px] text-white/30 mr-1">{t('데이터 소스:', 'Data sources:')}</span>
                            {section.dataSources.map((ds, i) => (
                              <Badge key={i} variant="outline" className="text-[9px] bg-white/5 border-white/15 text-muted-foreground h-4">
                                {ds}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── TAB 2: 데이터→분석 매핑 ── */}
        {activeTab === 'mapping' && (
          <motion.div
            key="mapping"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <p className="text-center text-[11px] text-muted-foreground mb-3">
              {t('각 데이터 소스가 리포트의 어떤 섹션에 반영되는지 확인하세요', 'See how each data source feeds into report sections')}
            </p>
            {DATA_SOURCES.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 rounded-xl border border-white/10 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">{item.name}</span>
                  <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
                </div>
                <div className="flex flex-wrap gap-1.5 pl-12">
                  {item.sections.map((secIdx) => (
                    <span key={secIdx} className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground font-medium">
                      → {REPORT_SECTIONS[secIdx].title}
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
