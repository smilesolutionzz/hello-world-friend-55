import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, ArrowLeft, RefreshCw, FileText, Brain, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface DevelopmentalScreeningResultProps {
  results: {
    answers: number[];
    total: number;
    ageGroup: string;
    useAIAnalysis?: boolean;
    // 기존 필드들은 AI 분석으로 대체됨
    concernLevel?: string;
    strengthAreas?: string[];
    challengeAreas?: string[];
  };
  onBack: () => void;
  onNewTest: () => void;
}

const DevelopmentalScreeningResult = ({ results, onBack, onNewTest }: DevelopmentalScreeningResultProps) => {
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const navigate = useNavigate();

  // AI 분석 실행
  useEffect(() => {
    if (results.useAIAnalysis) {
      generateAIAnalysis();
    }
  }, [results]);

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const { data, error } = await supabase.functions.invoke('developmental-screening-analyzer', {
        body: { 
          results: {
            answers: results.answers,
            ageGroup: results.ageGroup === '아동청소년' ? 'child' : 'adult',
            total: results.total
          },
          ageGroup: results.ageGroup === '아동청소년' ? 'child' : 'adult',
          age: null
        }
      });

      if (error) {
        console.error('AI analysis error:', error);
        setAnalysisError('AI 분석 중 오류가 발생했습니다.');
        return;
      }

      setAiAnalysis(data.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError('분석 요청 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConcernLevelColor = (level: string) => {
    switch (level) {
      case "minimal": return "text-green-600 bg-green-50";
      case "mild": return "text-blue-600 bg-blue-50";
      case "moderate": return "text-yellow-600 bg-yellow-50";
      case "significant": return "text-orange-600 bg-orange-50";
      case "high": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  // AI 분석 결과가 있으면 AI 결과를 사용, 없으면 기본 결과 사용
  const displayData = aiAnalysis || {
    overallRiskLevel: results.concernLevel || 'minimal',
    clinicalInterpretation: '기본 분석 결과입니다.',
    developmentalProfile: {
      strengths: results.strengthAreas || [],
      concernAreas: results.challengeAreas || []
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">
                AIH 발달특성 선별체크 결과
              </h1>
            </div>
            <p className="text-muted-foreground">
              AI 기반 전문가 수준의 발달 특성 분석 결과입니다
            </p>
          </div>

          {/* Summary Card */}
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">검사 결과 요약</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">{results.total}점</div>
                  <div className="text-sm text-muted-foreground">총점 (20점 만점)</div>
                </div>
                <div className="space-y-2">
                  <div className={`text-lg font-semibold px-3 py-1 rounded-full ${getConcernLevelColor(aiAnalysis?.overallRiskLevel || 'minimal')}`}>
                    {aiAnalysis?.overallRiskLevel === 'minimal' && '일반적 범위'}
                    {aiAnalysis?.overallRiskLevel === 'mild' && '경미한 관심'}
                    {aiAnalysis?.overallRiskLevel === 'moderate' && '중등도 관심'}
                    {aiAnalysis?.overallRiskLevel === 'significant' && '상당한 관심'}
                    {aiAnalysis?.overallRiskLevel === 'high' && '높은 관심'}
                    {!aiAnalysis?.overallRiskLevel && '분석 중'}
                  </div>
                  <div className="text-sm text-muted-foreground">위험도 평가</div>
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-gray-700">{results.ageGroup}</div>
                  <div className="text-sm text-muted-foreground">연령대</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI 분석 진행 중 표시 */}
          {isAnalyzing && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-blue-900 font-medium">AI 박사급 분석 진행 중...</span>
                </div>
                <p className="text-center text-sm text-blue-700 mt-2">
                  임상심리학 박사 수준의 전문 분석을 수행하고 있습니다.
                </p>
              </CardContent>
            </Card>
          )}

          {/* 분석 오류 표시 */}
          {analysisError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span className="text-red-900 font-medium">분석 오류</span>
                </div>
                <p className="text-center text-sm text-red-700 mt-2">
                  {analysisError}
                </p>
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={generateAIAnalysis}
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    다시 분석하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI 분석 결과 */}
          {aiAnalysis && (
            <>
              {/* 임상적 해석 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    AI 박사급 임상 해석
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {aiAnalysis.clinicalInterpretation}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 도메인별 분석 */}
              {aiAnalysis.domainAnalysis && aiAnalysis.domainAnalysis.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>영역별 세부 분석</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {aiAnalysis.domainAnalysis.map((domain: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-900">{domain.domain}</h4>
                          <Badge variant="outline">{domain.score}점</Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{domain.interpretation}</p>
                        {domain.recommendations && domain.recommendations.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-600">권장사항:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {domain.recommendations.map((rec: string, recIndex: number) => (
                                <li key={recIndex} className="flex items-start gap-2">
                                  <span className="text-blue-500">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* 강점과 관심 영역 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 강점 영역 */}
                {aiAnalysis.developmentalProfile?.strengths?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        강점 영역
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {aiAnalysis.developmentalProfile.strengths.map((strength: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-green-800">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 관심 영역 */}
                {aiAnalysis.developmentalProfile?.concernAreas?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-700">
                        <AlertTriangle className="w-5 h-5" />
                        관심 영역
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {aiAnalysis.developmentalProfile.concernAreas.map((concern: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-orange-800">{concern}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* 권장사항 */}
              {aiAnalysis.recommendations && (
                <Card>
                  <CardHeader>
                    <CardTitle>전문가 권장사항</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {aiAnalysis.recommendations.immediate?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-700 mb-2">즉시 실행 권장</h4>
                        <ul className="space-y-1">
                          {aiAnalysis.recommendations.immediate.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-red-500 font-bold">•</span>
                              <span className="text-sm text-red-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiAnalysis.recommendations.shortTerm?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-orange-700 mb-2">단기 목표 (1-3개월)</h4>
                        <ul className="space-y-1">
                          {aiAnalysis.recommendations.shortTerm.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-orange-500">•</span>
                              <span className="text-sm text-orange-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiAnalysis.recommendations.longTerm?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-blue-700 mb-2">장기 계획 (6개월 이상)</h4>
                        <ul className="space-y-1">
                          {aiAnalysis.recommendations.longTerm.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500">•</span>
                              <span className="text-sm text-blue-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiAnalysis.recommendations.referrals?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-purple-700 mb-2">전문가 의뢰 권장</h4>
                        <ul className="space-y-1">
                          {aiAnalysis.recommendations.referrals.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-purple-500">•</span>
                              <span className="text-sm text-purple-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 진단적 고려사항 */}
              {aiAnalysis.diagnosticConsiderations?.length > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-amber-800">진단적 고려사항</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {aiAnalysis.diagnosticConsiderations.map((consideration: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-amber-800">{consideration}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-amber-700 mt-3">
                      ⚠️ 이는 참고사항이며, 정확한 진단을 위해서는 반드시 전문의의 종합적인 평가가 필요합니다.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* 신뢰도 정보 */}
              {aiAnalysis.confidenceLevel && (
                <Card className="border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">분석 신뢰도</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={aiAnalysis.confidenceLevel * 100} 
                          className="w-24 h-2"
                        />
                        <span className="text-sm text-gray-600">
                          {Math.round(aiAnalysis.confidenceLevel * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              뒤로가기
            </Button>
            <Button 
              onClick={onNewTest}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              새로운 검사
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/iep-generator')}
              className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <FileText className="w-4 h-4" />
              IEP 생성하기
            </Button>
          </div>

          {/* Professional Notice */}
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600 text-center leading-relaxed">
                🤖 본 분석은 AI 기반 임상심리학 박사 수준의 전문 분석 시스템을 통해 제공되었습니다. 
                선별 검사 목적으로 개발되었으며, 최종 진단을 위해서는 반드시 의료진의 직접적인 종합 평가가 필요합니다. 
                결과에 대한 상담이나 추가 정보가 필요하시면 전문 기관에 문의하시기 바랍니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentalScreeningResult;