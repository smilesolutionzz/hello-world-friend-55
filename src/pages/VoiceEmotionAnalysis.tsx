import React, { useState, useRef, useCallback } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, Brain, Sparkles, Heart, Activity } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

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
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
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

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      mediaRecorderRef.current.onstop = async () => {
        try {
          setIsAnalyzing(true);
          
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          
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
              console.error('Analysis error:', error);
              toast({
                title: "분석 오류",
                description: "음성 분석 중 오류가 발생했습니다. 다시 시도해주세요.",
                variant: "destructive",
              });
            } finally {
              setIsAnalyzing(false);
            }
          };
          
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Error processing audio:', error);
          setIsAnalyzing(false);
          toast({
            title: "오류",
            description: "음성 처리 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        }
      };
      
      // 스트림 정리
      const stream = mediaRecorderRef.current.stream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [isRecording, toast]);

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
        <Card className="p-8 text-center">
          <div className="space-y-6">
            <div className="flex justify-center">
              {isRecording ? (
                <div className="relative">
                  <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <Mic className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -inset-4 border-4 border-red-300 rounded-full animate-ping" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer">
                  <Mic className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
            
            {isRecording && (
              <div className="space-y-2">
                <p className="text-lg font-medium text-red-600">
                  녹음 중... {formatTime(recordingTime)}
                </p>
                <div className="flex justify-center">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-8 bg-red-500 rounded animate-pulse"
                        style={{
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '0.8s'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                {isAnalyzing ? '분석 중...' : isRecording ? '말씀해주세요' : '음성 녹음을 시작하세요'}
              </h3>
              <p className="text-muted-foreground">
                {isAnalyzing 
                  ? 'AI가 당신의 음성을 분석하고 있습니다. 잠시만 기다려주세요.'
                  : isRecording 
                    ? '자연스럽게 말씀해주세요. 15-30초 정도 충분합니다.'
                    : '마이크 버튼을 클릭하여 음성 녹음을 시작하세요.'
                }
              </p>
              
              {isAnalyzing && (
                <div className="space-y-2">
                  <Progress value={undefined} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    음성을 텍스트로 변환하고 감정을 분석하는 중...
                  </p>
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
          <div className="space-y-4">
            {/* 메인 감정 결과 */}
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
              
              <div className="grid grid-cols-2 gap-4 mb-4">
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
              
              <p className="text-sm text-muted-foreground">{result.analysis}</p>
            </Card>

            {/* 음성 특성 */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4">음성 특성 분석</h4>
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