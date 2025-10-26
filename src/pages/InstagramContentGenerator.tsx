import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Download, RefreshCw, Instagram, Loader2, Copy, Wand2 } from "lucide-react";
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
  originalImageUrl: string;
  textOverlayImageUrl?: string;
  hashtags: string[];
}

const InstagramContentGenerator = () => {
  const [contents, setContents] = useState<ContentPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeImageView, setActiveImageView] = useState<{[key: number]: 'overlay' | 'original'}>({});
  const { toast } = useToast();

  // 텍스트를 이미지에 오버레이하는 함수
  const drawTextOverlay = (index: number, content: ContentPost) => {
    const canvas = document.getElementById(`canvas-${index}`) as HTMLCanvasElement;
    const img = document.getElementById(`original-${index}`) as HTMLImageElement;
    
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = 1080;
    canvas.height = 1080;

    // 원본 이미지 그리기
    ctx.drawImage(img, 0, 0, 1080, 1080);

    // 그라디언트 오버레이
    const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // 텍스트 그림자 설정
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // 제목 텍스트
    ctx.font = 'bold 64px Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 텍스트가 너무 길면 줄바꿈
    const maxWidth = 900;
    const words = content.title.split(' ');
    let line = '';
    let y = 880;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, 540, y);
        line = words[i] + ' ';
        y += 70;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 540, y);

    // 메인 텍스트
    ctx.font = '42px Arial, sans-serif';
    ctx.fillText(content.mainText, 540, y + 80);
  };

  const contentTypes = [
    { type: '나의_이야기', emoji: '📖', color: 'from-red-500 to-pink-500', title: '1. 나의 이야기' },
    { type: '라이프스타일', emoji: '✨', color: 'from-purple-500 to-indigo-500', title: '2. 나의 라이프스타일' },
    { type: '가진_지식', emoji: '🎓', color: 'from-blue-500 to-cyan-500', title: '3. 내가 가진 지식' },
    { type: '문제_해결', emoji: '💡', color: 'from-orange-500 to-yellow-500', title: '4. 나의 문제 해결 사례' }
  ];

  const generateWeeklyContent = async () => {

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('instagram-content-generator', {
        body: {
          action: 'generate'
        }
      });

      if (error) throw error;

      if (data?.contents) {
        setContents(data.contents);
        // 모든 컨텐츠의 초기 뷰를 'overlay'로 설정
        const initialViews: {[key: number]: 'overlay' | 'original'} = {};
        data.contents.forEach((_: any, index: number) => {
          initialViews[index] = 'overlay';
        });
        setActiveImageView(initialViews);
        
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

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "복사 완료",
        description: `${type}이(가) 클립보드에 복사되었습니다.`,
      });
    } catch (error) {
      console.error('복사 오류:', error);
      toast({
        title: "복사 실패",
        description: "복사 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const copyImageToClipboard = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      toast({
        title: "이미지 복사 완료",
        description: "이미지가 클립보드에 복사되었습니다. 인스타그램에 붙여넣기 하세요!",
      });
    } catch (error) {
      console.error('이미지 복사 오류:', error);
      toast({
        title: "이미지 복사 실패",
        description: "이미지 복사를 지원하지 않는 브라우저입니다. 다운로드를 이용해주세요.",
        variant: "destructive",
      });
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

  const copyFullContent = (content: ContentPost) => {
    const fullText = `${content.title}

${content.mainText}

${content.subPoints.map(point => `• ${point}`).join('\n')}

${content.hashtags.join(' ')}`;
    
    copyToClipboard(fullText, "전체 콘텐츠");
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

        {/* 생성 버튼 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI 콘텐츠 생성
            </CardTitle>
            <CardDescription>
              플랫폼 맞춤형 4가지 콘텐츠를 AI가 자동 생성합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      {/* 이미지 탭 */}
                      <div className="space-y-3">
                        <div className="flex gap-2 border-b pb-2">
                          <Button
                            variant={activeImageView[index] === 'overlay' ? 'default' : 'ghost'}
                            size="sm"
                            className="flex-1"
                            onClick={() => setActiveImageView({...activeImageView, [index]: 'overlay'})}
                          >
                            텍스트 삽입
                          </Button>
                          <Button
                            variant={activeImageView[index] === 'original' ? 'default' : 'ghost'}
                            size="sm"
                            className="flex-1"
                            onClick={() => setActiveImageView({...activeImageView, [index]: 'original'})}
                          >
                            원본 이미지
                          </Button>
                        </div>

                        {/* 이미지 표시 */}
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                          {activeImageView[index] === 'overlay' ? (
                            <>
                              <canvas 
                                id={`canvas-${index}`}
                                className="w-full h-full object-cover"
                              />
                              <img 
                                id={`original-${index}`}
                                src={content.originalImageUrl} 
                                alt={content.title}
                                className="hidden"
                                crossOrigin="anonymous"
                                onLoad={() => drawTextOverlay(index, content)}
                              />
                            </>
                          ) : (
                            <img 
                              src={content.originalImageUrl} 
                              alt={`${content.title} 원본`}
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              onClick={() => {
                                const isOverlay = activeImageView[index] === 'overlay';
                                if (isOverlay) {
                                  const canvas = document.getElementById(`canvas-${index}`) as HTMLCanvasElement;
                                  if (canvas) {
                                    canvas.toBlob((blob) => {
                                      if (blob) {
                                        navigator.clipboard.write([
                                          new ClipboardItem({ [blob.type]: blob })
                                        ]).then(() => {
                                          toast({
                                            title: "이미지 복사 완료",
                                            description: "텍스트가 삽입된 이미지가 복사되었습니다.",
                                          });
                                        });
                                      }
                                    });
                                  }
                                } else {
                                  copyImageToClipboard(content.originalImageUrl);
                                }
                              }}
                              size="sm"
                              variant="secondary"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              복사
                            </Button>
                          </div>
                        </div>
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

                        {content.hashtags.length > 0 && (
                          <div>
                            <p className="font-semibold text-sm text-primary mb-1">🏷️ 해시태그</p>
                            <p className="text-sm text-muted-foreground">{content.hashtags.join(' ')}</p>
                          </div>
                        )}
                      </div>

                      {/* 액션 버튼 */}
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          onClick={() => {
                            const canvas = document.getElementById(`canvas-${index}`) as HTMLCanvasElement;
                            if (canvas) {
                              canvas.toBlob((blob) => {
                                if (blob) {
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `${content.title}_텍스트삽입.png`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  window.URL.revokeObjectURL(url);
                                  toast({
                                    title: "다운로드 완료",
                                    description: "텍스트가 삽입된 이미지가 저장되었습니다.",
                                  });
                                }
                              });
                            }
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          텍스트 이미지
                        </Button>
                        <Button
                          onClick={() => downloadImage(content.originalImageUrl, `${content.title}_원본`)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          원본 이미지
                        </Button>
                        <Button
                          onClick={() => copyFullContent(content)}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          텍스트
                        </Button>
                      </div>
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
                생성 버튼을 클릭하면<br />
                AI가 플랫폼에 최적화된 4가지 콘텐츠를 자동으로 만들어드립니다
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
