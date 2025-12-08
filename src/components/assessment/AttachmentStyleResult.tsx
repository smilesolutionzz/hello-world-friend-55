import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, TrendingUp, Lightbulb, ArrowLeft, RefreshCw, ImageIcon, Loader2, FileDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { downloadResultAsPDF } from '@/utils/pdfDownload';

interface AttachmentStyleResultProps {
  result: {
    answers: Record<string, number>;
    anxietyScore: number;
    avoidanceScore: number;
    style: string;
    total: number;
    average: number;
    analysis?: string;
  };
  onRestart: () => void;
}

const AttachmentStyleResult: React.FC<AttachmentStyleResultProps> = ({ result, onRestart }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      await downloadResultAsPDF(
        'attachment-style-result',
        `애착유형검사_${new Date().toISOString().split('T')[0]}`,
        () => {
          toast({
            title: "PDF 다운로드 완료",
            description: "검사 결과가 PDF로 저장되었습니다.",
          });
        },
        (error) => {
          toast({
            title: "PDF 다운로드 실패",
            description: error.message,
            variant: "destructive",
          });
        }
      );
    } finally {
      setIsDownloadingPDF(false);
    }
  };
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // 자동 저장 - 분석 포함
  useAutoSaveTestResult({
    testType: '애착 유형 검사',
    results: { 
      total: result.total, 
      average: result.average, 
      anxietyScore: result.anxietyScore,
      avoidanceScore: result.avoidanceScore,
      style: result.style
    },
    analysis: result.analysis || `애착 유형: ${result.style}, 불안 점수: ${result.anxietyScore.toFixed(1)}/7, 회피 점수: ${result.avoidanceScore.toFixed(1)}/7`
  });

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const prompt = `따뜻하고 친근한 일러스트로, ${result.style} 애착 유형을 표현하는 이미지를 그려주세요. 
불안 점수: ${result.anxietyScore.toFixed(1)}/7, 회피 점수: ${result.avoidanceScore.toFixed(1)}/7
감정적이고 심리적인 면을 시각화하되, 희망적이고 긍정적인 분위기로 표현해주세요.
파스텔 톤의 부드러운 색상을 사용하고, 전문적인 심리 상담 일러스트 스타일로 그려주세요.
- 텍스트 없이
- 고해상도로`;

      const { data, error } = await supabase.functions.invoke('generate-report-image', {
        body: { prompt }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({
          title: "이미지 생성 완료!",
          description: "AI가 당신의 애착 유형을 시각화했습니다.",
        });
      }
    } catch (error) {
      console.error('이미지 생성 오류:', error);
      toast({
        title: "이미지 생성 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const getStyleColor = (style: string) => {
    switch(style) {
      case "안정형": return "bg-green-500";
      case "불안형": return "bg-orange-500";
      case "회피형": return "bg-blue-500";
      case "혼란형": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getStyleDescription = (style: string) => {
    switch(style) {
      case "안정형": return "건강한 관계를 형성하는 유형";
      case "불안형": return "관계에 대한 걱정이 많은 유형";
      case "회피형": return "독립성을 중시하는 유형";
      case "혼란형": return "친밀함과 거리감 사이에서 혼란스러운 유형";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-4 py-8">
      <div id="attachment-style-result" className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Button variant="ghost" onClick={() => navigate('/assessment')} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            검사 목록
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF}
              className="flex items-center gap-2"
            >
              {isDownloadingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              PDF 저장
            </Button>
            <Button variant="outline" onClick={onRestart} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              다시 검사
            </Button>
          </div>
        </div>

        {/* 결과 요약 카드 */}
        <Card className="border-2">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Badge className={`${getStyleColor(result.style)} text-white text-lg px-6 py-2`}>
                {result.style}
              </Badge>
            </div>
            <CardTitle className="text-3xl mb-2">애착 유형 검사 결과</CardTitle>
            <p className="text-muted-foreground text-lg">
              {getStyleDescription(result.style)}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* 불안 점수 */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-6 h-6 text-orange-600" />
                  <h3 className="font-bold text-lg">불안 점수</h3>
                </div>
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {result.anxietyScore.toFixed(1)} / 7
                </div>
                <p className="text-sm text-muted-foreground">
                  {result.anxietyScore < 4 
                    ? "관계에서 안정감을 느끼는 편입니다" 
                    : "관계에 대한 걱정이 있는 편입니다"}
                </p>
              </div>

              {/* 회피 점수 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-lg">회피 점수</h3>
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {result.avoidanceScore.toFixed(1)} / 7
                </div>
                <p className="text-sm text-muted-foreground">
                  {result.avoidanceScore < 4 
                    ? "타인과 가까워지는 것을 편하게 느낍니다" 
                    : "독립성을 중시하는 편입니다"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI 일러스트 생성 */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-primary" />
              <CardTitle>AI 일러스트</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              AI가 당신의 애착 유형을 시각적으로 표현한 일러스트를 생성합니다.
            </p>
            
            {!generatedImage && (
              <Button 
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
                className="w-full"
                size="lg"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    이미지 생성 중...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    일러스트 생성하기
                  </>
                )}
              </Button>
            )}

            {generatedImage && (
              <div className="space-y-3">
                <img 
                  src={generatedImage} 
                  alt="AI 생성 애착 유형 일러스트"
                  className="w-full rounded-lg shadow-lg"
                />
                <Button 
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 생성하기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI 상세 분석 */}
        {result.analysis && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-primary" />
                <CardTitle>AI 전문가 분석</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                    h2: ({node, ...props}) => <h3 className="text-xl font-bold mt-5 mb-3" {...props} />,
                    h3: ({node, ...props}) => <h4 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                    li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-primary" {...props} />,
                  }}
                >
                  {result.analysis}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 행동 버튼 */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex items-start gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">다음 단계</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  이 결과를 바탕으로 더 깊이 있는 상담이나 다른 심리 검사를 진행해보세요.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/assessment')} variant="outline">
                다른 검사 해보기
              </Button>
              <Button onClick={() => navigate('/token-history')} variant="outline">
                토큰 이력 확인
              </Button>
              <Button onClick={() => navigate('/')} variant="secondary">
                홈으로
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttachmentStyleResult;
