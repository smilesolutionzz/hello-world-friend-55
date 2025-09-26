import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Palette, Download, Brain, Sparkles } from 'lucide-react';
import { replicateService } from '@/services/replicateService';
import { useToast } from '@/components/ui/use-toast';

interface PsychologyArtGeneratorProps {
  assessmentResults?: Record<string, number>;
  className?: string;
}

export const PsychologyArtGenerator: React.FC<PsychologyArtGeneratorProps> = ({ 
  assessmentResults = {}, 
  className 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (Object.keys(assessmentResults).length === 0 && selectedTraits.length === 0) {
      toast({
        title: "심리 데이터가 필요합니다",
        description: "검사 결과나 성향을 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = replicateService.generatePsychologyArt(
        Object.keys(assessmentResults).length > 0 ? assessmentResults : 
        selectedTraits.reduce((acc, trait) => ({ ...acc, [trait]: 1 }), {})
      );
      
      const result = await replicateService.generateImage({
        prompt,
        type: 'psychology-art',
        context: {
          assessmentResults,
          selectedTraits
        }
      });

      setGeneratedImage(result.url);
      toast({
        title: "심리 아트 생성 완료",
        description: "당신의 마음을 시각화한 예술 작품이 완성되었습니다."
      });
    } catch (error) {
      toast({
        title: "아트 생성 실패",
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
      a.download = `psychology-art-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "다운로드 완료",
        description: "심리 아트가 저장되었습니다."
      });
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: "이미지 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const psychologyTraits = [
    'extroversion', 'introversion', 'openness', 'conscientiousness', 
    'agreeableness', 'neuroticism', 'creativity', 'empathy', 
    'resilience', 'mindfulness', 'optimism', 'analytical'
  ];

  const traitLabels: Record<string, string> = {
    extroversion: '외향성',
    introversion: '내향성',
    openness: '개방성',
    conscientiousness: '성실성',
    agreeableness: '친화성',
    neuroticism: '신경성',
    creativity: '창의성',
    empathy: '공감능력',
    resilience: '회복력',
    mindfulness: '마음챙김',
    optimism: '낙관성',
    analytical: '분석력'
  };

  const getTopTraits = () => {
    if (Object.keys(assessmentResults).length === 0) return [];
    
    return Object.entries(assessmentResults)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([trait, score]) => ({ trait, score }));
  };

  const topTraits = getTopTraits();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          심리상태 시각화 아트
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          당신의 심리 상태를 예술적으로 표현합니다
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 검사 결과 기반 */}
        {topTraits.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              검사 결과 기반 특성
            </h4>
            <div className="space-y-2">
              {topTraits.map(({ trait, score }) => (
                <div key={trait} className="flex items-center justify-between">
                  <span className="text-sm">{traitLabels[trait] || trait}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(score * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(score * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 수동 특성 선택 */}
        <div>
          <h4 className="text-sm font-medium mb-3">추가 특성 선택</h4>
          <div className="flex flex-wrap gap-2">
            {psychologyTraits.map((trait) => (
              <Badge
                key={trait}
                variant={selectedTraits.includes(trait) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedTraits(prev => 
                    prev.includes(trait)
                      ? prev.filter(t => t !== trait)
                      : [...prev, trait]
                  );
                }}
              >
                {traitLabels[trait] || trait}
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
              심리 아트 생성 중...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              심리 아트 생성
            </>
          )}
        </Button>

        {/* 생성된 이미지 */}
        {generatedImage && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={generatedImage} 
                alt="Psychology visualization art"
                className="w-full h-64 object-cover"
              />
            </div>
            <Button onClick={downloadImage} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              아트 다운로드
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};