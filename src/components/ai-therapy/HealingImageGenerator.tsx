import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Heart, Download, Sparkles } from 'lucide-react';
import { replicateService } from '@/services/replicateService';
import { useToast } from '@/components/ui/use-toast';

interface HealingImageGeneratorProps {
  emotions?: string[];
  className?: string;
}

export const HealingImageGenerator: React.FC<HealingImageGeneratorProps> = ({ 
  emotions = [], 
  className 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedIntensity, setSelectedIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (emotions.length === 0) {
      toast({
        title: "감정을 선택해주세요",
        description: "힐링 이미지 생성을 위해 현재 감정을 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = replicateService.generateHealingPrompt(emotions, selectedIntensity);
      
      const result = await replicateService.generateImage({
        prompt,
        type: 'healing',
        context: {
          emotions,
          intensity: selectedIntensity
        }
      });

      setGeneratedImage(result.url);
      toast({
        title: "힐링 이미지 생성 완료",
        description: "당신만의 맞춤형 힐링 이미지가 준비되었습니다."
      });
    } catch (error) {
      toast({
        title: "이미지 생성 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;
    
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `healing-image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "다운로드 완료",
        description: "힐링 이미지가 저장되었습니다."
      });
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: "이미지 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const emotionOptions = [
    'stressed', 'anxious', 'sad', 'angry', 'tired', 'overwhelmed', 'lonely', 'frustrated'
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          개인 맞춤형 힐링 이미지
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          현재 감정에 맞는 치유 이미지를 생성합니다
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 감정 선택 */}
        <div>
          <h4 className="text-sm font-medium mb-3">현재 감정 선택</h4>
          <div className="flex flex-wrap gap-2">
            {emotionOptions.map((emotion) => (
              <Badge
                key={emotion}
                variant={emotions.includes(emotion) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  const newEmotions = emotions.includes(emotion)
                    ? emotions.filter(e => e !== emotion)
                    : [...emotions, emotion];
                  // 부모 컴포넌트에서 emotions 상태 관리가 필요할 수 있음
                }}
              >
                {emotion}
              </Badge>
            ))}
          </div>
        </div>

        {/* 강도 선택 */}
        <div>
          <h4 className="text-sm font-medium mb-3">치유 강도</h4>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((intensity) => (
              <Button
                key={intensity}
                variant={selectedIntensity === intensity ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedIntensity(intensity)}
              >
                {intensity === 'low' ? '부드럽게' : 
                 intensity === 'medium' ? '적당히' : '강하게'}
              </Button>
            ))}
          </div>
        </div>

        {/* 생성 버튼 */}
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || emotions.length === 0}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              힐링 이미지 생성 중...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              힐링 이미지 생성
            </>
          )}
        </Button>

        {/* 생성된 이미지 */}
        {generatedImage && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={generatedImage} 
                alt="Personal healing image"
                className="w-full h-64 object-cover"
              />
            </div>
            <Button onClick={downloadImage} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              이미지 다운로드
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};