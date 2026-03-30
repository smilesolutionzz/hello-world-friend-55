import React, { useState, useEffect } from "react";
import SEOHead from '@/components/common/SEOHead';
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
  Star, Calendar, Clock, MessageCircle, CheckCircle, Search, MapPin, 
  Shield, Zap, Award, Users, Phone, ChevronRight, Sparkles, Building2
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getExpertImage } from '@/components/expert/ExpertImages';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';

const CONSULT_PRICE = 49000;

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
  isTop: boolean;
}

const TOP_EXPERTS = ['이수석', '이하연', '이기훈', '이상록', '김선길', '백경열', '장서원', '장호탁', '김지수', '주아인', '윤은민'];

const CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: '언어치료', label: '언어치료' },
  { id: '심리상담', label: '심리상담' },
  { id: '발달재활', label: '발달재활' },
  { id: 'ABA', label: 'ABA치료' },
  { id: '특수체육', label: '특수체육' },
  { id: '미술치료', label: '미술치료' },
  { id: '감각통합', label: '감각통합' },
];

const PARTNER_INSTITUTIONS = [
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
  { id: 'inst_33', name: '부천주간 활동서비스', type: '주간활동서비스', location: '부천', specialties: ['주간활동', '장애인서비스'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_34', name: '시흥주간 활동서비스', type: '주간활동서비스', location: '시흥', specialties: ['주간활동', '장애인서비스'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_35', name: '남양주주간 활동서비스', type: '주간활동서비스', location: '남양주', specialties: ['주간활동', '장애인서비스'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_36', name: '용인주간 활동서비스', type: '주간활동서비스', location: '용인', specialties: ['주간활동', '장애인서비스'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_37', name: '부천주간 보호시설', type: '주간보호시설', location: '부천', specialties: ['주간보호', '장애인보호'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_38', name: '구로주간 보호시설', type: '주간보호시설', location: '서울 구로', specialties: ['주간보호', '장애인보호'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_39', name: '하남주간 보호시설', type: '주간보호시설', location: '하남', specialties: ['주간보호', '장애인보호'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_40', name: '양천주간 보호시설', type: '주간보호시설', location: '서울 양천', specialties: ['주간보호', '장애인보호'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_41', name: '평택주간 방과후 서비스센터', type: '방과후서비스', location: '평택', specialties: ['방과후활동', '주간서비스'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_42', name: '진접주간 사회문화 연구소', type: '연구소', location: '남양주 진접', specialties: ['사회문화', '연구'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_43', name: '강릉주간 특수체육', type: '특수체육', location: '강릉', specialties: ['특수체육', '운동발달'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_44', name: '남양주화도점 주간보호시설', type: '주간보호시설', location: '남양주 화도', specialties: ['주간보호', '장애인보호'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_45', name: '함께하는우리 발달장애 주간활동', type: '주간활동서비스', location: '전국', specialties: ['발달장애', '주간활동'], isVerified: true },
  { id: 'inst_46', name: '함께하는우리 방과후활동서비스기관', type: '방과후서비스', location: '전국', specialties: ['방과후활동', '발달장애'], isVerified: true },
  { id: 'inst_47', name: '한국스포츠과학연구소 장애인주간활동,방과후활동센터 하남점', type: '주간활동서비스', location: '하남', specialties: ['장애인주간활동', '방과후활동', '스포츠과학'], isVerified: true },
];

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

const ExpertHiring = () => {
  const navigate = useNavigate();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'experts' | 'institutions'>('experts');
  
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [bookingDate, setBookingDate] = useState<Date>();
  const [bookingTime, setBookingTime] = useState('10:00');
  const [bookingTopic, setBookingTopic] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => { loadExperts(); }, []);

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
          responseTime: '평균 2시간 이내',
          isTop: TOP_EXPERTS.includes(expert.full_name)
        }));
      }

      allExperts.sort((a, b) => {
        if (a.isTop && !b.isTop) return -1;
        if (!a.isTop && b.isTop) return 1;
        if (a.isTop && b.isTop) return TOP_EXPERTS.indexOf(a.name) - TOP_EXPERTS.indexOf(b.name);
        return 0;
      });

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
      if (!user) { toast.error('로그인이 필요합니다'); navigate('/auth'); return; }

      const [h, m] = bookingTime.split(':').map(Number);
      const total = h * 60 + m + 40;
      const endTime = `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;

      const { error } = await supabase
        .from('consultation_bookings')
        .insert([{
          user_id: user.id,
          expert_id: selectedExpert.id,
          booking_date: format(bookingDate, 'yyyy-MM-dd'),
          start_time: bookingTime,
          end_time: endTime,
          duration_minutes: 40,
          status: 'pending',
          is_quick_consultation: false,
          notes: bookingTopic,
          tokens_paid: CONSULT_PRICE
        }]);
      if (error) throw error;

      setBookingOpen(false);
      setBookingSuccess(true);
      resetBookingForm();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('예약 중 오류가 발생했습니다');
    } finally {
      setBookingLoading(false);
    }
  };

  const resetBookingForm = () => {
    setSelectedExpert(null);
    setBookingDate(undefined);
    setBookingTime('10:00');
    setBookingTopic('');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="전문가 상담 예약 - AIHPRO | 심리·발달·언어치료 전문가 매칭"
        description="검증된 심리상담사, 발달치료사, 언어치료사와 1:1 상담을 예약하세요."
        keywords="전문가상담,심리상담예약,발달치료전문가,언어치료사,ADHD전문가"
        canonicalUrl="https://aihpro.app/expert-hiring"
      />
      <UnifiedNavigation />

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* Tab switcher */}
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
          <button
            onClick={() => setActiveTab('experts')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all",
              activeTab === 'experts'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Users className="w-4 h-4" />
            전문가 ({experts.length}명)
          </button>
          <button
            onClick={() => setActiveTab('institutions')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all",
              activeTab === 'institutions'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Building2 className="w-4 h-4" />
            협력기관 ({PARTNER_INSTITUTIONS.length}곳)
          </button>
        </div>

        {/* EXPERTS TAB */}
        {activeTab === 'experts' && (
          <div className="space-y-5">
            {/* Search + Filters */}
            <div className="flex flex-col gap-3">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="이름 또는 전문분야 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 rounded-xl bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 h-10"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border",
                      selectedCategory === cat.id
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Count */}
            <p className="text-sm text-muted-foreground font-medium">
              {selectedCategory === 'all' ? '전체' : selectedCategory} 전문가 ({filteredExperts.length}명)
            </p>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredExperts.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">검색 결과가 없습니다</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredExperts.map(expert => (
                  <ExpertCard
                    key={expert.id}
                    expert={expert}
                    onBook={() => handleBooking(expert)}
                    navigate={navigate}
                  />
                ))}
              </div>
            )}

            {/* Expert application banner */}
            <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-5 mt-4">
              <div>
                <p className="font-semibold text-foreground text-sm">전문가로 활동하고 싶으신가요?</p>
                <p className="text-xs text-muted-foreground mt-0.5">AIHPRO와 함께 전문가로 활동하며 수익을 창출하세요</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/expert-application')}
                className="shrink-0 rounded-xl"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                전문가 신청하기
              </Button>
            </div>
          </div>
        )}

        {/* INSTITUTIONS TAB */}
        {activeTab === 'institutions' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">
                협력기관 ({PARTNER_INSTITUTIONS.length}곳)
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/institution-application')}
                className="text-primary text-xs"
              >
                협력기관 신청 <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PARTNER_INSTITUTIONS.map(inst => (
                <Card 
                  key={inst.id}
                  className="group rounded-2xl border border-border/60 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                  onClick={() => (inst as any).website ? window.open((inst as any).website, '_blank') : navigate(`/institution-detail/${inst.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className="font-semibold text-foreground text-sm truncate">{inst.name}</h3>
                          {inst.isVerified && (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-2">{inst.type} · {inst.location}</p>
                        <div className="flex flex-wrap gap-1">
                          {inst.specialties.slice(0, 2).map((spec, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-muted text-muted-foreground">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-5">
              <div>
                <p className="font-semibold text-foreground text-sm">우리 기관도 등록하고 싶으신가요?</p>
                <p className="text-xs text-muted-foreground mt-0.5">무료로 기관 정보를 등록하고 더 많은 고객을 만나보세요</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/institution-application')}
                className="shrink-0 rounded-xl"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                협력기관 신청
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Dialog */}
      <BookingDialog
        open={bookingOpen}
        onClose={() => { setBookingOpen(false); resetBookingForm(); }}
        expert={selectedExpert}
        bookingDate={bookingDate}
        setBookingDate={setBookingDate}
        bookingTime={bookingTime}
        setBookingTime={setBookingTime}
        bookingTopic={bookingTopic}
        setBookingTopic={setBookingTopic}
        loading={bookingLoading}
        onSubmit={submitBooking}
      />

      {/* Success Dialog */}
      <Dialog open={bookingSuccess} onOpenChange={setBookingSuccess}>
        <DialogContent className="max-w-sm text-center rounded-2xl">
          <div className="py-4 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground">예약이 접수되었습니다!</h3>
            <p className="text-sm text-muted-foreground">
              전문가 확인 후 <strong>24시간 이내</strong> 상담 일정을 안내드립니다.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-amber-800">💬 카카오톡으로 빠르게 연락받으세요</p>
              <Button
                onClick={() => window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank')}
                className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] font-semibold rounded-xl"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                카카오톡 채널 추가
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setBookingSuccess(false)} className="flex-1 rounded-xl">닫기</Button>
              <Button onClick={() => { setBookingSuccess(false); navigate('/booking-management'); }} className="flex-1 rounded-xl">예약 내역</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ─── Expert Card ─── */
const ExpertCard = ({ expert, onBook, navigate }: { expert: Expert; onBook: () => void; navigate: ReturnType<typeof useNavigate> }) => {
  return (
    <Card 
      onClick={() => navigate(`/expert-detail/${expert.id}`)}
      className={cn(
        "group rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        expert.isTop 
          ? "border-primary/25 bg-gradient-to-b from-primary/[0.03] to-background" 
          : "border-border/60"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <Avatar className={cn("w-12 h-12 border-2", expert.isTop ? "border-primary/30" : "border-border")}>
              <AvatarImage src={expert.image} className="object-cover" />
              <AvatarFallback className="text-sm font-semibold bg-muted text-muted-foreground">
                {expert.name[0]}
              </AvatarFallback>
            </Avatar>
            {expert.isTop && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm leading-none">
                TOP
              </span>
            )}
            {expert.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-sm truncate">{expert.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{expert.rating}</span>
              <span>·</span>
              <span>{expert.experience}</span>
              <span>·</span>
              <span className="text-emerald-600 font-medium">온라인</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2.5">
          {expert.specialty.slice(0, 3).map((spec, idx) => (
            <span key={idx} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-muted text-muted-foreground">
              {spec}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
          <div>
            <span className="text-sm font-bold text-foreground">₩{CONSULT_PRICE.toLocaleString()}</span>
            <span className="text-[11px] text-muted-foreground ml-1">/40분</span>
          </div>
          <Button
            size="sm"
            className="rounded-xl px-3.5 h-8 text-xs font-semibold shadow-sm"
            onClick={(e) => { e.stopPropagation(); onBook(); }}
          >
            <Calendar className="w-3 h-3 mr-1" />
            예약
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/* ─── Booking Dialog ─── */
const BookingDialog = ({
  open, onClose, expert, bookingDate, setBookingDate,
  bookingTime, setBookingTime, bookingTopic, setBookingTopic,
  loading, onSubmit
}: {
  open: boolean; onClose: () => void; expert: Expert | null;
  bookingDate: Date | undefined; setBookingDate: (d: Date | undefined) => void;
  bookingTime: string; setBookingTime: (t: string) => void;
  bookingTopic: string; setBookingTopic: (t: string) => void;
  loading: boolean; onSubmit: () => void;
}) => {
  if (!expert) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">상담 예약</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Expert info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <Avatar className="w-10 h-10">
              <AvatarImage src={expert.image} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">{expert.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-sm text-foreground">{expert.name}</h4>
              <p className="text-xs text-muted-foreground">{expert.specialty.slice(0, 2).join(', ')}</p>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">상담 날짜 *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left rounded-xl", !bookingDate && "text-muted-foreground")}>
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  {bookingDate ? format(bookingDate, 'PPP', { locale: ko }) : "날짜 선택"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single" selected={bookingDate} onSelect={setBookingDate}
                  disabled={(date) => date < new Date()} locale={ko}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">상담 시간 *</label>
            <div className="grid grid-cols-5 gap-1.5">
              {TIME_SLOTS.map(time => (
                <Button
                  key={time} size="sm" variant={bookingTime === time ? 'default' : 'outline'}
                  onClick={() => setBookingTime(time)}
                  className={cn("text-xs rounded-lg h-8", bookingTime === time && "shadow-sm")}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">상담 내용 *</label>
            <Textarea
              placeholder="상담받고 싶은 내용을 간단히 적어주세요"
              value={bookingTopic} onChange={(e) => setBookingTopic(e.target.value)}
              rows={3} className="rounded-xl resize-none"
            />
          </div>

          {/* Cost */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">상담 비용</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-primary">₩{CONSULT_PRICE.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground ml-1">/ 40분</span>
            </div>
          </div>

          {/* Info */}
          <div className="text-[11px] text-muted-foreground space-y-1">
            <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> 예약 접수 → 전문가 확인 → 카카오톡 안내</p>
            <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> 화상 또는 전화로 상담 진행 (40분)</p>
            <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> 상담 불만족 시 100% 환불 보장</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">취소</Button>
            <Button
              onClick={onSubmit}
              disabled={loading || !bookingDate || !bookingTime || !bookingTopic.trim()}
              className="flex-1 rounded-xl"
            >
              {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
              예약하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpertHiring;
