import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PersonalityAnalysisProps {
  testData: any[];
  observations: any[];
}

export function PersonalityAnalysis({ testData, observations }: PersonalityAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('personality-analysis', {
        body: { 
          testData: testData.slice(0, 5),
          observations: observations.slice(0, 5)
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        toast({
          title: "분석 실패",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setAnalysis(data.analysis);
      toast({
        title: "분석 완료",
        description: "AI 기반 성격 분석이 생성되었습니다.",
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "분석 오류",
        description: error.message || "분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="w-5 h-5 text-purple-400" />
          AI 성격 분석
        </CardTitle>
        <CardDescription className="text-slate-400">
          검사 데이터를 기반으로 한 객관적인 성격 분석
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-slate-400 mb-4 text-sm">
              검사 데이터를 분석하여 성격 특성을 파악합니다
            </p>
            <Button 
              onClick={generateAnalysis}
              disabled={loading || (testData.length === 0 && observations.length === 0)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  분석 시작
                </>
              )}
            </Button>
            {testData.length === 0 && observations.length === 0 && (
              <p className="text-xs text-slate-500 mt-2">
                분석할 데이터가 없습니다
              </p>
            )}
          </div>
        ) : (
          <div>
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                {analysis}
              </div>
            </div>
            <Button 
              onClick={generateAnalysis}
              disabled={loading}
              variant="outline"
              className="mt-4 border-slate-700 text-slate-300 hover:bg-slate-800"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  재분석 중...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  재분석
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
