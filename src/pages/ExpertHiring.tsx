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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/40 font-korean">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 헤더 섹션 */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 via-blue-100/50 to-green-100/50 rounded-[2.5rem] blur-2xl"></div>
          <div className="relative z-10 bg-white/60 backdrop-blur-lg rounded-[2rem] p-12 border border-white/40 shadow-2xl">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl animate-pulse shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-gray-800 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
                전문가 & 기관 매칭
              </h1>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl animate-pulse shadow-lg">
                <Building className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-800 leading-relaxed">
                <span className="text-purple-600">🤖 AI 맞춤 추천</span> × 
                <span className="text-blue-600"> 🧑‍⚕️ 개인전문가</span> × 
                <span className="text-green-600"> 🏥 제휴기관</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                개인전문가부터 제휴기관까지 당신에게 최적의 선택지를 제공합니다
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Badge className="px-6 py-3 text-base bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                  📍 개인전문가
                </Badge>
                <Badge className="px-6 py-3 text-base bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
                  🏥 제휴기관
                </Badge>
                <Badge className="px-6 py-3 text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                  🎯 AI 맞춤 추천
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* AI 추천 전문가 섹션 */}
        {aiRecommendations.length > 0 && (
          <Card className="mb-12 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border-purple-200/50 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <Sparkles className="w-8 h-8" />
                AI 맞춤 추천 전문가
                <Badge className="bg-white/20 text-white border-white/30">
                  최적 매칭
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiRecommendations.slice(0, 3).map((expert) => (
                  <Card key={expert.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-16 h-16 ring-4 ring-purple-100">
                          <AvatarImage src={expert.image} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-lg font-bold">
                            {expert.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-800">{expert.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{expert.rating}</span>
                            {expert.aiMatchScore && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                                매칭도 {expert.aiMatchScore}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{expert.specialty.join(", ")}</p>
                      <div className="space-y-3">
                        <Button 
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg h-12 font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                          onClick={() => handleConsultExpert(expert.id)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          바로 상담하기
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full border-2 border-purple-300 bg-white text-purple-600 hover:bg-purple-50 hover:border-purple-400 h-12 font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                          onClick={() => handleHireExpert(expert.id)}
                        >
                          <Crown className="w-4 h-4 mr-2" />
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

        {/* 탭 메뉴 */}
        <Tabs defaultValue="experts" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-white/40 shadow-lg rounded-2xl p-2">
            <TabsTrigger 
              value="experts" 
              className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-lg font-semibold py-4 rounded-xl transition-all duration-300"
            >
              <UserCheck className="w-5 h-5" />
              개인전문가
            </TabsTrigger>
            <TabsTrigger 
              value="institutions" 
              className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-lg font-semibold py-4 rounded-xl transition-all duration-300"
            >
              <Building className="w-5 h-5" />
              제휴기관
            </TabsTrigger>
          </TabsList>

          <TabsContent value="experts" className="space-y-8 mt-8">
            {/* 검색 및 필터 */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/40 shadow-xl">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="전문가 이름이나 전문분야 검색"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 border-gray-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl text-base"
                    />
                  </div>
                  
                  <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl text-base">
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
                    <SelectTrigger className="h-12 border-gray-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl text-base">
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
                    <SelectTrigger className="h-12 border-gray-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl text-base">
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
            <div className="space-y-8">
              {filteredExperts.map((expert) => (
                <Card key={expert.id} className="overflow-hidden hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm border border-white/50">
                  <CardContent className="p-8">
                    <div className="grid lg:grid-cols-12 gap-8">
                      {/* 전문가 기본 정보 */}
                      <div className="lg:col-span-4">
                        <div className="flex items-start gap-5">
                          <Avatar className="w-24 h-24 ring-4 ring-purple-100 shadow-lg">
                            <AvatarImage src={expert.image} />
                            <AvatarFallback className="text-xl bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold">
                              {expert.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-purple-600 bg-clip-text text-transparent">
                                {expert.name}
                              </h3>
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                                <Award className="w-3 h-3 mr-1" />
                                {expert.credentials[0]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-6 mb-4">
                              <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold text-lg">{expert.rating}</span>
                                <span className="text-gray-500">({expert.reviews})</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4" />
                                {expert.experience} 경력
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{expert.location}</span>
                              {expert.isOnline && (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  <Globe className="w-3 h-3 mr-1" />
                                  온라인 가능
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {expert.specialty.map((spec, index) => (
                                <Badge key={index} className="bg-blue-100 text-blue-700 border-blue-200">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 포트폴리오 */}
                      <div className="lg:col-span-3">
                        <h4 className="font-bold text-lg mb-4 text-purple-600 flex items-center gap-2">
                          <Medal className="w-5 h-5" />
                          포트폴리오
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">상담 케이스</span>
                            <span className="font-bold text-lg text-purple-600">{expert.portfolio.cases}건</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                            <span className="text-gray-600">성공률</span>
                            <span className="font-bold text-lg text-green-600">{expert.portfolio.successRate}%</span>
                          </div>
                          <div className="space-y-2">
                            <span className="text-gray-600 text-sm">주요 전문영역:</span>
                            <div className="flex flex-wrap gap-1">
                              {expert.portfolio.specializations.map((spec, index) => (
                                <Badge key={index} className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 월간 서비스 */}
                      <div className="lg:col-span-3">
                        <h4 className="font-bold text-lg mb-4 text-blue-600 flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          월간 서비스 포함사항
                        </h4>
                        <div className="space-y-3">
                          {expert.monthlyServices.map((service, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-gray-700 leading-relaxed">{service}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-gray-600 bg-blue-50 p-3 rounded-xl">
                            <Zap className="w-4 h-4 text-blue-500" />
                            응답시간: {expert.responseTime}
                          </div>
                        </div>
                      </div>

                      {/* 가격 및 예약 */}
                      <div className="lg:col-span-2">
                        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-6 text-center border border-purple-200 shadow-lg">
                          <div className="mb-6">
                            <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                              월 {formatPrice(expert.monthlyPrice)}원
                            </div>
                            <div className="text-gray-600 font-semibold">
                              시간당 {formatPrice(expert.hourlyPrice)}원
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap justify-center gap-2 mb-6">
                            {expert.consultationTypes.map((type, index) => (
                              <Badge key={index} className="bg-white/80 text-gray-700 border-gray-200">
                                {type === "화상상담" && <Video className="w-3 h-3 mr-1" />}
                                {type === "전화상담" && <Phone className="w-3 h-3 mr-1" />}
                                {type === "방문상담" && <Calendar className="w-3 h-3 mr-1" />}
                                {type}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="space-y-3">
                            <Button 
                              onClick={() => handleConsultExpert(expert.id)}
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg h-14 text-base font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                            >
                              <MessageCircle className="w-5 h-5 mr-2" />
                              바로 상담하기
                            </Button>
                            
                            <Button 
                              onClick={() => handleHireExpert(expert.id)}
                              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg h-14 text-base font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                            >
                              <Crown className="w-5 h-5 mr-2" />
                              전문가 고용하기
                            </Button>
                          </div>
                          
                          <div className="text-sm text-gray-600 mt-4 p-3 bg-white/60 backdrop-blur-sm rounded-xl font-medium border border-gray-200">
                            📅 {expert.availability}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 전문가 설명 */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed text-lg">{expert.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="institutions" className="space-y-8 mt-8">
            {/* 제휴기관 안내 */}
            <Card className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-green-200/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                  <Building className="w-8 h-8" />
                  전국 제휴기관 네트워크
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  검증된 전문기관들과 제휴하여 더욱 체계적이고 전문적인 서비스를 제공합니다.
                </p>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-white/80 rounded-2xl shadow-lg">
                    <div className="text-4xl font-black text-green-600 mb-2">{mockInstitutions.length}+</div>
                    <div className="text-gray-700 font-semibold">제휴기관</div>
                  </div>
                  <div className="text-center p-6 bg-white/80 rounded-2xl shadow-lg">
                    <div className="text-4xl font-black text-blue-600 mb-2">200+</div>
                    <div className="text-gray-700 font-semibold">소속전문가</div>
                  </div>
                  <div className="text-center p-6 bg-white/80 rounded-2xl shadow-lg">
                    <div className="text-4xl font-black text-purple-600 mb-2">95%</div>
                    <div className="text-gray-700 font-semibold">만족도</div>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0 shadow-lg h-14 text-lg font-semibold"
                  onClick={() => navigate('/institutions')}
                >
                  <Building className="w-5 h-5 mr-3" />
                  제휴기관 전체보기
                </Button>
              </CardContent>
            </Card>

            {/* 지역별 제휴기관 간단 안내 */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                  <MapPin className="w-6 h-6 text-purple-600" />
                  지역별 제휴기관 안내
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {['서울', '부산', '대구', '인천', '광주', '대전', '경기', '기타'].map((region) => (
                    <Button
                      key={region}
                      variant="outline"
                      className="h-12 text-base font-semibold border-gray-200 hover:bg-purple-50 hover:border-purple-300"
                      onClick={() => navigate('/institutions')}
                    >
                      {region} 지역
                    </Button>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    전국 주요 도시의 전문 기관들과 제휴하고 있습니다
                  </p>
                  <Button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg"
                    onClick={() => navigate('/institutions')}
                  >
                    전체 제휴기관 보기
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ExpertHiring;