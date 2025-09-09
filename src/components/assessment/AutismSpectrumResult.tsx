import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Save, Brain, Users, Repeat, Volume2, MessageCircle, Target, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useTestResultActions } from "@/hooks/useTestResultActions";

interface AutismSpectrumResultProps {
  results: any;
  answers: Record<string, string>;
  onBack: () => void;
}

const AutismSpectrumResult: React.FC<AutismSpectrumResultProps> = ({ results, answers, onBack }) => {
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestResultActions();

  const categoryIcons = {
    social_communication: Users,
    restricted_repetitive: Repeat,
    sensory_processing: Volume2,
    communication_language: MessageCircle,
    adaptive_functioning: Target
  };

  const categoryLabels = {
    social_communication: "사회적 소통",
    restricted_repetitive: "제한적 반복행동",
    sensory_processing: "감각처리",
    communication_language: "의사소통 언어",
    adaptive_functioning: "적응기능"
  };

  const handleGeneratePDF = async () => {
    await generatePDFReport({
      testType: 'autism_spectrum_screening',
      results: results,
      analysis: results.overallInterpretation,
      testInfo: {
        title: "AIH 신경발달 조기선별검사",
        subtitle: "ASES-AIH (Autism Spectrum Early Screening)"
      }
    });
  };

  const handleSaveResult = async () => {
    await saveTestResult({
      testType: 'autism_spectrum_screening',
      results: results,
      analysis: results.overallInterpretation,
      testInfo: {
        title: "AIH 신경발달 조기선별검사",
        subtitle: "ASES-AIH (Autism Spectrum Early Screening)"
      },
      ageGroup: "성인"
    });
  };

  const getRiskLevelInfo = (level: string) => {
    switch (level) {
      case "낮음":
        return { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle };
      case "주의":
        return { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertTriangle };
      case "높음":
        return { color: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle };
      default:
        return { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Info };
    }
  };

  const riskInfo = getRiskLevelInfo(results.scores?.riskLevel || "알 수 없음");
  const RiskIcon = riskInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/20 to-purple-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              검사 결과
            </h1>
            <p className="text-sm text-muted-foreground">AIH 신경발달 조기선별검사</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSaveResult}
              disabled={isSaving}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "저장 중..." : "결과 저장"}
            </Button>
            <Button 
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isGeneratingPDF ? "생성 중..." : "PDF 다운로드"}
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Overall Score */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-4 rounded-full bg-blue-100">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">종합 결과</CardTitle>
                  <CardDescription>ASES-AIH 전체 점수</CardDescription>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {results.scores?.overall?.toFixed(2) || "N/A"} / 4.0
                  </div>
                  <Badge className={`${riskInfo.color} flex items-center gap-2 text-lg px-4 py-2`}>
                    <RiskIcon className="w-5 h-5" />
                    위험도: {results.scores?.riskLevel || "알 수 없음"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Category Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                영역별 상세 결과
              </CardTitle>
              <CardDescription>각 영역의 세부 점수 분석</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.scores?.categories && Object.entries(results.scores.categories).map(([category, score]) => {
                  const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Target;
                  const categoryName = categoryLabels[category as keyof typeof categoryLabels] || category;
                  const percentage = ((score as number) / 4.0) * 100;
                  
                  return (
                    <Card key={category} className="border border-gray-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-blue-50">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{categoryName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {(score as number).toFixed(2)} / 4.0
                            </p>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Overall Interpretation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                전문가 종합 해석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                {results.overallInterpretation}
              </p>
            </CardContent>
          </Card>

          {/* Category Analysis */}
          {results.categoryAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>영역별 상세 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(results.categoryAnalysis).map(([category, analysis]) => {
                    const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Target;
                    const categoryName = categoryLabels[category as keyof typeof categoryLabels] || category;
                    
                    return (
                      <div key={category} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold">{categoryName}</h4>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{analysis as string}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths and Challenges */}
          {results.strengthsAndChallenges && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    강점 영역
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.strengthsAndChallenges.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <AlertTriangle className="w-5 h-5" />
                    도전 영역
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.strengthsAndChallenges.challenges.map((challenge: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recommendations */}
          {results.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle>권장 사항</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-700">즉시 권장사항</h4>
                    <ul className="space-y-2">
                      {results.recommendations.immediate.map((item: string, index: number) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-purple-700">장기 권장사항</h4>
                    <ul className="space-y-2">
                      {results.recommendations.longterm.map((item: string, index: number) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-red-700">전문가 상담</h4>
                    <ul className="space-y-2">
                      {results.recommendations.professional.map((item: string, index: number) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Early Intervention */}
          {results.earlyIntervention && (
            <Card>
              <CardHeader>
                <CardTitle>조기 개입 가이드</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-green-700">가정에서의 전략</h4>
                    <ul className="space-y-2">
                      {results.earlyIntervention.homeStrategies.map((item: string, index: number) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-700">교육적 지원</h4>
                    <ul className="space-y-2">
                      {results.earlyIntervention.educationalSupport.map((item: string, index: number) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-purple-700">추천 치료</h4>
                    <ul className="space-y-2">
                      {results.earlyIntervention.therapies.map((item: string, index: number) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Follow-up Guidelines */}
          {results.followUpGuidelines && (
            <Card>
              <CardHeader>
                <CardTitle>추후 관리 가이드라인</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">추후 평가 권장 시기</h4>
                    <p className="text-sm text-muted-foreground">{results.followUpGuidelines.timeline}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-red-700">주의 신호</h4>
                      <ul className="space-y-2">
                        {results.followUpGuidelines.redFlags.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-blue-700">활용 가능한 자원</h4>
                      <ul className="space-y-2">
                        {results.followUpGuidelines.resources.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">중요 안내사항</h4>
                  <p className="text-sm text-yellow-700 leading-relaxed">
                    {results.disclaimer}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AutismSpectrumResult;