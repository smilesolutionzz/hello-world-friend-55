import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  Shield,
  Phone,
  MessageCircle,
  Brain,
  Activity,
  Mic,
  MicOff,
  Send,
  RefreshCw,
  Heart,
  MapPin
} from 'lucide-react';

interface CrisisAnalysis {
  crisisLevel: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number;
  confidence: number;
  matchedKeywords: string[];
  immediateActionNeeded: boolean;
}

interface EmergencyContact {
  name: string;
  number: string;
  priority: number;
  description: string;
}

export const RealtimeCrisisDetector = () => {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CrisisAnalysis | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 실시간 분석 (디바운스 적용)
  const analyzeText = useCallback(async (inputText: string) => {
    if (inputText.length < 5) {
      setAnalysis(null);
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('crisis-detection-ai', {
        body: { text: inputText, context: 'realtime_monitoring' }
      });

      if (error) throw error;

      if (data?.success) {
        setAnalysis(data.analysis);
        setEmergencyContacts(data.emergencyContacts || []);
        setAiInsights(data.aiAnalysis);

        // Critical 수준일 경우 알림
        if (data.analysis?.immediateActionNeeded) {
          toast({
            title: '⚠️ 위기 상황 감지',
            description: '전문가 도움이 필요할 수 있습니다.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('[RealtimeCrisisDetector] Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  // 텍스트 변경 시 디바운스 분석
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      analyzeText(text);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [text, analyzeText]);

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-black',
      low: 'bg-green-500 text-white',
    };
    return colors[level] || 'bg-gray-500 text-white';
  };

  const getLevelText = (level: string) => {
    const texts: Record<string, string> = {
      critical: '🚨 긴급',
      high: '⚠️ 위험',
      medium: '주의',
      low: '안전',
    };
    return texts[level] || level;
  };

  return (
    <div className="space-y-6">
      {/* 입력 영역 */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">실시간 위기 감지 AI</h3>
          {isAnalyzing && (
            <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="메시지를 입력하면 실시간으로 위기 수준을 분석합니다..."
          className="min-h-[120px] mb-4"
        />

        {/* 분석 결과 */}
        {analysis && (
          <div className="space-y-4">
            {/* 위기 수준 표시 */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className={getLevelColor(analysis.crisisLevel)}>
                  {getLevelText(analysis.crisisLevel)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  위험 점수: {analysis.riskScore}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm">
                  신뢰도: {Math.round(analysis.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* 감지된 키워드 */}
            {analysis.matchedKeywords.length > 0 && (
              <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                <p className="text-sm font-medium mb-2 text-orange-700 dark:text-orange-300">
                  감지된 위험 신호:
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedKeywords.map((keyword, idx) => (
                    <Badge key={idx} variant="outline" className="text-orange-600">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* AI 인사이트 */}
            {aiInsights && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg space-y-3">
                <h4 className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI 분석 결과
                </h4>
                
                {aiInsights.primaryConcerns?.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">주요 우려사항:</p>
                    <ul className="text-sm space-y-1">
                      {aiInsights.primaryConcerns.map((concern: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3 text-orange-500" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiInsights.recommendedResponse && (
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">권장 대응:</p>
                    <p className="text-foreground">{aiInsights.recommendedResponse}</p>
                  </div>
                )}

                {aiInsights.emotionState && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-pink-500" />
                      {aiInsights.emotionState.primary}
                    </span>
                    <span className="text-muted-foreground">
                      강도: {aiInsights.emotionState.intensity}/10
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 긴급 연락처 */}
      {analysis?.immediateActionNeeded && emergencyContacts.length > 0 && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950/30">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription>
            <div className="space-y-4">
              <p className="font-semibold text-red-700 dark:text-red-300">
                즉각적인 도움이 필요합니다
              </p>
              
              <div className="grid gap-3">
                {emergencyContacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white dark:bg-background rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.description}</p>
                    </div>
                    <Button
                      onClick={() => window.open(`tel:${contact.number}`, '_self')}
                      className={contact.priority === 1 ? 'bg-red-600 hover:bg-red-700' : 'btn-brand'}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {contact.number}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RealtimeCrisisDetector;
