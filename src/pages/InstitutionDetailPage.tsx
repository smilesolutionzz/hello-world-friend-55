import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import Footer from "@/components/ui/footer";
import {
  ArrowLeft, MapPin, CheckCircle, Star, Phone, MessageCircle,
  Building2, Clock, Users, Award, Shield, Sparkles,
} from "lucide-react";

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

const allInstitutions = [
  { id: 'inst_1', name: 'APA발달센터', type: '발달센터', location: '본점', specialties: ['ABA', '발달재활'], description: 'ABA 기반의 체계적인 발달재활 서비스를 제공하는 전문 발달센터입니다.', phone: '010-9266-2710', hours: '평일 09:00 - 18:00' },
  { id: 'inst_2', name: 'APA주간활동서비스센터', type: '발달센터', location: '본점', specialties: ['주간활동', '발달재활'], description: '발달장애인을 위한 주간활동 서비스를 제공합니다.', phone: '010-9266-2710', hours: '평일 09:00 - 18:00' },
  { id: 'inst_3', name: '한점미소발달센터 남양주점', type: '발달센터', location: '경기 남양주', specialties: ['발달재활', '놀이치료'], description: '아이의 미소를 되찾아주는 발달재활 전문 센터입니다.', phone: '010-2224-7037', hours: '평일 09:00 - 18:00' },
  { id: 'inst_4', name: '한점미소발달센터 부천점', type: '발달센터', location: '경기 부천', specialties: ['발달재활', '놀이치료'], description: '부천 지역 발달재활 전문 센터입니다.', phone: '010-9907-4771', hours: '평일 09:00 - 18:00' },
  { id: 'inst_5', name: '우아함발달센터 안산점', type: '발달센터', location: '경기 안산', specialties: ['발달재활', 'ABA'], description: '안산 지역 발달재활과 ABA 서비스를 제공합니다.', phone: '010-9370-4555', hours: '평일 09:00 - 18:00' },
  { id: 'inst_6', name: '우아함발달센터 화성세솔점', type: '발달센터', location: '경기 화성', specialties: ['발달재활', 'ABA'], description: '화성 세솔 지역 발달재활 전문 센터입니다.', phone: '010-9370-4555', hours: '평일 09:00 - 18:00' },
  { id: 'inst_7', name: '메이플 ABA 목동센터', type: 'ABA센터', location: '서울 목동', specialties: ['ABA', '행동치료'], description: 'ABA 전문 치료를 통한 행동 발달을 지원합니다.', phone: '02-6956-0963', hours: '평일 09:00 - 18:00' },
  { id: 'inst_8', name: '엘림아동발달센터', type: '발달센터', location: '대구', specialties: ['언어치료', '인지치료'], description: '대구 지역의 아동 발달 전문 센터입니다.', phone: '010-2790-6522', hours: '평일 09:00 - 18:00' },
  { id: 'inst_9', name: '해웃음 심리발달센터', type: '심리발달센터', location: '서울 강서구', specialties: ['심리상담', '발달재활'], description: '심리상담과 발달재활을 전문으로 하는 통합 센터입니다.', phone: '010-5594-5636', hours: '평일 09:00 - 18:00' },
  { id: 'inst_10', name: '핌발달센터 남양주점', type: '발달센터', location: '경기 남양주', specialties: ['발달재활', '감각통합'], description: '남양주 지역 발달재활 및 감각통합 전문 센터입니다.', phone: '0507-1318-0753', hours: '평일 09:00 - 18:00' },
  { id: 'inst_11', name: '정관언어발달센터', type: '언어발달센터', location: '부산 기장', specialties: ['언어치료', '조음치료'], description: '언어 발달과 조음 치료를 전문으로 합니다.', phone: '010-4595-2564', hours: '평일 09:00 - 18:00' },
  { id: 'inst_12', name: '해오름 아동발달센터', type: '발달센터', location: '부산 기장', specialties: ['발달재활', '놀이치료'], description: '부산 기장 지역의 아동 발달 전문 센터입니다.', phone: '010-4595-2564', hours: '평일 09:00 - 18:00' },
  { id: 'inst_13', name: '넘나들 언어인지학습연구소', type: '연구소', location: '경기 양주', specialties: ['언어치료', '인지학습'], description: '언어 및 인지 학습을 과학적으로 연구하고 치료합니다.', phone: '010-9364-0420', hours: '평일 09:00 - 18:00' },
  { id: 'inst_14', name: '별하언어심리상담센터', type: '심리상담센터', location: '서울 구로', specialties: ['언어치료', '심리상담'], description: '언어치료와 심리상담을 통합적으로 제공합니다.', phone: '02-2686-7942', hours: '평일 09:00 - 18:00' },
  { id: 'inst_15', name: '정아동발달센터', type: '발달센터', location: '전국', specialties: ['발달재활'], description: '아동 발달재활 전문 센터입니다.', hours: '평일 09:00 - 18:00' },
  { id: 'inst_16', name: '소리엘언어발달센터', type: '언어발달센터', location: '부산 동래', specialties: ['언어치료', '발달재활'], description: '언어 발달과 재활을 전문으로 하는 부산 센터입니다.', phone: '0507-1308-9920', hours: '평일 09:00 - 18:00' },
  { id: 'inst_17', name: '나아가다발달상담센터', type: '발달상담센터', location: '부산 연제구', specialties: ['발달상담', '심리상담'], description: '발달상담과 심리상담을 전문으로 합니다.', phone: '051-868-8878', hours: '평일 09:00 - 18:00' },
  { id: 'inst_18', name: '우리aba사회성발달센터', type: '발달센터', location: '경기 의왕', specialties: ['ABA', '사회성발달'], description: 'ABA 기반 사회성 발달 전문 센터입니다.', phone: '010-6731-1541', hours: '평일 09:00 - 18:00' },
  { id: 'inst_19', name: '한걸음발달 연구소', type: '연구소', location: '대구 달서구', specialties: ['발달재활', '연구'], description: '한 걸음 한 걸음 아이의 발달을 연구하고 지원합니다.', phone: '010-9917-1457', hours: '평일 09:00 - 18:00' },
  { id: 'inst_20', name: '참소리언어심리연구소', type: '연구소', location: '경기 화성', specialties: ['언어치료', '심리상담'], description: '언어와 심리를 연구하고 치료하는 전문 연구소입니다.', phone: '031-8003-7509', hours: '평일 09:00 - 18:00' },
  { id: 'inst_21', name: '산본아동발달센터', type: '발달센터', location: '경기 군포', specialties: ['발달재활', '아동발달'], description: '군포 산본 지역 아동 발달 전문 센터입니다.', phone: '0507-1369-0220', hours: '평일 09:00 - 18:00' },
  { id: 'inst_22', name: '도란도란 심리상담센터', type: '심리상담센터', location: '전국', specialties: ['심리상담', '가족치료'], description: '마음을 나누는 도란도란 심리상담 전문 센터입니다.', hours: '평일 09:00 - 18:00' },
  { id: 'inst_23', name: '다다언어심리발달센터', type: '발달센터', location: '울산', specialties: ['언어치료', '심리발달'], description: '울산 지역 언어 및 심리 발달 전문 센터입니다.', phone: '010-4507-1379', hours: '평일 09:00 - 18:00' },
  { id: 'inst_24', name: '풍무아동청소년아동발달센터', type: '발달센터', location: '경기', specialties: ['아동발달', '청소년발달'], description: '아동 및 청소년의 건강한 발달을 지원합니다.', hours: '평일 09:00 - 18:00' },
  { id: 'inst_25', name: '창원튼튼병원 부설 아동발달센터', type: '병원부설', location: '창원', specialties: ['아동발달', '의료상담'], description: '병원 부설로 의료 연계 아동 발달 서비스를 제공합니다.', phone: '010-7472-4799', hours: '평일 09:00 - 18:00' },
  { id: 'inst_26', name: '톡톡말톡톡 언어인지학습센터', type: '학습센터', location: '경기 고양', specialties: ['언어치료', '인지학습'], description: '언어와 인지 학습을 재미있게 돕는 전문 센터입니다.', hours: '평일 09:00 - 18:00' },
  { id: 'inst_27', name: '인애 한의원 강남점', type: '한의원', location: '서울 강남', specialties: ['한방치료', '아동건강'], description: '한방으로 아이의 건강한 성장을 돕는 한의원입니다.', hours: '평일 09:00 - 18:00' },
  { id: 'inst_28', name: '가까이 한의원 강남점', type: '한의원', location: '서울 강남', specialties: ['한방치료', '아동건강'], description: '가까이에서 따뜻하게 돌봐주는 한의원입니다.', hours: '평일 09:00 - 18:00' },
  { id: 'inst_29', name: '굿모닝언어심리발달센터', type: '발달센터', location: '울산', specialties: ['언어치료', '심리발달'], description: '울산 지역 언어 및 심리 발달 전문 센터입니다.', hours: '평일 09:00 - 18:00' },
  { id: 'inst_30', name: '디딤돌언어사회성연구소', type: '연구소', location: '부산', specialties: ['언어치료', '사회성발달'], description: '언어와 사회성 발달을 전문으로 연구하고 치료합니다.', hours: '평일 09:00 - 18:00' },
  { id: 'inst_31', name: '그리미미술 옥포점', type: '미술치료센터', location: '경남 옥포', specialties: ['미술치료', '표현예술'], description: '미술을 통한 표현 예술 치료를 전문으로 합니다.', phone: '010-4115-7152', hours: '평일 09:00 - 18:00' },
  { id: 'inst_32', name: '인애 한의원 안산점', type: '한의원', location: '경기 안산', specialties: ['한방치료', '아동건강'], description: '안산에서 한방으로 아이의 건강을 돌봅니다.', phone: '010-4044-6775', hours: '평일 09:00 - 18:00' },
  { id: 'inst_45', name: '함께하는우리 발달장애 주간활동', type: '주간활동서비스', location: '전국', specialties: ['발달장애', '주간활동'], description: '발달장애인을 위한 주간활동 서비스를 제공합니다.', hours: '평일 09:00 - 18:00' },
  { id: 'inst_46', name: '함께하는우리 방과후활동서비스기관', type: '방과후서비스', location: '전국', specialties: ['방과후활동', '발달장애'], description: '발달장애 청소년을 위한 방과후 활동 서비스를 제공합니다.', hours: '평일 09:00 - 18:00' },
  { id: 'inst_47', name: '한국스포츠과학연구소 장애인주간활동,방과후활동센터 하남점', type: '주간활동서비스', location: '하남', specialties: ['장애인주간활동', '방과후활동', '스포츠과학'], description: '스포츠 과학 기반의 장애인 주간활동 및 방과후 서비스를 제공합니다.', hours: '평일 09:00 - 18:00' },
];

const getFacilityImageByIndex = (index: number) => ALL_FACILITY_IMAGES[index % ALL_FACILITY_IMAGES.length];

const InstitutionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const instIndex = allInstitutions.findIndex(i => i.id === id);
  const institution = instIndex >= 0 ? allInstitutions[instIndex] : null;
  const facilityImage = instIndex >= 0 ? getFacilityImageByIndex(instIndex) : '';

  if (!institution) {
    return (
      <div className="min-h-screen bg-white">
        <UnifiedNavigation />
        <div className="flex flex-col items-center justify-center py-32">
          <Building2 className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-4 text-lg">기관 정보를 찾을 수 없습니다</p>
          <Button onClick={() => navigate('/expert-hiring')} className="rounded-2xl">목록으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  const handleKakaoConsult = () => window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank');

  return (
    <>
      <Helmet>
        <title>{institution.name} | AIHPRO 제휴기관</title>
        <meta name="description" content={`${institution.name} - ${institution.specialties.join(', ')} 전문 기관`} />
      </Helmet>

      <div className="min-h-screen bg-white">
        <UnifiedNavigation />

        {/* 뒤로가기 */}
        <div className="max-w-3xl mx-auto px-4 pt-6">
          <Button variant="ghost" onClick={() => navigate('/expert-hiring')} className="text-muted-foreground hover:text-foreground rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" /> 기관 목록
          </Button>
        </div>

        {/* ─── 시설 이미지 + 기관 정보 ─── */}
        <section className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 1px 3px hsl(var(--foreground)/0.04), 0 8px 30px hsl(var(--foreground)/0.06)', border: '1px solid hsl(var(--border)/0.4)' }}>
            {/* 시설 사진 */}
            <div className="relative h-48 md:h-64 overflow-hidden">
              <img src={facilityImage} alt={institution.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-700">AIHPRO 인증기관</span>
              </div>
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full">
                <MapPin className="w-3.5 h-3.5 text-white/80" />
                <span className="text-xs font-medium text-white">{

institution.location}</span>
              </div>
            </div>

            {/* 기관 정보 */}
            <div className="p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">{institution.name}</h1>
              <p className="text-muted-foreground text-sm mt-1">{institution.type}</p>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                {institution.hours && (
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{institution.hours}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {institution.specialties.map((spec, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-primary/8 text-primary border-0 rounded-lg text-xs font-medium px-2.5 py-1">{spec}</Badge>
                ))}
              </div>

              {/* CTA */}
              <div className="flex gap-2.5 mt-6">
                {institution.phone && (
                  <Button variant="outline" onClick={() => window.open(`tel:${institution.phone}`, '_self')} className="rounded-2xl border-border/50 h-10 px-5">
                    <Phone className="w-4 h-4 mr-1.5" /> 전화 문의
                  </Button>
                )}
                <Button onClick={handleKakaoConsult} className="rounded-2xl h-10 px-6 bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FDD835] shadow-lg">
                  <MessageCircle className="w-4 h-4 mr-1.5" /> 카카오 문의
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 기관 소개 ─── */}
        <section className="max-w-3xl mx-auto px-4 pb-6">
          <div className="bg-white rounded-3xl p-6 border border-border/30" style={{ boxShadow: '0 1px 3px hsl(var(--foreground)/0.03)' }}>
            <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-primary" /> 기관 소개
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{institution.description}</p>
          </div>
        </section>

        {/* ─── 제공 서비스 ─── */}
        <section className="max-w-3xl mx-auto px-4 pb-6">
          <div className="bg-white rounded-3xl p-6 border border-border/30" style={{ boxShadow: '0 1px 3px hsl(var(--foreground)/0.03)' }}>
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Award className="w-4 h-4 text-primary" /> 제공 서비스
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {institution.specialties.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/20">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{spec}</p>
                    <p className="text-xs text-muted-foreground">전문 서비스 제공</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 인증 지표 ─── */}
        <section className="max-w-3xl mx-auto px-4 pb-6">
          <div className="bg-muted/30 rounded-3xl p-6 border border-border/30">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-primary" /> AIHPRO 인증 기관
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { icon: <CheckCircle className="w-6 h-6 text-emerald-500" />, title: '자격 검증', sub: '완료' },
                { icon: <Shield className="w-6 h-6 text-primary" />, title: '기관 인증', sub: '완료' },
                { icon: <Star className="w-6 h-6 text-amber-400" />, title: '이용자 평가', sub: '우수' },
                { icon: <Users className="w-6 h-6 text-primary" />, title: '전문인력', sub: '보유' },
              ].map((item, idx) => (
                <div key={idx} className="p-3">
                  <div className="flex justify-center mb-2">{item.icon}</div>
                  <p className="text-xs font-semibold text-foreground">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="max-w-3xl mx-auto px-4 pb-12">
          <div className="bg-foreground rounded-3xl p-8 text-center">
            <h3 className="text-lg font-bold text-background mb-1">이 기관에 상담을 문의하시겠어요?</h3>
            <p className="text-background/60 text-sm mb-5">카카오톡 또는 전화로 편하게 문의하세요</p>
            <div className="flex justify-center gap-3">
              {institution.phone && (
                <Button variant="outline" size="lg" onClick={() => window.open(`tel:${institution.phone}`, '_self')} className="bg-transparent border-background/20 text-background hover:bg-background/10 rounded-2xl">
                  <Phone className="w-4 h-4 mr-2" /> {institution.phone}
                </Button>
              )}
              <Button size="lg" onClick={handleKakaoConsult} className="bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FDD835] shadow-lg rounded-2xl">
                <MessageCircle className="w-4 h-4 mr-2" /> 카카오톡 문의하기
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default InstitutionDetailPage;
