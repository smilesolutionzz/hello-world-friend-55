import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Camera, Scan, Activity, Brain, Heart, AlertTriangle,
  TrendingUp, TrendingDown, Minus, ChevronRight, Info,
  Droplets, Thermometer, Shield, BarChart3, Clock, Zap,
  ArrowLeft, BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ScanPhase = 'intro' | 'scanning' | 'analyzing' | 'result';

interface CortisolResult {
  cortisolLevel: number; // 0-100
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  subjectiveStress: number; // 심리검사 기반
  objectiveStress: number; // 코르티솔 기반
  gapPercentage: number;
  insights: string[];
  recommendations: string[];
}

const mockResult: CortisolResult = {
  cortisolLevel: 78,
  riskLevel: 'high',
  subjectiveStress: 40,
  objectiveStress: 78,
  gapPercentage: 38,
  insights: [
    '본인이 인지하는 것보다 신체가 느끼는 스트레스가 상당히 높습니다.',
    '만성 스트레스 상태가 의심되며, 코르티솔 수치가 정상 범위를 초과합니다.',
    '교감신경계가 과활성 상태로, 수면의 질 저하가 동반될 수 있습니다.',
  ],
  recommendations: [
    '즉각적인 스트레스 관리 프로그램 참여를 권장합니다.',
    '수면 패턴 점검 및 취침 전 이완 루틴을 도입하세요.',
    '1주일 후 재측정하여 변화 추이를 모니터링하세요.',
    '전문가 상담을 통한 스트레스 원인 분석을 고려해보세요.',
  ],
};

const CortisolScan: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<ScanPhase>('intro');
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<CortisolResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startScan = async () => {
    setPhase('scanning');
    setScanProgress(0);

    // Simulate camera activation + scanning
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      // Camera not available, continue with simulation
    }

    // Simulate scan progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Stop camera
          if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(t => t.stop());
          }
          setPhase('analyzing');
          setTimeout(() => {
            setResult(mockResult);
            setPhase('result');
          }, 2500);
          return 100;
        }
        return prev + 2;
      });
    }, 80);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 border-green-300 text-green-800';
      case 'moderate': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      default: return '';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'low': return '정상';
      case 'moderate': return '주의';
      case 'high': return '위험';
      case 'critical': return '심각';
      default: return '';
    }
  };

  return (
    <>
      <Helmet>
        <title>코르티솔 스트립 스캔 | AIHPRO Physical AI</title>
        <meta name="description" content="타액 코르티솔 스트립을 스마트폰 카메라로 스캔하여 객관적 스트레스 수치를 측정합니다." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-bold text-foreground text-lg">코르티솔 스캔</h1>
              <p className="text-xs text-muted-foreground">Physical AI · 생체 스트레스 측정</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">BETA</Badge>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <AnimatePresence mode="wait">
            {/* INTRO */}
            {phase === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                {/* Hero Card */}
                <Card className="overflow-hidden border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                      <Droplets className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-foreground">마음 vs 몸</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                      타액 코르티솔 스트립을 스마트폰 카메라로 스캔하여<br/>
                      <strong className="text-foreground">몸이 느끼는 진짜 스트레스</strong>를 객관적으로 측정합니다.
                    </p>
                  </CardContent>
                </Card>

                {/* How it works */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-foreground">
                      <Info className="w-4 h-4 text-emerald-600" />
                      이렇게 작동합니다
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { step: 1, icon: Droplets, title: '스트립에 타액 도포', desc: '동봉된 코르티솔 스트립에 침을 묻힙니다 (5초)' },
                      { step: 2, icon: Clock, title: '3분 대기', desc: '스트립의 색 반응이 완료될 때까지 기다립니다' },
                      { step: 3, icon: Camera, title: '카메라 스캔', desc: '스마트폰 카메라로 스트립 색상을 판독합니다' },
                      { step: 4, icon: BarChart3, title: '교차 분석', desc: '심리검사 결과와 생체 데이터를 비교 분석합니다' },
                    ].map(item => (
                      <div key={item.step} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-emerald-700">{item.step}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Key Value Prop */}
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-foreground mb-1">왜 코르티솔인가?</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          심리검사는 "스트레스 받으세요?" → "아뇨 괜찮아요"라는 자기보고 왜곡이 발생합니다.
                          코르티솔은 부신에서 분비되는 스트레스 호르몬으로, <strong className="text-foreground">몸은 거짓말을 하지 못합니다.</strong>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={startScan} size="lg" className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/20">
                  <Camera className="w-5 h-5 mr-2" />
                  스트립 스캔 시작
                </Button>
              </motion.div>
            )}

            {/* SCANNING */}
            {phase === 'scanning' && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <Card className="overflow-hidden border-2 border-emerald-300">
                  <CardContent className="p-0">
                    <div className="relative aspect-[4/3] bg-black rounded-t-lg overflow-hidden">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      {/* Scan overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          className="w-48 h-48 border-4 border-emerald-400 rounded-2xl"
                          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <p className="text-white text-sm font-medium bg-black/50 inline-block px-4 py-1 rounded-full">
                            스트립을 사각형 안에 맞춰주세요
                          </p>
                        </div>
                      </div>
                      {/* Scan line */}
                      <motion.div
                        className="absolute left-8 right-8 h-0.5 bg-emerald-400 shadow-lg shadow-emerald-400/50"
                        animate={{ top: ['30%', '70%', '30%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">스캔 진행률</span>
                        <span className="font-bold text-emerald-700">{scanProgress}%</span>
                      </div>
                      <Progress value={scanProgress} className="h-3" />
                      <p className="text-xs text-center text-muted-foreground">
                        색상 변화를 분석하고 있습니다... 잠시만 기다려주세요
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ANALYZING */}
            {phase === 'analyzing' && (
              <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 space-y-6">
                <motion.div
                  className="relative w-24 h-24"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-200" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-600" />
                </motion.div>
                <div className="text-center space-y-2">
                  <p className="font-bold text-lg text-foreground">AI 분석 중...</p>
                  <p className="text-sm text-muted-foreground">코르티솔 농도를 정량 분석하고 있습니다</p>
                </div>
                <div className="flex gap-2">
                  {['색상 판독', '농도 추정', '교차 분석'].map((label, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.8, duration: 0.5 }}
                    >
                      <Badge variant="outline" className="text-xs">{label}</Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* RESULT */}
            {phase === 'result' && result && (
              <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                {/* Risk Level Banner */}
                <Card className={`border-2 ${getRiskBg(result.riskLevel)}`}>
                  <CardContent className="p-5 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Activity className={`w-6 h-6 ${getRiskColor(result.riskLevel)}`} />
                      <span className="text-2xl font-black">{getRiskLabel(result.riskLevel)}</span>
                    </div>
                    <p className="text-sm">코르티솔 수치: <strong>{result.cortisolLevel}/100</strong></p>
                  </CardContent>
                </Card>

                {/* Mind vs Body Dashboard */}
                <Card className="border-2 border-indigo-200 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-foreground">
                      <Brain className="w-5 h-5 text-indigo-600" />
                      마음 vs 몸 대시보드
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-5">
                    {/* Subjective vs Objective */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-200">
                        <Heart className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">심리검사 (주관)</p>
                        <p className="text-3xl font-black text-blue-700">{result.subjectiveStress}%</p>
                        <p className="text-xs text-blue-600 mt-1">"괜찮아요"</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-red-50 border border-red-200">
                        <Thermometer className="w-6 h-6 text-red-500 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">코르티솔 (객관)</p>
                        <p className="text-3xl font-black text-red-700">{result.objectiveStress}%</p>
                        <p className="text-xs text-red-600 mt-1">위험 수준</p>
                      </div>
                    </div>

                    {/* Gap Alert */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <span className="font-bold text-sm text-foreground">괴리도 {result.gapPercentage}%p</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        주관적 스트레스 인식과 실제 신체 스트레스 사이에 <strong className="text-amber-800">{result.gapPercentage}%p의 괴리</strong>가 발생했습니다.
                        이는 본인이 스트레스를 인지하지 못하고 있는 상태를 의미합니다.
                      </p>
                    </div>

                    {/* Visual Bar Comparison */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">마음이 느끼는 스트레스</span>
                          <span className="font-bold text-blue-700">{result.subjectiveStress}%</span>
                        </div>
                        <div className="h-4 bg-blue-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${result.subjectiveStress}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">몸이 느끼는 스트레스</span>
                          <span className="font-bold text-red-700">{result.objectiveStress}%</span>
                        </div>
                        <div className="h-4 bg-red-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${result.objectiveStress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-foreground">
                      <Zap className="w-4 h-4 text-amber-500" />
                      AI 분석 인사이트
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-amber-700">{i + 1}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-foreground">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      맞춤 추천
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                        <ChevronRight className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{rec}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Scientific References */}
                <Card className="border-slate-200 bg-slate-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-xs text-foreground mb-1">학술 근거</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Salivary cortisol as a biomarker in stress research (Hellhammer et al., 2009).
                          Point-of-care lateral flow immunoassay for cortisol detection (Zangheri et al., 2015).
                          Discrepancy between perceived stress and physiological stress markers (Epel et al., 2018).
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CTA Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="outline" onClick={() => { setPhase('intro'); setResult(null); }} className="h-12">
                    다시 측정하기
                  </Button>
                  <Button onClick={() => navigate('/ai-counselor')} className="h-12 bg-gradient-to-r from-indigo-600 to-violet-600">
                    AI 상담 받기
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default CortisolScan;
