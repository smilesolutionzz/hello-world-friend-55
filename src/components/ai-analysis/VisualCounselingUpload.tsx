import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, Image as ImageIcon, MessageSquare, Lightbulb, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VisualAnalysis {
  image_description: string;
  emotional_indicators: string;
  psychological_insights: string;
  counseling_points: string[];
  follow_up_questions: string[];
  recommendations: string;
  relevance_score: number;
}

export const VisualCounselingUpload: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [context, setContext] = useState('');
  const [question, setQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<VisualAnalysis | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: '이미지 파일만 업로드 가능합니다',
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setAnalysis(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast({
        title: '이미지를 먼저 업로드해주세요',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-visual-material', {
        body: { 
          imageData: selectedImage, 
          context: context || undefined,
          question: question || undefined
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: '분석 완료',
        description: '시각 자료 분석이 완료되었습니다.'
      });
    } catch (error) {
      console.error('분석 오류:', error);
      toast({
        title: '분석 실패',
        description: error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          시각 자료 AI 분석
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          사진, 일러스트 등 시각 자료를 AI가 상담 관점에서 분석합니다
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 이미지 업로드 */}
        <div>
          <label className="text-sm font-medium mb-2 block">이미지 업로드</label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="visual-upload"
            />
            <label htmlFor="visual-upload" className="cursor-pointer">
              {selectedImage ? (
                <div className="space-y-2">
                  <img 
                    src={selectedImage} 
                    alt="업로드된 이미지" 
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground">클릭하여 다른 이미지 선택</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    클릭하여 이미지 업로드
                  </p>
                  <p className="text-xs text-muted-foreground">
                    상담에 활용할 사진, 그림, 문서 등
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* 상담 맥락 입력 */}
        <div>
          <label className="text-sm font-medium mb-2 block">상담 맥락 (선택사항)</label>
          <Textarea
            placeholder="예: 이 사진은 내담자가 최근 겪은 스트레스 상황과 관련이 있습니다..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
          />
        </div>

        {/* 분석 질문 입력 */}
        <div>
          <label className="text-sm font-medium mb-2 block">분석 요청사항 (선택사항)</label>
          <Textarea
            placeholder="예: 이 이미지에서 어떤 감정적 단서를 발견할 수 있나요?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
          />
        </div>

        {/* 분석 버튼 */}
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || !selectedImage}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              AI 분석 중...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              시각 자료 분석 시작
            </>
          )}
        </Button>

        {/* 분석 결과 */}
        {analysis && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">분석 결과</h3>
              <Badge variant="outline">
                관련도: {Math.round(analysis.relevance_score * 100)}%
              </Badge>
            </div>

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  이미지 설명
                </h4>
                <p className="text-sm text-muted-foreground">{analysis.image_description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  감정적 지표
                </h4>
                <p className="text-sm text-muted-foreground">{analysis.emotional_indicators}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  심리학적 인사이트
                </h4>
                <p className="text-sm text-muted-foreground">{analysis.psychological_insights}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">상담 포인트</h4>
                <ul className="space-y-2">
                  {analysis.counseling_points.map((point, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {analysis.follow_up_questions.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    추가 질문
                  </h4>
                  <ul className="space-y-2">
                    {analysis.follow_up_questions.map((q, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">상담사 권장사항</h4>
                <p className="text-sm text-muted-foreground">{analysis.recommendations}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
