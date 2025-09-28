import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, Brain, Sparkles, Heart, Activity, Play, Pause, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface VoiceAnalysisResult {
  emotion: string;
  confidence: number;
  stressLevel: number;
  energyLevel: number;
  moodValence?: number;
  arousalLevel?: number;
  recommendations: string[];
  voiceCharacteristics: {
    pitch: string;
    speed: string;
    clarity: string;
    emotionalTone?: string;
    confidence?: string;
  };
  analysis: string;
  transcription: string;
  detailedAnalysis?: {
    primaryEmotion?: string;
    secondaryEmotions?: string[];
    emotionalIntensity?: number;
    emotionalStability?: number;
    cognitiveState?: string;
    physicalIndicators?: string[];
    speechPatterns?: {
      coherence?: number;
      complexity?: number;
      emotionalExpression?: number;
    };
  };
  psychologicalProfile?: {
    overallMentalState?: string;
    stressFactors?: string[];
    copingMechanisms?: string[];
    resilience?: number;
    socialConnectedness?: number;
    selfAwareness?: number;
  };
  followUpSuggestions?: string[];
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

  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case '행복': return 'bg-red-500';
      case '차분함': return 'bg-blue-500';
      case '스트레스': return 'bg-orange-500';
      case '피로': return 'bg-gray-500';
      case '활기찬': return 'bg-yellow-500';
      default: return 'bg-primary';
    }
  };

  // 실시간 웨이브폼 생성
  const generateWaveform = useCallback(() => {
    if (isRecording) {
      const newWave = Array.from({ length: 30 }, () => Math.random() * 80 + 20);
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
        name: '신뢰도',
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
      },
      {
        name: '기분 지수',
        value: (result.moodValence || 5) * 10,
        fill: '#3b82f6'
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
      setResult(null);
      
      // 녹음 시간 타이머
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "🎙️ 녹음 시작",
        description: "자연스럽게 말씀해주세요. AI가 실시간으로 분석합니다.",
      });
    } catch (error) {
      console.error('녹음 시작 오류:', error);
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
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // 오디오 URL 생성 (재생용)
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // 녹음이 너무 짧으면 경고
        if (recordingTime < 3) {
          toast({
            title: "녹음 시간이 짧습니다",
            description: "더 정확한 분석을 위해 3초 이상 녹음해주세요.",
            variant: "destructive",
          });
        } else {
          // 자동으로 분석 시작
          await analyzeAudio(audioBlob);
        }
      };
      
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording, recordingTime, toast]);

  const analyzeAudio = async (blob?: Blob) => {
    const targetBlob = blob || audioBlob;
    if (!targetBlob) {
      toast({
        title: "오류",
        description: "분석할 음성이 없습니다. 다시 녹음해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(targetBlob);
      
      reader.onload = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          
          console.log('음성 분석 함수 호출 중...');
          const { data, error } = await supabase.functions.invoke('voice-emotion-analyzer', {
            body: {
              audioData: base64Audio,
              title: `음성 분석 ${new Date().toLocaleDateString('ko-KR')}`
            }
          });

          console.log('함수 응답:', { data, error });

          if (error) {
            console.error('함수 오류:', error);
            throw new Error(error.message || '음성 분석 중 오류가 발생했습니다.');
          }

          if (data && data.success) {
            const emotionAnalysis = data.emotion_analysis || {};
            
            const analysisResult = {
              emotion: emotionAnalysis.emotion || '중립',
              confidence: emotionAnalysis.confidence || 70,
              stressLevel: emotionAnalysis.stressLevel || 30,
              energyLevel: emotionAnalysis.energyLevel || 50,
              moodValence: emotionAnalysis.moodValence || 5,
              arousalLevel: emotionAnalysis.arousalLevel || 5,
              recommendations: emotionAnalysis.recommendations || ['정기적인 휴식을 취하세요'],
              voiceCharacteristics: emotionAnalysis.voiceCharacteristics || {
                pitch: '보통',
                speed: '보통', 
                clarity: '보통'
              },
              analysis: emotionAnalysis.analysis || '음성 분석이 완료되었습니다.',
              transcription: data.transcription || '음성 인식 결과',
              detailedAnalysis: emotionAnalysis.detailedAnalysis || {},
              psychologicalProfile: emotionAnalysis.psychologicalProfile || {},
              followUpSuggestions: emotionAnalysis.followUpSuggestions || []
            };

            setResult(analysisResult);
            
            toast({
              title: "✨ 완벽한 감정 분석 완료",
              description: "AI가 당신의 음성과 심리상태를 종합적으로 분석했습니다!",
            });
          } else {
            throw new Error(data?.error || '분석 중 오류가 발생했습니다.');
          }
        } catch (error) {
          console.error('음성 분석 오류:', error);
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
      console.error('파일 읽기 오류:', error);
      setIsAnalyzing(false);
      toast({
        title: "파일 오류",
        description: "음성 파일을 읽는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PageContainer>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 헤더 */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              음성 분석 시작하기
            </h1>
            <p className="text-lg text-gray-600">
              아래 버튼을 클릭하여 음성을 녹음하면 AI가 실시간으로 분석합니다
            </p>
          </div>

          {/* 메인 녹음 섹션 */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <div className="text-center space-y-6">
              
              {/* 웨이브폼 시각화 */}
              {isRecording && (
                <div className="flex items-center justify-center space-x-1 h-20">
                  {waveform.map((height, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-t from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                      style={{ 
                        height: `${height}%`, 
                        width: '4px',
                        opacity: 0.8
                      }}
                    />
                  ))}
                </div>
              )}

              {/* 녹음된 음성 정보 */}
              {audioBlob && !isRecording && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <Play className="w-6 h-6 text-gray-400" />
                    <span className="text-lg font-medium">녹음된 음성</span>
                    <span className="text-sm text-gray-500">{formatTime(recordingTime)}</span>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={playRecording}
                      disabled={isPlaying}
                      variant="outline"
                      size="sm"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {isPlaying ? '재생 중' : '재생'}
                    </Button>
                  </div>
                </div>
              )}

              {/* 녹음 시간 표시 */}
              {isRecording && (
                <div className="text-2xl font-mono font-bold text-purple-600">
                  {formatTime(recordingTime)}
                </div>
              )}

              {/* 메인 버튼들 */}
              <div className="space-y-4">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg"
                    disabled={isAnalyzing}
                  >
                    <Mic className="w-6 h-6 mr-3" />
                    음성 녹음 시작하기
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    size="lg"
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg"
                  >
                    <MicOff className="w-6 h-6 mr-3" />
                    녹음 중지하기
                  </Button>
                )}

                {/* 분석 버튼 */}
                {audioBlob && !isRecording && (
                  <div className="space-y-4">
                    <Button
                      onClick={() => analyzeAudio()}
                      disabled={isAnalyzing}
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                          AI 음성 분석 중...
                        </>
                      ) : (
                        <>
                          <Brain className="w-6 h-6 mr-3" />
                          AI 음성 분석 시작
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setAudioBlob(null);
                        setAudioUrl(null);
                        setResult(null);
                        setRecordingTime(0);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      다시 녹음
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* 분석 결과 */}
          {result && (
            <div className="space-y-6">
              {/* 주요 감정 결과 */}
              <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800">심리 상태 분석</h2>
                  
                  <div className="flex items-center justify-center space-x-4">
                    <div className={`p-4 rounded-full ${getEmotionColor(result.emotion)}`}>
                      {getEmotionIcon(result.emotion)}
                    </div>
                    <div className="text-left">
                      <h3 className="text-3xl font-bold text-gray-800">{result.emotion}</h3>
                      <p className="text-lg text-gray-600">신뢰도 {result.confidence}%</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">{result.analysis}</p>
                  </div>
                </div>
              </Card>

              {/* 음성 인식 결과 */}
              <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Volume2 className="w-5 h-5 mr-2" />
                  음성 인식 결과
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-gray-800 text-lg leading-relaxed">"{result.transcription}"</p>
                </div>
              </Card>

              {/* 상세 분석 차트 */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg">
                  <h3 className="text-lg font-bold mb-4">감정 신뢰도</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadialBarChart data={getEmotionChartData()}>
                      <RadialBar dataKey="value" cornerRadius={10} fill="#8b5cf6" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="text-center mt-2">
                    <span className="text-2xl font-bold text-purple-600">{result.confidence}%</span>
                  </div>
                </Card>

                <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg">
                  <h3 className="text-lg font-bold mb-4">심리 지표</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={getStressEnergyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* 음성 특성 */}
              <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg">
                <h3 className="text-xl font-bold mb-4">음성 특성 분석</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-700">음성 높이</div>
                    <div className="text-2xl font-bold text-blue-800">{result.voiceCharacteristics.pitch}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-700">말하기 속도</div>
                    <div className="text-2xl font-bold text-green-800">{result.voiceCharacteristics.speed}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-lg font-semibold text-purple-700">발음 명확도</div>
                    <div className="text-2xl font-bold text-purple-800">{result.voiceCharacteristics.clarity}</div>
                  </div>
                </div>
              </Card>

              {/* AI 추천사항 */}
              <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                  AI 추천사항
                </h3>
                <div className="space-y-3">
                  {result.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <Badge className="bg-yellow-500 text-white">{index + 1}</Badge>
                      <p className="text-gray-700 leading-relaxed">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* 오디오 엘리먼트 */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default VoiceEmotionAnalysis;