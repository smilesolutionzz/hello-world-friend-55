import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';

interface Resource {
  source: string;
  title: string;
  content: string;
  url: string;
  scrapedAt: string;
}

interface ResourceRecommendationsProps {
  keywords: string[];
  childAge?: number;
  behaviorType?: string;
}

export function ResourceRecommendations({ keywords, childAge, behaviorType }: ResourceRecommendationsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [query, setQuery] = useState('');

  const fetchResources = async () => {
    if (!keywords || keywords.length === 0) {
      toast({
        title: '키워드가 필요합니다',
        description: '관찰일지를 먼저 작성해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('crawl-parenting-resources', {
        body: {
          keywords,
          childAge: childAge || 5,
          behaviorType: behaviorType || '발달',
        },
      });

      if (error) throw error;

      if (data.success) {
        setResources(data.resources);
        setQuery(data.query);
        toast({
          title: '자료 수집 완료',
          description: data.message,
        });
      } else {
        throw new Error(data.error || '자료 수집 실패');
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: '오류',
        description: '자료를 가져오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const extractSummary = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    return lines.slice(0, 5).join('\n');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI 추천 육아 자료</CardTitle>
          </div>
          <Button
            onClick={fetchResources}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                수집 중...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                자료 찾기
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          관찰일지 내용을 바탕으로 전문 육아 자료를 자동으로 수집합니다
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        )}

        {!loading && resources.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>아직 수집된 자료가 없습니다.</p>
            <p className="text-sm mt-2">위의 '자료 찾기' 버튼을 눌러 관련 정보를 찾아보세요.</p>
          </div>
        )}

        {!loading && resources.length > 0 && (
          <div className="space-y-4">
            {query && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">검색 쿼리</p>
                <p className="font-medium">{query}</p>
              </div>
            )}

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {resources.map((resource, index) => (
                  <Card key={index} className="border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{resource.source}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(resource.scrapedAt).toLocaleString('ko-KR')}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <pre className="whitespace-pre-wrap text-sm">
                          {extractSummary(resource.content)}
                        </pre>
                        {resource.content.split('\n').length > 5 && (
                          <Button
                            variant="link"
                            size="sm"
                            className="mt-2 p-0 h-auto"
                            asChild
                          >
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              전체 내용 보기 →
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
