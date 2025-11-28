import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HealingImageGenerator } from '@/components/ai-therapy/HealingImageGenerator';
import { PsychologyArtGenerator } from '@/components/ai-therapy/PsychologyArtGenerator';
import { MeditationImageGenerator } from '@/components/ai-therapy/MeditationImageGenerator';
import { EmotionDiaryVisualizer } from '@/components/ai-therapy/EmotionDiaryVisualizer';
import { DrawingAnalyzer } from '@/components/ai-analysis/DrawingAnalyzer';
import { VisualCounselingUpload } from '@/components/ai-analysis/VisualCounselingUpload';
import { Sparkles, Heart, Palette, Waves, BookOpen, ImageIcon, Brush } from 'lucide-react';

const AITherapyStudio = () => {
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  
  // 샘플 검사 결과 데이터 (실제로는 사용자의 검사 결과를 가져와야 함)
  const sampleAssessmentResults = {
    extroversion: 0.7,
    openness: 0.8,
    conscientiousness: 0.6,
    agreeableness: 0.9,
    neuroticism: 0.3,
    creativity: 0.85,
    empathy: 0.92
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            AI 테라피 스튜디오
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            인공지능과 함께하는 마음의 치유 여정
            <br />
            당신만의 개인화된 힐링 이미지를 만들어보세요
          </p>
        </div>

        {/* 메인 탭 컨텐츠 */}
        <Tabs defaultValue="healing" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
            <TabsTrigger value="healing" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">힐링 이미지</span>
            </TabsTrigger>
            <TabsTrigger value="psychology" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">심리 아트</span>
            </TabsTrigger>
            <TabsTrigger value="meditation" className="flex items-center gap-2">
              <Waves className="h-4 w-4" />
              <span className="hidden sm:inline">명상 가이드</span>
            </TabsTrigger>
            <TabsTrigger value="diary" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">감정 일기</span>
            </TabsTrigger>
            <TabsTrigger value="drawing" className="flex items-center gap-2">
              <Brush className="h-4 w-4" />
              <span className="hidden sm:inline">그림 검사</span>
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">시각 자료</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="healing" className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm text-primary font-medium mb-2">
                <Heart className="h-4 w-4" />
                개인 맞춤형 힐링 이미지
              </div>
              <p className="text-muted-foreground">
                현재 감정 상태에 맞는 치유 이미지를 생성하여 마음의 안정을 찾아보세요
              </p>
            </div>
            <HealingImageGenerator 
              emotions={selectedEmotions}
              className="max-w-2xl mx-auto"
            />
          </TabsContent>

          <TabsContent value="psychology" className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm text-primary font-medium mb-2">
                <Palette className="h-4 w-4" />
                심리상태 시각화 아트
              </div>
              <p className="text-muted-foreground">
                심리 검사 결과를 바탕으로 당신만의 마음 지도를 예술 작품으로 표현합니다
              </p>
            </div>
            <PsychologyArtGenerator 
              assessmentResults={sampleAssessmentResults}
              className="max-w-2xl mx-auto"
            />
          </TabsContent>

          <TabsContent value="meditation" className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm text-primary font-medium mb-2">
                <Waves className="h-4 w-4" />
                AI 명상 가이드 이미지
              </div>
              <p className="text-muted-foreground">
                명상과 이완에 최적화된 배경 이미지로 깊은 평온을 경험해보세요
              </p>
            </div>
            <MeditationImageGenerator className="max-w-2xl mx-auto" />
          </TabsContent>

          <TabsContent value="diary" className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm text-primary font-medium mb-2">
                <BookOpen className="h-4 w-4" />
                감정 일기 시각화
              </div>
              <p className="text-muted-foreground">
                일상의 감정과 경험을 아름다운 예술 작품으로 기록하고 간직하세요
              </p>
            </div>
            <EmotionDiaryVisualizer className="max-w-2xl mx-auto" />
          </TabsContent>

          <TabsContent value="drawing" className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm text-primary font-medium mb-2">
                <Brush className="h-4 w-4" />
                그림 심리 검사 AI 분석
              </div>
              <p className="text-muted-foreground">
                HTP, KFD 등 그림 검사를 AI가 자동으로 분석하여 심리 상태를 파악합니다
              </p>
            </div>
            <DrawingAnalyzer />
          </TabsContent>

          <TabsContent value="visual" className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm text-primary font-medium mb-2">
                <ImageIcon className="h-4 w-4" />
                시각 자료 AI 상담 분석
              </div>
              <p className="text-muted-foreground">
                사진, 일러스트 등 시각 자료를 AI가 상담 관점에서 분석합니다
              </p>
            </div>
            <VisualCounselingUpload />
          </TabsContent>
        </Tabs>

        {/* 푸터 정보 */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4" />
            Powered by Replicate AI & Advanced Image Generation
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITherapyStudio;