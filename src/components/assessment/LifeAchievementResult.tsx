import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, TrendingUp, Share2, Copy, RotateCcw, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useShareText } from '@/utils/shareUtils';

interface LifeAchievementResultProps {
  result: {
    results: Array<{
      category: string;
      score: number;
      questions: number;
    }>;
    totalScore: number;
    level: number;
  };
  onRestart: () => void;
}

export default function LifeAchievementResult({ result, onRestart }: LifeAchievementResultProps) {
  const [analysis, setAnalysis] = useState('');
  const [nextGoals, setNextGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { shareAsText } = useShareText();

  useEffect(() => {
    analyzeResults();
  }, []);

  const analyzeResults = async () => {
    try {
      const prompt = `사용자의 인생 업적 달성률 분석 결과입니다:

전체 달성률: ${result.totalScore}%
레벨: ${result.level}

카테고리별 달성률:
${result.results.map(r => `${r.category}: ${r.score}%`).join('\n')}

다음을 분석해주세요:
1. 현재 인생 단계에 대한 전반적인 평가 (100자)
2. 가장 잘하고 있는 영역과 칭찬 (80자)
3. 개선이 필요한 영역 분석 (80자)
4. 다음 달성해야 할 구체적 목표 3가지 (각 50자)

따뜻하고 동기부여가 되는 톤으로 작성해주세요.`;

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { 
          message: prompt,
          conversationHistory: []
        }
      });

      if (error) throw error;

      const analysisText = data.response;
      setAnalysis(analysisText);

      // 목표 추출 (숫자로 시작하는 줄 찾기)
      const goals = analysisText
        .split('\n')
        .filter((line: string) => /^[1-3]\./.test(line.trim()))
        .map((line: string) => line.replace(/^[1-3]\.\s*/, ''));
      
      setNextGoals(goals.length > 0 ? goals : [
        '건강을 위한 규칙적인 운동 시작하기',
        '재정 안정성을 위한 저축 계획 세우기',
        '취미 활동으로 삶의 균형 찾기'
      ]);

    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysis('현재 인생 업적 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelInfo = (level: number) => {
    if (level <= 3) return { title: '🌱 새싹 모험가', color: 'from-green-400 to-emerald-500' };
    if (level <= 5) return { title: '🚀 성장하는 도전자', color: 'from-blue-400 to-cyan-500' };
    if (level <= 7) return { title: '⭐ 빛나는 달성자', color: 'from-purple-400 to-pink-500' };
    if (level <= 9) return { title: '👑 마스터급 성공자', color: 'from-yellow-400 to-orange-500' };
    return { title: '🏆 전설의 완성자', color: 'from-red-400 to-pink-500' };
  };

  const levelInfo = getLevelInfo(result.level);

  const handleShareText = () => {
    const text = `🏆 나의 인생 업적 달성률

전체 달성률: ${result.totalScore}%
레벨: ${result.level} - ${levelInfo.title}

📊 카테고리별 달성률:
${result.results.map(r => `${r.category}: ${r.score}%`).join('\n')}

🎯 다음 목표:
${nextGoals.map((goal, i) => `${i + 1}. ${goal}`).join('\n')}

나도 테스트 해보기 👉`;

    shareAsText(text, '인생 업적 달성률');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="border-2 border-purple-200 shadow-2xl">
          <CardHeader className={`text-center bg-gradient-to-r ${levelInfo.color} text-white py-8`}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-12 h-12" />
              <CardTitle className="text-3xl">인생 업적 달성률</CardTitle>
            </div>
            <div className="text-6xl font-bold my-6">{result.totalScore}%</div>
            <p className="text-2xl">{levelInfo.title}</p>
            <p className="text-sm mt-2">레벨 {result.level}</p>
          </CardHeader>

          <CardContent className="p-8">
            {/* 카테고리별 달성률 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-purple-800 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6" />
                카테고리별 달성률
              </h3>
              <div className="space-y-4">
                {result.results.map((cat, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border border-purple-100">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{cat.category}</span>
                      <span className="font-bold text-purple-600">{cat.score}%</span>
                    </div>
                    <Progress value={cat.score} className="h-3" />
                  </div>
                ))}
              </div>
            </div>

            {/* AI 분석 */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <span className="ml-3 text-purple-600">AI가 당신의 인생을 분석하고 있습니다...</span>
              </div>
            ) : (
              <>
                <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
                  <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    AI 종합 분석
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {analysis}
                  </p>
                </div>

                {/* 다음 목표 */}
                {nextGoals.length > 0 && (
                  <div className="mb-8 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-lg border-2 border-orange-200">
                    <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                      <Target className="w-6 h-6" />
                      다음 달성할 목표
                    </h3>
                    <ul className="space-y-3">
                      {nextGoals.map((goal, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700 pt-1">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* 액션 버튼 */}
            <div className="flex flex-col gap-3 mt-8">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  onClick={handleShareText}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  size="lg"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  결과 공유하기
                </Button>
                <Button
                  onClick={onRestart}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  다시 테스트하기
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button 
                  onClick={() => navigate('/fun-tests')}
                  variant="outline" 
                  size="lg" 
                  className="flex-1 w-full sm:w-auto"
                >
                  <Target className="w-4 h-4 mr-2" />
                  다른 검사 하기
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline" 
                  size="lg" 
                  className="flex-1 w-full sm:w-auto"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  검사 기록 보기
                </Button>
              </div>
              <Button
                onClick={handleShareText}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                📋 텍스트로 복사하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}