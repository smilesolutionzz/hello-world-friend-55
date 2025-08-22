import React from 'react';

const ClientLogos = () => {
  // Partner clinics and institutions
  const clients = [
    { name: "한점미소발달센터 남양주점", logo: "😊" },
    { name: "한점미소발달센터 부천점", logo: "😊" },
    { name: "인애한의원 강남점", logo: "🏥" },
    { name: "우아함발달센터 안산점", logo: "🌟" },
    { name: "우아함발달센터 화성점", logo: "🌟" },
    { name: "APA발달센터", logo: "🧠" },
    { name: "한국스포츠과학연구소", logo: "⚽" },
    { name: "용인대학교", logo: "🎓" },
    { name: "한국특수체육학회", logo: "🏃‍♂️" },
    { name: "명지대학교", logo: "📚" },
    { name: "삼성웰니스의원", logo: "💼" },
    { name: "가까이한의원", logo: "🌿" }
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8">
          {clients.map((client, index) => (
            <div
              key={index}
              className="group bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl p-6 sm:p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col items-center justify-center min-h-[140px] sm:min-h-[160px] hover:bg-white/80"
            >
              <div className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {client.logo}
              </div>
              <div className="text-sm sm:text-base font-medium text-center text-foreground/80 group-hover:text-foreground transition-colors">
                {client.name}
              </div>
            </div>
          ))}
        </div>

          <div className="text-center mt-8 sm:mt-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-4 sm:px-6 py-2 sm:py-3">
              <span className="text-lg">✨</span>
              <span className="text-sm sm:text-base font-medium text-foreground">
                <span className="text-brand-gradient font-bold">50+</span> 기관에서 신뢰하는 AI + 전문가 분석
              </span>
            </div>
          </div>
      </div>
    </section>
  );
};

export default ClientLogos;