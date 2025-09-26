import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Youtube, ExternalLink, Play, Clock, FileText } from "lucide-react";
import YouTubePlayer from "@/components/ui/youtube-player";

interface ContentRecommendation {
  title: string;
  description: string;
  youtubeUrl: string;
  blogUrl?: string;
  category: string;
  duration: string;
  reason: string;
}

interface ContentRecommendationPanelProps {
  session: any;
}

const ContentRecommendationPanel: React.FC<ContentRecommendationPanelProps> = ({ session }) => {
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateContentRecommendations = async () => {
    setIsLoading(true);
    try {
      const observationText = session?.observations?.raw_data?.text || '';
      const analysisResult = session?.observations?.analysis_data?.report?.situation || 
                            session?.observations?.ai_analysis || '';
      
      console.log('Content recommendation request:', {
        observationText: observationText.substring(0, 100) + '...',
        ageGroup: session?.observations?.raw_data?.ageGroup || 'child',
        tags: session?.observations?.raw_data?.tags || [],
        analysisResult: analysisResult.substring(0, 100) + '...'
      });
      
      const { data, error } = await supabase.functions.invoke('content-recommender', {
        body: {
          observationText,
          ageGroup: session?.observations?.raw_data?.ageGroup || 'child',
          tags: session?.observations?.raw_data?.tags || [],
          analysisResult
        }
      });

      if (error) throw error;

      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
        toast({
          title: "컨텐츠 추천 완료",
          description: `${data.recommendations.length}개의 맞춤형 유튜브 컨텐츠를 추천받았습니다.`,
        });
      } else {
        throw new Error('컨텐츠 추천에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error generating content recommendations:', error);
      toast({
        title: "오류",
        description: "컨텐츠 추천 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      '발달놀이': 'bg-blue-100 text-blue-800 border-blue-200',
      '부모교육': 'bg-green-100 text-green-800 border-green-200',
      '치료방법': 'bg-purple-100 text-purple-800 border-purple-200',
      '행동교정': 'bg-red-100 text-red-800 border-red-200',
      '감정조절': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      '사회성향상': 'bg-pink-100 text-pink-800 border-pink-200',
      // 성인용 카테고리 추가
      '심리상담': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      '스트레스관리': 'bg-orange-100 text-orange-800 border-orange-200',
      '인지치료': 'bg-teal-100 text-teal-800 border-teal-200',
      '마음챙김': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      '업무스트레스': 'bg-slate-100 text-slate-800 border-slate-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleYoutubeClick = (url: string) => {
    // 새 탭에서 유튜브 링크 열기
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleBlogClick = (url: string) => {
    // 새 탭에서 블로그 링크 열기
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            AIH 맞춤 컨텐츠 추천
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            관찰 내용을 바탕으로 도움이 될 유튜브 컨텐츠를 추천합니다
          </p>
        </div>
        
        <Button 
          onClick={generateContentRecommendations}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              추천 중...
            </>
          ) : (
            <>
              <Youtube className="h-4 w-4 mr-2" />
              컨텐츠 추천받기
            </>
          )}
        </Button>
      </div>

      {/* Content Recommendations */}
      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((content, index) => (
            <Card key={index} className="border-l-4 border-l-red-600 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-start gap-2">
                    <Play className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{content.title}</span>
                  </CardTitle>
                  <div className="flex flex-col gap-2 ml-4">
                    <Badge className={getCategoryColor(content.category)}>
                      {content.category}
                    </Badge>
                    {content.duration && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {content.duration}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {content.description}
                </p>
                
                {content.reason && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-sm text-blue-900 mb-1">
                      추천 이유
                    </h4>
                    <p className="text-blue-800 text-sm">{content.reason}</p>
                  </div>
                )}
                
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    {/* YouTube 검색 페이지인 경우 embed 대신 외부 링크로 처리 */}
                    {content.youtubeUrl.includes('youtube.com/results') || content.youtubeUrl.includes('search_query=') ? (
                      <Button 
                        onClick={() => handleYoutubeClick(content.youtubeUrl)}
                        className="bg-red-600 hover:bg-red-700 text-white flex-1"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        유튜브에서 제목을 검색해보세요
                      </Button>
                    ) : (
                      <YouTubePlayer title={content.title} youtubeUrl={content.youtubeUrl}>
                        <Button className="bg-red-600 hover:bg-red-700 text-white flex-1">
                          <Play className="h-4 w-4 mr-2" />
                          동영상 재생
                        </Button>
                      </YouTubePlayer>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={() => handleYoutubeClick(content.youtubeUrl)}
                      className="px-3"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(content.youtubeUrl);
                        toast({
                          description: "YouTube 링크가 클립보드에 복사되었습니다.",
                        });
                      }}
                      className="px-3"
                    >
                      <Youtube className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* 블로그 링크가 있는 경우 추가 버튼 표시 */}
                  {content.blogUrl && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleBlogClick(content.blogUrl!)}
                        variant="outline" 
                        className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        관련 블로그 글 보기
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(content.blogUrl!);
                          toast({
                            description: "블로그 링크가 클립보드에 복사되었습니다.",
                          });
                        }}
                        className="px-3 border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="text-center pt-4">
            <Button 
              variant="outline" 
              onClick={generateContentRecommendations}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  새로 추천 중...
                </>
              ) : (
                <>
                  <Youtube className="h-4 w-4 mr-2" />
                  새로운 컨텐츠 추천받기
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        !isLoading && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Youtube className="h-12 w-12 mx-auto mb-4 text-red-600" />
              <h3 className="font-medium mb-2">맞춤 컨텐츠 추천</h3>
              <p className="text-muted-foreground text-sm mb-4">
                관찰 내용을 바탕으로 개선에 도움이 될 유튜브 컨텐츠를 추천받으세요.<br/>
                전문가가 엄선한 양질의 교육 컨텐츠를 제공합니다.
              </p>
              <Button 
                onClick={generateContentRecommendations}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Youtube className="h-4 w-4 mr-2" />
                컨텐츠 추천받기
              </Button>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
};

export default ContentRecommendationPanel;