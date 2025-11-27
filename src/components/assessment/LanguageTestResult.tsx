import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Download, Mail, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTestResultActions } from '@/hooks/useTestResultActions';

interface LanguageTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    ageGroup: string;
    age: number;
  };
  onBack: () => void;
}

const LanguageTestResult = ({ results, onBack }: LanguageTestResultProps) => {
  const { total, average, ageGroup, age } = results;
  const today = new Date().toLocaleDateString('ko-KR');
  const navigate = useNavigate();
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestResultActions();

  const getEvaluation = (score: number) => {
    if (score <= 24) {
      return {
        level: "Attention Needed (주의 필요)",
        description: "전문가 상담을 권장합니다.",
        color: "text-red-600",
        range: "0-24점",
        detailedAnalysis: `현재 점수 ${score}점은 언어발달 지연이 우려되는 범위입니다. 이 단계에서는 즉각적인 전문가 개입이 필요하며, 언어치료사와의 상담을 통해 개별화된 언어발달 프로그램을 시작하시기를 강력히 권장합니다. 일상에서 아이와의 언어적 상호작용을 늘리고, 그림책 읽기, 노래 부르기, 단순한 언어 모델링을 통해 언어 자극을 제공해주세요. 발달지연의 원인을 파악하기 위한 전문적인 평가도 고려해보시기 바랍니다.`
      };
    } else if (score <= 36) {
      return {
        level: "Borderline (경계선)",
        description: "경계선 소견, 추가 평가 추천.",
        color: "text-yellow-600",
        range: "25-36점",
        detailedAnalysis: `현재 점수 ${score}점은 언어발달 경계선 범위에 해당합니다. 이는 정상 발달과 지연 사이의 중간 단계로, 적절한 언어 자극과 환경 개선을 통해 충분히 향상될 수 있는 상태입니다. 

**구체적 개선 방법:**
• **일상 대화 늘리기**: 아이의 모든 행동에 언어로 설명해주기 ("지금 우유를 마시고 있구나", "빨간 공을 던지는구나")
• **반복적 언어 노출**: 같은 단어나 문장을 여러 상황에서 반복 사용
• **책 읽기 활동**: 하루 15-20분씩 그림책을 함께 보며 내용에 대해 이야기하기
• **노래와 리듬**: 동요나 손유희를 통한 언어 리듬감 발달
• **놀이를 통한 언어학습**: 역할놀이, 블록놀이 등에서 자연스러운 언어 사용

3-6개월 후 재평가를 통해 발달 상황을 점검하시고, 개선이 미흡할 경우 언어치료 전문가와의 상담을 고려해보시기 바랍니다.`
      };
    } else {
      return {
        level: "Good (양호)",
        description: "양호. 경과 관찰 권장.",
        color: "text-green-600",
        range: "37-60점",
        detailedAnalysis: `축하합니다! 현재 점수 ${score}점은 연령대 대비 양호한 언어발달 수준을 보여줍니다. 아이의 언어능력이 정상 범위 내에서 잘 발달하고 있으며, 현재의 언어적 환경과 상호작용 방식을 지속적으로 유지하시면 됩니다.

**지속적 발달을 위한 권장사항:**
• **다양한 어휘 노출**: 일상에서 풍부한 어휘를 사용하여 대화하기
• **복문 사용 늘리기**: 단순한 문장보다는 "~하니까", "~해서" 등의 연결어를 사용한 복문으로 대화
• **창의적 언어 활동**: 이야기 만들기, 상상놀이를 통한 언어 창의성 발달
• **또래와의 상호작용**: 다른 아이들과의 놀이를 통한 사회적 언어 발달
• **정기적 모니터링**: 6개월마다 언어발달 상황을 점검하여 지속적인 발달 확인

현재 수준을 유지하면서 더욱 풍부한 언어 환경을 제공해주시면, 아이의 언어능력이 더욱 향상될 것입니다.`
      };
    }
  };

  const evaluation = getEvaluation(total);

  // 차트 데이터
  const chartData = [
    {
      name: '총점',
      value: total,
      fullMark: 60
    }
  ];

  const handleExpertConsult = () => {
    navigate('/expert-hiring');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </Button>
        <h1 className="text-2xl font-bold text-brand-gradient">검사 결과 리포트</h1>
        <div></div>
      </div>

      {/* Summary Card */}
      <Card className="p-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-brand-gradient">언어발달 검사 결과</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">총점</p>
              <p className="text-2xl font-bold">{total}점</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">연령</p>
              <p className="text-2xl font-bold">{age}개월</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">평가 결과</p>
              <p className="text-2xl font-bold">{evaluation.level}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">검사일</p>
              <p className="text-2xl font-bold">{today}</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <p className="text-lg font-semibold mb-2">종합 평가</p>
            <p className={`text-xl font-bold ${evaluation.color}`}>{evaluation.level}</p>
            <p className="text-muted-foreground mt-2">{evaluation.description}</p>
          </div>
        </div>
      </Card>

      <Card className="p-8">
        <h3 className="text-2xl font-bold text-foreground mb-6">✨ 상세 분석 결과</h3>
        
        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-800">언어발달 점수</p>
              <p className="text-3xl font-bold text-blue-900">{total}점 / 60점</p>
              <p className="text-sm text-blue-600 mt-1">만점 대비 {Math.round((total/60)*100)}%</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-800">평가 결과</p>
              <p className={`text-2xl font-bold ${evaluation.color}`}>{evaluation.level}</p>
              <p className="text-sm text-blue-600 mt-1">점수 범위: {evaluation.range}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-800">현재 개월수</p>
              <p className="text-2xl font-bold text-blue-900">{age}개월</p>
              <p className="text-sm text-blue-600 mt-1">연령대: {ageGroup}</p>
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">📊 언어발달 점수 분류 기준</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold text-red-800">주의 필요 (0-24점)</p>
                <p className="text-sm text-red-600 mt-1">즉시 전문가 상담 권장</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="font-semibold text-yellow-800">경계선 (25-36점)</p>
                <p className="text-sm text-yellow-600 mt-1">추가 관찰 및 자극 필요</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-800">양호 (37-60점)</p>
                <p className="text-sm text-green-600 mt-1">정상 발달 범위</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <h4 className="text-xl font-semibold text-purple-800 mb-4">🔍 전문가 상세 해석</h4>
            <div className="prose prose-purple max-w-none">
              <p className="text-base leading-relaxed text-gray-800 whitespace-pre-line">
                {evaluation.detailedAnalysis}
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

      <Card className="p-8">
        <h3 className="text-xl font-semibold mb-6 text-center">점수 분포</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 60]} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">전문가 상담</h3>
          <p className="text-sm text-muted-foreground mb-4">
            더 자세한 분석과 상담이 필요하시다면 전문가와 연결해드립니다.
          </p>
          <Button 
            onClick={handleExpertConsult}
            className="w-full btn-brand flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            전문가 상담 연결
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">결과 저장 및 공유</h3>
          <p className="text-sm text-muted-foreground mb-4">
            검사 결과를 PDF로 저장하거나 데이터베이스에 저장하세요.
          </p>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              onClick={() => generatePDFReport({
                testType: '언어발달 검사',
                results: {
                  total,
                  average,
                  ageGroup,
                  answers: results.answers
                },
                analysis: '언어발달 검사 결과 분석',
                testInfo: {
                  generatedAt: new Date().toISOString(),
                  version: '1.0'
                }
              })}
              disabled={isGeneratingPDF}
            >
              <Download className="w-4 h-4" />
              {isGeneratingPDF ? 'PDF 생성 중...' : 'PDF 리포트'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              onClick={() => saveTestResult({
                testType: '언어발달 검사',
                results: {
                  total,
                  average,
                  ageGroup,
                  answers: results.answers
                },
                analysis: '언어발달 검사 결과 분석',
                ageGroup: '영유아',
                testInfo: {
                  generatedAt: new Date().toISOString(),
                  version: '1.0'
                }
              })}
              disabled={isSaving}
            >
              <Mail className="w-4 h-4" />
              {isSaving ? '저장 중...' : '결과 저장'}
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <UserCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">언어 전문가 상담 받기</h4>
              <p className="text-sm text-muted-foreground mb-3">
                언어발달 검사 결과를 바탕으로 전문가 상담을 받아보세요.
              </p>
              <Button 
                onClick={() => navigate('/expert-hiring')}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                언어치료사 연결
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LanguageTestResult;
