import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, Brain, Sparkles, Heart, Activity, Play, Pause } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

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
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case '행복': return <Heart className="text-red-500" />;
      case '차분함': return <Brain className="text-blue-500" />;
      case '스트레스': return <Activity className="text-orange-500" />;
      case '피로': return <MicOff className="text-gray-500" />;
      case '활기찬': return <Sparkles className="text-yellow-500" />;
      default: return <Brain className="text-primary" />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case '행복': return 'text-red-500 bg-red-50';
      case '차분함': return 'text-blue-500 bg-blue-50';
      case '스트레스': return 'text-orange-500 bg-orange-50';
      case '피로': return 'text-gray-500 bg-gray-50';
      case '활기찬': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-primary bg-primary/10';
    }
  };

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
    
    const emotionColors = {
      '행복': '#ef4444',
      '차분함': '#3b82f6', 
      '스트레스': '#f97316',
      '피로': '#6b7280',
      '활기찬': '#eab308'
    };

    return [
      {
        name: '감정 신뢰도',
        value: result.confidence,
        fill: emotionColors[result.emotion as keyof typeof emotionColors] || '#8884d8'
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
        title: "녹음 시작",
        description: "음성을 녹음하고 있습니다. 자연스럽게 말씀해주세요.",
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
              title: "분석 완료",
              description: "음성 감정 분석이 완료되었습니다.",
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
    <PageContainer
      title="음성 감정 분석"
      description="AI가 당신의 음성을 분석하여 감정 상태와 심리적 상태를 파악합니다"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* 녹음 섹션 */}
        <Card className="p-8">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">음성 녹음을 시작하세요</h2>
              <p className="text-muted-foreground">
                마이크 버튼을 클릭하여 음성 녹음을 시작하세요.
                {isRecording && (
                  <span className="block mt-2 text-primary font-medium">
                    녹음 중... {formatTime(recordingTime)}
                  </span>
                )}
              </p>
            </div>
            
            <div className="space-y-4">
              {isAnalyzing && (
                <div className="space-y-2">
                  <Progress value={undefined} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    음성을 텍스트로 변환하고 감정을 분석하는 중...
                  </p>
                </div>
              )}
              
              {audioUrl && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={isPlaying ? pauseRecording : playRecording}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        녹음된 음성 ({formatTime(recordingTime)})
                      </span>
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
              
              <div className="flex justify-center space-x-4">
                {!isRecording && !isAnalyzing ? (
                  <Button onClick={startRecording} size="lg" className="space-x-2">
                    <Mic className="w-5 h-5" />
                    <span>녹음 시작</span>
                  </Button>
                ) : isRecording ? (
                  <Button onClick={stopRecording} variant="destructive" size="lg" className="space-x-2">
                    <MicOff className="w-5 h-5" />
                    <span>녹음 중지</span>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </Card>

        {/* 분석 결과 */}
        {result && (
          <div className="space-y-6">
            {/* 감정 분석 차트 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 감정 신뢰도 차트 */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4">감정 분석 결과</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="80%" data={getEmotionChartData()}>
                      <RadialBar
                        dataKey="value"
                        cornerRadius={10}
                        fill={getEmotionChartData()[0]?.fill}
                      />
                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold">
                        {result.emotion}
                      </text>
                      <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-sm text-muted-foreground">
                        {result.confidence}% 신뢰도
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* 스트레스/에너지 레벨 차트 */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4">심리 상태</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getStressEnergyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, '']} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* 음성 특성 분석 차트 */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4">음성 특성 분석</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getVoiceCharacteristicsData()} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip formatter={(value) => [`${value}점`, '점수']} />
                    <Bar dataKey="점수" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* 메인 감정 결과 - 기존 디자인 유지 */}
            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`p-3 rounded-full ${getEmotionColor(result.emotion)}`}>
                  {getEmotionIcon(result.emotion)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{result.emotion}</h3>
                  <p className="text-muted-foreground">분석 신뢰도: {result.confidence}%</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">{result.analysis}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">스트레스 레벨</p>
                  <Progress value={result.stressLevel} className="mb-2" />
                  <p className="text-sm">{result.stressLevel}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">에너지 레벨</p>
                  <Progress value={result.energyLevel} className="mb-2" />
                  <p className="text-sm">{result.energyLevel}%</p>
                </div>
              </div>
            </Card>

            {/* 음성 특성 요약 */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4">음성 특성 요약</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Volume2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">음성 높이</p>
                  <p className="text-sm text-muted-foreground">{result.voiceCharacteristics.pitch}</p>
                </div>
                <div className="text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">말하기 속도</p>
                  <p className="text-sm text-muted-foreground">{result.voiceCharacteristics.speed}</p>
                </div>
                <div className="text-center">
                  <Brain className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">발음 명확도</p>
                  <p className="text-sm text-muted-foreground">{result.voiceCharacteristics.clarity}</p>
                </div>
              </div>
            </Card>

            {/* 추천사항 */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4">개인 맞춤 추천</h4>
              <div className="space-y-3">
                {result.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* 음성 전사 결과 */}
            {result.transcription && (
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4">음성 인식 결과</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm italic">"{result.transcription}"</p>
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
                className="space-x-2"
              >
                <Mic className="w-4 h-4" />
                <span>다시 분석하기</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default VoiceEmotionAnalysis;