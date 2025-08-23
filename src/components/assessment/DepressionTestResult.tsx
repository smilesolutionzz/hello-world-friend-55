import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Heart, ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProductRecommendation from "@/components/ProductRecommendation";
import { useTestResultActions } from '@/hooks/useTestResultActions';

interface DepressionTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
  };
  onBack: () => void;
}

const DepressionTestResult = ({ results, onBack }: DepressionTestResultProps) => {
  const { total, average, severity, answers } = results;
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestResultActions();
  
  const chartData = [
    {
      name: '총점',
      value: total,
      fullMark: 42,
    }
  ];

  useEffect(() => {
    const getAIAnalysis = async () => {
      try {
        const response = await fetch('https://ybhvjfkpwjwyufaynuyq.supabase.co/functions/v1/depression-analyzer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            results,
            answers: results.answers
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setAiAnalysis(data.analysis);
        } else {
          setAiAnalysis("AI 분석을 가져오는 중 오류가 발생했습니다. 기본 분석을 제공합니다.");
        }
      } catch (error) {
        console.error('AI analysis error:', error);
        setAiAnalysis("AI 분석을 가져오는 중 오류가 발생했습니다. 기본 분석을 제공합니다.");
      } finally {
        setIsLoading(false);
      }
    };

    getAIAnalysis();
  }, [results]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "정상":
        return "bg-green-100 text-green-800 border-green-200";
      case "가벼운 우울":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "중등도 우울":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "심한 우울":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRecommendation = (severity: string) => {
    switch (severity) {
      case "정상":
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          title: "정상 범위",
          description: "현재 우울증상이 정상 범위에 있습니다. 건강한 정신상태를 유지하고 계십니다."
        };
      case "가벼운 우울":
        return {
          icon: <Heart className="w-6 h-6 text-yellow-600" />,
          title: "가벼운 우울증상",
          description: "가벼운 우울증상이 있습니다. 생활습관 개선과 스트레스 관리를 통해 증상 완화가 가능합니다."
        };
      case "중등도 우울":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
          title: "중등도 우울증상",
          description: "중등도 우울증상이 확인됩니다. 전문가와의 상담을 권장하며, 치료가 필요할 수 있습니다."
        };
      case "심한 우울":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
          title: "심한 우울증상",
          description: "즉시 전문가의 도움이 필요합니다. 정신건강의학과 전문의와 상담받으시기를 적극 권장드립니다."
        };
      default:
        return {
          icon: <Heart className="w-6 h-6 text-gray-600" />,
          title: "검사 완료",
          description: "검사가 완료되었습니다."
        };
    }
  };

  const recommendation = getRecommendation(severity);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </Button>
        <h1 className="text-3xl font-bold text-brand-gradient">우울감 체크 결과 (참고용)</h1>
        <div></div>
      </div>

      {/* 법적 안전 공지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          <span className="font-semibold">📊 체크 결과 (참고용)</span><br />
          ⚠️ 이 결과는 참고용이며 의학적 진단이 절대 아닙니다. 지속적 어려움이 있으시면 반드시 전문의와 상담하세요.
        </p>
      </div>

      {/* Summary Card */}
      <Card className="p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">검사 결과 요약</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">총점</span>
                <span className="text-2xl font-bold text-brand-gradient">{total}점</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">규준집단 대비</span>
                <span className="text-2xl font-bold text-brand-gradient">{((total/42)*100).toFixed(0)}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">우울 수준</span>
                <Badge className={getSeverityColor(severity)}>
                  {severity}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">검사일</span>
                <span className="text-lg">{new Date().toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">점수 분포</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 42]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      {/* 전문가 해석 결과 */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold text-foreground mb-6">✨ 결과 요약</h3>
        
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-lg font-medium mb-2">• 우울감 점수: {total}점 / 42점</p>
              <p className="text-lg font-medium">• 심각도: {severity}</p>
            </div>
            <div>
              <p className="text-lg font-medium">• 검사일: {new Date().toLocaleDateString('ko-KR')}</p>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-6">
            <p className="text-lg leading-relaxed">
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span>전문가 해석을 생성하고 있습니다...</span>
                </div>
              ) : (
                <>
                  <strong>해석:</strong> {severity === "정상" 
                    ? "현재 우울 증상이 정상 범위에 있습니다. 건강한 정신상태를 유지하고 계시며, 지속적인 자기관리를 통해 현재 상태를 유지하시기 바랍니다."
                    : severity === "가벼운 우울"
                    ? "가벼운 우울 증상이 확인됩니다. 일상적인 스트레스와 생활 변화로 인한 것일 수 있으며, 생활습관 개선과 스트레스 관리를 통해 증상 완화가 가능합니다."
                    : severity === "중등도 우울"
                    ? "중등도 우울 증상이 나타나고 있습니다. 일상생활에 일부 영향을 미칠 수 있어 전문가와의 상담을 통한 적극적인 관리가 필요합니다."
                    : "심각한 우울 증상이 확인됩니다. 즉시 전문가의 도움이 필요하며, 정신건강의학과 전문의와 상담받으시기를 적극 권장드립니다."}
                </>
              )}
            </p>
          </div>
          
          <div className="text-center pt-4">
            <a 
              href="https://drive.google.com/file/d/17WD3mhW2T4TdkfxTzLpfH5bzFARxz_Vh/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              👉 구독 후 더 정밀한 분석 리포트(PDF) 다운받기 (예시)
            </a>
          </div>
        </div>
      </Card>

      {/* Recommendation Card */}
      <Card className="p-8">
        <div className="flex items-start gap-4">
          {recommendation.icon}
          <div className="flex-1 space-y-4">
            <h3 className="text-2xl font-bold text-foreground">{recommendation.title}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {recommendation.description}
            </p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button 
          className="btn-brand h-16"
          onClick={() => window.open('https://typebot.io/hilight-consult', '_blank')}
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">전문가 상담 연결</div>
            <div className="text-sm opacity-90">즉시 상담 가능</div>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-16"
          onClick={() => generatePDFReport({
            testType: '우울증 검사',
            results: {
              total: results.total,
              average: results.average,
              severity,
              answers: results.answers
            },
            analysis: `우울증 검사 결과 분석: ${recommendation.description}`,
            testInfo: {
              ageGroup: 'adult',
              generatedAt: new Date().toISOString(),
              version: '1.0'
            }
          })}
          disabled={isGeneratingPDF}
        >
          <div className="text-left">
            <div className="font-semibold">{isGeneratingPDF ? 'PDF 생성 중...' : 'PDF 리포트'}</div>
            <div className="text-sm text-muted-foreground">{isGeneratingPDF ? '잠시만 기다려주세요' : '결과를 PDF로 저장'}</div>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-16"
          onClick={() => saveTestResult({
            testType: '우울증 검사',
            results: {
              total: results.total,
              average: results.average,
              severity,
              answers: results.answers
            },
            analysis: `우울증 검사 결과 분석: ${recommendation.description}`,
            ageGroup: 'adult',
            testInfo: {
              generatedAt: new Date().toISOString(),
              version: '1.0'
            }
          })}
          disabled={isSaving}
        >
          <div className="text-left">
            <div className="font-semibold">{isSaving ? '저장 중...' : '결과 저장'}</div>
            <div className="text-sm text-muted-foreground">{isSaving ? '잠시만 기다려주세요' : '검사기록에 저장'}</div>
          </div>
        </Button>
      </div>

      {/* 상품 추천 */}
      <ProductRecommendation 
        category="depression" 
        severity={severity}
      />

      {/* Additional Information */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">참고사항</h4>
        <p className="text-blue-800 text-sm leading-relaxed">
          이 검사는 우울증상 자가체크를 위한 선별도구로, 의학적 진단을 대체할 수 없습니다. 
          정확한 진단과 치료를 위해서는 반드시 전문의와 상담하시기 바랍니다.
        </p>
      </Card>
    </div>
  );
};

export default DepressionTestResult;