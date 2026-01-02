import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Users, CheckCircle, Clock, MessageCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import AIChatInterface from "@/components/counseling/AIChatInterface";
import RealTimeChat from "@/components/counseling/RealTimeChat";

type CounselingStep = 'intro' | 'ai-screening' | 'expert-matching' | 'expert-chat';

const CounselingFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<CounselingStep>('intro');
  const [aiChatSummary, setAiChatSummary] = useState<string>("");
  const [needsExpertHelp, setNeedsExpertHelp] = useState(false);
  
  // 검사 결과가 있으면 가져오기
  const assessmentResults = location.state?.assessmentResults;

  const handleAiChatComplete = (summary: string, needsExpert: boolean) => {
    setAiChatSummary(summary);
    setNeedsExpertHelp(needsExpert);
    setCurrentStep('expert-matching');
  };

  const proceedToExpertChat = () => {
    setCurrentStep('expert-chat');
  };

  const renderIntro = () => (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
      <div className="container mx-auto max-w-4xl">
        <Button variant="outline" onClick={() => navigate('/')} className="mb-6 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand-gradient mb-4">
            단계별 맞춤 상담 시스템
          </h1>
          <p className="text-lg text-muted-foreground">
            AI 사전상담 후 필요시 전문가와 실시간 연결됩니다
          </p>
        </div>

        {/* 상담 플로우 소개 */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* 1단계: AI 상담 */}
          <Card className="p-8 hover-glow">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">1차: AI 사전 상담</h3>
              <p className="text-muted-foreground">
                검사 결과를 바탕으로 AI가 기초 상담을 진행하고, 
                전문가 상담 필요성을 판단합니다.
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="secondary">24시간 즉시</Badge>
                <Badge variant="secondary">무료</Badge>
                <Badge variant="secondary">사전 스크리닝</Badge>
              </div>
            </div>
          </Card>

          {/* 2단계: 전문가 채팅 */}
          <Card className="p-8 hover-glow">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">2차: 전문가 실시간 채팅</h3>
              <p className="text-muted-foreground">
                AI 상담 내용을 바탕으로 전문가가 
                실시간 텍스트 채팅으로 심화 상담을 제공합니다.
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="secondary">실시간 연결</Badge>
                <Badge variant="secondary">전문가 매칭</Badge>
                <Badge variant="secondary">심화 상담</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* 검사 결과 요약 (있는 경우) */}
        {assessmentResults && (
          <Card className="mb-8 p-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              검사 결과 요약
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-blue-700">검사 유형:</span>
                <p className="font-medium">{assessmentResults.testType || '심리평가'}</p>
              </div>
              <div>
                <span className="text-sm text-blue-700">결과:</span>
                <p className="font-medium">{assessmentResults.severity || assessmentResults.ageGroup}</p>
              </div>
              <div>
                <span className="text-sm text-blue-700">총점:</span>
                <p className="font-medium">{assessmentResults.total}점</p>
              </div>
            </div>
          </Card>
        )}

        {/* 시작 버튼 */}
        <div className="text-center">
          <Button 
            onClick={() => setCurrentStep('ai-screening')}
            className="btn-brand text-lg px-8 py-4 h-auto"
          >
            <Brain className="w-5 h-5 mr-2" />
            AI 상담 시작하기
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            예상 소요시간: AI 상담 5-10분 + 전문가 상담 20-30분
          </p>
        </div>
      </div>
    </div>
  );

  const renderExpertMatching = () => (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-brand-gradient mb-4">
            AI 상담 완료! 
          </h1>
          <p className="text-lg text-muted-foreground">
            {needsExpertHelp 
              ? "추가 전문가 상담이 권장됩니다"
              : "전문가 상담을 원하시면 연결해드릴게요"
            }
          </p>
        </div>

        {/* AI 상담 요약 */}
        <Card className="mb-8 p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            AI 상담 결과 요약
          </h3>
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <p className="text-sm leading-relaxed">{aiChatSummary}</p>
          </div>
          
          {needsExpertHelp && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">전문가 상담 권장</h4>
                  <p className="text-sm text-yellow-700">
                    현재 상황에서는 전문가의 추가적인 도움이 도움이 될 것 같습니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* 전문가 상담 옵션 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <MessageCircle className="w-12 h-12 text-blue-600 mx-auto" />
              <h3 className="text-xl font-bold">실시간 텍스트 채팅</h3>
              <p className="text-muted-foreground text-sm">
                전문가와 1:1 실시간 채팅으로 상담받기
              </p>
              <div className="space-y-2">
                <Badge variant="outline">즉시 연결</Badge>
                <Badge variant="outline">텍스트 기반</Badge>
                <Badge variant="outline">기록 보관</Badge>
              </div>
              <Button 
                onClick={proceedToExpertChat}
                className="w-full btn-brand"
              >
                텍스트 채팅 시작
              </Button>
            </div>
          </Card>

          <Card className="p-6 opacity-75">
            <div className="text-center space-y-4">
              <Users className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="text-xl font-bold text-gray-600">화상 상담</h3>
              <p className="text-muted-foreground text-sm">
                전문가와 화상통화로 상담받기
              </p>
              <div className="space-y-2">
                <Badge variant="outline" className="text-gray-500">예약 필요</Badge>
                <Badge variant="outline" className="text-gray-500">화상 통화</Badge>
                <Badge variant="outline" className="text-gray-500">추후 제공</Badge>
              </div>
              <Button 
                disabled
                variant="outline" 
                className="w-full"
              >
                준비 중
              </Button>
            </div>
          </Card>
        </div>

        {/* 건너뛰기 옵션 */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            나중에 하기
          </Button>
          <Button 
            onClick={() => window.open('https://typebot.io/hilight-consult', '_blank')}
            variant="outline"
          >
            외부 즉시 상담
          </Button>
        </div>
      </div>
    </div>
  );

  // 단계별 렌더링
  switch (currentStep) {
    case 'intro':
      return renderIntro();
    case 'ai-screening':
      return (
        <AIChatInterface 
          assessmentResults={assessmentResults}
          onClose={() => setCurrentStep('intro')}
        />
      );
    case 'expert-matching':
      return renderExpertMatching();
    case 'expert-chat':
      return (
        <RealTimeChat 
          assessmentResults={assessmentResults}
          onClose={() => setCurrentStep('expert-matching')}
        />
      );
    default:
      return renderIntro();
  }
};

export default CounselingFlow;