import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Play, Star, AlertTriangle, Clock, CheckCircle2, ArrowRight, Sparkles, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface StoryCard {
  emoji: string;
  situation: string;
  pain: string;
  discovery: string;
  result: string;
  quote: string;
  author: string;
  authorDetail: string;
  tags: string[];
  highlight: string;
}

const EmotionalHookSection = () => {
  const navigate = useNavigate();
  const [activeStory, setActiveStory] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const emotionalStories: StoryCard[] = [
    {
      emoji: "😢",
      situation: "아이가 말이 너무 늦어요",
      pain: "18개월인데 아직 '엄마'도 안 해요. 주변에선 '기다려봐'라고 하는데... 밤마다 불안해요.",
      discovery: "3분 검사 후 '언어발달 지연 가능성' 알림을 받았어요",
      result: "조기 언어치료 시작 후 6개월 만에 2어문장 구사!",
      quote: "그때 검사 안 했으면 골든타임 놓칠 뻔했어요. 정말 감사해요.",
      author: "서울 은평구 J맘",
      authorDetail: "24개월 아들맘",
      tags: ["언어발달지연", "골든타임", "조기치료"],
      highlight: "6개월 만에 2어문장"
    },
    {
      emoji: "💔",
      situation: "우리 아이만 왕따 당하는 것 같아요",
      pain: "학교에서 친구가 없대요. 쉬는 시간에 혼자 책만 읽는다고... 엄마 마음이 찢어져요.",
      discovery: "사회성 발달 검사에서 '자폐 스펙트럼 경계' 가능성 발견",
      result: "사회성 그룹치료 1년 후 친구 3명 생겼어요!",
      quote: "단순히 내성적인 줄 알았는데... 검사 덕분에 아이를 이해하게 됐어요.",
      author: "경기 수원시 K맘",
      authorDetail: "8세 딸맘",
      tags: ["사회성발달", "자폐스펙트럼", "그룹치료"],
      highlight: "친구 3명 생김"
    },
    {
      emoji: "😰",
      situation: "공부하다가 자꾸 울어요",
      pain: "수학 숙제만 시키면 멍해지고 눈물이 나온대요. 학원을 더 보내야 하나...",
      discovery: "검사 결과 '학습장애(난산증)' + '불안장애' 동시 발견",
      result: "맞춤 학습 + 놀이치료 병행으로 수학 성적 40점→85점!",
      quote: "아이가 공부를 싫어하는 게 아니라 어려웠던 거였어요. 미안하고 감사해요.",
      author: "서울 강남구 P맘",
      authorDetail: "10세 아들맘",
      tags: ["학습장애", "불안장애", "맞춤학습"],
      highlight: "수학 40→85점"
    },
    {
      emoji: "🥺",
      situation: "저도 우울한데 티 못 내요",
      pain: "아이 챙기랴, 직장 다니랴... 화장실에서 몰래 울어요. 아무한테도 말 못해요.",
      discovery: "3분 자가검사에서 '중등도 우울증' 결과를 받았어요",
      result: "비대면 상담 + 약물치료로 6개월 만에 회복!",
      quote: "혼자 버티다 무너질 뻔했어요. 익명 검사라 용기 낼 수 있었어요.",
      author: "인천 남동구 워킹맘",
      authorDetail: "35세 두아이 엄마",
      tags: ["육아우울증", "워킹맘", "비대면상담"],
      highlight: "6개월 만에 회복"
    },
    {
      emoji: "😤",
      situation: "남편이 자꾸 화를 내요",
      pain: "작은 일에도 폭발해요. 아이들 앞에서도... 이혼을 생각하기도 했어요.",
      discovery: "남편도 함께 검사받았더니 '성인 ADHD + 분노조절장애' 발견",
      result: "부부상담 + 남편 치료 시작 후 가정이 평화로워졌어요",
      quote: "남편이 나빠서가 아니라 아팠던 거였어요. 서로 이해하게 됐어요.",
      author: "부산 해운대구 L맘",
      authorDetail: "결혼 8년차",
      tags: ["성인ADHD", "분노조절", "부부상담"],
      highlight: "가정의 평화 되찾음"
    }
  ];

  const urgencyStats = [
    { icon: AlertTriangle, value: "73%", label: "발달 문제, 부모가 먼저 느낀다", color: "text-red-400" },
    { icon: Clock, value: "0~7세", label: "골든타임, 놓치면 늦다", color: "text-amber-400" },
    { icon: CheckCircle2, value: "94%", label: "조기발견 시 정상발달 가능", color: "text-green-400" },
  ];

  const currentStory = emotionalStories[activeStory];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-slate-900 via-rose-950/20 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full mb-4">
            <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
            <span className="text-sm font-semibold text-rose-300">엄마들의 진심 고백</span>
          </div>
          
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
            "혹시 우리 아이도...?"<br />
            <span className="text-rose-400">그 불안, 혼자 안고 계셨죠</span>
          </h2>
          
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto">
            검색으로는 답이 안 나와요. 3분 검사가 <span className="text-white font-semibold">골든타임</span>을 살렸습니다.
          </p>
        </motion.div>

        {/* Urgency Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 md:gap-6 max-w-2xl mx-auto mb-12"
        >
          {urgencyStats.map((stat, index) => (
            <div key={index} className="text-center p-3 md:p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/5">
              <stat.icon className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 ${stat.color}`} />
              <div className={`text-xl md:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] md:text-xs text-white/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Story Cards Navigation */}
        <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-2">
          {emotionalStories.map((story, index) => (
            <button
              key={index}
              onClick={() => setActiveStory(index)}
              className={`flex-shrink-0 px-3 py-2 rounded-full text-sm transition-all ${
                activeStory === index
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-800/50 text-white/60 hover:bg-slate-700/50'
              }`}
            >
              <span className="mr-1">{story.emoji}</span>
              <span className="hidden sm:inline">{story.situation.slice(0, 10)}...</span>
            </button>
          ))}
        </div>

        {/* Main Story Card */}
        <motion.div
          key={activeStory}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-gradient-to-br from-slate-800/80 to-rose-950/30 backdrop-blur-sm border border-rose-500/10 rounded-2xl p-6 md:p-8">
            {/* Situation */}
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">{currentStory.emoji}</span>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                  "{currentStory.situation}"
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {currentStory.pain}
                </p>
              </div>
            </div>

            {/* Discovery Arrow */}
            <div className="flex items-center gap-3 my-4 pl-10">
              <div className="h-px flex-1 bg-gradient-to-r from-rose-500/30 to-transparent" />
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span className="text-xs text-rose-300 font-medium">3분 검사 후</span>
              <div className="h-px flex-1 bg-gradient-to-l from-rose-500/30 to-transparent" />
            </div>

            {/* Discovery */}
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-4">
              <p className="text-rose-300 text-sm font-medium">
                💡 {currentStory.discovery}
              </p>
            </div>

            {/* Result */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-bold text-sm">결과</span>
              </div>
              <p className="text-green-300 text-sm">
                {currentStory.result}
              </p>
              <Badge className="mt-2 bg-green-500/20 text-green-300 border-green-500/30">
                ✨ {currentStory.highlight}
              </Badge>
            </div>

            {/* Quote */}
            <div className="border-l-2 border-rose-400/50 pl-4 mb-5">
              <p className="text-white/90 italic text-sm md:text-base">
                "{currentStory.quote}"
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                  {currentStory.author.charAt(0)}
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">{currentStory.author}</p>
                  <p className="text-white/50 text-xs">{currentStory.authorDetail}</p>
                </div>
                <div className="flex gap-0.5 ml-auto">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {currentStory.tags.map((tag, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="bg-slate-700/50 text-white/70 border-white/10 text-xs"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Video Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 max-w-2xl mx-auto"
        >
          <div className="text-center mb-6">
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">
              📱 실제 검사는 이렇게 진행돼요
            </h3>
            <p className="text-white/60 text-sm">3분이면 끝나는 간편 검사 과정</p>
          </div>

          <div 
            className="relative aspect-video bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden cursor-pointer group"
            onClick={() => setShowVideo(true)}
          >
            {showVideo ? (
              <iframe
                src="https://www.youtube-nocookie.com/embed/26ss_PllVrQ?autoplay=1&rel=0&modestbranding=1"
                title="AIHUMANPRO 3분 시연 영상"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-rose-600/20 to-purple-600/20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors"
                  >
                    <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                  </motion.div>
                  <span className="text-white font-medium text-sm md:text-base">클릭해서 시연 영상 보기</span>
                  <span className="text-white/50 text-xs mt-1">2분 30초</span>
                </div>
                
                {/* Fake Progress Steps */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  {['고민 입력', 'AI 분석', '결과 확인'].map((step, i) => (
                    <div key={i} className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                      <span className="text-[10px] md:text-xs text-white/70">{i + 1}. {step}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 md:p-6 bg-gradient-to-r from-rose-500/10 to-purple-500/10 rounded-2xl border border-rose-500/20">
            <div className="text-left">
              <p className="text-white font-bold text-base md:text-lg mb-1">
                🤔 혹시 우리 아이도...?
              </p>
              <p className="text-white/60 text-sm">
                불안한 마음, 3분 검사로 확인하세요. <span className="text-amber-400 font-semibold">무료</span>입니다.
              </p>
            </div>
            <Button
              onClick={() => navigate('/premium-assessment')}
              className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold px-6 py-6 rounded-xl shadow-lg shadow-rose-500/25"
            >
              지금 무료 검사 시작
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Trust Elements */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-white/50 text-xs">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" /> 완전 익명
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> 4,248명이 검사 완료
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> 결과 즉시 확인
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EmotionalHookSection;
