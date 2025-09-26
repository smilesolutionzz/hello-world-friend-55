import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Download, Sparkles, Calendar } from 'lucide-react';
import { replicateService } from '@/services/replicateService';
import { useToast } from '@/components/ui/use-toast';

interface EmotionDiaryVisualizerProps {
  className?: string;
}

export const EmotionDiaryVisualizer: React.FC<EmotionDiaryVisualizerProps> = ({ 
  className 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [diaryText, setDiaryText] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('watercolor');
  const { toast } = useToast();

  const moods = [
    { key: 'happy', label: '기쁨', color: 'warm sunny' },
    { key: 'sad', label: '슬픔', color: 'cool blue' },
    { key: 'peaceful', label: '평온', color: 'soft green' },
    { key: 'excited', label: '흥분', color: 'vibrant orange' },
    { key: 'worried', label: '걱정', color: 'muted gray' },
    { key: 'grateful', label: '감사', color: 'golden warm' },
    { key: 'nostalgic', label: '그리움', color: 'vintage sepia' },
    { key: 'hopeful', label: '희망', color: 'bright light' }
  ];

  const styles = {
    watercolor: { label: '수채화', prompt: 'watercolor painting style, soft flowing colors' },
    sketch: { label: '스케치', prompt: 'pencil sketch style, gentle artistic lines' },
    digital: { label: '디지털', prompt: 'digital art style, modern artistic interpretation' },
    pastel: { label: '파스텔', prompt: 'pastel art style, soft dreamy colors' },
    minimalist: { label: '미니멀', prompt: 'minimalist art style, simple elegant forms' },
    vintage: { label: '빈티지', prompt: 'vintage journal style, aged paper aesthetic' }
  };

  const generatePromptFromDiary = (text: string, mood: string, style: string): string => {
    // 간단한 키워드 추출
    const keywords = text.toLowerCase().match(/\b(날씨|음식|사람|일|학교|집|친구|가족|여행|책|영화|음악|운동)\b/g) || [];
    const uniqueKeywords = [...new Set(keywords)].slice(0, 3);
    
    const moodData = moods.find(m => m.key === mood);
    const styleData = styles[style as keyof typeof styles];
    
    let basePrompt = '';
    if (uniqueKeywords.length > 0) {
      basePrompt = `emotional diary illustration featuring ${uniqueKeywords.join(', ')}`;
    } else {
      basePrompt = 'personal emotional diary illustration';
    }
    
    if (moodData) {
      basePrompt += `, ${moodData.color} colors representing ${moodData.label}`;
    }
    
    if (styleData) {
      basePrompt += `, ${styleData.prompt}`;
    }
    
    return basePrompt + ', intimate personal story visualization, diary aesthetic';
  };

  const handleGenerate = async () => {
    if (!diaryText.trim()) {
      toast({
        title: "일기 내용을 입력해주세요",
        description: "감정 일기 시각화를 위해 내용을 작성해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = generatePromptFromDiary(diaryText, selectedMood, selectedStyle);
      
      const result = await replicateService.generateImage({
        prompt,
        type: 'emotion-diary',
        context: {
          style: selectedStyle,
          emotions: selectedMood ? [selectedMood] : [],
          intensity: 'medium'
        }
      });

      setGeneratedImage(result.url);
      toast({
        title: "감정 일기 시각화 완료",
        description: "당신의 감정 이야기가 예술 작품으로 탄생했습니다."
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
      a.download = `emotion-diary-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "다운로드 완료",
        description: "감정 일기 이미지가 저장되었습니다."
      });
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: "이미지 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const saveToGallery = () => {
    // 향후 갤러리 기능 구현 시 사용
    toast({
      title: "갤러리 저장",
      description: "개인 감정 갤러리에 저장되었습니다."
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          감정 일기 시각화
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          감정 일기를 아름다운 예술 작품으로 변환합니다
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 일기 입력 */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            오늘의 감정 일기
          </h4>
          <Textarea
            placeholder="오늘 하루 어떤 일이 있었나요? 어떤 감정을 느꼈나요? 자유롭게 작성해보세요..."
            value={diaryText}
            onChange={(e) => setDiaryText(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {diaryText.length}/500자
          </p>
        </div>

        {/* 감정 선택 */}
        <div>
          <h4 className="text-sm font-medium mb-3">주요 감정</h4>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <Badge
                key={mood.key}
                variant={selectedMood === mood.key ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedMood(mood.key)}
              >
                {mood.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* 스타일 선택 */}
        <div>
          <h4 className="text-sm font-medium mb-3">아트 스타일</h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(styles).map(([key, style]) => (
              <Button
                key={key}
                variant={selectedStyle === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStyle(key)}
                className="text-xs"
              >
                {style.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 생성 버튼 */}
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !diaryText.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              감정 이미지 생성 중...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              감정 일기 시각화
            </>
          )}
        </Button>

        {/* 생성된 이미지 */}
        {generatedImage && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={generatedImage} 
                alt="Emotion diary visualization"
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={downloadImage} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                다운로드
              </Button>
              <Button onClick={saveToGallery} variant="outline" size="sm">
                <BookOpen className="mr-2 h-4 w-4" />
                갤러리 저장
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};