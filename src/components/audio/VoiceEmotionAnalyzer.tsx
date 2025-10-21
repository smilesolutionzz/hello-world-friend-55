import React, { useState } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Heart, Lightbulb, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmotionAnalysis {
  emotions: string[];
  dominant_emotion: string;
  intensity: string;
  summary: string;
  suggestions: string[];
}

export const VoiceEmotionAnalyzer: React.FC = () => {
  const { toast } = useToast();
  const [transcription, setTranscription] = useState<string>('');
  const [analysis, setAnalysis] = useState<EmotionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTranscription = async (text: string) => {
    setTranscription(text);
    setIsAnalyzing(true);

    try {
      console.log('Analyzing emotion...');
      
      const { data, error } = await supabase.functions.invoke('voice-emotion-analysis', {
        body: { text }
      });

      if (error) {
        throw error;
      }

      setAnalysis(data);
      
      toast({
        title: "분석 완료",
        description: "감정 분석이 완료되었습니다.",
      });
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      toast({
        title: "분석 실패",
        description: error instanceof Error ? error.message : '감정 분석에 실패했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case '강함':
        return 'destructive';
      case '보통':
        return 'default';
      case '약함':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <VoiceRecorder onTranscription={handleTranscription} />

      {transcription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              음성 내용
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="whitespace-pre-wrap">{transcription}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">감정을 분석하고 있습니다...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && !isAnalyzing && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                감정 분석 결과
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">주요 감정</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-lg px-4 py-2">
                    {analysis.dominant_emotion}
                  </Badge>
                  <Badge variant={getIntensityColor(analysis.intensity)}>
                    {analysis.intensity}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">감지된 감정들</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.emotions.map((emotion, idx) => (
                    <Badge key={idx} variant="outline">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">감정 요약</h3>
                <p className="text-sm bg-muted/50 rounded-lg p-3">
                  {analysis.summary}
                </p>
              </div>
            </CardContent>
          </Card>

          {analysis.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  추천 조언
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
