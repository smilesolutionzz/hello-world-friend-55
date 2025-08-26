import React from 'react';
import { Heart, Building2, Brain, Activity, GraduationCap, Users, Target, Leaf, Stethoscope, BookOpen, Trophy, Sparkles } from 'lucide-react';

const ClientLogos = () => {
  // Partner clinics and institutions
  const clients = [
    { 
      name: "한점미소발달센터 남양주점", 
      icon: Heart, 
      color: "text-pink-500",
      bgColor: "bg-pink-50",
      description: "아동발달 전문센터"
    },
    { 
      name: "한점미소발달센터 부천점", 
      icon: Heart, 
      color: "text-pink-500",
      bgColor: "bg-pink-50",
      description: "아동발달 전문센터"
    },
    { 
      name: "인애한의원 강남점", 
      icon: Stethoscope, 
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "통합의학 전문의원"
    },
    { 
      name: "희망발달센터 수원점", 
      icon: Heart, 
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      description: "아동발달 전문센터"
    },
    { 
      name: "정관언어발달센터", 
      icon: Brain, 
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "언어발달 전문센터"
    },
    { 
      name: "해오름아동발달센터", 
      icon: Sparkles, 
      color: "text-green-500",
      bgColor: "bg-green-50",
      description: "아동발달 지원센터"
    },
    { 
      name: "정아동발달센터", 
      icon: Heart, 
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      description: "아동발달 전문센터"
    },
    { 
      name: "차의과대학교 발달장애센터", 
      icon: BookOpen, 
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      description: "대학부설 진료센터"
    },
    { 
      name: "마음숲심리상담센터", 
      icon: Building2, 
      color: "text-slate-600",
      bgColor: "bg-slate-50",
      description: "심리상담 전문센터"
    },
    { 
      name: "해피아이티비", 
      icon: Activity, 
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      description: "아동발달 전문기관"
    },
    { 
      name: "김정임아동발달", 
      icon: Trophy, 
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      description: "아동발달 치료센터"
    },
    { 
      name: "가까이한의원", 
      icon: Leaf, 
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "한방통합 진료센터"
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">
            <span className="text-brand-gradient">신뢰받는 AIH 통합건강분석 플랫폼</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            전국 주요 의료기관과 교육기관에서 선택한 전문 AIH 분석 서비스
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8">
          {clients.map((client, index) => {
            const IconComponent = client.icon;
            return (
              <div
                key={index}
                className={`group ${client.bgColor} border border-gray-200/60 rounded-xl p-6 sm:p-8 hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col items-center justify-center min-h-[160px] sm:min-h-[180px] hover:scale-105 relative overflow-hidden`}
              >
                {/* 배경 그라데이션 효과 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* 아이콘 */}
                <div className={`${client.bgColor} rounded-full p-4 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10`}>
                  <IconComponent className={`w-8 h-8 ${client.color}`} />
                </div>
                
                {/* 브랜드명 */}
                <div className="text-sm sm:text-base font-bold text-center text-foreground/90 group-hover:text-foreground transition-colors mb-2 relative z-10">
                  {client.name}
                </div>
                
                {/* 설명 */}
                <div className="text-xs text-center text-muted-foreground group-hover:text-foreground/70 transition-colors relative z-10">
                  {client.description}
                </div>
              </div>
            );
          })}
        </div>

          <div className="text-center mt-8 sm:mt-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-4 sm:px-6 py-2 sm:py-3">
              <span className="text-lg">✨</span>
              <span className="text-sm sm:text-base font-medium text-foreground">
                <span className="text-brand-gradient font-bold">50+</span> 기관에서 신뢰하는 AIH + 전문가 분석
              </span>
            </div>
          </div>
      </div>
    </section>
  );
};

export default ClientLogos;