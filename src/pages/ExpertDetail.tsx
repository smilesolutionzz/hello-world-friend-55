import React, { useState, useEffect } from "react";
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Star, Calendar, Clock, MessageCircle, Video, CheckCircle, MapPin, Shield, Award, 
  Users, Phone, ArrowLeft, Heart, BookOpen, Sparkles, Quote, GraduationCap, Briefcase, 
  Edit3, Camera, Save, X, Wand2, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getExpertImage } from '@/components/expert/ExpertImages';
import { mockExperts as mockExpertsData } from '@/data/mockExperts';
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import Footer from "@/components/ui/footer";
import { ExpertBookingModal } from "@/components/booking/ExpertBookingModal";
import { toast } from "sonner";

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

// 전문분야별 치료 철학 데이터
const specialtyPhilosophyMap: Record<string, { philosophy: string; approach: string[]; education: string[] }> = {
  '언어치료': { philosophy: "언어는 마음의 다리입니다. 말 한마디가 세상과 연결되는 순간, 아이의 눈빛이 달라집니다.", approach: ['놀이중심 언어치료', '자연스러운 환경 중심 접근', '가족참여 치료'], education: ['언어병리학 석사 이상', '언어재활사 1급 자격'] },
  '놀이치료': { philosophy: "놀이는 아이의 언어입니다. 놀이 속에서 아이는 자신의 세계를 표현하고, 스스로 치유합니다.", approach: ['놀이치료', '모래놀이치료', '미술치료'], education: ['아동상담 석사 이상', '놀이치료사 자격'] },
  '심리상담': { philosophy: "마음의 상처는 보이지 않지만, 함께 걸어가면 반드시 치유됩니다.", approach: ['인지행동치료', '정서중심치료', '트라우마 치료'], education: ['임상심리학 석사 이상', '상담심리사 1급'] },
  '감각통합': { philosophy: "감각의 조화가 발달의 기초입니다. 균형 잡힌 성장의 토대를 만들어갑니다.", approach: ['감각통합치료', '작업치료', '일상생활훈련'], education: ['작업치료학 석사 이상', '감각통합전문가 자격'] },
  '발달치료': { philosophy: "모든 아이는 자신만의 발달 시계를 가지고 있습니다. 그 시간을 존중하며 함께 성장합니다.", approach: ['발달재활', '조기중재', '통합치료'], education: ['특수교육학 석사 이상', '발달재활사 자격'] },
  'ABA치료': { philosophy: "작은 성공의 축적이 큰 변화를 만듭니다. 과학적 접근으로 확실한 성장을 이끕니다.", approach: ['ABA 기반 행동치료', '사회성 그룹 프로그램', '부모교육 병행'], education: ['심리학 석사 이상', 'BCBA 국제 행동분석가 자격'] },
  '인지치료': { philosophy: "생각이 바뀌면 행동이 바뀌고, 행동이 바뀌면 삶이 바뀝니다.", approach: ['인지행동치료', '정서조절 훈련', '사회기술 훈련'], education: ['임상심리학 석사 이상', '인지행동치료 전문가 자격'] },
  '가족상담': { philosophy: "부모님의 마음을 치유하는 것이 아이 치료의 첫 번째 단계입니다.", approach: ['가족치료', '부모-아동 상호작용 치료', '감정코칭'], education: ['아동가족학 박사', '가족치료 전문가 자격'] },
  '미술치료': { philosophy: "색과 선으로 마음을 표현할 때, 아이는 진정한 자신을 만납니다.", approach: ['미술치료', '표현예술치료', '집단미술치료'], education: ['미술치료학 석사 이상', '미술치료사 자격'] },
  '음악치료': { philosophy: "리듬과 멜로디 속에서 마음이 열리고, 소통의 문이 열립니다.", approach: ['음악치료', '리듬기반 치료', '그룹 음악활동'], education: ['음악치료학 석사 이상', '음악치료사 자격'] },
  '작업치료': { philosophy: "일상의 작은 동작 하나하나가 독립적인 삶을 향한 큰 걸음입니다.", approach: ['작업치료', '일상생활훈련', '소근육 발달 훈련'], education: ['작업치료학 석사 이상', '작업치료사 면허'] },
  '부모교육': { philosophy: "아이를 가장 잘 아는 것은 부모입니다. 부모의 성장이 아이의 성장입니다.", approach: ['부모교육', '양육코칭', '가정연계 프로그램'], education: ['아동발달학 석사 이상', '부모교육 전문가 자격'] },
  'ADHD': { philosophy: "집중력은 훈련됩니다. 아이의 에너지를 긍정적인 방향으로 이끌어갑니다.", approach: ['주의력 훈련', '행동수정', '학습코칭'], education: ['임상심리학 석사 이상', 'ADHD 전문 상담사 자격'] },
  '자폐': { philosophy: "다름은 틀림이 아닙니다. 아이만의 독특한 세계를 이해하고 소통합니다.", approach: ['사회성 훈련', 'ABA 치료', '구조화된 환경 제공'], education: ['자폐스펙트럼 전문가 과정', '행동분석가 자격'] },
  '사회성': { philosophy: "함께하는 즐거움을 알면, 세상이 더 넓어집니다.", approach: ['사회기술훈련', '또래관계 프로그램', '그룹치료'], education: ['사회복지학 석사 이상', '사회성발달 전문가 자격'] },
  '정서': { philosophy: "감정을 이해하면 자신을 사랑하게 됩니다. 감정의 언어를 가르칩니다.", approach: ['정서조절훈련', '감정코칭', '마음챙김'], education: ['상담심리학 석사 이상', '정서발달 전문가 자격'] },
  '학습': { philosophy: "배움의 즐거움을 알면, 스스로 공부하는 아이가 됩니다.", approach: ['학습치료', '읽기/쓰기 지도', '학습전략 코칭'], education: ['특수교육학 석사 이상', '학습치료사 자격'] },
};

const personalPhilosophyData: Record<string, { philosophy: string; approach: string[]; education: string[]; successCases: number }> = {
  '김민지': { philosophy: "아이의 속도에 맞춰 함께 걸어가는 것, 그것이 진정한 치료의 시작입니다.", approach: ['놀이중심 언어치료', '가족참여 치료', '자연스러운 환경 중심 접근'], education: ['이화여자대학교 언어병리학 석사', '미국 ASHA 인증 과정 수료'], successCases: 156 },
  '박서연': { philosophy: "모든 아이는 자신만의 빛을 가지고 있습니다. 저는 그 빛을 찾아주는 사람입니다.", approach: ['ABA 기반 행동치료', '사회성 그룹 프로그램', '부모교육 병행'], education: ['서울대학교 심리학 박사', 'BCBA 국제 행동분석가 자격'], successCases: 203 },
  '이준호': { philosophy: "변화는 작은 성공의 축적입니다. 매 순간의 진전을 함께 축하합니다.", approach: ['인지행동치료', '정서조절 훈련', '사회기술 훈련'], education: ['연세대학교 임상심리학 석사', '한국임상심리학회 공인 임상심리전문가'], successCases: 178 },
  '최유진': { philosophy: "부모님의 마음을 치유하는 것이 아이 치료의 첫 번째 단계입니다.", approach: ['가족치료', '부모-아동 상호작용 치료', '감정코칭'], education: ['고려대학교 아동학 박사', '미국 가족치료학회 정회원'], successCases: 134 },
  '정하늘': { philosophy: "놀이는 아이의 언어입니다. 놀이를 통해 세상을 배워갑니다.", approach: ['놀이치료', '모래놀이치료', '미술치료'], education: ['숙명여자대학교 아동상담 석사', '국제놀이치료협회 인증'], successCases: 189 },
  '강도윤': { philosophy: "감각의 조화가 발달의 기초입니다. 균형 잡힌 성장을 돕습니다.", approach: ['감각통합치료', '작업치료', '일상생활훈련'], education: ['연세대학교 작업치료학 석사', '감각통합전문가 1급'], successCases: 145 },
  '윤서윤': { philosophy: "언어는 마음의 다리입니다. 소통의 즐거움을 알려드립니다.", approach: ['언어발달치료', '조음치료', 'AAC 보완대체 의사소통'], education: ['한림대학교 언어병리학 박사', '대한언어재활사협회 1급'], successCases: 221 },
  '임채원': { philosophy: "아이의 무한한 가능성을 믿습니다. 함께라면 어떤 벽도 넘을 수 있습니다.", approach: ['발달재활', '조기중재', '통합치료'], education: ['부산대학교 특수교육학 석사', '발달재활서비스 제공자 자격'], successCases: 167 },
};

const getPhilosophyBySpecialty = (name: string, specialties: string[]) => {
  if (personalPhilosophyData[name]) return personalPhilosophyData[name];
  for (const specialty of specialties) {
    for (const [key, data] of Object.entries(specialtyPhilosophyMap)) {
      if (specialty.includes(key) || key.includes(specialty)) {
        return { ...data, successCases: Math.floor(Math.random() * 100) + 100 };
      }
    }
  }
  return { philosophy: "한 사람 한 사람의 고유한 가치를 존중하며, 함께 성장하는 여정을 걸어갑니다.", approach: ['개인 맞춤형 치료', '근거기반 접근', '가족 중심 치료'], education: ['석사 이상 전문 학위', '관련 분야 전문가 자격'], successCases: Math.floor(Math.random() * 50) + 100 };
};

// ─── 프로필 편집 모달 ───
const ExpertEditModal = ({ open, onOpenChange, expert, onSave }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  expert: ExpertDetail;
  onSave: (data: Partial<ExpertDetail>) => void;
}) => {
  const [editData, setEditData] = useState({
    name: expert.name,
    description: expert.description,
    philosophy: expert.philosophy || '',
    location: expert.location,
    hourlyPrice: expert.hourlyPrice,
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiField, setAiField] = useState<string | null>(null);

  const handleAiAssist = async (field: 'description' | 'philosophy') => {
    setAiLoading(true);
    setAiField(field);
    try {
      const prompt = field === 'description'
        ? `전문 치료사 프로필 소개글을 작성해주세요. 이름: ${editData.name}, 전문분야: ${expert.specialty.join(', ')}. 따뜻하고 전문적인 톤으로 3-4문장으로 작성하세요. 한국어로 작성.`
        : `치료사의 치료 철학을 한 줄로 작성해주세요. 이름: ${editData.name}, 전문분야: ${expert.specialty.join(', ')}. 감동적이고 진정성 있는 한 문장으로 작성하세요. 한국어로 작성.`;
      
      const { data, error } = await supabase.functions.invoke('generate-ai-analysis', {
        body: { prompt, type: 'profile_edit' }
      });
      
      if (data?.analysis) {
        setEditData(prev => ({ ...prev, [field]: data.analysis.trim() }));
        toast.success('AI가 내용을 생성했습니다');
      } else {
        toast.error('AI 생성에 실패했습니다');
      }
    } catch {
      toast.error('AI 생성에 실패했습니다');
    } finally {
      setAiLoading(false);
      setAiField(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white rounded-3xl border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">프로필 편집</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* 프로필 사진 */}
          <div className="flex justify-center">
            <div className="relative group">
              <Avatar className="w-24 h-24 ring-4 ring-muted">
                <AvatarImage src={expert.image} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{expert.name[0]}</AvatarFallback>
              </Avatar>
              <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground/70 mb-1.5 block">이름</label>
            <Input value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} className="rounded-xl border-border/50 bg-muted/30 focus:bg-white" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-foreground/70">소개글</label>
              <Button variant="ghost" size="sm" onClick={() => handleAiAssist('description')} disabled={aiLoading} className="text-primary text-xs h-7 px-2 gap-1">
                {aiLoading && aiField === 'description' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                AI 작성
              </Button>
            </div>
            <Textarea value={editData.description} onChange={e => setEditData(p => ({ ...p, description: e.target.value }))} rows={3} className="rounded-xl border-border/50 bg-muted/30 focus:bg-white resize-none" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-foreground/70">치료 철학</label>
              <Button variant="ghost" size="sm" onClick={() => handleAiAssist('philosophy')} disabled={aiLoading} className="text-primary text-xs h-7 px-2 gap-1">
                {aiLoading && aiField === 'philosophy' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                AI 작성
              </Button>
            </div>
            <Textarea value={editData.philosophy} onChange={e => setEditData(p => ({ ...p, philosophy: e.target.value }))} rows={2} className="rounded-xl border-border/50 bg-muted/30 focus:bg-white resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground/70 mb-1.5 block">지역</label>
              <Input value={editData.location} onChange={e => setEditData(p => ({ ...p, location: e.target.value }))} className="rounded-xl border-border/50 bg-muted/30 focus:bg-white" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground/70 mb-1.5 block">상담료 (토큰)</label>
              <Input type="number" value={editData.hourlyPrice} onChange={e => setEditData(p => ({ ...p, hourlyPrice: Number(e.target.value) }))} className="rounded-xl border-border/50 bg-muted/30 focus:bg-white" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-2xl h-11 border-border/50">
              <X className="w-4 h-4 mr-1" /> 취소
            </Button>
            <Button onClick={() => { onSave(editData); onOpenChange(false); toast.success('프로필이 저장되었습니다'); }} className="flex-1 rounded-2xl h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Save className="w-4 h-4 mr-1" /> 저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── 메인 페이지 ───
const ExpertDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expert, setExpert] = useState<ExpertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => { loadExpert(); }, [id]);

  const loadExpert = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: dbExpert } = await supabase.from('experts').select('*').eq('id', id).single();

      if (dbExpert) {
        if (user && dbExpert.user_id === user.id) setIsOwner(true);
        const name = dbExpert.full_name;
        const specialties = dbExpert.specializations || [];
        const extraData = getPhilosophyBySpecialty(name, specialties);
        setExpert({
          id: dbExpert.id, name, specialty: specialties, credentials: dbExpert.certifications || [],
          rating: dbExpert.average_rating || 4.5, reviews: dbExpert.total_sessions || 0,
          experience: `${dbExpert.years_experience}년`, hourlyPrice: dbExpert.hourly_rate,
          image: getExpertImage(name) || dbExpert.profile_image_url || '', description: dbExpert.bio || '',
          location: '온라인', isOnline: true, responseTime: '평균 2시간 이내',
          philosophy: extraData.philosophy, approach: extraData.approach, education: extraData.education, successCases: extraData.successCases,
        });
      } else {
        const mockExpert = mockExpertsData.find(e => e.id === id);
        if (mockExpert) {
          const name = mockExpert.name.replace(' 치료사', '').replace(' 박사', '').replace(' 교수', '');
          const specialties = mockExpert.categories || [];
          const extraData = getPhilosophyBySpecialty(name, specialties);
          setExpert({
            id: mockExpert.id, name, specialty: specialties, credentials: [mockExpert.credential],
            rating: mockExpert.rating, reviews: Math.floor(Math.random() * 100) + 20, experience: '경력 다년',
            hourlyPrice: mockExpert.price_per_50 || 30000, image: mockExpert.photo_url || '',
            description: mockExpert.intro || '', location: mockExpert.region || '온라인', isOnline: mockExpert.online || false,
            responseTime: '평균 2시간 이내', philosophy: extraData.philosophy, approach: extraData.approach,
            education: extraData.education, successCases: extraData.successCases,
          });
        }
      }
    } catch (error) { console.error('Error loading expert:', error); }
    finally { setLoading(false); }
  };

  const handleSaveProfile = (data: Partial<ExpertDetail>) => {
    if (expert) setExpert({ ...expert, ...data });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <UnifiedNavigation />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-white">
        <UnifiedNavigation />
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-muted-foreground mb-4">전문가를 찾을 수 없습니다</p>
          <Button onClick={() => navigate('/expert-hiring')} className="rounded-2xl">목록으로 돌아가기</Button>
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

      <div className="min-h-screen bg-white">
        <UnifiedNavigation />

        {/* 뒤로가기 + 편집 */}
        <div className="max-w-3xl mx-auto px-4 pt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/expert-hiring')} className="text-muted-foreground hover:text-foreground rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" /> 전문가 목록
          </Button>
          {isOwner && (
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)} className="rounded-xl border-border/50 text-muted-foreground gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> 프로필 편집
            </Button>
          )}
        </div>

        {/* ─── 프로필 헤더 ─── */}
        <section className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl p-8 md:p-10" style={{ boxShadow: '0 1px 3px hsl(var(--foreground)/0.04), 0 8px 30px hsl(var(--foreground)/0.06)', border: '1px solid hsl(var(--border)/0.4)' }}>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
              {/* 아바타 */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-28 h-28 md:w-32 md:h-32 rounded-2xl ring-2 ring-muted/50">
                  <AvatarImage src={expert.image} className="rounded-2xl object-cover" />
                  <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-3xl">{expert.name[0]}</AvatarFallback>
                </Avatar>
                {expert.isOnline && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-[3px] border-white rounded-full animate-pulse" />
                )}
                {expert.rating >= 4.8 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">TOP</div>
                )}
              </div>

              {/* 기본 정보 */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">{expert.name}</h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-foreground">{expert.rating}</span>
                    <span>({expert.reviews}건)</span>
                  </span>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{expert.experience}</span>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{expert.location}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-4 justify-center md:justify-start">
                  {expert.specialty.map((spec, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-primary/8 text-primary border-0 rounded-lg text-xs font-medium px-2.5 py-1">{spec}</Badge>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex gap-2.5 mt-5 justify-center md:justify-start">
                  <Button variant="outline" onClick={() => window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank')} className="rounded-2xl border-border/50 h-10 px-5">
                    <MessageCircle className="w-4 h-4 mr-1.5" /> 카카오 문의
                  </Button>
                  <Button onClick={() => setBookingModalOpen(true)} className="rounded-2xl h-10 px-6 shadow-lg shadow-primary/15">
                    <Calendar className="w-4 h-4 mr-1.5" /> 상담 예약
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 치료 철학 ─── */}
        {expert.philosophy && (
          <section className="max-w-3xl mx-auto px-4 pb-6">
            <div className="bg-muted/30 rounded-3xl p-7 md:p-8 border border-border/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Quote className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">치료 철학</p>
                  <p className="text-lg md:text-xl font-medium text-foreground leading-relaxed italic">
                    "{expert.philosophy}"
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── 상세 정보 그리드 ─── */}
        <section className="max-w-3xl mx-auto px-4 pb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* 치료 접근법 */}
            <div className="bg-white rounded-3xl p-6 border border-border/30" style={{ boxShadow: '0 1px 3px hsl(var(--foreground)/0.03)' }}>
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-primary" /> 치료 접근법
              </h3>
              <ul className="space-y-3">
                {expert.approach?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 학력 및 자격 */}
            <div className="bg-white rounded-3xl p-6 border border-border/30" style={{ boxShadow: '0 1px 3px hsl(var(--foreground)/0.03)' }}>
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-primary" /> 학력 및 자격
              </h3>
              <ul className="space-y-3">
                {expert.education?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
                {expert.credentials.map((cred, idx) => (
                  <li key={`c-${idx}`} className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{cred}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── 성과 통계 ─── */}
        <section className="max-w-3xl mx-auto px-4 pb-6">
          <div className="bg-foreground/[0.03] rounded-3xl p-6 border border-border/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: `${expert.successCases}+`, label: '상담 완료' },
                { value: expert.rating.toString(), label: '평균 평점' },
                { value: expert.experience, label: '경력' },
                { value: '98%', label: '재방문율' },
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="text-2xl md:text-3xl font-extrabold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 상세 소개 ─── */}
        {expert.description && (
          <section className="max-w-3xl mx-auto px-4 pb-6">
            <div className="bg-white rounded-3xl p-6 border border-border/30" style={{ boxShadow: '0 1px 3px hsl(var(--foreground)/0.03)' }}>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-primary" /> 상세 소개
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{expert.description}</p>
            </div>
          </section>
        )}

        {/* ─── 가격 및 예약 CTA ─── */}
        <section className="max-w-3xl mx-auto px-4 pb-12">
          <div className="bg-foreground rounded-3xl p-8 text-center">
            <h3 className="text-lg font-bold text-background mb-1">지금 바로 상담을 예약하세요</h3>
            <p className="text-background/60 text-sm mb-5">첫 상담 후 만족하지 않으시면 100% 환불해 드립니다</p>
            <div className="flex items-center justify-center gap-6">
              <div>
                <span className="text-3xl font-extrabold text-background">{expert.hourlyPrice.toLocaleString()}</span>
                <span className="text-background/50 text-sm ml-1">토큰 / 60분</span>
              </div>
              <Button size="lg" onClick={() => setBookingModalOpen(true)} className="bg-background text-foreground hover:bg-background/90 rounded-2xl font-bold shadow-lg h-12 px-8">
                <Calendar className="w-5 h-5 mr-2" /> 예약하기
              </Button>
            </div>
          </div>
        </section>

        <Footer />

        {expert && (
          <ExpertBookingModal
            open={bookingModalOpen}
            onOpenChange={setBookingModalOpen}
            expert={{ id: expert.id, name: expert.name, specialty: expert.specialty, hourlyPrice: expert.hourlyPrice, image: expert.image }}
          />
        )}
        {expert && (
          <ExpertEditModal open={editModalOpen} onOpenChange={setEditModalOpen} expert={expert} onSave={handleSaveProfile} />
        )}
      </div>
    </>
  );
};

export default ExpertDetailPage;
