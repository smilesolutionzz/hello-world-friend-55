import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Download, Waves, Clock } from 'lucide-react';
import { replicateService } from '@/services/replicateService';
import { useToast } from '@/components/ui/use-toast';

interface MeditationImageGeneratorProps {
  className?: string;
}

export const MeditationImageGenerator: React.FC<MeditationImageGeneratorProps> = ({ 
  className 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('nature');
  const [selectedDuration, setSelectedDuration] = useState<string>('10min');
  const { toast } = useToast();

  const meditationThemes = {
    nature: { label: '자연', prompt: 'serene natural landscape with soft flowing water and gentle trees' },
    cosmic: { label: '우주', prompt: 'cosmic space with gentle stars and peaceful nebula colors' },
    ocean: { label: '바다', prompt: 'calm ocean waves with soft horizon and peaceful sky' },
    mountain: { label: '산', prompt: 'peaceful mountain vista with soft clouds and gentle light' },
    forest: { label: '숲', prompt: 'tranquil forest clearing with dappled sunlight and moss' },
    zen: { label: '젠', prompt: 'minimalist zen garden with smooth stones and gentle curves' },
    sunset: { label: '석양', prompt: 'soft sunset colors with peaceful silhouettes and warm glow' },
    clouds: { label: '구름', prompt: 'gentle cloud formations with soft light and peaceful sky' }
  };

  const durations = {
    '5min': '5분 명상',
    '10min': '10분 명상', 
    '15min': '15분 명상',
    '20min': '20분 명상',
    '30min': '30분 명상'
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const theme = meditationThemes[selectedTheme as keyof typeof meditationThemes];
      const prompt = `${theme.prompt} for ${selectedDuration} meditation session`;
      
      const result = await replicateService.generateImage({
        prompt,
        type: 'meditation',
        context: {
          style: selectedTheme,
          intensity: 'low' // 명상은 항상 부드럽게
        }
      });

      setGeneratedImage(result.url);
      toast({
        title: "명상 배경 생성 완료",
        description: `${durations[selectedDuration as keyof typeof durations]} 배경이 준비되었습니다.`
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
      a.download = `meditation-background-${selectedTheme}-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "다운로드 완료",
        description: "명상 배경 이미지가 저장되었습니다."
      });
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: "이미지 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const setAsWallpaper = () => {
    if (!generatedImage) return;
    
    // 브라우저에서 배경화면으로 설정하는 기능
    const newWindow = window.open(generatedImage, '_blank');
    if (newWindow) {
      toast({
        title: "새 창에서 열림",
        description: "우클릭하여 배경화면으로 설정할 수 있습니다."
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5 text-primary" />
          AI 명상 가이드 이미지
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          명상에 적합한 맞춤형 배경 이미지를 생성합니다
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 테마 선택 */}
        <div>
          <h4 className="text-sm font-medium mb-3">명상 테마</h4>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(meditationThemes).map(([key, theme]) => (
              <Button
                key={key}
                variant={selectedTheme === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTheme(key)}
                className="text-xs"
              >
                {theme.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 명상 시간 선택 */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            명상 시간
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(durations).map(([key, label]) => (
              <Badge
                key={key}
                variant={selectedDuration === key ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedDuration(key)}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>

        {/* 생성 버튼 */}
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              명상 배경 생성 중...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              명상 배경 생성
            </>
          )}
        </Button>

        {/* 생성된 이미지 */}
        {generatedImage && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={generatedImage} 
                alt="Meditation background"
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={downloadImage} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                다운로드
              </Button>
              <Button onClick={setAsWallpaper} variant="outline" size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                배경화면 설정
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};