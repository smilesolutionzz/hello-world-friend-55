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
  UserCheck,
  Phone,
  Globe,
  Medal,
  Target,
  TrendingUp
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: assessments } = await supabase
          .from('assessment_enhanced_analysis')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (assessments && assessments.length > 0) {
          const { data, error } = await supabase.functions.invoke('expert-matcher', {
            body: { 
              analysis: assessments[0].enhanced_analysis || '',
              ageGroup: assessments[0].assessment_type || 'adult',
              age: 25
            }
          });

          if (data && data.experts) {
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

      const expert = mockExperts.find(e => e.id === expertId);
      if (!expert) {
        toast.error('전문가를 찾을 수 없습니다.');
        return;
      }

      const { data: dbExpert } = await supabase
        .from('experts')
        .select('*')
        .eq('id', expertId)
        .single();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 커뮤니티 스타일 헤더 */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">AIHPRO 전문가 & 제휴기관</h1>
                  <p className="text-lg text-muted-foreground mt-2">
                    개인전문가부터 제휴기관까지, 당신에게 최적의 매칭을 제공합니다
                  </p>
                </div>
              </div>
            </div>
            
            {/* 통계 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">289</div>
                <div className="text-sm text-muted-foreground">인증 전문가</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">30+</div>
                <div className="text-sm text-muted-foreground">제휴 기관</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">95.8%</div>
                <div className="text-sm text-muted-foreground">만족도</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">2,847</div>
                <div className="text-sm text-muted-foreground">성공 매칭</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 탭 네비게이션 - 커뮤니티 스타일 */}
        <Tabs defaultValue="experts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="experts" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              개인 전문가
            </TabsTrigger>
            <TabsTrigger value="institutions" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              제휴 기관
            </TabsTrigger>
            <TabsTrigger value="ai-matching" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              AI 매칭
            </TabsTrigger>
          </TabsList>

          {/* AI 추천 전문가 탭 */}
          <TabsContent value="ai-matching" className="space-y-6">
            {isLoading ? (
              <Card className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>AI가 최적의 전문가를 찾고 있습니다...</p>
              </Card>
            ) : aiRecommendations.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiRecommendations.map((expert) => (
                  <Card key={expert.id} className="hover:shadow-lg transition-all duration-300 border-none shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={expert.image} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-lg font-bold">
                            {expert.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-800">{expert.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{expert.rating}</span>
                            {expert.aiMatchScore && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                                매칭도 {expert.aiMatchScore}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{expert.specialty.join(", ")}</p>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => handleConsultExpert(expert.id)}
                          className="w-full bg-primary hover:bg-primary/90"
                        >
                          즉시 상담하기
                        </Button>
                        <Button 
                          onClick={() => handleHireExpert(expert.id)}
                          variant="outline" 
                          className="w-full"
                        >
                          월간 계약하기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">AI 매칭을 위한 정보 수집</h3>
                <p className="text-muted-foreground mb-4">
                  먼저 검사를 받아보세요. AI가 검사 결과를 바탕으로 최적의 전문가를 추천해드립니다.
                </p>
                <Button onClick={() => navigate('/assessment')}>
                  검사 받으러 가기
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* 개인 전문가 탭 */}
          <TabsContent value="experts" className="space-y-6">
            {/* 검색 및 필터 */}
            <Card className="p-6 bg-white shadow-sm">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="전문가 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="전문 분야" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="아동발달">아동발달</SelectItem>
                    <SelectItem value="언어치료">언어치료</SelectItem>
                    <SelectItem value="심리상담">심리상담</SelectItem>
                    <SelectItem value="행동분석">행동분석</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="가격대" />
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
                    <SelectValue placeholder="지역" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="online">온라인</SelectItem>
                    <SelectItem value="서울">서울</SelectItem>
                    <SelectItem value="경기">경기</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* 전문가 목록 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperts.map((expert) => (
                <Card key={expert.id} className="hover:shadow-lg transition-all duration-300 border-none shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={expert.image} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-lg font-bold">
                          {expert.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800">{expert.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{expert.rating}</span>
                          <span className="text-sm text-muted-foreground">({expert.reviews})</span>
                          {expert.isOnline && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex flex-wrap gap-1">
                        {expert.specialty.map((spec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{expert.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>경력 {expert.experience}</span>
                        <span>월 {formatPrice(expert.monthlyPrice)}원</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        onClick={() => handleConsultExpert(expert.id)}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        즉시 상담하기
                      </Button>
                      <Button 
                        onClick={() => handleHireExpert(expert.id)}
                        variant="outline" 
                        className="w-full"
                      >
                        월간 계약하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 제휴기관 탭 */}
          <TabsContent value="institutions" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockInstitutions.slice(0, 30).map((institution) => (
                <Card key={institution.id} className="hover:shadow-lg transition-all duration-300 border-none shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-purple-100 p-3 rounded-lg shrink-0">
                        <Building className="w-8 h-8 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg text-gray-800 truncate">{institution.name}</h4>
                          <Badge className="bg-purple-100 text-purple-800 shrink-0">
                            <Shield className="w-3 h-3 mr-1" />
                            제휴기관
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {institution.address}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{institution.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            전문가 {institution.total_experts}명
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{institution.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {institution.services_offered.slice(0, 3).map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {institution.services_offered.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{institution.services_offered.length - 3}
                          </Badge>
                        )}
                      </div>
                      {institution.voucher_types && institution.voucher_types.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            바우처 지원
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        상담 예약하기
                      </Button>
                      <Button variant="outline" className="w-full">
                        기관 정보 보기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* 성공 사례 섹션 */}
        <Card className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 border-none shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">성공 매칭 사례</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                AIHPRO를 통해 전문가와 매칭된 후 긍정적인 변화를 경험한 실제 사례들을 확인해보세요
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-green-100 text-green-800">김</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">김○○ 님</div>
                      <div className="text-sm text-muted-foreground">5세 자녀 부모</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    "AIHPRO AI 추천으로 만난 언어치료사 선생님 덕분에 아이의 언어발달이 눈에 띄게 향상되었어요."
                  </p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-blue-100 text-blue-800">이</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">이○○ 님</div>
                      <div className="text-sm text-muted-foreground">청소년 자녀 부모</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    "제휴기관을 통해 체계적인 심리상담을 받을 수 있었고, 바우처 지원으로 경제적 부담도 줄었습니다."
                  </p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-purple-100 text-purple-800">박</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">박○○ 님</div>
                      <div className="text-sm text-muted-foreground">성인 내담자</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    "AI 분석 결과를 바탕으로 매칭된 전문가와 정기 상담을 통해 업무 스트레스를 효과적으로 관리하고 있어요."
                  </p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpertHiring;