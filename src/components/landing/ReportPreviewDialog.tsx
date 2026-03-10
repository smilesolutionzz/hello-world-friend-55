import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Brain, Target, Heart, Lightbulb, Users, TrendingUp, 
  GraduationCap, MapPin, Map, X, ArrowRight, AlertTriangle, 
  ChevronDown, ChevronUp, Sparkles, Shield, BookOpen, BarChart3,
  Activity, Clock, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const radarData = [
  { area: '인지', score: 78, fullMark: 100 },
  { area: '언어', score: 52, fullMark: 100 },
  { area: '운동', score: 85, fullMark: 100 },
  { area: '사회성', score: 71, fullMark: 100 },
  { area: '정서', score: 66, fullMark: 100 },
];

const riskScore = 62;

const sectionData = [
  {
    icon: Brain, title: '핵심 발달 분석', color: 'amber',
    content: [
      '**언어 발달**: 또래 대비 약 6개월 지연 관찰. 표현 언어(MLU 2.1)보다 수용 언어 능력(Bayley-III 언어 영역 백분위 38%)이 상대적으로 양호합니다.',
      '**인지 발달**: 시각적 문제해결 과제에서 상위 15% 수준의 수행을 보이며, 패턴 인식 능력이 뛰어납니다 (K-CDI-2 인지 영역 백분위 82%).',
      '**운동 발달**: 대근육 발달은 연령 적합 수준이나, 소근육(연필 잡기, 가위질)에서 약간의 지연이 관찰됩니다.',
    ],
    references: ['Bayley-III (2025)', 'K-CDI-2 한국판', 'Piaget 인지발달이론'],
  },
  {
    icon: Target, title: '강점 & 잠재력', color: 'emerald',
    content: [
      '**시각적 학습 능력**: Gardner 다중지능 이론 기반 평가에서 공간 지능 상위 15%로 분류. 블록 쌓기, 퍼즐 활동에서 또래 대비 우수한 수행.',
      '**창의적 문제해결**: 비정형적 접근 방식을 선호하며, 개방형 과제에서 독창적 해결책을 제시하는 경향.',
      '**예술적 감수성**: 미술·음악 활동 시 집중 시간이 평균 12분으로 또래 평균(7분) 대비 약 70% 높음.',
    ],
    references: ['Gardner 다중지능이론 (2023)', 'Torrance 창의성 검사 기준'],
  },
  {
    icon: Heart, title: '정서적 특성', color: 'rose',
    content: [
      '**정서 조절**: Gottman 정서코칭 모델 적용 결과, 좌절 상황에서 감정 표현이 과격해지는 경향 (CBCL 공격성 T점수 62). 안정적 환경에서는 적절한 정서 표현 가능.',
      '**애착 유형**: Bowlby 애착이론 기반 관찰 시 안정 애착 경향성 관찰. 주 양육자와의 분리 불안은 연령 적합 수준.',
      '**자기 인식**: Erikson 발달단계 중 "주도성 vs 죄책감" 단계에서 주도성 발달이 양호한 편.',
    ],
    references: ['Gottman 정서코칭 모델', 'Bowlby 애착이론', 'CBCL 6/18'],
  },
  {
    icon: Lightbulb, title: '맞춤 개입 전략', color: 'blue',
    content: [
      '**1차 권장**: TEACCH 기반 시각적 스케줄 활용 — 일과 예측성 향상 및 전환 스트레스 감소 목적.',
      '**2차 권장**: Ayres 감각통합 이론(SI) 기반 활동 일 15분 — 촉각·고유수용감각 자극 중심 프로그램.',
      '**3차 권장**: Vygotsky ZPD 모델 기반 또래 소그룹 활동 주 1회 — 언어 자극 및 사회적 상호작용 촉진.',
      '**보조 개입**: 그림교환 의사소통(PECS) 1단계 도입 검토 — 표현 언어 지연 보완.',
    ],
    references: ['TEACCH (UNC, 2024)', 'Ayres SI 이론', 'Vygotsky 근접발달영역'],
  },
  {
    icon: Users, title: '가정 내 실천 가이드', color: 'violet',
    content: [
      '**아침 루틴**: 그림 카드 활용 순서 안내(PECS 기반) → 옷 입기·세수·식사 3단계 시각 카드 제작 권장.',
      '**놀이 시간**: 하루 20분 바닥 놀이(Floor Time) — Greenspan DIR/Floortime 모델 기반 상호작용 중심.',
      '**저녁 루틴**: 감정 일기 함께 작성 — 감정 카드(기쁨/슬픔/화남/무서움) 4종 활용, 하루 1회 감정 명명 연습.',
      '**수면 환경**: 취침 30분 전 감각 자극 최소화, 일관된 수면 루틴 유지 (백색 소음 활용 가능).',
    ],
    references: ['Greenspan DIR/Floortime 모델', 'PECS Phase I-II'],
  },
  {
    icon: TrendingUp, title: '발달 예측 & 경과', color: 'orange',
    content: [
      '**3개월 후 예상**: 시각적 스케줄 적응 완료, 일과 전환 시 울음 빈도 30% 감소 예상.',
      '**6개월 후 예상**: 언어치료 병행 시 표현 어휘 20% 증가 (현재 약 80단어 → 96단어), 2어 조합 빈도 증가.',
      '**12개월 후 예상**: 또래 상호작용 빈도 및 질적 수준 향상, 사회성 발달 지표 정상 범위 진입 기대.',
      '⚠️ *상기 예측은 권장 개입이 일관되게 적용될 경우를 기준으로 하며, 개인차가 있을 수 있습니다.*',
    ],
    references: ['Vygotsky ZPD 모델', '종단 발달 연구 메타분석 (2025)'],
  },
  {
    icon: GraduationCap, title: '학술적 근거 & 참고문헌', color: 'cyan',
    content: [
      '본 분석에 활용된 주요 진단 도구 및 이론적 기반:',
      '• **DSM-5-TR** (APA, 2022) — 신경발달장애 진단 기준 참조',
      '• **Bayley-III** — 영유아 발달 종합 평가 (인지·언어·운동)',
      '• **K-CDI-2** — 한국판 아동발달검사 표준화 자료',
      '• **CBCL 6/18** — 아동 행동평가 척도 (Achenbach System)',
      '• **Piaget 인지발달이론**, **Vygotsky 사회문화적 이론**, **Bowlby 애착이론**, **Erikson 심리사회적 발달단계**',
    ],
    references: [],
  },
  {
    icon: MapPin, title: '관련 기관 & 전문가 추천', color: 'indigo',
    content: [
      '📍 **언어치료센터** (3곳 매칭) — 거리순 정렬, 건강보험 적용 여부 표시',
      '📍 **감각통합치료실** (2곳 매칭) — 작업치료사 상주 시설 우선 추천',
      '📍 **발달심리 전문가** — AIHPRO 검증 전문가 3인 프로필 제공 (즉시 예약 가능)',
      '💡 *발달재활 바우처 대상 여부 확인을 위해 주소지 관할 주민센터 문의를 권장합니다.*',
    ],
    references: ['AIHPRO 전문가 DB', '건강보험심사평가원 데이터'],
  },
  {
    icon: Map, title: '장기 발달 로드맵', color: 'amber',
    content: [
      '🎯 **1단계 (1~3개월)**: 시각적 환경 구조화 + 감각통합 활동 시작 → 중간 체크포인트 설정',
      '🎯 **2단계 (4~6개월)**: 언어치료 본격 시작 + 또래 소그룹 참여 → K-CDI-2 재평가 권장',
      '🎯 **3단계 (7~12개월)**: 종합 재평가 + 개입 전략 조정 → Bayley-III 추적 검사',
      '📅 *재평가 일정이 자동 생성되며, 알림을 통해 적시 모니터링이 가능합니다.*',
    ],
    references: ['개별화 가족 서비스 계획(IFSP) 모델'],
  },
];

const colorClasses: Record<string, { bg: string; icon: string; border: string; accent: string }> = {
  amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600 bg-amber-100',     border: 'border-amber-200',   accent: 'text-amber-600' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600 bg-emerald-100', border: 'border-emerald-200', accent: 'text-emerald-600' },
  rose:    { bg: 'bg-rose-50',    icon: 'text-rose-600 bg-rose-100',       border: 'border-rose-200',    accent: 'text-rose-600' },
  blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600 bg-blue-100',       border: 'border-blue-200',    accent: 'text-blue-600' },
  violet:  { bg: 'bg-violet-50',  icon: 'text-violet-600 bg-violet-100',   border: 'border-violet-200',  accent: 'text-violet-600' },
  orange:  { bg: 'bg-orange-50',  icon: 'text-orange-600 bg-orange-100',   border: 'border-orange-200',  accent: 'text-orange-600' },
  cyan:    { bg: 'bg-cyan-50',    icon: 'text-cyan-600 bg-cyan-100',       border: 'border-cyan-200',    accent: 'text-cyan-600' },
  indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600 bg-indigo-100',   border: 'border-indigo-200',  accent: 'text-indigo-600' },
};

const ReportPreviewDialog: React.FC<Props> = ({ isOpen, onOpenChange }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-emerald-500';
    if (score <= 60) return 'text-amber-500';
    return 'text-orange-500';
  };

  const getRiskGradient = (score: number) => {
    if (score <= 30) return 'from-emerald-400 to-emerald-500';
    if (score <= 60) return 'from-amber-400 to-amber-500';
    return 'from-orange-400 to-red-500';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 30) return '정상 범위';
    if (score <= 60) return '관찰 필요';
    return '주의 관찰 필요';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] p-0 overflow-hidden bg-white border-0 shadow-2xl">
        {/* Premium Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 md:p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-[10px] font-bold text-amber-400 uppercase tracking-wider">Sample Report</div>
                <span className="text-[10px] text-white/30 font-mono">RPT-2026-0312-A7K9</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white">전문가급 발달 분석 리포트</h2>
              <p className="text-white/50 text-xs mt-1">2026년 3월 12일 생성 · Gemini 3 Flash + Perplexity 기반</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white/60 hover:text-white hover:bg-white/10 -mt-1">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(92vh-100px)]">
          <div className="p-5 md:p-8 space-y-6">
            
            {/* Overview Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Radar Chart */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-slate-600" />
                  <h3 className="font-bold text-slate-800 text-sm">5대 발달 영역 분석</h3>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="area" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="점수" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {radarData.map((d, i) => (
                    <span key={i} className={`text-xs px-2 py-1 rounded-full ${d.score >= 70 ? 'bg-emerald-100 text-emerald-700' : d.score >= 55 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {d.area} {d.score}%
                    </span>
                  ))}
                </div>
              </div>

              {/* Risk Gauge & Stats */}
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-slate-600" />
                    <h3 className="font-bold text-slate-800 text-sm">위험도 측정</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                        <motion.circle 
                          cx="40" cy="40" r="34" fill="none" 
                          stroke="url(#riskGradient)" strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={`${(riskScore / 100) * 213.6} 213.6`}
                          initial={{ strokeDasharray: '0 213.6' }}
                          animate={{ strokeDasharray: `${(riskScore / 100) * 213.6} 213.6` }}
                          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                        />
                        <defs>
                          <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#ef4444" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-xl font-bold ${getRiskColor(riskScore)}`}>{riskScore}</span>
                        <span className="text-[9px] text-slate-400">/100</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <AlertTriangle className={`w-4 h-4 ${getRiskColor(riskScore)}`} />
                        <span className={`font-bold text-sm ${getRiskColor(riskScore)}`}>{getRiskLabel(riskScore)}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">언어 영역 집중 개입 필요.<br />조기 개입 시 정상 범위 진입 가능성 높음.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
                    <Shield className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-slate-800">94.2%</p>
                    <p className="text-[10px] text-slate-400">AI 신뢰도</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
                    <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-slate-800">15+</p>
                    <p className="text-[10px] text-slate-400">학술 이론 기반</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200/60">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-800">📋 종합 요약</h3>
              </div>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <p><strong>주요 관찰:</strong> 또래 대비 언어 발달 지연 (약 6개월), 사회성 발달 정상 범위, 감각처리 민감성 관찰. Bayley-III 언어 영역 백분위 38%.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <p><strong>강점 영역:</strong> 시각적 학습 능력 상위 15% (K-CDI-2 기준), 창의적 문제해결, 미술·음악 활동 집중력 우수 (평균 대비 +70%).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <p><strong>권장 개입:</strong> 언어치료 주 2회, 감각통합 활동 일 15분, 시각적 스케줄 활용, 또래 소그룹 활동 주 1회. 발달재활 바우처 활용 권장.</p>
                </div>
              </div>
            </div>

            {/* Detailed 9 Sections */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-slate-600" />
                <h3 className="font-bold text-slate-800">📊 상세 분석 (9개 섹션)</h3>
              </div>
              <div className="space-y-3">
                {sectionData.map((section, index) => {
                  const colors = colorClasses[section.color] || colorClasses.amber;
                  const isExpanded = expandedSection === index;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`rounded-xl border ${colors.border} overflow-hidden shadow-sm`}
                    >
                      <button
                        onClick={() => setExpandedSection(isExpanded ? null : index)}
                        className={`w-full flex items-center justify-between p-4 ${colors.bg} hover:brightness-[0.97] transition-all`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${colors.icon}`}>
                            <section.icon className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <span className="font-semibold text-slate-800 text-sm">{section.title}</span>
                            {!isExpanded && (
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{section.content[0]?.replace(/\*\*/g, '')?.slice(0, 60)}...</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 hidden sm:inline">{section.content.length}개 항목</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 md:p-5 bg-white border-t border-slate-100 space-y-3">
                              {section.content.map((line, li) => (
                                <p key={li} className="text-sm text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{
                                  __html: line
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800">$1</strong>')
                                    .replace(/\*(.*?)\*/g, '<em class="text-slate-500">$1</em>')
                                }} />
                              ))}
                              {section.references.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <GraduationCap className="w-3 h-3 text-slate-400" />
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">학술적 근거</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {section.references.map((ref, ri) => (
                                      <span key={ri} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{ref}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Watermark Notice */}
            <div className="text-center py-3">
              <p className="text-xs text-slate-300 italic">— SAMPLE REPORT · AIHPRO —</p>
              <p className="text-[10px] text-slate-400 mt-1">* 실제 리포트는 입력된 데이터 기반으로 개인화되어 생성됩니다</p>
            </div>

            {/* Sticky CTA */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm pt-4 pb-3 border-t border-slate-200 -mx-5 md:-mx-8 px-5 md:px-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => { onOpenChange(false); navigate('/report-generator'); }}
                  className="flex-1 py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-base rounded-xl shadow-lg shadow-amber-500/25"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  지금 바로 내 리포트 받기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="py-6 rounded-xl"
                >
                  닫기
                </Button>
              </div>
              <p className="text-center text-xs text-slate-400 mt-2">3분이면 완성 · 무료 체험 가능</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreviewDialog;
