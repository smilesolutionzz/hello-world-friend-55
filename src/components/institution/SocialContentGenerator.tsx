import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Download, RefreshCw, Instagram, Loader2, Copy, FileText, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContentPost {
  channel: 'instagram' | 'blog' | 'threads';
  type: string;
  title: string;
  content: string;
  imageUrl: string;
  hashtags?: string[];
  seoKeywords?: string[];
}

interface SocialContentGeneratorProps {
  institutionName?: string;
}

export function SocialContentGenerator({ institutionName }: SocialContentGeneratorProps) {
  const [contents, setContents] = useState<ContentPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customInstitutionName, setCustomInstitutionName] = useState(institutionName || "");
  const [contentTopic, setContentTopic] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['instagram', 'blog', 'threads']);
  const { toast } = useToast();

  const channels = [
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { id: 'blog', label: 'Blog', icon: FileText, color: 'text-blue-500' },
    { id: 'threads', label: 'Threads', icon: MessageSquare, color: 'text-purple-500' }
  ];

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const generateContent = async () => {
    if (!customInstitutionName.trim()) {
      toast({
        title: "기관명을 입력해주세요",
        description: "컨텐츠 생성을 위해 기관명이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    if (selectedChannels.length === 0) {
      toast({
        title: "채널을 선택해주세요",
        description: "최소 1개 이상의 채널을 선택해야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('social-content-generator', {
        body: {
          action: 'generate',
          institutionName: customInstitutionName,
          contentTopic: contentTopic || undefined,
          channels: selectedChannels
        }
      });

      if (error) throw error;

      if (data?.contents) {
        setContents(data.contents);
        toast({
          title: "콘텐츠 생성 완료! 🎉",
          description: `${data.contents.length}개의 맞춤형 콘텐츠가 생성되었습니다.`,
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

  const getChannelIcon = (channel: string) => {
    const channelData = channels.find(c => c.id === channel);
    const Icon = channelData?.icon || Instagram;
    return <Icon className={`w-5 h-5 ${channelData?.color}`} />;
  };

  const contentsByChannel = {
    instagram: contents.filter(c => c.channel === 'instagram'),
    blog: contents.filter(c => c.channel === 'blog'),
    threads: contents.filter(c => c.channel === 'threads')
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-500/10 via-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">🎉 체험 기간 - 모든 고객 이용 가능!</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          현재 체험 기간으로 일반 고객도 무료로 이용하실 수 있습니다. AI가 Instagram, Blog, Threads에 맞춤화된 콘텐츠를 자동으로 생성합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            소셜 미디어 콘텐츠 생성
          </CardTitle>
          <CardDescription>
            기관명과 주제를 입력하면 AI가 각 채널에 최적화된 콘텐츠를 생성합니다
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

          <div className="space-y-3">
            <Label>발행 채널 선택</Label>
            <div className="grid grid-cols-3 gap-3">
              {channels.map((channel) => {
                const Icon = channel.icon;
                const isSelected = selectedChannels.includes(channel.id);
                return (
                  <div
                    key={channel.id}
                    onClick={() => handleChannelToggle(channel.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleChannelToggle(channel.id)}
                    />
                    <Icon className={`w-4 h-4 ${channel.color}`} />
                    <span className="text-sm font-medium">{channel.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Button 
            onClick={generateContent}
            disabled={isGenerating}
            size="lg"
            className="w-full bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 hover:opacity-90 text-white"
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
              onClick={generateContent}
              disabled={isGenerating}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              재생성
            </Button>
          </div>

          <Tabs defaultValue="instagram" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {channels.map((channel) => {
                const Icon = channel.icon;
                const count = contentsByChannel[channel.id as keyof typeof contentsByChannel].length;
                return (
                  <TabsTrigger key={channel.id} value={channel.id}>
                    <Icon className={`w-4 h-4 mr-2 ${channel.color}`} />
                    {channel.label} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {channels.map((channel) => (
              <TabsContent key={channel.id} value={channel.id} className="space-y-4">
                {contentsByChannel[channel.id as keyof typeof contentsByChannel].length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">
                        이 채널의 콘텐츠가 생성되지 않았습니다.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contentsByChannel[channel.id as keyof typeof contentsByChannel].map((content, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            {getChannelIcon(content.channel)}
                            <Badge variant="outline">{content.type}</Badge>
                          </div>
                          <CardTitle className="text-lg">{content.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* 이미지 */}
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                            <img 
                              src={content.imageUrl} 
                              alt={content.title}
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                            />
                          </div>

                          {/* 콘텐츠 본문 */}
                          <div className="space-y-2">
                            <p className="font-semibold text-sm text-muted-foreground">📝 본문</p>
                            <div className="text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border max-h-48 overflow-y-auto">
                              {content.content}
                            </div>
                          </div>

                          {/* 해시태그 또는 SEO 키워드 */}
                          {content.hashtags && content.hashtags.length > 0 && (
                            <div>
                              <p className="font-semibold text-sm text-primary mb-2">🏷️ 해시태그</p>
                              <p className="text-sm text-muted-foreground">{content.hashtags.join(' ')}</p>
                            </div>
                          )}
                          {content.seoKeywords && content.seoKeywords.length > 0 && (
                            <div>
                              <p className="font-semibold text-sm text-primary mb-2">🔍 SEO 키워드</p>
                              <p className="text-sm text-muted-foreground">{content.seoKeywords.join(', ')}</p>
                            </div>
                          )}

                          {/* 액션 버튼 */}
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              onClick={() => downloadImage(content.imageUrl, content.title)}
                              variant="outline"
                              size="sm"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              이미지
                            </Button>
                            <Button
                              onClick={() => {
                                const fullText = content.hashtags 
                                  ? `${content.content}\n\n${content.hashtags.join(' ')}`
                                  : content.content;
                                copyToClipboard(fullText, "콘텐츠");
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              복사
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      {contents.length === 0 && !isGenerating && (
        <Card className="bg-muted/30">
          <CardContent className="py-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              기관명을 입력하고 채널을 선택한 후 생성 버튼을 눌러 맞춤형 콘텐츠를 만들어보세요.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
