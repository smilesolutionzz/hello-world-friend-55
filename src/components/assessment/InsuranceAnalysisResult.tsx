import { useState } from "react";
import { cleanMarkdown } from '@/utils/cleanMarkdown';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Download, Save, AlertTriangle, CheckCircle2, AlertCircle, ImageIcon, Loader2, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { generatePDF } from "@/utils/pdfGenerator";
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface Coverage {
  category: string; name: string; amount: string; insured: string;
  status: 'insufficient' | 'adequate' | 'excellent'; reason: string;
}

interface InsuranceAnalysisResultProps {
  results: {
    parentScore: number; childScore: number; totalScore: number;
    coverages: Coverage[]; summary: string;
    recommendations: Array<{ priority: number; item: string; cost: string; }>;
    aiAnalysis: string;
  };
  onBack: () => void;
}

export const InsuranceAnalysisResult = ({ results, onBack }: InsuranceAnalysisResultProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const prompt = `Create a warm illustration visualizing a family insurance coverage analysis. Parent score: ${results.parentScore}, Child score: ${results.childScore}, Family total: ${results.totalScore}. Show a happy family being safely protected. Professional financial illustration style with pastel blue and green tones. No text. High resolution.`;
      const { data, error } = await supabase.functions.invoke('generate-report-image', { body: { prompt } });
      if (error) throw error;
      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({ title: isEnglish ? "Image Generated!" : "이미지 생성 완료!", description: isEnglish ? "AI visualized your insurance analysis." : "AI가 보험 분석 결과를 시각화했습니다." });
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast({ title: isEnglish ? "Image Generation Failed" : "이미지 생성 실패", description: isEnglish ? "Please try again later." : "잠시 후 다시 시도해주세요.", variant: "destructive" });
    } finally { setIsGeneratingImage(false); }
  };

  const getScoreColor = (score: number) => score >= 80 ? 'text-green-600' : score >= 60 ? 'text-blue-600' : 'text-red-600';
  const getScoreLabel = (score: number) => {
    if (isEnglish) return score >= 80 ? 'Excellent' : score >= 60 ? 'Adequate' : 'Insufficient';
    return score >= 80 ? '우수' : score >= 60 ? '적정' : '부족';
  };

  const getStatusIcon = (status: Coverage['status']) => {
    switch (status) {
      case 'excellent': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'adequate': return <AlertCircle className="h-5 w-5 text-blue-600" />;
      case 'insufficient': return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusBg = (status: Coverage['status']) => {
    switch (status) {
      case 'excellent': return 'bg-green-50 border-green-200';
      case 'adequate': return 'bg-blue-50 border-blue-200';
      case 'insufficient': return 'bg-red-50 border-red-200';
    }
  };

  const chartData = [
    { name: isEnglish ? 'Parent' : '부모', score: results.parentScore, fill: '#3b82f6' },
    { name: isEnglish ? 'Child' : '자녀', score: results.childScore, fill: '#8b5cf6' },
    { name: isEnglish ? 'Family' : '가족', score: results.totalScore, fill: '#10b981' },
  ];

  const handleShare = () => { toast({ title: isEnglish ? "Share" : "공유 기능", description: isEnglish ? "You can share the results." : "결과를 공유할 수 있습니다." }); };
  const handleDownload = () => { generatePDF('insurance-result', { filename: isEnglish ? `Insurance_Analysis_${new Date().toLocaleDateString()}.pdf` : `보험보장분석_${new Date().toLocaleDateString()}.pdf` }); };
  const handleSave = () => { toast({ title: isEnglish ? "Saved" : "저장 완료", description: isEnglish ? "Results have been saved." : "결과가 저장되었습니다." }); };

  return (
    <div className="space-y-6" id="insurance-result">
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">{isEnglish ? 'Family Coverage Analysis Results' : '가족 보장 분석 결과'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">{isEnglish ? 'Parent Coverage Score' : '부모 보장 점수'}</p>
              <p className={`text-4xl font-bold ${getScoreColor(results.parentScore)}`}>{results.parentScore}{isEnglish ? '' : '점'}</p>
              <p className="text-sm mt-2">{getScoreLabel(results.parentScore)}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">{isEnglish ? 'Child Coverage Score' : '자녀 보장 점수'}</p>
              <p className={`text-4xl font-bold ${getScoreColor(results.childScore)}`}>{results.childScore}{isEnglish ? '' : '점'}</p>
              <p className="text-sm mt-2">{getScoreLabel(results.childScore)}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">{isEnglish ? 'Family Total Score' : '가족 종합 점수'}</p>
              <p className={`text-4xl font-bold ${getScoreColor(results.totalScore)}`}>{results.totalScore}{isEnglish ? '' : '점'}</p>
              <p className="text-sm mt-2">{getScoreLabel(results.totalScore)}</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={60} stroke="#3b82f6" strokeDasharray="3 3" label={isEnglish ? "Adequate" : "적정 기준"} />
                <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" label={isEnglish ? "Excellent" : "우수 기준"} />
                <Bar dataKey="score" fill="#8884d8" name={isEnglish ? "Coverage Score" : "보장 점수"} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary" />
            <CardTitle>{isEnglish ? 'AI Illustration' : 'AI 일러스트'}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isEnglish ? 'AI generates a visual illustration of your family coverage analysis.' : 'AI가 당신의 가족 보장 분석을 시각적으로 표현한 일러스트를 생성합니다.'}
          </p>
          {!generatedImage && (
            <Button onClick={handleGenerateImage} disabled={isGeneratingImage} className="w-full" size="lg">
              {isGeneratingImage ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isEnglish ? 'Generating...' : '이미지 생성 중...'}</>) : (<><ImageIcon className="w-4 h-4 mr-2" />{isEnglish ? 'Generate Illustration' : '일러스트 생성하기'}</>)}
            </Button>
          )}
          {generatedImage && (
            <div className="space-y-3">
              <img src={generatedImage} alt={isEnglish ? "AI generated insurance analysis illustration" : "AI 생성 보험 분석 일러스트"} className="w-full rounded-lg shadow-lg" />
              <Button onClick={handleGenerateImage} disabled={isGeneratingImage} variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />{isEnglish ? 'Regenerate' : '다시 생성하기'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>📊 {isEnglish ? 'Analysis Summary' : '분석 요약'}</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground whitespace-pre-line">{results.summary}</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>📋 {isEnglish ? 'Coverage Status' : '담보 현황'}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {results.coverages.map((coverage, index) => (
            <div key={index} className={`p-4 rounded-lg border-2 ${getStatusBg(coverage.status)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(coverage.status)}
                    <h4 className="font-semibold">{coverage.name}</h4>
                    <span className="text-xs bg-white/50 px-2 py-1 rounded">{coverage.category}</span>
                  </div>
                  <p className="text-sm mb-1"><span className="font-medium">{isEnglish ? 'Coverage:' : '보장금액:'}</span> {coverage.amount}</p>
                  <p className="text-sm mb-1"><span className="font-medium">{isEnglish ? 'Insured:' : '피보험자:'}</span> {coverage.insured}</p>
                  <p className="text-sm text-muted-foreground">{coverage.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-2 border-amber-200 bg-amber-50/50">
        <CardHeader><CardTitle>💡 {isEnglish ? 'Top 3 Recommendations' : '보완 추천 TOP 3'}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {results.recommendations.map((rec, index) => (
            <div key={index} className="flex gap-3 p-3 bg-white rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">{rec.priority}</div>
              <div className="flex-1">
                <p className="font-medium mb-1">{rec.item}</p>
                <p className="text-sm text-muted-foreground">{rec.cost}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{isEnglish ? 'Expert Detailed Analysis' : '전문가 상세 분석'}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cleanMarkdown(results.aiAnalysis || '').split('\n\n').filter(Boolean).map((p, i) => (
              <p key={i} className="text-sm leading-[1.8] text-muted-foreground">{p.trim()}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleShare} variant="outline" className="flex-1">
          <Share2 className="mr-2 h-4 w-4" />{isEnglish ? 'Share' : '공유하기'}
        </Button>
        <Button onClick={handleDownload} variant="outline" className="flex-1">
          <Download className="mr-2 h-4 w-4" />{isEnglish ? 'PDF Download' : 'PDF 다운로드'}
        </Button>
        <Button onClick={handleSave} className="flex-1">
          <Save className="mr-2 h-4 w-4" />{isEnglish ? 'Save Results' : '결과 저장'}
        </Button>
      </div>

      <Button onClick={onBack} variant="ghost" className="w-full">
        {isEnglish ? 'Go Back' : '돌아가기'}
      </Button>
    </div>
  );
};
