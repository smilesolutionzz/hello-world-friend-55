import React from 'react';
import { Heart, Building2, Brain, Activity, GraduationCap, Users, Target, Leaf, Stethoscope, BookOpen, Trophy, Sparkles, Star, Quote } from 'lucide-react';

const ClientLogos = () => {
  // 실제 사용자들의 감동적인 후기들
  const testimonials = [
    {
      name: "김소영 엄마",
      age: "7세 아들",
      content: "우리 아이가 말이 늦어서 얼마나 걱정했는데... AIH로 정확한 상태 확인받고 3개월 만에 '엄마 사랑해'라고 말해줬을 때 정말 눈물이 났어요. 이제는 매일 재잘재잘 이야기해요.",
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
      name: "김미나님",
      age: "50세 성인",
      content: "부모님 갱년기로 감정 기복이 심해져서 가족들이 힘들어했는데, AIH 상담을 통해 갱년기 특성을 이해하고 소통법을 배웠어요. 이제는 서로를 이해하며 더 따뜻한 가족이 되었어요.",
      rating: 5,
      icon: Heart,
      color: "text-rose-500",
      bgColor: "bg-rose-50"
    },
    {
      name: "이정수 팀장",
      age: "45세 성인",
      content: "팀을 이끌면서 번아웃이 심하게 와서 정말 힘들었는데, AIH를 통해 저의 리더십 스타일과 스트레스 패턴을 분석받고 나니 업무 효율도 높아지고 팀원들과의 관계도 개선되었어요.",
      rating: 5,
      icon: Target,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
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
    { name: "한점미소발달센터", count: "전문기관", icon: Heart },
    { name: "우아함발달센터", count: "전문기관", icon: Sparkles },
    { name: "메이플 ABA 센터", count: "자폐전문", icon: Users },
    { name: "엘림아동발달센터", count: "전문기관", icon: Target },
    { name: "해웃음 심리발달센터", count: "전문기관", icon: Heart },
    { name: "핌발달센터", count: "전문기관", icon: Brain },
    { name: "정관언어발달센터", count: "전문기관", icon: BookOpen },
    { name: "해오름 아동발달센터", count: "전문기관", icon: Sparkles },
    { name: "넘나들 언어인지학습연구소", count: "전문기관", icon: GraduationCap },
    { name: "별하언어심리상담센터", count: "전문기관", icon: Heart },
    { name: "정아동발달센터", count: "전문기관", icon: Building2 },
    { name: "소리엘언어발달센터", count: "전문기관", icon: Activity },
    { name: "나아가다발달상담센터", count: "전문기관", icon: Users },
    { name: "우리aba사회성발달센터", count: "전문기관", icon: Target },
    { name: "한걸음발달 연구소", count: "전문기관", icon: Leaf },
    { name: "참소리언어심리연구소", count: "전문기관", icon: Brain },
    { name: "산본아동발달센터", count: "전문기관", icon: Heart },
    { name: "도란도란 심리상담센터", count: "전문기관", icon: BookOpen },
    { name: "다다언어심리발달센터", count: "전문기관", icon: Stethoscope },
    { name: "풍무아동청소년아동발달센터", count: "전문기관", icon: Sparkles },
    { name: "창원튼튼i병원", count: "부설 아동발달센터", icon: Building2 },
    { name: "톡톡말톡톡 언어인지학습센터", count: "전문기관", icon: Activity },
    { name: "가까이한의원", count: "한의원", icon: Leaf },
    { name: "인애한의원", count: "한의원", icon: Stethoscope },
    { name: "해수원한의원", count: "한의원", icon: Leaf },
    { name: "굿모닝언어심리발달센터", count: "전문기관", icon: Heart }
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* 감동적인 후기 섹션 */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            <span className="text-brand-gradient">진짜 부모들의 진심 후기</span>
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
                <span className="text-brand-gradient font-bold">30+</span> 전문기관 · <span className="text-brand-gradient font-bold">15,000+</span> 가족이 신뢰
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;