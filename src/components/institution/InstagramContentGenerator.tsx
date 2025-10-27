import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Download, RefreshCw, Instagram, Loader2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContentPost {
  type: '나의_이야기' | '라이프스타일' | '가진_지식' | '문제_해결';
  title: string;
  caption: string;
  originalImageUrl: string;
  textOverlayImageUrl?: string;
  hashtags: string[];
}

interface InstagramContentGeneratorProps {
  institutionName?: string;
}

export function InstagramContentGenerator({ institutionName }: InstagramContentGeneratorProps) {
  const [contents, setContents] = useState<ContentPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeImageView, setActiveImageView] = useState<{[key: number]: 'overlay' | 'original'}>({});
  const [customInstitutionName, setCustomInstitutionName] = useState(institutionName || "");
  const [contentTopic, setContentTopic] = useState("");
  const { toast } = useToast();

  const drawTextOverlay = (index: number, content: ContentPost) => {
    const canvas = document.getElementById(`canvas-${index}`) as HTMLCanvasElement;
    const img = document.getElementById(`original-${index}`) as HTMLImageElement;
    
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1080;
    ctx.drawImage(img, 0, 0, 1080, 1080);

    const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    ctx.font = 'bold 64px Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
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
    ctx.fillText(line, 540, 950);
  };

  const contentTypes = [
    { type: '나의_이야기', emoji: '📖', color: 'from-red-500 to-pink-500', title: '1. 나의 이야기' },
    { type: '라이프스타일', emoji: '✨', color: 'from-purple-500 to-indigo-500', title: '2. 나의 라이프스타일' },
    { type: '가진_지식', emoji: '🎓', color: 'from-blue-500 to-cyan-500', title: '3. 내가 가진 지식' },
    { type: '문제_해결', emoji: '💡', color: 'from-orange-500 to-yellow-500', title: '4. 나의 문제 해결 사례' }
  ];

  const generateWeeklyContent = async () => {
    if (!customInstitutionName.trim()) {
      toast({
        title: "기관명을 입력해주세요",
        description: "컨텐츠 생성을 위해 기관명이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('instagram-content-generator', {
        body: {
          action: 'generate',
          institutionName: customInstitutionName,
          contentTopic: contentTopic || undefined
        }
      });

      if (error) throw error;

      if (data?.contents) {
        setContents(data.contents);
        const initialViews: {[key: number]: 'overlay' | 'original'} = {};
        data.contents.forEach((_: any, index: number) => {
          initialViews[index] = 'overlay';
        });
        setActiveImageView(initialViews);
        
        toast({
          title: "콘텐츠 생성 완료! 🎉",
          description: "4개의 맞춤형 콘텐츠가 생성되었습니다.",
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
      toast({
        title: "복사 실패",
        description: "복사 중 오류가 발생했습니다.",
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
      toast({
        title: "다운로드 실패",
        description: "이미지 다운로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const copyFullContent = (content: ContentPost) => {
    const fullText = `${content.caption}

${content.hashtags.join(' ')}`;
    
    copyToClipboard(fullText, "게시글");
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-lg p-4 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Instagram className="w-5 h-5 text-pink-500" />
          <h3 className="font-semibold text-foreground">🎉 체험 기간 - 모든 고객 이용 가능!</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          현재 체험 기간으로 일반 고객도 무료로 이용하실 수 있습니다. AI가 기관에 맞춤화된 인스타그램 콘텐츠 4개를 자동으로 생성합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            기관 맞춤 콘텐츠 생성
          </CardTitle>
          <CardDescription>
            기관명과 원하는 주제를 입력하면 AI가 4가지 유형의 콘텐츠를 생성합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="institutionName">기관명 *</Label>
            <Input
              id="institutionName"
              value={customInstitutionName}
              onChange={(e) => setCustomInstitutionName(e.target.value)}
              placeholder="예: ABC심리상담센터"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contentTopic">컨텐츠 주제 (선택사항)</Label>
            <Input
              id="contentTopic"
              value={contentTopic}
              onChange={(e) => setContentTopic(e.target.value)}
              placeholder="예: 아동심리, 우울증 극복, 스트레스 관리 등"
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
                콘텐츠 생성하기
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {contents.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">생성된 콘텐츠</h2>
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

                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-sm text-muted-foreground mb-2">📝 게시글</p>
                        <div className="text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border">
                          {content.caption}
                        </div>
                      </div>

                      {content.hashtags.length > 0 && (
                        <div>
                          <p className="font-semibold text-sm text-primary mb-2">🏷️ 해시태그</p>
                          <p className="text-sm text-muted-foreground">{content.hashtags.join(' ')}</p>
                        </div>
                      )}
                    </div>

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
                        게시글 복사
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {contents.length === 0 && !isGenerating && (
        <Card className="bg-muted/30">
          <CardContent className="py-12 text-center">
            <Instagram className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              기관명을 입력하고 생성 버튼을 눌러 맞춤형 콘텐츠를 만들어보세요.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
