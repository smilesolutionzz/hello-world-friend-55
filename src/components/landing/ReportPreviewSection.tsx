import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Brain, Target, Heart, Lightbulb, Users, TrendingUp, Shield, BookOpen, ArrowRight, Sparkles, CheckCircle2, Download, Share2, Mail, X, Eye, ChevronDown, ChevronUp, GraduationCap, MessageCircle, AlertTriangle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const ReportPreviewSection = () => {
  const navigate = useNavigate();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const reportSections = [
    { icon: Brain, title: '핵심 발달 분석', preview: '언어 발달: 또래 대비 약 6개월 지연 관찰됨. 표현 언어보다 수용 언어 능력이...' },
    { icon: Target, title: '강점 & 잠재력', preview: '시각적 학습 능력 우수, 창의적 문제해결에서 뛰어난 접근 방식 보임...' },
    { icon: Heart, title: '정서적 특성', preview: '정서 조절: 좌절 상황에서 감정 표현이 과격해지는 경향. 안정적 환경에서는...' },
    { icon: Lightbulb, title: '맞춤 개입 전략', preview: '1) 시각적 스케줄 활용 권장 2) 감각 통합 활동 일 15분 권장...' },
    { icon: Users, title: '가정 내 실천 가이드', preview: '아침 루틴: 그림 카드 활용한 순서 안내. 저녁 루틴: 감정 일기 함께 작성...' },
    { icon: TrendingUp, title: '발달 예측 & 경과', preview: '현재 개입 시 6개월 후 예상: 언어 표현력 20% 향상, 또래 상호작용...' },
  ];

  const fullReportSections = [
    { 
      icon: Brain, 
      title: '핵심 발달 분석', 
      color: 'amber',
      content: `
### 언어 발달
- **표현 언어**: 또래 대비 약 6개월 지연 관찰됨
- **수용 언어**: 정상 범위 내 (백분위 45)
- **어휘력**: 사용 어휘 약 200단어, 또래 평균 350단어 대비 부족

### 인지 발달  
- **문제해결**: 시각적 퍼즐에서 우수한 능력 발휘
- **기억력**: 단기 기억 정상, 작업 기억 약간 낮음
- **주의집중**: 관심 분야 20분 이상 집중 가능

### 운동 발달
- **대근육**: 정상 범위 (달리기, 점프, 균형)
- **소근육**: 또래 대비 약간 느림 (가위질, 그리기)
      `
    },
    { 
      icon: Target, 
      title: '강점 & 잠재력', 
      color: 'emerald',
      content: `
### 핵심 강점
1. **시각적 학습 능력** - 그림, 도표를 통한 학습에서 빠른 이해력
2. **창의적 문제해결** - 독창적인 방식으로 과제 접근
3. **예술적 감각** - 색채 활용과 구성력 우수

### 잠재력 영역
- 미술/디자인 분야 적성
- 공간 지각 능력 활용 직종 (건축, 게임 디자인 등)
- 비언어적 창작 활동

### 발전 가능성
> "적절한 지원과 함께라면 6개월 내 언어 표현력 30% 향상 예상"
      `
    },
    { 
      icon: Heart, 
      title: '정서적 특성', 
      color: 'rose',
      content: `
### 정서 조절
- **좌절 상황**: 감정 표현이 과격해지는 경향
- **안정 환경**: 차분하고 협조적인 태도 유지
- **전환 시간**: 감정 회복에 평균 5-10분 소요

### 애착 유형
안정 애착 패턴 관찰. 주 양육자와의 관계 양호.

### 사회성
- 1:1 상호작용 선호
- 새로운 환경에서 적응 시간 필요 (약 15-20분)
- 친숙한 또래와는 적극적 놀이 참여
      `
    },
    { 
      icon: Lightbulb, 
      title: '맞춤 개입 전략', 
      color: 'blue',
      content: `
### 즉시 실행 권장
1. **시각적 스케줄 활용** - 하루 일과를 그림으로 제시
2. **감각 통합 활동** - 매일 15분 촉각/고유감각 자극
3. **언어 확장 기법** - 아이의 말에 1-2단어 추가하여 반복

### 전문가 개입
| 치료 유형 | 권장 빈도 | 우선순위 |
|----------|----------|---------|
| 언어치료 | 주 2회 | ⭐⭐⭐ |
| 놀이치료 | 주 1회 | ⭐⭐ |
| 감각통합 | 주 1회 | ⭐ |

### 환경 조정
- 자극이 적은 학습 공간 조성
- 일관된 일과 루틴 유지
- 충분한 전환 시간 제공
      `
    },
    { 
      icon: Users, 
      title: '가정 내 실천 가이드', 
      color: 'violet',
      content: `
### 아침 루틴 (7:00-8:30)
1. 그림 카드로 순서 안내 (기상→세면→옷 입기)
2. 아침 식사 중 3가지 질문 대화
3. 등원 준비물 함께 확인

### 저녁 루틴 (18:00-20:00)  
1. 감정 일기 함께 작성 (오늘의 기분 그리기)
2. 15분 1:1 놀이 시간 (아이 주도)
3. 수면 의식 (책 읽기→자장가)

### 주말 활동 추천
- 미술관/박물관 방문 (시각 자극)
- 자연 탐색 활동 (감각 통합)
- 가족 게임 시간 (사회성)
      `
    },
    { 
      icon: TrendingUp, 
      title: '발달 예측 & 경과', 
      color: 'orange',
      content: `
### 6개월 후 예상 (권장 개입 시)
- 언어 표현력: **20-30% 향상**
- 또래 상호작용: **소그룹 참여 가능**
- 정서 조절: **회복 시간 50% 단축**

### 1년 후 목표
- 또래 수준 언어 발달 달성
- 유치원/학교 적응 준비 완료
- 자기 표현 능력 향상

### 추적 관찰 일정
| 시점 | 평가 항목 |
|-----|---------|
| 3개월 | 언어 발달 재평가 |
| 6개월 | 종합 발달 검사 |
| 12개월 | 학교 준비도 평가 |

### 주의사항
⚠️ 진전이 없거나 퇴보 시 즉시 전문가 상담 권장
      `
    },
    { 
      icon: GraduationCap, 
      title: '교육 환경 권장사항', 
      color: 'cyan',
      content: `
### 학급 환경
- 소규모 학급 권장 (15명 이하)
- 시각적 교육 자료 활용 교사 선호
- 개별화 교육 프로그램(IEP) 검토

### 학습 지원
- 시각적 보조 도구 활용
- 명확하고 간단한 지시어
- 충분한 처리 시간 제공

### 전환 준비
초등학교 입학 6개월 전:
1. 학교 방문 및 환경 익히기
2. 담임 교사와 사전 상담
3. 또래 친구 미리 만나기
      `
    },
    { 
      icon: MessageCircle, 
      title: '전문가 소견', 
      color: 'indigo',
      content: `
### AI 종합 분석 결과

본 아동은 **시각적 학습 능력과 창의성**에서 뚜렷한 강점을 보이며, 언어 발달 지연은 **조기 개입으로 충분히 개선 가능한 수준**입니다.

> "강점 중심 접근을 통해 자신감을 키우면서 동시에 언어 영역을 지원하는 것이 가장 효과적인 전략입니다."

### 핵심 권고사항
1. **언어치료 즉시 시작** (우선순위 1)
2. **강점 영역 활용** 언어 촉진 (미술 활동 중 대화)
3. **가정-치료사-교사 협력** 체계 구축

### 참고 문헌
- American Academy of Pediatrics (2024)
- 한국아동발달연구원 가이드라인
- 최신 발달심리학 연구 자료
      `
    },
    { 
      icon: AlertTriangle, 
      title: '주의사항 & 면책조항', 
      color: 'amber',
      content: `
### 중요 안내

⚠️ **본 리포트는 AI 분석 결과이며, 의료적 진단을 대체하지 않습니다.**

### 권장 사항
- 반드시 전문가(소아정신과, 발달심리사)와 상담하세요
- 정확한 진단을 위해 대면 평가를 받으시기 바랍니다
- 치료 결정은 전문가와 함께 하세요

### 데이터 기반
본 분석은 다음 데이터를 기반으로 합니다:
- 입력된 관찰 기록 (3건)
- 발달 검사 결과 (2건)
- 최신 연구 자료 및 가이드라인

### 재생성
언제든 새로운 데이터 추가 후 리포트를 재생성할 수 있습니다.
      `
    },
  ];

  const features = [
    { icon: Download, text: 'PDF/TXT 다운로드' },
    { icon: Share2, text: '카카오톡 공유' },
    { icon: Mail, text: '가족 이메일 전송' },
  ];

  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600 bg-amber-100', border: 'border-amber-200' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600 bg-emerald-100', border: 'border-emerald-200' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600 bg-rose-100', border: 'border-rose-200' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600 bg-blue-100', border: 'border-blue-200' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600 bg-violet-100', border: 'border-violet-200' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600 bg-orange-100', border: 'border-orange-200' },
    cyan: { bg: 'bg-cyan-50', icon: 'text-cyan-600 bg-cyan-100', border: 'border-cyan-200' },
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600 bg-indigo-100', border: 'border-indigo-200' },
  };

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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-bold mb-4">
            <Sparkles className="w-4 h-4" />
            전문가급 AI 분석
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
            9가지 심층 분석 리포트
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto">
            최신 연구 기반 AI가 생성하는 전문가 수준의 맞춤형 분석
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
                <p className="text-white/50 text-xs mb-1">2026년 1월 생성</p>
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

            {/* Preview Button */}
            <Button
              onClick={() => setIsPreviewOpen(true)}
              variant="outline"
              className="w-full py-5 border-amber-300 text-amber-700 hover:bg-amber-100 font-semibold"
            >
              <Eye className="w-5 h-5 mr-2" />
              전체 리포트 미리보기
            </Button>

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

        {/* Features & Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto mt-10"
        >
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur border border-white/10 rounded-full"
              >
                <feature.icon className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-slate-200">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {[
              '최신 연구 기반 분석',
              'Perplexity AI 학술 검색',
              '관련 기관 정보 수집',
              '검증된 전문가 연결',
              '무제한 재생성',
              '가족 공유 지원',
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-xs md:text-sm text-slate-300">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              onClick={() => navigate('/report-generator')}
              className="px-8 py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/25"
            >
              나만의 리포트 생성하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Full Report Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-500 to-orange-500 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-5 h-5" />
                  <span className="text-xs opacity-80">샘플 리포트</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold">전문가급 발달 분석 리포트</h2>
                <p className="text-xs md:text-sm opacity-80 mt-1">김○○ | 만 4세 3개월 | 남아</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPreviewOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(90vh-120px)]">
            <div className="p-4 md:p-6 space-y-4">
              {/* Report Info */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-amber-800">리포트 정보</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">생성일</p>
                    <p className="font-medium text-slate-700">2026년 1월 15일</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">검사 데이터</p>
                    <p className="font-medium text-slate-700">3건</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">관찰 기록</p>
                    <p className="font-medium text-slate-700">5건</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">AI 신뢰도</p>
                    <p className="font-medium text-emerald-600">92%</p>
                  </div>
                </div>
              </div>

              {/* Report Sections */}
              <div className="space-y-3">
                {fullReportSections.map((section, index) => {
                  const colors = colorClasses[section.color] || colorClasses.amber;
                  const isExpanded = expandedSection === index;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`rounded-xl border ${colors.border} overflow-hidden`}
                    >
                      <button
                        onClick={() => setExpandedSection(isExpanded ? null : index)}
                        className={`w-full flex items-center justify-between p-4 ${colors.bg} hover:brightness-95 transition-all`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${colors.icon}`}>
                            <section.icon className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-slate-800">{section.title}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-500" />
                        )}
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
                            <div className="p-4 bg-white border-t border-slate-100">
                              <div className="prose prose-sm max-w-none text-slate-600">
                                {section.content.split('\n').map((line, i) => {
                                  if (line.startsWith('###')) {
                                    return <h4 key={i} className="text-sm font-bold text-slate-800 mt-4 mb-2 first:mt-0">{line.replace('###', '').trim()}</h4>;
                                  } else if (line.startsWith('>')) {
                                    return <blockquote key={i} className="border-l-4 border-amber-400 pl-3 my-3 text-amber-800 bg-amber-50 py-2 rounded-r-lg text-sm italic">{line.replace('>', '').trim()}</blockquote>;
                                  } else if (line.startsWith('|')) {
                                    return null; // Skip table lines for simple rendering
                                  } else if (line.startsWith('-') || line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
                                    return <p key={i} className="text-sm ml-2 my-1">{line}</p>;
                                  } else if (line.startsWith('⚠️')) {
                                    return <p key={i} className="text-sm bg-red-50 text-red-700 p-3 rounded-lg my-2 font-medium">{line}</p>;
                                  } else if (line.trim()) {
                                    return <p key={i} className="text-sm my-1">{line}</p>;
                                  }
                                  return null;
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => {
                      setIsPreviewOpen(false);
                      navigate('/report-generator');
                    }}
                    className="flex-1 py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold"
                  >
                    나만의 리포트 생성하기
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsPreviewOpen(false)}
                    className="py-5"
                  >
                    닫기
                  </Button>
                </div>
                <p className="text-center text-xs text-slate-400 mt-3">
                  * 본 리포트는 샘플이며, 실제 리포트는 입력 데이터 기반으로 생성됩니다
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ReportPreviewSection;
