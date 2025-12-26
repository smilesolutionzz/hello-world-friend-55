import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Home, RefreshCw, Download, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoryInfo } from '@/data/motorDevelopmentQuestions';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import ModernAnalysisLoading from './ModernAnalysisLoading';
import { supabase } from '@/integrations/supabase/client';

interface MotorDevelopmentResultProps {
  results: {
    totalScore: number;
    maxScore: number;
    percentage: number;
    developmentLevel: string;
    developmentDescription: string;
    categoryScores: Record<string, number>;
    strengths: string[];
    weaknesses: string[];
    ageInMonths: number;
    questionCount: number;
  };
  answers?: Record<string, number>;
  onBack: () => void;
}

const MotorDevelopmentResult: React.FC<MotorDevelopmentResultProps> = ({ results, answers, onBack }) => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

  useEffect(() => {
    generateAIAnalysis();
  }, []);

  const generateAIAnalysis = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-motor-development', {
        body: {
          results,
          answers,
          ageInMonths: results.ageInMonths,
        }
      });

      if (error) throw error;
      setAiAnalysis(data.analysis || generateFallbackAnalysis());
    } catch (err) {
      console.error('AI 분석 오류:', err);
      setAiAnalysis(generateFallbackAnalysis());
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateFallbackAnalysis = () => {
    const ageYears = Math.floor(results.ageInMonths / 12);
    const ageMonths = results.ageInMonths % 12;
    
    return `
## 운동발달 종합 분석 리포트

### 📊 검사 개요
- 대상 연령: ${ageYears}세 ${ageMonths}개월
- 평가 문항: ${results.questionCount}개
- 종합 점수: ${results.percentage}점 (${results.developmentLevel})

### 💪 강점 영역
${results.strengths.length > 0 
  ? results.strengths.map(s => `- ${s}: 해당 영역에서 우수한 발달을 보이고 있습니다.`).join('\n')
  : '- 전반적으로 균형 잡힌 발달을 보이고 있습니다.'}

### 🎯 발달 지원이 필요한 영역
${results.weaknesses.length > 0 
  ? results.weaknesses.map(w => `- ${w}: 놀이 활동을 통한 추가적인 경험이 도움이 됩니다.`).join('\n')
  : '- 현재 특별히 우려되는 영역은 없습니다.'}

### 📝 발달 지원 제안
1. **일상 속 신체놀이**: 매일 30분 이상 다양한 신체활동을 경험하게 해주세요.
2. **또래와 함께하는 활동**: 친구들과 함께하는 놀이는 사회성과 운동능력을 동시에 발달시킵니다.
3. **안전한 도전**: 아이가 새로운 움직임을 시도할 때 격려해 주세요.
4. **규칙적인 운동 습관**: 수영, 태권도 등 정기적인 체육활동을 고려해 보세요.

### ⚠️ 참고사항
본 결과는 보호자의 관찰을 바탕으로 한 선별 검사 결과입니다. 
발달에 대한 우려가 있으시면 소아재활의학과 또는 발달센터 전문가 상담을 권장드립니다.
    `;
  };

  if (isAnalyzing) {
    return (
      <ModernAnalysisLoading
        title="운동발달 분석 중"
        description="AI가 아이의 운동발달 패턴을 분석하고 있습니다"
      />
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case '우수': return 'bg-green-500';
      case '양호': return 'bg-blue-500';
      case '보통': return 'bg-yellow-500';
      case '관찰필요': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const chartData = Object.entries(results.categoryScores).map(([key, value]) => ({
    name: categoryInfo[key as keyof typeof categoryInfo]?.name || key,
    icon: categoryInfo[key as keyof typeof categoryInfo]?.icon || '📊',
    score: value,
    fill: value >= 70 ? '#22c55e' : value >= 50 ? '#eab308' : '#ef4444',
  }));

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl" id="motor-development-result">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        돌아가기
      </Button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <div className="text-center">
            <div className="text-5xl mb-3">🤸</div>
            <h1 className="text-2xl font-bold mb-2">운동발달 검사 결과</h1>
            <p className="opacity-90 text-sm mb-4">
              {Math.floor(results.ageInMonths / 12)}세 {results.ageInMonths % 12}개월 아동 기준
            </p>
            
            <div className="flex justify-center items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold">{results.percentage}점</div>
                <div className="text-sm opacity-80">종합 점수</div>
              </div>
              <Badge className={`${getLevelColor(results.developmentLevel)} text-white text-lg px-4 py-2`}>
                {results.developmentLevel}
              </Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Development Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-5 mb-6">
          <p className="text-foreground">{results.developmentDescription}</p>
        </Card>
      </motion.div>

      {/* Category Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-5 mb-6">
          <h3 className="font-bold text-lg mb-4">📊 영역별 발달 수준</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, '점수']}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            {Object.entries(results.categoryScores).map(([key, value]) => {
              const info = categoryInfo[key as keyof typeof categoryInfo];
              return (
                <div key={key} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <span className="text-xl">{info?.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{info?.name}</div>
                    <Progress value={value} className="h-2 mt-1" />
                  </div>
                  <span className="text-sm font-bold">{value}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Strengths & Weaknesses */}
      {(results.strengths.length > 0 || results.weaknesses.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">💪 강점 영역</h4>
            {results.strengths.length > 0 ? (
              <ul className="text-sm space-y-1">
                {results.strengths.map((s, i) => (
                  <li key={i} className="text-green-600 dark:text-green-400">• {s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">균형 잡힌 발달</p>
            )}
          </Card>

          <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">🎯 지원 필요</h4>
            {results.weaknesses.length > 0 ? (
              <ul className="text-sm space-y-1">
                {results.weaknesses.map((w, i) => (
                  <li key={i} className="text-amber-600 dark:text-amber-400">• {w}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">우려 영역 없음</p>
            )}
          </Card>
        </motion.div>
      )}

      {/* AI Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-5 mb-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-lg">AI 전문가 분석</h3>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {aiAnalysis}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3"
      >
        <Button 
          onClick={() => navigate('/assessment')}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          다른 검사 하기
        </Button>
        <Button 
          onClick={() => navigate('/dashboard')}
          variant="outline"
          size="lg"
        >
          <Home className="w-4 h-4 mr-2" />
          홈으로 돌아가기
        </Button>
      </motion.div>
    </div>
  );
};

export default MotorDevelopmentResult;
