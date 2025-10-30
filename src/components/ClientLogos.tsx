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
      name: "디앤알운동발달센터", 
      count: "신규 제휴기관", 
      icon: Activity,
      type: "운동발달센터",
      location: "서울시 강남구",
      phone: "02-1234-5678",
      services: ["운동지원", "감각통합교육", "체육활동", "발달평가", "신체발달"],
      specialties: ["운동발달", "감각통합", "신체발달", "체육지원"],
      rating: 4.9,
      description: "운동 및 신체 발달 전문 센터. 운동지원, 감각통합교육, 체육활동을 통한 아동 발달 지원을 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-14:00"
    },
    { 
      name: "디딤돌언어사회성연구소", 
      count: "신규 제휴기관", 
      icon: Users,
      type: "연구소",
      location: "서울시 강남구",
      phone: "02-1234-5678",
      services: ["언어지원", "사회성발달", "발달평가", "아동상담"],
      specialties: ["언어지원", "사회성발달", "아동발달"],
      rating: 4.8,
      description: "언어 및 사회성 발달 전문 연구소. 언어지원, 사회성 향상 프로그램, 발달평가를 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-14:00"
    },
    { 
      name: "APA발달센터", 
      count: "신규 제휴기관", 
      icon: Brain,
      type: "발달센터",
      location: "서울시 서초구",
      phone: "02-9876-5432",
      services: ["발달평가", "ADHD 지원", "자폐스펙트럼 지원", "행동지원", "심리상담"],
      specialties: ["발달평가", "ADHD", "자폐스펙트럼", "행동지원"],
      rating: 4.9,
      description: "Applied Psychology and Assessment 발달 전문 센터. ADHD, 자폐스펙트럼, 발달지연 아동을 위한 종합 평가 및 지원 서비스를 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "삼성웰니스의원", 
      count: "메인 제휴기관", 
      icon: Heart,
      type: "의원",
      location: "서울시 강남구",
      phone: "02-0000-0000",
      services: ["발달검진", "언어지원", "인지지원", "작업지원", "행동지원", "가족상담", "조기개입"],
      specialties: ["조기개입", "자폐스펙트럼", "언어발달지연", "ADHD"],
      rating: 5.0,
      description: "전문 의료진과 최신 시설을 갖춘 메인 제휴기관으로 포괄적인 발달 지원 서비스를 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-14:00"
    },
    { 
      name: "한점미소발달센터 남양주점", 
      count: "전문기관", 
      icon: Heart,
      type: "발달센터",
      location: "경기도 남양주시",
      phone: "031-1234-5678",
      services: ["언어치료", "인지치료", "작업치료", "사회성훈련", "부모상담"],
      specialties: ["자폐스펙트럼", "ADHD", "언어발달지연", "학습장애"],
      rating: 4.7,
      description: "아동발달 전문센터로 언어치료, 인지치료, 작업치료를 통합적으로 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "한점미소발달센터 부천점", 
      count: "전문기관", 
      icon: Sparkles,
      type: "발달센터",
      location: "경기도 부천시",
      phone: "032-9876-5432",
      services: ["언어치료", "인지치료", "작업치료", "사회성훈련"],
      specialties: ["언어발달지연", "자폐스펙트럼", "ADHD"],
      rating: 4.6,
      description: "아동발달 전문센터로 개별맞춤형 치료 프로그램을 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "우아함발달센터 안산점", 
      count: "전문기관", 
      icon: Users,
      type: "발달센터",
      location: "경기도 안산시",
      phone: "031-345-6789",
      services: ["언어치료", "작업치료", "인지치료", "사회성훈련", "학습치료"],
      specialties: ["언어발달지연", "ADHD", "자폐스펙트럼", "학습장애"],
      rating: 4.6,
      description: "체계적이고 전문적인 발달치료 서비스를 제공하는 전문센터입니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-16:00"
    },
    { 
      name: "우아함발달센터 화성새솔점", 
      count: "전문기관", 
      icon: Target,
      type: "발달센터",
      location: "경기도 화성시",
      phone: "031-234-5678",
      services: ["언어치료", "작업치료", "인지치료", "사회성훈련", "감각통합치료"],
      specialties: ["자폐스펙트럼", "ADHD", "발달지연", "학습장애"],
      rating: 4.7,
      description: "아동 발달 전문센터로 개별 맞춤형 치료 프로그램을 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "메이플 ABA 목동센터", 
      count: "자폐전문", 
      icon: Brain,
      type: "발달센터",
      location: "서울시 양천구",
      phone: "02-2643-5678",
      services: ["ABA치료", "행동중재", "사회성훈련", "부모교육", "개별교육"],
      specialties: ["자폐스펙트럼", "행동문제", "사회성발달", "의사소통장애"],
      rating: 4.8,
      description: "ABA(응용행동분석) 전문센터로 자폐스펙트럼 아동의 행동중재를 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-16:00"
    },
    { 
      name: "엘림아동발달센터", 
      count: "전문기관", 
      icon: Leaf,
      type: "발달센터",
      location: "경기도 고양시",
      phone: "031-905-7890",
      services: ["언어치료", "놀이치료", "미술치료", "사회성훈련", "부모상담"],
      specialties: ["언어발달지연", "사회성발달", "정서행동문제", "학습장애"],
      rating: 4.7,
      description: "아동발달 전문센터로 언어치료, 놀이치료, 미술치료를 통합적으로 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "해웃음 심리발달센터", 
      count: "전문기관", 
      icon: Heart,
      type: "상담센터",
      location: "서울시 마포구",
      phone: "02-334-5678",
      services: ["심리상담", "언어치료", "놀이치료", "가족상담", "부모교육"],
      specialties: ["정서행동문제", "사회성발달", "불안장애", "우울증"],
      rating: 4.6,
      description: "심리상담과 발달치료를 전문으로 하는 통합센터입니다.",
      hours: "평일 10:00-19:00, 토요일 10:00-17:00"
    },
    { 
      name: "핌발달센터", 
      count: "전문기관", 
      icon: Sparkles,
      type: "발달센터",
      location: "경기도 성남시",
      phone: "031-708-9012",
      services: ["언어치료", "인지치료", "작업치료", "사회성훈련", "학습치료"],
      specialties: ["자폐스펙트럼", "ADHD", "학습장애", "발달지연"],
      rating: 4.8,
      description: "개별맞춤형 발달치료와 교육 프로그램을 제공하는 전문센터입니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-16:00"
    },
    { 
      name: "정관언어발달센터", 
      count: "전문기관", 
      icon: Activity,
      type: "발달센터",
      location: "부산시 기장군",
      phone: "051-727-3456",
      services: ["언어치료", "조음치료", "유창성치료", "음성치료", "삼킴치료"],
      specialties: ["조음장애", "유창성장애", "음성장애", "언어발달지연"],
      rating: 4.7,
      description: "언어발달 전문센터로 조음장애, 유창성장애 치료를 전문으로 합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "해오름 아동발달센터", 
      count: "전문기관", 
      icon: Users,
      type: "발달센터",
      location: "경기도 수원시",
      phone: "031-205-6789",
      services: ["언어치료", "인지치료", "작업치료", "물리치료", "사회성훈련", "감각통합치료"],
      specialties: ["조기개입", "자폐스펙트럼", "뇌성마비", "발달지연"],
      rating: 4.8,
      description: "아동발달 전문센터로 영유아부터 청소년까지 포괄적 서비스를 제공합니다.",
      hours: "평일 08:30-18:30, 토요일 08:30-16:30"
    },
    { 
      name: "넘나들발달센터", 
      count: "전문기관", 
      icon: Brain,
      type: "발달센터",
      location: "부산시 해운대구",
      phone: "051-746-8901",
      services: ["언어치료", "감각통합치료", "인지치료", "사회성훈련", "미술치료"],
      specialties: ["감각통합장애", "ADHD", "학습장애", "자폐스펙트럼"],
      rating: 4.6,
      description: "감각통합치료를 중심으로 한 전문적인 발달치료 서비스를 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "별하 아동발달센터", 
      count: "전문기관", 
      icon: Star,
      type: "발달센터",
      location: "대구시 달서구",
      phone: "053-623-4567",
      services: ["언어치료", "놀이치료", "음악치료", "사회성훈련", "부모상담"],
      specialties: ["자폐스펙트럼", "언어발달지연", "사회성발달", "정서행동문제"],
      rating: 4.7,
      description: "창의적이고 개별화된 치료 프로그램으로 아동의 잠재력을 개발합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "정아동심리상담소", 
      count: "전문기관", 
      icon: Heart,
      type: "상담소",
      location: "인천시 부평구",
      phone: "032-518-9012",
      services: ["심리상담", "놀이치료", "언어치료", "가족상담", "부모교육"],
      specialties: ["정서행동문제", "트라우마", "우울증", "불안장애"],
      rating: 4.8,
      description: "아동 심리 전문 상담소로 정서적 어려움을 전문적으로 치료합니다.",
      hours: "평일 10:00-19:00, 토요일 10:00-16:00"
    },
    { 
      name: "소리엘 언어치료센터", 
      count: "전문기관", 
      icon: Activity,
      type: "언어치료센터",
      location: "경기도 의정부시",
      phone: "031-874-5678",
      services: ["언어치료", "조음치료", "청능훈련", "음성치료", "유창성치료"],
      specialties: ["조음장애", "청각장애", "언어발달지연", "음성장애"],
      rating: 4.6,
      description: "청각언어장애 전문 치료센터로 청능훈련과 언어치료를 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-14:00"
    },
    { 
      name: "나아가다 발달센터", 
      count: "전문기관", 
      icon: Target,
      type: "발달센터",
      location: "강원도 춘천시",
      phone: "033-253-7890",
      services: ["언어치료", "작업치료", "인지치료", "사회성훈련", "감각통합치료"],
      specialties: ["발달지연", "자폐스펙트럼", "학습장애", "ADHD"],
      rating: 4.7,
      description: "강원지역 대표 발달센터로 포괄적인 발달치료 서비스를 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "우리 ABA 센터", 
      count: "전문기관", 
      icon: Brain,
      type: "발달센터",
      location: "울산시 남구",
      phone: "052-267-3456",
      services: ["ABA치료", "사회성훈련", "언어치료", "행동중재", "부모교육"],
      specialties: ["자폐스펙트럼", "행동문제", "의사소통장애", "사회성발달"],
      rating: 4.7,
      description: "ABA 치료 전문센터로 과학적 근거에 기반한 개입을 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-16:00"
    },
    { 
      name: "한걸음 발달센터", 
      count: "전문기관", 
      icon: Users,
      type: "발달센터",
      location: "충청남도 천안시",
      phone: "041-553-8901",
      services: ["언어치료", "인지치료", "감각통합치료", "작업치료", "물리치료"],
      specialties: ["감각통합장애", "ADHD", "발달지연", "뇌성마비"],
      rating: 4.6,
      description: "감각통합치료를 특화로 한 종합 발달치료센터입니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "참소리 언어센터", 
      count: "전문기관", 
      icon: Activity,
      type: "언어센터",
      location: "전라북도 전주시",
      phone: "063-246-7890",
      services: ["언어치료", "조음치료", "음성치료", "유창성치료", "청능훈련"],
      specialties: ["조음장애", "음성장애", "언어발달지연", "유창성장애"],
      rating: 4.7,
      description: "언어치료 전문센터로 조음 및 음성장애 치료를 전문으로 합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "산본 발달치료센터", 
      count: "전문기관", 
      icon: Stethoscope,
      type: "발달치료센터",
      location: "경기도 군포시",
      phone: "031-394-5678",
      services: ["언어치료", "작업치료", "물리치료", "인지치료", "감각통합치료"],
      specialties: ["뇌성마비", "발달지연", "운동장애", "자폐스펙트럼"],
      rating: 4.6,
      description: "물리치료를 포함한 종합적인 발달치료 서비스를 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-16:00"
    },
    { 
      name: "도란도란 심리센터", 
      count: "전문기관", 
      icon: Heart,
      type: "심리센터",
      location: "광주시 서구",
      phone: "062-372-9012",
      services: ["심리상담", "놀이치료", "미술치료", "가족상담", "사회성훈련"],
      specialties: ["정서행동문제", "트라우마", "사회성발달", "불안장애"],
      rating: 4.8,
      description: "아동 심리 전문센터로 따뜻하고 안전한 치료 환경을 제공합니다.",
      hours: "평일 10:00-19:00, 토요일 10:00-17:00"
    },
    { 
      name: "다다 아동발달센터", 
      count: "전문기관", 
      icon: Users,
      type: "발달센터",
      location: "제주특별자치도 제주시",
      phone: "064-754-3456",
      services: ["언어치료", "인지치료", "사회성훈련", "놀이치료", "부모상담"],
      specialties: ["자폐스펙트럼", "ADHD", "언어발달지연", "사회성발달"],
      rating: 4.6,
      description: "제주지역 대표 아동발달센터로 포괄적인 발달 서비스를 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "창원발달의학센터", 
      count: "전문기관", 
      icon: Stethoscope,
      type: "의학센터",
      location: "경상남도 창원시",
      phone: "055-284-7890",
      services: ["발달검진", "약물치료", "행동치료", "언어치료", "인지치료"],
      specialties: ["ADHD", "자폐스펙트럼", "발달지연", "학습장애"],
      rating: 4.7,
      description: "의학적 접근과 행동치료를 결합한 전문적인 발달의학 서비스를 제공합니다.",
      hours: "평일 09:00-17:00, 토요일 09:00-13:00"
    },
    { 
      name: "튼튼발달센터", 
      count: "전문기관", 
      icon: Users,
      type: "발달센터",
      location: "대전시 유성구",
      phone: "042-863-5678",
      services: ["언어치료", "작업치료", "인지치료", "감각통합치료", "물리치료"],
      specialties: ["감각통합장애", "발달지연", "뇌성마비", "자폐스펙트럼"],
      rating: 4.6,
      description: "대전지역 대표 발달센터로 다학제적 접근을 통한 통합치료를 제공합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "아이사랑발달센터", 
      count: "전문기관", 
      icon: Heart,
      type: "발달센터",
      location: "경상북도 포항시",
      phone: "054-278-9012",
      services: ["언어치료", "놀이치료", "인지치료", "사회성훈련", "미술치료"],
      specialties: ["언어발달지연", "자폐스펙트럼", "정서행동문제", "ADHD"],
      rating: 4.7,
      description: "경북 동해안 지역의 아동발달 전문센터로 사랑과 전문성으로 치료합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-14:00"
    },
    { 
      name: "희망발달센터", 
      count: "전문기관", 
      icon: Target,
      type: "발달센터",
      location: "전라남도 목포시",
      phone: "061-804-3456",
      services: ["언어치료", "작업치료", "인지치료", "감각통합치료", "부모상담"],
      specialties: ["발달지연", "자폐스펙트럼", "감각통합장애", "학습장애"],
      rating: 4.6,
      description: "전남 서남권 지역의 발달치료 거점센터로 희망찬 미래를 만들어갑니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "푸른하늘발달센터", 
      count: "전문기관", 
      icon: Sparkles,
      type: "발달센터",
      location: "충청북도 청주시",
      phone: "043-234-7890",
      services: ["언어치료", "인지치료", "사회성훈련", "학습치료", "놀이치료"],
      specialties: ["ADHD", "학습장애", "자폐스펙트럼", "언어발달지연"],
      rating: 4.7,
      description: "충북지역 대표 발달센터로 맑고 푸른 성장을 지원합니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-16:00"
    },
    { 
      name: "새싹발달센터", 
      count: "전문기관", 
      icon: Leaf,
      type: "발달센터",
      location: "경기도 용인시",
      phone: "031-324-5678",
      services: ["언어치료", "작업치료", "인지치료", "감각통합치료", "음악치료"],
      specialties: ["조기개입", "발달지연", "자폐스펙트럼", "감각통합장애"],
      rating: 4.6,
      description: "용인지역의 발달치료 전문센터로 새싹같은 아이들의 성장을 돕습니다.",
      hours: "평일 09:00-18:00, 토요일 09:00-15:00"
    },
    { 
      name: "햇살발달센터", 
      count: "전문기관", 
      icon: Activity,
      type: "발달센터",
      location: "인천시 남동구",
      phone: "032-462-9012",
      services: ["언어치료", "인지치료", "사회성훈련", "놀이치료", "부모교육"],
      specialties: ["언어발달지연", "사회성발달", "ADHD", "자폐스펙트럼"],
      rating: 4.7,
      description: "따뜻한 햇살처럼 아이들의 발달을 밝게 비춰주는 전문센터입니다.",
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
      description: "언어·인지·작업·사회성 등 통합 발달치료를 제공하는 전문센터.",
      hours: "평일 09:00-18:00, 토요일 09:00-16:00"
    },
    { 
      name: "틔움사회서비스센터", 
      count: "전문기관", 
      icon: Heart,
      type: "복지센터",
      location: "경기도 안양시",
      phone: "031-444-5555",
      services: ["언어치료", "인지치료", "사회성훈련", "가족상담", "지역사회적응훈련"],
      specialties: ["사회성발달", "정서행동", "가족상담"],
      rating: 4.6,
      description: "지역사회 기반의 가족상담, 사회성훈련, 지역사회적응훈련을 제공하는 센터.",
      hours: "평일 09:00-18:00, 토요일 09:00-14:00"
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
          <p className="text-muted-foreground text-sm sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            AIH와 함께 아이의 숨겨진 가능성을<br className="sm:hidden" /> 발견한 가족들의 소중한 이야기
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
            <h3 className="text-base sm:text-xl md:text-2xl font-bold text-foreground mb-2">
              전문기관과 함께하는 <span className="text-brand-gradient">신뢰할 수 있는 분석</span>
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">의료진과 전문가들이 인정한 AIH 통합분석 시스템</p>
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
                    partner.name === '삼성웰니스의원'
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-500' 
                      : 'bg-primary/10'
                  } rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <IconComponent className={`w-6 h-6 ${
                      partner.name === '삼성웰니스의원' 
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
                <span className="text-brand-gradient font-bold">40+</span> 전문기관 · <span className="text-brand-gradient font-bold">15,000+</span> 가족이 신뢰
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
                      selectedInstitution.name === '삼성웰니스의원'
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-500' 
                        : 'bg-primary/10'
                    } rounded-full flex items-center justify-center`}>
                      <selectedInstitution.icon className={`w-5 h-5 ${
                        selectedInstitution.name === '삼성웰니스의원'
                          ? 'text-white' 
                          : 'text-primary'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{selectedInstitution.name}</h3>
                      <Badge className={`${
                        selectedInstitution.name === '삼성웰니스의원'
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
                    {selectedInstitution.name === '삼성웰니스의원' && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">전문가 15명</span>
                      </div>
                    )}
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