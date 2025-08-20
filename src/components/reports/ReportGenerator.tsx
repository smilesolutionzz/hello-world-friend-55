import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, Share2, Eye, AlertTriangle, CheckCircle, User, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  aiAnalysis: any;
  expertFeedback?: any;
  profileId: string;
  childName: string;
  birthDate: string;
  reportType: 'ai_only' | 'ai_expert_combined';
}

interface ReportGeneratorProps {
  data: ReportData;
  onReportGenerated: (reportUrl: string) => void;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ data, onReportGenerated }) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedReportUrl, setGeneratedReportUrl] = useState<string | null>(null);

  const generateReport = async () => {
    setIsGenerating(true);
    setProgress(0);

    const steps = [
      { step: '리포트 템플릿 생성...', progress: 25 },
      { step: 'AI 분석 결과 통합...', progress: 50 },
      { step: '전문가 피드백 반영...', progress: 75 },
      { step: 'PDF 파일 생성...', progress: 100 }
    ];

    try {
      for (const stepData of steps) {
        setProgress(stepData.progress);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // PDF 생성 API 호출
      const { data: reportResult, error } = await supabase.functions.invoke(
        'generate-comprehensive-report',
        {
          body: {
            profile_id: data.profileId,
            child_name: data.childName,
            birth_date: data.birthDate,
            ai_analysis: data.aiAnalysis,
            expert_feedback: data.expertFeedback,
            report_type: data.reportType
          }
        }
      );

      if (error) throw error;

      // Store report metadata in assessments table for now
      const { data: reportRecord, error: saveError } = await supabase
        .from('assessments')
        .insert({
          profile_id: data.profileId,
          age_group: data.reportType,
          age_at_assessment: 0,
          results: {
            report_url: reportResult.report_url,
            child_name: data.childName,
            birth_date: data.birthDate,
            generation_date: new Date().toISOString(),
            ai_analysis_id: data.aiAnalysis.id,
            expert_feedback_id: data.expertFeedback?.id
          },
          analysis: `Generated Report - ${data.reportType}`,
          risk_level: data.aiAnalysis?.risk_level || 'medium'
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setGeneratedReportUrl(reportResult.report_url);
      onReportGenerated(reportResult.report_url);

      toast({
        title: "리포트 생성 완료",
        description: "종합 분석 리포트가 성공적으로 생성되었습니다.",
      });

    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "리포트 생성 실패",
        description: "리포트 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async () => {
    if (!generatedReportUrl) return;

    try {
      const response = await fetch(generatedReportUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AI하이라이트_종합분석리포트_${data.childName}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "다운로드 완료",
        description: "리포트가 다운로드되었습니다.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "다운로드 실패",
        description: "파일 다운로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const shareReport = async () => {
    if (!generatedReportUrl) return;

    try {
      await navigator.clipboard.writeText(generatedReportUrl);
      toast({
        title: "링크 복사됨",
        description: "리포트 링크가 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "링크 복사 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getRiskLevelBadge = (level: string) => {
    const variants = {
      high: { variant: 'destructive' as const, text: '주의 필요' },
      medium: { variant: 'secondary' as const, text: '관찰 필요' },
      low: { variant: 'default' as const, text: '양호' }
    };
    
    return variants[level as keyof typeof variants] || variants.medium;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">종합 분석 리포트</h2>
            <p className="text-sm text-muted-foreground">
              AI 분석과 전문가 피드백을 포함한 종합 리포트를 생성합니다
            </p>
          </div>
        </div>

        {/* 리포트 미리보기 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">대상자: {data.childName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                생년월일: {new Date(data.birthDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                리포트 유형: {data.reportType === 'ai_expert_combined' ? 'AI + 전문가' : 'AI 분석'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">종합 점수:</span>
              <Badge variant="outline" className="ml-auto">
                {data.aiAnalysis?.overall_score || 0}점
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">위험도:</span>
              <Badge 
                variant={getRiskLevelBadge(data.aiAnalysis?.risk_level).variant}
                className="ml-auto"
              >
                {getRiskLevelBadge(data.aiAnalysis?.risk_level).text}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* 리포트 내용 요약 */}
        {data.aiAnalysis && (
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold">주요 분석 내용</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">강점 영역</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {data.aiAnalysis.developmental_insights?.strengths?.slice(0, 3).map((strength: string, index: number) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">관심 영역</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  {data.aiAnalysis.developmental_insights?.concerns?.slice(0, 3).map((concern: string, index: number) => (
                    <li key={index}>• {concern}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">주요 권고사항</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {data.aiAnalysis.developmental_insights?.recommendations?.slice(0, 3).map((rec: string, index: number) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 생성 진행 상황 */}
        {isGenerating && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">리포트 생성 중...</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-wrap gap-3">
          {!generatedReportUrl && !isGenerating && (
            <Button onClick={generateReport} className="flex-1 min-w-[200px]">
              <FileText className="mr-2 h-4 w-4" />
              리포트 생성하기
            </Button>
          )}

          {generatedReportUrl && (
            <>
              <Button onClick={downloadReport} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                PDF 다운로드
              </Button>
              <Button onClick={shareReport} variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                링크 공유
              </Button>
              <Button 
                onClick={() => window.open(generatedReportUrl, '_blank')}
                variant="outline"
              >
                <Eye className="mr-2 h-4 w-4" />
                미리보기
              </Button>
            </>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            {data.reportType === 'ai_expert_combined' ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            )}
            <div className="text-sm">
              <p className="font-medium mb-1">
                {data.reportType === 'ai_expert_combined' 
                  ? '전문가 검토 완료 리포트' 
                  : 'AI 분석 리포트'
                }
              </p>
              <p className="text-muted-foreground">
                {data.reportType === 'ai_expert_combined'
                  ? '전문가의 검토와 추가 피드백이 포함된 최종 리포트입니다.'
                  : 'AI 1차 분석 결과입니다. 전문가 검토 후 더욱 정확한 리포트를 받아보실 수 있습니다.'
                }
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};