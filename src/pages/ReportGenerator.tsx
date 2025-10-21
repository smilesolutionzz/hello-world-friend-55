import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import html2pdf from 'html2pdf.js';
import {
  FileText,
  Download,
  Loader2,
  Sparkles,
  User,
  Calendar,
  FileCheck,
  Brain,
  Heart,
  TrendingUp,
  Users,
  MessageSquare,
  Target,
  Activity,
  BarChart3,
  Clock
} from 'lucide-react';

const ReportGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const { toast } = useToast();

  // 입력 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    testDate: '',
    observationNotes: '',
    testResults: '',
    concerns: ''
  });

  const generateReport = async () => {
    if (!formData.observationNotes && !formData.testResults && !formData.concerns) {
      toast({
        title: "입력 필요",
        description: "관찰 내용, 검사 결과 또는 고민 중 최소 하나를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const inputText = `
[대상자 정보]
이름: ${formData.name || '미입력'}
나이: ${formData.age || '미입력'}
성별: ${formData.gender || '미입력'}
검사일: ${formData.testDate || '미입력'}

[관찰 내용]
${formData.observationNotes || '없음'}

[검사 결과]
${formData.testResults || '없음'}

[주요 고민]
${formData.concerns || '없음'}
`;

      const { data, error } = await supabase.functions.invoke('instant-ai-analysis', {
        body: { inputText: inputText.trim() }
      });

      if (error) throw error;

      if (data && data.analysis) {
        setReportData({
          ...data.analysis,
          reportImage: data.reportImage,
          personalInfo: formData,
          generatedAt: new Date().toISOString()
        });

        toast({
          title: "리포트 생성 완료!",
          description: "종합 분석 리포트가 생성되었습니다.",
        });
      }
    } catch (error) {
      console.error('리포트 생성 오류:', error);
      toast({
        title: "생성 실패",
        description: "리포트 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `종합분석리포트_${formData.name || '미입력'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();

    toast({
      title: "PDF 다운로드 시작",
      description: "리포트를 PDF로 저장하고 있습니다.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">자동 리포트 생성기</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black leading-tight">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              종합 분석 리포트 생성
            </span>
          </h1>

          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            관찰 내용과 검사 결과를 입력하면 AI가 9가지 전문 리포트를 자동으로 생성합니다
          </p>
        </div>

        {!reportData ? (
          /* 입력 폼 */
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  대상자 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      placeholder="이름을 입력하세요"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">나이</Label>
                    <Input
                      id="age"
                      placeholder="예: 5세, 12세, 30세"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">성별</Label>
                    <Input
                      id="gender"
                      placeholder="남 / 여"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="testDate">검사일</Label>
                    <Input
                      id="testDate"
                      type="date"
                      value={formData.testDate}
                      onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-500" />
                  관찰 내용 및 검사 결과
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="observationNotes">관찰 내용</Label>
                  <Textarea
                    id="observationNotes"
                    placeholder="일상생활에서 관찰한 행동, 패턴, 특징 등을 자유롭게 작성하세요..."
                    className="min-h-[150px]"
                    value={formData.observationNotes}
                    onChange={(e) => setFormData({ ...formData, observationNotes: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testResults">검사 결과</Label>
                  <Textarea
                    id="testResults"
                    placeholder="실시한 심리검사, 발달검사 결과를 입력하세요..."
                    className="min-h-[150px]"
                    value={formData.testResults}
                    onChange={(e) => setFormData({ ...formData, testResults: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="concerns">주요 고민</Label>
                  <Textarea
                    id="concerns"
                    placeholder="현재 가장 걱정되는 부분이나 개선하고 싶은 점을 작성하세요..."
                    className="min-h-[100px]"
                    value={formData.concerns}
                    onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={generateReport}
              disabled={isGenerating}
              size="lg"
              className="w-full h-16 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  AI가 리포트 생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-2" />
                  종합 리포트 생성하기
                </>
              )}
            </Button>
          </div>
        ) : (
          /* 생성된 리포트 */
          <div className="space-y-6">
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setReportData(null)}
                variant="outline"
              >
                새 리포트 작성
              </Button>
              <Button
                onClick={downloadPDF}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF 다운로드
              </Button>
            </div>

            {/* PDF 생성용 콘텐츠 */}
            <div id="report-content" className="bg-white text-black p-8 space-y-8">
              {/* 리포트 표지 */}
              <div className="text-center space-y-6 pb-8 border-b-2 border-gray-200">
                {reportData.reportImage && (
                  <img 
                    src={reportData.reportImage} 
                    alt="리포트 커버"
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  />
                )}
                <h1 className="text-4xl font-black text-gray-900">종합 분석 리포트</h1>
                <div className="space-y-2">
                  <p className="text-lg"><strong>이름:</strong> {reportData.personalInfo.name || '미입력'}</p>
                  <p className="text-lg"><strong>나이:</strong> {reportData.personalInfo.age || '미입력'}</p>
                  <p className="text-lg"><strong>성별:</strong> {reportData.personalInfo.gender || '미입력'}</p>
                  <p className="text-lg"><strong>검사일:</strong> {reportData.personalInfo.testDate || '미입력'}</p>
                  <p className="text-lg"><strong>보고서 생성일:</strong> {new Date(reportData.generatedAt).toLocaleDateString('ko-KR')}</p>
                </div>
                <Badge className="text-lg px-4 py-2">
                  분석 신뢰도: {reportData.confidence}%
                </Badge>
              </div>

              {/* 분석 유형 및 심각도 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                  <Target className="w-6 h-6" />
                  분석 결과 요약
                </h2>
                <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                  <p className="text-lg"><strong>유형:</strong> {reportData.type}</p>
                  <p className="text-lg"><strong>심각도:</strong> {reportData.severity}</p>
                  <div className="pt-4">
                    <p className="font-semibold text-gray-900 mb-2">전문가 조언:</p>
                    <p className="text-gray-700 leading-relaxed">{reportData.detailedAdvice}</p>
                  </div>
                </div>
              </div>

              {/* 9가지 종합 리포트 */}
              {reportData.comprehensiveReports && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold text-center text-gray-900 pt-8 border-t-2 border-gray-200">
                    9가지 전문 분석 리포트
                  </h2>

                  {/* 1. 발달 종합 평가 */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2 text-blue-600">
                      <Brain className="w-6 h-6" />
                      1. 발달 종합 평가
                    </h3>
                    <div className="bg-blue-50 p-6 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <p><strong>인지 발달:</strong> {reportData.comprehensiveReports.developmentAssessment?.cognitive}점</p>
                        <p><strong>언어 발달:</strong> {reportData.comprehensiveReports.developmentAssessment?.language}점</p>
                        <p><strong>운동 발달:</strong> {reportData.comprehensiveReports.developmentAssessment?.motor}점</p>
                        <p><strong>사회성 발달:</strong> {reportData.comprehensiveReports.developmentAssessment?.social}점</p>
                      </div>
                      <p className="pt-4"><strong>종합 점수:</strong> {reportData.comprehensiveReports.developmentAssessment?.overall}점</p>
                      <p className="pt-2 text-gray-700">{reportData.comprehensiveReports.developmentAssessment?.summary}</p>
                    </div>
                  </div>

                  {/* 2. 심리 상태 분석 */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2 text-purple-600">
                      <Heart className="w-6 h-6" />
                      2. 심리 상태 분석
                    </h3>
                    <div className="bg-purple-50 p-6 rounded-lg space-y-3">
                      <p><strong>정서적 안정성:</strong> {reportData.comprehensiveReports.psychologicalAnalysis?.emotionalStability}점</p>
                      <p><strong>스트레스 수준:</strong> {reportData.comprehensiveReports.psychologicalAnalysis?.stressLevel}점</p>
                      <p><strong>심리적 건강도:</strong> {reportData.comprehensiveReports.psychologicalAnalysis?.mentalHealth}점</p>
                      <p className="pt-2 text-gray-700">{reportData.comprehensiveReports.psychologicalAnalysis?.summary}</p>
                    </div>
                  </div>

                  {/* 3. 강점/약점 분석 */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2 text-green-600">
                      <TrendingUp className="w-6 h-6" />
                      3. 강점/약점 분석
                    </h3>
                    <div className="bg-green-50 p-6 rounded-lg space-y-4">
                      <div>
                        <p className="font-semibold text-green-700 mb-2">강점:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {reportData.comprehensiveReports.strengthsWeaknesses?.strengths?.map((item: string, i: number) => (
                            <li key={i} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-red-700 mb-2">개선 영역:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {reportData.comprehensiveReports.strengthsWeaknesses?.weaknesses?.map((item: string, i: number) => (
                            <li key={i} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="pt-2"><strong>성장 방향:</strong> {reportData.comprehensiveReports.strengthsWeaknesses?.growthDirection}</p>
                    </div>
                  </div>

                  {/* 4. 맞춤형 활동 제안 */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2 text-orange-600">
                      <Activity className="w-6 h-6" />
                      4. 맞춤형 활동 제안
                    </h3>
                    <div className="bg-orange-50 p-6 rounded-lg">
                      <ul className="space-y-2">
                        {reportData.comprehensiveReports.customActivities?.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="font-bold text-orange-600">{i + 1}.</span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 5. 발달 로드맵 */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2 text-indigo-600">
                      <Clock className="w-6 h-6" />
                      5. 발달 로드맵
                    </h3>
                    <div className="bg-indigo-50 p-6 rounded-lg space-y-4">
                      <div>
                        <p className="font-semibold text-indigo-700 mb-2">단기 목표 (1-3개월):</p>
                        <ul className="list-disc list-inside space-y-1">
                          {reportData.comprehensiveReports.developmentRoadmap?.shortTerm?.map((item: string, i: number) => (
                            <li key={i} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-indigo-700 mb-2">중기 목표 (3-6개월):</p>
                        <ul className="list-disc list-inside space-y-1">
                          {reportData.comprehensiveReports.developmentRoadmap?.mediumTerm?.map((item: string, i: number) => (
                            <li key={i} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-indigo-700 mb-2">장기 목표 (6-12개월):</p>
                        <ul className="list-disc list-inside space-y-1">
                          {reportData.comprehensiveReports.developmentRoadmap?.longTerm?.map((item: string, i: number) => (
                            <li key={i} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 6. 또래 비교 분석 */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2 text-pink-600">
                      <Users className="w-6 h-6" />
                      6. 또래 비교 분석
                    </h3>
                    <div className="bg-pink-50 p-6 rounded-lg space-y-3">
                      <p><strong>연령대:</strong> {reportData.comprehensiveReports.peerComparison?.ageGroup}</p>
                      <p><strong>백분위:</strong> {reportData.comprehensiveReports.peerComparison?.percentile}%</p>
                      <p className="pt-2 text-gray-700">{reportData.comprehensiveReports.peerComparison?.comparison}</p>
                    </div>
                  </div>

                  {/* 7. 전문가 소견서 */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2 text-red-600">
                      <MessageSquare className="w-6 h-6" />
                      7. 전문가 소견서
                    </h3>
                    <div className="bg-red-50 p-6 rounded-lg space-y-3">
                      <p><strong>전문 개입 필요성:</strong> {reportData.comprehensiveReports.expertOpinion?.interventionNeeded}</p>
                      <p><strong>시급성:</strong> {reportData.comprehensiveReports.expertOpinion?.urgency}</p>
                      <div className="pt-2">
                        <p className="font-semibold text-red-700 mb-2">전문가 추천사항:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {reportData.comprehensiveReports.expertOpinion?.recommendations?.map((item: string, i: number) => (
                            <li key={i} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 8. 가족 지원 가이드 */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2 text-teal-600">
                      <Heart className="w-6 h-6" />
                      8. 가족 지원 가이드
                    </h3>
                    <div className="bg-teal-50 p-6 rounded-lg space-y-3">
                      <div>
                        <p className="font-semibold text-teal-700 mb-2">부모/보호자 실천 팁:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {reportData.comprehensiveReports.familySupport?.parentingTips?.map((item: string, i: number) => (
                            <li key={i} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="pt-2"><strong>효과적인 소통 방법:</strong> {reportData.comprehensiveReports.familySupport?.communicationGuide}</p>
                    </div>
                  </div>

                  {/* 9. 장기 발달 예측 */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2 text-cyan-600">
                      <BarChart3 className="w-6 h-6" />
                      9. 장기 발달 예측
                    </h3>
                    <div className="bg-cyan-50 p-6 rounded-lg space-y-3">
                      <p><strong>향후 발달 경향성:</strong> {reportData.comprehensiveReports.longTermPrediction?.developmentTrend}</p>
                      <p><strong>잠재력 평가:</strong> {reportData.comprehensiveReports.longTermPrediction?.potential}점</p>
                      <p className="pt-2 text-gray-700">{reportData.comprehensiveReports.longTermPrediction?.forecast}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 추천 사항 */}
              <div className="space-y-4 pt-8 border-t-2 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">추천 솔루션</h2>
                <ul className="space-y-2">
                  {reportData.recommendations?.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-blue-600">{i + 1}.</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 푸터 */}
              <div className="text-center pt-8 border-t-2 border-gray-200">
                <p className="text-sm text-gray-500">
                  본 리포트는 AI 기반 자동 분석 결과이며, 전문가의 정확한 진단을 대체할 수 없습니다.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  정확한 평가와 치료를 위해서는 전문가와의 상담을 권장드립니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportGenerator;
