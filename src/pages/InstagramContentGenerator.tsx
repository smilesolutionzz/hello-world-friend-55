import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Download, RefreshCw, Instagram, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";

interface ContentPost {
  type: '나의_이야기' | '라이프스타일' | '가진_지식' | '문제_해결';
  title: string;
  mainText: string;
  subPoints: string[];
  goal: string;
  result: string[];
  imageUrl: string;
}

const InstagramContentGenerator = () => {
  const [brandInfo, setBrandInfo] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [contents, setContents] = useState<ContentPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const contentTypes = [
    { type: '나의_이야기', emoji: '📖', color: 'from-red-500 to-pink-500', title: '1. 나의 이야기' },
    { type: '라이프스타일', emoji: '✨', color: 'from-purple-500 to-indigo-500', title: '2. 나의 라이프스타일' },
    { type: '가진_지식', emoji: '🎓', color: 'from-blue-500 to-cyan-500', title: '3. 내가 가진 지식' },
    { type: '문제_해결', emoji: '💡', color: 'from-orange-500 to-yellow-500', title: '4. 나의 문제 해결 사례' }
  ];

  const generateWeeklyContent = async () => {
    if (!brandInfo.trim()) {
      toast({
        title: "정보 입력 필요",
        description: "브랜드/비즈니스 정보를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('instagram-content-generator', {
        body: {
          brandInfo,
          targetAudience,
        }
      });

      if (error) throw error;

      if (data?.contents) {
        setContents(data.contents);
        toast({
          title: "콘텐츠 생성 완료! 🎉",
          description: "이번 주 4개의 콘텐츠가 생성되었습니다.",
        });
      }
    } catch (error) {
      console.error('콘텐츠 생성 오류:', error);
      toast({
        title: "생성 실패",
        description: "콘텐츠 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "다운로드 완료",
        description: "이미지가 다운로드되었습니다.",
      });
    } catch (error) {
      console.error('다운로드 오류:', error);
      toast({
        title: "다운로드 실패",
        description: "이미지 다운로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Instagram className="w-8 h-8 text-pink-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              인스타그램 콘텐츠 자동 생성
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            AI가 매주 4가지 유형의 전략적 콘텐츠를 자동으로 생성합니다
          </p>
        </div>

        {/* 입력 섹션 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              콘텐츠 생성 정보
            </CardTitle>
            <CardDescription>
              브랜드와 타겟 고객 정보를 입력하면 맞춤형 콘텐츠를 생성합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                브랜드/비즈니스 정보 *
              </label>
              <Textarea
                placeholder="예: 발달심리 전문 플랫폼으로 아동/청소년/성인의 심리 검사와 AI 분석을 제공합니다. 부모님들이 자녀의 발달 상태를 쉽게 확인하고 전문가 상담을 받을 수 있도록 돕습니다."
                value={brandInfo}
                onChange={(e) => setBrandInfo(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                타겟 고객 (선택사항)
              </label>
              <Textarea
                placeholder="예: 3-12세 자녀를 둔 부모님, 자녀의 발달과 심리 상태에 관심이 많은 30-40대"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <Button 
              onClick={generateWeeklyContent}
              disabled={isGenerating}
              size="lg"
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  콘텐츠 생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  이번 주 콘텐츠 생성하기
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 생성된 콘텐츠 */}
        {contents.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">이번 주 콘텐츠</h2>
              <Button
                variant="outline"
                onClick={generateWeeklyContent}
                disabled={isGenerating}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                재생성
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contents.map((content, index) => {
                const typeInfo = contentTypes.find(t => t.type === content.type);
                return (
                  <Card key={index} className="overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${typeInfo?.color}`} />
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-lg">
                          {typeInfo?.emoji} {typeInfo?.title}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{content.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 이미지 */}
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={content.imageUrl} 
                          alt={content.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* 콘텐츠 내용 */}
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-sm text-muted-foreground mb-1">메인 텍스트</p>
                          <p className="text-sm">{content.mainText}</p>
                        </div>

                        {content.subPoints.length > 0 && (
                          <div>
                            <p className="font-semibold text-sm text-muted-foreground mb-1">주요 포인트</p>
                            <ul className="space-y-1">
                              {content.subPoints.map((point, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <span className="text-primary">→</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="pt-2 border-t">
                          <p className="font-semibold text-sm text-primary mb-1">🎯 목적</p>
                          <p className="text-sm text-muted-foreground">{content.goal}</p>
                        </div>

                        {content.result.length > 0 && (
                          <div>
                            <p className="font-semibold text-sm text-primary mb-1">💫 기대 결과</p>
                            <ul className="space-y-1">
                              {content.result.map((res, i) => (
                                <li key={i} className="text-sm text-muted-foreground">- {res}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* 액션 버튼 */}
                      <Button
                        onClick={() => downloadImage(content.imageUrl, content.title)}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        이미지 다운로드
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* 안내 메시지 */}
        {contents.length === 0 && !isGenerating && (
          <Card className="bg-muted/30">
            <CardContent className="py-12 text-center">
              <Instagram className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">콘텐츠를 생성해보세요</h3>
              <p className="text-muted-foreground mb-6">
                브랜드 정보를 입력하고 생성 버튼을 클릭하면<br />
                AI가 전략적인 4가지 콘텐츠를 자동으로 만들어드립니다
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {contentTypes.map((type) => (
                  <div key={type.type} className="p-4 bg-background rounded-lg border">
                    <div className="text-3xl mb-2">{type.emoji}</div>
                    <p className="text-xs font-medium">{type.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InstagramContentGenerator;
