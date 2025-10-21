import { Card } from "@/components/ui/card";
import { 
  Brain, 
  Heart, 
  Target, 
  TrendingUp, 
  Users, 
  FileText, 
  Lightbulb, 
  Shield,
  Sparkles
} from "lucide-react";

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

export const AIReportShowcaseSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full">
              AI 자동 분석 시스템
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">단 한 번의 분석으로</span>
            <br />
            <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              9가지 전문 리포트 자동 생성
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            최신 AI 기술을 활용하여 아이디어 검증에 필요한 모든 자료를
            <br className="hidden md:block" />
            단 몇 분 만에 받아보세요
          </p>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {reports.map((report, index) => {
            const Icon = report.icon;
            return (
              <Card 
                key={index}
                className={`group relative p-6 bg-gradient-to-br ${report.color} border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer`}
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

        {/* CTA Button */}
        <div className="text-center">
          <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center gap-2">
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            추가 비용 없이 모든 리포트 무료 제공
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
