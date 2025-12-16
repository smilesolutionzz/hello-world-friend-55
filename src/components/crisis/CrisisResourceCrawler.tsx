import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Globe, 
  Database, 
  Loader2, 
  ExternalLink,
  Shield,
  BookOpen,
  Phone,
  Users,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CrawlResult {
  source?: string;
  name?: string;
  url: string;
  title: string;
  content: string;
  category?: string;
  isTrusted?: boolean;
  scrapedAt?: string;
}

interface KnowledgeBase {
  hotlines: CrawlResult[];
  interventionGuides: CrawlResult[];
  youthResources: CrawlResult[];
  mentalHealthInfo: CrawlResult[];
}

export const CrisisResourceCrawler: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CrawlResult[]>([]);
  const [trustedSources, setTrustedSources] = useState<CrawlResult[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [activeTab, setActiveTab] = useState('search');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('crawl-crisis-resources', {
        body: { action: 'search', searchQuery }
      });

      if (error) throw error;

      if (data?.success) {
        setSearchResults(data.results || []);
        toast({
          title: '검색 완료',
          description: `${data.resultsCount}개의 결과를 찾았습니다.`
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: '검색 실패',
        description: '다시 시도해 주세요.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrawlTrusted = async (category?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('crawl-crisis-resources', {
        body: { action: 'crawl_trusted', category }
      });

      if (error) throw error;

      if (data?.success) {
        setTrustedSources(data.sources || []);
        toast({
          title: '크롤링 완료',
          description: `${data.sourcesCount}개의 신뢰할 수 있는 출처에서 자료를 수집했습니다.`
        });
      }
    } catch (error) {
      console.error('Crawl error:', error);
      toast({
        title: '크롤링 실패',
        description: '다시 시도해 주세요.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuildKnowledgeBase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('crawl-crisis-resources', {
        body: { action: 'build_knowledge_base' }
      });

      if (error) throw error;

      if (data?.success) {
        setKnowledgeBase(data.knowledgeBase);
        toast({
          title: '지식 베이스 구축 완료',
          description: `총 ${data.totalEntries}개의 자료가 수집되었습니다.`
        });
      }
    } catch (error) {
      console.error('Build KB error:', error);
      toast({
        title: '지식 베이스 구축 실패',
        description: '다시 시도해 주세요.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'crisis_hotline':
        return <Phone className="h-4 w-4" />;
      case 'youth_counseling':
      case 'youth_welfare':
        return <Users className="h-4 w-4" />;
      case 'mental_health':
        return <BookOpen className="h-4 w-4" />;
      case 'child_protection':
        return <Shield className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'crisis_hotline':
        return '위기상담';
      case 'youth_counseling':
        return '청소년상담';
      case 'youth_welfare':
        return '청소년복지';
      case 'mental_health':
        return '정신건강';
      case 'child_protection':
        return '아동보호';
      case 'government':
        return '정부기관';
      default:
        return '일반';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          위기 자원 크롤러
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          신뢰할 수 있는 정신건강/위기 예방 자료를 실시간으로 수집합니다
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              검색
            </TabsTrigger>
            <TabsTrigger value="trusted">
              <Shield className="h-4 w-4 mr-2" />
              신뢰 출처
            </TabsTrigger>
            <TabsTrigger value="knowledge">
              <Database className="h-4 w-4 mr-2" />
              지식베이스
            </TabsTrigger>
          </TabsList>

          {/* 검색 탭 */}
          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="위기 관련 자료 검색 (예: 청소년 자살예방, 우울증 대처법)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {result.isTrusted && (
                            <Badge variant="default" className="bg-green-500">
                              <Shield className="h-3 w-3 mr-1" />
                              신뢰
                            </Badge>
                          )}
                          <h4 className="font-medium text-sm line-clamp-1">
                            {result.title}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {result.content?.substring(0, 200)}...
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(result.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {searchResults.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    검색어를 입력하여 위기 관련 자료를 찾아보세요
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 신뢰할 수 있는 출처 탭 */}
          <TabsContent value="trusted" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCrawlTrusted()}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                전체 크롤링
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCrawlTrusted('crisis_hotline')}
                disabled={isLoading}
              >
                <Phone className="h-4 w-4 mr-2" />
                위기상담
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCrawlTrusted('youth_counseling')}
                disabled={isLoading}
              >
                <Users className="h-4 w-4 mr-2" />
                청소년
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCrawlTrusted('mental_health')}
                disabled={isLoading}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                정신건강
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {trustedSources.map((source, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        {getCategoryIcon(source.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{source.source || source.title}</h4>
                          <Badge variant="secondary">
                            {getCategoryLabel(source.category)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {source.content?.substring(0, 300)}...
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0"
                            onClick={() => window.open(source.url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            원문 보기
                          </Button>
                          {source.scrapedAt && (
                            <span className="text-xs text-muted-foreground">
                              수집: {new Date(source.scrapedAt).toLocaleString('ko-KR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {trustedSources.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    버튼을 클릭하여 신뢰할 수 있는 출처에서 자료를 수집하세요
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 지식 베이스 탭 */}
          <TabsContent value="knowledge" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                AI 위기 대응을 위한 종합 지식 베이스를 구축합니다
              </p>
              <Button onClick={handleBuildKnowledgeBase} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                지식베이스 구축
              </Button>
            </div>

            {knowledgeBase && (
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="h-5 w-5 text-red-500" />
                    <h4 className="font-medium">위기상담 핫라인</h4>
                  </div>
                  <p className="text-2xl font-bold">{knowledgeBase.hotlines.length}</p>
                  <p className="text-xs text-muted-foreground">개의 자료 수집됨</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium">위기개입 가이드</h4>
                  </div>
                  <p className="text-2xl font-bold">{knowledgeBase.interventionGuides.length}</p>
                  <p className="text-xs text-muted-foreground">개의 자료 수집됨</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-green-500" />
                    <h4 className="font-medium">청소년 자원</h4>
                  </div>
                  <p className="text-2xl font-bold">{knowledgeBase.youthResources.length}</p>
                  <p className="text-xs text-muted-foreground">개의 자료 수집됨</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    <h4 className="font-medium">정신건강 정보</h4>
                  </div>
                  <p className="text-2xl font-bold">{knowledgeBase.mentalHealthInfo.length}</p>
                  <p className="text-xs text-muted-foreground">개의 자료 수집됨</p>
                </Card>
              </div>
            )}

            {!knowledgeBase && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>지식베이스 구축 버튼을 클릭하여</p>
                <p>AI 위기 대응을 위한 자료를 수집하세요</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
