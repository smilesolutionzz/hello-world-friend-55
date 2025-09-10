import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, MessageCircle, Users, Brain } from "lucide-react";
import { ImageGenerator } from "@/components/ai-image/ImageGenerator";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProductRecommendation from "@/components/ProductRecommendation";
import { useTestResultActions } from '@/hooks/useTestResultActions';
import { NextStepSuggestion } from '@/components/onboarding/NextStepSuggestion';
import ShareResultButton from '@/components/ShareResultButton';

interface AdhdTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    ageGroup: string;
    severity: string;
  };
  onBack: () => void;
  onStartAIChat?: () => void;
  onStartRealTimeChat?: () => void;
}

const AdhdTestResult = ({ results, onBack, onStartAIChat, onStartRealTimeChat }: AdhdTestResultProps) => {
  const { total, average, ageGroup, severity, answers } = results;
  const navigate = useNavigate();
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestResultActions();
  
  const getOverallEvaluation = (severity: string) => {
    if (severity === "정상 범위") {
      return {
        level: "Normal Range (정상 범위)",
        description: "ADHD 증상이 일반적인 범위 내에 있습니다.",
        color: "bg-green-100 text-green-800 border-green-200"
      };
    } else if (severity === "경계선 수준") {
      return {
        level: "Borderline Level (경계선 수준)",
        description: "일부 ADHD 증상이 나타날 수 있어 관찰이 필요합니다.",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200"
      };
    } else if (severity === "중등도 수준") {
      return {
        level: "Moderate Level (중등도 수준)",
        description: "ADHD 증상이 중등도 수준으로 전문가 상담을 권장합니다.",
        color: "bg-orange-100 text-orange-800 border-orange-200"
      };
    } else {
      return {
        level: "Severe Level (심각한 수준)",
        description: "ADHD 증상이 심각한 수준으로 즉시 전문가 도움이 필요합니다.",
        color: "bg-red-100 text-red-800 border-red-200"
      };
    }
  };
  
  // ADHD 증상 영역별 분석 (부주의, 과잉행동-충동성)
  const inattentionScore = results.answers.slice(0, 9).reduce((sum, score) => sum + score, 0);
  const hyperactivityScore = results.answers.slice(9, 18).reduce((sum, score) => sum + score, 0);
  
  const chartData = [
    {
      name: "Inattention (부주의 증상)",
      value: inattentionScore,
      fullMark: 18,
    },
    {
      name: "Hyperactivity/Impulsivity (과잉행동/충동성)",
      value: hyperactivityScore,
      fullMark: 18,
    }
  ];

  const evaluation = getOverallEvaluation(severity);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </Button>
        <h1 className="text-3xl font-bold text-brand-gradient">주의집중력 자가체크 결과 (참고용)</h1>
        <div></div>
      </div>

      {/* 법적 안전 공지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          <span className="font-semibold">📊 체크 결과 (참고용)</span><br />
          ⚠️ 이 결과는 참고용이며 전문적 평가가 절대 아닙니다. 주의집중력 문제가 의심되면 반드시 전문기관에서 상담받으세요.
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
                <span className="text-2xl font-bold text-brand-gradient">{total}/36점</span>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                최대 36점 (18문항 × 2점)
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">평균점수</span>
                <span className="text-2xl font-bold text-brand-gradient">{average.toFixed(1)}/2.0점</span>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                문항당 평균점수
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">규준집단 대비</span>
                <span className="text-2xl font-bold text-brand-gradient">{((total/36)*100).toFixed(0)}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">평가 결과</span>
                <Badge className={evaluation.color}>
                  {evaluation.level}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">연령대</span>
                <span className="text-lg">{ageGroup}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">검사일</span>
                <span className="text-lg">{new Date().toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">증상 영역별 점수</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[0, 18]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      {/* 전문가 해석 결과 - 대폭 확장 */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold text-foreground mb-6">✨ 상세 분석 결과</h3>
        
        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-800">총 점수</p>
              <p className="text-3xl font-bold text-blue-900">{total}점 / 36점</p>
              <p className="text-sm text-blue-600 mt-1">만점 대비 {Math.round((total/36)*100)}%</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-800">부주의 증상</p>
              <p className="text-2xl font-bold text-blue-900">{inattentionScore}점 / 18점</p>
              <p className="text-sm text-blue-600 mt-1">집중력 관련</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-800">과잉행동/충동</p>
              <p className="text-2xl font-bold text-blue-900">{hyperactivityScore}점 / 18점</p>
              <p className="text-sm text-blue-600 mt-1">활동성 관련</p>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <h4 className="text-xl font-semibold text-purple-800 mb-4">🔍 전문가 상세 해석</h4>
            <div className="prose prose-purple max-w-none">
              <p className="text-base leading-relaxed text-gray-800 whitespace-pre-line">
                {severity === "정상 범위" 
                  ? `현재 점수 ${total}점은 ADHD 증상이 일반적인 범위 내에 있는 건강한 상태를 나타냅니다. 부주의 증상 ${inattentionScore}점, 과잉행동/충동성 ${hyperactivityScore}점으로, 일상생활에서 집중력이나 충동 조절에 큰 어려움이 없는 수준입니다.

**7가지 구체적 유지 방법:**
• **규칙적 루틴**: 일정한 생활 패턴으로 집중력과 자기 조절 능력 유지
• **적당한 도전**: 집중력을 요하는 활동으로 인지 능력 지속 발전
• **스트레스 관리**: 과도한 스트레스 상황에서의 집중력 저하 예방
• **건강한 습관**: 충분한 수면과 균형잡힌 식단으로 뇌 기능 최적화
• **시간 관리**: 효과적인 계획 수립과 실행 능력 지속 개발
• **주의력 훈련**: 독서, 퍼즐 등을 통한 집중력 강화 활동 지속
• **정기 점검**: 스트레스나 환경 변화 시 집중력 상태 자가 모니터링

**재평가 권장:** 현재 상태를 유지하면서 6개월 후 재검사를 통해 지속적인 집중력 관리 상태를 확인하시기 바랍니다.`
                  : severity === "경계선 수준"
                  ? `현재 점수 ${total}점은 ADHD 증상이 경계선 수준에 있어 주의 깊은 관찰이 필요한 상태입니다. 부주의 증상 ${inattentionScore}점, 과잉행동/충동성 ${hyperactivityScore}점으로, 때때로 일상생활에 경미한 영향을 미칠 수 있습니다.

**7가지 구체적 개선 방법:**
• **환경 조성**: 집중하기 쉬운 환경 만들기 (정리정돈, 소음 차단 등)
• **시간 구조화**: 포모도로 기법 등을 활용한 집중 시간 관리
• **행동 모니터링**: 주의력 분산이나 충동적 행동 패턴 관찰하고 기록
• **운동 요법**: 규칙적인 유산소 운동으로 집중력과 충동 조절 능력 향상
• **인지 훈련**: 집중력 강화 앱이나 게임을 통한 주의력 훈련
• **스트레스 완화**: 명상, 요가 등을 통한 정신적 안정감 확보
• **전문가 상담**: 필요시 ADHD 전문가와 상담으로 조기 개입

**재평가 권장:** 생활 개선 노력 후 3-6개월 뒤 재검사를 통해 증상 변화와 개선 효과를 확인하시기 바랍니다.`
                  : severity === "중등도 수준"
                  ? `현재 점수 ${total}점은 ADHD 증상이 중등도 수준으로 나타나 전문가의 정확한 평가가 필요한 상태입니다. 부주의 증상 ${inattentionScore}점, 과잉행동/충동성 ${hyperactivityScore}점으로, 학업이나 업무에서 상당한 어려움을 겪을 수 있습니다.

**7가지 구체적 관리 방법:**
• **전문가 평가**: ADHD 전문의나 임상심리사와 정확한 진단 평가 받기
• **행동 치료**: CBT나 행동 수정 프로그램을 통한 체계적 증상 관리
• **학습/업무 전략**: 집중력 보완을 위한 구체적 전략과 도구 활용
• **환경 수정**: 주의 분산 요소 최소화와 집중 지원 환경 구축
• **지지체계**: 가족, 동료들의 이해와 협조를 통한 지원 체계 구축
• **약물 상담**: 필요시 의사와 ADHD 치료 약물에 대한 상담
• **생활 관리**: 규칙적인 운동, 수면, 식단 관리로 증상 완화

**재평가 권장:** 전문가 치료 시작 후 1-3개월 간격으로 정기적 재평가를 통해 치료 효과를 모니터링하고 치료 계획을 조정하시기 바랍니다.`
                  : `현재 점수 ${total}점은 ADHD 증상이 심각한 수준으로 나타나 즉시 전문가의 도움이 필요한 상태입니다. 부주의 증상 ${inattentionScore}점, 과잉행동/충동성 ${hyperactivityScore}점으로, 일상생활 전반에 상당한 지장을 주고 있을 가능성이 높습니다.

**7가지 즉시 실행 방법:**
• **응급 평가**: 즉시 ADHD 전문의나 정신건강의학과 예약하여 정확한 진단
• **치료 계획**: 의사와 함께 종합적인 ADHD 치료 계획 수립
• **약물 치료**: 처방에 따른 ADHD 치료 약물로 즉각적 증상 완화
• **집중 상담**: 주 1-2회 ADHD 전문 상담사와 행동 치료 시작
• **환경 재구성**: 집중을 방해하는 모든 요소 제거하고 지원 환경 조성
• **지지체계 활성화**: 가족과 주변인들에게 상황 설명하고 적극적 도움 요청
• **위기 관리**: ADHD 증상 악화 시 즉시 대처할 수 있는 응급 계획 수립

**재평가 권장:** 치료 시작 후 2-4주 간격으로 집중적인 모니터링과 재평가를 통해 증상 호전도를 확인하고 치료 강도를 조정하시기 바랍니다.`}
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

      {/* Action Buttons */}
      <div className="grid md:grid-cols-5 gap-4">
        <Button 
          className="btn-brand h-16"
          onClick={() => navigate('/expert-hiring')}
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">ADHD전문가연결</div>
            <div className="text-sm opacity-90">맞춤 추천 상담</div>
          </div>
        </Button>

        <Button 
          className="btn-brand h-16"
          onClick={() => navigate('/counseling', { state: { assessmentResults: { ...results, testType: 'adhd' } } })}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">단계별 상담 시작</div>
            <div className="text-sm opacity-90">AI → 전문가</div>
          </div>
        </Button>

        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white h-16"
          onClick={() => navigate('/ai-counselor', { state: { assessmentResults: { ...results, testType: 'adhd' } } })}
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
            testType: 'ADHD 검사',
            results: {
              total: results.total,
              average: results.average,
              severity,
              answers
            },
            analysis: `ADHD 검사 결과 분석: ${evaluation.description}`,
            testInfo: {
              ageGroup,
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
            testType: 'ADHD 검사',
            results: {
              total: results.total,
              average: results.average,
              severity,
              answers
            },
            analysis: `ADHD 검사 결과 분석: ${evaluation.description}`,
            ageGroup,
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

      {/* AI 이미지 생성 */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold text-foreground mb-6">🎨 맞춤형 치료 이미지 생성</h3>
        <p className="text-muted-foreground mb-6">
          ADHD 테스트 결과를 바탕으로 치료에 도움이 되는 개인화된 이미지를 생성해보세요.
        </p>
        <ImageGenerator
          initialPrompt={`ADHD 치료를 위한 ${severity} 수준의 집중력 향상 이미지`}
          context={`ADHD 테스트 결과 - 위험도: ${severity}, 점수: ${total}`}
          type="test_result"
        />
      </Card>

      {/* 다음 단계 제안 */}
      <NextStepSuggestion className="mb-6" />

      {/* 결과 공유 */}
      <Card className="p-6 mb-6 result-content">
        <ShareResultButton
          title={`ADHD 자가진단 결과 - ${severity}`}
          description={`총점 ${total}점 (평균 ${average}점) - ${severity} 수준으로 확인되었습니다.`}
          resultData={results}
          showScreenshot={true}
        />
      </Card>

      {/* 상품 추천 */}
      <ProductRecommendation 
        category="adhd" 
        severity={severity}
        ageGroup={ageGroup}
      />

      {/* Additional Information */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">참고사항</h4>
        <p className="text-blue-800 text-sm leading-relaxed">
          이 체크는 주의집중력 증상 관찰을 위한 참고도구로, 전문적 평가를 대체할 수 없습니다. 
          정확한 진단과 치료를 위해서는 반드시 통합건강의학과 전문의와 상담하시기 바랍니다.
        </p>
      </Card>
    </div>
  );
};

export default AdhdTestResult;