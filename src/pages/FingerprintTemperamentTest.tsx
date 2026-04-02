import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Fingerprint, Brain, Sparkles, RefreshCw, Share2, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginRequiredOverlay from '@/components/auth/LoginRequiredOverlay';
import SEOHead from '@/components/common/SEOHead';
import { SubscriptionGuard } from '@/components/subscription/SubscriptionGuard';
import { ResultPaywall } from '@/components/subscription/ResultPaywall';
import { useTranslation } from '@/i18n';

interface TemperamentResult {
  type: string;
  titleKey: string;
  emoji: string;
  color: string;
  descKey: string;
  traitsKey: string;
  cognitiveKey: string;
  brainKey: string;
  compatKey: string;
  adviceKey: string;
}

const temperamentKeys: TemperamentResult[] = [
  { type: 'alpha', titleKey: 'alphaTitle', emoji: '🧠', color: 'from-purple-500 to-indigo-600', descKey: 'alphaDesc', traitsKey: 'alphaTraits', cognitiveKey: 'alphaCognitive', brainKey: 'alphaBrain', compatKey: 'alphaCompat', adviceKey: 'alphaAdvice' },
  { type: 'beta', titleKey: 'betaTitle', emoji: '🎨', color: 'from-pink-500 to-rose-600', descKey: 'betaDesc', traitsKey: 'betaTraits', cognitiveKey: 'betaCognitive', brainKey: 'betaBrain', compatKey: 'betaCompat', adviceKey: 'betaAdvice' },
  { type: 'gamma', titleKey: 'gammaTitle', emoji: '💝', color: 'from-emerald-500 to-teal-600', descKey: 'gammaDesc', traitsKey: 'gammaTraits', cognitiveKey: 'gammaCognitive', brainKey: 'gammaBrain', compatKey: 'gammaCompat', adviceKey: 'gammaAdvice' },
  { type: 'delta', titleKey: 'deltaTitle', emoji: '⚡', color: 'from-amber-500 to-orange-600', descKey: 'deltaDesc', traitsKey: 'deltaTraits', cognitiveKey: 'deltaCognitive', brainKey: 'deltaBrain', compatKey: 'deltaCompat', adviceKey: 'deltaAdvice' },
  { type: 'omega', titleKey: 'omegaTitle', emoji: '🌟', color: 'from-violet-500 to-purple-600', descKey: 'omegaDesc', traitsKey: 'omegaTraits', cognitiveKey: 'omegaCognitive', brainKey: 'omegaBrain', compatKey: 'omegaCompat', adviceKey: 'omegaAdvice' },
  { type: 'sigma', titleKey: 'sigmaTitle', emoji: '🐺', color: 'from-slate-600 to-zinc-700', descKey: 'sigmaDesc', traitsKey: 'sigmaTraits', cognitiveKey: 'sigmaCognitive', brainKey: 'sigmaBrain', compatKey: 'sigmaCompat', adviceKey: 'sigmaAdvice' },
];

function FingerprintTemperamentTestInner() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const f = t.fingerprint;
  const [phase, setPhase] = useState<'intro' | 'scanning' | 'analyzing' | 'result'>('intro');
  const [scanProgress, setScanProgress] = useState(0);
  const [resultKey, setResultKey] = useState<TemperamentResult | null>(null);
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
          if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const handleTouchEnd = () => {
    if (phase !== 'scanning') return;
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (scanProgress >= 100) {
      analyzeFingerprint();
    } else {
      setPhase('intro');
      setScanProgress(0);
    }
  };

  const analyzeFingerprint = () => {
    setPhase('analyzing');
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * temperamentKeys.length);
      setResultKey(temperamentKeys[randomIndex]);
      setPhase('result');
    }, 2500);
  };

  const resetTest = () => { setPhase('intro'); setScanProgress(0); setResultKey(null); };

  const shareResult = async () => {
    if (!resultKey) return;
    const title = (f as any)[resultKey.titleKey];
    const desc = (f as any)[resultKey.descKey];
    try {
      await navigator.share({ title: f.shareTitle, text: `${f.shareText} ${title} ${resultKey.emoji}\n${desc}`, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(`${f.shareText} ${title} ${resultKey.emoji}\n${desc}\n\n${window.location.href}`);
    }
  };

  const result = resultKey ? {
    title: (f as any)[resultKey.titleKey],
    emoji: resultKey.emoji,
    color: resultKey.color,
    description: (f as any)[resultKey.descKey],
    traits: (f as any)[resultKey.traitsKey] as string[],
    cognitiveStyle: (f as any)[resultKey.cognitiveKey],
    brainPattern: (f as any)[resultKey.brainKey],
    compatibility: (f as any)[resultKey.compatKey],
    advice: (f as any)[resultKey.adviceKey],
  } : null;

  return (
    <>
      <SEOHead 
        title={f.seoTitle}
        description={f.seoDesc}
        keywords="fingerprint,temperament,brain type,personality,AI"
        canonicalUrl="https://aihpro.app/fingerprint-temperament"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": f.title,
          "description": f.seoDesc,
          "url": "https://aihpro.com/fingerprint-temperament",
          "applicationCategory": "HealthApplication",
          "operatingSystem": "Web",
          "provider": { "@type": "Organization", "name": "AIHUMANPRO" }
        }}
      />
      <LoginRequiredOverlay>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-500/20 rounded-full"
              initial={{ x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800) }}
              animate={{ x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800) }}
              transition={{ duration: Math.random() * 20 + 10, repeat: Infinity, repeatType: 'reverse' }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-lg">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="absolute left-4 top-4 text-white/70 hover:text-white">
              <Home className="w-5 h-5" />
            </Button>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-4">
              <Fingerprint className="w-5 h-5 text-purple-400" />
              <span className="text-sm">{f.systemLabel}</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{f.title}</h1>
            <p className="text-white/60">{f.subtitle}</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {(phase === 'intro' || phase === 'scanning') && (
              <motion.div key="scan" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center">
                <div
                  ref={scanAreaRef}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleTouchStart}
                  onMouseUp={handleTouchEnd}
                  onMouseLeave={() => phase === 'scanning' && handleTouchEnd()}
                  className="relative w-64 h-64 cursor-pointer select-none"
                >
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-purple-500/30"
                    animate={{ scale: phase === 'scanning' ? [1, 1.1, 1] : 1, borderColor: phase === 'scanning' ? ['rgba(168,85,247,0.3)', 'rgba(168,85,247,0.8)', 'rgba(168,85,247,0.3)'] : 'rgba(168,85,247,0.3)' }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="128" cy="128" r="120" fill="none" stroke="rgba(168,85,247,0.2)" strokeWidth="8" />
                    <motion.circle cx="128" cy="128" r="120" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={754} strokeDashoffset={754 - (754 * scanProgress) / 100} />
                    <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#6366f1" /></linearGradient></defs>
                  </svg>
                  <div className="absolute inset-8 rounded-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-sm flex items-center justify-center">
                    <motion.div animate={{ scale: phase === 'scanning' ? [1, 1.1, 1] : 1 }} transition={{ duration: 0.5, repeat: phase === 'scanning' ? Infinity : 0 }}>
                      <Fingerprint className={`w-24 h-24 transition-colors duration-300 ${phase === 'scanning' ? 'text-purple-400' : 'text-white/40'}`} />
                    </motion.div>
                  </div>
                  {phase === 'scanning' && (
                    <motion.div className="absolute left-8 right-8 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent" initial={{ top: '15%' }} animate={{ top: ['15%', '85%', '15%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
                  )}
                </div>
                <motion.p className="mt-8 text-center text-white/60" animate={{ opacity: phase === 'scanning' ? 0.4 : 1 }}>
                  {phase === 'scanning' ? `${f.scanning} ${scanProgress}%` : f.holdInstruction}
                </motion.p>
                {phase === 'intro' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 text-sm text-white/40 text-center">{f.tip}</motion.div>
                )}
              </motion.div>
            )}

            {phase === 'analyzing' && (
              <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-12">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="mb-8">
                  <Brain className="w-20 h-20 text-purple-400" />
                </motion.div>
                <div className="space-y-4 text-center">
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }} className="text-lg">{f.analyzingPattern}</motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-white/60">{f.neuralMapping}</motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="text-white/60">{f.identifyingType}</motion.p>
                </div>
              </motion.div>
            )}

            {phase === 'result' && result && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <Card className={`p-6 bg-gradient-to-br ${result.color} border-0 text-white`}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="text-center">
                    <span className="text-6xl">{result.emoji}</span>
                    <h2 className="text-2xl font-bold mt-4">{result.title}</h2>
                    <p className="mt-2 text-white/90">{result.description}</p>
                  </motion.div>
                </Card>

                <Card className="p-5 bg-white/10 backdrop-blur border-white/20">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />{f.coreTraits}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.traits.map((trait: string, i: number) => (
                      <motion.span key={trait} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }} className="px-3 py-1 bg-white/20 rounded-full text-sm">{trait}</motion.span>
                    ))}
                  </div>
                </Card>

                <div className="grid gap-4">
                  <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                    <p className="text-sm text-white/60">{f.cognitiveStyle}</p>
                    <p className="font-medium">{result.cognitiveStyle}</p>
                  </Card>
                  <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                    <p className="text-sm text-white/60">{f.brainWavePattern}</p>
                    <p className="font-medium">{result.brainPattern}</p>
                  </Card>
                  <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                    <p className="text-sm text-white/60">{f.bestPartner}</p>
                    <p className="font-medium">{result.compatibility}</p>
                  </Card>
                  <Card className="p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30">
                    <p className="text-sm text-amber-200">{f.advice}</p>
                    <p className="font-medium text-amber-100">{result.advice}</p>
                  </Card>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={resetTest} variant="outline" className="flex-1 border-white/30 text-white hover:bg-white/10">
                    <RefreshCw className="w-4 h-4 mr-2" />{f.retry}
                  </Button>
                  <Button onClick={shareResult} className="flex-1 bg-white text-purple-900 hover:bg-white/90">
                    <Share2 className="w-4 h-4 mr-2" />{f.share}
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
  const { t } = useTranslation();
  return (
    <SubscriptionGuard consumeAt="result" featureName={t.testPages.fingerprintTemperament} trialKey="PREMIUM_ASSESSMENT">
      <FingerprintTemperamentTestInner />
    </SubscriptionGuard>
  );
}
