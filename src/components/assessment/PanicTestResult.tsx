import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Heart, ArrowLeft, ExternalLink, Save, Share2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTestResultActions } from "@/hooks/useTestResultActions";
import { useShareText } from "@/utils/shareUtils";
import { NextStepSuggestion } from '@/components/onboarding/NextStepSuggestion';

interface PanicTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
  };
  onBack: () => void;
}

const PanicTestResult = ({ results, onBack }: PanicTestResultProps) => {
  const { total, average, severity } = results;
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestResultActions();
  const { shareAsText } = useShareText();
  
  const chartData = [
    {
      name: '총점',
      value: total,
      fullMark: 63,
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "정상":
        return "bg-green-100 text-green-800 border-green-200";
      case "경미":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "중등도":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "심각":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRecommendation = (severity: string) => {
    switch (severity) {
      case "정상":
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          title: "양호한 상태",
          description: "현재 공황장애 증상이 거의 없는 상태입니다. 정기적인 자가관리를 통해 현재 상태를 유지하시기 바랍니다."
        };
      case "경미":
        return {
          icon: <Heart className="w-6 h-6 text-yellow-600" />,
          title: "경미한 증상",
          description: "가벼운 불안 증상이 있을 수 있습니다. 스트레스 관리와 이완 기법을 통해 증상을 완화할 수 있습니다."
        };
      case "중등도":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
          title: "중등도 증상",
          description: "공황장애 증상이 중등도 수준입니다. 전문가와 상담하여 적절한 치료 방법을 찾아보시는 것을 권장합니다."
        };
      case "심각":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
          title: "심각한 증상",
          description: "즉시 전문가의 도움이 필요합니다. 통합건강의학과 전문의와 상담받으시기를 적극 권장드립니다."
        };
      default:
        return {
          icon: <Heart className="w-6 h-6 text-gray-600" />,
          title: "검사 완료",
          description: "검사가 완료되었습니다."
        };
    }
  };

  const recommendation = getRecommendation(severity);

  const handleShare = () => {
    const shareContent = `공황장애 자가체크 결과\n\n총점: ${total}점\n심각도: ${severity}\n\n이 결과는 참고용이며, 정확한 진단은 전문의와 상담하세요.`;
    shareAsText(shareContent, "공황장애 자가체크 결과");
  };

  const handleSaveResult = () => {
    saveTestResult({
      testType: '공황장애 자가체크',
      results: {
        total,
        average,
        severity,
        answers: results.answers
      },
      ageGroup: 'adult'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </Button>
        <h1 className="text-3xl font-bold text-brand-gradient">불안감 체크 결과 (참고용)</h1>
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
                <span className="text-lg font-medium">규준집단 대비</span>
                <span className="text-2xl font-bold text-brand-gradient">{((total/63)*100).toFixed(0)}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">심각도</span>
                <Badge className={getSeverityColor(severity)}>
                  {severity}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">검사일</span>
                <span className="text-lg">{new Date().toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">점수 분포</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 63]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      {/* 점수 범위 안내 */}
      <Card className="p-8">
        <h3 className="text-xl font-semibold mb-4">📊 공황장애 점수 분류 기준</h3>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="font-semibold text-green-800">정상 (0-15점)</p>
            <p className="text-sm text-green-600 mt-1">양호한 상태</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="font-semibold text-yellow-800">경미 (16-30점)</p>
            <p className="text-sm text-yellow-600 mt-1">가벼운 불안</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="font-semibold text-orange-800">중등도 (31-45점)</p>
            <p className="text-sm text-orange-600 mt-1">전문가 상담 권장</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="font-semibold text-red-800">심각 (46-63점)</p>
            <p className="text-sm text-red-600 mt-1">즉시 치료 필요</p>
          </div>
        </div>
      </Card>

      {/* 전문가 해석 결과 - 대폭 확장 */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold text-foreground mb-6">✨ 상세 분석 결과</h3>
        
        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-800">공황장애 점수</p>
              <p className="text-3xl font-bold text-blue-900">{total}점 / 63점</p>
              <p className="text-sm text-blue-600 mt-1">만점 대비 {Math.round((total/63)*100)}%</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-800">심각도</p>
              <p className={`text-2xl font-bold ${getSeverityColor(severity).includes('green') ? 'text-green-700' : 
                getSeverityColor(severity).includes('yellow') ? 'text-yellow-700' :
                getSeverityColor(severity).includes('orange') ? 'text-orange-700' : 'text-red-700'}`}>
                {severity}
              </p>
              <p className="text-sm text-blue-600 mt-1">범위: {
                severity === "정상" ? "0-15점" :
                severity === "경미" ? "16-30점" :
                severity === "중등도" ? "31-45점" : "46-63점"
              }</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-800">검사일</p>
              <p className="text-2xl font-bold text-blue-900">{new Date().toLocaleDateString('ko-KR')}</p>
              <p className="text-sm text-blue-600 mt-1">참고용 결과</p>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <h4 className="text-xl font-semibold text-purple-800 mb-4">🔍 전문가 상세 해석</h4>
            <div className="prose prose-purple max-w-none">
              <p className="text-base leading-relaxed text-gray-800 whitespace-pre-line">
                {severity === "정상" 
                  ? `현재 점수 ${total}점은 공황장애 증상이 거의 없는 양호한 상태를 나타냅니다. 이는 정신건강이 안정적으로 유지되고 있음을 의미하며, 일상생활에서 불안감이나 공황 증상으로 인한 어려움이 최소한임을 보여줍니다.

**7가지 구체적 관리 방법:**
• **스트레스 예방**: 규칙적인 생활 패턴 유지하기
• **신체 활동**: 주 3회 이상 30분 유산소 운동
• **수면 위생**: 7-8시간 충분한 수면과 일정한 취침시간
• **건강한 식습관**: 카페인과 알코올 섭취 제한
• **사회적 지지**: 가족, 친구와의 건강한 관계 유지
• **여가 활동**: 취미 생활을 통한 정서적 안정감 확보
• **정기 점검**: 스트레스 수준 자가 모니터링

**재평가 권장:** 현재 상태를 유지하면서 3-6개월 후 재검사를 통해 지속적인 정신건강 관리 상태를 확인하시기를 권장합니다.`
                  : severity === "경미"
                  ? `현재 점수 ${total}점은 가벼운 불안 증상이 있는 수준입니다. 이는 일상적인 스트레스나 환경 변화로 인해 나타날 수 있는 정도로, 적절한 자가관리와 생활습관 개선을 통해 충분히 관리할 수 있는 범위입니다.

**7가지 구체적 개선 방법:**
• **호흡법 연습**: 하루 2-3회 복식호흡 및 4-7-8 호흡법 실시
• **이완 기법**: 점진적 근육이완법이나 명상 프로그램 활용
• **인지 재구성**: 부정적 사고를 현실적 사고로 바꾸는 연습
• **규칙적 운동**: 불안감 해소를 위한 꾸준한 신체 활동
• **스트레스 관리**: 업무량 조절과 시간 관리 기법 적용
• **사회적 활동**: 친구, 가족과의 소통 시간 늘리기
• **전문가 지지**: 필요시 상담사와의 정기적 면담

**재평가 권장:** 생활습관 개선 후 3-6개월 뒤 재검사를 통해 증상 개선 정도를 확인하고, 지속적인 관리 방안을 점검하시기 바랍니다.`
                  : severity === "중등도"
                  ? `현재 점수 ${total}점은 중등도 수준의 공황장애 증상을 나타냅니다. 이는 일상생활에 일부 영향을 미칠 수 있는 수준으로, 전문가의 도움을 받아 체계적인 관리가 필요한 상태입니다.

**7가지 구체적 관리 방법:**
• **전문가 상담**: 정신건강의학과 또는 임상심리사와 정기 상담
• **인지행동치료**: CBT 기법을 통한 불안 사고 패턴 개선
• **약물 상담**: 필요시 의사와 약물치료 옵션 논의
• **생활 구조화**: 일정한 일과와 스트레스 요인 관리
• **지지체계 구축**: 가족, 친구들에게 상황 공유하고 지원 요청
• **응급 대처법**: 공황 발작 시 대처 방법 미리 학습하고 연습
• **자기 돌봄**: 충분한 휴식과 영양 관리로 신체 컨디션 유지

**재평가 권장:** 전문가 치료 시작 후 1-3개월 간격으로 정기적 재평가를 통해 치료 효과를 모니터링하고 치료 계획을 조정하시기 바랍니다.`
                  : `현재 점수 ${total}점은 심각한 공황장애 증상을 나타냅니다. 이는 즉시 전문가의 개입이 필요한 수준으로, 일상생활에 상당한 지장을 초래할 수 있어 신속한 치료가 필요한 상태입니다.

**7가지 즉시 실행 방법:**
• **응급 치료**: 즉시 정신건강의학과 전문의 진료 예약
• **안전 계획**: 공황 발작 시 즉시 대처할 수 있는 안전 계획 수립
• **약물 치료**: 의사 처방에 따른 적절한 약물치료 시작
• **집중 상담**: 주 1-2회 정기적인 전문가 상담 시작
• **지지체계 활성화**: 가족과 주변인들에게 상황 알리고 응급 시 도움 요청
• **생활 안전화**: 스트레스 요인 최소화하고 안정적 환경 조성
• **24시간 지원**: 위기 상황 시 이용할 수 있는 응급 연락처 확보

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

      {/* Recommendation Card */}
      <Card className="p-8">
        <div className="flex items-start gap-4">
          {recommendation.icon}
          <div className="flex-1 space-y-4">
            <h3 className="text-2xl font-bold text-foreground">{recommendation.title}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {recommendation.description}
            </p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button 
          className="btn-brand h-16"
          onClick={() => window.open('/expert-hiring', '_self')}
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">전문가 고용하기</div>
            <div className="text-sm opacity-90">즉시 상담 가능</div>
          </div>
        </Button>

        <Button 
          onClick={() => generatePDFReport({
            testType: 'panic',
            results: {
              ...results,
              ageGroup: '성인'
            },
            analysis: `불안감 수준: ${severity}`,
            testInfo: {
              testName: '불안감 수준 확인',
              date: new Date().toLocaleDateString('ko-KR')
            }
          })}
          disabled={isGeneratingPDF}
          variant="outline" 
          className="h-16"
          aria-label="PDF 리포트 다운로드"
        >
          <div className="text-left">
            <div className="font-semibold">{isGeneratingPDF ? 'PDF 생성 중...' : 'PDF 리포트'}</div>
            <div className="text-sm text-muted-foreground">{isGeneratingPDF ? '잠시만 기다려주세요' : '결과를 PDF로 저장'}</div>
          </div>
        </Button>

        <Button 
          onClick={handleSaveResult}
          disabled={isSaving}
          variant="outline" 
          className="h-16"
        >
          <Save className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">{isSaving ? '저장 중...' : '결과 저장'}</div>
            <div className="text-sm text-muted-foreground">대시보드에서 확인</div>
          </div>
        </Button>
      </div>

      {/* 다음 단계 제안 */}
      <NextStepSuggestion className="mb-6" />

      {/* Additional Information */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">참고사항</h4>
        <p className="text-blue-800 text-sm leading-relaxed">
          이 검사는 자가진단 도구로, 의학적 진단을 대체할 수 없습니다. 
          정확한 진단과 치료를 위해서는 반드시 전문의와 상담하시기 바랍니다.
        </p>
      </Card>
    </div>
  );
};

export default PanicTestResult;