import { Brain, Users, Shield, Zap, Award, Building } from "lucide-react";

const PlatformOverview = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Platform Introduction */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="text-brand-gradient">AIHPRO</span>와 함께하는
            <br />정신건강 케어의 새로운 패러다임
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-[1.6] text-center">
            데이터와 AI 상담을 기반으로, 개인·기업·의료기관이 함께 만드는
            <br />차세대 통합 정신건강 플랫폼
          </p>
        </div>

        {/* Core Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center group">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI 기반 정밀 분석</h3>
            <p className="text-muted-foreground max-w-sm mx-auto leading-[1.6] text-center">
              최신 AI 기술로 우울증, 불안장애 등을 정확하게 분석하고 개인 맞춤형 솔루션을 제공합니다
            </p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">안전한 데이터 관리</h3>
            <p className="text-muted-foreground max-w-sm mx-auto leading-[1.6] text-center">
              의료진급 보안으로 개인정보를 보호하며, 투명한 데이터 활용으로 신뢰를 구축합니다
            </p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">즉시 상담 연결</h3>
            <p className="text-muted-foreground max-w-sm mx-auto leading-[1.6] text-center">
              24시간 AI 상담부터 전문 상담사 매칭까지, 필요한 순간 바로 도움을 받을 수 있습니다
            </p>
          </div>
        </div>

        {/* Target Audiences */}
        <div className="bg-card rounded-3xl p-8 shadow-lg border">
          <h3 className="text-2xl font-bold text-center mb-8">누구나 함께할 수 있는 플랫폼</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* 개인 사용자 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <h4 className="text-lg font-semibold">개인 사용자</h4>
              </div>
              <ul className="space-y-2 text-muted-foreground ml-9">
                <li>• 무료 기본 상담으로 부담 없이 시작</li>
                <li>• 정확한 심리 상태 진단과 맞춤 케어</li>
                <li>• 가족 단위 종합 정신건강 관리</li>
                <li>• 24시간 언제든 접근 가능한 AI 상담</li>
              </ul>
            </div>

            {/* 기업 및 기관 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="w-6 h-6 text-primary" />
                <h4 className="text-lg font-semibold">기업 · 의료기관</h4>
              </div>
              <ul className="space-y-2 text-muted-foreground ml-9">
                <li>• 직원 정신건강 관리 솔루션 제공</li>
                <li>• 병원 환자 케어 시스템 통합 연동</li>
                <li>• 발달/상담센터·복지관·학교 연계 서비스</li>
                <li>• 데이터 기반 조직 건강도 분석</li>
                <li>• 전문 상담사 네트워크 구축 지원</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformOverview;