import React from 'react';
import { Heart, Building2, Brain, Activity, GraduationCap, Users, Target, Leaf, Stethoscope, BookOpen, Trophy, Sparkles, Star, Quote } from 'lucide-react';

const ClientLogos = () => {
  // 실제 사용자들의 감동적인 후기들
  const testimonials = [
    {
      name: "김소영 엄마",
      age: "7세 아들",
      content: "우리 아이가 말이 늦어서 얼마나 걱정했는데... AIH로 정확한 진단받고 3개월 만에 '엄마 사랑해'라고 말해줬을 때 정말 눈물이 났어요. 이제는 매일 재잘재잘 이야기해요.",
      rating: 5,
      icon: Heart,
      color: "text-pink-500",
      bgColor: "bg-pink-50"
    },
    {
      name: "박정민 아빠",
      age: "5세 딸",
      content: "ADHD 의심으로 시작했는데, 우리 아이만의 특별한 재능을 발견할 수 있었어요. 전문가 선생님 추천으로 예술치료 받으면서 아이가 완전히 달라졌어요. 진짜 감사해요.",
      rating: 5,
      icon: Brain,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      name: "이현주 엄마",
      age: "3세 쌍둥이",
      content: "쌍둥이 키우면서 하루하루가 전쟁같았는데... 각 아이의 발달 특성을 알고 나니 육아가 이렇게 즐거울 수 있구나 싶어요. 아이들도 더 행복해하고 저도 자신감이 생겼어요.",
      rating: 5,
      icon: Users,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50"
    },
    {
      name: "정수현 엄마",
      age: "6세 아들",
      content: "다른 아이들보다 말이 늦어서 걱정되어 검사받았는데, 우리 아이가 얼마나 세심하고 똑똑한지 알게 되었어요. 이제는 아이의 속도를 인정하고 기다려주고 있어요.",
      rating: 5,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      name: "최민경 엄마",
      age: "4세 딸",
      content: "아이가 또래친구들과 어울리지 못해서 속상했는데, AIH 분석 후 사회성 발달 프로그램 추천받아서 지금은 친구들과 신나게 놀아요. 아이 웃는 모습이 제일 소중해요.",
      rating: 5,
      icon: Heart,
      color: "text-rose-500",
      bgColor: "bg-rose-50"
    },
    {
      name: "김태우 아빠",
      age: "8세 아들",
      content: "학습에 어려움이 있는 우리 아이... 포기하고 싶었는데 AIH 덕분에 아이만의 학습법을 찾았어요. 이제는 스스로 공부하려고 하고 자신감도 늘었어요. 정말 기적같아요.",
      rating: 5,
      icon: Trophy,
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
    {
      name: "윤서연 엄마",
      age: "2세 딸",
      content: "첫아이라 모든 게 걱정되었는데, 발달단계별 가이드를 받으니까 육아에 대한 불안감이 많이 줄었어요. 우리 아이가 정상적으로 잘 자라고 있다는 걸 알게 되어 안심이에요.",
      rating: 5,
      icon: Sparkles,
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      name: "조현우 아빠",
      age: "9세 아들",
      content: "아이가 감정조절을 못해서 매일 울고불고... 전문가 상담받고 가족 모두가 변했어요. 이제는 아이가 화날 때도 스스로 진정하고 대화로 해결해요. 가족이 더 가까워졌어요.",
      rating: 5,
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      name: "이성민",
      age: "35세 성인",
      content: "대인관계에 어려움을 겪어 상담받았는데, AIH 분석을 통해 제 성격과 강점을 정확히 파악할 수 있었어요. 이제는 직장에서도 자신감 있게 소통하고 있습니다.",
      rating: 5,
      icon: Target,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50"
    },
    {
      name: "김영희",
      age: "42세 성인",
      content: "늦은 나이에 ADHD 진단을 받고 충격이었는데, AIH를 통해 제 특성을 이해하고 관리법을 배우니 삶의 질이 많이 향상되었어요. 진작 알았으면 좋았을 텐데...",
      rating: 5,
      icon: Brain,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50"
    },
    {
      name: "박종철 어르신",
      age: "67세",
      content: "손자 육아를 도우면서 요즘 아이들을 이해하기 어려웠는데, AIH 교육 프로그램 덕분에 손자와의 관계가 훨씬 좋아졌어요. 세대 차이를 좁힐 수 있었어요.",
      rating: 5,
      icon: Heart,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      name: "최순자 어르신",
      age: "72세",
      content: "치매 예방을 위해 인지 검사를 받았는데, 제 상태를 정확히 알 수 있어서 좋았어요. 맞춤형 운동과 활동 프로그램도 추천받아서 매일 실천하고 있어요.",
      rating: 5,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  // 제휴 전문기관들
  const partners = [
    { name: "한점미소발달센터", count: "남양주·부천점", icon: Heart },
    { name: "차의과대학교", count: "발달장애센터", icon: BookOpen },
    { name: "인애한의원", count: "강남점", icon: Stethoscope },
    { name: "해오름아동발달센터", count: "전문진료", icon: Sparkles },
    { name: "서울대학교병원", count: "소아정신과", icon: Brain },
    { name: "연세대 세브란스병원", count: "발달센터", icon: GraduationCap },
    { name: "삼성서울병원", count: "아동발달클리닉", icon: Building2 },
    { name: "고려대학교 의료원", count: "재활의학과", icon: Activity },
    { name: "아이존발달센터", count: "강남·분당점", icon: Users },
    { name: "우리아이발달센터", count: "목동·일산점", icon: Target },
    { name: "소아한의원 아이조아", count: "한방발달치료", icon: Leaf },
    { name: "푸름이나무 클리닉", count: "소아정신건강의학과", icon: Brain },
    { name: "마음샘 정신건강의학과", count: "아동청소년 전문", icon: Heart },
    { name: "키움아동발달센터", count: "언어·인지치료", icon: BookOpen },
    { name: "아이사랑 소아과", count: "발달상담 전문", icon: Stethoscope },
    { name: "꿈나무아동발달센터", count: "종합발달치료", icon: Sparkles }
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* 감동적인 후기 섹션 */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            <span className="text-brand-gradient">진짜 엄마들의 진심 후기</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            AIH와 함께 아이의 숨겨진 가능성을 발견한 가족들의 소중한 이야기
          </p>
        </div>

        {/* 후기 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonials.slice(0, 9).map((testimonial, index) => {
            const IconComponent = testimonial.icon;
            return (
              <div
                key={index}
                className={`${testimonial.bgColor} border border-gray-200/60 rounded-2xl p-6 hover:shadow-xl hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group`}
              >
                {/* 배경 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  {/* 별점 */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* 따옴표 아이콘 */}
                  <Quote className={`w-8 h-8 ${testimonial.color} mb-4 opacity-60`} />

                  {/* 후기 내용 */}
                  <p className="text-sm text-foreground/90 leading-relaxed mb-4 font-medium">
                    "{testimonial.content}"
                  </p>

                  {/* 작성자 정보 */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${testimonial.bgColor} rounded-full flex items-center justify-center ring-2 ring-white shadow-sm`}>
                      <IconComponent className={`w-5 h-5 ${testimonial.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.age}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 파트너 기관 섹션 */}
        <div className="bg-white/60 rounded-2xl p-8 border border-gray-200/60">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              전문기관과 함께하는 <span className="text-brand-gradient">신뢰할 수 있는 분석</span>
            </h3>
            <p className="text-muted-foreground">의료진과 전문가들이 인정한 AIH 통합분석 시스템</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {partners.map((partner, index) => {
              const IconComponent = partner.icon;
              return (
                <div
                  key={index}
                  className="text-center p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-all duration-200 hover:scale-105"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">{partner.name}</h4>
                  <p className="text-xs text-muted-foreground">{partner.count}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-6 py-3">
              <span className="text-lg">✨</span>
              <span className="text-sm sm:text-base font-medium text-foreground">
                <span className="text-brand-gradient font-bold">16+</span> 전문기관 · <span className="text-brand-gradient font-bold">10,000+</span> 가족이 신뢰
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;