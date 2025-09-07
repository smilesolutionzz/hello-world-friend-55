import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InstitutionCard } from "@/components/institutions/InstitutionCard";
import { InstitutionFilters } from "@/components/institutions/InstitutionFilters";
import { InstitutionMap } from "@/components/institutions/InstitutionMap";
import { RegionalInstitutionView } from "@/components/institutions/RegionalInstitutionView";
import { InstitutionExpertManagement } from "@/components/institution/InstitutionExpertManagement";
import { CommunityFeed } from "@/components/CommunityFeed";
import { supabase } from "@/integrations/supabase/client";
import { mockInstitutions } from "@/data/mockInstitutions";
import { mockExpertsDetailed } from "@/data/mockExpertsDetailed";
import { 
  Building, 
  MapPin, 
  Users, 
  Award, 
  ArrowLeft, 
  Loader2,
  Star,
  Crown,
  Sparkles,
  Brain,
  Heart,
  Shield,
  Zap,
  ChevronRight,
  UserCheck,
  Phone,
  Globe,
  Medal,
  Target,
  TrendingUp,
  MessageCircle,
  Video,
  CheckCircle,
  Calendar,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface FilterState {
  search: string;
  institution_type: string;
  region: string;
  voucher_only: boolean;
  parking_only: boolean;
  accessibility_only: boolean;
  specialization: string;
}

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

export default function Institutions() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<any[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState<Expert[]>(mockExpertsDetailed);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>(mockExpertsDetailed);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Expert[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    institution_type: 'all',
    region: 'all',
    voucher_only: false,
    parking_only: false,
    accessibility_only: false,
    specialization: 'all'
  });

  // Load institutions from Supabase
  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const { data, error } = await supabase
          .from('partner_institutions')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error loading institutions:', error);
          // Fallback to mock data if there's an error
          setInstitutions(mockInstitutions);
        } else {
          setInstitutions(data || []);
        }
      } catch (error) {
        console.error('Error loading institutions:', error);
        setInstitutions(mockInstitutions);
      } finally {
        setLoading(false);
      }
    };

    loadInstitutions();
  }, []);

  useEffect(() => {
    let filtered = institutions;

    // 검색 필터
    if (filters.search) {
      filtered = filtered.filter(institution =>
        institution.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        institution.address.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // 기관 유형 필터
    if (filters.institution_type && filters.institution_type !== 'all') {
      filtered = filtered.filter(institution =>
        institution.institution_type === filters.institution_type
      );
    }

    // 지역 필터
    if (filters.region && filters.region !== 'all') {
      filtered = filtered.filter(institution =>
        institution.address.toLowerCase().includes(getRegionName(filters.region).toLowerCase())
      );
    }

    // 바우처 필터
    if (filters.voucher_only) {
      filtered = filtered.filter(institution => institution.is_voucher_approved);
    }

    // 주차 필터
    if (filters.parking_only) {
      filtered = filtered.filter(institution => institution.parking_available);
    }

    // 접근성 필터
    if (filters.accessibility_only) {
      filtered = filtered.filter(institution => 
        institution.accessibility_features && institution.accessibility_features.length > 0
      );
    }

    // 전문분야 필터
    if (filters.specialization && filters.specialization !== 'all') {
      filtered = filtered.filter(institution =>
        institution.specializations.includes(filters.specialization)
      );
    }

    setFilteredInstitutions(filtered);
  }, [filters, institutions]);

  const getRegionName = (region: string) => {
    const regionMap: Record<string, string> = {
      'seoul': '서울',
      'busan': '부산',
      'daegu': '대구',
      'incheon': '인천',
      'gwangju': '광주',
      'daejeon': '대전',
      'ulsan': '울산',
      'sejong': '세종',
      'gyeonggi': '경기',
      'gangwon': '강원',
      'chungbuk': '충북',
      'chungnam': '충남',
      'jeonbuk': '전북',
      'jeonnam': '전남',
      'gyeongbuk': '경북',
      'gyeongnam': '경남',
      'jeju': '제주'
    };
    return regionMap[region] || region;
  };

  const handleViewDetails = (institutionId: string) => {
    // 특정 기관은 외부 링크로 연결
    const institution = institutions.find(inst => inst.id === institutionId);
    if (institution) {
      if (institution.name.includes('한점미소발달센터')) {
        window.open('https://naver.me/FgTH9V07', '_blank');
        return;
      }
      if (institution.name.includes('인애한의원') && institution.name.includes('강남점')) {
        window.open('https://blog.naver.com/koreamedicininae', '_blank');
        return;
      }
    }
    
    navigate(`/institutions/${institutionId}`);
  };

  const handleContactInstitution = (institutionId: string) => {
    // 제휴 문의 모달 또는 페이지로 이동
    console.log('제휴 문의:', institutionId);
  };

  const handleInstitutionSelect = (institutionId: string) => {
    setSelectedInstitution(institutionId);
  };

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
            const recommendedExperts = mockExpertsDetailed
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

  // 전문가 필터링 로직
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

      const expert = mockExpertsDetailed.find(e => e.id === expertId);
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

  useEffect(() => {
    getAIRecommendations();
  }, []);

  const totalVoucherInstitutions = institutions.filter(i => i.is_voucher_approved).length;
  const totalExperts = institutions.reduce((sum, i) => sum + i.total_experts, 0);
  const averageRating = (institutions.reduce((sum, i) => sum + i.rating, 0) / institutions.length).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 커뮤니티 스타일 헤더 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none shadow-lg mb-8">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Building className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AIHPRO 통합 플랫폼</h1>
                <p className="text-lg text-muted-foreground mt-2">
                  개인전문가부터 제휴기관까지, 발달센터 ICT바우처 신청까지 원스톱 서비스
                </p>
              </div>
            </div>
          </div>
          
          {/* 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">129</div>
              <div className="text-sm text-muted-foreground">인증 전문가</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{institutions.length}</div>
              <div className="text-sm text-muted-foreground">제휴 기관</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">95.8%</div>
              <div className="text-sm text-muted-foreground">만족도</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">80%</div>
              <div className="text-sm text-muted-foreground">ICT바우처 지원</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 탭 네비게이션 - 커뮤니티 스타일 */}
        <Tabs defaultValue="community" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="community" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              커뮤니티
            </TabsTrigger>
            <TabsTrigger value="experts" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              개인 전문가
            </TabsTrigger>
            <TabsTrigger value="institutions" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              제휴 기관
            </TabsTrigger>
            <TabsTrigger value="ai-matching" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              AI 매칭
            </TabsTrigger>
            <TabsTrigger value="ict-voucher" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              ICT바우처
            </TabsTrigger>
          </TabsList>

          {/* 커뮤니티 피드 탭 */}
          <TabsContent value="community" className="space-y-6">
            <CommunityFeed />
          </TabsContent>

          {/* 개인 전문가 탭 */}
          <TabsContent value="experts" className="space-y-6">
            {/* 검색 및 필터 */}
            <Card className="p-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">전문가 검색</label>
                  <input
                    type="text"
                    placeholder="이름, 전문분야 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">전문분야</label>
                  <select
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">전체</option>
                    <option value="아동발달">아동발달</option>
                    <option value="언어치료">언어치료</option>
                    <option value="행동분석">행동분석</option>
                    <option value="심리상담">심리상담</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">가격대</label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">전체</option>
                    <option value="low">15만원 이하</option>
                    <option value="medium">15-25만원</option>
                    <option value="high">25만원 이상</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">지역/방식</label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">전체</option>
                    <option value="online">온라인</option>
                    <option value="서울">서울</option>
                    <option value="경기">경기</option>
                  </select>
                </div>
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
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-lg font-bold">
                          {expert.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800">{expert.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{expert.rating}</span>
                          <span className="text-sm text-gray-500">({expert.reviews})</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {expert.specialty.map((spec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">{expert.description}</p>

                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-lg font-bold text-primary">월 {formatPrice(expert.monthlyPrice)}원</div>
                          <div className="text-sm text-gray-500">시간당 {formatPrice(expert.hourlyPrice)}원</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">{expert.experience} 경력</div>
                          <div className="text-xs text-gray-400">{expert.responseTime}</div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleConsultExpert(expert.id)}
                          className="flex-1"
                        >
                          상담하기
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleHireExpert(expert.id)}
                          className="flex-1"
                        >
                          월 계약
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

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

                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {expert.specialty.map((spec, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">{expert.description}</p>

                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-lg font-bold text-primary">월 {formatPrice(expert.monthlyPrice)}원</div>
                            <div className="text-sm text-gray-500">시간당 {formatPrice(expert.hourlyPrice)}원</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">{expert.experience} 경력</div>
                            <div className="text-xs text-gray-400">{expert.responseTime}</div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleConsultExpert(expert.id)}
                            className="flex-1"
                          >
                            상담하기
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleHireExpert(expert.id)}
                            className="flex-1"
                          >
                            월 계약
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">AI 추천을 위해 평가를 먼저 받아보세요</h3>
                <p className="text-muted-foreground mb-4">평가 결과를 바탕으로 최적의 전문가를 추천해드립니다</p>
                <Button onClick={() => navigate('/assessment')}>
                  평가 받기
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* ICT바우처 탭 */}
          <TabsContent value="ict-voucher" className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-blue-500/10 p-4 rounded-full">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">ICT바우처 신청 지원</h2>
                    <p className="text-lg text-muted-foreground">정부 지원으로 최대 80% 할인받고 디지털 전환하세요</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="text-center mb-4">
                      <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-lg">신청 자격 확인</h3>
                    </div>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• 장애인 발달재활서비스 제공기관</li>
                      <li>• 연간 매출액 120억원 이하</li>
                      <li>• 3년 이상 운영 실적</li>
                      <li>• 직원 10명 이상</li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-lg border">
                    <div className="text-center mb-4">
                      <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="font-bold text-lg">지원 혜택</h3>
                    </div>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• 최대 2억원 지원</li>
                      <li>• 정부 80% + 기관 20%</li>
                      <li>• 2년간 분할 지급</li>
                      <li>• 유지보수 포함</li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-lg border">
                    <div className="text-center mb-4">
                      <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Zap className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-lg">신청 절차</h3>
                    </div>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• 1단계: 사업계획서 작성</li>
                      <li>• 2단계: 온라인 신청</li>
                      <li>• 3단계: 심사 및 선정</li>
                      <li>• 4단계: 사업 추진</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    ICT바우처 신청 지원 문의하기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 바우처 승인 기관 목록 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  바우처 승인 제휴기관
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {institutions
                    .filter(inst => inst.is_voucher_approved)
                    .map(institution => (
                      <div key={institution.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <img 
                          src={institution.profile_image_url} 
                          alt={institution.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{institution.name}</h4>
                          <p className="text-sm text-muted-foreground">{institution.address}</p>
                        </div>
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                          승인기관
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 제휴 기관 탭 */}
          <TabsContent value="institutions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 필터 사이드바 */}
              <div className="lg:col-span-1">
                <InstitutionFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  resultsCount={filteredInstitutions.length}
                />
              </div>

              {/* 메인 컨텐츠 */}
              <div className="lg:col-span-3">
                <Tabs defaultValue="list" className="space-y-4">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="list" className="flex-1">
                      목록 보기
                    </TabsTrigger>
                    <TabsTrigger value="region" className="flex-1">
                      지역별 보기
                    </TabsTrigger>
                    <TabsTrigger value="map" className="flex-1">
                      <MapPin className="w-4 h-4 mr-2" />
                      지도 보기
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="list" className="space-y-4">
                    {loading ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
                          <h3 className="text-lg font-medium mb-2">기관 정보를 불러오는 중...</h3>
                        </CardContent>
                      </Card>
                    ) : filteredInstitutions.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
                          <p className="text-muted-foreground">다른 조건으로 검색해보세요</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {filteredInstitutions.map(institution => (
                          <InstitutionCard
                            key={institution.id}
                            institution={institution}
                            onViewDetails={handleViewDetails}
                            onContactInstitution={handleContactInstitution}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="region" className="space-y-4">
                    {loading ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
                          <h3 className="text-lg font-medium mb-2">기관 정보를 불러오는 중...</h3>
                        </CardContent>
                      </Card>
                    ) : (
                      <RegionalInstitutionView
                        institutions={filteredInstitutions}
                        onViewDetails={handleViewDetails}
                        onContactInstitution={handleContactInstitution}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="map">
                    <InstitutionMap
                      institutions={filteredInstitutions}
                      selectedInstitution={selectedInstitution}
                      onInstitutionSelect={handleInstitutionSelect}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}