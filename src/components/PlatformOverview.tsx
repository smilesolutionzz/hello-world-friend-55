import { Brain, Users, Shield, Zap, Award, Building } from "lucide-react";

const PlatformOverview = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Platform Introduction */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="text-brand-gradient">AIHPRO</span>와 함께하는
            <br />통합건강 케어의 새로운 패러다임
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-[1.6] text-center">
            데이터와 AIH 상담을 기반으로, 개인·기업·의료기관이 함께 만드는
            <br />차세대 통합건강 플랫폼
          </p>
        </div>

        {/* Core Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          <div className="text-center group">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">AIH 기반 정밀 분석</h3>
            <p className="text-muted-foreground max-w-sm mx-auto leading-[1.6] text-center">
              최신 AIH 기술로 우울증, 불안장애 등을 정확하게 분석하고 개인 맞춤형 솔루션을 제공합니다
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
              24시간 AIH 상담부터 전문 상담사 매칭까지, 필요한 순간 바로 도움을 받을 수 있습니다
            </p>
          </div>
        </div>

        {/* Target Audiences */}
        <div className="bg-card rounded-3xl p-6 md:p-8 shadow-lg border">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-10 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            누구나 함께할 수 있는 플랫폼
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {/* 개인 사용자 */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/10 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-xl font-bold text-foreground">개인 사용자</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed">무료 기본 상담으로 부담 없이 시작</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed">정확한 심리 상태 분석과 맞춤 케어</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed">가족 단위 종합 통합건강 관리</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed">24시간 언제든 접근 가능한 AIH 상담</span>
                </li>
              </ul>
            </div>

            {/* 기업 및 의료기관 */}
            <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl p-6 border border-accent/10 hover:border-accent/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                  <Building className="w-5 h-5 text-accent-foreground" />
                </div>
                <h4 className="text-xl font-bold text-foreground">기업 · 의료기관</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed">직원 통합건강 관리 솔루션 제공</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed">병원 환자 케어 시스템 통합 연동</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed">데이터 기반 조직 건강도 분석</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed">전문 상담사 네트워크 구축 지원</span>
                </li>
              </ul>
            </div>

            {/* 발달/상담센터 · 복지관 · 유치원 */}
            <div className="bg-gradient-to-br from-secondary/30 to-secondary/50 rounded-2xl p-6 border border-secondary/30 hover:border-secondary/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-secondary/80 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-secondary-foreground" />
                </div>
                <h4 className="text-lg font-bold text-foreground leading-tight">발달/상담센터 · 복지관 · 유치원</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed">아동 발달 단계별 맞춤 검사 도구</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed">전문 치료사 연계 시스템 구축</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed">부모-아동 상호작용 분석 리포트</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed">기관별 통합 관리 솔루션 제공</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformOverview;