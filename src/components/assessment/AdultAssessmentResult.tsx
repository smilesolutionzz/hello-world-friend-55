import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Brain, ArrowLeft, ExternalLink, MessageCircle, Users, UserCheck, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProductRecommendation from "@/components/ProductRecommendation";
import LifeRiskAnalysis from "@/components/insurance/LifeRiskAnalysis";
import { useTestResultActions } from '@/hooks/useTestResultActions';

interface AdultAssessmentResultProps {
  results: {
    answers: Record<string, number>;
    total: number;
    average: number;
    ageGroup: string;
    categoryScores: Record<string, number>;
  };
  onBack: () => void;
  onStartAIChat?: () => void;
  onStartRealTimeChat?: () => void;
}

const AdultAssessmentResult = ({ results, onBack, onStartAIChat, onStartRealTimeChat }: AdultAssessmentResultProps) => {
  const { total, average, ageGroup, categoryScores } = results;
  const navigate = useNavigate();
  const { generatePDFReport, isGeneratingPDF } = useTestResultActions();
  const today = new Date().toLocaleDateString('ko-KR');
  
  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      depression: "우울감",
      dep: "우울감",
      anxiety: "불안감",
      anx: "불안감",
      personality: "성격",
      workplace: "직장적응",
      work: "직장적응",
      resilience: "회복력",
      res: "회복력",
      leadership: "리더십",
      lead: "리더십",
      empathy: "공감",
      emp: "공감",
      problem_solving: "문제해결",
      prob: "문제해결",
      communication: "소통",
      comm: "소통",
      focus: "집중력",
      foc: "집중력",
      creativity: "창의성",
      cre: "창의성",
      adaptability: "적응력",
      adap: "적응력",
      persistence: "끈기",
      collaboration: "협력",
      coll: "협력"
    };
    
    // 축약형이 있으면 변환
    const lowerCategory = category.toLowerCase();
    for (const [key, value] of Object.entries(names)) {
      if (lowerCategory.includes(key)) {
        return value;
      }
    }
    
    return names[category as keyof typeof names] || category;
  };

  const getOverallEvaluation = (average: number) => {
    // 3점 척도에서 높은 점수가 더 문제 있음 (0=전혀없음, 1=가끔, 2=자주, 3=항상)
    if (average <= 0.5) {
      return {
        level: "양호",
        description: "전반적인 정신건강 상태가 양호합니다.",
        color: "bg-green-100 text-green-800 border-green-200"
      };
    } else if (average <= 1.0) {
      return {
        level: "경미한 증상",
        description: "일부 영역에서 경미한 증상이 있을 수 있습니다.",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200"
      };
    } else if (average <= 2.0) {
      return {
        level: "중등도 증상",
        description: "중등도 수준의 증상으로 전문가 상담을 고려해보세요.",
        color: "bg-orange-100 text-orange-800 border-orange-200"
      };
    } else {
      return {
        level: "심각한 증상",
        description: "즉시 전문가의 도움이 필요합니다.",
        color: "bg-red-100 text-red-800 border-red-200"
      };
    }
  };
  
  const chartData = Object.entries(categoryScores).map(([category, score]) => ({
    name: getCategoryName(category),
    value: score,
    fullMark: 3,
  }));

  const evaluation = getOverallEvaluation(total / Object.keys(categoryScores).length);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </Button>
        <h1 className="text-3xl font-bold text-brand-gradient">성인 임상심리평가 결과 (참고용)</h1>
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
                <span className="text-lg font-medium">문항당 평균점수</span>
                <span className="text-2xl font-bold text-brand-gradient">{(total / Object.keys(categoryScores).length).toFixed(1)}점 / 3.0점</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">종합 평가</span>
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
            <h3 className="text-xl font-semibold">영역별 점수</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={10} angle={-15} textAnchor="end" height={80} />
                  <YAxis domain={[0, 3]} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [`${value.toFixed(1)}점`, getCategoryName(name)]}
                  />
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
              <p className="text-lg font-medium mb-2">• 심리평가 점수: {total}점 / {Object.keys(categoryScores).length * 3}점</p>
              <p className="text-lg font-medium">• 종합평가: {evaluation.level}</p>
            </div>
            <div>
              <p className="text-lg font-medium mb-2">• 문항당 평균점수: {(total / Object.keys(categoryScores).length).toFixed(1)}점 / 3.0점</p>
              <p className="text-lg font-medium">• 연령대: {ageGroup}</p>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-6">
            <p className="text-lg leading-relaxed">
              <strong>해석:</strong> {evaluation.level === "양호" 
                ? "종합적인 심리평가 결과 전반적인 통합건강 상태가 양호한 수준으로 나타났습니다. 우울 및 불안 증상이 정상 범위에 있으며, 성격적 특성도 건강하게 발달되어 있고 직장이나 사회생활에서의 적응 능력도 우수합니다. 현재의 건강한 상태를 유지하기 위해 규칙적인 생활 패턴, 적절한 스트레스 관리, 그리고 균형 잡힌 사회적 관계를 지속해 나가시기 바랍니다. 정기적인 자기 점검을 통해 심리적 웰빙을 계속 유지해주세요."
                : evaluation.level === "경미한 증상"
                ? "일부 심리적 영역에서 경미한 증상이나 스트레스 반응이 나타나고 있습니다. 이는 일상생활의 스트레스나 환경 변화에 대한 자연스러운 반응일 수 있으며, 적절한 자기관리를 통해 충분히 개선 가능한 수준입니다. 규칙적인 운동, 충분한 휴식, 스트레스 해소 활동 등을 통해 증상을 완화시킬 수 있습니다. 증상이 지속되거나 악화될 경우 전문가와의 상담을 고려해보시기 바랍니다."
                : evaluation.level === "중등도 증상"
                ? "중등도 수준의 심리적 증상이 확인되어 적극적인 관심과 관리가 필요합니다. 우울이나 불안 증상이 일상생활에 일부 영향을 미치고 있을 수 있으며, 직장이나 사회적 적응에서도 어려움을 경험할 수 있습니다. 전문가와의 상담을 통해 정확한 평가를 받고 적절한 치료 계획을 수립하시기를 강력히 권장드립니다. 인지행동치료나 상담 치료를 통해 증상 개선을 기대할 수 있습니다."
                : "심각한 수준의 심리적 증상이 확인되어 즉시 전문가의 도움이 필요합니다. 현재 상태는 일상생활에 상당한 영향을 미치고 있을 가능성이 높으며, 방치할 경우 더욱 악화될 수 있습니다. 통합건강의학과 전문의와 상담하여 정확한 진단과 적절한 치료를 받으시기를 적극 권장드립니다. 약물치료와 심리치료를 병행하여 증상 완화와 기능 회복을 도모하는 것이 중요합니다."}
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

      {/* Action Buttons */}
      <div className="grid md:grid-cols-5 gap-4">
        <Button 
          className="btn-brand h-16"
          onClick={() => navigate('/counseling', { state: { assessmentResults: results } })}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">단계별 상담 시작</div>
            <div className="text-sm opacity-90">AI → 전문가</div>
          </div>
        </Button>

        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white h-16"
          onClick={() => navigate('/ai-counselor', { state: { assessmentResults: results } })}
        >
          <Brain className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">AI 상담만</div>
            <div className="text-sm opacity-90">빠른 상담</div>
          </div>
        </Button>

        <Button 
          className="bg-green-600 hover:bg-green-700 text-white h-16"
          onClick={() => window.open('https://typebot.io/hilight-consult', '_blank')}
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">즉시 전문가 상담</div>
            <div className="text-sm opacity-90">외부 연결</div>
          </div>
        </Button>

        <Button 
          onClick={() => generatePDFReport({
            testType: 'adult_assessment',
            results: {
              ...results,
              ageGroup: ageGroup
            },
            analysis: "성인 심리상태 체크 완료",
            testInfo: {
              testName: '성인 심리상태 체크',
              date: today
            }
          })}
          disabled={isGeneratingPDF}
          variant="outline" 
          className="h-16"
          aria-label="PDF 리포트 다운로드"
        >
          <FileDown className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">{isGeneratingPDF ? 'PDF 생성 중...' : 'PDF 리포트'}</div>
            <div className="text-sm text-muted-foreground">{isGeneratingPDF ? '잠시만 기다려주세요' : '결과를 PDF로 저장'}</div>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-16"
          disabled
        >
          <div className="text-left">
            <div className="font-semibold">결과 저장</div>
            <div className="text-sm text-muted-foreground">(로그인 필요)</div>
          </div>
        </Button>
      </div>

      {/* Expert Consultation CTA */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <UserCheck className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">전문가 상담이 필요하신가요?</h4>
            <p className="text-sm text-muted-foreground mb-3">
              검사 결과를 바탕으로 맞춤형 전문가를 추천해드립니다.
            </p>
            <Button 
              onClick={() => navigate('/expert-hiring')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              전문가 상담 연결
            </Button>
          </div>
        </div>
      </Card>

      {/* 상품 추천 */}
      <ProductRecommendation 
        category="adult" 
        severity={evaluation.level}
        ageGroup={ageGroup}
      />

      {/* 생활 위험도 분석 (보험 연계) */}
      <LifeRiskAnalysis 
        assessmentData={{
          stressLevel: categoryScores.anxiety ? (categoryScores.anxiety / 3) * 100 : 50,
          anxietyLevel: categoryScores.depression ? (categoryScores.depression / 3) * 100 : 50,
          overallScore: ((3 - average) / 3) * 100, // 역산: 낮은 점수가 좋은 상태
          ageGroup: ageGroup
        }}
        familyData={{
          members: 1, // 기본값, 추후 가족 정보와 연동
          hasChildren: false
        }}
      />

      {/* Additional Information */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">참고사항</h4>
        <p className="text-blue-800 text-sm leading-relaxed">
          이 검사는 성인 임상심리평가를 위한 선별도구로, 의학적 진단을 대체할 수 없습니다. 
          정확한 진단과 치료를 위해서는 반드시 통합건강의학과 전문의와 상담하시기 바랍니다.
        </p>
      </Card>
    </div>
  );
};

export default AdultAssessmentResult;