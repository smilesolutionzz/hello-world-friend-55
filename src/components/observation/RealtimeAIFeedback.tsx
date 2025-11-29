import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Lightbulb, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';

interface RealtimeAIFeedbackProps {
  observationText: string;
  context?: string;
}

const RealtimeAIFeedback: React.FC<RealtimeAIFeedbackProps> = ({ 
  observationText, 
  context 
}) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const debouncedText = useDebounce(observationText, 1500);

  useEffect(() => {
    if (debouncedText && debouncedText.trim().length > 20) {
      analyzeText();
    } else {
      setAnalysis(null);
    }
  }, [debouncedText]);

  const analyzeText = async () => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke(
        'realtime-observation-analysis',
        {
          body: { text: debouncedText, context }
        }
      );

      if (error) throw error;
      setAnalysis(data);
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!analysis) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      default: return 'bg-green-500/10 text-green-600 border-green-200';
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in-50 slide-in-from-bottom-5">
      {/* AI Insight */}
      {analysis.insight && (
        <Card className={`p-4 border-2 ${getSeverityColor(analysis.severity)}`}>
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">AI 실시간 분석</p>
              <p className="text-sm">{analysis.insight}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Concerns */}
      {analysis.concerns && analysis.concerns.length > 0 && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-orange-900">주의할 점</p>
              <div className="flex flex-wrap gap-2">
                {analysis.concerns.map((concern: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="bg-white">
                    {concern}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Suggested Questions */}
      {analysis.needsMoreInfo && analysis.questions && analysis.questions.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-blue-900">
                더 정확한 분석을 위한 추가 질문
              </p>
              <ul className="space-y-1.5">
                {analysis.questions.map((question: string, idx: number) => (
                  <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {isAnalyzing && (
        <div className="text-xs text-muted-foreground text-center py-2">
          AI가 분석하는 중...
        </div>
      )}
    </div>
  );
};

export default RealtimeAIFeedback;
