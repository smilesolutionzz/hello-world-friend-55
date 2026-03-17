import React, { useState, useEffect } from "react";
import { Helmet } from 'react-helmet-async';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Star, 
  Calendar, 
  Clock, 
  MessageCircle, 
  Video,
  CheckCircle,
  Search,
  MapPin,
  Shield,
  Zap,
  ArrowRight,
  Award,
  Users,
  Phone,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getExpertImage } from '@/components/expert/ExpertImages';
// mockExperts removed - using only DB data
import { useTokens } from '@/hooks/useTokens';

interface Expert {
  id: string;
  name: string;
  specialty: string[];
  credentials: string[];
  rating: number;
  reviews: number;
  experience: string;
  hourlyPrice: number;
  image: string;
  description: string;
  location: string;
  isOnline: boolean;
  responseTime: string;
}

const ExpertHiring = () => {
  const navigate = useNavigate();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // 예약 모달 상태
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [bookingDate, setBookingDate] = useState<Date>();
  const [bookingTime, setBookingTime] = useState('10:00');
  const [bookingTopic, setBookingTopic] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // 토큰은 모달 열렸을 때만 체크 (깜빡임 방지)
  const { balance, consumeTokens, checkTokenAvailability } = useTokens();

  const [activeTab, setActiveTab] = useState<'experts' | 'institutions'>('experts');

  const categories = [
    { id: 'all', label: '전체', icon: '👥' },
    { id: '언어치료', label: '언어치료', icon: '🗣️' },
    { id: '심리상담', label: '심리상담', icon: '💭' },
    { id: '발달재활', label: '발달재활', icon: '🧒' },
    { id: 'ABA', label: 'ABA치료', icon: '🎯' },
    { id: '특수체육', label: '특수체육', icon: '🏃' },
    { id: '미술치료', label: '미술치료', icon: '🎨' },
    { id: '감각통합', label: '감각통합', icon: '🧠' }
  ];

  // 실제 협력기관 데이터 (이미지 명단 기반)
  const partnerInstitutions = [
    { id: 'inst_1', name: 'APA발달센터', type: '발달센터', location: '본점', specialties: ['ABA', '발달재활'], isVerified: true },
    { id: 'inst_2', name: 'APA주관활동서비스센터', type: '발달센터', location: '본점', specialties: ['주관활동', '발달재활'], isVerified: true },
    { id: 'inst_3', name: '한점미소발달센터 남양주점', type: '발달센터', location: '경기 남양주', specialties: ['발달재활', '놀이치료'], isVerified: true },
    { id: 'inst_4', name: '한점미소발달센터 부천점', type: '발달센터', location: '경기 부천', specialties: ['발달재활', '놀이치료'], isVerified: true },
    { id: 'inst_5', name: '우아함발달센터 안산점', type: '발달센터', location: '경기 안산', specialties: ['발달재활', 'ABA'], isVerified: true },
    { id: 'inst_6', name: '우아함발달센터 화성세솔점', type: '발달센터', location: '경기 화성', specialties: ['발달재활', 'ABA'], isVerified: true },
    { id: 'inst_7', name: '메이플 ABA 목동센터', type: 'ABA센터', location: '서울 목동', specialties: ['ABA', '행동치료'], isVerified: true },
    { id: 'inst_8', name: '엘림아동발달센터', type: '발달센터', location: '대구', specialties: ['언어치료', '인지치료'], isVerified: true },
    { id: 'inst_9', name: '해웃음 심리발달센터', type: '심리발달센터', location: '서울 강서구', specialties: ['심리상담', '발달재활'], isVerified: true },
    { id: 'inst_10', name: '핌발달센터 남양주점', type: '발달센터', location: '경기 남양주', specialties: ['발달재활', '감각통합'], isVerified: true },
    { id: 'inst_11', name: '정관언어발달센터', type: '언어발달센터', location: '부산 기장', specialties: ['언어치료', '조음치료'], isVerified: true },
    { id: 'inst_12', name: '해오름 아동발달센터', type: '발달센터', location: '부산 기장', specialties: ['발달재활', '놀이치료'], isVerified: true },
    { id: 'inst_13', name: '넘나들 언어인지학습연구소', type: '연구소', location: '경기 양주', specialties: ['언어치료', '인지학습'], isVerified: true },
    { id: 'inst_14', name: '별하언어심리상담센터', type: '심리상담센터', location: '서울 구로', specialties: ['언어치료', '심리상담'], isVerified: true },
    { id: 'inst_15', name: '정아동발달센터', type: '발달센터', location: '미입력', specialties: ['발달재활'], isVerified: true },
    { id: 'inst_16', name: '소리엘언어발달센터', type: '언어발달센터', location: '부산 동래', specialties: ['언어치료', '발달재활'], isVerified: true },
    { id: 'inst_17', name: '나아가다발달상담센터', type: '발달상담센터', location: '부산 연제구', specialties: ['발달상담', '심리상담'], isVerified: true },
    { id: 'inst_18', name: '우리aba사회성발달센터', type: '발달센터', location: '경기 의왕', specialties: ['ABA', '사회성발달'], isVerified: true },
    { id: 'inst_19', name: '한걸음발달 연구소', type: '연구소', location: '대구 달서구', specialties: ['발달재활', '연구'], isVerified: true },
    { id: 'inst_20', name: '참소리언어심리연구소', type: '연구소', location: '경기 화성', specialties: ['언어치료', '심리상담'], isVerified: true },
    { id: 'inst_21', name: '산본아동발달센터', type: '발달센터', location: '경기 군포', specialties: ['발달재활', '아동발달'], isVerified: true },
    { id: 'inst_22', name: '도란도란 심리상담센터', type: '심리상담센터', location: '전국', specialties: ['심리상담', '가족치료'], isVerified: true },
    { id: 'inst_23', name: '다다언어심리발달센터', type: '발달센터', location: '울산', specialties: ['언어치료', '심리발달'], isVerified: true },
    { id: 'inst_24', name: '풍무아동청소년아동발달센터', type: '발달센터', location: '경기', specialties: ['아동발달', '청소년발달'], isVerified: true },
    { id: 'inst_25', name: '창원튼튼병원 부설 아동발달센터', type: '병원부설', location: '창원', specialties: ['아동발달', '의료상담'], isVerified: true },
    { id: 'inst_26', name: '톡톡말톡톡 언어인지학습센터', type: '학습센터', location: '경기 고양', specialties: ['언어치료', '인지학습'], isVerified: true },
    { id: 'inst_27', name: '인애 한의원 강남점', type: '한의원', location: '서울 강남', specialties: ['한방치료', '아동건강'], isVerified: true },
    { id: 'inst_28', name: '가까이 한의원 강남점', type: '한의원', location: '서울 강남', specialties: ['한방치료', '아동건강'], isVerified: true },
    { id: 'inst_29', name: '굿모닝언어심리발달센터', type: '발달센터', location: '울산', specialties: ['언어치료', '심리발달'], isVerified: true },
    { id: 'inst_30', name: '디딤돌언어사회성연구소', type: '연구소', location: '부산', specialties: ['언어치료', '사회성발달'], isVerified: true },
    { id: 'inst_31', name: '그리미미술 옥포점', type: '미술치료센터', location: '경남 옥포', specialties: ['미술치료', '표현예술'], isVerified: true },
    { id: 'inst_32', name: '인애 한의원 안산점', type: '한의원', location: '경기 안산', specialties: ['한방치료', '아동건강'], isVerified: true },
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  useEffect(() => {
    loadExperts();
  }, []);

  const loadExperts = async () => {
    try {
      const { data: dbExperts } = await supabase
        .from('experts')
        .select('*')
        .eq('is_verified', true)
        .eq('is_available', true);

      let allExperts: Expert[] = [];

      if (dbExperts) {
        allExperts = dbExperts.map(expert => ({
          id: expert.id,
          name: expert.full_name,
          specialty: expert.specializations || [],
          credentials: expert.certifications || [],
          rating: expert.average_rating || 4.5,
          reviews: expert.total_sessions || 0,
          experience: `${expert.years_experience}년`,
          hourlyPrice: expert.hourly_rate,
          image: getExpertImage(expert.full_name) || expert.profile_image_url || '',
          description: expert.bio || '',
          location: '온라인',
          isOnline: true,
          responseTime: '평균 2시간 이내'
        }));
      }

      setExperts(allExperts);
    } catch (error) {
      console.error('Error loading experts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.specialty.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || 
      expert.specialty.some(s => s.includes(selectedCategory));
    return matchesSearch && matchesCategory;
  });

  const handleBooking = (expert: Expert) => {
    setSelectedExpert(expert);
    setBookingOpen(true);
  };

  const submitBooking = async () => {
    if (!selectedExpert || !bookingDate || !bookingTime || !bookingTopic.trim()) {
      toast.error('모든 필수 항목을 입력해주세요');
      return;
    }

    setBookingLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다');
        navigate('/auth');
        return;
      }

      const cost = selectedExpert.hourlyPrice || 30000;
      
      if (!checkTokenAvailability(cost)) {
        toast.error(`토큰이 부족합니다. (필요: ${cost.toLocaleString()} 토큰)`);
        navigate('/token-subscription');
        return;
      }

      const bookingData = {
        user_id: user.id,
        expert_id: selectedExpert.id,
        booking_date: format(bookingDate, 'yyyy-MM-dd'),
        start_time: bookingTime,
        end_time: calculateEndTime(bookingTime, 60),
        duration_minutes: 60,
        status: 'pending',
        is_quick_consultation: false,
        notes: bookingTopic,
        tokens_paid: cost
      };

      const { error } = await supabase
        .from('consultation_bookings')
        .insert([bookingData]);

      if (error) throw error;

      await consumeTokens(cost);

      toast.success('예약이 완료되었습니다! 전문가가 확인 후 연락드립니다.');
      setBookingOpen(false);
      resetBookingForm();
      navigate('/booking-management');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('예약 중 오류가 발생했습니다');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateEndTime = (start: string, minutes: number) => {
    const [h, m] = start.split(':').map(Number);
    const total = h * 60 + m + minutes;
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  const resetBookingForm = () => {
    setSelectedExpert(null);
    setBookingDate(undefined);
    setBookingTime('10:00');
    setBookingTopic('');
  };

  const handleKakaoConsult = () => {
    window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Helmet>
        <title>전문가 상담 예약 | AIHPRO</title>
        <meta name="description" content="검증된 발달, 심리, 언어치료 전문가와 1:1 상담을 예약하세요" />
      </Helmet>

      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4">
              <Shield className="w-3 h-3 mr-1" />
              검증된 전문가
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              전문가와 <span className="text-blue-400">1:1 상담</span> 예약
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              발달, 심리, 언어치료 분야의 검증된 전문가와<br />
              원하는 시간에 상담을 예약하세요
            </p>
          </div>

          {/* 빠른 상담 CTA */}
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">지금 바로 상담하기</h3>
                    <p className="text-white/80 text-sm">카카오톡으로 빠르게 상담 문의</p>
                  </div>
                </div>
                <Button 
                  onClick={handleKakaoConsult}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  카카오 상담
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 신뢰 지표 */}
          <div className="flex justify-center gap-8 mt-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>50+ 검증된 전문가</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>평균 만족도 4.8</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>5,000+ 상담 완료</span>
            </div>
          </div>
        </div>
      </section>

      {/* 탭 및 검색 */}
      <section className="py-6 px-4 bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          {/* 메인 탭 */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === 'experts' ? 'default' : 'outline'}
              onClick={() => setActiveTab('experts')}
              className={cn(
                "flex-1 md:flex-none",
                activeTab === 'experts' && "bg-primary text-primary-foreground"
              )}
            >
              <Users className="w-4 h-4 mr-2" />
              전문가 ({experts.length}명)
            </Button>
            <Button
              variant={activeTab === 'institutions' ? 'default' : 'outline'}
              onClick={() => setActiveTab('institutions')}
              className={cn(
                "flex-1 md:flex-none",
                activeTab === 'institutions' && "bg-blue-600 text-white"
              )}
            >
              <span className="mr-2">🏢</span>
              협력기관 ({partnerInstitutions.length}곳)
            </Button>
          </div>

          {activeTab === 'experts' && (
            <div className="flex flex-col md:flex-row gap-4">
              {/* 검색 */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="전문가 이름 또는 전문 분야 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              
              {/* 카테고리 */}
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "whitespace-nowrap",
                      selectedCategory === cat.id && "bg-primary text-primary-foreground"
                    )}
                  >
                    <span className="mr-1">{cat.icon}</span>
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 전문가 목록 */}
      {activeTab === 'experts' && (
        <section className="py-8 px-4 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {selectedCategory === 'all' ? '전체 전문가' : `${selectedCategory} 전문가`}
                <span className="text-gray-500 font-normal ml-2">({filteredExperts.length}명)</span>
              </h2>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-24" />
                          <div className="h-3 bg-gray-200 rounded w-32" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExperts.map((expert) => (
                  <ExpertCard
                    key={expert.id}
                    expert={expert}
                    onBook={() => handleBooking(expert)}
                  />
                ))}
              </div>
            )}

            {!loading && filteredExperts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
                <p className="text-gray-500">다른 검색어를 시도해보세요</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 협력기관 목록 */}
      {activeTab === 'institutions' && (
        <section className="py-8 px-4 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                협력기관 안내
                <span className="text-gray-500 font-normal ml-2">({partnerInstitutions.length}곳)</span>
              </h2>
              <Button 
                variant="outline" 
                onClick={() => navigate('/partner-benefits')}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                기관 등록 신청
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partnerInstitutions.map((inst) => (
                <Card 
                  key={inst.id}
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-blue-50 shadow-md hover:scale-[1.02]"
                  onClick={() => navigate('/partner-benefits')}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl shadow-md",
                        inst.type === '의원' || inst.type === '클리닉' || inst.type === '소아과' || inst.type === '정신건강의학과'
                          ? "bg-gradient-to-br from-green-500 to-emerald-600"
                          : inst.type === '심리상담센터'
                          ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                          : inst.type === 'ABA센터'
                          ? "bg-gradient-to-br from-orange-500 to-red-600"
                          : "bg-gradient-to-br from-blue-500 to-indigo-600"
                      )}>
                        {inst.type === '의원' || inst.type === '클리닉' || inst.type === '소아과' || inst.type === '정신건강의학과' ? '🏥' : 
                         inst.type === '심리상담센터' ? '💜' : 
                         inst.type === 'ABA센터' ? '🎯' : '🏢'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 truncate text-sm">{inst.name}</h3>
                          {inst.isVerified && (
                            <Badge className="bg-green-100 text-green-700 text-xs flex-shrink-0">
                              <CheckCircle className="w-3 h-3 mr-0.5" />
                              인증
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{inst.type}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <MapPin className="w-3 h-3" />
                          <span>{inst.location}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {inst.specialties.map((spec, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 기관 등록 안내 배너 */}
            <Card className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">우리 기관도 등록하고 싶으신가요?</h3>
                    <p className="text-white/80 text-sm">무료로 기관 정보를 등록하고 더 많은 고객을 만나보세요</p>
                  </div>
                  <Button 
                    onClick={() => navigate('/partner-benefits')}
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    무료 등록하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* 예약 모달 */}
      <BookingDialog
        open={bookingOpen}
        onClose={() => {
          setBookingOpen(false);
          resetBookingForm();
        }}
        expert={selectedExpert}
        bookingDate={bookingDate}
        setBookingDate={setBookingDate}
        bookingTime={bookingTime}
        setBookingTime={setBookingTime}
        bookingTopic={bookingTopic}
        setBookingTopic={setBookingTopic}
        timeSlots={timeSlots}
        loading={bookingLoading}
        balance={balance?.current_tokens || 0}
        onSubmit={submitBooking}
      />
    </div>
  );
};

// 전문가 카드 컴포넌트
const ExpertCard = ({ expert, onBook }: { expert: Expert; onBook: () => void }) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/expert-detail/${expert.id}`);
  };

  return (
    <Card 
      onClick={handleCardClick}
      className="hover:shadow-xl transition-all duration-300 group cursor-pointer border-0 bg-gradient-to-br from-white to-slate-50 shadow-md hover:scale-[1.02]"
    >
      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* 프로필 이미지 */}
          <div className="relative">
            <Avatar className="w-16 h-16 ring-2 ring-blue-100 shadow-md">
              <AvatarImage src={expert.image} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
                {expert.name[0]}
              </AvatarFallback>
            </Avatar>
            {expert.isOnline && (
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            )}
          </div>

          {/* 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 truncate">{expert.name}</h3>
              {expert.rating >= 4.8 && (
                <Badge className="bg-amber-100 text-amber-700 text-xs">
                  <Award className="w-3 h-3 mr-0.5" />
                  TOP
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <div className="flex items-center">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 mr-0.5" />
                <span className="font-medium text-gray-700">{expert.rating}</span>
              </div>
              <span>·</span>
              <span>{expert.experience}</span>
              {expert.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-0.5" />
                    {expert.location}
                  </span>
                </>
              )}
            </div>

            {/* 전문 분야 */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {expert.specialty.slice(0, 3).map((spec, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border border-blue-100">
                  {spec}
                </Badge>
              ))}
            </div>

            {/* 가격 및 예약 */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {expert.hourlyPrice.toLocaleString()}
                </span>
                <span className="text-sm text-slate-500"> 토큰/시간</span>
              </div>
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onBook();
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
              >
                <Calendar className="w-4 h-4 mr-1" />
                예약
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 예약 다이얼로그 컴포넌트
interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  expert: Expert | null;
  bookingDate: Date | undefined;
  setBookingDate: (date: Date | undefined) => void;
  bookingTime: string;
  setBookingTime: (time: string) => void;
  bookingTopic: string;
  setBookingTopic: (topic: string) => void;
  timeSlots: string[];
  loading: boolean;
  balance: number;
  onSubmit: () => void;
}

const BookingDialog = ({
  open,
  onClose,
  expert,
  bookingDate,
  setBookingDate,
  bookingTime,
  setBookingTime,
  bookingTopic,
  setBookingTopic,
  timeSlots,
  loading,
  balance,
  onSubmit
}: BookingDialogProps) => {
  if (!expert) return null;

  const cost = expert.hourlyPrice || 30000;
  const hasEnoughTokens = balance >= cost;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">상담 예약</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* 전문가 정보 */}
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={expert.image} />
                  <AvatarFallback className="bg-slate-700 text-white">
                    {expert.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold">{expert.name}</h4>
                  <p className="text-sm text-gray-500">
                    {expert.specialty.slice(0, 2).join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 날짜 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">상담 날짜 *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-medium",
                    !bookingDate ? "text-muted-foreground" : "text-slate-700"
                  )}
                >
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  {bookingDate ? format(bookingDate, 'PPP', { locale: ko }) : "날짜 선택"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border shadow-lg" align="start">
                <CalendarComponent
                  mode="single"
                  selected={bookingDate}
                  onSelect={setBookingDate}
                  disabled={(date) => date < new Date()}
                  locale={ko}
                  className="p-3 pointer-events-auto"
                  classNames={{
                    day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700",
                    day_today: "bg-blue-100 text-blue-700",
                    day: "text-slate-700 hover:bg-slate-100"
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 시간 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">상담 시간 *</label>
            <div className="grid grid-cols-5 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={bookingTime === time ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBookingTime(time)}
                  className={cn(
                    "text-xs",
                    bookingTime === time && "bg-slate-900"
                  )}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          {/* 상담 내용 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">상담 내용 *</label>
            <Textarea
              placeholder="상담받고 싶은 내용을 간단히 적어주세요"
              value={bookingTopic}
              onChange={(e) => setBookingTopic(e.target.value)}
              rows={3}
            />
          </div>

          {/* 비용 */}
          <Card className={cn(
            "border",
            hasEnoughTokens ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">상담 비용</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{cost.toLocaleString()} 토큰</div>
                  <div className="text-xs text-gray-500">
                    잔액: {balance.toLocaleString()} 토큰
                  </div>
                </div>
              </div>
              {!hasEnoughTokens && (
                <p className="text-sm text-red-600 mt-2">
                  토큰이 부족합니다. 충전 후 이용해주세요.
                </p>
              )}
            </CardContent>
          </Card>

          {/* 안내 */}
          <div className="text-xs text-gray-500 space-y-1">
            <p className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              전문가 확인 후 24시간 내 연락
            </p>
            <p className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              화상 또는 전화로 상담 진행
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button
              onClick={onSubmit}
              disabled={loading || !bookingDate || !bookingTime || !bookingTopic.trim() || !hasEnoughTokens}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Calendar className="w-4 h-4 mr-2" />
              )}
              예약하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpertHiring;
