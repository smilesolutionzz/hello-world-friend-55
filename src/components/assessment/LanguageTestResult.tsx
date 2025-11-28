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
    detailedAgeGroup?: string;
    ageInMonths?: number;
  };
  onBack: () => void;
}

const LanguageTestResult = ({ results, onBack }: LanguageTestResultProps) => {
  const { total, average, ageGroup, age } = results;
  const today = new Date().toLocaleDateString('ko-KR');
  const navigate = useNavigate();
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestResultActions();

  const getEvaluation = (score: number, age: number) => {
    const detailedAge = results.detailedAgeGroup || `${age}개월`;
    
    // 연령별 기준점 설정 (개월수에 따라)
    let lowThreshold = 24;
    let midThreshold = 36;
    
    if (age <= 12) {
      lowThreshold = 15; midThreshold = 25;
    } else if (age <= 24) {
      lowThreshold = 20; midThreshold = 32;
    } else if (age <= 36) {
      lowThreshold = 24; midThreshold = 36;
    } else if (age <= 48) {
      lowThreshold = 28; midThreshold = 40;
    } else if (age <= 60) {
      lowThreshold = 32; midThreshold = 44;
    }
    
    if (score <= lowThreshold) {
      return {
        level: "Attention Needed (주의 필요)",
        description: "전문가 상담을 권장합니다.",
        color: "text-red-600",
        range: `0-${lowThreshold}점`,
        detailedAnalysis: `**${detailedAge} 아동의 언어발달 분석**\n\n현재 점수 ${score}점은 ${detailedAge} 연령대에서 언어발달 지연이 우려되는 범위입니다.\n\n**연령별 발달 이정표:**\n${getAgeMilestones(age)}\n\n**즉각 권장사항:**\n• 즉각적인 전문가 개입이 필요합니다\n• 언어치료사와의 상담을 통해 개별화된 언어발달 프로그램 시작\n• 소아청소년과 또는 발달전문의 진료 권장\n• 일상에서 아이와의 언어적 상호작용 최대화\n• 그림책 읽기, 노래 부르기, 단순 언어 모델링 활용\n• 발달지연의 원인 파악을 위한 전문적 평가 고려\n\n**${detailedAge} 연령 특화 지원:**\n${getAgeSpecificSupport(age, 'delayed')}`
      };
    } else if (score <= midThreshold) {
      return {
        level: "Borderline (경계선)",
        description: "경계선 소견, 추가 평가 추천.",
        color: "text-yellow-600",
        range: `${lowThreshold + 1}-${midThreshold}점`,
        detailedAnalysis: `**${detailedAge} 아동의 언어발달 분석**\n\n현재 점수 ${score}점은 ${detailedAge} 연령대에서 언어발달 경계선 범위에 해당합니다.\n\n**연령별 발달 이정표:**\n${getAgeMilestones(age)}\n\n**구체적 개선 방법:**\n• **일상 대화 늘리기**: 아이의 모든 행동에 언어로 설명하기\n• **반복적 언어 노출**: 같은 단어/문장을 다양한 상황에서 사용\n• **책 읽기 활동**: 하루 15-20분씩 연령에 맞는 그림책\n• **노래와 리듬**: 동요나 손유희를 통한 언어 리듬감 발달\n• **놀이를 통한 언어학습**: 역할놀이, 블록놀이 등 활용\n\n**${detailedAge} 연령 특화 활동:**\n${getAgeSpecificSupport(age, 'borderline')}\n\n**추후 관리:**\n3-6개월 후 재평가를 통해 발달 상황을 점검하시고, 개선이 미흡할 경우 언어치료 전문가와 상담을 고려하세요.`
      };
    } else {
      return {
        level: "Good (양호)",
        description: "양호. 경과 관찰 권장.",
        color: "text-green-600",
        range: `${midThreshold + 1}-60점`,
        detailedAnalysis: `**${detailedAge} 아동의 언어발달 분석**\n\n축하합니다! 현재 점수 ${score}점은 ${detailedAge} 연령대 대비 양호한 언어발달 수준입니다.\n\n**연령별 발달 이정표:**\n${getAgeMilestones(age)}\n\n**지속적 발달을 위한 권장사항:**\n• **다양한 어휘 노출**: 일상에서 풍부한 어휘 사용\n• **복문 사용**: 연결어를 사용한 복잡한 문장 대화\n• **창의적 언어 활동**: 이야기 만들기, 상상놀이\n• **또래 상호작용**: 다른 아이들과의 놀이 활동\n• **정기적 모니터링**: 6개월마다 언어발달 점검\n\n**${detailedAge} 연령 특화 발달 촉진:**\n${getAgeSpecificSupport(age, 'good')}\n\n현재의 우수한 언어 환경을 유지하면서, 더욱 풍부한 언어 자극을 제공하시면 아이의 언어능력이 더욱 향상될 것입니다.`
      };
    }
  };

  // 연령별 발달 이정표
  const getAgeMilestones = (age: number): string => {
    if (age <= 12) {
      return `• 옹알이와 소리 모방 시작\n• 간단한 단어 이해 (엄마, 아빠)\n• 손짓으로 의사표현\n• 익숙한 소리에 반응`;
    } else if (age <= 24) {
      return `• 50-100개 단어 이해 및 사용\n• 두 단어 조합 시작 (엄마 물)\n• 간단한 지시 따르기\n• 신체 부위 가리키기`;
    } else if (age <= 36) {
      return `• 200-300개 단어 사용\n• 3-4 단어 문장 구성\n• "뭐", "왜" 등 질문 시작\n• 간단한 이야기 이해`;
    } else if (age <= 48) {
      return `• 1000개 이상 단어 이해\n• 완전한 문장 구사\n• 과거/미래 시제 사용\n• 복잡한 지시 따르기`;
    } else if (age <= 60) {
      return `• 2000개 이상 단어 사용\n• 복문 구성 능력\n• 이야기 순서대로 말하기\n• 논리적 추론 표현`;
    } else {
      return `• 5000개 이상 어휘력\n• 추상적 개념 이해\n• 긴 이야기 이해 및 구성\n• 문법적으로 정확한 문장`;
    }
  };

  // 연령별 특화 지원
  const getAgeSpecificSupport = (age: number, level: string): string => {
    if (age <= 12) {
      if (level === 'delayed') return '• 얼굴 마주보며 반응적 상호작용\n• 과장된 표정과 소리로 주의 끌기\n• 단순한 소리 모방 놀이\n• 노래와 리듬 놀이';
      if (level === 'borderline') return '• 소리에 대한 반응 관찰 및 격려\n• 다양한 소리 자극 제공\n• 옹알이 모방 및 격려\n• 감각 놀이를 통한 언어 자극';
      return '• 다양한 음운 자극 제공\n• 언어적 풍부함 유지\n• 책 읽기 습관 형성\n• 사회적 상호작용 격려';
    } else if (age <= 24) {
      if (level === 'delayed') return '• 일상 루틴에 언어 연결\n• 단순 동작과 말 결합\n• 그림카드 활용 어휘 학습\n• 모방 놀이 강화';
      if (level === 'borderline') return '• 두 단어 조합 모델링\n• 선택형 질문으로 반응 유도\n• 일상 사물 명칭 학습\n• 동작과 언어 연결';
      return '• 새로운 어휘 지속 확장\n• 간단한 질문하기\n• 또래 놀이 시작\n• 상황별 언어 사용';
    } else if (age <= 36) {
      if (level === 'delayed') return '• 문장 확장 모델링\n• 역할놀이로 상황 언어 학습\n• 그림책 반복 읽기\n• 질문-답변 연습';
      if (level === 'borderline') return '• 3단어 이상 문장 격려\n• "뭐", "어디" 질문 연습\n• 순서 개념 도입\n• 감정 표현 언어 학습';
      return '• 이야기 만들기 활동\n• 복잡한 질문 던지기\n• 추론 능력 발달 유도\n• 협동 놀이 참여';
    } else if (age <= 48) {
      if (level === 'delayed') return '• 시제 개념 반복 학습\n• 이야기 순서 맞추기\n• 전치사 사용 연습\n• 문제해결 대화';
      if (level === 'borderline') return '• 복잡한 지시 따르기\n• 원인-결과 설명\n• 감정 이유 표현하기\n• 협상 언어 연습';
      return '• 상상놀이 확장\n• 긴 이야기 말하기\n• 비유 언어 소개\n• 독서 습관 강화';
    } else if (age <= 60) {
      if (level === 'delayed') return '• 추상 개념 구체화\n• 논리적 사고 유도\n• 긴 문장 연습\n• 읽기 준비 활동';
      if (level === 'borderline') return '• 복문 구성 연습\n• 이야기 재구성하기\n• 의견 표현 격려\n• 설명 능력 향상';
      return '• 비판적 사고 발달\n• 복잡한 이야기 구성\n• 학습 언어 발달\n• 읽기 쓰기 연계';
    } else {
      if (level === 'delayed') return '• 학습 언어 집중 지원\n• 읽기 쓰기 통합\n• 발표 연습\n• 논리적 글쓰기';
      if (level === 'borderline') return '• 어휘력 확장 프로그램\n• 토론 활동 참여\n• 창의적 글쓰기\n• 독서 습관 강화';
      return '• 고급 언어 능력 발달\n• 문학적 표현 학습\n• 다양한 장르 읽기\n• 프레젠테이션 능력';
    }
  };

  const evaluation = getEvaluation(total, age);

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
