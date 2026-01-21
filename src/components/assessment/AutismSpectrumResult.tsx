import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Save, Brain, Users, Repeat, Volume2, MessageCircle, Target, AlertTriangle, CheckCircle, Info, Phone, Bell, ExternalLink, Siren, Crown, Wallet, Lock, Sparkles } from "lucide-react";
import { useTestResultActions } from "@/hooks/useTestResultActions";
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useNavigate } from "react-router-dom";
import RedFlagAlertDialog from "./RedFlagAlertDialog";
import { useToast } from "@/hooks/use-toast";
import { CashBalanceDisplay } from '@/components/paywall/CashBalanceDisplay';
import { BlurredContent } from '@/components/paywall/BlurredContent';
import { useSubscription } from '@/hooks/useSubscription';

interface AutismSpectrumResultProps {
  results: any;
  answers: Record<string, string>;
  onBack: () => void;
}

const AutismSpectrumResult: React.FC<AutismSpectrumResultProps> = ({ results, answers, onBack }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestResultActions();

  // 위험도가 높음인 경우 위기 알림 표시
  useEffect(() => {
    const isHighRisk = results.scores?.riskLevel === "높음" || 
                       results.crisisIndicators?.needsImmediateAttention;
    
    if (isHighRisk) {
      setShowCrisisAlert(true);
      setIsAlarmPlaying(true);
      
      // 알람 사운드 효과 (진동 패턴)
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
      
      // 긴급 토스트 알림
      toast({
        title: "⚠️ 즉각적인 전문가 상담 필요",
        description: "검사 결과 전문가와의 상담이 시급히 필요합니다.",
        variant: "destructive",
        duration: 10000,
      });
      
      // 5초 후 알람 효과 중지
      const timer = setTimeout(() => {
        setIsAlarmPlaying(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [results, toast]);

  // 자동 저장
  useAutoSaveTestResult({
    testType: '자폐스펙트럼 선별검사',
    results: {
      categoryScores: results.categoryScores,
      totalScore: results.totalScore,
      riskLevel: results.riskLevel,
    },
    analysis: results.overallInterpretation,
    severity: results.riskLevel === 'high' ? '높음' : results.riskLevel === 'moderate' ? '보통' : '양호',
    ageGroup: 'child',
  });

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

  const isHighRisk = results.scores?.riskLevel === "높음" || results.crisisIndicators?.needsImmediateAttention;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/20 to-purple-50/20">
      {/* 위기 경고 다이얼로그 */}
      <RedFlagAlertDialog
        isOpen={showCrisisAlert}
        onClose={() => setShowCrisisAlert(false)}
        redFlagResult={{
          hasRedFlags: isHighRisk,
          flags: isHighRisk ? [
            {
              type: 'high_risk_score',
              severity: 'critical' as const,
              message: '신경발달 검사 결과 즉각적인 전문가 상담이 필요합니다',
              description: results.crisisIndicators?.crisisMessage || '검사 결과에서 전문가의 평가가 필요한 소견이 발견되었습니다. 가까운 발달센터나 전문의와 상담을 권장드립니다.'
            }
          ] : [],
          overallSeverity: 'critical' as const
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* 고위험 경고 배너 (알람 효과) */}
        {isHighRisk && (
          <div className={`mb-6 p-4 rounded-xl border-2 border-red-500 bg-gradient-to-r from-red-50 to-orange-50 ${isAlarmPlaying ? 'animate-pulse' : ''}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full bg-red-500 text-white ${isAlarmPlaying ? 'animate-bounce' : ''}`}>
                <Siren className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                  <Bell className={`w-5 h-5 ${isAlarmPlaying ? 'animate-ping' : ''}`} />
                  ⚠️ 즉각적인 전문가 상담이 필요합니다
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {results.crisisIndicators?.crisisMessage || '검사 결과 전문가의 정밀 평가가 시급히 필요합니다.'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => navigate('/expert-hiring')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  전문가 상담
                </Button>
                <Button
                  onClick={() => window.location.href = 'tel:1644-8295'}
                  variant="outline"
                  className="border-red-500 text-red-700 hover:bg-red-50"
                  size="sm"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  긴급 상담
                </Button>
              </div>
            </div>
            
            {/* 긴급 연락처 */}
            {results.crisisIndicators?.emergencyContacts?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-red-200">
                <p className="text-sm font-medium text-red-800 mb-2">🚨 긴급 연락처</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {results.crisisIndicators.emergencyContacts.map((contact: string, idx: number) => (
                    <a
                      key={idx}
                      href={`tel:${contact.split(' ').pop()}`}
                      className="flex items-center gap-2 text-sm text-red-700 hover:text-red-900 bg-white/50 rounded-lg px-3 py-2"
                    >
                      <Phone className="w-4 h-4" />
                      {contact}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Header - 모바일 최적화 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          <div className="text-center w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              검사 결과
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">AIH 신경발달 조기선별검사</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <Button 
              onClick={handleSaveResult}
              disabled={isSaving}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 flex-1 sm:flex-initial"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{isSaving ? "저장 중..." : "결과 저장"}</span>
              <span className="sm:hidden">{isSaving ? "저장..." : "저장"}</span>
            </Button>
            <Button 
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              size="sm"
              className="flex items-center gap-2 flex-1 sm:flex-initial"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{isGeneratingPDF ? "생성 중..." : "PDF 다운로드"}</span>
              <span className="sm:hidden">{isGeneratingPDF ? "생성..." : "PDF"}</span>
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
              <div className="space-y-4">
                {results.scores?.categories && Object.entries(results.scores.categories).map(([category, score]) => {
                  const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Target;
                  const categoryName = categoryLabels[category as keyof typeof categoryLabels] || category;
                  const scoreValue = score as number;
                  const percentage = (scoreValue / 4.0) * 100;
                  
                  // Determine severity level based on score
                  let severityLevel = "정상";
                  let severityColor = "text-green-700";
                  if (scoreValue >= 2.0 && scoreValue < 2.5) {
                    severityLevel = "경계선";
                    severityColor = "text-yellow-700";
                  } else if (scoreValue >= 2.5 && scoreValue < 3.0) {
                    severityLevel = "경도";
                    severityColor = "text-orange-700";
                  } else if (scoreValue >= 3.0 && scoreValue < 3.5) {
                    severityLevel = "중등도";
                    severityColor = "text-red-700";
                  } else if (scoreValue >= 3.5) {
                    severityLevel = "고도";
                    severityColor = "text-red-900";
                  }
                  
                  return (
                    <div key={category} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-50">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{categoryName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {categoryName} 영역에서 {(score as number).toFixed(2)}점을 기록하였습니다.
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {(score as number).toFixed(2)}
                          </div>
                          <div className={`text-sm font-semibold ${severityColor}`}>
                            {severityLevel}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Progress value={percentage} className="h-3" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0.0 (정상)</span>
                          <span>2.0 (경계선)</span>
                          <span>4.0 (고도)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Overall Interpretation - 프리미엄 전문가 해석 */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl text-purple-900">🧠 AI 전문가 종합 해석</CardTitle>
                  <CardDescription className="text-purple-600">AI 기반 신경발달 전문 분석 시스템</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-white/80 rounded-xl p-5 border border-purple-100 shadow-inner">
                <p className="text-base leading-relaxed whitespace-pre-line text-gray-800">
                  {results.overallInterpretation}
                </p>
                {results.overallInterpretation && results.overallInterpretation.length < 300 && (
                  <p className="mt-4 text-sm text-purple-600 italic">
                    * 더 자세한 분석이 필요하시면 검사를 다시 진행해주세요.
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-purple-500">
                <span>분석 글자 수: {results.overallInterpretation?.length || 0}자</span>
                <span>Powered by Advanced AI</span>
              </div>
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