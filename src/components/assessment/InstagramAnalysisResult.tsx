import { motion } from "framer-motion";
import { Share2, Download, Brain, Heart, Sparkles, Target, Users, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useWordDownload } from "@/hooks/useWordDownload";

interface AnalysisResult {
  unconsciousType: {
    name: string;
    englishName: string;
    icon: string;
    description: string;
  };
  profileSummary: string;
  visualPatterns: {
    colorPreference: string;
    compositionStyle: string;
    emotionalTone: string;
  };
  languagePatterns: {
    communicationStyle: string;
    emotionalExpression: string;
    selfPresentation: string;
  };
  unconsciousIndicators: {
    socialNeedLevel: number;
    selfExpressionLevel: number;
    authenticityLevel: number;
    stabilityLevel: number;
  };
  deepAnalysis: string;
  growthSuggestions: string[];
  relationshipPatterns: string;
  hiddenDesires: string;
}

interface InstagramAnalysisResultProps {
  result: AnalysisResult;
  username: string;
  onRestart: () => void;
}

const InstagramAnalysisResult = ({ result, username, onRestart }: InstagramAnalysisResultProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    deepAnalysis: false,
    relationships: false,
    growth: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateWordDocument, printDocument } = useWordDownload();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: '나의 무의식 유형 분석 결과',
        text: `나의 무의식 유형: ${result.unconsciousType.name}`,
        url: window.location.href,
      });
    }
  };

  const handleDownload = () => {
    setIsGenerating(true);
    try {
      const data = {
        title: `인스타그램 무의식 분석 - @${username}`,
        date: new Date().toLocaleDateString('ko-KR'),
        sections: [
          {
            title: `무의식 유형: ${result.unconsciousType.name}`,
            content: `${result.unconsciousType.englishName}\n\n${result.unconsciousType.description}`
          },
          {
            title: '프로필 요약',
            content: result.profileSummary
          },
          {
            title: '시각 패턴 분석',
            content: `색감 선호: ${result.visualPatterns.colorPreference}\n구도 스타일: ${result.visualPatterns.compositionStyle}\n감정 톤: ${result.visualPatterns.emotionalTone}`
          },
          {
            title: '언어 패턴 분석',
            content: `소통 스타일: ${result.languagePatterns.communicationStyle}\n감정 표현: ${result.languagePatterns.emotionalExpression}\n자기 제시: ${result.languagePatterns.selfPresentation}`
          },
          {
            title: '무의식 지표 분석',
            content: `사회적 욕구: ${result.unconsciousIndicators.socialNeedLevel}%\n자기 표현 욕구: ${result.unconsciousIndicators.selfExpressionLevel}%\n진정성 수준: ${result.unconsciousIndicators.authenticityLevel}%\n정서적 안정도: ${result.unconsciousIndicators.stabilityLevel}%`
          },
          {
            title: '심층 무의식 분석',
            content: result.deepAnalysis
          },
          {
            title: '관계 패턴 분석',
            content: result.relationshipPatterns
          },
          {
            title: '숨겨진 욕구',
            content: result.hiddenDesires
          },
          {
            title: '성장을 위한 제안',
            content: result.growthSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')
          }
        ]
      };
      generateWordDocument(data);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0a0a0a] text-white"
    >
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-white/10 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
            <Brain className="h-6 w-6 text-black" />
          </div>
          <div>
            <p className="font-bold text-lg">AIHPRO</p>
            <p className="text-xs text-amber-500">분석 결과</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDownload} disabled={isGenerating}>
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="px-6 py-8 max-w-2xl mx-auto">
        {/* Main Type Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-8 text-center mb-8"
        >
          <p className="text-4xl mb-4">{result.unconsciousType.icon}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{result.unconsciousType.name}</h1>
          <p className="text-sm text-gray-600 mb-4">{result.unconsciousType.englishName}</p>
          <p className="text-gray-700">{result.unconsciousType.description}</p>
        </motion.div>

        {/* Profile Summary */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-amber-500 mb-3 flex items-center gap-2">
            <Users className="h-5 w-5" />
            @{username} 프로필 분석
          </h2>
          <p className="text-gray-300 leading-relaxed">{result.profileSummary}</p>
        </div>

        {/* Unconscious Indicators */}
        <div className="bg-white/5 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-amber-500 mb-4">무의식 지표 분석</h2>
          <div className="space-y-4">
            {[
              { label: "사회적 욕구", value: result.unconsciousIndicators.socialNeedLevel },
              { label: "자기 표현 욕구", value: result.unconsciousIndicators.selfExpressionLevel },
              { label: "진정성 수준", value: result.unconsciousIndicators.authenticityLevel },
              { label: "정서적 안정도", value: result.unconsciousIndicators.stabilityLevel },
            ].map((indicator, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{indicator.label}</span>
                  <span className="text-amber-500">{indicator.value}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${indicator.value}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual & Language Patterns */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-amber-500 font-semibold mb-4 flex items-center gap-2">
              📸 시각 패턴
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">색감 선호</p>
                <p className="text-white">{result.visualPatterns.colorPreference}</p>
              </div>
              <div>
                <p className="text-gray-500">구도 스타일</p>
                <p className="text-white">{result.visualPatterns.compositionStyle}</p>
              </div>
              <div>
                <p className="text-gray-500">감정 톤</p>
                <p className="text-white">{result.visualPatterns.emotionalTone}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-amber-500 font-semibold mb-4 flex items-center gap-2">
              ✍️ 언어 패턴
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">소통 스타일</p>
                <p className="text-white">{result.languagePatterns.communicationStyle}</p>
              </div>
              <div>
                <p className="text-gray-500">감정 표현</p>
                <p className="text-white">{result.languagePatterns.emotionalExpression}</p>
              </div>
              <div>
                <p className="text-gray-500">자기 제시</p>
                <p className="text-white">{result.languagePatterns.selfPresentation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deep Analysis - Expandable */}
        <div className="bg-white/5 rounded-xl mb-4 overflow-hidden">
          <button
            onClick={() => toggleSection('deepAnalysis')}
            className="w-full p-6 flex justify-between items-center"
          >
            <h3 className="text-amber-500 font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5" />
              심층 무의식 분석
            </h3>
            {expandedSections.deepAnalysis ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          {expandedSections.deepAnalysis && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              className="px-6 pb-6"
            >
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{result.deepAnalysis}</p>
            </motion.div>
          )}
        </div>

        {/* Relationship Patterns - Expandable */}
        <div className="bg-white/5 rounded-xl mb-4 overflow-hidden">
          <button
            onClick={() => toggleSection('relationships')}
            className="w-full p-6 flex justify-between items-center"
          >
            <h3 className="text-amber-500 font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5" />
              관계 속 가면 패턴
            </h3>
            {expandedSections.relationships ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          {expandedSections.relationships && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              className="px-6 pb-6"
            >
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{result.relationshipPatterns}</p>
              
              <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <h4 className="text-amber-500 font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  숨겨진 욕구
                </h4>
                <p className="text-gray-300 text-sm">{result.hiddenDesires}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Growth Suggestions - Expandable */}
        <div className="bg-white/5 rounded-xl mb-8 overflow-hidden">
          <button
            onClick={() => toggleSection('growth')}
            className="w-full p-6 flex justify-between items-center"
          >
            <h3 className="text-amber-500 font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              성장을 위한 제안
            </h3>
            {expandedSections.growth ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          {expandedSections.growth && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              className="px-6 pb-6"
            >
              <ul className="space-y-3">
                {result.growthSuggestions.map((suggestion, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-amber-500 font-bold">{index + 1}.</span>
                    <span className="text-gray-300">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* CTAs */}
        <div className="space-y-4">
          <Button 
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-6"
          >
            <Download className="mr-2 h-5 w-5" />
            전체 리포트 다운로드
          </Button>

          <div className="bg-white/5 rounded-xl p-6">
            <p className="text-center text-gray-400 mb-4">더 깊은 자기 이해를 원하시나요?</p>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/assessment/relationship-dynamics">
                <Button variant="outline" className="w-full border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                  관계 역동성 검사
                </Button>
              </Link>
              <Link to="/assessment/life-purpose">
                <Button variant="outline" className="w-full border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                  삶의 목적 탐색
                </Button>
              </Link>
            </div>
          </div>

          <Button 
            variant="ghost"
            onClick={onRestart}
            className="w-full text-gray-400"
          >
            다른 계정 분석하기
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default InstagramAnalysisResult;
