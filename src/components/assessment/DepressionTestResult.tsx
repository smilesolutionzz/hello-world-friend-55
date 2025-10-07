import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Heart, ArrowLeft, ExternalLink, Loader2, MessageCircle, Brain, Copy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProductRecommendation from "@/components/ProductRecommendation";
import { useTestResultActions } from '@/hooks/useTestResultActions';
import { NextStepSuggestion } from '@/components/onboarding/NextStepSuggestion';
import { useShareText, formatPsychTestResult } from '@/utils/shareUtils';
import SocialShareButtons from '@/components/social/SocialShareButtons';
import VoiceFeature from '@/components/voice/VoiceFeature';
import { supabase } from '@/integrations/supabase/client';
import { PersonalizedProductRecommendation } from '@/components/product/PersonalizedProductRecommendation';

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
  const navigate = useNavigate();
  const { total, average, severity, answers } = results;
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestResultActions();
  const { shareAsText } = useShareText();
  
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
        const { data, error } = await supabase.functions.invoke('depression-analyzer', {
          body: {
            results,
            answers: results.answers
          }
        });

        if (error) {
          throw error;
        }
        
        if (data?.analysis) {
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

  const handleShareText = () => {
    const formattedText = formatPsychTestResult('depression', results, aiAnalysis);
    shareAsText(formattedText, '우울감 수준 검사 결과');
  };

  const getRecommendation = (severity: string) => {
    switch (severity) {
      case "정상":
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          title: "Normal Range (정상 범위)",
          description: "현재 우울증상이 정상 범위에 있습니다. 건강한 정신상태를 유지하고 계십니다."
        };
      case "가벼운 우울":
        return {
          icon: <Heart className="w-6 h-6 text-yellow-600" />,
          title: "Mild Depression (가벼운 우울증상)",
          description: "가벼운 우울증상이 있습니다. 생활습관 개선과 스트레스 관리를 통해 증상 완화가 가능합니다."
        };
      case "중등도 우울":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
          title: "Moderate Depression (중등도 우울증상)",
          description: "중등도 우울증상이 확인됩니다. 전문가와의 상담을 권장하며, 치료가 필요할 수 있습니다."
        };
      case "심한 우울":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
          title: "Severe Depression (심한 우울증상)",
          description: "즉시 전문가의 도움이 필요합니다. 통합건강의학과 전문의와 상담받으시기를 적극 권장드립니다."
        };
      default:
        return {
          icon: <Heart className="w-6 h-6 text-gray-600" />,
          title: "Assessment Complete (검사 완료)",
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
          ⚠️ 이 결과는 참고용이며 전문적 평가가 절대 아닙니다. 지속적 어려움이 있으시면 반드시 전문가와 상담하세요.
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
                <span className="text-lg font-medium">문항당 평균점수</span>
                <span className="text-2xl font-bold text-brand-gradient">{(total / 21).toFixed(1)}점 / 2.0점</span>
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

      {/* 점수 범위 안내 */}
      <Card className="p-8">
        <h3 className="text-xl font-semibold mb-4">📊 우울감 점수 분류 기준</h3>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="font-semibold text-green-800">정상 (0-13점)</p>
            <p className="text-sm text-green-600 mt-1">건강한 상태</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="font-semibold text-yellow-800">가벼운 우울 (14-19점)</p>
            <p className="text-sm text-yellow-600 mt-1">경미한 증상</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="font-semibold text-orange-800">중등도 우울 (20-28점)</p>
            <p className="text-sm text-orange-600 mt-1">전문가 상담 권장</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="font-semibold text-red-800">심한 우울 (29-42점)</p>
            <p className="text-sm text-red-600 mt-1">즉시 치료 필요</p>
          </div>
        </div>
      </Card>

      {/* 전문가 해석 결과 - 대폭 확장 */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold text-foreground mb-6">✨ 상세 분석 결과</h3>
        
        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-800">우울감 점수</p>
              <p className="text-3xl font-bold text-blue-900">{total}점 / 42점</p>
              <p className="text-sm text-blue-600 mt-1">만점 대비 {Math.round((total/42)*100)}%</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-800">심각도</p>
              <p className={`text-2xl font-bold ${getSeverityColor(severity).includes('green') ? 'text-green-700' : 
                getSeverityColor(severity).includes('yellow') ? 'text-yellow-700' :
                getSeverityColor(severity).includes('orange') ? 'text-orange-700' : 'text-red-700'}`}>
                {severity}
              </p>
              <p className="text-sm text-blue-600 mt-1">범위: {
                severity === "정상" ? "0-13점" :
                severity === "가벼운 우울" ? "14-19점" :
                severity === "중등도 우울" ? "20-28점" : "29-42점"
              }</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-800">검사일</p>
              <p className="text-2xl font-bold text-blue-900">{new Date().toLocaleDateString('ko-KR')}</p>
              <p className="text-sm text-blue-600 mt-1">참고용 결과</p>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <h4 className="text-xl font-semibold text-purple-800 mb-4">🔍 전문가 상세 해석</h4>
            <div className="prose prose-purple max-w-none">
              <p className="text-base leading-relaxed text-gray-800 whitespace-pre-line">
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span>전문가 해석을 생성하고 있습니다...</span>
                  </div>
                ) : (
                  severity === "정상" 
                    ? `현재 점수 ${total}점은 우울 증상이 정상 범위에 있는 건강한 상태를 나타냅니다. 이는 정신건강이 양호하게 유지되고 있음을 의미하며, 일상생활에서 우울감으로 인한 어려움이 최소한임을 보여줍니다.

**7가지 구체적 관리 방법:**
• **긍정적 루틴**: 규칙적인 생활 패턴과 건강한 수면 습관 유지
• **사회적 연결**: 가족, 친구와의 의미 있는 관계 지속적 관리
• **신체 활동**: 주 3회 이상 30분 운동으로 기분 상승 효과 유지
• **스트레스 예방**: 업무와 휴식의 균형 잡힌 생활 패턴 구축
• **취미 활동**: 즐거움을 주는 활동을 통한 정서적 안정 유지
• **감사 연습**: 하루 3가지 감사한 일 찾기로 긍정적 사고 강화
• **자기 돌봄**: 정기적인 건강 검진과 정신건강 자가 점검

**재평가 권장:** 현재 건강한 상태를 유지하면서 3-6개월 후 재검사를 통해 지속적인 정신건강 관리 상태를 확인하시기 바랍니다.`
                    : severity === "가벼운 우울"
                    ? `현재 점수 ${total}점은 가벼운 우울 증상이 있는 수준입니다. 이는 일상적인 스트레스나 생활 변화로 인해 나타날 수 있는 정도로, 적절한 자가관리와 생활습관 개선을 통해 충분히 회복할 수 있는 범위입니다.

**7가지 구체적 개선 방법:**
• **기분 추적**: 매일 기분 상태를 1-10점으로 기록하여 패턴 파악
• **활동 계획**: 즐거운 활동을 주간 일정에 의무적으로 포함시키기
• **수면 개선**: 규칙적인 취침시간과 7-8시간 충분한 수면 확보
• **운동 요법**: 걷기, 요가 등 가벼운 운동을 통한 기분 개선
• **사회적 지지**: 신뢰할 수 있는 사람과 감정 나누기
• **인지 재구성**: 부정적 사고를 균형 잡힌 사고로 바꾸는 연습
• **전문가 상담**: 필요시 상담사와의 정기적 면담으로 조기 개입

**재평가 권장:** 생활 개선 후 3-6개월 뒤 재검사를 통해 증상 호전도를 확인하고, 지속적인 관리 방안을 점검하시기 바랍니다.`
                    : severity === "중등도 우울"
                    ? `현재 점수 ${total}점은 중등도 우울 증상을 나타냅니다. 이는 일상생활에 일부 영향을 미칠 수 있는 수준으로, 전문가의 도움을 받아 체계적인 치료와 관리가 필요한 상태입니다.

**7가지 구체적 치료 방법:**
• **전문가 치료**: 정신건강의학과 또는 임상심리사와 정기 상담
• **인지행동치료**: CBT 기법을 통한 우울 사고 패턴 개선
• **약물 상담**: 필요시 의사와 항우울제 치료 옵션 논의
• **행동 활성화**: 일상 활동 증가를 통한 기분 개선 프로그램
• **지지체계 구축**: 가족, 친구들과의 정서적 지원 네트워크 강화
• **생활 구조화**: 규칙적인 일과와 목표 설정으로 성취감 회복
• **위기 대응**: 심한 우울감 시 즉시 대처할 수 있는 안전 계획

**재평가 권장:** 전문가 치료 시작 후 4-8주 간격으로 정기적 재평가를 통해 치료 효과를 모니터링하고 치료 계획을 조정하시기 바랍니다.`
                    : `현재 점수 ${total}점은 심각한 우울 증상을 나타냅니다. 이는 즉시 전문가의 개입이 필요한 수준으로, 일상생활에 상당한 지장을 초래할 수 있어 신속한 치료가 필요한 상태입니다.

**7가지 즉시 실행 방법:**
• **응급 치료**: 즉시 정신건강의학과 전문의 진료 예약
• **안전 계획**: 자해나 자살 생각 시 즉시 대처할 안전 계획 수립
• **약물 치료**: 의사 처방에 따른 항우울제 등 적절한 약물치료
• **집중 상담**: 주 1-2회 정기적인 전문가 상담 및 치료 시작
• **지지체계 활성화**: 가족과 주변인들에게 상황 알리고 24시간 지원 요청
• **생활 안전화**: 스트레스 요인 최소화하고 안정적 환경 조성
• **위기 연락망**: 응급 상황 시 이용할 수 있는 위기상담 전화 확보

**재평가 권장:** 치료 시작 후 1-2주 간격으로 집중적인 모니터링과 재평가를 통해 증상 호전도를 확인하고 치료 강도를 조정하시기 바랍니다.`
                )}
              </p>
            </div>
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
      <div className="space-y-4">
        <div className="grid md:grid-cols-4 gap-4">
          <Button 
            className="btn-brand h-16"
            onClick={() => window.open('/expert-hiring', '_self')}
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">전문가 고용하기</div>
              <div className="text-sm opacity-90">우울감 전문가</div>
            </div>
          </Button>

          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white h-16"
            onClick={() => navigate('/ai-counselor', { state: { assessmentResults: { ...results, testType: 'depression' } } })}
          >
            <Brain className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">AI 상담만</div>
              <div className="text-sm opacity-90">빠른 상담</div>
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
        
        {/* 텍스트 공유 버튼 */}
        <div className="flex justify-center">
          <Button onClick={handleShareText} variant="secondary" size="lg" className="w-full max-w-md">
            <Copy className="w-4 h-4 mr-2" />
            📋 텍스트로 복사하기
          </Button>
        </div>
      </div>

      {/* 다음 단계 제안 */}
      <NextStepSuggestion className="mb-6" />

      {/* 상품 추천 */}
      <ProductRecommendation 
        category="depression" 
        severity={severity}
      />

      {/* Additional Information */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">참고사항</h4>
        <p className="text-blue-800 text-sm leading-relaxed">
          이 체크는 우울증상 자가관찰을 위한 참고도구로, 전문적 평가를 대체할 수 없습니다. 
          정확한 진단과 치료를 위해서는 반드시 전문의와 상담하시기 바랍니다.
        </p>
      </Card>

      {/* 음성 기능 */}
      <VoiceFeature 
        title="우울증 검사 결과 음성 안내"
        text={`우울증 자가진단 결과를 알려드리겠습니다. 총점 ${total}점으로 ${severity} 수준입니다. 정확한 진단을 위해 전문의와 상담받으시기 바랍니다.`}
        type="result"
      />

      {/* 소셜 공유 */}
      <SocialShareButtons 
        title={`우울증 자가진단 결과: ${severity} (${average.toFixed(1)}점)`}
        description={`총점 ${total}점으로 ${severity} 수준입니다. 전문적인 도움을 받아보세요!`}
      />
      
      {/* 맞춤 추천 및 B2B 제안 */}
      <PersonalizedProductRecommendation 
        testType="depression"
        testResult={results}
      />
    </div>
  );
};

export default DepressionTestResult;