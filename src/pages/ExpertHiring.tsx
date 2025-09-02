import React, { useState, useEffect } from "react";
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { mockInstitutions } from '@/data/mockInstitutions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  MapPin,
  Building,
  UserCheck
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
    id: '1',
    name: '김미영',
    specialty: ['아동발달', '언어치료'],
    credentials: ['아동발달 전문의', '언어재활사 1급'],
    rating: 4.9,
    reviews: 156,
    experience: '12년',
    availability: '평일 9-18시',
    monthlyPrice: 120000,
    hourlyPrice: 30000,
    image: '/api/placeholder/150/150',
    description: '12년간 아동발달센터에서 근무하며 수백 명의 아이들을 치료해온 경험이 있습니다.',
    languages: ['한국어'],
    consultationTypes: ['화상상담', '방문상담'],
    monthlyServices: [
      '주 2회 개별 상담 (월 8회)',
      '월 1회 부모 상담',
      '발달 평가 및 리포트',
      '24시간 긴급 상담 지원'
    ],
    portfolio: {
      cases: 450,
      successRate: 92,
      specializations: ['아동발달', '언어치료', '발달평가']
    },
    location: '서울 강남구',
    isOnline: true,
    responseTime: '평균 2시간 이내'
  },
  {
    id: '2',
    name: '박상훈',
    specialty: ['행동분석', '자폐스펙트럼'],
    credentials: ['BCBA 자격증', '행동분석사'],
    rating: 4.8,
    reviews: 89,
    experience: '8년',
    availability: '평일 10-19시',
    monthlyPrice: 95000,
    hourlyPrice: 25000,
    image: '/api/placeholder/150/150',
    description: 'ABA 치료 전문가로 자폐스펙트럼 아동의 행동 개선에 특화되어 있습니다.',
    languages: ['한국어'],
    consultationTypes: ['화상상담', '방문상담'],
    monthlyServices: [
      '주 3회 ABA 치료 (월 12회)',
      '행동 목표 설정 및 관리',
      '가족 교육 프로그램',
      '진전 상황 월간 리포트'
    ],
    portfolio: {
      cases: 280,
      successRate: 94,
      specializations: ['ABA 치료', '행동분석', '자폐스펙트럼']
    },
    location: '경기 성남시',
    isOnline: true,
    responseTime: '평균 1시간 이내'
  },
  {
    id: '3',
    name: '이정아',
    specialty: ['언어치료', '발음교정'],
    credentials: ['1급 언어재활사'],
    rating: 4.7,
    reviews: 124,
    experience: '6년',
    availability: '평일 14-20시',
    monthlyPrice: 85000,
    hourlyPrice: 22000,
    image: '/api/placeholder/150/150',
    description: '언어발달지연 아동의 언어능력 향상을 위한 맞춤형 치료를 제공합니다.',
    languages: ['한국어'],
    consultationTypes: ['화상상담', '방문상담'],
    monthlyServices: [
      '주 2회 언어치료 (월 8회)',
      '발음 교정 및 언어 자극',
      '부모 가정지도 교육',
      '언어발달 평가서 제공'
    ],
    portfolio: {
      cases: 320,
      successRate: 88,
      specializations: ['언어치료', '발음교정', '언어발달']
    },
    location: '서울 마포구',
    isOnline: false,
    responseTime: '평균 4시간 이내'
  },
  {
    id: '4',
    name: '박하진',
    specialty: ['청소년상담', '심리상담'],
    credentials: ['청소년상담사 1급', '상담심리사'],
    rating: 4.9,
    reviews: 78,
    experience: '10년',
    availability: '평일 16-22시, 주말 가능',
    monthlyPrice: 110000,
    hourlyPrice: 28000,
    image: '/api/placeholder/150/150',
    description: '청소년기 정서적 어려움과 학업 스트레스 상담을 전문으로 합니다.',
    languages: ['한국어'],
    consultationTypes: ['화상상담', '전화상담'],
    monthlyServices: [
      '주 1회 개별 상담 (월 4회)',
      '위기 상황 24시간 대응',
      '부모-자녀 관계 개선 상담',
      '학업 동기 향상 프로그램'
    ],
    portfolio: {
      cases: 180,
      successRate: 86,
      specializations: ['청소년 상담', '학교적응', '심리상담']
    },
    location: '온라인 전용',
    isOnline: true,
    responseTime: '평균 30분 이내'
  },
  {
    id: '5',
    name: '강은미',
    specialty: ['심리상담', '심리평가'],
    credentials: ['임상심리사 1급'],
    rating: 4.8,
    reviews: 203,
    experience: '14년',
    availability: '평일 9-17시',
    monthlyPrice: 135000,
    hourlyPrice: 34000,
    image: '/api/placeholder/150/150',
    description: '아동 및 청소년의 심리적 어려움을 전문적으로 평가하고 치료합니다.',
    languages: ['한국어'],
    consultationTypes: ['화상상담', '방문상담'],
    monthlyServices: [
      '주 1회 심리상담 (월 4회)',
      '심리검사 및 평가',
      '가족 상담 프로그램',
      '정신건강 관리 가이드'
    ],
    portfolio: {
      cases: 420,
      successRate: 91,
      specializations: ['심리평가', 'ADHD', '우울증', '불안장애']
    },
    location: '서울 서초구',
    isOnline: true,
    responseTime: '평균 3시간 이내'
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

    if (specialtyFilter && specialtyFilter !== "all") {
      filtered = filtered.filter(expert =>
        expert.specialty.some(s => s.includes(specialtyFilter))
      );
    }

    if (priceFilter && priceFilter !== "all") {
      if (priceFilter === "low") {
        filtered = filtered.filter(expert => expert.monthlyPrice <= 150000);
      } else if (priceFilter === "medium") {
        filtered = filtered.filter(expert => expert.monthlyPrice > 150000 && expert.monthlyPrice <= 250000);
      } else if (priceFilter === "high") {
        filtered = filtered.filter(expert => expert.monthlyPrice > 250000);
      }
    }

    if (locationFilter && locationFilter !== "all") {
      if (locationFilter === "online") {
        filtered = filtered.filter(expert => expert.isOnline);
      } else {
        filtered = filtered.filter(expert => expert.location.includes(locationFilter));
      }
    }

    setFilteredExperts(filtered);
  }, [searchTerm, specialtyFilter, priceFilter, locationFilter, experts]);

  const handleHireExpert = (expertId: string) => {
    navigate(`/expert-contract/${expertId}`);
  };

  const handleConsultExpert = async (expertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다.');
        navigate('/auth');
        return;
      }

      // 전문가 정보 가져오기
      const expert = mockExperts.find(e => e.id === expertId);
      if (!expert) {
        toast.error('전문가를 찾을 수 없습니다.');
        return;
      }

      // 실제 DB에서 전문가 찾기 (실제 전문가 데이터가 있다면)
      const { data: dbExpert } = await supabase
        .from('experts')
        .select('*')
        .eq('id', expertId)
        .single();

      // 상담 요청 생성
      const consultationData = {
        user_id: user.id,
        expert_id: dbExpert?.id || expertId,
        consultation_type: 'text',
        status: 'pending',
        price: expert.hourlyPrice,
        scheduled_at: new Date().toISOString()
      };

      const { data: consultation, error } = await supabase
        .from('consultations')
        .insert(consultationData)
        .select()
        .single();

      if (error) {
        console.error('상담 생성 오류:', error);
        toast.error('상담 요청 중 오류가 발생했습니다.');
        return;
      }

      // 채팅방 생성
      const { data: chatRoom, error: chatError } = await supabase
        .from('chat_rooms')
        .insert({
          user_id: user.id,
          expert_id: dbExpert?.id || expertId,
          status: 'active'
        })
        .select()
        .single();

      if (chatError) {
        console.error('채팅방 생성 오류:', chatError);
        toast.error('채팅방 생성 중 오류가 발생했습니다.');
        return;
      }

      toast.success(`${expert.name} 전문가와의 상담이 시작됩니다.`);
      navigate(`/consultation/${chatRoom.id}`);
    } catch (error) {
      console.error('상담 시작 오류:', error);
      toast.error('상담 시작 중 오류가 발생했습니다.');
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-3xl blur-xl"></div>
          <div className="relative z-10 bg-card/80 backdrop-blur-sm rounded-3xl p-8 border shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-full animate-pulse">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-5xl font-black text-foreground drop-shadow-sm">
                전문가 & 기관 매칭
              </h1>
              <div className="p-2 bg-secondary/10 rounded-full animate-pulse">
                <Building className="w-8 h-8 text-secondary" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                🤖 AI 맞춤 추천 × 🧑‍⚕️ 개인전문가 × 🏥 제휴기관
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                개인전문가부터 제휴기관까지 당신에게 최적의 선택지를 제공합니다
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Badge variant="secondary" className="px-4 py-2 bg-green-100 text-green-700">
                  📍 개인전문가
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 bg-blue-100 text-blue-700">
                  🏥 제휴기관
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 bg-purple-100 text-purple-700">
                  🎫 AI 맞춤 추천
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* AI 추천 전문가 섹션 */}
        {aiRecommendations.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Sparkles className="w-6 h-6" />
                AI 맞춤 추천 전문가
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiRecommendations.slice(0, 3).map((expert) => (
                  <Card key={expert.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={expert.image} />
                          <AvatarFallback>{expert.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{expert.name}</h4>
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
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleConsultExpert(expert.id)}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          바로 상담하기
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full"
                          onClick={() => handleHireExpert(expert.id)}
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          상세보기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 탭 메뉴 - 개인전문가 vs 제휴기관 */}
        <Tabs defaultValue="experts" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="experts" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              개인전문가
            </TabsTrigger>
            <TabsTrigger value="institutions" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              제휴기관
            </TabsTrigger>
          </TabsList>

          <TabsContent value="experts" className="space-y-6">
            {/* 검색 및 필터 */}
            <Card>
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
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="아동발달">아동발달</SelectItem>
                      <SelectItem value="언어치료">언어치료</SelectItem>
                      <SelectItem value="행동분석">행동분석</SelectItem>
                      <SelectItem value="청소년상담">청소년상담</SelectItem>
                      <SelectItem value="심리상담">심리상담</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="가격대 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="low">15만원 이하</SelectItem>
                      <SelectItem value="medium">15-25만원</SelectItem>
                      <SelectItem value="high">25만원 이상</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="지역 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="online">온라인 전용</SelectItem>
                      <SelectItem value="서울">서울</SelectItem>
                      <SelectItem value="경기">경기</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 개인전문가 리스트 */}
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
                                 {expert.credentials[0]}
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
                          
                          <div className="space-y-2">
                            <Button 
                              onClick={() => handleConsultExpert(expert.id)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              바로 상담하기
                            </Button>
                            
                            <Button 
                              onClick={() => handleHireExpert(expert.id)}
                              variant="outline"
                              className="w-full"
                            >
                              <Crown className="w-4 h-4 mr-2" />
                              전문가 고용하기
                            </Button>
                          </div>
                          
                          <div className="text-xs text-muted-foreground mt-2">
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
          </TabsContent>

          <TabsContent value="institutions" className="space-y-6">
            {/* 제휴기관 안내 */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Building className="w-6 h-6" />
                  전국 제휴기관 네트워크
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 mb-4">
                  검증된 전문기관들과 제휴하여 더욱 체계적이고 전문적인 서비스를 제공합니다.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{mockInstitutions.length}+</div>
                    <div className="text-sm text-green-700">제휴기관</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">200+</div>
                    <div className="text-sm text-green-700">소속전문가</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">95%</div>
                    <div className="text-sm text-green-700">만족도</div>
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Building className="w-4 h-4 mr-2" />
                  제휴기관 전체보기
                </Button>
              </CardContent>
            </Card>

            {/* 제휴기관 리스트 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockInstitutions.map((institution) => (
                <Card key={institution.id} className="overflow-hidden hover-glow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{institution.name}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{institution.rating}</span>
                          <span className="text-xs text-muted-foreground">({institution.review_count})</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {institution.institution_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">{institution.address}</span>
                    </div>

                    {/* 전문분야 */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-primary">전문분야</h4>
                      <div className="flex flex-wrap gap-1">
                        {institution.specializations?.slice(0, 3).map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {institution.specializations && institution.specializations.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{institution.specializations.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* 사용가능한 바우처 */}
                    {institution.voucher_types && institution.voucher_types.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-secondary">사용가능한 바우처</h4>
                        <div className="space-y-1">
                          {institution.voucher_types.map((voucher, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-700 font-medium">{voucher}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 제공 서비스 */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-primary">제공 서비스</h4>
                      <div className="space-y-1">
                        {institution.services_offered?.slice(0, 3).map((service, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-blue-500" />
                            <span className="text-xs">{service}</span>
                          </div>
                        ))}
                        {institution.services_offered && institution.services_offered.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            외 {institution.services_offered.length - 3}개 서비스
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 연락처 */}
                    <div className="pt-3 border-t">
                      {institution.phone && (
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs">{institution.phone}</span>
                        </div>
                      )}
                      {institution.operating_hours && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                           <span className="text-xs text-muted-foreground">
                             운영시간: {typeof institution.operating_hours === 'object' ? institution.operating_hours.monday || '평일 9-18시' : '평일 9-18시'}
                           </span>
                        </div>
                      )}
                    </div>

                    <Button variant="outline" className="w-full mt-4">
                      기관 상세보기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* 개인전문가 vs 기관 비교 */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              <div className="flex items-center justify-center gap-3">
                <Heart className="w-6 h-6 text-pink-500" />
                개인전문가 vs 기관
                <Building className="w-6 h-6 text-blue-500" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-pink-600">
                  <UserCheck className="w-5 h-5" />
                  개인 전문가
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">1:1 맞춤형 상담</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">유연한 스케줄 조정</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">다양한 전문가 선택</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">지속적인 관계 형성</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-600">
                  <Building className="w-5 h-5" />
                  제휴기관
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">종합적 팀케어 지원</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">다학제 협력 치료</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">바우처 사용 가능</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">체계적 프로그램 운영</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpertHiring;