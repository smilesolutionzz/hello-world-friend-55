import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, MessageCircle, Users, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProductRecommendation from "@/components/ProductRecommendation";
import { useTestResultActions } from '@/hooks/useTestResultActions';

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
        level: "정상 범위",
        description: "ADHD 증상이 일반적인 범위 내에 있습니다.",
        color: "bg-green-100 text-green-800 border-green-200"
      };
    } else if (severity === "경계선 수준") {
      return {
        level: "경계선 수준",
        description: "일부 ADHD 증상이 나타날 수 있어 관찰이 필요합니다.",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200"
      };
    } else if (severity === "중등도 수준") {
      return {
        level: "중등도 수준",
        description: "ADHD 증상이 중등도 수준으로 전문가 상담을 권장합니다.",
        color: "bg-orange-100 text-orange-800 border-orange-200"
      };
    } else {
      return {
        level: "심각한 수준",
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
      name: "부주의 증상",
      value: inattentionScore,
      fullMark: 18,
    },
    {
      name: "과잉행동/충동성",
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
          ⚠️ 이 결과는 참고용이며 의학적 진단이 절대 아닙니다. 주의집중력 문제가 의심되면 반드시 정신건강의학과 전문의와 상담하세요.
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

      {/* 전문가 해석 결과 */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold text-foreground mb-6">✨ 결과 해석</h3>
        
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-lg font-medium mb-2">• 주의집중력 체크 점수: {total}점 / 36점</p>
              <p className="text-lg font-medium">• 평가 결과: {evaluation.level}</p>
            </div>
            <div>
              <p className="text-lg font-medium mb-2">• 부주의 증상: {inattentionScore}점</p>
              <p className="text-lg font-medium">• 과잉행동/충동성: {hyperactivityScore}점</p>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 bg-primary/20 rounded-full animate-pulse"></div>
              <span className="text-lg font-medium">AI 전문가 해석 생성 중...</span>
            </div>
            <div id="ai-analysis-content">
              <p className="text-lg leading-relaxed">
                <strong>기본 해석:</strong> {evaluation.level === "정상 범위" 
                  ? "ADHD 자가체크 결과 현재 증상들이 일반적인 범위 내에 있는 것으로 나타났습니다. 부주의나 과잉행동/충동성 증상이 일상생활에 큰 지장을 주지 않는 수준입니다."
                  : evaluation.level === "경계선 수준"
                  ? "ADHD 자가체크 결과 일부 증상들이 경계선 수준에 있어 주의 깊은 관찰이 필요합니다. 부주의나 과잉행동/충동성 증상이 때때로 일상생활에 영향을 미칠 수 있습니다."
                  : evaluation.level === "중등도 수준"
                  ? "ADHD 자가체크 결과 중등도 수준의 증상이 확인되어 전문가의 정확한 평가가 필요합니다. 부주의나 과잉행동/충동성 증상이 학업, 업무, 또는 대인관계에서 상당한 어려움을 야기할 수 있습니다."
                  : "ADHD 자가체크 결과 심각한 수준의 증상이 확인되어 즉시 전문가의 도움이 필요합니다. 현재 증상들이 일상생활 전반에 상당한 지장을 주고 있을 가능성이 높습니다."}
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
          onClick={() => navigate('/expert?category=ADHD&mode=online')}
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
          이 검사는 주의집중력 증상 체크를 위한 선별도구로, 의학적 진단을 대체할 수 없습니다. 
          정확한 진단과 치료를 위해서는 반드시 정신건강의학과 전문의와 상담하시기 바랍니다.
        </p>
      </Card>
    </div>
  );
};

export default AdhdTestResult;