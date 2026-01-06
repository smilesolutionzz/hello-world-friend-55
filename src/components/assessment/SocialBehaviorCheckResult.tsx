import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users, MessageCircle, Gamepad2, Brain, Ear, Star, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Lightbulb, Heart, Share2, Download } from "lucide-react";
import { useAutoSaveTestResult } from "@/hooks/useAutoSaveTestResult";
import { motion, AnimatePresence } from "framer-motion";

interface SocialBehaviorCheckResultProps {
  results: any;
  answers: Record<string, string>;
  onBack: () => void;
}

const SocialBehaviorCheckResult: React.FC<SocialBehaviorCheckResultProps> = ({ results, answers, onBack }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(["summary"]);

  // Auto save
  useAutoSaveTestResult({
    testType: "사회적 행동 발달 자가체크",
    results,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const categoryInfo = {
    social_interaction: { 
      label: "사회적 상호작용", 
      icon: Users, 
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "다른 사람과의 관계 맺기, 감정 공유, 공동 관심"
    },
    play_peer: { 
      label: "놀이 및 또래관계", 
      icon: Gamepad2, 
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "또래와의 놀이, 역할놀이, 규칙 이해"
    },
    communication: { 
      label: "의사소통", 
      icon: MessageCircle, 
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "언어적/비언어적 소통, 대화의 상호성"
    },
    behavioral_patterns: { 
      label: "행동 패턴", 
      icon: Brain, 
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "반복 행동, 변화 적응, 관심사 범위"
    },
    sensory_response: { 
      label: "감각 반응", 
      icon: Ear, 
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      description: "소리, 촉감, 빛 등에 대한 반응"
    }
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: "우수", color: "text-green-600", bgColor: "bg-green-100", icon: Star };
    if (score >= 60) return { level: "양호", color: "text-blue-600", bgColor: "bg-blue-100", icon: CheckCircle };
    if (score >= 40) return { level: "관찰필요", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Lightbulb };
    return { level: "지원필요", color: "text-red-600", bgColor: "bg-red-100", icon: AlertTriangle };
  };

  const overallLevel = getScoreLevel(results.overallScore || 0);
  const OverallIcon = overallLevel.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              공유
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              저장
            </Button>
          </div>
        </div>

        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            사회적 행동 발달 자가체크 결과
          </h1>
          <p className="text-muted-foreground">AIH 부모 관찰 기반 발달 체크리스트</p>
        </motion.div>

        {/* Overall Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`mb-6 border-2 ${overallLevel.bgColor} border-${overallLevel.color.replace('text-', '')}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">종합 발달 수준</p>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${overallLevel.bgColor}`}>
                      <OverallIcon className={`w-6 h-6 ${overallLevel.color}`} />
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold ${overallLevel.color}`}>
                        {overallLevel.level}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        전체 점수: {results.overallScore}점 / 100점
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-primary">{results.overallScore}</div>
                  <p className="text-sm text-muted-foreground">/ 100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📊 영역별 발달 수준
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.scores && Object.entries(results.scores).map(([category, score]) => {
                const info = categoryInfo[category as keyof typeof categoryInfo];
                const scoreNum = score as number;
                const level = getScoreLevel(scoreNum);
                const Icon = info?.icon || Users;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-full ${info?.bgColor || 'bg-gray-100'}`}>
                          <Icon className={`w-4 h-4 ${info?.color || 'text-gray-600'}`} />
                        </div>
                        <span className="font-medium text-sm">{info?.label || category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={level.color}>
                          {level.level}
                        </Badge>
                        <span className="font-semibold">{scoreNum}점</span>
                      </div>
                    </div>
                    <Progress value={scoreNum} className="h-2" />
                    <p className="text-xs text-muted-foreground">{info?.description}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Analysis Sections */}
        {results.analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {/* Summary */}
            <Card>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleSection("summary")}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    종합 소견
                  </CardTitle>
                  {expandedSections.includes("summary") ? <ChevronUp /> : <ChevronDown />}
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.includes("summary") && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {results.analysis.summary}
                      </p>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Strengths */}
            <Card>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleSection("strengths")}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    강점 영역
                  </CardTitle>
                  {expandedSections.includes("strengths") ? <ChevronUp /> : <ChevronDown />}
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.includes("strengths") && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {results.analysis.strengths}
                      </p>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Observation Points */}
            <Card>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleSection("observations")}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-orange-500" />
                    관찰 포인트
                  </CardTitle>
                  {expandedSections.includes("observations") ? <ChevronUp /> : <ChevronDown />}
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.includes("observations") && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {results.analysis.observations}
                      </p>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Activities Guide */}
            <Card>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleSection("activities")}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-green-500" />
                    추천 활동 가이드
                  </CardTitle>
                  {expandedSections.includes("activities") ? <ChevronUp /> : <ChevronDown />}
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.includes("activities") && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {results.analysis.activities}
                      </p>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Professional Consultation */}
            <Card>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleSection("consultation")}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    전문 상담 안내
                  </CardTitle>
                  {expandedSections.includes("consultation") ? <ChevronUp /> : <ChevronDown />}
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.includes("consultation") && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {results.analysis.consultation}
                      </p>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mt-6 bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">중요 안내</h4>
                  <p className="text-sm text-yellow-800 leading-relaxed">
                    본 자가체크는 <strong>진단 도구가 아닙니다</strong>. 
                    부모님의 일상 관찰을 바탕으로 아이의 발달 특성을 이해하는 참고 자료로만 활용하세요. 
                    결과에 대해 걱정되는 부분이 있거나, 발달에 대한 정확한 평가가 필요하시다면 
                    소아청소년과 전문의 또는 발달 전문가와 상담하시기 바랍니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onBack} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            다른 검사 보기
          </Button>
          <Button className="gap-2 bg-green-600 hover:bg-green-700">
            <MessageCircle className="w-4 h-4" />
            전문가 상담 예약
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SocialBehaviorCheckResult;
