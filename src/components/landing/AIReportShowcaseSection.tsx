import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Heart, 
  Target, 
  TrendingUp, 
  Users, 
  FileText, 
  Lightbulb, 
  Shield,
  Sparkles,
  AlertCircle,
  BarChart3,
  Activity,
  BookOpen,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

const reportSections = [
  { icon: Brain, title: "종합 진단 요약", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Activity, title: "심층 분석 결과", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: BookOpen, title: "최신 논문 기반 인사이트", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: Target, title: "맞춤형 개입 전략", color: "text-orange-500", bg: "bg-orange-500/10" },
  { icon: TrendingUp, title: "단계별 발달 로드맵", color: "text-green-500", bg: "bg-green-500/10" },
  { icon: Heart, title: "가정 내 실천 가이드", color: "text-pink-500", bg: "bg-pink-500/10" },
  { icon: Shield, title: "전문가 상담 필요성 평가", color: "text-red-500", bg: "bg-red-500/10" },
  { icon: BarChart3, title: "예후 및 발달 예측", color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { icon: Lightbulb, title: "추천 자료 및 리소스", color: "text-amber-500", bg: "bg-amber-500/10" },
];

const sampleRadarData = [
  { label: "인지", value: 82 },
  { label: "언어", value: 74 },
  { label: "운동", value: 91 },
  { label: "사회성", value: 68 },
  { label: "정서", value: 79 },
];

export const AIReportShowcaseSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-full">
              2026년 3월 최신 AI 분석 엔진
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
          >
            전문가급 AI 분석
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              9가지 심층 분석 리포트
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            최신 연구 기반 AI가 생성하는 전문가 수준의 맞춤형 분석
            <br className="hidden md:block" />
            실제 리포트 샘플을 확인해보세요
          </motion.p>
        </div>

        {/* Report Sample Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Report Document */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden border border-slate-200/20">
            
            {/* Report Header Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">AIHPRO 종합 발달 분석 리포트</h3>
                  <p className="text-blue-300/70 text-xs">Report ID: RPT-2026-0309-A1 · 생성일: 2026.03.09</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">AI 검증 완료</Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">논문 12편 참조</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              {/* Left: Report Content Preview */}
              <div className="lg:col-span-2 p-6 md:p-8 border-r border-slate-100">
                
                {/* Patient Info Bar */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    김
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">김○○ (만 4세 7개월)</p>
                    <p className="text-xs text-slate-500">검사 유형: 종합 발달 심리 평가 · K-CDI, Bayley-III, CBCL 기반</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-xs font-medium text-amber-600">주의 관찰 필요</span>
                    </div>
                  </div>
                </div>

                {/* Section 1: Executive Summary */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-purple-500/10">
                      <Brain className="w-4 h-4 text-purple-500" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">1. 종합 진단 요약</h4>
                    <Badge variant="outline" className="text-[10px] ml-auto border-slate-200 text-slate-400">Executive Summary</Badge>
                  </div>
                  <div className="pl-8 space-y-2">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      김○○ 아동은 전반적 발달 수준에서 <span className="font-semibold text-blue-600">인지(82점)</span>와 <span className="font-semibold text-green-600">대근육 운동(91점)</span> 영역에서 또래 대비 
                      우수한 발달을 보이고 있으나, <span className="font-semibold text-orange-600">사회성(68점)</span> 영역에서 또래 평균 하위 15%ile에 해당하는 
                      지연 경향이 관찰됩니다. Piaget의 전조작기 발달 이론에 따르면...
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Vygotsky의 근접발달영역(ZPD) 관점에서 현재 사회적 상호작용 능력은 성인 또는 유능한 
                      또래의 스캐폴딩을 통해 유의미한 향상이 기대되며, Erikson의 주도성 대 죄책감 단계에서...
                    </p>
                  </div>
                </div>

                {/* Section 2: Deep Analysis with mini chart */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                      <Activity className="w-4 h-4 text-blue-500" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">2. 심층 분석 결과</h4>
                    <Badge variant="outline" className="text-[10px] ml-auto border-slate-200 text-slate-400">Deep Analysis</Badge>
                  </div>
                  <div className="pl-8">
                    {/* Mini bar chart */}
                    <div className="grid grid-cols-5 gap-3 mb-3">
                      {sampleRadarData.map((item) => (
                        <div key={item.label} className="text-center">
                          <div className="h-20 bg-slate-100 rounded-lg relative overflow-hidden mb-1">
                            <motion.div
                              initial={{ height: 0 }}
                              whileInView={{ height: `${item.value}%` }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.5, duration: 0.8 }}
                              className={`absolute bottom-0 left-0 right-0 rounded-lg ${
                                item.value >= 80 ? 'bg-gradient-to-t from-emerald-500 to-emerald-400' :
                                item.value >= 70 ? 'bg-gradient-to-t from-blue-500 to-blue-400' :
                                'bg-gradient-to-t from-orange-500 to-amber-400'
                              }`}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">{item.value}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">{item.label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      DSM-5 진단 기준 및 Bayley-III 발달 척도에 근거하여 5개 발달 영역을 분석한 결과, 
                      사회성 영역에서 <span className="text-red-500 font-medium">또래 평균 대비 -1.2 SD</span>의 차이가 확인되었습니다...
                    </p>
                  </div>
                </div>

                {/* Blurred remaining sections */}
                <div className="relative">
                  <div className="space-y-4 blur-[2px] opacity-60 select-none">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10">
                        <BookOpen className="w-4 h-4 text-emerald-500" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">3. 최신 논문 기반 인사이트</h4>
                    </div>
                    <div className="pl-8 space-y-1">
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-3 bg-slate-200 rounded w-5/6" />
                      <div className="h-3 bg-slate-200 rounded w-4/6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-orange-500/10">
                        <Target className="w-4 h-4 text-orange-500" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">4. 맞춤형 개입 전략</h4>
                    </div>
                    <div className="pl-8 space-y-1">
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg border border-slate-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-semibold text-slate-700">+ 7개 섹션 더 보기</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar: TOC + Stats */}
              <div className="p-6 bg-slate-50/80">
                {/* Risk Meter */}
                <div className="mb-6">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">위험도 평가</h5>
                  <div className="relative h-4 bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ left: '0%' }}
                      whileInView={{ left: '38%' }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8, duration: 1 }}
                      className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-slate-800"
                      style={{ left: '38%' }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-emerald-600">정상</span>
                    <span className="text-[10px] text-amber-600 font-semibold">주의 관찰</span>
                    <span className="text-[10px] text-red-600">위험</span>
                  </div>
                </div>

                {/* Report TOC */}
                <div className="mb-6">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">리포트 구성</h5>
                  <div className="space-y-1.5">
                    {reportSections.map((section, index) => {
                      const Icon = section.icon;
                      return (
                        <div
                          key={index}
                          className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                            index < 2 ? 'bg-white shadow-sm border border-slate-100' : 'hover:bg-white/50'
                          }`}
                        >
                          <div className={`p-1 rounded ${section.bg}`}>
                            <Icon className={`w-3 h-3 ${section.color}`} />
                          </div>
                          <span className={`text-xs ${index < 2 ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                            {index + 1}. {section.title}
                          </span>
                          {index < 2 && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* References */}
                <div className="mb-6">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">참조 논문</h5>
                  <div className="space-y-2">
                    {[
                      "Piaget, J. (1952). The Origins of Intelligence",
                      "Vygotsky, L. (1978). Mind in Society",
                      "Bowlby, J. (1969). Attachment and Loss",
                    ].map((ref, i) => (
                      <p key={i} className="text-[10px] text-slate-400 leading-relaxed truncate">
                        [{i + 1}] {ref}
                      </p>
                    ))}
                    <p className="text-[10px] text-blue-500 font-medium">+ 9편 더 보기</p>
                  </div>
                </div>

                {/* AI Confidence */}
                <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-xs font-bold text-slate-700">AI 분석 신뢰도</span>
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-2xl font-black text-slate-900">94.7</span>
                    <span className="text-xs text-slate-500 mb-1">/ 100</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '94.7%' }}
                      viewport={{ once: true }}
                      transition={{ delay: 1, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <p className="text-[10px] text-slate-400">
                본 리포트는 AI 기반 분석 시스템에 의해 생성되었으며, 전문 의료 진단을 대체하지 않습니다. 심각한 우려 시 전문가 상담을 권장합니다.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <button className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 inline-flex items-center gap-2">
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            무료로 내 아이 리포트 받아보기
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
