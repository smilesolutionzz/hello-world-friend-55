import React from 'react';

const ClientLogos = () => {
  // Sample client/partner logos - replace with actual partner logos
  const clients = [
    { name: "서울대학교병원", logo: "🏥" },
    { name: "삼성생명", logo: "💼" },
    { name: "현대자동차", logo: "🚗" },
    { name: "LG전자", logo: "📱" },
    { name: "KBS", logo: "📺" },
    { name: "한국교육개발원", logo: "📚" },
    { name: "보건복지부", logo: "🏛️" },
    { name: "서울특별시", logo: "🏢" },
    { name: "연세대학교", logo: "🎓" },
    { name: "고려대학교", logo: "📖" },
    { name: "아산병원", logo: "⚕️" },
    { name: "세브란스병원", logo: "🏥" },
    { name: "SK텔레콤", logo: "📞" },
    { name: "네이버", logo: "🔍" },
    { name: "카카오", logo: "💬" },
    { name: "교육부", logo: "🎯" },
    { name: "한국심리학회", logo: "🧠" },
    { name: "대한의사협회", logo: "👩‍⚕️" },
    { name: "한국아동발달연구소", logo: "👶" },
    { name: "서울아동병원", logo: "🏥" },
    { name: "국민건강보험공단", logo: "🛡️" },
    { name: "한국교원대학교", logo: "👨‍🏫" },
    { name: "육아정책연구소", logo: "👨‍👩‍👧‍👦" },
    { name: "한국청소년상담복지개발원", logo: "🤝" }
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">
            <span className="text-brand-gradient">신뢰받는 AI 심리분석 플랫폼</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            전국 주요 의료기관과 교육기관에서 선택한 전문 AI 분석 서비스
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {clients.map((client, index) => (
            <div
              key={index}
              className="group bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl p-4 sm:p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col items-center justify-center min-h-[100px] sm:min-h-[120px] hover:bg-white/80"
            >
              <div className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {client.logo}
              </div>
              <div className="text-xs sm:text-sm font-medium text-center text-foreground/80 group-hover:text-foreground transition-colors">
                {client.name}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-4 sm:px-6 py-2 sm:py-3">
            <span className="text-lg">✨</span>
            <span className="text-sm sm:text-base font-medium text-foreground">
              <span className="text-brand-gradient font-bold">500+</span> 기관에서 신뢰하는 AI 분석
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;