import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Target, CheckCircle, ArrowRight } from "lucide-react";

interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  actionSteps: string[];
}

interface RecommendationPanelProps {
  session: any;
}

const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ session }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      const analysisText = session?.observations?.analysis_data?.report?.situation || 
                          session?.observations?.ai_analysis || 
                          session?.summary || 
                          '분석 데이터가 없습니다.';

      console.log('Generating recommendations with:', {
        analysisText: analysisText.substring(0, 100) + '...',
        ageGroup: session?.observations?.raw_data?.ageGroup || 'child',
        tags: session?.observations?.raw_data?.tags || [],
        observationText: (session?.observations?.raw_data?.text || '').substring(0, 100) + '...'
      });

      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: {
          analysisText: analysisText,
          ageGroup: session?.observations?.raw_data?.ageGroup || 'child',
          tags: session?.observations?.raw_data?.tags || [],
          observationText: session?.observations?.raw_data?.text || ''
        }
      });

      if (error) throw error;

      if (data.ok && data.recommendations) {
        setRecommendations(data.recommendations);
        toast({
          title: "권고사항 생성 완료",
          description: `${data.recommendations.length}개의 맞춤형 권고사항이 생성되었습니다.`,
        });
      } else {
        throw new Error(data.message || '권고사항 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "오류",
        description: "권고사항 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '보통';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            맞춤형 권고사항
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            분석 결과를 바탕으로 한 개별화된 개입 전략
          </p>
        </div>
        
        {recommendations.length === 0 && (
          <Button 
            onClick={generateRecommendations}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                권고사항 생성
              </>
            )}
          </Button>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{rec.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(rec.priority)}>
                      {getPriorityLabel(rec.priority)}
                    </Badge>
                    <Badge variant="outline">{rec.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {rec.description}
                </p>
                
                {rec.actionSteps && rec.actionSteps.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      실행 단계
                    </h4>
                    <div className="space-y-2">
                      {rec.actionSteps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-3 text-sm">
                          <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                            {stepIndex + 1}
                          </div>
                          <span className="text-muted-foreground">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          <div className="text-center pt-4">
            <Button 
              variant="outline" 
              onClick={generateRecommendations}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  새로 생성 중...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  새로운 권고사항 생성
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        !isLoading && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-medium mb-2">맞춤 권고사항 추천</h3>
              <p className="text-muted-foreground text-sm mb-4">
                관찰 분석을 바탕으로 전문가 수준의 개선 권고사항을 제공합니다.<br/>
                구체적이고 실행 가능한 솔루션을 받아보세요.
              </p>
              <Button 
                onClick={generateRecommendations}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Target className="h-4 w-4 mr-2" />
                권고사항 생성하기
              </Button>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
};

export default RecommendationPanel;