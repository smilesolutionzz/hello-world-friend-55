import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Play, Pause, Volume2, Sparkles, Crown, Zap, Brain, Heart, Activity, Users, TrendingUp, Eye, Star, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { voiceDiaryService } from '@/services/voiceDiaryService';
// Mock user for now
const useAuth = () => ({ user: { id: 'mock-user-id' } });
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface VoiceAnalysisResult {
  emotion: string;
  confidence: number;
  stressLevel: number;
  energyLevel: number;
  recommendations: string[];
  voiceCharacteristics: {
    pitch: string;
    speed: string;
    clarity: string;
  };
  analysis: string;
  transcription: string;
  timeBasedStress?: string;
  dailyStressFactors?: string[];
}

export default function VoiceEmotionAnalysis() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VoiceAnalysisResult | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>();

  // 구독자 기능 리스트
  const subscriberFeatures = [
    {
      icon: Brain,
      title: "고급 AI 감정 분석",
      description: "GPT-4 기반 심층 감정 상태 분석",
      isNew: false
    },
    {
      icon: Crown,
      title: "무제한 음성 분석",
      description: "월 제한 없이 무제한으로 이용 가능",
      isNew: false
    },
    {
      icon: Sparkles,
      title: "개인화된 추천",
      description: "당신만의 맞춤형 감정 관리 솔루션",
      isNew: true
    },
    {
      icon: Zap,
      title: "즉시 감정 피드백",
      description: "AI 기반 실시간 감정 상태 모니터링",
      isNew: true
    }
  ];

  // 이번 달 AI 업데이트
  const monthlyUpdates = [
    { date: "2025.09", feature: "GPT-4 Turbo 음성 분석 엔진 적용", status: "완료" },
    { date: "2025.09", feature: "실시간 감정 트래킹 시스템", status: "진행중" },
    { date: "2025.09", feature: "다중 언어 감정 분석 지원", status: "예정" }
  ];

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case '행복': return <Heart className="w-6 h-6 text-red-500" />;
      case '차분함': return <Brain className="w-6 h-6 text-blue-500" />;
      case '스트레스': return <Activity className="w-6 h-6 text-orange-500" />;
      case '피로': return <Activity className="w-6 h-6 text-gray-500" />;
      case '활기찬': return <Sparkles className="w-6 h-6 text-yellow-500" />;
      default: return <Brain className="w-6 h-6 text-primary" />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case '행복': return 'text-red-600 bg-red-50 border-red-200';
      case '차분함': return 'text-blue-600 bg-blue-50 border-blue-200';
      case '스트레스': return 'text-orange-600 bg-orange-50 border-orange-200';
      case '피로': return 'text-gray-600 bg-gray-50 border-gray-200';
      case '활기찬': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  // 웨이브폼 애니메이션
  const generateWaveform = () => {
    const newWaveform = Array.from({ length: 20 }, () => Math.random() * 100);
    setWaveform(newWaveform);
  };

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(generateWaveform, 100);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('음성 녹음이 시작되었습니다.');
    } catch (error) {
      console.error('녹음 시작 실패:', error);
      toast.error('마이크 권한을 허용해주세요.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      toast.success('음성 녹음이 완료되었습니다.');
    }
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const analyzeVoice = async () => {
    if (!audioBlob || !user) {
      toast.error('음성을 먼저 녹음해주세요.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      toast.success('AI 분석을 시작합니다. 잠시만 기다려주세요...');

      // Convert audio blob to base64 efficiently (chunked)
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const base64Audio = btoa(binary);

      // Call Supabase Edge Function for transcription + emotion analysis
      const { data, error } = await supabase.functions.invoke('voice-emotion-analyzer', {
        body: { audioData: base64Audio, analysisType: 'detailed' }
      });

      if (error) throw error;
      if (!data) throw new Error('AI 분석 결과가 없습니다.');

      const analysisResult: VoiceAnalysisResult = {
        emotion: data?.emotion || data?.analysis?.emotion || '분석됨',
        confidence: Math.round(data?.confidence || data?.analysis?.confidence || 85),
        stressLevel: Math.round(data?.stressLevel || data?.analysis?.stressLevel || 50),
        energyLevel: Math.round(data?.energyLevel || data?.analysis?.energyLevel || 60),
        transcription: data?.transcription || data?.text || '',
        voiceCharacteristics: data?.voiceCharacteristics || { pitch: '보통', speed: '보통', clarity: '보통' },
        analysis: data?.analysisText || data?.analysis || 'AI 분석 결과를 생성했습니다.',
        timeBasedStress: data?.timeBasedStress,
        dailyStressFactors: data?.dailyStressFactors,
        recommendations: data?.recommendations || []
      };

      setResult(analysisResult);
      setShowAnalysis(true);

      // Save audio to Storage (public bucket) under user folder for access control via policies
      const fileName = `voice_${Date.now()}.webm`;
      const objectPath = `${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('voice-recordings')
        .upload(objectPath, audioBlob, { contentType: 'audio/webm' });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

        const { data: publicUrlData } = supabase.storage
          .from('voice-recordings')
          .getPublicUrl(objectPath);

        // Persist diary entry using the service
        await voiceDiaryService.createEntry({
          user_id: user.id,
          title: `${analysisResult.emotion} 감정 일기`,
          audio_url: publicUrlData.publicUrl,
          audio_duration: recordingTime,
          transcription: analysisResult.transcription,
          emotion_analysis: {
            emotion: analysisResult.emotion,
            confidence: analysisResult.confidence,
            stressLevel: analysisResult.stressLevel,
            energyLevel: analysisResult.energyLevel,
            recommendations: analysisResult.recommendations,
            voiceCharacteristics: analysisResult.voiceCharacteristics,
            analysis: analysisResult.analysis,
            timeBasedStress: analysisResult.timeBasedStress,
            dailyStressFactors: analysisResult.dailyStressFactors
          },
          diary_date: format(new Date(), 'yyyy-MM-dd')
        });

      toast.success('음성 일기가 저장되었습니다!');
    } catch (error) {
      console.error('음성 분석 실패:', error);
      toast.error('음성 분석에 실패했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setShowAnalysis(false);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setWaveform([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">HIGHLIGHT</h1>
              <div className="hidden md:flex items-center space-x-6">
                <a href="/" className="text-gray-600 hover:text-primary transition-colors">홈</a>
                <a href="/voice-emotion-analysis" className="text-primary font-medium">음성분석</a>
                <a href="/voice-diary" className="text-gray-600 hover:text-primary transition-colors">음성일기</a>
                <a href="/dashboard" className="text-gray-600 hover:text-primary transition-colors">대시보드</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-primary transition-colors">로그아웃</button>
            </div>
          </nav>
        </div>
      </header>

      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
              <Crown className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium">Premium AI Technology</span>
              <Badge className="bg-yellow-400 text-yellow-900 text-xs">NEW</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              음성 감정 분석
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              GPT-4 기반 AI가 당신의 음성을 분석하여 감정 상태를 실시간으로 파악합니다
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* 구독자 혜택 섹션 */}
        <Card className="overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Crown className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-amber-900">구독자 전용 혜택</h3>
                  <p className="text-amber-700">AI 트렌드를 선도하는 최신 기능들을 경험하세요</p>
                </div>
              </div>
              <Badge className="bg-amber-200 text-amber-800">PREMIUM</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {subscriberFeatures.map((feature, index) => (
                <div key={index} className="p-4 bg-white/60 rounded-lg border border-amber-200 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <feature.icon className="w-5 h-5 text-amber-600" />
                    {feature.isNew && <Badge className="bg-red-500 text-white text-xs">NEW</Badge>}
                  </div>
                  <h4 className="font-medium text-amber-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-amber-700">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/70 rounded-lg p-4 border border-amber-200">
              <h4 className="text-sm font-medium text-amber-900 mb-3">2025년 AI 트렌드 적용 로드맵</h4>
              <div className="space-y-3">
                {monthlyUpdates.map((update, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        update.status === '완료' ? 'bg-green-500' :
                        update.status === '진행중' ? 'bg-blue-500 animate-pulse' :
                        'bg-gray-400'
                      }`}></div>
                      <div>
                        <div className="text-sm font-medium text-amber-900">{update.feature}</div>
                        <div className="text-xs text-amber-700">{update.date}</div>
                      </div>
                    </div>
                    <Badge className={`text-xs ${
                      update.status === '완료' ? 'bg-green-100 text-green-800' :
                      update.status === '진행중' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {update.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {!showAnalysis ? (
          // 녹음 인터페이스
          <Card className="relative overflow-hidden backdrop-blur-sm bg-white/80 border-white/40">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
            <div className="relative p-8">
              <div className="text-center space-y-8">
                {/* 메인 녹음 버튼 */}
                <div className="relative">
                  <div className={cn(
                    "w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer",
                    isRecording ? 
                      "bg-gradient-to-br from-red-500 to-pink-500 shadow-2xl shadow-red-500/30 animate-pulse" :
                      "bg-gradient-to-br from-blue-500 to-purple-500 shadow-2xl shadow-blue-500/30 hover:shadow-3xl hover:scale-105"
                  )}
                  onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <MicOff className="w-12 h-12 text-white" />
                    ) : (
                      <Mic className="w-12 h-12 text-white" />
                    )}
                  </div>
                  
                  {isRecording && (
                    <div className="absolute -inset-4 rounded-full border-2 border-red-500/30 animate-ping pointer-events-none"></div>
                  )}
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isRecording ? '녹음 중...' : '음성 감정 분석 시작'}
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {isRecording ? 
                      '자연스럽게 말씀해주세요. AI가 당신의 감정을 분석합니다.' :
                      '마이크 버튼을 눌러 음성 녹음을 시작하세요.'
                    }
                  </p>

                  {isRecording && (
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-3xl font-mono text-blue-600 font-bold">
                        {formatTime(recordingTime)}
                      </div>
                      <Button variant="destructive" size="sm" onClick={stopRecording}>
                        녹음 중지
                      </Button>
                    </div>
                  )}
                </div>

                {/* 웨이브폼 시각화 */}
                {isRecording && (
                  <div className="flex items-end justify-center space-x-1 h-20 py-4">
                    {waveform.map((height, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-full transition-all duration-75"
                        style={{
                          height: `${Math.max(4, height * 0.8)}px`,
                          width: '4px',
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* 오디오 재생 */}
                {audioUrl && !isRecording && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={playAudio}
                        className="flex items-center space-x-2"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isPlaying ? '일시정지' : '재생'}</span>
                      </Button>
                      <span className="text-sm text-gray-600">
                        녹음 시간: {formatTime(recordingTime)}
                      </span>
                    </div>

                    <Button
                      onClick={analyzeVoice}
                      disabled={isAnalyzing}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 text-lg font-medium hover:shadow-lg transition-all duration-200"
                    >
                      {isAnalyzing ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>AI 분석 중...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Brain className="w-5 h-5" />
                          <span>음성 분석 시작하기</span>
                        </div>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ) : (
          // 분석 결과
          result && (
            <div className="space-y-6">
              {/* 결과 헤더 */}
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${getEmotionColor(result.emotion)}`}>
                        {getEmotionIcon(result.emotion)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">분석 완료!</h3>
                        <p className="text-gray-600">AI가 당신의 감정을 분석했습니다</p>
                      </div>
                    </div>
                    <Button
                      onClick={resetAnalysis}
                      variant="outline"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      다시 분석하기
                    </Button>
                  </div>
                </div>
              </Card>

              {/* 감정 결과 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span>감정 분석 결과</span>
                  </h4>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${getEmotionColor(result.emotion)}`}>
                        {getEmotionIcon(result.emotion)}
                        <span className="font-medium text-lg">{result.emotion}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">신뢰도: {result.confidence}%</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">스트레스 수준</span>
                        <span className="font-medium">{result.stressLevel}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${result.stressLevel}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">에너지 수준</span>
                        <span className="font-medium">{result.energyLevel}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${result.energyLevel}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Volume2 className="w-5 h-5 text-blue-500" />
                    <span>음성 특성</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">음성 높이</span>
                      <span className="font-medium">{result.voiceCharacteristics.pitch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">말하기 속도</span>
                      <span className="font-medium">{result.voiceCharacteristics.speed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">발음 명확도</span>
                      <span className="font-medium">{result.voiceCharacteristics.clarity}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 음성 인식 결과 */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-purple-500" />
                  <span>음성 인식 결과</span>
                </h4>
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                  <p className="text-gray-800 italic">"{result.transcription}"</p>
                </div>
              </Card>

              {/* AI 분석 */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-indigo-500" />
                  <span>AI 전문 분석</span>
                </h4>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <div className="prose prose-sm text-indigo-800 leading-relaxed whitespace-pre-line">
                    {result.analysis}
                  </div>
                </div>
              </Card>

              {/* 시간대별 스트레스 분석 */}
              {result.timeBasedStress && (
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    <span>시간대별 스트레스 분석</span>
                  </h4>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-orange-800 leading-relaxed">{result.timeBasedStress}</p>
                    {result.dailyStressFactors && (
                      <div className="mt-4">
                        <h5 className="font-medium text-orange-900 mb-2">주요 스트레스 요인:</h5>
                        <ul className="space-y-1">
                          {result.dailyStressFactors.map((factor: string, index: number) => (
                            <li key={index} className="text-sm text-orange-700 flex items-start space-x-2">
                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* 추천사항 */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-green-500" />
                  <span>맞춤 추천사항</span>
                </h4>
                <div className="space-y-3">
                  {result.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-sm font-medium text-green-700 flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-green-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* 다음 단계 */}
              <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <div className="text-center space-y-4">
                  <h4 className="text-xl font-semibold text-purple-900">다음 단계</h4>
                  <p className="text-purple-700">전문가와의 상담을 통해 더 깊이 있는 분석을 받아보세요</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    전문가 상담 예약하기
                  </Button>
                </div>
              </Card>
            </div>
          )
        )}
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
}