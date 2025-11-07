import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Brain, Sparkles, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useConversation } from '@11labs/react';

export default function RealtimeMeditation() {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [stressLevel, setStressLevel] = useState(50);
  const [focusLevel, setFocusLevel] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentMood, setCurrentMood] = useState<string>('');
  const [userGoals, setUserGoals] = useState<string>('');

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to AI meditation guide');
      toast({
        title: "연결됨",
        description: "AI 명상 가이드가 준비되었습니다."
      });
    },
    onDisconnect: () => {
      console.log('Disconnected from meditation guide');
      setIsActive(false);
    },
    onError: (error) => {
      console.error('Meditation guide error:', error);
      toast({
        title: "오류 발생",
        description: "명상 가이드 연결 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  const moods = [
    { key: 'anxious', label: '불안함', emoji: '😰' },
    { key: 'stressed', label: '스트레스', emoji: '😫' },
    { key: 'tired', label: '피곤함', emoji: '😴' },
    { key: 'calm', label: '평온함', emoji: '😌' },
    { key: 'energetic', label: '활기찬', emoji: '😊' }
  ];

  const goals = [
    { key: 'relaxation', label: '이완', icon: '🧘' },
    { key: 'focus', label: '집중력', icon: '🎯' },
    { key: 'sleep', label: '수면', icon: '😴' },
    { key: 'healing', label: '치유', icon: '💚' }
  ];

  const handleStart = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get signed URL from our edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-eleven-labs-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({
            stressLevel,
            focusLevel,
            currentMood,
            userGoals,
            agentId: 'meditation-guide' // You'll need to create this in ElevenLabs
          })
        }
      );

      const data = await response.json();
      
      if (!data.signed_url) {
        throw new Error('Failed to get session URL');
      }

      await conversation.startSession({ url: data.signed_url });
      setIsActive(true);
      
      toast({
        title: "명상 시작",
        description: "AI 가이드가 당신의 명상을 도와드립니다."
      });
    } catch (error) {
      console.error('Failed to start meditation:', error);
      toast({
        title: "시작 실패",
        description: error instanceof Error ? error.message : "명상 세션을 시작할 수 없습니다.",
        variant: "destructive"
      });
    }
  };

  const handleStop = async () => {
    await conversation.endSession();
    setIsActive(false);
    toast({
      title: "명상 종료",
      description: "좋은 시간 되셨기를 바랍니다."
    });
  };

  const toggleMute = async () => {
    const newVolume = isMuted ? 1 : 0;
    await conversation.setVolume({ volume: newVolume });
    setIsMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/10 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI 실시간 명상 가이드
            </h1>
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg">
            AI가 실시간으로 당신의 명상을 안내합니다
          </p>
        </div>

        {/* Status Card */}
        <Card className="p-6 bg-card/50 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-3 w-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
              <span className="font-medium">
                {isActive ? '명상 진행 중' : '대기 중'}
              </span>
              {conversation.isSpeaking && (
                <Badge variant="secondary" className="animate-pulse">
                  AI 말하는 중...
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                disabled={!isActive}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </Card>

        {/* Settings Card */}
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">현재 상태</h3>
            
            {/* Stress Level */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">스트레스 레벨</label>
                <span className="text-sm text-muted-foreground">{stressLevel}%</span>
              </div>
              <Slider
                value={[stressLevel]}
                onValueChange={(value) => setStressLevel(value[0])}
                max={100}
                step={1}
                disabled={isActive}
                className="w-full"
              />
            </div>

            {/* Focus Level */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">집중력 레벨</label>
                <span className="text-sm text-muted-foreground">{focusLevel}%</span>
              </div>
              <Slider
                value={[focusLevel]}
                onValueChange={(value) => setFocusLevel(value[0])}
                max={100}
                step={1}
                disabled={isActive}
                className="w-full"
              />
            </div>
          </div>

          {/* Current Mood */}
          <div>
            <h4 className="text-sm font-medium mb-3">현재 기분</h4>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <Button
                  key={mood.key}
                  variant={currentMood === mood.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentMood(mood.key)}
                  disabled={isActive}
                  className="gap-2"
                >
                  <span>{mood.emoji}</span>
                  {mood.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <h4 className="text-sm font-medium mb-3">명상 목표</h4>
            <div className="grid grid-cols-2 gap-2">
              {goals.map((goal) => (
                <Button
                  key={goal.key}
                  variant={userGoals === goal.key ? "default" : "outline"}
                  onClick={() => setUserGoals(goal.key)}
                  disabled={isActive}
                  className="gap-2"
                >
                  <span>{goal.icon}</span>
                  {goal.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Control Button */}
        <div className="flex justify-center">
          {!isActive ? (
            <Button
              size="lg"
              onClick={handleStart}
              disabled={!currentMood || !userGoals}
              className="px-12 py-6 text-lg gap-3"
            >
              <Play className="h-6 w-6" />
              명상 시작하기
            </Button>
          ) : (
            <Button
              size="lg"
              variant="destructive"
              onClick={handleStop}
              className="px-12 py-6 text-lg gap-3"
            >
              <Pause className="h-6 w-6" />
              명상 종료하기
            </Button>
          )}
        </div>

        {/* Info Card */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI 실시간 명상 가이드란?
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ElevenLabs AI 기술을 활용하여 당신의 상태에 맞는 실시간 명상 가이드를 제공합니다. 
            스트레스 레벨, 집중력, 기분, 목표에 따라 개인화된 명상 세션이 진행됩니다.
          </p>
        </Card>
      </div>
    </div>
  );
}
