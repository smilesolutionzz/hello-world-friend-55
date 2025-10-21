import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Volume2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: string;
  script: string;
  category: string;
}

const meditationSessions: MeditationSession[] = [
  {
    id: '1',
    title: '아침 에너지 명상',
    description: '하루를 시작하는 활력 충전 명상',
    duration: '5분',
    script: '편안하게 앉아 눈을 감으세요. 천천히 깊게 숨을 들이마시며 새로운 하루의 에너지를 느껴보세요. 숨을 내쉬면서 어제의 피로를 모두 내보내세요. 오늘 하루도 긍정적인 에너지로 가득 채워질 것입니다.',
    category: '아침'
  },
  {
    id: '2',
    title: '스트레스 해소 명상',
    description: '긴장을 풀고 마음의 평화 찾기',
    duration: '7분',
    script: '편안한 자세로 앉아 눈을 감으세요. 어깨의 긴장을 풀고, 얼굴 근육을 이완시키세요. 깊게 숨을 들이마시며 평온함을 느끼고, 내쉬면서 스트레스를 모두 내보내세요. 당신은 충분히 잘하고 있습니다.',
    category: '힐링'
  },
  {
    id: '3',
    title: '수면 유도 명상',
    description: '편안한 잠을 위한 릴렉스 명상',
    duration: '10분',
    script: '침대에 편안하게 누워 눈을 감으세요. 발끝부터 천천히 이완시켜 나가세요. 깊고 느린 호흡과 함께 몸과 마음이 점점 더 편안해집니다. 모든 걱정은 내일로 미루고, 지금은 오직 휴식의 시간입니다.',
    category: '수면'
  },
  {
    id: '4',
    title: '집중력 향상 명상',
    description: '업무와 공부를 위한 집중 명상',
    duration: '5분',
    script: '등을 곧게 펴고 편안하게 앉으세요. 호흡에 집중하며 산만한 생각들을 하나씩 내려놓으세요. 숨을 들이마실 때마다 집중력이 높아지고, 내쉴 때마다 마음이 맑아집니다. 지금 이 순간에 온전히 집중하세요.',
    category: '집중'
  }
];

export const MeditationGuide: React.FC = () => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});

  const generateAndPlayAudio = async (session: MeditationSession) => {
    setIsGenerating(session.id);

    try {
      // Check cache first
      if (audioCache[session.id]) {
        playAudio(audioCache[session.id], session.id);
        return;
      }

      console.log('Generating meditation audio...');
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: session.script,
          voice: 'shimmer' // Calm, soothing voice
        }
      });

      if (error) {
        throw error;
      }

      if (data?.audioContent) {
        const audioData = `data:audio/mp3;base64,${data.audioContent}`;
        setAudioCache(prev => ({ ...prev, [session.id]: audioData }));
        playAudio(audioData, session.id);
      } else {
        throw new Error('No audio generated');
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "오디오 생성 실패",
        description: error instanceof Error ? error.message : '명상 가이드 오디오를 생성할 수 없습니다.',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const playAudio = (audioData: string, sessionId: string) => {
    const audio = new Audio(audioData);
    
    audio.onplay = () => {
      setIsPlaying(sessionId);
      toast({
        title: "명상 시작",
        description: "편안한 자세로 가이드를 따라하세요.",
      });
    };

    audio.onended = () => {
      setIsPlaying(null);
      toast({
        title: "명상 완료",
        description: "수고하셨습니다. 마음이 한결 가벼워졌나요?",
      });
    };

    audio.onerror = () => {
      setIsPlaying(null);
      toast({
        title: "재생 오류",
        description: "오디오 재생 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    };

    audio.play();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '아침': return 'default';
      case '힐링': return 'secondary';
      case '수면': return 'outline';
      case '집중': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {meditationSessions.map((session) => (
        <Card key={session.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{session.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {session.description}
                </p>
              </div>
              <Badge variant={getCategoryColor(session.category)}>
                {session.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Volume2 className="w-4 h-4" />
                <span>{session.duration}</span>
              </div>

              <Button
                onClick={() => generateAndPlayAudio(session)}
                disabled={isGenerating === session.id || isPlaying === session.id}
                className="w-full"
              >
                {isGenerating === session.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : isPlaying === session.id ? (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    재생 중...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    시작하기
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
