import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Play, Pause, Brain, Heart, Activity, MicOff, Sparkles, Trash2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { VoiceDiaryEntry } from '@/services/voiceDiaryService';
import { voiceDiaryService } from '@/services/voiceDiaryService';

const VoiceDiary = () => {
  const [entries, setEntries] = useState<VoiceDiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioRefs, setAudioRefs] = useState<{ [key: string]: HTMLAudioElement }>({});
  const [filterEmotion, setFilterEmotion] = useState<string>('all');
  const { toast } = useToast();

  const fetchEntries = async () => {
    try {
      setLoading(true);
      
      if (filterEmotion !== 'all') {
        const data = await voiceDiaryService.getVoiceDiaryEntriesByEmotion(filterEmotion);
        setEntries(data);
      } else {
        const data = await voiceDiaryService.getVoiceDiaryEntries();
        setEntries(data);
      }
    } catch (error) {
      console.error('Error fetching diary entries:', error);
      toast({
        title: "불러오기 오류",
        description: "음성 일기를 불러올 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [filterEmotion]);

  const getEmotionIcon = (emotion: string) => {
    switch (emotion?.toLowerCase()) {
      case '행복': return <Heart className="w-5 h-5 text-red-500" />;
      case '차분함': return <Brain className="w-5 h-5 text-blue-500" />;
      case '스트레스': return <Activity className="w-5 h-5 text-orange-500" />;
      case '피로': return <MicOff className="w-5 h-5 text-gray-500" />;
      case '활기찬': return <Sparkles className="w-5 h-5 text-yellow-500" />;
      default: return <Brain className="w-5 h-5 text-primary" />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion?.toLowerCase()) {
      case '행복': return 'text-red-600 bg-red-50';
      case '차분함': return 'text-blue-600 bg-blue-50';
      case '스트레스': return 'text-orange-600 bg-orange-50';
      case '피로': return 'text-gray-600 bg-gray-50';
      case '활기찬': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-primary bg-primary/10';
    }
  };

  const playAudio = async (entryId: string, audioUrl: string) => {
    try {
      // 다른 오디오가 재생 중이면 정지
      if (playingId && playingId !== entryId && audioRefs[playingId]) {
        audioRefs[playingId].pause();
        audioRefs[playingId].currentTime = 0;
      }

      if (!audioRefs[entryId]) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setPlayingId(null);
        audioRefs[entryId] = audio;
        setAudioRefs({ ...audioRefs, [entryId]: audio });
      }

      const audio = audioRefs[entryId];
      
      if (playingId === entryId) {
        audio.pause();
        setPlayingId(null);
      } else {
        await audio.play();
        setPlayingId(entryId);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "재생 오류",
        description: "음성을 재생할 수 없습니다.",
        variant: "destructive",
      });
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!confirm('이 일기를 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('voice_diary_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setEntries(entries.filter(entry => entry.id !== entryId));
      toast({
        title: "삭제 완료",
        description: "음성 일기가 삭제되었습니다.",
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "삭제 오류",
        description: "일기 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const emotionOptions = ['all', '행복', '차분함', '스트레스', '피로', '활기찬'];

  if (loading) {
    return (
      <PageContainer title="음성 일기장" description="AI가 분석한 당신의 음성 감정 기록" maxWidth="lg">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title="🎙️ 음성 일기장" 
      description="AI가 분석한 당신의 음성 감정 기록을 확인해보세요" 
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* 필터 */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">음성 감정 일기</h2>
                <p className="text-gray-600">총 {entries.length}개의 기록</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={filterEmotion} onValueChange={setFilterEmotion}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="감정 필터" />
                </SelectTrigger>
                <SelectContent>
                  {emotionOptions.map((emotion) => (
                    <SelectItem key={emotion} value={emotion}>
                      {emotion === 'all' ? '전체' : emotion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* 일기 목록 */}
        {entries.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              아직 음성 일기가 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              음성 감정 분석을 통해 첫 번째 일기를 작성해보세요
            </p>
            <Button 
              onClick={() => window.location.href = '/voice-emotion-analysis'}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
            >
              음성 분석 시작하기
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  {/* 헤더 */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getEmotionColor(entry.emotion_analysis?.emotion)}`}>
                        {getEmotionIcon(entry.emotion_analysis?.emotion)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(entry.created_at)}</span>
                          </div>
                          <span>•</span>
                          <span>{formatDuration(entry.audio_duration || 0)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {entry.emotion_analysis?.emotion && (
                        <Badge className={getEmotionColor(entry.emotion_analysis.emotion)}>
                          {entry.emotion_analysis.emotion}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEntry(entry.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 오디오 재생 */}
                  {entry.audio_url && (
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playAudio(entry.id, entry.audio_url!)}
                        className="flex-shrink-0"
                      >
                        {playingId === entry.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">음성 재생</span>
                          <span className="text-sm text-gray-500">{formatDuration(entry.audio_duration || 0)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                          <div 
                            className={`h-1 rounded-full transition-all duration-300 ${
                              playingId === entry.id ? 'bg-purple-600' : 'bg-gray-400'
                            }`}
                            style={{ width: playingId === entry.id ? '100%' : '0%' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 음성 인식 결과 */}
                  {entry.transcription && (
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-medium text-blue-900 mb-2">음성 인식 결과</h4>
                      <p className="text-blue-800 italic">"{entry.transcription}"</p>
                    </div>
                  )}

                  {/* 감정 분석 결과 */}
                  {entry.emotion_analysis && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">감정 분석</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">신뢰도</span>
                            <span className="font-medium">{entry.emotion_analysis.confidence}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">스트레스</span>
                            <span className="font-medium text-orange-600">{entry.emotion_analysis.stressLevel}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">에너지</span>
                            <span className="font-medium text-green-600">{entry.emotion_analysis.energyLevel}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">음성 특성</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">음성 높이</span>
                            <span className="font-medium">{entry.emotion_analysis.voiceCharacteristics?.pitch}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">말하기 속도</span>
                            <span className="font-medium">{entry.emotion_analysis.voiceCharacteristics?.speed}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">발음 명확도</span>
                            <span className="font-medium">{entry.emotion_analysis.voiceCharacteristics?.clarity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI 분석 */}
                  {entry.emotion_analysis?.analysis && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">AI 분석</h4>
                      <p className="text-purple-800 text-sm leading-relaxed">{entry.emotion_analysis.analysis}</p>
                    </div>
                  )}

                  {/* 추천사항 */}
                  {entry.emotion_analysis?.recommendations && entry.emotion_analysis.recommendations.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-3">AI 추천사항</h4>
                      <div className="space-y-2">
                        {entry.emotion_analysis.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2 text-sm text-green-800">
                            <span className="w-4 h-4 bg-green-200 rounded-full flex items-center justify-center text-xs font-medium text-green-700 flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default VoiceDiary;