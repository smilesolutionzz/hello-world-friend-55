import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    insight: true,
    concerns: true,
    questions: false
  });
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!analysis) return null;

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high': return 'from-red-500/20 to-red-500/5 border-red-300/50 text-red-700';
      case 'medium': return 'from-amber-500/20 to-amber-500/5 border-amber-300/50 text-amber-700';
      default: return 'from-emerald-500/20 to-emerald-500/5 border-emerald-300/50 text-emerald-700';
    }
  };

  return (
    <div className="space-y-2 animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
      {/* AI Insight - Compact */}
      {analysis.insight && (
        <div 
          className={cn(
            "rounded-xl border bg-gradient-to-br backdrop-blur-sm overflow-hidden",
            getSeverityStyles(analysis.severity)
          )}
        >
          <button 
            onClick={() => toggleSection('insight')}
            className="w-full p-3 flex items-center gap-2 text-left"
          >
            <div className="p-1.5 rounded-lg bg-white/60">
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold flex-1">AI 실시간 분석</span>
            {expandedSections.insight ? (
              <ChevronUp className="w-3.5 h-3.5 opacity-60" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            )}
          </button>
          {expandedSections.insight && (
            <div className="px-3 pb-3 -mt-1">
              <p className="text-xs leading-relaxed opacity-90">{analysis.insight}</p>
            </div>
          )}
        </div>
      )}

      {/* Concerns - Badge Style Compact */}
      {analysis.concerns && analysis.concerns.length > 0 && (
        <div className="rounded-xl border border-amber-300/50 bg-gradient-to-br from-amber-500/15 to-amber-500/5 backdrop-blur-sm overflow-hidden">
          <button 
            onClick={() => toggleSection('concerns')}
            className="w-full p-3 flex items-center gap-2 text-left"
          >
            <div className="p-1.5 rounded-lg bg-white/60">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-amber-700 flex-1">
              주의할 점 <span className="opacity-60">({analysis.concerns.length})</span>
            </span>
            {expandedSections.concerns ? (
              <ChevronUp className="w-3.5 h-3.5 text-amber-600 opacity-60" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-amber-600 opacity-60" />
            )}
          </button>
          {expandedSections.concerns && (
            <div className="px-3 pb-3 -mt-1">
              <div className="flex flex-wrap gap-1.5">
                {analysis.concerns.map((concern: string, idx: number) => (
                  <Badge 
                    key={idx} 
                    variant="secondary"
                    className="text-[10px] px-2 py-0.5 bg-white/70 text-amber-800 border-amber-200/50"
                  >
                    {concern}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggested Questions - Collapsible */}
      {analysis.needsMoreInfo && analysis.questions && analysis.questions.length > 0 && (
        <div className="rounded-xl border border-sky-300/50 bg-gradient-to-br from-sky-500/15 to-sky-500/5 backdrop-blur-sm overflow-hidden">
          <button 
            onClick={() => toggleSection('questions')}
            className="w-full p-3 flex items-center gap-2 text-left"
          >
            <div className="p-1.5 rounded-lg bg-white/60">
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <span className="text-xs font-semibold text-sky-700 flex-1">
              추가 질문 <span className="opacity-60">({analysis.questions.length})</span>
            </span>
            {expandedSections.questions ? (
              <ChevronUp className="w-3.5 h-3.5 text-sky-600 opacity-60" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-sky-600 opacity-60" />
            )}
          </button>
          {expandedSections.questions && (
            <div className="px-3 pb-3 -mt-1 space-y-1.5">
              {analysis.questions.slice(0, 3).map((question: string, idx: number) => (
                <div 
                  key={idx} 
                  className="text-[11px] text-sky-800 flex items-start gap-1.5 leading-relaxed"
                >
                  <span className="text-sky-400 mt-0.5">•</span>
                  <span className="line-clamp-2">{question}</span>
                </div>
              ))}
              {analysis.questions.length > 3 && (
                <p className="text-[10px] text-sky-500 pl-3">
                  +{analysis.questions.length - 3}개 더 보기
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="flex items-center justify-center gap-1.5 py-2">
          <Sparkles className="w-3 h-3 text-primary animate-pulse" />
          <span className="text-[10px] text-muted-foreground">AI 분석 중...</span>
        </div>
      )}
    </div>
  );
};

export default RealtimeAIFeedback;
