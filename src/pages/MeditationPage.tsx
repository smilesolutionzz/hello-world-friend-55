import React, { useState } from 'react';
import { BreathingExercise } from '@/components/meditation/BreathingExercise';
import { MeditationGuide } from '@/components/meditation/MeditationGuide';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wind, Brain, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MeditationPage() {
  const { toast } = useToast();

  const breathingPatterns = [
    {
      id: '4-7-8',
      name: '4-7-8 호흡법',
      description: '수면 유도와 불안 해소에 효과적',
      pattern: { inhale: 4, hold: 7, exhale: 8 },
      cycles: 4
    },
    {
      id: 'box',
      name: '박스 호흡법',
      description: '스트레스 관리와 집중력 향상',
      pattern: { inhale: 4, hold: 4, exhale: 4 },
      cycles: 5
    },
    {
      id: 'calm',
      name: '릴렉스 호흡법',
      description: '긴장 완화와 마음 안정',
      pattern: { inhale: 3, hold: 2, exhale: 5 },
      cycles: 6
    }
  ];

  const [selectedPattern, setSelectedPattern] = useState(breathingPatterns[0]);

  const handleComplete = () => {
    toast({
      title: "호흡 운동 완료",
      description: "훌륭합니다! 마음이 한결 편안해졌나요?",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <Wind className="w-10 h-10 text-primary" />
            명상 & 호흡 가이드
          </h1>
          <p className="text-muted-foreground">
            AI 음성 가이드와 함께하는 마음의 평화
          </p>
        </div>

        <Tabs defaultValue="breathing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="breathing" className="flex items-center gap-2">
              <Wind className="w-4 h-4" />
              호흡 운동
            </TabsTrigger>
            <TabsTrigger value="meditation" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              명상 가이드
            </TabsTrigger>
          </TabsList>

          <TabsContent value="breathing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  호흡법 선택
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {breathingPatterns.map((pattern) => (
                    <button
                      key={pattern.id}
                      onClick={() => setSelectedPattern(pattern)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedPattern.id === pattern.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <h3 className="font-semibold mb-1">{pattern.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {pattern.description}
                      </p>
                      <div className="mt-2 text-xs">
                        <span className="text-muted-foreground">
                          {pattern.pattern.inhale}초 들이마시기 · {pattern.pattern.hold}초 멈추기 · {pattern.pattern.exhale}초 내쉬기
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <BreathingExercise
              pattern={selectedPattern.pattern}
              cycles={selectedPattern.cycles}
              onComplete={handleComplete}
            />
          </TabsContent>

          <TabsContent value="meditation" className="space-y-6">
            <MeditationGuide />
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center text-sm text-muted-foreground space-y-2">
          <p>💡 조용하고 편안한 환경에서 진행하세요</p>
          <p>🧘 매일 규칙적으로 실천하면 더 큰 효과를 느낄 수 있습니다</p>
        </div>
      </div>
    </div>
  );
}
