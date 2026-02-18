import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Fingerprint, Brain, Sparkles, RefreshCw, Share2, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginRequiredOverlay from '@/components/auth/LoginRequiredOverlay';
import SEOHead from '@/components/common/SEOHead';
import { SubscriptionGuard } from '@/components/subscription/SubscriptionGuard';

interface TemperamentResult {
  type: string;
  title: string;
  emoji: string;
  color: string;
  description: string;
  traits: string[];
  cognitiveStyle: string;
  brainPattern: string;
  compatibility: string;
  advice: string;
}

const temperamentResults: TemperamentResult[] = [
  {
    type: 'alpha',
    title: '알파 두뇌형',
    emoji: '🧠',
    color: 'from-purple-500 to-indigo-600',
    description: '논리와 분석의 마스터. 복잡한 문제를 체계적으로 해결하는 능력이 탁월합니다.',
    traits: ['분석적 사고', '논리적 추론', '전략적 계획', '데이터 중심'],
    cognitiveStyle: '좌뇌 우세형 - 순차적 정보 처리',
    brainPattern: '베타파 활성 (집중력 극대화)',
    compatibility: '델타 두뇌형과 최고의 시너지',
    advice: '가끔은 직관을 믿어보세요. 모든 것을 분석할 필요는 없습니다.'
  },
  {
    type: 'beta',
    title: '베타 창조형',
    emoji: '🎨',
    color: 'from-pink-500 to-rose-600',
    description: '무한한 상상력의 소유자. 남들이 보지 못하는 것을 보고 새로운 것을 창조합니다.',
    traits: ['창의적 발상', '예술적 감각', '직관적 통찰', '감성 지능'],
    cognitiveStyle: '우뇌 우세형 - 전체적 패턴 인식',
    brainPattern: '알파파 활성 (창의성 극대화)',
    compatibility: '감마 두뇌형과 환상의 콜라보',
    advice: '아이디어를 실행으로 옮기는 연습을 해보세요.'
  },
  {
    type: 'gamma',
    title: '감마 공감형',
    emoji: '💝',
    color: 'from-emerald-500 to-teal-600',
    description: '감정의 연금술사. 사람들의 마음을 읽고 연결하는 능력이 뛰어납니다.',
    traits: ['높은 공감력', '사회적 지능', '감정 조절', '관계 구축'],
    cognitiveStyle: '변연계 우세형 - 감정 기반 의사결정',
    brainPattern: '세타파 활성 (공감 극대화)',
    compatibility: '알파 두뇌형과 균형 잡힌 파트너십',
    advice: '자신의 감정도 소중히 여기세요. 남을 돌보기 전에.'
  },
  {
    type: 'delta',
    title: '델타 실행형',
    emoji: '⚡',
    color: 'from-amber-500 to-orange-600',
    description: '행동의 화신. 생각보다 실행이 빠르고 결과를 만들어내는 추진력의 소유자.',
    traits: ['실행력', '결단력', '목표 지향', '에너지 넘침'],
    cognitiveStyle: '전두엽 우세형 - 빠른 의사결정',
    brainPattern: '감마파 활성 (실행력 극대화)',
    compatibility: '베타 창조형과 드림팀 구성',
    advice: '때로는 멈추고 생각하는 시간도 필요해요.'
  },
  {
    type: 'omega',
    title: '오메가 통합형',
    emoji: '🌟',
    color: 'from-violet-500 to-purple-600',
    description: '모든 것의 조화. 다양한 능력을 균형있게 갖춘 희귀한 통합형 두뇌.',
    traits: ['균형 잡힌 사고', '적응력', '다재다능', '통합적 시각'],
    cognitiveStyle: '전뇌 균형형 - 상황별 최적화',
    brainPattern: '다중 파동 조화 (최적 상태)',
    compatibility: '모든 유형과 원활한 협력',
    advice: '특정 분야에 깊이를 더하면 더욱 빛날 거예요.'
  },
  {
    type: 'sigma',
    title: '시그마 독립형',
    emoji: '🐺',
    color: 'from-slate-600 to-zinc-700',
    description: '고독한 천재. 독자적인 사고와 독립적인 행동으로 자신만의 길을 개척합니다.',
    traits: ['독립적 사고', '자기 주도성', '깊은 집중력', '비순응적'],
    cognitiveStyle: '독립 신경망형 - 자체 패턴 생성',
    brainPattern: '델타파 활성 (심층 사고)',
    compatibility: '오메가 통합형과 상호 존중 관계',
    advice: '가끔은 다른 사람의 의견에도 귀 기울여 보세요.'
  }
];

function FingerprintTemperamentTestInner() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'scanning' | 'analyzing' | 'result'>('intro');
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<TemperamentResult | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const scanAreaRef = useRef<HTMLDivElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    if (phase !== 'intro') return;
    setTouchStartTime(Date.now());
    setPhase('scanning');
    setScanProgress(0);

    scanIntervalRef.current = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
          }
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const handleTouchEnd = () => {
    if (phase !== 'scanning') return;
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    if (scanProgress >= 100) {
      analyzeFingerprint();
    } else {
      setPhase('intro');
      setScanProgress(0);
    }
  };

  const analyzeFingerprint = () => {
    setPhase('analyzing');
    
    // Simulate analysis with touch duration factor
    const touchDuration = Date.now() - touchStartTime;
    
    setTimeout(() => {
      // Generate result based on various factors
      const randomIndex = Math.floor(Math.random() * temperamentResults.length);
      setResult(temperamentResults[randomIndex]);
      setPhase('result');
    }, 2500);
  };

  const resetTest = () => {
    setPhase('intro');
    setScanProgress(0);
    setResult(null);
  };

  const shareResult = async () => {
    if (!result) return;
    
    try {
      await navigator.share({
        title: '지문 인지기질검사 결과',
        text: `나의 인지기질 유형: ${result.title} ${result.emoji}\n${result.description}`,
        url: window.location.href
      });
    } catch {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `나의 인지기질 유형: ${result.title} ${result.emoji}\n${result.description}\n\n테스트 해보기: ${window.location.href}`
      );
    }
  };

  return (
    <>
      <SEOHead 
        title="지문 인지기질검사 - AIHPRO | 나의 두뇌 유형 분석"
        description="지문 스캔으로 알아보는 나의 인지기질 유형. 알파, 베타, 감마, 델타, 오메가, 시그마 6가지 두뇌 패턴 중 나의 유형을 분석해보세요."
        keywords="지문검사,인지기질검사,두뇌유형,성격검사,심리테스트,AI분석,AIHPRO"
        canonicalUrl="https://aihpro.app/fingerprint-temperament"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "지문 인지기질검사",
          "description": "지문 스캔으로 알아보는 인지기질 유형 분석 서비스",
          "url": "https://aihpro.com/fingerprint-temperament",
          "applicationCategory": "HealthApplication",
          "operatingSystem": "Web",
          "provider": {
            "@type": "Organization",
            "name": "AIHUMANPRO"
          }
        }}
      />
      <LoginRequiredOverlay>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-500/20 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight 
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-lg">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="absolute left-4 top-4 text-white/70 hover:text-white"
            >
              <Home className="w-5 h-5" />
            </Button>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-4">
              <Fingerprint className="w-5 h-5 text-purple-400" />
              <span className="text-sm">인지기질 분석 시스템</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">지문 인지기질검사</h1>
            <p className="text-white/60">당신의 고유한 두뇌 패턴을 분석합니다</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Intro & Scanning Phase */}
            {(phase === 'intro' || phase === 'scanning') && (
              <motion.div
                key="scan"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                {/* Fingerprint Scan Area */}
                <div
                  ref={scanAreaRef}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleTouchStart}
                  onMouseUp={handleTouchEnd}
                  onMouseLeave={() => phase === 'scanning' && handleTouchEnd()}
                  className="relative w-64 h-64 cursor-pointer select-none"
                >
                  {/* Outer Ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-purple-500/30"
                    animate={{
                      scale: phase === 'scanning' ? [1, 1.1, 1] : 1,
                      borderColor: phase === 'scanning' ? ['rgba(168,85,247,0.3)', 'rgba(168,85,247,0.8)', 'rgba(168,85,247,0.3)'] : 'rgba(168,85,247,0.3)'
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />

                  {/* Progress Ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      fill="none"
                      stroke="rgba(168,85,247,0.2)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="128"
                      cy="128"
                      r="120"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={754}
                      strokeDashoffset={754 - (754 * scanProgress) / 100}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center Area */}
                  <div className="absolute inset-8 rounded-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-sm flex items-center justify-center">
                    <motion.div
                      animate={{
                        scale: phase === 'scanning' ? [1, 1.1, 1] : 1,
                      }}
                      transition={{ duration: 0.5, repeat: phase === 'scanning' ? Infinity : 0 }}
                    >
                      <Fingerprint 
                        className={`w-24 h-24 transition-colors duration-300 ${
                          phase === 'scanning' ? 'text-purple-400' : 'text-white/40'
                        }`}
                      />
                    </motion.div>
                  </div>

                  {/* Scan Line */}
                  {phase === 'scanning' && (
                    <motion.div
                      className="absolute left-8 right-8 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                      initial={{ top: '15%' }}
                      animate={{ top: ['15%', '85%', '15%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </div>

                {/* Instructions */}
                <motion.p
                  className="mt-8 text-center text-white/60"
                  animate={{ opacity: phase === 'scanning' ? 0.4 : 1 }}
                >
                  {phase === 'scanning' 
                    ? `스캔 중... ${scanProgress}%`
                    : '원 안에 손가락을 올리고 3초간 유지하세요'
                  }
                </motion.p>

                {phase === 'intro' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 text-sm text-white/40 text-center"
                  >
                    💡 팁: 검지 또는 엄지를 사용하면 더 정확해요
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Analyzing Phase */}
            {phase === 'analyzing' && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="mb-8"
                >
                  <Brain className="w-20 h-20 text-purple-400" />
                </motion.div>

                <div className="space-y-4 text-center">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0 }}
                    className="text-lg"
                  >
                    🔬 지문 패턴 분석 중...
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-white/60"
                  >
                    🧬 신경망 매핑 진행 중...
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6 }}
                    className="text-white/60"
                  >
                    ⚡ 인지 기질 유형 판별 중...
                  </motion.p>
                </div>
              </motion.div>
            )}

            {/* Result Phase */}
            {phase === 'result' && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Main Result Card */}
                <Card className={`p-6 bg-gradient-to-br ${result.color} border-0 text-white`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-center"
                  >
                    <span className="text-6xl">{result.emoji}</span>
                    <h2 className="text-2xl font-bold mt-4">{result.title}</h2>
                    <p className="mt-2 text-white/90">{result.description}</p>
                  </motion.div>
                </Card>

                {/* Traits */}
                <Card className="p-5 bg-white/10 backdrop-blur border-white/20">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    핵심 특성
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.traits.map((trait, i) => (
                      <motion.span
                        key={trait}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="px-3 py-1 bg-white/20 rounded-full text-sm"
                      >
                        {trait}
                      </motion.span>
                    ))}
                  </div>
                </Card>

                {/* Details */}
                <div className="grid gap-4">
                  <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                    <p className="text-sm text-white/60">인지 스타일</p>
                    <p className="font-medium">{result.cognitiveStyle}</p>
                  </Card>
                  <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                    <p className="text-sm text-white/60">두뇌 파동 패턴</p>
                    <p className="font-medium">{result.brainPattern}</p>
                  </Card>
                  <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                    <p className="text-sm text-white/60">최고의 파트너</p>
                    <p className="font-medium">{result.compatibility}</p>
                  </Card>
                  <Card className="p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30">
                    <p className="text-sm text-amber-200">💡 한마디 조언</p>
                    <p className="font-medium text-amber-100">{result.advice}</p>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={resetTest}
                    variant="outline"
                    className="flex-1 border-white/30 text-white hover:bg-white/10"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    다시 하기
                  </Button>
                  <Button
                    onClick={shareResult}
                    className="flex-1 bg-white text-purple-900 hover:bg-white/90"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    공유하기
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </LoginRequiredOverlay>
    </>
  );
}

export default function FingerprintTemperamentTest() {
  return (
    <SubscriptionGuard featureName="지문 인지기질검사">
      <FingerprintTemperamentTestInner />
    </SubscriptionGuard>
  );
}
