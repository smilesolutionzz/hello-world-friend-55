import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, Brain, Sparkles, Heart, Activity, Play, Pause, Crown, Zap, Star, TrendingUp, Users, Calendar, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

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
}

const VoiceEmotionAnalysis = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VoiceAnalysisResult | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>();

  // 구독자 기능 리스트
  const subscriberFeatures = [
    {
      icon: Brain,
      title: "실시간 감정 AI 분석",
      description: "OpenAI 최신 모델로 음성 감정 실시간 분석",
      isNew: true
    },
    {
      icon: TrendingUp,
      title: "월간 AI 트렌드 업데이트",
      description: "매월 최신 AI 기술 자동 적용 및 업데이트",
      isNew: false
    },
    {
      icon: Star,
      title: "고급 음성 특성 분석",
      description: "음성 높이, 속도, 명확도 정밀 분석",
      isNew: false
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
    { date: "2024.01", feature: "GPT-4 Turbo 음성 분석 엔진 적용", status: "완료" },
    { date: "2024.02", feature: "실시간 감정 트래킹 시스템", status: "진행중" },
    { date: "2024.03", feature: "다중 언어 감정 분석 지원", status: "예정" }
  ];

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case '행복': return <Heart className="w-6 h-6 text-red-500" />;
      case '차분함': return <Brain className="w-6 h-6 text-blue-500" />;
      case '스트레스': return <Activity className="w-6 h-6 text-orange-500" />;
      case '피로': return <MicOff className="w-6 h-6 text-gray-500" />;
      case '활기찬': return <Sparkles className="w-6 h-6 text-yellow-500" />;
      default: return <Brain className="w-6 h-6 text-primary" />;
    }
  };

  const getEmotionGradient = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case '행복': return 'from-red-400 to-pink-500';
      case '차분함': return 'from-blue-400 to-indigo-500';
      case '스트레스': return 'from-orange-400 to-red-500';
      case '피로': return 'from-gray-400 to-slate-500';
      case '활기찬': return 'from-yellow-400 to-orange-500';
      default: return 'from-purple-400 to-blue-500';
    }
  };

  // 실시간 웨이브폼 생성
  const generateWaveform = useCallback(() => {
    if (isRecording) {
      const newWave = Array.from({ length: 40 }, () => Math.random() * 100);
      setWaveform(newWave);
      animationRef.current = requestAnimationFrame(generateWaveform);
    }
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      generateWaveform();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, generateWaveform]);

  // 오디오 재생 함수
  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // 차트 데이터 생성
  const getEmotionChartData = () => {
    if (!result) return [];
    
    return [
      {
        name: '감정 신뢰도',
        value: result.confidence,
        fill: '#8b5cf6'
      }
    ];
  };

  const getStressEnergyData = () => {
    if (!result) return [];
    
    return [
      {
        name: '스트레스',
        value: result.stressLevel,
        fill: '#f97316'
      },
      {
        name: '에너지',
        value: result.energyLevel,
        fill: '#10b981'
      }
    ];
  };

  const getVoiceCharacteristicsData = () => {
    if (!result) return [];
    
    const scoreMap = {
      '안정적': 85, '높음': 70, '낮음': 60,
      '적절함': 90, '빠름': 75, '느림': 65,
      '명확함': 95, '보통': 70, '불분명': 40
    };

    return [
      {
        name: '음성 높이',
        점수: scoreMap[result.voiceCharacteristics.pitch as keyof typeof scoreMap] || 50,
        fill: '#8b5cf6'
      },
      {
        name: '말하기 속도', 
        점수: scoreMap[result.voiceCharacteristics.speed as keyof typeof scoreMap] || 50,
        fill: '#06b6d4'
      },
      {
        name: '발음 명확도',
        점수: scoreMap[result.voiceCharacteristics.clarity as keyof typeof scoreMap] || 50,
        fill: '#84cc16'
      }
    ];
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // 녹음 시간 타이머
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "🎙️ 녹음 시작",
        description: "AI가 당신의 음성을 분석하고 있습니다",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "녹음 오류",
        description: "마이크 접근 권한을 확인해주세요.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // 오디오 URL 생성 (재생용)
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // 분석 시작
        analyzeAudio(audioBlob);
      };
      
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const analyzeAudio = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onload = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          
          const { data, error } = await supabase.functions.invoke('voice-emotion-analyzer', {
            body: {
              audioData: base64Audio,
              analysisType: 'emotion'
            }
          });

          if (error) {
            throw error;
          }

          if (data.success) {
            setResult({
              emotion: data.emotion,
              confidence: data.confidence,
              stressLevel: data.stressLevel,
              energyLevel: data.energyLevel,
              recommendations: data.recommendations,
              voiceCharacteristics: data.voiceCharacteristics,
              analysis: data.analysis,
              transcription: data.transcription
            });
            
            toast({
              title: "✨ 분석 완료",
              description: "AI가 당신의 감정을 성공적으로 분석했습니다!",
            });
          } else {
            throw new Error(data.error || '분석 중 오류가 발생했습니다.');
          }
        } catch (error) {
          console.error('Error analyzing audio:', error);
          toast({
            title: "분석 오류",
            description: error instanceof Error ? error.message : "음성 분석 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        } finally {
          setIsAnalyzing(false);
        }
      };
    } catch (error) {
      console.error('Error reading audio file:', error);
      setIsAnalyzing(false);
      toast({
        title: "파일 오류",
        description: "음성 파일을 읽는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 컴포넌트 언마운트시 오디오 URL 정리
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* 헤로 섹션 */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10" />
        <div className="container mx-auto px-4 py-12 relative">
          {/* 프리미엄 배지 */}
          <div className="flex justify-center mb-6">
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 text-sm font-medium">
              <Crown className="w-4 h-4 mr-2" />
              프리미엄 AI 기능
            </Badge>
          </div>

          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI 음성 감정 분석
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              OpenAI 최신 기술로 당신의 음성을 분석하여<br />
              <span className="font-semibold text-purple-600">실시간 감정 상태와 심리적 패턴</span>을 정밀하게 파악합니다
            </p>

            {/* 구독자 혜택 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
              {subscriberFeatures.map((feature, index) => (
                <Card key={index} className="relative p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 group">
                  {feature.isNew && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs">
                      NEW
                    </Badge>
                  )}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-center">{feature.title}</h3>
                    <p className="text-sm text-gray-600 text-center leading-relaxed">{feature.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* 녹음 섹션 */}
        <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
          <div className="relative p-8 md:p-12">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">음성 분석 시작하기</h2>
                <p className="text-gray-600 text-lg">
                  아래 버튼을 클릭하여 음성을 녹음하면 AI가 실시간으로 분석합니다
                </p>
              </div>

              {/* 녹음 상태 표시 */}
              <div className="relative">
                {isRecording && (
                  <div className="mb-8">
                    <div className="flex justify-center items-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-500 font-medium">녹음 중... {formatTime(recordingTime)}</span>
                    </div>
                    
                    {/* 실시간 웨이브폼 */}
                    <div className="flex justify-center items-end space-x-1 h-16">
                      {waveform.map((height, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-t from-purple-500 to-blue-500 rounded-full transition-all duration-150"
                          style={{
                            width: '4px',
                            height: `${Math.max(8, height * 0.4)}px`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 분석 중 표시 */}
                {isAnalyzing && (
                  <div className="space-y-6 mb-8">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <Brain className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Progress value={undefined} className="w-full max-w-md mx-auto h-2" />
                      <p className="text-purple-600 font-medium">
                        AI가 음성을 분석하고 있습니다...
                      </p>
                      <p className="text-sm text-gray-500">
                        음성 → 텍스트 → 감정 분석 → 결과 생성
                      </p>
                    </div>
                  </div>
                )}

                {/* 오디오 재생 */}
                {audioUrl && !isRecording && !isAnalyzing && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl max-w-md mx-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={isPlaying ? pauseRecording : playRecording}
                          className="rounded-full"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <div>
                          <p className="font-medium text-gray-900">녹음된 음성</p>
                          <p className="text-sm text-gray-600">{formatTime(recordingTime)}</p>
                        </div>
                      </div>
                    </div>
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                  </div>
                )}

                {/* 녹음 버튼 */}
                <div className="flex justify-center">
                  {!isRecording && !isAnalyzing ? (
                    <Button 
                      onClick={startRecording} 
                      size="lg" 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Mic className="w-6 h-6 mr-3" />
                      음성 분석 시작하기
                    </Button>
                  ) : isRecording ? (
                    <Button 
                      onClick={stopRecording} 
                      variant="destructive" 
                      size="lg" 
                      className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 px-8 py-4 rounded-2xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <MicOff className="w-6 h-6 mr-3" />
                      녹음 중지
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 분석 결과 */}
        {result && (
          <div className="space-y-8">
            {/* 메인 감정 결과 */}
            <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
              <div className={`absolute inset-0 bg-gradient-to-br ${getEmotionGradient(result.emotion)} opacity-5`} />
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${getEmotionGradient(result.emotion)} text-white shadow-lg`}>
                      {getEmotionIcon(result.emotion)}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900">{result.emotion}</h3>
                      <p className="text-gray-600">AI 분석 신뢰도: {result.confidence}%</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 px-4 py-2">
                    <Sparkles className="w-4 h-4 mr-2" />
                    분석 완료
                  </Badge>
                </div>
                
                <p className="text-gray-700 text-lg leading-relaxed mb-6">{result.analysis}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">스트레스 레벨</span>
                      <span className="text-orange-600 font-bold">{result.stressLevel}%</span>
                    </div>
                    <Progress value={result.stressLevel} className="h-3" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">에너지 레벨</span>
                      <span className="text-green-600 font-bold">{result.energyLevel}%</span>
                    </div>
                    <Progress value={result.energyLevel} className="h-3" />
                  </div>
                </div>
              </div>
            </Card>

            {/* 감정 분석 차트 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 감정 신뢰도 차트 */}
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <h4 className="text-xl font-bold mb-6 text-gray-900">감정 분석 결과</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="80%" data={getEmotionChartData()}>
                      <RadialBar
                        dataKey="value"
                        cornerRadius={10}
                        fill="url(#emotionGradient)"
                      />
                      <defs>
                        <linearGradient id="emotionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                      <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-gray-900">
                        {result.emotion}
                      </text>
                      <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-gray-600">
                        {result.confidence}% 신뢰도
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* 스트레스/에너지 레벨 차트 */}
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <h4 className="text-xl font-bold mb-6 text-gray-900">심리 상태 분석</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getStressEnergyData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis domain={[0, 100]} stroke="#6b7280" />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, '']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* 음성 특성 분석 차트 */}
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <h4 className="text-xl font-bold mb-6 text-gray-900">음성 특성 상세 분석</h4>
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getVoiceCharacteristicsData()} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" domain={[0, 100]} stroke="#6b7280" />
                    <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => [`${value}점`, '점수']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="점수" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 음성 특성 요약 */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <Volume2 className="w-10 h-10 mx-auto mb-3 text-purple-600" />
                  <p className="font-semibold text-gray-900">음성 높이</p>
                  <p className="text-purple-600 font-medium">{result.voiceCharacteristics.pitch}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <Activity className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                  <p className="font-semibold text-gray-900">말하기 속도</p>
                  <p className="text-blue-600 font-medium">{result.voiceCharacteristics.speed}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <Brain className="w-10 h-10 mx-auto mb-3 text-green-600" />
                  <p className="font-semibold text-gray-900">발음 명확도</p>
                  <p className="text-green-600 font-medium">{result.voiceCharacteristics.clarity}</p>
                </div>
              </div>
            </Card>

            {/* 개인 맞춤 추천 */}
            <Card className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-xl">
              <h4 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
                <Sparkles className="w-6 h-6 mr-3 text-purple-600" />
                AI 개인 맞춤 추천
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {result.recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-white/80 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 음성 전사 결과 */}
            {result.transcription && (
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <h4 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
                  <Brain className="w-6 h-6 mr-3 text-blue-600" />
                  음성 인식 결과
                </h4>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-l-4 border-blue-500">
                  <p className="text-lg text-gray-800 italic leading-relaxed">"{result.transcription}"</p>
                </div>
              </Card>
            )}

            {/* 다시 시도 버튼 */}
            <div className="text-center">
              <Button 
                onClick={() => {
                  setResult(null);
                  setRecordingTime(0);
                  setAudioBlob(null);
                  if (audioUrl) {
                    URL.revokeObjectURL(audioUrl);
                    setAudioUrl(null);
                  }
                  setIsPlaying(false);
                }} 
                variant="outline"
                className="px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 rounded-xl text-lg font-medium"
              >
                <Mic className="w-5 h-5 mr-3" />
                새로운 음성 분석하기
              </Button>
            </div>
          </div>
        )}

        {/* 월간 AI 업데이트 로드맵 */}
        <Card className="p-8 bg-gradient-to-br from-gray-50 to-slate-100 border-0 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-7 h-7 mr-3 text-blue-600" />
              이번 달 AI 업데이트
            </h3>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              구독자 전용
            </Badge>
          </div>
          
          <div className="space-y-4">
            {monthlyUpdates.map((update, index) => (
              <div key={index} className="flex items-center justify-between p-6 bg-white/80 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {update.date.split('.')[1]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{update.feature}</h4>
                    <p className="text-sm text-gray-600">{update.date}</p>
                  </div>
                </div>
                <Badge 
                  className={
                    update.status === '완료' ? 'bg-green-100 text-green-800' :
                    update.status === '진행중' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }
                >
                  {update.status}
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-lg mb-2">매월 최신 AI 기술 자동 적용</h4>
                <p className="text-purple-100">GPT-5, Claude-4 등 최신 모델이 출시되면 즉시 업데이트됩니다</p>
              </div>
              <Users className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VoiceEmotionAnalysis;