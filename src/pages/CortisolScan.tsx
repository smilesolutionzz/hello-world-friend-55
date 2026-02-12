import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Camera, Activity, Brain, Heart, AlertTriangle,
  ChevronRight, Droplets, Thermometer, Shield, BarChart3, Clock, Zap,
  ArrowLeft, BookOpen, Beaker, Smartphone, Building2, FileCheck,
  Rocket, FlaskConical, CheckCircle2, Circle, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ScanPhase = 'intro' | 'scanning' | 'analyzing' | 'result';
type TabView = 'scan' | 'roadmap';

interface CortisolResult {
  cortisolLevel: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  subjectiveStress: number;
  objectiveStress: number;
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

const roadmapPhases = [
  {
    phase: 'Phase 1',
    title: '소프트웨어 프로토타입',
    period: '현재',
    status: 'active' as const,
    icon: Smartphone,
    items: [
      '카메라 기반 스트립 판독 UI 구축',
      '색상 변화 → 농도 추정 AI 모델 설계',
      '마음 vs 몸 대시보드 프로토타입',
      '시뮬레이션 데이터 기반 UX 검증',
    ],
  },
  {
    phase: 'Phase 2',
    title: '스트립 OEM 제조',
    period: '3개월 후',
    status: 'upcoming' as const,
    icon: Beaker,
    items: [
      '면역크로마토그래피 기반 스트립 OEM 파트너 선정',
      '코르티솔 항체 반응 정확도 검증 (R² > 0.95)',
      '스마트폰 카메라 판독 알고리즘 고도화',
      '임상시험 설계 및 IRB 승인',
    ],
  },
  {
    phase: 'Phase 3',
    title: '인허가 · 특허',
    period: '6개월 후',
    status: 'locked' as const,
    icon: FileCheck,
    items: [
      '식약처 체외진단기기 인허가 (자가검사용)',
      'BM 특허: 타액 코르티솔 × 심리검사 교차분석',
      '시스템 특허: 스마트폰 카메라 정량 판독',
      '괴리도 산출 알고리즘 특허',
    ],
  },
  {
    phase: 'Phase 4',
    title: '시장 출시 · 스케일업',
    period: '12개월 후',
    status: 'locked' as const,
    icon: Rocket,
    items: [
      '약국 · 올리브영 오프라인 유통',
      '기업 B2B 정기 납품 (직원 웰니스)',
      '보험사 제휴 (스트레스 기반 보험료 연동)',
      '구독 모델: Premium 회원 월 2매 동봉',
    ],
  },
];

const CortisolScan: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<ScanPhase>('intro');
  const [activeTab, setActiveTab] = useState<TabView>('scan');
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<CortisolResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startScan = async () => {
    setPhase('scanning');
    setScanProgress(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { /* simulation fallback */ }

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
          }
          setPhase('analyzing');
          setTimeout(() => { setResult(mockResult); setPhase('result'); }, 2500);
          return 100;
        }
        return prev + 2;
      });
    }, 80);
  };

  const getRiskConfig = (level: string) => {
    const configs: Record<string, { label: string; color: string; bg: string }> = {
      low: { label: '정상', color: 'hsl(var(--success))', bg: 'bg-green-50 border-green-200' },
      moderate: { label: '주의', color: 'hsl(var(--warning))', bg: 'bg-yellow-50 border-yellow-200' },
      high: { label: '위험', color: 'hsl(var(--destructive))', bg: 'bg-orange-50 border-orange-200' },
      critical: { label: '심각', color: 'hsl(var(--destructive))', bg: 'bg-red-50 border-red-200' },
    };
    return configs[level] || configs.moderate;
  };

  return (
    <>
      <Helmet>
        <title>코르티솔 스트립 스캔 | AIHPRO Physical AI</title>
        <meta name="description" content="타액 코르티솔 스트립을 스마트폰 카메라로 스캔하여 객관적 스트레스 수치를 측정합니다." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Minimal Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-foreground text-base truncate">코르티솔 스캔</h1>
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold tracking-wider uppercase border-primary/30 text-primary shrink-0">
              Beta
            </Badge>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="flex gap-1 p-1 bg-muted rounded-xl">
            {[
              { key: 'scan' as TabView, label: '스트립 스캔', icon: FlaskConical },
              { key: 'roadmap' as TabView, label: '개발 로드맵', icon: Rocket },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {activeTab === 'roadmap' ? (
              <RoadmapView key="roadmap" />
            ) : (
              <ScanView
                key="scan"
                phase={phase}
                scanProgress={scanProgress}
                result={result}
                videoRef={videoRef}
                startScan={startScan}
                getRiskConfig={getRiskConfig}
                setPhase={setPhase}
                setResult={setResult}
                navigate={navigate}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

/* ─── Roadmap View ─── */
const RoadmapView: React.FC = () => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
    {/* Vision Header */}
    <div className="text-center py-4">
      <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">Physical AI Roadmap</p>
      <h2 className="text-xl font-bold text-foreground mb-1">코르티솔 스트립 개발 로드맵</h2>
      <p className="text-sm text-muted-foreground">심리검사의 자기보고 왜곡을 생체 데이터로 극복합니다</p>
    </div>

    {/* Timeline */}
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-8 bottom-8 w-px bg-border" />

      <div className="space-y-1">
        {roadmapPhases.map((item, i) => {
          const Icon = item.icon;
          const isActive = item.status === 'active';
          const isLocked = item.status === 'locked';

          return (
            <motion.div
              key={item.phase}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-12 pb-6"
            >
              {/* Node */}
              <div className={`absolute left-2 top-1 w-[22px] h-[22px] rounded-full flex items-center justify-center ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                  : isLocked
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-background border-2 border-primary text-primary'
              }`}>
                {isActive ? <CheckCircle2 className="w-3 h-3" /> : isLocked ? <Lock className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
              </div>

              {/* Content */}
              <div className={`p-4 rounded-xl border transition-all ${
                isActive
                  ? 'bg-primary/5 border-primary/20 shadow-sm'
                  : 'bg-card border-border hover:border-border/80'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.phase}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>{item.period}</span>
                    </div>
                    <p className="font-semibold text-sm text-foreground">{item.title}</p>
                  </div>
                </div>
                <ul className="space-y-1.5 ml-1">
                  {item.items.map((text, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ChevronRight className={`w-3 h-3 mt-0.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground/50'}`} />
                      <span className={isLocked ? 'opacity-60' : ''}>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>

    {/* Patent Strategy */}
    <div className="p-4 rounded-xl bg-muted/50 border border-border">
      <p className="font-semibold text-sm text-foreground flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-primary" />
        핵심 특허 전략
      </p>
      <div className="space-y-2">
        {[
          '타액 코르티솔 × 심리검사 자기보고 교차분석 방법',
          '스마트폰 카메라 기반 코르티솔 스트립 정량 판독 알고리즘',
          '생체/주관적 스트레스 괴리도 산출 시스템',
        ].map((patent, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="font-mono text-primary font-bold shrink-0">#{i + 1}</span>
            <span>{patent}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

/* ─── Scan View ─── */
interface ScanViewProps {
  phase: ScanPhase;
  scanProgress: number;
  result: CortisolResult | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  startScan: () => void;
  getRiskConfig: (level: string) => { label: string; color: string; bg: string };
  setPhase: (p: ScanPhase) => void;
  setResult: (r: CortisolResult | null) => void;
  navigate: ReturnType<typeof useNavigate>;
}

const ScanView: React.FC<ScanViewProps> = ({
  phase, scanProgress, result, videoRef, startScan, getRiskConfig, setPhase, setResult, navigate
}) => (
  <AnimatePresence mode="wait">
    {/* INTRO */}
    {phase === 'intro' && (
      <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
        {/* Hero */}
        <div className="text-center py-6">
          <motion.div
            className="inline-flex p-5 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 mb-4"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Droplets className="w-10 h-10 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">마음 vs 몸</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            타액 코르티솔 스트립으로<br />
            <strong className="text-foreground">몸이 느끼는 진짜 스트레스</strong>를 측정합니다
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { step: 1, icon: Droplets, title: '타액 도포', desc: '스트립에 침 묻히기' },
            { step: 2, icon: Clock, title: '3분 대기', desc: '색 반응 대기' },
            { step: 3, icon: Camera, title: '카메라 스캔', desc: '색상 AI 판독' },
            { step: 4, icon: BarChart3, title: '교차 분석', desc: '심리×생체 비교' },
          ].map(item => (
            <div key={item.step} className="p-3.5 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-primary bg-primary/10 w-5 h-5 rounded-full flex items-center justify-center">{item.step}</span>
                <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="font-semibold text-xs text-foreground">{item.title}</p>
              <p className="text-[11px] text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Why Cortisol */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-foreground mb-1">왜 코르티솔인가?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                심리검사의 자기보고는 왜곡됩니다. 코르티솔은 부신에서 분비되는 스트레스 호르몬으로, 
                <strong className="text-foreground"> 몸은 거짓말을 하지 못합니다.</strong>
              </p>
            </div>
          </div>
        </div>

        <Button onClick={startScan} size="lg" className="w-full h-14 text-base font-bold rounded-2xl">
          <Camera className="w-5 h-5 mr-2" />
          스트립 스캔 시작
        </Button>
      </motion.div>
    )}

    {/* SCANNING */}
    {phase === 'scanning' && (
      <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
        <div className="relative aspect-[4/3] bg-foreground/5 rounded-2xl overflow-hidden border border-border">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-44 h-44 border-2 border-primary rounded-2xl"
              animate={{ scale: [1, 1.04, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <motion.div
            className="absolute left-8 right-8 h-px bg-primary/60"
            animate={{ top: ['30%', '70%', '30%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute bottom-3 inset-x-0 text-center">
            <span className="text-xs bg-foreground/60 text-background px-3 py-1 rounded-full">
              스트립을 사각형 안에 맞춰주세요
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">스캔 진행률</span>
            <span className="font-bold text-foreground">{scanProgress}%</span>
          </div>
          <Progress value={scanProgress} className="h-2" />
        </div>
      </motion.div>
    )}

    {/* ANALYZING */}
    {phase === 'analyzing' && (
      <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-24 space-y-6">
        <motion.div
          className="w-16 h-16 rounded-full border-[3px] border-muted border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <div className="text-center">
          <p className="font-bold text-foreground mb-1">AI 분석 중</p>
          <p className="text-sm text-muted-foreground">코르티솔 농도를 정량 분석하고 있습니다</p>
        </div>
        <div className="flex gap-2">
          {['색상 판독', '농도 추정', '교차 분석'].map((label, i) => (
            <motion.span
              key={label}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.8 }}
              className="text-[11px] px-2.5 py-1 rounded-full border border-border text-muted-foreground"
            >
              {label}
            </motion.span>
          ))}
        </div>
      </motion.div>
    )}

    {/* RESULT */}
    {phase === 'result' && result && (
      <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Risk Banner */}
        <div className={`p-5 rounded-2xl border text-center ${getRiskConfig(result.riskLevel).bg}`}>
          <Activity className="w-6 h-6 mx-auto mb-2" style={{ color: getRiskConfig(result.riskLevel).color }} />
          <p className="text-2xl font-bold text-foreground">{getRiskConfig(result.riskLevel).label}</p>
          <p className="text-sm text-muted-foreground mt-1">코르티솔 수치 <strong className="text-foreground">{result.cortisolLevel}/100</strong></p>
        </div>

        {/* Mind vs Body */}
        <div className="p-4 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-primary" />
            <p className="font-semibold text-sm text-foreground">마음 vs 몸 대시보드</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-3.5 rounded-xl bg-blue-50 border border-blue-100">
              <Heart className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
              <p className="text-[10px] text-muted-foreground mb-0.5">심리검사 (주관)</p>
              <p className="text-2xl font-bold text-blue-700">{result.subjectiveStress}%</p>
              <p className="text-[10px] text-blue-500 mt-0.5">"괜찮아요"</p>
            </div>
            <div className="text-center p-3.5 rounded-xl bg-red-50 border border-red-100">
              <Thermometer className="w-5 h-5 text-red-500 mx-auto mb-1.5" />
              <p className="text-[10px] text-muted-foreground mb-0.5">코르티솔 (객관)</p>
              <p className="text-2xl font-bold text-red-700">{result.objectiveStress}%</p>
              <p className="text-[10px] text-red-500 mt-0.5">위험 수준</p>
            </div>
          </div>

          {/* Gap */}
          <div className="p-3.5 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm text-foreground">괴리도 {result.gapPercentage}%p</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              주관적 인식과 실제 신체 스트레스 사이에 <strong className="text-foreground">{result.gapPercentage}%p 괴리</strong>가 발생했습니다.
            </p>
          </div>

          {/* Bars */}
          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">마음</span>
                <span className="font-bold text-blue-600">{result.subjectiveStress}%</span>
              </div>
              <div className="h-2.5 bg-blue-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-blue-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${result.subjectiveStress}%` }} transition={{ duration: 1, delay: 0.3 }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">몸</span>
                <span className="font-bold text-red-600">{result.objectiveStress}%</span>
              </div>
              <div className="h-2.5 bg-red-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-red-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${result.objectiveStress}%` }} transition={{ duration: 1, delay: 0.5 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="p-4 rounded-2xl border border-border bg-card">
          <p className="font-semibold text-sm text-foreground flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            AI 분석 인사이트
          </p>
          <div className="space-y-2.5">
            {result.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[10px] font-bold text-primary bg-primary/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-4 rounded-2xl border border-border bg-card">
          <p className="font-semibold text-sm text-foreground flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            맞춤 추천
          </p>
          <div className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
                <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* References */}
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
          <div className="flex items-start gap-2">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Hellhammer et al. (2009), Zangheri et al. (2015), Epel et al. (2018)
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button variant="outline" onClick={() => { setPhase('intro'); setResult(null); }} className="h-12 rounded-xl">
            다시 측정
          </Button>
          <Button onClick={() => navigate('/ai-counselor')} className="h-12 rounded-xl">
            AI 상담 받기
          </Button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default CortisolScan;
