import React, { useState, useEffect } from "react";
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  Calendar, 
  Clock, 
  MessageCircle, 
  Video,
  CheckCircle,
  MapPin,
  Shield,
  Award,
  Users,
  Phone,
  ArrowLeft,
  Heart,
  BookOpen,
  Sparkles,
  Quote,
  GraduationCap,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getExpertImage } from '@/components/expert/ExpertImages';
import { mockExperts as mockExpertsData } from '@/data/mockExperts';
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import Footer from "@/components/ui/footer";
import { ExpertBookingModal } from "@/components/booking/ExpertBookingModal";

interface ExpertDetail {
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
  philosophy?: string;
  education?: string[];
  certifications?: string[];
  approach?: string[];
  successCases?: number;
}

// 치료 철학 데이터 (이름 기반)
const philosophyData: Record<string, {
  philosophy: string;
  approach: string[];
  education: string[];
  successCases: number;
}> = {
  '김민지': {
    philosophy: "아이의 속도에 맞춰 함께 걸어가는 것, 그것이 진정한 치료의 시작입니다.",
    approach: ['놀이중심 언어치료', '가족참여 치료', '자연스러운 환경 중심 접근'],
    education: ['이화여자대학교 언어병리학 석사', '미국 ASHA 인증 과정 수료'],
    successCases: 156
  },
  '박서연': {
    philosophy: "모든 아이는 자신만의 빛을 가지고 있습니다. 저는 그 빛을 찾아주는 사람입니다.",
    approach: ['ABA 기반 행동치료', '사회성 그룹 프로그램', '부모교육 병행'],
    education: ['서울대학교 심리학 박사', 'BCBA 국제 행동분석가 자격'],
    successCases: 203
  },
  '이준호': {
    philosophy: "변화는 작은 성공의 축적입니다. 매 순간의 진전을 함께 축하합니다.",
    approach: ['인지행동치료', '정서조절 훈련', '사회기술 훈련'],
    education: ['연세대학교 임상심리학 석사', '한국임상심리학회 공인 임상심리전문가'],
    successCases: 178
  },
  '최유진': {
    philosophy: "부모님의 마음을 치유하는 것이 아이 치료의 첫 번째 단계입니다.",
    approach: ['가족치료', '부모-아동 상호작용 치료', '감정코칭'],
    education: ['고려대학교 아동학 박사', '미국 가족치료학회 정회원'],
    successCases: 134
  },
  '정하늘': {
    philosophy: "놀이는 아이의 언어입니다. 놀이를 통해 세상을 배워갑니다.",
    approach: ['놀이치료', '모래놀이치료', '미술치료'],
    education: ['숙명여자대학교 아동상담 석사', '국제놀이치료협회 인증'],
    successCases: 189
  },
  '강도윤': {
    philosophy: "감각의 조화가 발달의 기초입니다. 균형 잡힌 성장을 돕습니다.",
    approach: ['감각통합치료', '작업치료', '일상생활훈련'],
    education: ['연세대학교 작업치료학 석사', '감각통합전문가 1급'],
    successCases: 145
  },
  '윤서윤': {
    philosophy: "언어는 마음의 다리입니다. 소통의 즐거움을 알려드립니다.",
    approach: ['언어발달치료', '조음치료', 'AAC 보완대체 의사소통'],
    education: ['한림대학교 언어병리학 박사', '대한언어재활사협회 1급'],
    successCases: 221
  },
  '임채원': {
    philosophy: "아이의 무한한 가능성을 믿습니다. 함께라면 어떤 벽도 넘을 수 있습니다.",
    approach: ['발달재활', '조기중재', '통합치료'],
    education: ['부산대학교 특수교육학 석사', '발달재활서비스 제공자 자격'],
    successCases: 167
  }
};

// 기본 치료 철학 (데이터가 없는 경우)
const defaultPhilosophy = {
  philosophy: "한 사람 한 사람의 고유한 가치를 존중하며, 함께 성장하는 여정을 걸어갑니다.",
  approach: ['개인 맞춤형 치료', '근거기반 접근', '가족 중심 치료'],
  education: ['석사 이상 전문 학위', '관련 분야 전문가 자격'],
  successCases: 100
};

const ExpertDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expert, setExpert] = useState<ExpertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    loadExpert();
  }, [id]);

  const loadExpert = async () => {
    try {
      // DB에서 먼저 찾기
      const { data: dbExpert } = await supabase
        .from('experts')
        .select('*')
        .eq('id', id)
        .single();

      if (dbExpert) {
        const name = dbExpert.full_name;
        const extraData = philosophyData[name] || defaultPhilosophy;
        
        setExpert({
          id: dbExpert.id,
          name: name,
          specialty: dbExpert.specializations || [],
          credentials: dbExpert.certifications || [],
          rating: dbExpert.average_rating || 4.5,
          reviews: dbExpert.total_sessions || 0,
          experience: `${dbExpert.years_experience}년`,
          hourlyPrice: dbExpert.hourly_rate,
          image: getExpertImage(name) || dbExpert.profile_image_url || '',
          description: dbExpert.bio || '',
          location: '온라인',
          isOnline: true,
          responseTime: '평균 2시간 이내',
          philosophy: extraData.philosophy,
          approach: extraData.approach,
          education: extraData.education,
          successCases: extraData.successCases
        });
      } else {
        // Mock 데이터에서 찾기
        const mockExpert = mockExpertsData.find(e => e.id === id);
        if (mockExpert) {
          const name = mockExpert.name.replace(' 치료사', '').replace(' 박사', '');
          const extraData = philosophyData[name] || defaultPhilosophy;
          
          setExpert({
            id: mockExpert.id,
            name: name,
            specialty: mockExpert.categories || [],
            credentials: [mockExpert.credential],
            rating: mockExpert.rating,
            reviews: Math.floor(Math.random() * 100) + 20,
            experience: '경력 다년',
            hourlyPrice: mockExpert.price_per_50 || 30000,
            image: mockExpert.photo_url || '',
            description: mockExpert.intro || '',
            location: mockExpert.region || '온라인',
            isOnline: mockExpert.online || false,
            responseTime: '평균 2시간 이내',
            philosophy: extraData.philosophy,
            approach: extraData.approach,
            education: extraData.education,
            successCases: extraData.successCases
          });
        }
      }
    } catch (error) {
      console.error('Error loading expert:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    setBookingModalOpen(true);
  };

  const handleKakaoConsult = () => {
    window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <UnifiedNavigation />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-slate-50">
        <UnifiedNavigation />
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-gray-500 mb-4">전문가를 찾을 수 없습니다</p>
          <Button onClick={() => navigate('/expert-hiring')}>목록으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{expert.name} 전문가 | AIHPRO</title>
        <meta name="description" content={`${expert.name} - ${expert.specialty.join(', ')} 전문가. ${expert.philosophy}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <UnifiedNavigation />
        
        {/* 뒤로가기 */}
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/expert-hiring')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            전문가 목록
          </Button>
        </div>

        {/* 프로필 헤더 */}
        <section className="max-w-4xl mx-auto px-4 py-8">
          <Card className="overflow-hidden border-0 shadow-xl bg-white">
            {/* 배경 그라데이션 */}
            <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
            </div>
            
            <CardContent className="relative px-6 pb-6">
              {/* 아바타 */}
              <div className="absolute -top-16 left-6">
                <Avatar className="w-32 h-32 ring-4 ring-white shadow-xl">
                  <AvatarImage src={expert.image} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-3xl">
                    {expert.name[0]}
                  </AvatarFallback>
                </Avatar>
                {expert.isOnline && (
                  <span className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full" />
                )}
              </div>

              {/* 기본 정보 */}
              <div className="pt-20 md:pt-4 md:pl-40">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{expert.name}</h1>
                      {expert.rating >= 4.8 && (
                        <Badge className="bg-amber-100 text-amber-700">
                          <Award className="w-3 h-3 mr-1" />
                          TOP 전문가
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-semibold">{expert.rating}</span>
                        <span className="text-gray-400 ml-1">({expert.reviews}건)</span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {expert.experience}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {expert.location}
                      </span>
                    </div>
                  </div>

                  {/* CTA 버튼 */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={handleKakaoConsult}
                      className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      카카오 문의
                    </Button>
                    <Button 
                      onClick={handleBooking}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      상담 예약
                    </Button>
                  </div>
                </div>

                {/* 전문 분야 뱃지 */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {expert.specialty.map((spec, idx) => (
                    <Badge key={idx} className="bg-blue-100 text-blue-700 border-0">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 치료 철학 */}
        <section className="max-w-4xl mx-auto px-4 pb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                  <Quote className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    치료 철학
                  </h2>
                  <p className="text-xl font-medium text-indigo-900 leading-relaxed italic">
                    "{expert.philosophy}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 상세 정보 그리드 */}
        <section className="max-w-4xl mx-auto px-4 pb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* 치료 접근법 */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  치료 접근법
                </h3>
                <ul className="space-y-3">
                  {expert.approach?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* 학력 및 자격 */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                  학력 및 자격
                </h3>
                <ul className="space-y-3">
                  {expert.education?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                  {expert.credentials.map((cred, idx) => (
                    <li key={`cred-${idx}`} className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{cred}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 성과 통계 */}
        <section className="max-w-4xl mx-auto px-4 pb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-900 to-slate-800">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">{expert.successCases}+</div>
                  <div className="text-slate-400 text-sm">상담 완료</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">{expert.rating}</div>
                  <div className="text-slate-400 text-sm">평균 평점</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">{expert.experience}</div>
                  <div className="text-slate-400 text-sm">경력</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">98%</div>
                  <div className="text-slate-400 text-sm">재방문율</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 소개 */}
        {expert.description && (
          <section className="max-w-4xl mx-auto px-4 pb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  상세 소개
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {expert.description}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* 가격 및 예약 CTA */}
        <section className="max-w-4xl mx-auto px-4 pb-12">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">지금 바로 상담을 예약하세요</h3>
                  <p className="text-blue-100">
                    첫 상담 후 만족하지 않으시면 100% 환불해 드립니다
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{expert.hourlyPrice.toLocaleString()}</div>
                    <div className="text-blue-200 text-sm">토큰 / 60분</div>
                  </div>
                  <Button 
                    size="lg"
                    onClick={handleBooking}
                    className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    예약하기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Footer />

        {/* 예약 모달 */}
        {expert && (
          <ExpertBookingModal
            open={bookingModalOpen}
            onOpenChange={setBookingModalOpen}
            expert={{
              id: expert.id,
              name: expert.name,
              specialty: expert.specialty,
              hourlyPrice: expert.hourlyPrice,
              image: expert.image
            }}
          />
        )}
      </div>
    </>
  );
};

export default ExpertDetailPage;
