import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, CheckCircle, ArrowLeft, Download, MessageCircle, ExternalLink, Brain, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { PDFHeader } from '@/components/common/PDFHeader';
import { useToast } from '@/hooks/use-toast';
import { ExpertConsultationNotice } from './ExpertConsultationNotice';
import { RelatedTestRecommendations } from './RelatedTestRecommendations';
import { supabase } from '@/integrations/supabase/client';

interface ChallengingBehaviorResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
  };
}

const ChallengingBehaviorResult = ({ results }: ChallengingBehaviorResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const [expertInterpretation, setExpertInterpretation] = useState<string>("");
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);

  // 카테고리별 점수 계산 (각 카테고리 문항 수에 맞게)
  const categoryScores = {
    '자해행동': results.answers.slice(0, 2).reduce((sum, val) => sum + val, 0), // 2문항
    '공격행동': results.answers.slice(2, 5).reduce((sum, val) => sum + val, 0), // 3문항  
    '파괴행동': results.answers.slice(5, 7).reduce((sum, val) => sum + val, 0), // 2문항
    '상동행동': results.answers.slice(7, 10).reduce((sum, val) => sum + val, 0), // 3문항
    '부적절한 사회적 행동': results.answers.slice(10, 13).reduce((sum, val) => sum + val, 0), // 3문항
    '거부행동': results.answers.slice(13, 15).reduce((sum, val) => sum + val, 0), // 2문항
  };

  // 레이더 차트 데이터
  const radarData = Object.entries(categoryScores).map(([name, value]) => ({
    category: name,
    score: value,
    fullMark: name === '자해행동' || name === '파괴행동' || name === '거부행동' ? 6 : 9, // 2문항=6점, 3문항=9점
  }));

  // 막대 차트 데이터
  const barData = Object.entries(categoryScores).map(([name, value]) => ({
    name,
    점수: value,
    최대점수: name === '자해행동' || name === '파괴행동' || name === '거부행동' ? 6 : 9,
  }));

  const getSeverityInfo = (severity: string) => {
    switch (severity) {
      case '심각':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: AlertTriangle,
          scoreRange: '평균 2.5점 이상 (총 37.5점 이상)',
          message: '도전행동이 매우 심각한 수준입니다',
          description: '일상생활과 사회적 기능에 심각한 영향을 미치고 있습니다. 즉시 전문가의 개입이 필요합니다.',
          recommendation: '행동치료 전문가, 발달장애 전문의와의 상담을 권장합니다.',
          urgency: '즉시',
          interventions: [
            '기능적 행동 평가(FBA) 실시',
            '응용행동분석(ABA) 치료 시작',
            '약물 치료 고려 (전문의 상담)',
            '위기관리 계획 수립',
            '보호자 교육 및 지원'
          ]
        };
      case '중등도':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          icon: TrendingDown,
          scoreRange: '평균 1.5~2.5점 (총 22.5~37.5점)',
          message: '도전행동이 중등도 수준입니다',
          description: '일부 영역에서 도전행동이 관찰되며 조기 개입이 필요합니다.',
          recommendation: '행동치료사와의 상담을 통해 행동 지원 계획을 수립하시기 바랍니다.',
          urgency: '2주 이내',
          interventions: [
            '긍정적 행동 지원(PBS) 계획 수립',
            '대체 행동 교육',
            '환경 수정 및 예측 가능한 일과 구조화',
            '보호자 상담 및 교육',
            '정기적인 행동 모니터링'
          ]
        };
      case '경도':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          icon: CheckCircle,
          scoreRange: '평균 0.5~1.5점 (총 7.5~22.5점)',
          message: '경미한 도전행동이 관찰됩니다',
          description: '일부 도전행동이 가끔 나타나지만 관리 가능한 수준입니다.',
          recommendation: '정기적인 관찰과 예방적 개입이 도움이 될 수 있습니다.',
          urgency: '1개월 이내',
          interventions: [
            '예방적 전략 수립',
            '긍정적 행동 강화',
            '의사소통 기술 향상',
            '일상 루틴 유지',
            '필요시 전문가 상담'
          ]
        };
      default:
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: CheckCircle,
          scoreRange: '평균 0.5점 미만 (총 7.5점 미만)',
          message: '도전행동이 거의 관찰되지 않습니다',
          description: '현재 도전행동이 최소 수준이며, 긍정적인 상태를 유지하고 있습니다.',
          recommendation: '현재의 긍정적인 환경과 지원을 유지하시기 바랍니다.',
          urgency: '해당없음',
          interventions: [
            '현재 지원 체계 유지',
            '긍정적 환경 지속',
            '예방적 관찰',
            '정기적 재평가'
          ]
        };
    }
  };

  const info = getSeverityInfo(results.severity);
  const Icon = info.icon;
  const percentage = Math.round((results.average / 3) * 100);

  const handlePDFDownload = async () => {
    await downloadResultAsPDF(
      'challenging-behavior-result-content',
      '도전행동_평가_결과',
      () => {
        toast({
          title: "PDF 다운로드 완료",
          description: "도전행동 평가 결과가 저장되었습니다.",
        });
      },
      (error) => {
        toast({
          title: "다운로드 실패",
          description: error.message,
          variant: "destructive",
        });
      }
    );
  };

  useEffect(() => {
    const fetchExpertInterpretation = async () => {
      setIsLoadingInterpretation(true);
      try {
        const { data, error } = await supabase.functions.invoke('behavior-expert-interpretation', {
          body: {
            assessmentType: 'challenging-behavior',
            results,
            categoryScores
          }
        });

        if (error) throw error;
        if (data?.interpretation) {
          setExpertInterpretation(data.interpretation);
        }
      } catch (error) {
        console.error('전문가 해석 생성 실패:', error);
      } finally {
        setIsLoadingInterpretation(false);
      }
    };

    fetchExpertInterpretation();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30 py-8">
      <div id="challenging-behavior-result-content" className="container mx-auto px-4 max-w-6xl space-y-6">
        {/* PDF Header */}
        <PDFHeader testName="도전행동 평가 결과" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            대시보드로
          </Button>
          <h1 className="text-3xl font-bold text-brand-gradient">도전행동 평가 결과</h1>
          <Button variant="outline" onClick={handlePDFDownload} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            PDF 다운로드
          </Button>
        </div>

        {/* 법적 안전 공지 */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>⚠️ 중요 안내:</strong> 이 검사 결과는 선별 도구이며 정식 진단이 아닙니다. 
              정확한 평가와 진단을 위해서는 반드시 발달장애 전문의, 임상심리사, 행동치료사 등 
              전문가의 종합적인 평가가 필요합니다.
            </p>
          </CardContent>
        </Card>

        {/* 종합 점수 Card */}
        <Card className={`${info.bgColor} border-2 ${info.borderColor}`}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-40 h-40 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-xl border-4 border-white">
                <div className="text-center">
                  <Icon className={`w-12 h-12 mx-auto mb-2 ${info.color}`} />
                  <div className={`text-5xl font-bold ${info.color}`}>{percentage}%</div>
                  <div className="text-sm text-muted-foreground mt-1">심각도</div>
                </div>
              </div>
            </div>
            <CardTitle className={`text-3xl mb-2 ${info.color}`}>
              {results.severity}
            </CardTitle>
            <p className="text-lg font-medium text-foreground">{info.message}</p>
            <p className="text-sm text-muted-foreground mt-2">{info.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{results.total}점</div>
                <div className="text-xs text-muted-foreground">총점 (최대 45점)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{results.average.toFixed(2)}점</div>
                <div className="text-xs text-muted-foreground">평균 (최대 3점)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">15문항</div>
                <div className="text-xs text-muted-foreground">평가 항목</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${info.color}`}>{info.urgency}</div>
                <div className="text-xs text-muted-foreground">개입 시기</div>
              </div>
            </div>
            
            <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${info.bgColor}`}>
                  <Icon className={`w-6 h-6 ${info.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">점수 범위</h4>
                  <p className="text-sm text-muted-foreground">{info.scoreRange}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 카테고리별 상세 분석 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 레이더 차트 */}
          <Card>
            <CardHeader>
              <CardTitle>영역별 분석</CardTitle>
              <p className="text-sm text-muted-foreground">각 도전행동 영역별 점수 분포</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 9]} tick={{ fill: '#64748b' }} />
                  <Radar name="점수" dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 막대 차트 */}
          <Card>
            <CardHeader>
              <CardTitle>카테고리별 점수</CardTitle>
              <p className="text-sm text-muted-foreground">각 행동 카테고리의 점수 비교</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fill: '#64748b' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="점수" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="최대점수" fill="#e2e8f0" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 카테고리별 세부 분석 */}
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 세부 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {Object.entries(categoryScores).map(([category, score]) => {
                const maxScore = category === '자해행동' || category === '파괴행동' || category === '거부행동' ? 6 : 9;
                const percent = Math.round((score / maxScore) * 100);
                let severityColor = 'bg-green-500';
                if (percent >= 70) severityColor = 'bg-red-500';
                else if (percent >= 40) severityColor = 'bg-orange-500';
                else if (percent >= 20) severityColor = 'bg-yellow-500';

                return (
                  <div key={category} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{category}</span>
                      <Badge variant="outline">{score} / {maxScore}점 ({percent}%)</Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className={`${severityColor} h-3 rounded-full transition-all`} 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI 전문가 해석 */}
        {isLoadingInterpretation ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary animate-pulse" />
                AI 전문가 해석 생성 중...
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : expertInterpretation && (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                AI 전문가 해석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-background/80 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{expertInterpretation}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 권장 개입 전략 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              권장 개입 전략
            </CardTitle>
            <p className="text-sm text-muted-foreground">{info.recommendation}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {info.interventions.map((intervention, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm flex-1">{intervention}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 전문가 상담 안내 */}
        <ExpertConsultationNotice />

        {/* 연계 검사 추천 */}
        <RelatedTestRecommendations currentTestType="challenging-behavior" />

        {/* CTA Buttons */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button 
            className="w-full h-auto py-6 flex flex-col items-center gap-2" 
            onClick={() => navigate('/consultation-reservation')}
          >
            <MessageCircle className="w-6 h-6" />
            <div className="text-center">
              <div className="font-bold">전문가 상담 예약</div>
              <div className="text-xs opacity-90">행동치료 전문가 연결</div>
            </div>
          </Button>
          
          <Button 
            variant="outline"
            className="w-full h-auto py-6 flex flex-col items-center gap-2"
            onClick={() => navigate('/assessment')}
          >
            <ExternalLink className="w-6 h-6" />
            <div className="text-center">
              <div className="font-bold">다른 검사 하기</div>
              <div className="text-xs opacity-90">추가 평가 진행</div>
            </div>
          </Button>
          
          <Button 
            variant="outline"
            className="w-full h-auto py-6 flex flex-col items-center gap-2"
            onClick={() => navigate('/dashboard')}
          >
            <Brain className="w-6 h-6" />
            <div className="text-center">
              <div className="font-bold">대시보드</div>
              <div className="text-xs opacity-90">전체 기록 보기</div>
            </div>
          </Button>
        </div>

        {/* 추가 정보 */}
        <Card>
          <CardHeader>
            <Button 
              variant="ghost" 
              className="w-full justify-between"
              onClick={() => setShowDetails(!showDetails)}
            >
              <span className="font-semibold">도전행동 이해하기</span>
              <span>{showDetails ? '▲' : '▼'}</span>
            </Button>
          </CardHeader>
          {showDetails && (
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">도전행동이란?</h4>
                <p className="text-sm text-muted-foreground">
                  도전행동(Challenging Behavior)은 본인이나 타인에게 해를 끼치거나, 
                  일상생활 및 사회 참여를 제한하는 행동을 말합니다. 
                  발달장애인에게서 흔히 관찰되며, 의사소통의 어려움, 감각 문제, 
                  환경적 요인 등이 원인이 될 수 있습니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">긍정적 행동 지원(PBS)</h4>
                <p className="text-sm text-muted-foreground">
                  긍정적 행동 지원은 도전행동의 기능을 이해하고, 
                  대체 행동을 가르치며, 환경을 수정하여 행동을 개선하는 접근법입니다. 
                  처벌보다는 긍정적 강화와 예방에 초점을 맞춥니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">행동의 기능</h4>
                <p className="text-sm text-muted-foreground">
                  모든 행동에는 기능(목적)이 있습니다: 관심 얻기, 물건 얻기, 
                  회피/도피, 감각 자극. 기능적 행동 평가(FBA)를 통해 
                  행동의 원인을 파악하고 적절한 개입 전략을 수립할 수 있습니다.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChallengingBehaviorResult;
