import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Star, 
  Award, 
  Calendar, 
  Clock, 
  Users, 
  MessageCircle, 
  Video,
  CheckCircle,
  Crown,
  Sparkles,
  Search,
  Filter,
  Brain,
  Heart,
  Shield,
  Zap,
  ChevronRight,
  MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Expert {
  id: string;
  name: string;
  specialty: string[];
  credentials: string[];
  rating: number;
  reviews: number;
  experience: string;
  availability: string;
  monthlyPrice: number;
  hourlyPrice: number;
  image: string;
  description: string;
  languages: string[];
  consultationTypes: string[];
  monthlyServices: string[];
  portfolio: {
    cases: number;
    successRate: number;
    specializations: string[];
  };
  location: string;
  isOnline: boolean;
  responseTime: string;
  aiMatchScore?: number;
}

const mockExperts: Expert[] = [
  {
    id: "1",
    name: "김소연 박사",
    specialty: ["아동발달심리", "ADHD", "자폐스펙트럼"],
    credentials: ["소아청소년정신과 전문의", "발달심리학 박사", "20년 경력"],
    rating: 4.9,
    reviews: 127,
    experience: "20년",
    availability: "평일 9-18시",
    monthlyPrice: 600000,
    hourlyPrice: 150000,
    image: "/placeholder.svg",
    description: "아동 ADHD, 자폐스펙트럼, 언어발달지연 전문. 개별화된 치료 계획으로 최적의 결과를 제공합니다.",
    languages: ["한국어", "영어"],
    consultationTypes: ["화상상담", "전화상담", "방문상담"],
    monthlyServices: ["주 1회 정기상담 (4회)", "24시간 응급상담", "맞춤 치료계획 수립", "진행상황 보고서"],
    portfolio: {
      cases: 450,
      successRate: 92,
      specializations: ["ADHD 치료", "자폐스펙트럼 개입", "언어발달 치료"]
    },
    location: "서울 강남구",
    isOnline: true,
    responseTime: "평균 2시간 이내"
  },
  {
    id: "2",
    name: "이준호 교수",
    specialty: ["언어치료", "조음장애", "유창성장애"],
    credentials: ["언어병리학 박사", "대학병원 재직", "15년 경력"],
    rating: 4.8,
    reviews: 89,
    experience: "15년",
    availability: "평일 14-20시",
    monthlyPrice: 480000,
    hourlyPrice: 120000,
    image: "/placeholder.svg",
    description: "언어발달지연, 조음장애, 유창성장애 전문. 체계적인 평가와 맞춤형 치료를 제공합니다.",
    languages: ["한국어"],
    consultationTypes: ["화상상담", "방문상담"],
    monthlyServices: ["주 1회 정기상담 (4회)", "일일 언어 과제 제공", "보호자 교육", "월말 평가보고서"],
    portfolio: {
      cases: 320,
      successRate: 88,
      specializations: ["조음치료", "언어발달 촉진", "유창성 개선"]
    },
    location: "서울 서초구",
    isOnline: true,
    responseTime: "평균 4시간 이내"
  },
  {
    id: "3",
    name: "박민정 원장",
    specialty: ["행동분석", "자폐스펙트럼", "사회성발달"],
    credentials: ["응용행동분석 박사", "ABA 국제자격증", "12년 경력"],
    rating: 4.9,
    reviews: 156,
    experience: "12년",
    availability: "평일 10-19시",
    monthlyPrice: 520000,
    hourlyPrice: 130000,
    image: "/placeholder.svg",
    description: "자폐스펙트럼, 행동문제, 사회성 발달 전문. 과학적 근거 기반의 개입 프로그램을 제공합니다.",
    languages: ["한국어", "영어", "일본어"],
    consultationTypes: ["화상상담", "전화상담", "방문상담"],
    monthlyServices: ["주 1회 정기상담 (4회)", "행동계획 수립", "가족 코칭", "월 2회 진도체크"],
    portfolio: {
      cases: 280,
      successRate: 94,
      specializations: ["ABA 치료", "사회성 훈련", "행동수정"]
    },
    location: "경기 성남시",
    isOnline: true,
    responseTime: "평균 1시간 이내"
  },
  {
    id: "4",
    name: "최영수 상담사",
    specialty: ["청소년상담", "우울증", "불안장애"],
    credentials: ["상담심리학 석사", "청소년상담사 1급", "8년 경력"],
    rating: 4.7,
    reviews: 203,
    experience: "8년",
    availability: "평일 16-22시, 주말 가능",
    monthlyPrice: 400000,
    hourlyPrice: 100000,
    image: "/placeholder.svg",
    description: "청소년 우울, 불안, 학교적응 문제 전문. 청소년의 눈높이에 맞춘 상담으로 호평받고 있습니다.",
    languages: ["한국어"],
    consultationTypes: ["화상상담", "전화상담"],
    monthlyServices: ["주 1회 정기상담 (4회)", "일일 감정체크", "학습코칭", "가족상담 월 1회"],
    portfolio: {
      cases: 180,
      successRate: 86,
      specializations: ["청소년 상담", "학교적응", "우울증 치료"]
    },
    location: "온라인 전용",
    isOnline: true,
    responseTime: "평균 30분 이내"
  }
];

const ExpertHiring = () => {
  const navigate = useNavigate();
  const [experts, setExperts] = useState<Expert[]>(mockExperts);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>(mockExperts);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Expert[]>([]);

  // AI 추천 전문가 가져오기
  const getAIRecommendations = async () => {
    setIsLoading(true);
    try {
      // 사용자의 최근 검사 결과를 기반으로 AI 추천
        const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: assessments } = await supabase
          .from('assessment_enhanced_analysis')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (assessments && assessments.length > 0) {
          // AI 전문가 매칭 호출
          const { data, error } = await supabase.functions.invoke('expert-matcher', {
            body: { 
              analysis: assessments[0].enhanced_analysis || '',
              ageGroup: assessments[0].assessment_type || 'adult',
              age: 25
            }
          });

          if (data && data.experts) {
            // 추천 점수와 함께 전문가 설정
            const recommendedExperts = mockExperts
              .filter((expert: Expert) => data.experts.some((rec: any) => rec.id === expert.id))
              .map((expert: Expert) => {
                const recommendation = data.experts.find((rec: any) => rec.id === expert.id);
                return {
                  ...expert,
                  aiMatchScore: recommendation?.match_score || 0
                };
              })
              .sort((a: Expert, b: Expert) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0));

            setAiRecommendations(recommendedExperts);
          }
        }
      }
    } catch (error) {
      console.error('AI 추천 오류:', error);
      toast.error('AI 추천을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAIRecommendations();
  }, []);

  // 필터링 로직
  useEffect(() => {
    let filtered = experts;

    if (searchTerm) {
      filtered = filtered.filter(expert =>
        expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.specialty.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        expert.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (specialtyFilter) {
      filtered = filtered.filter(expert =>
        expert.specialty.some(s => s.includes(specialtyFilter))
      );
    }

    if (priceFilter) {
      if (priceFilter === "low") {
        filtered = filtered.filter(expert => expert.monthlyPrice <= 400000);
      } else if (priceFilter === "medium") {
        filtered = filtered.filter(expert => expert.monthlyPrice > 400000 && expert.monthlyPrice <= 600000);
      } else if (priceFilter === "high") {
        filtered = filtered.filter(expert => expert.monthlyPrice > 600000);
      }
    }

    if (locationFilter) {
      if (locationFilter === "online") {
        filtered = filtered.filter(expert => expert.isOnline);
      } else {
        filtered = filtered.filter(expert => expert.location.includes(locationFilter));
      }
    }

    setFilteredExperts(filtered);
  }, [searchTerm, specialtyFilter, priceFilter, locationFilter, experts]);

  const handleHireExpert = (expertId: string) => {
    navigate(`/token-subscription?source=expert-hiring&expertId=${expertId}`);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-primary animate-pulse-glow" />
            <h1 className="text-4xl font-bold text-brand-gradient">전문가 고용</h1>
            <Brain className="w-8 h-8 text-secondary animate-pulse-glow" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            AI가 추천하는 맞춤형 전문가와 함께 체계적이고 지속적인 상담을 받아보세요
          </p>
        </div>

        {/* AI 추천 섹션 */}
        {aiRecommendations.length > 0 && (
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Sparkles className="w-6 h-6 animate-pulse-glow" />
                AI 맞춤 추천 전문가
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiRecommendations.slice(0, 3).map((expert) => (
                  <Card key={expert.id} className="bg-white/70 border-purple-300 hover-glow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={expert.image} />
                          <AvatarFallback>{expert.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-purple-800">{expert.name}</h4>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{expert.rating}</span>
                            {expert.aiMatchScore && (
                              <Badge className="ml-2 bg-purple-500">
                                매칭도 {expert.aiMatchScore}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{expert.specialty.join(", ")}</p>
                      <Button 
                        size="sm" 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => handleHireExpert(expert.id)}
                      >
                        상세보기
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 검색 및 필터 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="전문가 이름이나 전문분야 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="전문분야 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  <SelectItem value="아동발달">아동발달</SelectItem>
                  <SelectItem value="언어치료">언어치료</SelectItem>
                  <SelectItem value="행동분석">행동분석</SelectItem>
                  <SelectItem value="청소년상담">청소년상담</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="가격대 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  <SelectItem value="low">40만원 이하</SelectItem>
                  <SelectItem value="medium">40-60만원</SelectItem>
                  <SelectItem value="high">60만원 이상</SelectItem>
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  <SelectItem value="online">온라인 전용</SelectItem>
                  <SelectItem value="서울">서울</SelectItem>
                  <SelectItem value="경기">경기</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 전문가 리스트 */}
        <div className="space-y-6">
          {filteredExperts.map((expert) => (
            <Card key={expert.id} className="overflow-hidden hover-glow">
              <CardContent className="p-6">
                <div className="grid lg:grid-cols-12 gap-6">
                  {/* 전문가 기본 정보 */}
                  <div className="lg:col-span-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={expert.image} />
                        <AvatarFallback className="text-lg">{expert.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-brand-gradient">{expert.name}</h3>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            <Award className="w-3 h-3 mr-1" />
                            전문의
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{expert.rating}</span>
                            <span className="text-sm text-muted-foreground">({expert.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {expert.experience} 경력
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{expert.location}</span>
                          {expert.isOnline && <Badge variant="outline">온라인 가능</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {expert.specialty.map((spec, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 포트폴리오 */}
                  <div className="lg:col-span-3">
                    <h4 className="font-semibold mb-3 text-primary">포트폴리오</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>상담 케이스</span>
                        <span className="font-semibold">{expert.portfolio.cases}건</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>성공률</span>
                        <span className="font-semibold text-green-600">{expert.portfolio.successRate}%</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">주요 전문영역:</span>
                        <div className="mt-1">
                          {expert.portfolio.specializations.map((spec, index) => (
                            <Badge key={index} variant="secondary" className="mr-1 mb-1 text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 월간 서비스 */}
                  <div className="lg:col-span-3">
                    <h4 className="font-semibold mb-3 text-primary">월간 서비스 포함사항</h4>
                    <div className="space-y-2">
                      {expert.monthlyServices.map((service, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-sm">{service}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Zap className="w-4 h-4" />
                        응답시간: {expert.responseTime}
                      </div>
                    </div>
                  </div>

                  {/* 가격 및 예약 */}
                  <div className="lg:col-span-2">
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-primary mb-1">
                          월 {formatPrice(expert.monthlyPrice)}원
                        </div>
                        <div className="text-sm text-muted-foreground">
                          시간당 {formatPrice(expert.hourlyPrice)}원
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {expert.consultationTypes.map((type, index) => (
                          <Badge key={index} variant="secondary" className="text-xs mr-1">
                            {type === "화상상담" && <Video className="w-3 h-3 mr-1" />}
                            {type === "전화상담" && <MessageCircle className="w-3 h-3 mr-1" />}
                            {type === "방문상담" && <Calendar className="w-3 h-3 mr-1" />}
                            {type}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button 
                        onClick={() => handleHireExpert(expert.id)}
                        className="w-full btn-brand mb-2"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        전문가 고용하기
                      </Button>
                      
                      <div className="text-xs text-muted-foreground">
                        {expert.availability}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 전문가 설명 */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">{expert.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 구독 혜택 안내 */}
        <Card className="mt-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-brand-gradient mb-4">안전하고 신뢰할 수 있는 전문가 고용</h3>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>검증된 자격증 보유</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>100% 환불 보장</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>24시간 고객지원</span>
              </div>
            </div>
            <Button 
              size="lg"
              className="btn-brand"
              onClick={() => navigate('/token-subscription')}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              지금 구독하고 전문가와 상담하기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpertHiring;