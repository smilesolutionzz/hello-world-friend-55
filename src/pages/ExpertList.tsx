import React from "react";
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, Award, Calendar, Clock, Users, MessageCircle, Video,
  CheckCircle, Crown, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MakeOneProjectBanner } from '@/components/cross-promotion/MakeOneProjectBanner';
import { useLanguage } from '@/i18n/LanguageContext';

interface Expert {
  id: string;
  name: string;
  specialty: string;
  credentials: string[];
  rating: number;
  reviews: number;
  experience: string;
  availability: string;
  price: string;
  image: string;
  description: string;
  languages: string[];
  consultationTypes: string[];
}

const ExpertList = () => {
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();

  const mockExperts: Expert[] = [
    {
      id: "1",
      name: isEnglish ? "Dr. Sarah Kim" : "김소연 박사",
      specialty: isEnglish ? "Child Development Psychologist" : "아동발달심리 전문의",
      credentials: isEnglish 
        ? ["Child Psychiatry Specialist", "Ph.D. Developmental Psychology", "20 Years Experience"]
        : ["소아청소년정신과 전문의", "발달심리학 박사", "20년 경력"],
      rating: 4.9, reviews: 127,
      experience: isEnglish ? "20 yrs" : "20년",
      availability: isEnglish ? "Weekdays 9-18" : "평일 9-18시",
      price: isEnglish ? "$120/50min" : "150,000원/50분",
      image: "/placeholder.svg",
      description: isEnglish 
        ? "Specializes in ADHD, autism spectrum, and language delay. Provides individualized treatment plans for optimal outcomes."
        : "아동 ADHD, 자폐스펙트럼, 언어발달지연 전문. 개별화된 치료 계획으로 최적의 결과를 제공합니다.",
      languages: isEnglish ? ["Korean", "English"] : ["한국어", "영어"],
      consultationTypes: isEnglish ? ["Video", "Phone", "In-person"] : ["화상상담", "전화상담", "방문상담"]
    },
    {
      id: "2",
      name: isEnglish ? "Prof. James Lee" : "이준호 교수",
      specialty: isEnglish ? "Speech-Language Pathologist" : "언어치료 전문가",
      credentials: isEnglish 
        ? ["Ph.D. Speech Pathology", "University Hospital Staff", "15 Years Experience"]
        : ["언어병리학 박사", "대학병원 재직", "15년 경력"],
      rating: 4.8, reviews: 89,
      experience: isEnglish ? "15 yrs" : "15년",
      availability: isEnglish ? "Weekdays 14-20" : "평일 14-20시",
      price: isEnglish ? "$95/50min" : "120,000원/50분",
      image: "/placeholder.svg",
      description: isEnglish 
        ? "Specializes in language delay, articulation disorders, and fluency disorders. Provides systematic evaluation and customized therapy."
        : "언어발달지연, 조음장애, 유창성장애 전문. 체계적인 평가와 맞춤형 치료를 제공합니다.",
      languages: isEnglish ? ["Korean"] : ["한국어"],
      consultationTypes: isEnglish ? ["Video", "In-person"] : ["화상상담", "방문상담"]
    },
    {
      id: "3",
      name: isEnglish ? "Dr. Min Park" : "박민정 원장",
      specialty: isEnglish ? "Behavior Analysis Specialist" : "행동분석 전문가",
      credentials: isEnglish 
        ? ["Ph.D. Applied Behavior Analysis", "BCBA Certified", "12 Years Experience"]
        : ["응용행동분석 박사", "ABA 국제자격증", "12년 경력"],
      rating: 4.9, reviews: 156,
      experience: isEnglish ? "12 yrs" : "12년",
      availability: isEnglish ? "Weekdays 10-19" : "평일 10-19시",
      price: isEnglish ? "$105/50min" : "130,000원/50분",
      image: "/placeholder.svg",
      description: isEnglish 
        ? "Specializes in autism spectrum, behavioral issues, and social development. Provides evidence-based intervention programs."
        : "자폐스펙트럼, 행동문제, 사회성 발달 전문. 과학적 근거 기반의 개입 프로그램을 제공합니다.",
      languages: isEnglish ? ["Korean", "English", "Japanese"] : ["한국어", "영어", "일본어"],
      consultationTypes: isEnglish ? ["Video", "Phone", "In-person"] : ["화상상담", "전화상담", "방문상담"]
    }
  ];

  const getConsultIcon = (type: string) => {
    if (type === "화상상담" || type === "Video") return <Video className="w-3 h-3 mr-1" />;
    if (type === "전화상담" || type === "Phone") return <MessageCircle className="w-3 h-3 mr-1" />;
    if (type === "방문상담" || type === "In-person") return <Calendar className="w-3 h-3 mr-1" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-primary animate-pulse-glow" />
            <h1 className="text-4xl font-bold text-brand-gradient">
              {isEnglish ? 'Expert Consultation' : '전문가 상담'}
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {isEnglish 
              ? 'Get accurate assessments and solutions through 1:1 consultations with verified experts'
              : '검증된 전문가들과 1:1 맞춤 상담으로 더 정확한 평가와 솔루션을 받아보세요'}
          </p>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 mb-8 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sparkles className="w-8 h-8 text-primary animate-pulse-glow" />
              <div>
                <h3 className="text-xl font-bold text-brand-gradient">
                  {isEnglish ? 'Access Expert Consultations with Premium' : '프리미엄 구독으로 전문가 상담 이용하기'}
                </h3>
                <p className="text-muted-foreground">
                  {isEnglish ? '1 free consultation/month + discounts + priority booking' : '월 1회 무료 상담 + 할인 혜택 + 우선 예약'}
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/token-subscription?source=expert-banner')} className="btn-brand">
              {isEnglish ? 'Subscribe' : '구독하기'}
            </Button>
          </div>
        </Card>

        <div className="mb-8"><MakeOneProjectBanner /></div>

        <div className="space-y-6">
          {mockExperts.map((expert) => (
            <Card key={expert.id} className="p-6 hover-glow">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-brand-gradient">{expert.name}</h3>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        <Award className="w-3 h-3 mr-1" />
                        {isEnglish ? 'Specialist' : '전문의'}
                      </Badge>
                    </div>
                    <p className="text-lg text-muted-foreground mb-2">{expert.specialty}</p>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{expert.rating}</span>
                        <span className="text-sm text-muted-foreground">({expert.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {expert.experience} {isEnglish ? '' : '경력'}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{expert.description}</p>
                  </div>
                </div>

                <div className="lg:w-1/3 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-primary">
                      {isEnglish ? 'Credentials' : '주요 자격'}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {expert.credentials.map((credential, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{credential}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-primary">
                      {isEnglish ? 'Consultation Types' : '상담 방식'}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {expert.consultationTypes.map((type, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {getConsultIcon(type)}
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{isEnglish ? 'Fee' : '상담료'}</span>
                      <span className="font-semibold text-primary">{expert.price}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">{isEnglish ? 'Available' : '예약 가능'}</span>
                      <span className="text-sm">{expert.availability}</span>
                    </div>
                    <Button onClick={() => navigate('/expert-hiring')} className="w-full btn-brand">
                      <Calendar className="w-4 h-4 mr-2" />
                      {isEnglish ? 'Book Consultation' : '상담 예약하기'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-12 p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <Crown className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse-glow" />
          <h3 className="text-2xl font-bold text-brand-gradient mb-4">
            {isEnglish ? 'Special Premium Benefits' : '프리미엄 구독의 특별한 혜택'}
          </h3>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>{isEnglish ? '1 free expert consultation/month' : '월 1회 무료 전문가 상담'}</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>{isEnglish ? '20% off consultation fees' : '상담료 20% 할인'}</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>{isEnglish ? 'Priority booking service' : '우선 예약 서비스'}</span>
            </div>
          </div>
          <Button onClick={() => navigate('/token-subscription?source=expert-bottom')} size="lg" className="btn-brand">
            <Sparkles className="w-5 h-5 mr-2" />
            {isEnglish ? 'Subscribe & Get Expert Consultation' : '지금 구독하고 전문가 상담 받기'}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ExpertList;
