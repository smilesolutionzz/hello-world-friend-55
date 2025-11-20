import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Mic, Square, Save, Calendar as CalendarIcon, Heart, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface EmotionEntry {
  id: string;
  recorded_at: string;
  transcription: string;
  primary_emotion: string;
  emotion_score: number;
  mood_rating: number;
  detected_emotions: any; // Using any for Json type from Supabase
  tags: string[];
  notes?: string;
}

export default function VoiceEmotionDiary() {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [emotionAnalysis, setEmotionAnalysis] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('emotion_diaries')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      
      toast({
        title: "녹음 시작",
        description: "감정을 편하게 말해보세요."
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "녹음 실패",
        description: "마이크 접근 권한을 확인해주세요.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const response = await fetch(
          'https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/voice-emotion-diary',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyY3F4amV0bXp4b2VwaGd5amxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NjUzNDAsImV4cCI6MjA3MTI0MTM0MH0.LPXwumPDk6kq5W7jRI6yx39ajYxXw15yTQvfKYtmzzg`
            },
            body: JSON.stringify({ audio: base64Audio })
          }
        );

        if (!response.ok) {
          throw new Error('Failed to analyze emotion');
        }

        const data = await response.json();
        setTranscription(data.transcription);
        setEmotionAnalysis(data);
        
        toast({
          title: "분석 완료",
          description: `주요 감정: ${getEmotionLabel(data.primary_emotion)}`
        });
      };
    } catch (error) {
      console.error('Failed to process audio:', error);
      toast({
        title: "분석 실패",
        description: "음성 분석 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveEntry = async () => {
    if (!emotionAnalysis) {
      toast({
        title: "저장 실패",
        description: "먼저 음성을 녹음하고 분석해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "일기를 저장하려면 로그인이 필요합니다.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('emotion_diaries')
        .insert({
          user_id: user.id,
          transcription: transcription,
          detected_emotions: emotionAnalysis.detected_emotions,
          primary_emotion: emotionAnalysis.primary_emotion,
          emotion_score: emotionAnalysis.emotion_score,
          mood_rating: emotionAnalysis.mood_rating,
          tags: emotionAnalysis.suggested_tags || [],
          notes: notes,
          recorded_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "저장 완료",
        description: "감정 일기가 저장되었습니다."
      });

      // Reset form
      setTranscription('');
      setEmotionAnalysis(null);
      setNotes('');
      loadEntries();
    } catch (error) {
      console.error('Failed to save entry:', error);
      toast({
        title: "저장 실패",
        description: "일기 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const getEmotionLabel = (emotion: string) => {
    const labels: Record<string, string> = {
      'joy': '기쁨',
      'sadness': '슬픔',
      'anger': '분노',
      'anxiety': '불안',
      'calm': '평온',
      '기쁨': '기쁨',
      '슬픔': '슬픔',
      '분노': '분노',
      '불안': '불안',
      '평온': '평온',
      '피곤': '피곤',
      '스트레스': '스트레스'
    };
    return labels[emotion] || emotion;
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      'joy': 'bg-yellow-500',
      'sadness': 'bg-blue-500',
      'anger': 'bg-red-500',
      'anxiety': 'bg-purple-500',
      'calm': 'bg-green-500',
      '기쁨': 'bg-yellow-500',
      '슬픔': 'bg-blue-500',
      '분노': 'bg-red-500',
      '불안': 'bg-purple-500',
      '평온': 'bg-green-500',
      '피곤': 'bg-gray-500',
      '스트레스': 'bg-orange-500'
    };
    return colors[emotion] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI 음성 감정 일기
          </h1>
          <p className="text-muted-foreground">
            매일 당신의 감정을 기록하고 분석해보세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recording Section */}
          <Card className="p-6 space-y-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              오늘의 감정 기록
            </h2>

            {/* Recording Button */}
            <div className="flex justify-center">
              {!isRecording ? (
                <Button
                  size="lg"
                  onClick={startRecording}
                  disabled={isAnalyzing}
                  className="px-12 py-8 rounded-full"
                >
                  <Mic className="h-8 w-8 mr-3" />
                  녹음 시작
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopRecording}
                  className="px-12 py-8 rounded-full animate-pulse"
                >
                  <Square className="h-8 w-8 mr-3" />
                  녹음 중지
                </Button>
              )}
            </div>

            {/* Analysis Results */}
            {isAnalyzing && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">감정을 분석하는 중...</p>
              </div>
            )}

            {emotionAnalysis && (
              <div className="space-y-4">
                <div className="p-4 bg-accent/50 rounded-lg">
                  <h3 className="font-semibold mb-2">음성 텍스트</h3>
                  <p className="text-sm">{transcription}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">감정 분석 결과</h3>
                  <div className="flex items-center gap-3">
                    <Badge className={`${getEmotionColor(emotionAnalysis.primary_emotion)} text-white`}>
                      {getEmotionLabel(emotionAnalysis.primary_emotion)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      강도: {(emotionAnalysis.emotion_score * 100).toFixed(0)}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      기분: {emotionAnalysis.mood_rating}/10
                    </span>
                  </div>
                </div>

                {emotionAnalysis.summary && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm">{emotionAnalysis.summary}</p>
                  </div>
                )}

                {emotionAnalysis.suggested_tags && (
                  <div className="flex flex-wrap gap-2">
                    {emotionAnalysis.suggested_tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">#{tag}</Badge>
                    ))}
                  </div>
                )}

                <Textarea
                  placeholder="추가 메모를 입력하세요..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />

                <Button onClick={saveEntry} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  일기 저장
                </Button>
              </div>
            )}
          </Card>

          {/* Calendar & History */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <CalendarIcon className="h-5 w-5 text-primary" />
                감정 캘린더
              </h2>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ko}
                className="rounded-md border"
              />
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                최근 기록
              </h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {entries.map((entry) => (
                  <div key={entry.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={`${getEmotionColor(entry.primary_emotion)} text-white`}>
                        {getEmotionLabel(entry.primary_emotion)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.recorded_at), 'M월 d일 HH:mm', { locale: ko })}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2">{entry.transcription}</p>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {entries.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    아직 기록된 일기가 없습니다
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
