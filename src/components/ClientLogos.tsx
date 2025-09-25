import React, { useState } from 'react';
import { Heart, Building2, Brain, Activity, GraduationCap, Users, Target, Leaf, Stethoscope, BookOpen, Trophy, Sparkles, Star, Quote, MapPin, Phone, Clock, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ClientLogos = () => {
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // 제휴 전문기관들 (상세 정보 추가)
  const partners = [
    { 
      name: "삼성웰니스의원 발달클리닉", 
      count: "메인 제휴기관", 
      icon: Heart,
      type: "의원",
      location: "경기도 하남시",
      phone: "02-489-1119",
      services: ["발달검진", "언어치료", "인지치료", "작업치료", "행동치료"],
      specialties: ["조기개입", "언어발달지연", "작업기능"],
      rating: 5.0,
      description: "최고 수준의 의료진과 최신 시설을 갖춘 메인 제휴기관입니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-13:00"
    },
    { 
      name: "한점미소발달센터", 
      count: "전문기관", 
      icon: Heart,
      type: "발달센터",
      location: "경기도 남양주시",
      phone: "031-1234-5678",
      services: ["언어치료", "인지치료", "작업치료", "사회성훈련"],
      specialties: ["자폐스펙트럼", "ADHD", "언어발달지연"],
      rating: 4.7,
      description: "아동발달 전문센터로 언어치료, 인지치료, 작업치료를 통합적으로 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "조이발달센터", 
      count: "전문기관", 
      icon: Sparkles,
      type: "발달센터",
      location: "서울시 노원구",
      phone: "02-1111-2222",
      services: ["언어치료", "인지치료", "작업치료", "사회성훈련", "감각통합치료"],
      specialties: ["언어발달지연", "자폐스펙트럼", "ADHD"],
      rating: 4.7,
      description: "언어·인지·작업치료 및 사회성훈련을 제공하는 통합 발달센터입니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "틔움통합발달센터", 
      count: "전문기관", 
      icon: Users,
      type: "발달센터",
      location: "경기도 안양시",
      phone: "031-222-3333",
      services: ["언어치료", "인지치료", "작업치료", "사회성훈련", "학습치료", "부모상담"],
      specialties: ["자폐스펙트럼", "ADHD", "언어발달지연", "학습장애"],
      rating: 4.8,
      description: "언어·인지·작업·사회성 등 통합 발달치료를 제공하는 전문센터입니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-16:00"
    },
    { 
      name: "틔움사회서비스센터", 
      count: "전문기관", 
      icon: Target,
      type: "사회서비스센터",
      location: "경기도 안양시",
      phone: "031-444-5555",
      services: ["언어치료", "인지치료", "사회성훈련", "가족상담", "지역사회적응훈련"],
      specialties: ["사회성발달", "정서행동", "가족상담"],
      rating: 4.6,
      description: "지역사회 기반의 가족상담, 사회성훈련, 지역사회적응훈련을 제공하는 센터입니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-14:00"
    },
    { 
      name: "메이플 ABA 센터", 
      count: "자폐전문", 
      icon: Brain,
      type: "발달센터",
      location: "서울시 양천구",
      phone: "02-2643-5678",
      services: ["ABA치료", "행동중재", "사회성훈련", "부모교육", "개별교육"],
      specialties: ["자폐스펙트럼", "행동문제", "사회성발달"],
      rating: 4.8,
      description: "ABA(응용행동분석) 전문센터로 자폐스펙트럼 아동의 행동중재를 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-16:00"
    }
  ];

  const handleInstitutionClick = (institution: any) => {
    setSelectedInstitution(institution);
    setIsModalOpen(true);
  };

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
                  className="text-center p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-all duration-200 hover:scale-105 cursor-pointer"
                  onClick={() => handleInstitutionClick(partner)}
                >
                  <div className={`w-12 h-12 ${
                    partner.name === '삼성웰니스의원 발달클리닉' 
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-500' 
                      : 'bg-primary/10'
                  } rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <IconComponent className={`w-6 h-6 ${
                      partner.name === '삼성웰니스의원 발달클리닉' 
                        ? 'text-white' 
                        : 'text-primary'
                    }`} />
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

        {/* 기관 정보 모달 */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedInstitution && (
                  <>
                    <div className={`w-10 h-10 ${
                      selectedInstitution.name === '삼성웰니스의원 발달클리닉' 
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-500' 
                        : 'bg-primary/10'
                    } rounded-full flex items-center justify-center`}>
                      <selectedInstitution.icon className={`w-5 h-5 ${
                        selectedInstitution.name === '삼성웰니스의원 발달클리닉' 
                          ? 'text-white' 
                          : 'text-primary'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{selectedInstitution.name}</h3>
                      <Badge className={`${
                        selectedInstitution.name === '삼성웰니스의원 발달클리닉' 
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {selectedInstitution.count}
                      </Badge>
                    </div>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedInstitution && (
              <div className="space-y-6">
                {/* 기본 정보 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedInstitution.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedInstitution.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedInstitution.hours}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedInstitution.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">평점 {selectedInstitution.rating}</span>
                    </div>
                  </div>
                </div>

                {/* 설명 */}
                <div>
                  <h4 className="font-semibold mb-2">기관 소개</h4>
                  <p className="text-sm text-muted-foreground">{selectedInstitution.description}</p>
                </div>

                {/* 제공 서비스 */}
                <div>
                  <h4 className="font-semibold mb-3">제공 서비스</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInstitution.services.map((service: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 전문 분야 */}
                <div>
                  <h4 className="font-semibold mb-3">전문 분야</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInstitution.specialties.map((specialty: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 상담 버튼 */}
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1">
                    상담 예약하기
                  </Button>
                  <Button variant="outline" className="flex-1">
                    더 자세한 정보
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ClientLogos;