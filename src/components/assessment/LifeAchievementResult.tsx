import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target as TargetIcon, TrendingUp, Share2, Copy, RotateCcw, Loader2, FileText, Sparkles, History, BarChart3, Award, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useShareText } from '@/utils/shareUtils';
import { useLifeAchievementActions } from '@/hooks/useLifeAchievementActions';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

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
  const [achievementImage, setAchievementImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();
  const navigate = useNavigate();
  const { shareAsText } = useShareText();
  const { saveResult, isSaving } = useLifeAchievementActions();

  useEffect(() => {
    analyzeResults();
  }, []);

  const analyzeResults = async () => {
    try {
      console.log('Calling life-achievement-analyzer...');
      
      const { data, error } = await supabase.functions.invoke('life-achievement-analyzer', {
        body: { 
          results: result.results,
          totalScore: result.totalScore,
          level: result.level
        }
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      console.log('Analysis response:', data);

      if (data.analysis) {
        setAnalysis(data.analysis);
      }

      if (data.goals && data.goals.length > 0) {
        setNextGoals(data.goals);
      } else {
        setNextGoals([
          '건강을 위한 규칙적인 운동 시작하기',
          '재정 안정성을 위한 저축 계획 세우기',
          '취미 활동으로 삶의 균형 찾기'
        ]);
      }

      if (data.imageUrl) {
        setAchievementImage(data.imageUrl);
      }

      if (!data.success) {
        toast({
          title: '분석 완료',
          description: '일부 기능이 제한적으로 작동했지만 결과를 확인할 수 있습니다.',
          variant: 'default'
        });
      }

    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysis('현재 분석 서비스에 일시적인 문제가 있습니다. 하지만 당신의 인생 업적은 정말 훌륭합니다! 계속 앞으로 나아가세요.');
      setNextGoals([
        '건강을 위한 규칙적인 운동 시작하기',
        '재정 안정성을 위한 저축 계획 세우기',
        '취미 활동으로 삶의 균형 찾기'
      ]);
      toast({
        title: isEnglish ? 'Analysis Error' : '분석 오류',
        description: '분석 중 오류가 발생했습니다. 기본 결과를 표시합니다.',
        variant: 'destructive'
      });
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

  const handleSaveResult = async () => {
    const success = await saveResult({
      totalScore: result.totalScore,
      level: result.level,
      levelName: levelInfo.title,
      categories: result.results.map(r => ({
        title: r.category,
        score: r.score,
        total: 100
      })),
      answers: result.results
    });

    if (success) {
      toast({
        title: "저장 완료",
        description: "결과가 성공적으로 저장되었습니다.",
      });
    }
  };

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
        <Card className="border-2 border-purple-200 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className={`text-center bg-gradient-to-r ${levelInfo.color} text-white py-8 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            <div className="relative">
              <div className="flex items-center justify-center gap-3 mb-4 animate-in zoom-in duration-500">
                <Trophy className="w-12 h-12 animate-bounce" />
                <CardTitle className="text-3xl">인생 업적 달성률</CardTitle>
              </div>
              <div className="text-6xl font-bold my-6 animate-in zoom-in duration-700 delay-200">
                {result.totalScore}%
              </div>
              <p className="text-2xl animate-in slide-in-from-bottom-4 duration-500 delay-300">{levelInfo.title}</p>
              <p className="text-sm mt-2 animate-in fade-in duration-500 delay-400">레벨 {result.level}</p>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* 카테고리별 달성률 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-purple-800 mb-6 flex items-center gap-2">
                <TargetIcon className="w-6 h-6" />
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
                {/* AI 생성 이미지 */}
                {achievementImage && (
                  <div className="mb-8 rounded-xl overflow-hidden border-2 border-purple-200 shadow-lg">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      <h3 className="font-bold">AI가 그린 당신의 업적 레벨</h3>
                    </div>
                    <div className="bg-white p-4">
                      <img 
                        src={achievementImage} 
                        alt="Achievement Level Illustration" 
                        className="w-full rounded-lg"
                      />
                    </div>
                  </div>
                )}

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
                      <TargetIcon className="w-6 h-6" />
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
                  onClick={handleSaveResult}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      결과 저장하기
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleShareText}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  size="lg"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  결과 공유하기
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  onClick={onRestart}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  다시 테스트하기
                </Button>
                <Button 
                  onClick={() => navigate('/fun-tests')}
                  variant="outline" 
                  size="lg" 
                  className="flex-1 w-full sm:w-auto"
                >
                  <TargetIcon className="w-4 h-4 mr-2" />
                  다른 검사 하기
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button 
                  onClick={() => navigate('/life-achievement-goals')}
                  variant="outline" 
                  size="lg" 
                  className="flex-1 w-full sm:w-auto"
                >
                  <TargetIcon className="w-4 h-4 mr-2" />
                  목표 관리
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}