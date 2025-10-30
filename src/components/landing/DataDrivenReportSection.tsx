import { useState } from 'react';
import { 
  ClipboardCheck, 
  Brain, 
  UserCheck, 
  FileText, 
  ArrowRight,
  ChevronDown,
  Heart, 
  Target, 
  TrendingUp, 
  Users, 
  Lightbulb, 
  Shield,
  Sparkles,
  Database,
  Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import dataReportBg from '@/assets/data-report-bg.jpg';

const DataDrivenReportSection = () => {
  const navigate = useNavigate();
  const [showReports, setShowReports] = useState(false);

  const steps = [
    {
      number: "01",
      icon: ClipboardCheck,
      title: "자가진단 & 일상 기록",
      description: "간단한 질문과 일상 속 순간들을 기록합니다"
    },
    {
      number: "02",
      icon: Database,
      title: "데이터 축적",
      description: "여러분의 기록이 쌓여 의미 있는 패턴을 만듭니다",
      highlight: true
    },
    {
      number: "03",
      icon: Brain,
      title: "AI 종합 분석",
      description: "딥러닝 AI가 데이터를 분석하고 9가지 리포트를 자동 생성합니다",
      highlight: true
    },
    {
      number: "04",
      icon: UserCheck,
      title: "전문가 검토",
      description: "전문가가 리포트를 검토하여 정확한 회복과 예방을 돕습니다"
    }
  ];

  const reports = [
    {
      icon: Brain,
      title: "발달 종합 평가",
      description: "인지, 언어, 운동, 사회성 등 전 영역 발달 상태 분석",
      color: "from-purple-500/20 to-purple-600/10",
      iconColor: "text-purple-500"
    },
    {
      icon: Heart,
      title: "심리 상태 분석",
      description: "정서적 안정성, 스트레스 수준, 심리적 건강도 평가",
      color: "from-pink-500/20 to-pink-600/10",
      iconColor: "text-pink-500"
    },
    {
      icon: Target,
      title: "강점/약점 분석",
      description: "개인별 특성 파악으로 맞춤형 성장 방향 제시",
      color: "from-blue-500/20 to-blue-600/10",
      iconColor: "text-blue-500"
    },
    {
      icon: Lightbulb,
      title: "맞춤형 활동 제안",
      description: "AI 기반 개인별 발달 촉진 활동 및 놀이 추천",
      color: "from-yellow-500/20 to-yellow-600/10",
      iconColor: "text-yellow-500"
    },
    {
      icon: TrendingUp,
      title: "발달 로드맵",
      description: "단계별 성장 계획과 목표 설정 가이드",
      color: "from-green-500/20 to-green-600/10",
      iconColor: "text-green-500"
    },
    {
      icon: Users,
      title: "또래 비교 분석",
      description: "연령대별 발달 기준 비교 및 상대적 위치 파악",
      color: "from-orange-500/20 to-orange-600/10",
      iconColor: "text-orange-500"
    },
    {
      icon: Shield,
      title: "전문가 소견서",
      description: "전문 개입 필요성 평가 및 추천 사항 제공",
      color: "from-red-500/20 to-red-600/10",
      iconColor: "text-red-500"
    },
    {
      icon: FileText,
      title: "가족 지원 가이드",
      description: "부모/보호자를 위한 실천 가능한 양육 팁",
      color: "from-indigo-500/20 to-indigo-600/10",
      iconColor: "text-indigo-500"
    },
    {
      icon: Sparkles,
      title: "장기 발달 예측",
      description: "AI 기반 향후 발달 경향성 및 잠재력 분석",
      color: "from-cyan-500/20 to-cyan-600/10",
      iconColor: "text-cyan-500"
    }
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${dataReportBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-primary/20" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* 섹션 헤더 */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold rounded-full">
              <Zap className="w-3 h-3 inline mr-1" />
              데이터 기반 초개인화
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-6">
            데이터가 쌓이면, <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">초개인화된 종합 리포트가 자동 생성됩니다</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            일상 속 작은 기록들이 모여 여러분만의 성장 스토리가 됩니다
          </p>
        </div>

        {/* 4단계 프로세스 - 아코디언 형태 */}
        <div className="max-w-4xl mx-auto mb-16">
          <div 
            className="cursor-pointer mb-8 text-center"
            onClick={() => setShowReports(!showReports)}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-card border-2 border-primary/20 rounded-full hover:border-primary/40 transition-all">
              <span className="text-lg font-semibold text-foreground">어떻게 작동하나요?</span>
              <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-300 ${showReports ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* Desktop: Horizontal Timeline */}
          <div className="hidden md:block mb-12">
            <div className="relative">
              {/* Connection Line */}
              <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
              
              <div className="grid grid-cols-4 gap-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="relative text-center">
                      {/* Step Circle */}
                      <div className={`relative z-10 w-32 h-32 mx-auto ${step.highlight ? 'bg-gradient-to-br from-primary to-secondary' : 'bg-card'} border-4 ${step.highlight ? 'border-primary' : 'border-primary/30'} rounded-full flex items-center justify-center mb-6 shadow-xl`}>
                        <Icon className={`w-12 h-12 ${step.highlight ? 'text-primary-foreground' : 'text-primary'}`} />
                      </div>
                      
                      {/* Arrow (except last) */}
                      {index < steps.length - 1 && (
                        <ArrowRight className="hidden xl:block absolute top-14 -right-2 w-8 h-8 text-primary/40" />
                      )}
                      
                      <div className="space-y-3">
                        <div className={`text-4xl font-bold ${step.highlight ? 'text-primary' : 'text-primary/20'}`}>
                          {step.number}
                        </div>
                        <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed px-2">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile: Vertical Timeline */}
          <div className="md:hidden space-y-6 mb-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative flex gap-4">
                  {/* Vertical Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-primary/20" />
                  )}
                  
                  {/* Step Circle */}
                  <div className={`relative z-10 flex-shrink-0 w-16 h-16 ${step.highlight ? 'bg-gradient-to-br from-primary to-secondary' : 'bg-card'} border-4 ${step.highlight ? 'border-primary' : 'border-primary/30'} rounded-full flex items-center justify-center shadow-lg`}>
                    <Icon className={`w-7 h-7 ${step.highlight ? 'text-primary-foreground' : 'text-primary'}`} />
                  </div>
                  
                  <div className="flex-1 pt-2">
                    <div className={`text-2xl font-bold ${step.highlight ? 'text-primary' : 'text-primary/20'} mb-2`}>
                      {step.number}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 9가지 리포트 - 아코디언 */}
        {showReports && (
          <div className="animate-in slide-in-from-top-4 duration-500">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-foreground">단 한 번의 분석으로</span>
                <br />
                <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  9가지 전문 리포트 자동 생성
                </span>
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                전문가 검토를 거쳐 정확한 회복과 예방을 돕습니다
              </p>
            </div>

            {/* Report Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {reports.map((report, index) => {
                const Icon = report.icon;
                return (
                  <Card 
                    key={index}
                    className={`group relative p-6 bg-gradient-to-br ${report.color} border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-105`}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${report.iconColor}`} />
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2 text-foreground">
                        {report.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex flex-col items-center gap-4 px-8 py-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-3xl">
            <Sparkles className="w-8 h-8 text-primary" />
            <p className="text-sm sm:text-lg md:text-xl font-semibold text-foreground">
              추가 비용 없이 모든 리포트 무료 제공
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              데이터가 쌓일수록 더 정확한 분석을 받으실 수 있습니다
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate('/assessment')}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Brain className="w-5 h-5 mr-2" />
              3분 자가진단 시작
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/sample-report')}
              className="border-primary/30 hover:bg-primary/5"
            >
              <FileText className="w-5 h-5 mr-2" />
              종합 리포트 보기
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataDrivenReportSection;
