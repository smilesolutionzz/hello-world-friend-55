import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { trackB2BEvent } from '@/hooks/useB2BFunnelTracking';
import { 
  BarChart3, CheckCircle2, ArrowRight, 
  Users, Eye, Megaphone, TrendingUp, Star, Sparkles,
  Building2, Phone, Mail, Target, Zap, Award,
  ChevronDown, MousePointerClick, Globe, Gift, Flame,
  Paperclip, X, Calendar as CalendarIcon, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BusinessSEO from '@/components/b2b/BusinessSEO';
import BusinessBreadcrumb from '@/components/b2b/BusinessBreadcrumb';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
};

const ROTATING_KEYWORDS = [
  'ADHD 자가진단', '우울증 테스트', '불안장애 검사', '자존감 테스트',
  '아이 발달검사', '스트레스 측정', '공황장애 자가진단', 'PTSD 검사',
  '번아웃 테스트', '성격유형 검사', '조울증 테스트', '강박증 자가진단',
  '치매 조기검사', '인지능력 테스트', '아동 ADHD 체크', '산후우울증 검사',
  '사회불안 테스트', '분노조절 검사', '수면장애 테스트', '학습장애 검사',
  '언어발달 체크', '감정조절 테스트', '직장 스트레스 진단', '연인관계 검사',
  '자폐스펙트럼 선별', '노인 인지기능', '청소년 심리검사', '가족관계 진단',
];

const B2BProposal = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    institution_name: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    institution_type: '',
    message: '',
    preferred_contact_at: '', // datetime-local 문자열
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [kwIndex, setKwIndex] = useState(0);

  const MAX_FILE_SIZE_MB = 20;
  const ALLOWED_EXT = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'hwp', 'txt', 'png', 'jpg', 'jpeg'];

  const handleFilePick = (file: File | null) => {
    if (!file) {
      setAttachment(null);
      return;
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_SIZE_MB) {
      toast({ title: '파일이 너무 큽니다', description: `${MAX_FILE_SIZE_MB}MB 이하만 업로드 가능합니다.`, variant: 'destructive' });
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXT.includes(ext)) {
      toast({ title: '지원하지 않는 형식', description: 'PDF, DOC, XLS, PPT, HWP, 이미지만 가능합니다.', variant: 'destructive' });
      return;
    }
    setAttachment(file);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setKwIndex(prev => (prev + 1) % ROTATING_KEYWORDS.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async () => {
    if (!formData.institution_name || !formData.contact_name || !formData.contact_phone) {
      toast({ title: '기관명, 담당자명, 연락처를 입력해주세요.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      // 1) 첨부파일 먼저 업로드 (있으면)
      let attachmentUrl: string | null = null;
      let attachmentFilename: string | null = null;
      if (attachment) {
        setUploadingFile(true);
        const folder = crypto.randomUUID();
        const safeName = attachment.name.replace(/[^\w.\-가-힣]/g, '_');
        const path = `${folder}/${safeName}`;
        const { error: upErr } = await supabase.storage
          .from('b2b-attachments')
          .upload(path, attachment, { upsert: false, contentType: attachment.type || undefined });
        setUploadingFile(false);
        if (upErr) throw new Error(`첨부파일 업로드 실패: ${upErr.message}`);
        attachmentUrl = path;
        attachmentFilename = attachment.name;
      }

      const preferredAt = formData.preferred_contact_at
        ? new Date(formData.preferred_contact_at).toISOString()
        : null;

      const { data: inserted, error } = await supabase
        .from('b2b_ad_inquiries')
        .insert({
          institution_name: formData.institution_name,
          contact_name: formData.contact_name,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email || 'N/A',
          institution_type: formData.institution_type || '기타',
          message: formData.message || null,
          attachment_url: attachmentUrl,
          attachment_filename: attachmentFilename,
          preferred_contact_at: preferredAt,
        })
        .select('id')
        .maybeSingle();
      if (error) throw error;

      // 관리자 이메일 알림 (실패해도 사용자 흐름은 막지 않음)
      supabase.functions
        .invoke('notify-b2b-inquiry', {
          body: {
            source: 'b2b_proposal',
            inquiry_id: inserted?.id,
            institution_name: formData.institution_name,
            contact_name: formData.contact_name,
            contact_phone: formData.contact_phone,
            contact_email: formData.contact_email || 'N/A',
            institution_type: formData.institution_type || '기타',
            message: formData.message || null,
            attachment_filename: attachmentFilename,
            preferred_contact_at: preferredAt,
          },
        })
        .catch((err) => console.warn('[notify-b2b-inquiry] failed:', err));

      toast({ title: '도입 문의가 접수되었습니다!', description: '영업일 기준 1일 이내 연락드리겠습니다.' });
      setFormData({ institution_name: '', contact_name: '', contact_phone: '', contact_email: '', institution_type: '', message: '', preferred_contact_at: '' });
      setAttachment(null);
    } catch (e: any) {
      toast({ title: '오류가 발생했습니다', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
      setUploadingFile(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <BusinessSEO
        title="제휴·도입 문의 — AIHPRO Business"
        description="검사 끝난 사용자를 내 센터로, 잡코치 도입 문의와 광고 제휴를 한 번에."
        path="/b2b-proposal"
      />
      <BusinessBreadcrumb current="제휴·도입 문의" />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-violet-400 rounded-full blur-[150px]" />
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-28 max-w-5xl">
          <motion.div initial="hidden" animate="visible" className="text-center">
            <motion.div variants={fadeUp} custom={0}>
              <Badge className="mb-6 bg-amber-500/20 text-amber-300 border-amber-500/30 text-sm px-4 py-1.5">
                <Flame className="w-3.5 h-3.5 mr-1.5" />
                첫 달 무료 · 선착순 20개 기관
              </Badge>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              "<AnimatePresence mode="wait">
                <motion.span
                  key={kwIndex}
                  initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                  transition={{ duration: 0.5 }}
                  className="inline-block text-amber-400"
                >
                  {ROTATING_KEYWORDS[kwIndex]}
                </motion.span>
              </AnimatePresence>" 검색한 유저가<br />
              <span className="text-indigo-400">내 센터를 바로 찾게 하세요</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-4">
              매달 수천 명이 AIHPRO에서 심리검사를 합니다<br />
              <span className="text-indigo-300 font-medium">검사 끝나는 순간, "근처 전문기관"으로 귀 센터가 뜹니다</span>
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap justify-center gap-2.5 text-sm text-slate-400 mb-10">
              {['상담센터', '병원', '발달센터', '치료실', '한의원', '복지시설', '노인주간활동센터', '장애인주간활동센터', '방과후센터', '요양시설'].map(t => (
                <span key={t} className="px-3 py-1 rounded-full border border-slate-700 bg-slate-800/50">{t}</span>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} custom={4} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-indigo-500 hover:bg-indigo-600 text-white text-lg px-8 h-14 rounded-xl shadow-lg shadow-indigo-500/25"
                onClick={() => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' })}
              >
                무료 체험 신청하기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-slate-500 text-slate-200 hover:bg-slate-700/50 text-lg px-8 h-14 rounded-xl"
                onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
              >
                어떻게 노출되나요?
                <ChevronDown className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>

            {/* 유입 키워드 클라우드 */}
            <motion.div variants={fadeUp} custom={5} className="mt-14">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Search className="w-4 h-4 text-indigo-400" />
                <p className="text-sm text-slate-400 tracking-wide font-medium">실시간 유입 검색 키워드</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
                {ROTATING_KEYWORDS.map((kw, i) => (
                  <motion.span
                    key={kw}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03, duration: 0.4 }}
                    className={`px-4 py-2 rounded-full font-medium cursor-default transition-all duration-300 hover:scale-110 ${
                      kwIndex === i
                        ? 'bg-amber-500/30 text-amber-200 border-2 border-amber-400/60 shadow-lg shadow-amber-500/20 text-sm scale-110'
                        : i < 8
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-sm'
                          : i < 18
                            ? 'bg-slate-700/50 text-slate-300 border border-slate-600/30 text-xs'
                            : 'bg-slate-800/30 text-slate-500 border border-slate-700/20 text-xs'
                    }`}
                  >
                    {kw}
                  </motion.span>
                ))}
              </div>
              <motion.div 
                variants={fadeUp} custom={6}
                className="mt-8 mx-auto max-w-2xl bg-gradient-to-r from-indigo-900/50 via-violet-900/50 to-indigo-900/50 border border-indigo-500/20 rounded-2xl p-5"
              >
                <p className="text-lg md:text-xl font-bold text-white leading-relaxed">
                  💡 이 검색어를 친 유저가 검사 후<br />
                  <span className="text-2xl md:text-3xl text-amber-400 font-extrabold">"내 근처 전문기관"</span>
                  <span className="text-lg md:text-xl">에서<br />귀 센터를 발견합니다</span>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 핵심 수치 — 왜 여기에 광고해야 하나 */}
      <section className="py-14 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-center text-lg font-semibold text-slate-500 mb-8">이미 이만큼의 유저가 모여 있습니다</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '10,000+', label: '월간 페이지뷰', icon: Eye },
              { value: '39.6%', label: '검사 전환율', icon: MousePointerClick },
              { value: '23K', label: '유튜브 구독자', icon: Users },
              { value: '30종+', label: 'AI 심리검사', icon: BarChart3 },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="text-center p-5 rounded-xl bg-slate-50"
              >
                <stat.icon className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 이런 고민 있으시죠? */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              센터 원장님, 이런 고민 있으시죠?
            </motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {[
              '블로그 마케팅 효과가 갈수록 떨어진다',
              '네이버 플레이스 광고비만 나가고 전환이 안 된다',
              '메타(인스타/페북) 광고에 월 100~300만원 쓰는데 효과를 모르겠다',
              '검사 받으러 온 고객이 우리 센터를 모른다',
              '홍보할 채널이 마땅히 없다',
            ].map((pain, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200"
              >
                <span className="text-red-400 text-lg shrink-0">😩</span>
                <p className="text-sm text-slate-700">{pain}</p>
              </motion.div>
            ))}
          </div>
          <motion.p variants={fadeUp} custom={5} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mt-8 text-indigo-600 font-semibold"
          >
            → AIHPRO는 "이미 검사를 마친 유저"에게 귀 센터를 바로 보여줍니다
          </motion.p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              이렇게 노출됩니다
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-500">
              유저의 검사 → 결과 → 기관 탐색 여정에 자연스럽게 녹아듭니다
            </motion.p>
          </motion.div>
          <div className="space-y-6">
            {[
              { step: '1', title: '유저가 심리검사 수행', desc: 'ADHD, 우울, 발달, 인지 등 30종+ 검사 — 이미 고민이 있는 고관여 유저', color: 'bg-indigo-500', emoji: '🧠' },
              { step: '2', title: '결과 페이지에서 기관 추천', desc: '"검사 결과 기반 추천 전문기관"으로 귀 센터가 자연스럽게 노출', color: 'bg-violet-500', emoji: '📊' },
              { step: '3', title: '기관 프로필로 유입', desc: '전문 분야, 위치, 소개, 후기, 예약 링크 — 네이버 플레이스보다 전환율 높음', color: 'bg-rose-500', emoji: '🏥' },
              { step: '4', title: '전화/예약으로 전환', desc: '검사 → 결과 → 예약까지 3분. 이미 필요를 느낀 유저가 바로 행동', color: 'bg-amber-500', emoji: '📞' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="flex items-start gap-5"
              >
                <div className={`w-10 h-10 rounded-full ${item.color} text-white flex items-center justify-center font-bold shrink-0 text-sm`}>
                  {item.step}
                </div>
                <div className="flex-1 pb-6 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-1">{item.emoji} {item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 비교: 기존 광고 vs AIHPRO */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-slate-900">
              기존 광고 vs AIHPRO 광고
            </motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Card className="h-full border-red-200 bg-red-50/50">
                <CardContent className="p-6">
                  <h3 className="font-bold text-red-700 mb-4 flex items-center gap-2">
                    <span className="text-lg">😞</span> 기존 광고
                  </h3>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-start gap-2"><span className="text-red-400 shrink-0">✗</span> 네이버 광고 — 클릭당 500~2,000원, 전환율 1~3%</div>
                    <div className="flex items-start gap-2"><span className="text-red-400 shrink-0">✗</span> 블로그 마케팅 — 효과 측정 불가, 시간 소모</div>
                    <div className="flex items-start gap-2"><span className="text-red-400 shrink-0">✗</span> SNS 광고 — 관심 없는 사람에게도 노출</div>
                    <div className="flex items-start gap-2"><span className="text-red-400 shrink-0">✗</span> 전단지/현수막 — 효과 제로에 가까움</div>
                    <div className="mt-4 p-3 bg-red-100 rounded-lg text-red-700 font-medium text-center text-xs">
                      월 50~100만원 광고비, 실제 내원 전환 2~5건
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Card className="h-full border-indigo-300 bg-indigo-50/50 shadow-lg shadow-indigo-100">
                <CardContent className="p-6">
                  <h3 className="font-bold text-indigo-700 mb-4 flex items-center gap-2">
                    <span className="text-lg">🎯</span> AIHPRO 광고
                  </h3>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-start gap-2"><span className="text-indigo-500 shrink-0">✓</span> 검사 완료 유저에게만 노출 — <strong>고관여 타겟</strong></div>
                    <div className="flex items-start gap-2"><span className="text-indigo-500 shrink-0">✓</span> 검사 결과 기반 매칭 — <strong>정밀 추천</strong></div>
                    <div className="flex items-start gap-2"><span className="text-indigo-500 shrink-0">✓</span> 클릭/전환 실시간 대시보드 — <strong>효과 측정</strong></div>
                    <div className="flex items-start gap-2"><span className="text-indigo-500 shrink-0">✓</span> 23K 유튜브 채널 신뢰도 — <strong>브랜드 후광</strong></div>
                    <div className="mt-4 p-3 bg-indigo-100 rounded-lg text-indigo-700 font-medium text-center text-xs">
                      월 9.9만원부터, 이미 검사한 유저가 직접 예약
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ad Products — 금액 다운 */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.div variants={fadeUp} custom={0}>
              <Badge className="mb-4 bg-indigo-50 text-indigo-700 border-indigo-200">광고 상품</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              네이버 광고비의 1/5 가격으로 시작하세요
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-500 text-sm">
              첫 달 무료 체험 · 언제든 해지 가능 · 연간 결제 시 20% 할인
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 overflow-visible pt-6">
            {[
              {
                name: '베이직',
                price: '9.9',
                period: '월',
                badge: null,
                highlight: '커피값으로 시작',
                features: [
                  '검사 결과 페이지 하단 노출',
                  '기관 프로필 페이지 생성',
                  '월간 노출 리포트',
                  '기관 로고 + 한줄 소개',
                  '전화번호 / 예약링크 연결',
                ],
              },
              {
                name: '스탠다드',
                price: '29.9',
                period: '월',
                badge: '가성비 최고',
                highlight: '네이버 광고비의 1/3',
                features: [
                  '베이직 전체 포함',
                  '메인 홈 "추천 기관" 노출',
                  '검사 결과 내 우선 추천',
                  '기관 상세 페이지 (소개·후기)',
                  '클릭/전환 분석 대시보드',
                  '지역 기반 타겟팅',
                ],
              },
              {
                name: '프리미엄',
                price: '59.9',
                period: '월',
                badge: '최대 효과',
                highlight: '독점 노출 + 콘텐츠 마케팅',
                features: [
                  '스탠다드 전체 포함',
                  '해당 검사 카테고리 독점 노출',
                  '유튜브 23K 채널 공동 콘텐츠 (월 1회)',
                  'SEO 블로그 콘텐츠 제작',
                  'SNS 공동 마케팅',
                  '전담 광고 매니저',
                ],
              },
            ].map((plan, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className={`h-full relative overflow-visible rounded-2xl ${plan.badge === '가성비 최고' ? 'border-2 border-indigo-400 shadow-2xl shadow-indigo-200/50 bg-gradient-to-b from-indigo-50/50 to-white' : 'border border-slate-200 shadow-lg hover:shadow-xl transition-shadow'}`}>
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <Badge className={`text-sm px-4 py-1.5 shadow-md ${plan.badge === '가성비 최고' ? 'bg-indigo-500 text-white shadow-indigo-300' : 'bg-amber-500 text-white shadow-amber-300'}`}>
                        <Star className="w-3.5 h-3.5 mr-1.5" />{plan.badge}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-7 pt-10">
                    <div className="text-center mb-7">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                      <p className="text-xs text-indigo-500 font-medium mb-4">{plan.highlight}</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-extrabold text-slate-900">₩{plan.price}</span>
                        <span className="text-slate-500 text-base">만/{plan.period}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">VAT 별도</p>
                    </div>
                    <div className="h-px bg-slate-100 mb-6" />
                    <ul className="space-y-3.5 mb-8">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full rounded-xl h-13 text-base font-semibold ${plan.badge === '가성비 최고' ? 'bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-200' : ''}`}
                      variant={plan.badge === '가성비 최고' ? 'default' : 'outline'}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, message: `${plan.name} 광고 상품 (${plan.price}만원/월) 문의` }));
                        document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {i === 0 ? '무료 체험 시작' : '광고 문의하기'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center"
          >
            <p className="text-sm text-amber-800">
              <Gift className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              <strong>오픈 특가:</strong> 선착순 20개 기관 첫 달 무료 + 베이직 3개월 ₩9.9만 (67% 할인)
            </p>
          </motion.div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry" className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              1분 만에 신청하세요
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-500">
              첫 달 무료 · 영업일 1일 이내 연락
            </motion.p>
          </motion.div>

          <Card className="border-slate-200 shadow-lg">
            <CardContent className="p-6 md:p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">기관명 *</label>
                  <Input 
                    value={formData.institution_name}
                    onChange={e => setFormData(p => ({ ...p, institution_name: e.target.value }))}
                    placeholder="예: 마음힐링 심리상담센터"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">기관 유형</label>
                  <Input 
                    value={formData.institution_type}
                    onChange={e => setFormData(p => ({ ...p, institution_type: e.target.value }))}
                    placeholder="예: 심리상담센터, 병원, 발달센터"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">담당자명 *</label>
                  <Input 
                    value={formData.contact_name}
                    onChange={e => setFormData(p => ({ ...p, contact_name: e.target.value }))}
                    placeholder="홍길동"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">연락처 *</label>
                  <Input 
                    value={formData.contact_phone}
                    onChange={e => setFormData(p => ({ ...p, contact_phone: e.target.value }))}
                    placeholder="010-1234-5678"
                    className="h-11"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">이메일</label>
                <Input 
                  type="email"
                  value={formData.contact_email}
                  onChange={e => setFormData(p => ({ ...p, contact_email: e.target.value }))}
                  placeholder="email@center.com"
                  className="h-11"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">문의 내용</label>
                <Textarea 
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  placeholder="관심 있는 상품, RFP 요청사항, 궁금한 점을 적어주세요"
                  rows={3}
                />
              </div>

              {/* 희망 미팅 시간 */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-indigo-500" />
                  희망 미팅 시간 <span className="text-slate-400 font-normal">(선택)</span>
                </label>
                <Input
                  type="datetime-local"
                  value={formData.preferred_contact_at}
                  onChange={e => setFormData(p => ({ ...p, preferred_contact_at: e.target.value }))}
                  className="h-11"
                />
                <p className="text-xs text-slate-400 mt-1.5">선택하시면 가능 여부를 확인 후 30분 화상/전화 미팅을 잡아드립니다.</p>
              </div>

              {/* 첨부파일 */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-indigo-500" />
                  첨부파일 <span className="text-slate-400 font-normal">(선택, RFP·보안 체크리스트 등 / 최대 20MB)</span>
                </label>
                {!attachment ? (
                  <label className="flex items-center justify-center gap-2 h-11 px-4 rounded-md border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer text-sm text-slate-600 transition">
                    <Paperclip className="w-4 h-4" />
                    파일 선택 (PDF, DOC, XLS, PPT, HWP, 이미지)
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp,.txt,.png,.jpg,.jpeg"
                      onChange={e => handleFilePick(e.target.files?.[0] ?? null)}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-2 h-11 px-3 rounded-md border border-slate-200 bg-white text-sm">
                    <span className="flex items-center gap-2 truncate">
                      <Paperclip className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="truncate text-slate-700">{attachment.name}</span>
                      <span className="text-xs text-slate-400 shrink-0">({(attachment.size / 1024 / 1024).toFixed(2)}MB)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500"
                      aria-label="첨부파일 제거"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  업로드된 파일은 비공개 저장공간에 보관되며, 관리자만 열람할 수 있습니다.
                </p>
              </div>

              <Button 
                className="w-full h-13 text-lg bg-indigo-500 hover:bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (uploadingFile ? '파일 업로드 중...' : '접수 중...') : '도입 문의 보내기'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-xs text-slate-400 text-center">
                * 첫 달 무료 체험 후 유지 여부를 결정하시면 됩니다. 위약금 없음.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 협력기관 — 맨 아래 배치 */}
      <section className="py-12 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <p className="text-center text-sm text-slate-400 mb-6">신뢰할 수 있는 플랫폼</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '47개', label: '제휴 기관' },
              { value: '23K', label: '유튜브 구독자' },
              { value: '30종+', label: 'AI 검사' },
              { value: '39.6%', label: '검사 전환율' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-lg bg-slate-50">
                <div className="text-xl font-bold text-indigo-600 mb-0.5">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 다른 B2B 솔루션으로의 안내 (중복 임베드 대신 링크 분리) */}
      <section className="border-t border-border/60 bg-white py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs tracking-[0.2em] text-foreground/50 mb-3">EXPLORE MORE</p>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 break-keep">
            다른 B2B 솔루션
          </h2>
          <p className="text-foreground/60 mb-10 break-keep">
            잡코치, HR 대시보드, 화이트라벨 리포트는 비즈니스 허브에서 한눈에 확인할 수 있습니다.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-8 h-12"
            onClick={() => navigate('/business')}
          >
            비즈니스 허브 보기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer CTA — 가격 하드코딩 제거, 도입 문의 단일화 */}
      <section className="bg-white border-t border-border/60 py-14">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 break-keep">
            제휴·도입 문의
          </h2>
          <p className="text-foreground/60 mb-6 text-sm break-keep">
            상세 견적과 파일럿 조건은 상담을 통해 안내드립니다.
          </p>
          <Button
            size="lg"
            className="rounded-full px-10 h-12 bg-foreground text-background hover:bg-foreground/90"
            onClick={() => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' })}
          >
            문의 폼으로 이동
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-xs text-foreground/50 mt-8">
            <span className="inline-flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> ad@aihpro.app
            </span>
            <span className="hidden sm:block">·</span>
            <span className="inline-flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" /> aihpro.app
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default B2BProposal;
