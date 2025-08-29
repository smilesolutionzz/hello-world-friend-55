import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, MessageSquare, Users, Crown, Sparkles, Heart, Award, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useTestResultActions } from "@/hooks/useTestResultActions";
import ProductRecommendation from "../ProductRecommendation";
import LegalSafetyNotice from "../LegalSafetyNotice";
import { Skeleton } from "@/components/ui/skeleton";

interface ParentingStyleResultProps {
  results: any;
  onBack: () => void;
  onStartAIChat?: () => void;
  onStartRealTimeChat?: () => void;
}

const ParentingStyleResult = ({ 
  results, 
  onBack, 
  onStartAIChat, 
  onStartRealTimeChat 
}: ParentingStyleResultProps) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const { generatePDFReport, saveTestResult } = useTestResultActions();

  useEffect(() => {
    generateAnalysis();
    saveResults();
  }, []);

  const generateAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      
      const { data, error } = await supabase.functions.invoke('parenting-style-analyzer', {
        body: {
          results: results.scores,
          assessmentType: 'parentingStyle',
          childAge: results.childAge,
          childGender: results.childGender
        }
      });

      if (error) {
        console.error('분석 생성 오류:', error);
        setAnalysis("분석을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      } else {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('분석 요청 오류:', error);
      setAnalysis("분석을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveResults = async () => {
    await saveTestResult({
      testType: 'parenting_style',
      results: results.scores,
      analysis: '부모양육태도 검사 완료',
      testInfo: {
        childAge: results.childAge,
        childGender: results.childGender,
        totalQuestions: results.totalQuestions
      }
    });
  };

  const handlePDFGeneration = async () => {
    await generatePDFReport({
      testType: 'parenting_style',
      results: results.scores,
      analysis,
      testInfo: {
        childAge: results.childAge,
        childGender: results.childGender
      }
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 3.5) return "text-green-600";
    if (score >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLevel = (score: number) => {
    if (score >= 3.5) return "높음";
    if (score >= 2.5) return "보통";
    return "낮음";
  };

  const chartData = Object.entries(results.scores).map(([category, score]) => ({
    name: category === 'warmth_acceptance' ? '온정수용' :
          category === 'behavioral_control' ? '행동통제' :
          category === 'psychological_control' ? '심리통제' :
          category === 'autonomy_support' ? '자율성지지' :
          category === 'communication_support' ? '의사소통지지' : category,
    score: Number(score),
    fullMark: 4
  }));

  const radarData = chartData;

  const averageScore = Object.values(results.scores as Record<string, number>).reduce((sum: number, score: number) => sum + score, 0) / Object.keys(results.scores).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-blue-50/20 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                부모양육태도 검사 결과
              </h1>
            </div>
            <p className="text-muted-foreground">과학적 양육태도 심층분석</p>
          </div>
          
          <div className="w-20" />
        </div>

        <LegalSafetyNotice onAccept={() => {}} testType="parenting_style" />

        {/* Results Summary */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card className="border-2 border-purple-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <CardTitle className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-red-500" />
                양육태도 종합 결과
                <div className="ml-auto flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-lg font-bold">평균 {averageScore.toFixed(1)}점</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Bar Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    영역별 점수
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis domain={[0, 4]} />
                      <Tooltip 
                        formatter={(value: any) => [`${value}점`, '점수']}
                        labelStyle={{ color: '#333' }}
                      />
                      <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Radar Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    양육태도 패턴
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 4]} tick={false} />
                      <Radar
                        name="점수"
                        dataKey="score"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Scores */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                영역별 상세 분석
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(results.scores).map(([category, score]) => {
                  const categoryInfo = {
                    warmth_acceptance: { name: '온정수용', icon: Heart, description: '아이에 대한 따뜻함과 수용' },
                    behavioral_control: { name: '행동통제', icon: Target, description: '일관된 규칙과 기준 제시' },
                    psychological_control: { name: '심리통제', icon: Users, description: '아이의 감정과 생각 통제' },
                    autonomy_support: { name: '자율성지지', icon: Award, description: '독립성과 자기결정권 지원' },
                    communication_support: { name: '의사소통지지', icon: MessageSquare, description: '개방적이고 지지적인 소통' }
                  };

                  const info = categoryInfo[category as keyof typeof categoryInfo] || { name: category, icon: Target, description: '' };
                  const Icon = info.icon;

                  return (
                    <div key={category} className="p-4 border rounded-lg bg-white/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold">{info.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{info.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">점수</span>
                          <span className={`font-bold ${getScoreColor(Number(score))}`}>
                            {Number(score).toFixed(1)}점
                          </span>
                        </div>
                        <Progress value={(Number(score) / 4) * 100} className="h-2" />
                        <div className="text-center">
                          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                            Number(score) >= 3.5 ? 'bg-green-100 text-green-800' :
                            Number(score) >= 2.5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getScoreLevel(Number(score))}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                AI 전문가 분석
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isAnalyzing ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-purple-600">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>AI가 양육태도를 심층 분석하고 있습니다...</span>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="prose prose-purple max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {analysis}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={handlePDFGeneration}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF 다운로드
            </Button>
            
            {onStartRealTimeChat && (
              <Button
                onClick={onStartRealTimeChat}
                variant="outline"
                className="border-purple-300 hover:bg-purple-50"
              >
                <Users className="w-4 h-4 mr-2" />
                전문가 상담
              </Button>
            )}

            {onStartAIChat && (
              <Button
                onClick={onStartAIChat}
                variant="outline"
                className="border-blue-300 hover:bg-blue-50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                AI 상담
              </Button>
            )}

            <Button
              onClick={onBack}
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              다른 검사 하기
            </Button>
          </div>
        </div>

        <ProductRecommendation category="parenting" />

        {/* Professional Notice */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h4 className="font-semibold text-blue-900 mb-2">전문 양육태도 검사 안내</h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              본 검사는 부모교육학 이론에 근거한 양육태도 분석 도구입니다. 
              결과는 참고용이며, 심화 부모교육이나 가족상담이 필요한 경우 전문가와 상담하시기 바랍니다.
              자녀의 건강한 성장을 위한 양육 여정을 응원합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentingStyleResult;