import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Zap, Star, Crown, Users, ArrowRight, RotateCcw, Share2, Flame, Moon, Sun, Wind, Waves, Mountain, Cloud, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import LoginRequiredOverlay from '@/components/auth/LoginRequiredOverlay';

type Gender = 'male' | 'female' | null;
type MBTIType = 'ENFJ' | 'INFP' | null;

interface CompatibilityResult {
  score: number;
  title: string;
  description: string;
  chemistry: string;
  strengths: string[];
  challenges: string[];
  advice: string;
  loveLanguage: string;
  futureOutlook: string;
}

const ENFJvsINFPCompatibility = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'intro' | 'select-you' | 'select-partner' | 'loading' | 'result'>('intro');
  const [yourGender, setYourGender] = useState<Gender>(null);
  const [yourType, setYourType] = useState<MBTIType>(null);
  const [partnerGender, setPartnerGender] = useState<Gender>(null);
  const [partnerType, setPartnerType] = useState<MBTIType>(null);
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  const getCompatibilityResult = (): CompatibilityResult => {
    // ENFJ 남자 + INFP 여자
    if (yourType === 'ENFJ' && yourGender === 'male' && partnerType === 'INFP' && partnerGender === 'female') {
      return {
        score: 95,
        title: "🌟 운명적 로맨스의 정석",
        description: "카리스마 넘치는 ENFJ 남자와 몽환적인 INFP 여자의 만남! 마치 백마탄 왕자와 동화 속 공주의 조합이에요. 그가 리드하고 그녀가 그 품에 안기는, 로맨스 소설에서 튀어나온 듯한 환상의 궁합!",
        chemistry: "🔥 폭발적 케미스트리 - 그의 열정적인 이끎에 그녀의 섬세한 감성이 반응하며 불꽃이 튀어요!",
        strengths: [
          "그는 그녀의 숨겨진 재능을 발견하고 세상에 빛나게 해줘요",
          "그녀는 그의 지친 영혼을 위로하는 안식처가 되어줘요",
          "서로의 감정을 깊이 이해하는 공감대 형성",
          "로맨틱한 데이트와 깊은 대화의 완벽한 밸런스"
        ],
        challenges: [
          "그의 바쁜 사회생활에 그녀가 외로움을 느낄 수 있어요",
          "그녀의 내면 세계를 완전히 이해하려면 인내가 필요해요"
        ],
        advice: "💝 그녀에게 혼자만의 시간을 주면서도, 특별한 날엔 서프라이즈로 그녀의 마음을 녹여주세요!",
        loveLanguage: "그는 '긍정의 말'로, 그녀는 '함께하는 시간'으로 사랑을 표현해요",
        futureOutlook: "결혼까지 골인할 확률 매우 높음! 🎊 서로를 성장시키는 인생의 동반자가 될 거예요."
      };
    }
    
    // ENFJ 여자 + INFP 남자
    if (yourType === 'ENFJ' && yourGender === 'female' && partnerType === 'INFP' && partnerGender === 'male') {
      return {
        score: 88,
        title: "🎭 예술가와 뮤즈의 만남",
        description: "활기찬 ENFJ 여자와 몽상가 INFP 남자! 그녀는 그의 숨겨진 천재성을 세상에 알리고, 그는 그녀에게 깊은 영감을 줘요. 서로의 부족한 부분을 채워주는 아름다운 조합!",
        chemistry: "✨ 신비로운 끌림 - 그녀의 밝은 에너지가 그의 깊은 내면 세계를 비춰요!",
        strengths: [
          "그녀가 사회적 상황을 리드하며 그를 편안하게 해줘요",
          "그의 창의적 아이디어에 그녀가 날개를 달아줘요",
          "깊은 정서적 유대감과 예술적 교감",
          "서로의 가치관을 존중하는 성숙한 관계"
        ],
        challenges: [
          "그녀의 활발함에 그가 에너지 고갈을 느낄 수 있어요",
          "의사결정 스타일의 차이로 갈등이 생길 수 있어요"
        ],
        advice: "💝 그에게 충분한 리충전 시간을 주고, 그녀는 때론 템포를 늦춰 그와 보조를 맞춰주세요!",
        loveLanguage: "그녀는 '봉사'로, 그는 '선물'과 '시'로 사랑을 표현해요",
        futureOutlook: "예술적이고 감성적인 가정을 꾸릴 운명! 🎨 함께라면 아름다운 작품 같은 인생을 살게 될 거예요."
      };
    }
    
    // INFP 남자 + ENFJ 여자
    if (yourType === 'INFP' && yourGender === 'male' && partnerType === 'ENFJ' && partnerGender === 'female') {
      return {
        score: 88,
        title: "🌙 시인과 태양의 로맨스",
        description: "내면이 풍요로운 INFP 남자와 빛나는 ENFJ 여자! 그가 써내려간 시의 뮤즈가 바로 그녀예요. 조용하지만 깊은 그의 사랑에 그녀가 활력을 불어넣어요!",
        chemistry: "🌊 잔잔하지만 깊은 파도 - 서서히 밀려오는 감정의 물결이 두 사람을 휩싸요!",
        strengths: [
          "그의 섬세한 배려에 그녀는 진정한 이해를 받는다고 느껴요",
          "그녀의 사교성이 그의 세계를 넓혀줘요",
          "서로에게 영감을 주는 지적 파트너십",
          "갈등 시에도 감정적으로 소통하는 능력"
        ],
        challenges: [
          "그가 더 적극적인 역할을 맡아야 할 때 부담을 느낄 수 있어요",
          "그녀의 넓은 인맥이 그에게 질투심을 유발할 수 있어요"
        ],
        advice: "💝 그는 가끔 그녀를 위해 comfort zone을 벗어나 서프라이즈를 준비해보세요!",
        loveLanguage: "그는 '글과 편지'로, 그녀는 '스킨십'으로 사랑을 표현해요",
        futureOutlook: "서로의 성장을 돕는 소울메이트! 💫 함께 나이 들어갈수록 더 깊어지는 사랑이에요."
      };
    }
    
    // INFP 여자 + ENFJ 남자
    if (yourType === 'INFP' && yourGender === 'female' && partnerType === 'ENFJ' && partnerGender === 'male') {
      return {
        score: 95,
        title: "👑 공주와 기사의 동화",
        description: "꿈꾸는 INFP 여자와 헌신적인 ENFJ 남자! 그녀의 상상 속 이상형이 현실로 나타난 것 같은 마법의 만남. 그는 그녀를 세상으로부터 지켜주는 완벽한 보호자예요!",
        chemistry: "💕 운명적 설렘 - 첫눈에 서로가 '이 사람이다!'라고 느끼는 강렬한 끌림!",
        strengths: [
          "그가 그녀의 꿈을 현실로 만들어주려 노력해요",
          "그녀는 그의 가장 진실된 모습을 받아들여줘요",
          "말없이도 통하는 감정적 교감",
          "서로의 상처를 치유하는 힐링 관계"
        ],
        challenges: [
          "그녀가 현실과 이상 사이에서 갈등할 수 있어요",
          "그의 완벽주의가 그녀에게 부담이 될 수 있어요"
        ],
        advice: "💝 있는 그대로의 서로를 사랑하고, 완벽하지 않아도 괜찮다고 말해주세요!",
        loveLanguage: "그녀는 '이해받는 느낌'으로, 그는 '함께 계획 세우기'로 사랑을 느껴요",
        futureOutlook: "동화 같은 해피엔딩이 기다려요! 👫 평생을 함께할 운명의 상대입니다."
      };
    }

    // 같은 타입끼리
    if (yourType === partnerType) {
      if (yourType === 'ENFJ') {
        return {
          score: 75,
          title: "⚡ 두 태양의 충돌!",
          description: "ENFJ와 ENFJ의 만남! 둘 다 리더십이 강해서 누가 주도권을 잡을지 티격태격. 하지만 서로의 열정을 이해하니까 화해도 빨라요!",
          chemistry: "🔥 뜨거운 경쟁과 화합 - 서로를 발전시키는 건강한 라이벌 관계!",
          strengths: [
            "서로의 사회적 목표를 완벽히 이해해요",
            "함께 세상을 바꿀 수 있는 파워 커플",
            "대화가 끊이지 않는 활기찬 관계"
          ],
          challenges: [
            "누가 리드할지 갈등이 생길 수 있어요",
            "둘 다 바빠서 시간 맞추기가 어려울 수 있어요"
          ],
          advice: "💝 번갈아가며 리드하는 방법을 배워보세요!",
          loveLanguage: "둘 다 '긍정의 말'과 '인정'을 원해요",
          futureOutlook: "파워 커플의 탄생! 함께라면 못할 게 없어요! 💪"
        };
      } else {
        return {
          score: 72,
          title: "🌸 두 개의 꽃이 피어나다",
          description: "INFP와 INFP의 만남! 세상에서 가장 이해받는 느낌을 받는 관계. 하지만 둘 다 현실적인 부분이 약해서 누군가는 나서야 해요!",
          chemistry: "🦋 나비처럼 섬세한 교감 - 말없이도 서로의 마음을 읽어요!",
          strengths: [
            "깊은 정서적 이해와 공감",
            "서로의 창작 활동을 응원",
            "갈등 없는 평화로운 관계"
          ],
          challenges: [
            "현실적인 문제 해결이 어려울 수 있어요",
            "둘 다 결정을 미루는 경향이 있어요"
          ],
          advice: "💝 가끔은 현실 세계로 나와 함께 모험을 떠나보세요!",
          loveLanguage: "둘 다 '깊은 대화'와 '이해'를 원해요",
          futureOutlook: "예술적인 영혼의 동반자! 함께 아름다운 세계를 만들어가요 🎨"
        };
      }
    }

    // 기본값
    return {
      score: 85,
      title: "💫 특별한 인연",
      description: "서로 다른 매력으로 끌리는 두 사람! 차이점이 오히려 관계를 더 풍요롭게 만들어요.",
      chemistry: "✨ 신비로운 균형 - 서로를 보완하는 완벽한 조화!",
      strengths: [
        "서로에게서 배울 점이 많아요",
        "다양한 관점으로 문제를 해결해요",
        "지루할 틈이 없는 역동적인 관계"
      ],
      challenges: [
        "소통 방식의 차이를 이해해야 해요",
        "서로의 니즈를 명확히 표현해야 해요"
      ],
      advice: "💝 차이를 문제가 아닌 기회로 생각하세요!",
      loveLanguage: "서로 다른 사랑의 언어를 배워가는 중이에요",
      futureOutlook: "서로를 성장시키는 멋진 관계가 될 거예요! 🌈"
    };
  };

  const handleStartAnalysis = async () => {
    setStep('loading');
    
    // 분석 애니메이션
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const compatibilityResult = getCompatibilityResult();
    setResult(compatibilityResult);
    setStep('result');
  };

  const handleShare = async () => {
    if (!result) return;
    
    const shareText = `🔮 ENFJ vs INFP 궁합 테스트 결과!\n\n${result.title}\n궁합 점수: ${result.score}점\n\n${result.description}\n\n나도 테스트 해보기 👉`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'ENFJ vs INFP 궁합 테스트',
          text: shareText,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(shareText + ' ' + window.location.href);
        toast.success('결과가 복사되었습니다!');
      }
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleReset = () => {
    setStep('intro');
    setYourGender(null);
    setYourType(null);
    setPartnerGender(null);
    setPartnerType(null);
    setResult(null);
  };

  return (
    <LoginRequiredOverlay>
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-rose-900 overflow-hidden">
      {/* 배경 파티클 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.5 + 0.2
            }}
            animate={{ 
              y: [null, Math.random() * -200 - 100],
              opacity: [null, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "loop"
            }}
          >
            {i % 5 === 0 ? (
              <Heart className="w-4 h-4 text-pink-300" fill="currentColor" />
            ) : i % 5 === 1 ? (
              <Star className="w-3 h-3 text-yellow-300" fill="currentColor" />
            ) : i % 5 === 2 ? (
              <Sparkles className="w-4 h-4 text-purple-300" />
            ) : i % 5 === 3 ? (
              <Moon className="w-3 h-3 text-blue-200" />
            ) : (
              <Cloud className="w-5 h-5 text-white/30" />
            )}
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* 인트로 화면 */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 20, repeat: Infinity }}
                className="inline-block mb-8"
              >
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center">
                    <Heart className="w-16 h-16 text-white" fill="white" />
                  </div>
                  <motion.div
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-dashed border-white/30"
                  />
                </div>
              </motion.div>

              <motion.h1 
                className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 mb-6"
                animate={{ 
                  backgroundPosition: ['0%', '100%', '0%']
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                ENFJ vs INFP
              </motion.h1>
              
              <motion.h2 
                className="text-2xl md:text-3xl font-bold text-white/90 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                운명의 궁합 테스트 💕
              </motion.h2>

              <motion.p 
                className="text-lg text-white/70 mb-8 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                카리스마 넘치는 <span className="text-yellow-300 font-bold">ENFJ</span>와 
                감성 폭발 <span className="text-pink-300 font-bold">INFP</span>!<br/>
                남녀 조합별로 달라지는 환상의 케미스트리를 알아보세요 ✨
              </motion.p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/30"
                >
                  <Sun className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-yellow-300">ENFJ</h3>
                  <p className="text-sm text-white/70">선도자 / 정의로운 사회운동가</p>
                  <p className="text-xs text-white/50 mt-2">열정적 • 카리스마 • 헌신적</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="bg-gradient-to-br from-purple-400/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30"
                >
                  <Moon className="w-10 h-10 text-purple-300 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-purple-300">INFP</h3>
                  <p className="text-sm text-white/70">중재자 / 낭만적인 몽상가</p>
                  <p className="text-xs text-white/50 mt-2">감성적 • 창의적 • 이상주의</p>
                </motion.div>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setStep('select-you')}
                  className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white text-xl font-bold py-6 px-12 rounded-full shadow-2xl"
                >
                  궁합 알아보기
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* 나의 정보 선택 */}
          {step === 'select-you' && (
            <motion.div
              key="select-you"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block mb-4"
                >
                  <Users className="w-16 h-16 text-pink-400" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">나는 누구?</h2>
                <p className="text-white/60">당신의 성별과 성격유형을 선택하세요</p>
              </div>

              {/* 성별 선택 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white/80 text-center mb-4">성별</h3>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setYourGender('male')}
                    className={`relative overflow-hidden rounded-2xl p-6 transition-all ${
                      yourGender === 'male'
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/50'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-center">
                      <motion.div
                        animate={yourGender === 'male' ? { rotate: [0, 10, -10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                        className="text-5xl mb-2"
                      >
                        👨
                      </motion.div>
                      <span className="text-xl font-bold text-white">남자</span>
                    </div>
                    {yourGender === 'male' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <Star className="w-6 h-6 text-yellow-300" fill="currentColor" />
                      </motion.div>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setYourGender('female')}
                    className={`relative overflow-hidden rounded-2xl p-6 transition-all ${
                      yourGender === 'female'
                        ? 'bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/50'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-center">
                      <motion.div
                        animate={yourGender === 'female' ? { rotate: [0, 10, -10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                        className="text-5xl mb-2"
                      >
                        👩
                      </motion.div>
                      <span className="text-xl font-bold text-white">여자</span>
                    </div>
                    {yourGender === 'female' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <Star className="w-6 h-6 text-yellow-300" fill="currentColor" />
                      </motion.div>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* MBTI 선택 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white/80 text-center mb-4">성격 유형</h3>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setYourType('ENFJ')}
                    className={`relative overflow-hidden rounded-2xl p-6 transition-all ${
                      yourType === 'ENFJ'
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg shadow-yellow-500/50'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-center">
                      <Sun className={`w-12 h-12 mx-auto mb-2 ${yourType === 'ENFJ' ? 'text-white' : 'text-yellow-400'}`} />
                      <span className="text-2xl font-black text-white">ENFJ</span>
                      <p className="text-sm text-white/70 mt-1">선도자</p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setYourType('INFP')}
                    className={`relative overflow-hidden rounded-2xl p-6 transition-all ${
                      yourType === 'INFP'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/50'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-center">
                      <Moon className={`w-12 h-12 mx-auto mb-2 ${yourType === 'INFP' ? 'text-white' : 'text-purple-300'}`} />
                      <span className="text-2xl font-black text-white">INFP</span>
                      <p className="text-sm text-white/70 mt-1">중재자</p>
                    </div>
                  </motion.button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: yourGender && yourType ? 1 : 0.5 }}
              >
                <Button
                  onClick={() => setStep('select-partner')}
                  disabled={!yourGender || !yourType}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-lg font-bold py-4 rounded-xl"
                >
                  다음으로 <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* 상대방 정보 선택 */}
          {step === 'select-partner' && (
            <motion.div
              key="select-partner"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block mb-4"
                >
                  <Heart className="w-16 h-16 text-red-400" fill="currentColor" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">상대방은?</h2>
                <p className="text-white/60">상대방의 성별과 성격유형을 선택하세요</p>
              </div>

              {/* 성별 선택 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white/80 text-center mb-4">성별</h3>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPartnerGender('male')}
                    className={`relative overflow-hidden rounded-2xl p-6 transition-all ${
                      partnerGender === 'male'
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/50'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-2">👨</div>
                      <span className="text-xl font-bold text-white">남자</span>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPartnerGender('female')}
                    className={`relative overflow-hidden rounded-2xl p-6 transition-all ${
                      partnerGender === 'female'
                        ? 'bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/50'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-2">👩</div>
                      <span className="text-xl font-bold text-white">여자</span>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* MBTI 선택 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white/80 text-center mb-4">성격 유형</h3>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPartnerType('ENFJ')}
                    className={`relative overflow-hidden rounded-2xl p-6 transition-all ${
                      partnerType === 'ENFJ'
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg shadow-yellow-500/50'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-center">
                      <Sun className={`w-12 h-12 mx-auto mb-2 ${partnerType === 'ENFJ' ? 'text-white' : 'text-yellow-400'}`} />
                      <span className="text-2xl font-black text-white">ENFJ</span>
                      <p className="text-sm text-white/70 mt-1">선도자</p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPartnerType('INFP')}
                    className={`relative overflow-hidden rounded-2xl p-6 transition-all ${
                      partnerType === 'INFP'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/50'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-center">
                      <Moon className={`w-12 h-12 mx-auto mb-2 ${partnerType === 'INFP' ? 'text-white' : 'text-purple-300'}`} />
                      <span className="text-2xl font-black text-white">INFP</span>
                      <p className="text-sm text-white/70 mt-1">중재자</p>
                    </div>
                  </motion.button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: partnerGender && partnerType ? 1 : 0.5 }}
              >
                <Button
                  onClick={handleStartAnalysis}
                  disabled={!partnerGender || !partnerType}
                  className="w-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:via-pink-600 hover:to-purple-600 text-white text-lg font-bold py-4 rounded-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  궁합 분석하기!
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* 로딩 화면 */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto text-center py-20"
            >
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity }
                }}
                className="inline-block mb-8"
              >
                <div className="relative">
                  <Heart className="w-24 h-24 text-pink-500" fill="currentColor" />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Sparkles className="w-12 h-12 text-yellow-300" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.h2
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl font-bold text-white mb-4"
              >
                운명의 궁합을 분석중...
              </motion.h2>

              <div className="space-y-2 text-white/60">
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  ✨ 두 사람의 에너지를 읽고 있어요...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  💕 감정의 파장을 분석하는 중...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2 }}
                >
                  🔮 운명의 실타래를 풀고 있어요...
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* 결과 화면 */}
          {step === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto"
            >
              {/* 점수 섹션 */}
              <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                className="text-center mb-8"
              >
                <div className="inline-block relative">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="relative"
                  >
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-2xl">
                      <div className="text-center">
                        <span className="text-5xl font-black text-white">{result.score}</span>
                        <span className="text-2xl text-white/80">점</span>
                      </div>
                    </div>
                    {/* 반짝이는 별들 */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          top: `${50 + 60 * Math.sin(i * Math.PI / 4)}%`,
                          left: `${50 + 60 * Math.cos(i * Math.PI / 4)}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        animate={{ 
                          scale: [0.8, 1.2, 0.8],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      >
                        <Star className="w-4 h-4 text-yellow-300" fill="currentColor" />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-black text-white mt-6 mb-4"
                >
                  {result.title}
                </motion.h1>

                {/* 조합 표시 */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className={`px-4 py-2 rounded-full ${yourGender === 'male' ? 'bg-blue-500/30' : 'bg-pink-500/30'} text-white`}>
                    <span className="text-2xl mr-2">{yourGender === 'male' ? '👨' : '👩'}</span>
                    <span className="font-bold">{yourType}</span>
                  </div>
                  <Flame className="w-8 h-8 text-red-400 animate-pulse" />
                  <div className={`px-4 py-2 rounded-full ${partnerGender === 'male' ? 'bg-blue-500/30' : 'bg-pink-500/30'} text-white`}>
                    <span className="text-2xl mr-2">{partnerGender === 'male' ? '👨' : '👩'}</span>
                    <span className="font-bold">{partnerType}</span>
                  </div>
                </div>
              </motion.div>

              {/* 상세 결과 */}
              <div className="space-y-6">
                {/* 설명 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden">
                    <div className="p-6">
                      <p className="text-white/90 text-lg leading-relaxed">{result.description}</p>
                      <div className="mt-4 p-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl">
                        <p className="text-white font-medium">{result.chemistry}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* 강점 & 도전 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg border-green-400/30 h-full">
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center">
                          <Sparkles className="w-5 h-5 mr-2" />
                          이런 점이 좋아요! 💚
                        </h3>
                        <ul className="space-y-3">
                          {result.strengths.map((strength, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 + idx * 0.1 }}
                              className="flex items-start text-white/80"
                            >
                              <span className="text-green-400 mr-2">✓</span>
                              {strength}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-lg border-orange-400/30 h-full">
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-orange-300 mb-4 flex items-center">
                          <Zap className="w-5 h-5 mr-2" />
                          주의할 점! 🧡
                        </h3>
                        <ul className="space-y-3">
                          {result.challenges.map((challenge, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 + idx * 0.1 }}
                              className="flex items-start text-white/80"
                            >
                              <span className="text-orange-400 mr-2">!</span>
                              {challenge}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  </motion.div>
                </div>

                {/* 조언 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-lg border-pink-400/30">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-pink-300 mb-4 flex items-center">
                        <Heart className="w-5 h-5 mr-2" fill="currentColor" />
                        연애 조언 💗
                      </h3>
                      <p className="text-white/90 text-lg">{result.advice}</p>
                    </div>
                  </Card>
                </motion.div>

                {/* 사랑의 언어 & 미래 전망 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Card className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-lg border-purple-400/30 h-full">
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-purple-300 mb-3 flex items-center">
                          <Compass className="w-5 h-5 mr-2" />
                          사랑의 언어 💜
                        </h3>
                        <p className="text-white/80">{result.loveLanguage}</p>
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg border-blue-400/30 h-full">
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-blue-300 mb-3 flex items-center">
                          <Mountain className="w-5 h-5 mr-2" />
                          미래 전망 💙
                        </h3>
                        <p className="text-white/80">{result.futureOutlook}</p>
                      </div>
                    </Card>
                  </motion.div>
                </div>

                {/* 버튼들 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                >
                  <Button
                    onClick={handleShare}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    결과 공유하기
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 border-white/30 text-white hover:bg-white/10 font-bold py-4 rounded-xl"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    다시 테스트하기
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 홈으로 버튼 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            ← 홈으로 돌아가기
          </Button>
        </motion.div>
      </div>
    </div>
    </LoginRequiredOverlay>
  );
};

export default ENFJvsINFPCompatibility;
