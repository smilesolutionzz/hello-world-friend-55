import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, MicOff, Play, Square, RotateCcw, Zap, TrendingUp, Heart, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisResult {
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
}

const VoiceEmotionAnalysis = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    checkMicrophonePermission();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
    } catch (error) {
      setHasPermission(false);
    }
  };

  const startRecording = async () => {
    try {
      if (!hasPermission) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "🎤 녹음 시작",
        description: "자연스럽게 15-30초간 말씀해주세요"
      });

    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "마이크 접근 오류",
        description: "마이크 권한을 허용해주세요",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    console.log('Stop recording called', { isRecording, hasRecorder: !!mediaRecorderRef.current });
    
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }
    
    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  };

  const analyzeVoice = async () => {
    if (!audioBlob) return;

    setIsAnalyzing(true);
    
    try {
      // Convert blob to base64 for API transmission
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const { data, error } = await supabase.functions.invoke('voice-emotion-analyzer', {
        body: {
          audioData: base64Audio,
          analysisType: 'comprehensive'
        }
      });

      if (error) throw error;

      // Mock analysis result for demo
      const mockResult: AnalysisResult = {
        emotion: data?.emotion || '차분함',
        confidence: data?.confidence || 85,
        stressLevel: data?.stressLevel || 25,
        energyLevel: data?.energyLevel || 70,
        recommendations: data?.recommendations || [
          "깊은 호흡을 통해 긴장을 완화해보세요",
          "긍정적인 자기 대화를 실천해보세요",
          "규칙적인 운동으로 스트레스를 관리하세요"
        ],
        voiceCharacteristics: data?.voiceCharacteristics || {
          pitch: "안정적",
          speed: "적절함",
          clarity: "명확함"
        }
      };

      setAnalysisResult(mockResult);
      
      toast({
        title: "✨ 분석 완료",
        description: "음성 기반 심리 상태가 분석되었습니다"
      });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "분석 오류",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAudioBlob(null);
    setAnalysisResult(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      '행복': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      '차분함': 'bg-blue-100 text-blue-800 border-blue-200',
      '스트레스': 'bg-red-100 text-red-800 border-red-200',
      '피로': 'bg-gray-100 text-gray-800 border-gray-200',
      '활기참': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[emotion as keyof typeof colors] || 'bg-blue-100 text-blue-800 border-blue-200';
  };

  if (hasPermission === false) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            음성 분석을 위해 마이크 권한이 필요합니다. 브라우저에서 마이크 접근을 허용해주세요.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-blue-100">
            <Mic className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">음성 감정 분석</h1>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Zap className="w-3 h-3 mr-1" />
            NEW
          </Badge>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          목소리의 톤, 속도, 떨림을 AI가 실시간으로 분석하여 현재 심리 상태와 스트레스 레벨을 측정합니다
        </p>
      </div>

      {/* Recording Interface */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            음성 녹음 및 분석
          </CardTitle>
          <CardDescription>
            15-30초간 자연스럽게 말씀해주세요. 내용보다는 톤과 감정이 중요합니다.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Recording Controls */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isAnalyzing}
                size="lg"
                className={`w-24 h-24 rounded-full transition-all ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                }`}
              >
                {isRecording ? (
                  <Square className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
              
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.3, opacity: 0 }}
                    exit={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-4 border-red-500"
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="text-center">
              <p className="text-lg font-medium">
                {isRecording ? `녹음 중... ${formatTime(recordingTime)}` : '녹음하기'}
              </p>
              <p className="text-sm text-gray-500">
                {isRecording ? '말하기를 멈추고 버튼을 다시 누르세요' : '버튼을 눌러 녹음을 시작하세요'}
              </p>
            </div>
          </div>

          {/* Audio Player & Analysis */}
          {audioBlob && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-4">
                <audio controls src={URL.createObjectURL(audioBlob)} className="flex-1" />
                <Button
                  onClick={analyzeVoice}
                  disabled={isAnalyzing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      분석 시작
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={resetAnalysis}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  다시 녹음
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Emotion & Confidence */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  감정 상태 분석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <Badge className={`text-lg px-4 py-2 ${getEmotionColor(analysisResult.emotion)}`}>
                      {analysisResult.emotion}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">현재 감정 상태</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{analysisResult.confidence}%</div>
                    <p className="text-sm text-gray-600">분석 신뢰도</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stress & Energy Levels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">스트레스 레벨</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={analysisResult.stressLevel} className="h-3" />
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">낮음</span>
                      <span className="text-yellow-600">보통</span>
                      <span className="text-red-600">높음</span>
                    </div>
                    <p className="text-center font-medium">{analysisResult.stressLevel}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">에너지 레벨</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={analysisResult.energyLevel} className="h-3" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">낮음</span>
                      <span className="text-blue-600">보통</span>
                      <span className="text-green-600">높음</span>
                    </div>
                    <p className="text-center font-medium">{analysisResult.energyLevel}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Voice Characteristics */}
            <Card>
              <CardHeader>
                <CardTitle>음성 특성 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">음성 높이</p>
                    <p className="text-blue-700">{analysisResult.voiceCharacteristics.pitch}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">말하기 속도</p>
                    <p className="text-green-700">{analysisResult.voiceCharacteristics.speed}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-900">발음 명확도</p>
                    <p className="text-purple-700">{analysisResult.voiceCharacteristics.clarity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>맞춤 추천사항</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResult.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceEmotionAnalysis;