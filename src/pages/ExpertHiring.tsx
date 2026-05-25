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
import ConsultationFlowSteps from '@/components/expert/ConsultationFlowSteps';
import ExpertHourPackHero from '@/components/expert/ExpertHourPackHero';
import ExpertTrustCards from '@/components/expert/ExpertTrustCards';
// ExpertPriceTag removed from card (price shown on detail page)
import { useSubscription } from '@/hooks/useSubscription';
import { calculateExpertPricing, formatKRW } from '@/lib/expertPricing';
import MindTrackContextBanner, { useMindTrackPrefill } from '@/components/mind-track/MindTrackContextBanner';
import { PARTNER_INSTITUTIONS } from '@/data/partnerInstitutions';

// Facility images
import facilityDev from '@/assets/facilities/facility-development-center.jpg';
import facilitySpeech from '@/assets/facilities/facility-speech-therapy.jpg';
import facilityCounseling from '@/assets/facilities/facility-counseling.jpg';
import facilityAba from '@/assets/facilities/facility-aba.jpg';
import facilityOriental from '@/assets/facilities/facility-oriental.jpg';
import facilitySports from '@/assets/facilities/facility-sports.jpg';
import facilityArt from '@/assets/facilities/facility-art.jpg';
import facilityDaycare from '@/assets/facilities/facility-daycare.jpg';
import facilityPlayTherapy from '@/assets/facilities/facility-play-therapy.jpg';
import facilityPsychology from '@/assets/facilities/facility-psychology.jpg';
import facilitySensory from '@/assets/facilities/facility-sensory.jpg';
import facilityHospital from '@/assets/facilities/facility-hospital.jpg';
import facilityLearning from '@/assets/facilities/facility-learning.jpg';
import facilityDaycare2 from '@/assets/facilities/facility-daycare2.jpg';
import facilityOriental2 from '@/assets/facilities/facility-oriental2.jpg';
import facilitySports2 from '@/assets/facilities/facility-sports2.jpg';

const ALL_FACILITY_IMAGES = [
  facilityDev, facilitySpeech, facilityCounseling, facilityAba,
  facilityOriental, facilitySports, facilityArt, facilityDaycare,
  facilityPlayTherapy, facilityPsychology, facilitySensory, facilityHospital,
  facilityLearning, facilityDaycare2, facilityOriental2, facilitySports2,
];

const getFacilityImage = (index: number) => {
  return ALL_FACILITY_IMAGES[index % ALL_FACILITY_IMAGES.length];
};

const CONSULT_PRICE = 39000; // 시간당 (시간 구독형)

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

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

type DbExpert = {
  id: string;
  full_name: string;
  specializations: string[] | null;
  certifications: string[] | null;
  average_rating: number | null;
  total_sessions: number | null;
  years_experience: number | null;
  hourly_rate: number | null;
  profile_image_url: string | null;
  bio: string | null;
};

const PUBLIC_EXPERTS_ENDPOINT = 'https://hrcqxjetmzxoephgyjlb.supabase.co/rest/v1/experts';
const PUBLIC_EXPERTS_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJocmNxeGpldG16eG9lcGhneWpsYiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzU1NjY1MzQwLCJleHAiOjIwNzEyNDEzNDB9.LPXwumPDk6kq5W7jRI6yx39ajYxXw15yTQvfKYtmzzg';

const toExpertCardData = (expert: DbExpert): Expert => ({
  id: expert.id,
  name: expert.full_name,
  specialty: Array.isArray(expert.specializations) ? expert.specializations : [],
  credentials: Array.isArray(expert.certifications) ? expert.certifications : [],
  rating: expert.average_rating && expert.average_rating > 0 ? expert.average_rating : 4.8,
  reviews: expert.total_sessions || 0,
  experience: `${expert.years_experience || 5}년`,
  hourlyPrice: expert.hourly_rate || CONSULT_PRICE,
  image: getExpertImage(expert.full_name) || expert.profile_image_url || '',
  description: expert.bio || '',
  location: '온라인',
  isOnline: true,
  responseTime: '평균 2시간 이내',
  isTop: TOP_EXPERTS.includes(expert.full_name)
});

const sortExpertsForDisplay = (items: Expert[]) =>
  [...items].sort((a, b) => {
    if (a.isTop && !b.isTop) return -1;
    if (!a.isTop && b.isTop) return 1;
    if (a.isTop && b.isTop) return TOP_EXPERTS.indexOf(a.name) - TOP_EXPERTS.indexOf(b.name);
    return a.name.localeCompare(b.name, 'ko-KR');
  });

const loadPublicExpertsDirectly = async (): Promise<DbExpert[]> => {
  const params = new URLSearchParams({
    select: 'id,full_name,specializations,certifications,average_rating,total_sessions,years_experience,hourly_rate,profile_image_url,bio',
    is_verified: 'eq.true',
    is_available: 'eq.true',
  });

  const response = await fetch(`${PUBLIC_EXPERTS_ENDPOINT}?${params.toString()}`, {
    headers: {
      apikey: PUBLIC_EXPERTS_ANON_KEY,
      Authorization: `Bearer ${PUBLIC_EXPERTS_ANON_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Public experts fetch failed: ${response.status}`);
  }

  return response.json();
};

const ExpertHiring = () => {
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const subscriberPricing = calculateExpertPricing(subscription);
  const mindTrackCtx = useMindTrackPrefill();
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

  // 마인드트랙/셀프체크 컨텍스트가 있으면 주제 자동 프리필
  useEffect(() => {
    if (mindTrackCtx?.topic && !bookingTopic) {
      const lines = [mindTrackCtx.topic];
      if (mindTrackCtx.scoreLine) lines.push("", mindTrackCtx.scoreLine);
      setBookingTopic(lines.join("\n"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mindTrackCtx?.topic, mindTrackCtx?.scoreLine]);

  useEffect(() => { loadExperts(); }, []);

  const loadExperts = async () => {
    try {
      setLoading(true);
      const { data: dbExperts, error } = await supabase
        .from('experts')
        .select('*')
        .eq('is_verified', true)
        .eq('is_available', true);

      let sourceExperts = (dbExperts || []) as DbExpert[];
      if (error || sourceExperts.length === 0) {
        console.warn('Primary expert query failed or returned empty. Falling back to public expert feed.', error);
        sourceExperts = await loadPublicExpertsDirectly();
      }

      setExperts(sortExpertsForDisplay(sourceExperts.map(toExpertCardData)));
    } catch (error) {
      console.error('Error loading experts:', error);
      toast.error('전문가 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      setExperts([]);
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

      // 마인드트랙 컨텍스트가 있으면 메모에 추적 태그 추가
      const interventionId = sessionStorage.getItem("mind_track_intervention_id");
      const trackingSuffix = interventionId
        ? `\n\n[mind_track:intervention=${interventionId};from=${mindTrackCtx?.from ?? "direct"};day=${mindTrackCtx?.day ?? "?"};offering=${mindTrackCtx?.offering ?? "?"}]`
        : "";

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
          notes: bookingTopic + trackingSuffix,
          tokens_paid: subscriberPricing.final
        }]);
      if (error) throw error;

      // 마인드트랙 개입 결제 완료로 업데이트
      if (interventionId) {
        await supabase
          .from('mind_track_interventions')
          .update({ status: 'purchased', acted_at: new Date().toISOString() })
          .eq('id', interventionId)
          .eq('user_id', user.id);
        sessionStorage.removeItem("mind_track_intervention_id");
      }

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
    if (!mindTrackCtx?.topic) setBookingTopic('');
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
        {mindTrackCtx && <MindTrackContextBanner ctx={mindTrackCtx} />}

        {/* 시간 구독형 시간권 (Hero) */}
        <ExpertHourPackHero />

        {/* Page heading — minimal */}
        <div className="mb-5">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">검증된 전문가 둘러보기</h1>
          <p className="text-sm text-muted-foreground mt-1">시간권으로 원하는 전문가와 자유롭게 매칭하세요</p>
        </div>


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

            {/* 진행 흐름 — 슬라이드 형식 */}
            <ConsultationFlowSteps />

            {/* 신뢰 + 가격 안내 */}
            <ExpertTrustCards />

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PARTNER_INSTITUTIONS.map((inst, index) => (
                <div
                  key={inst.id}
                  onClick={() => (inst as any).website ? window.open((inst as any).website, '_blank') : navigate(`/institution-detail/${inst.id}`)}
                  className="group relative bg-white rounded-3xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.12)] overflow-hidden"
                  style={{
                    boxShadow: '0 1px 3px hsl(var(--foreground)/0.04), 0 4px 12px hsl(var(--foreground)/0.03)',
                    border: '1px solid hsl(var(--border)/0.5)',
                  }}
                >
                  {/* Facility image */}
                  <div className="relative h-36 overflow-hidden">
                    <img 
                      src={getFacilityImage(index)} 
                      alt={inst.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Verified badge on image */}
                    {inst.isVerified && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-700">인증기관</span>
                      </div>
                    )}
                    
                    {/* Location on image */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                      <MapPin className="w-3 h-3 text-white/80" />
                      <span className="text-[11px] text-white font-medium">{inst.location}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-[14px] text-foreground leading-snug mb-1 line-clamp-1">{inst.name}</h3>
                    <p className="text-[11px] text-muted-foreground mb-3">{inst.type}</p>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {inst.specialties.slice(0, 3).map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-primary/[0.06] text-primary/80 border border-primary/10"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground font-medium">AIHPRO 제휴기관</span>
                      <span className="text-[11px] text-primary font-semibold flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                        상세보기 <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-5 mt-2">
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

/* ─── Expert Card (Premium White) ─── */
const ExpertCard = ({ expert, onBook, navigate }: { expert: Expert; onBook: () => void; navigate: ReturnType<typeof useNavigate> }) => {
  return (
    <div
      onClick={() => navigate(`/expert-detail/${expert.id}`)}
      className="group relative bg-white rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)] border border-border/60 overflow-hidden"
    >
      {expert.isTop && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-full bg-[#F5EFE0] text-[#8A7647] border border-[#E5D9B8]">
            TOP
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col items-center text-center">
        {/* Profile photo */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-1 ring-border/40 bg-muted">
            <Avatar className="w-full h-full rounded-none">
              <AvatarImage src={expert.image} className="object-cover w-full h-full" />
              <AvatarFallback className="rounded-none text-lg font-semibold bg-muted text-muted-foreground">
                {expert.name[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          {expert.isOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
          )}
        </div>

        {/* Name + meta */}
        <h3 className="font-semibold text-[15px] text-foreground tracking-tight">{expert.name}</h3>
        <div className="flex items-center justify-center gap-1.5 mt-1 text-[11.5px] text-muted-foreground">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground">{expert.rating}</span>
          <span className="text-border">·</span>
          <span>{expert.experience}</span>
        </div>

        {/* Primary specialty */}
        {expert.specialty[0] && (
          <p className="mt-2 text-[12px] text-muted-foreground line-clamp-1">
            {expert.specialty.slice(0, 2).join(' · ')}
          </p>
        )}

        {/* Bio preview */}
        {expert.description && (
          <p className="mt-2 text-[12px] text-muted-foreground/90 leading-relaxed line-clamp-2 min-h-[32px]">
            {expert.description}
          </p>
        )}

        {/* CTA */}
        <Button
          size="sm"
          variant="outline"
          className="mt-4 w-full rounded-xl h-9 text-xs font-semibold border-border hover:bg-foreground hover:text-background transition-colors"
          onClick={(e) => { e.stopPropagation(); onBook(); }}
        >
          상담 예약
        </Button>
      </div>
    </div>
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
  const { subscription } = useSubscription();
  const pricing = calculateExpertPricing(subscription);
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
              {pricing.discountPercent > 0 && (
                <div className="flex items-center gap-1.5 justify-end mb-0.5">
                  <span className="text-[10px] text-muted-foreground line-through">{formatKRW(pricing.base)}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    구독자 {pricing.discountPercent}% 할인
                  </span>
                </div>
              )}
              <span className={cn("text-lg font-bold", pricing.discountPercent > 0 ? "text-emerald-600" : "text-primary")}>
                {formatKRW(pricing.final)}
              </span>
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
