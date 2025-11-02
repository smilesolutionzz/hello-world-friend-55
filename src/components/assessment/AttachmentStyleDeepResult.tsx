import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2, Heart, AlertCircle, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { TextToSpeechButton } from '@/components/audio/TextToSpeechButton';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { PDFHeader } from '@/components/common/PDFHeader';

interface AttachmentStyleDeepResultProps {
  result: {
    categoryScores: Record<string, number>;
    averageScores: Array<{ category: string; average: number }>;
    dominantStyle: string;
    dominantScore: number;
    totalScore: number;
    averageScore: number;
    styleInfo: {
      name: string;
      emoji: string;
      description: string;
      strengths: string[];
      challenges: string[];
      tips: string[];
    };
    allStyles: Record<string, any>;
    answers: Record<number, number>;
  };
  onBack: () => void;
}

const styleColors = {
  secure: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    progress: 'bg-green-500',
  },
  anxious: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    progress: 'bg-yellow-500',
  },
  avoidant: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    progress: 'bg-blue-500',
  },
  fearful: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    progress: 'bg-purple-500',
  },
};

const AttachmentStyleDeepResult: React.FC<AttachmentStyleDeepResultProps> = ({ result, onBack }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    await downloadResultAsPDF(
      'attachment-result-content',
      `애착유형분석_${new Date().toLocaleDateString()}.pdf`
    );
    toast({
      title: "PDF 다운로드 완료",
      description: "검사 결과가 저장되었습니다.",
    });
  };

  const handleShare = () => {
    toast({
      title: "공유 기능",
      description: "결과 공유 기능이 곧 제공됩니다.",
    });
  };

  const colors = styleColors[result.dominantStyle as keyof typeof styleColors];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto pt-8 pb-12 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </Button>
          <div className="flex gap-2">
            <TextToSpeechButton text={`애착 유형 분석 결과입니다. 당신의 주요 애착 유형은 ${result.styleInfo.name}입니다.`} />
            <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
              <Download className="w-4 h-4" />
              PDF 다운로드
            </Button>
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="w-4 h-4" />
              공유
            </Button>
          </div>
        </div>

        <div id="attachment-result-content" className="space-y-6">
          <PDFHeader testName="애착 유형 심층 분석" />

          {/* Main Result Card */}
          <Card className={`shadow-xl border-2 ${colors.border}`}>
            <CardHeader className={`${colors.bg}`}>
              <div className="text-center space-y-4">
                <div className="text-6xl">{result.styleInfo.emoji}</div>
                <CardTitle className="text-3xl">
                  당신의 주요 애착 유형
                </CardTitle>
                <div className={`text-4xl font-bold ${colors.text}`}>
                  {result.styleInfo.name}
                </div>
                <CardDescription className="text-lg">
                  {result.styleInfo.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">총점</p>
                  <p className="text-3xl font-bold">{result.totalScore.toFixed(0)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">평균 점수</p>
                  <p className="text-3xl font-bold">{result.averageScore.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Attachment Styles Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                애착 유형별 점수
              </CardTitle>
              <CardDescription>
                각 애착 유형의 경향성을 확인해보세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {result.averageScores.map(({ category, average }) => {
                const styleInfo = result.allStyles[category];
                const percentage = (average / 5) * 100;
                const styleColor = styleColors[category as keyof typeof styleColors];
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{styleInfo.emoji}</span>
                        <span className="font-semibold">{styleInfo.name}</span>
                      </div>
                      <span className={`font-bold ${styleColor.text}`}>
                        {average.toFixed(1)}/5.0
                      </span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600" />
                강점
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.styleInfo.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                성장 영역
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.styleInfo.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-gradient-to-br from-pink-50 to-purple-50">
            <CardHeader>
              <CardTitle>💡 맞춤 조언</CardTitle>
              <CardDescription>
                더 건강한 관계를 위한 실천 방법
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.styleInfo.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <span className="text-purple-600 font-bold">{index + 1}</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>🌱 애착 유형 이해하기</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                애착 유형은 어린 시절의 양육 경험을 통해 형성되지만, 고정된 것이 아닙니다. 
                자기 인식과 노력을 통해 더 안정적인 애착 패턴으로 변화할 수 있습니다.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p className="font-semibold text-blue-900">💙 알아두세요</p>
                <ul className="text-sm text-blue-800 space-y-1 ml-4">
                  <li>• 애착 유형은 상황과 관계에 따라 다르게 나타날 수 있습니다</li>
                  <li>• 건강한 관계 경험을 통해 긍정적으로 변화할 수 있습니다</li>
                  <li>• 자신의 패턴을 인식하는 것이 변화의 첫걸음입니다</li>
                  <li>• 필요시 전문가의 도움을 받는 것을 권장합니다</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="flex-1" 
              onClick={() => navigate('/assessment')}
            >
              다른 검사 하기
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate('/ai-counselor')}
            >
              AI 상담 받기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttachmentStyleDeepResult;
