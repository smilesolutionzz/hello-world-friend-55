import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Volume2, VolumeX, Sparkles, Sliders } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';

export const MeditationTab = () => {
  const { toast } = useToast();
  const [stressLevel, setStressLevel] = useState(50);
  const [focusLevel, setFocusLevel] = useState(50);
  const [currentMood, setCurrentMood] = useState('neutral');
  const [userGoals, setUserGoals] = useState('relaxation');
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      toast({ title: "명상 가이드 연결됨", description: "AI 명상 가이드와 연결되었습니다." });
    },
    onDisconnect: () => {
      setIsActive(false);
      toast({ title: "명상 종료", description: "명상 세션이 종료되었습니다." });
    },
    onError: (error) => {
      console.error('Meditation error:', error);
      toast({ title: "연결 오류", description: "명상 가이드 연결에 실패했습니다.", variant: "destructive" });
    },
  });

  const moods = [
    { key: 'anxious', label: '불안함', icon: '😰' },
    { key: 'stressed', label: '스트레스', icon: '😣' },
    { key: 'neutral', label: '보통', icon: '😐' },
    { key: 'calm', label: '차분함', icon: '😌' },
    { key: 'happy', label: '행복함', icon: '😊' },
  ];

  const goals = [
    { key: 'relaxation', label: '이완', icon: '🧘' },
    { key: 'focus', label: '집중력', icon: '🎯' },
    { key: 'sleep', label: '수면', icon: '😴' },
    { key: 'energy', label: '활력', icon: '⚡' },
  ];

  const handleStart = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const { data, error } = await supabase.functions.invoke('get-eleven-labs-session', {
        body: {
          stressLevel,
          focusLevel,
          currentMood,
          userGoals,
          agentId: 'YOUR_AGENT_ID'
        }
      });

      if (error) throw error;

      await conversation.startSession({ signedUrl: data.signed_url });
      setIsActive(true);
      
      toast({ title: "명상 시작", description: "AI 가이드와 함께 명상을 시작합니다." });
    } catch (error) {
      console.error('Meditation start error:', error);
      toast({ title: "명상 시작 실패", description: "명상을 시작할 수 없습니다.", variant: "destructive" });
    }
  };

  const handleStop = async () => {
    await conversation.endSession();
    setIsActive(false);
  };

  const toggleMute = async () => {
    const newVolume = isMuted ? 1 : 0;
    await conversation.setVolume({ volume: newVolume });
    setIsMuted(!isMuted);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Sparkles className="w-6 h-6" />
            AI 실시간 명상 가이드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Status Card */}
            <Card className={`${isActive ? 'bg-purple-100 border-purple-300' : 'bg-white/70'} transition-all`}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-purple-500 animate-pulse' : 'bg-gray-200'
                  }`}>
                    <Sparkles className={`w-8 h-8 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <h3 className="text-lg font-semibold">
                    {isActive ? '명상 진행 중...' : '명상 시작 준비'}
                  </h3>
                  {conversation.isSpeaking && (
                    <Badge className="bg-purple-600 text-white">AI 가이드 말하는 중...</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="bg-white/70">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-purple-900">
                  <Sliders className="w-4 h-4" />
                  명상 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-purple-900">스트레스 레벨: {stressLevel}%</label>
                  <Slider
                    value={[stressLevel]}
                    onValueChange={(value) => setStressLevel(value[0])}
                    max={100}
                    step={1}
                    className="mt-2"
                    disabled={isActive}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-purple-900">집중력: {focusLevel}%</label>
                  <Slider
                    value={[focusLevel]}
                    onValueChange={(value) => setFocusLevel(value[0])}
                    max={100}
                    step={1}
                    className="mt-2"
                    disabled={isActive}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-purple-900 block mb-2">현재 기분</label>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((mood) => (
                      <Button
                        key={mood.key}
                        variant={currentMood === mood.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentMood(mood.key)}
                        className={currentMood === mood.key ? 'bg-purple-500' : ''}
                        disabled={isActive}
                      >
                        {mood.icon} {mood.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-purple-900 block mb-2">명상 목표</label>
                  <div className="flex flex-wrap gap-2">
                    {goals.map((goal) => (
                      <Button
                        key={goal.key}
                        variant={userGoals === goal.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setUserGoals(goal.key)}
                        className={userGoals === goal.key ? 'bg-purple-500' : ''}
                        disabled={isActive}
                      >
                        {goal.icon} {goal.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Control Buttons */}
            <div className="flex gap-3">
              {!isActive ? (
                <Button
                  onClick={handleStart}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 py-6"
                >
                  <Play className="w-5 h-5 mr-2" />
                  명상 시작
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleStop}
                    variant="outline"
                    className="flex-1 border-purple-300 py-6"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    명상 종료
                  </Button>
                  <Button
                    onClick={toggleMute}
                    variant="outline"
                    className="border-purple-300 py-6"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                </>
              )}
            </div>

            {/* Info */}
            <div className="text-sm text-purple-800 text-center space-y-1 bg-purple-50 p-4 rounded-lg">
              <p>🎧 헤드폰 사용을 권장합니다</p>
              <p>🧘 편안한 자세로 앉아주세요</p>
              <p>💜 AI 가이드의 음성을 따라가세요</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};