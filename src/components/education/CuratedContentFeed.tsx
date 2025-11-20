import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, BookOpen, ExternalLink, RefreshCw, Bookmark, BookmarkCheck, Filter } from 'lucide-react';

export const CuratedContentFeed = () => {
  const { toast } = useToast();
  const [content, setContent] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [curating, setCurating] = useState(false);
  const [searchTopics, setSearchTopics] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  useEffect(() => {
    loadContent();
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('education_bookmarks')
        .select('content_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setBookmarks(new Set(data?.map(b => b.content_id) || []));
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('curated_education_content')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
      toast({
        title: '오류',
        description: '콘텐츠를 불러올 수 없습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const curateContent = async () => {
    if (!searchTopics) {
      toast({
        title: '입력 필요',
        description: '검색할 주제를 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setCurating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      // 샘플 데이터 생성 (실제로는 AI API를 통해 콘텐츠를 큐레이션)
      const topics = searchTopics.split(',').map(t => t.trim());
      const sampleContent = topics.map((topic, idx) => ({
        title: `${topic}에 대한 전문가 가이드`,
        content_type: 'article',
        summary: `${topic}에 대한 최신 연구와 실용적인 조언을 담은 종합 가이드입니다. 전문가들의 인사이트와 실생활 적용 방법을 확인하세요.`,
        source_name: '교육 전문 포털',
        source_url: `https://example.com/${topic.replace(/\s+/g, '-')}`,
        target_age_group: ageGroup || '전체',
        tags: [topic, ageGroup || '전체', '교육', '발달'].filter(Boolean),
        relevance_score: 95 - idx * 5,
        is_published: true,
        created_at: new Date().toISOString(),
      }));

      // DB에 저장
      const { error: insertError } = await supabase
        .from('curated_education_content')
        .insert(sampleContent);

      if (insertError) throw insertError;

      toast({
        title: '큐레이션 완료',
        description: `${topics.length}개의 콘텐츠를 찾았습니다.`,
      });

      await loadContent();
    } catch (error: any) {
      console.error('Error curating content:', error);
      toast({
        title: '오류',
        description: error.message || '콘텐츠 큐레이션 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setCurating(false);
    }
  };

  const toggleBookmark = async (contentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: '로그인 필요',
          description: '북마크 기능을 사용하려면 로그인이 필요합니다.',
          variant: 'destructive',
        });
        return;
      }

      const isBookmarked = bookmarks.has(contentId);

      if (isBookmarked) {
        const { error } = await supabase
          .from('education_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', contentId);

        if (error) throw error;
        
        setBookmarks(prev => {
          const newSet = new Set(prev);
          newSet.delete(contentId);
          return newSet;
        });

        toast({
          title: '북마크 제거',
          description: '북마크가 제거되었습니다.',
        });
      } else {
        const { error } = await supabase
          .from('education_bookmarks')
          .insert({
            user_id: user.id,
            content_id: contentId,
            category: categoryFilter !== 'all' ? categoryFilter : null,
          });

        if (error) throw error;
        
        setBookmarks(prev => new Set([...prev, contentId]));

        toast({
          title: '북마크 추가',
          description: '북마크에 추가되었습니다.',
        });
      }
    } catch (error: any) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: '오류',
        description: error.message || '북마크 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const getContentTypeIcon = (type: string) => {
    return <BookOpen className="h-4 w-4" />;
  };

  // 필터링된 콘텐츠
  const filteredContent = content.filter(item => {
    if (showBookmarksOnly && !bookmarks.has(item.id)) return false;
    if (categoryFilter !== 'all' && !item.tags?.includes(categoryFilter)) return false;
    if (contentTypeFilter !== 'all' && item.content_type !== contentTypeFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            교육 콘텐츠 큐레이션
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="주제 입력 (쉼표로 구분)"
              value={searchTopics}
              onChange={(e) => setSearchTopics(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
            <Input
              placeholder="나이대 (선택)"
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-32"
            />
            <Button onClick={curateContent} disabled={curating}>
              {curating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" onClick={loadContent}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* 필터 옵션 */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                <SelectItem value="교육">교육</SelectItem>
                <SelectItem value="발달">발달</SelectItem>
                <SelectItem value="육아">육아</SelectItem>
                <SelectItem value="건강">건강</SelectItem>
                <SelectItem value="심리">심리</SelectItem>
              </SelectContent>
            </Select>

            <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="콘텐츠 타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 타입</SelectItem>
                <SelectItem value="article">아티클</SelectItem>
                <SelectItem value="research">연구</SelectItem>
                <SelectItem value="video">비디오</SelectItem>
                <SelectItem value="course">강의</SelectItem>
                <SelectItem value="guide">가이드</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showBookmarksOnly ? "default" : "outline"}
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className="gap-2"
            >
              <Bookmark className="h-4 w-4" />
              북마크만 보기
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredContent.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {showBookmarksOnly 
                  ? '북마크한 콘텐츠가 없습니다.' 
                  : '큐레이션된 콘텐츠가 없습니다. 위에서 주제를 검색해보세요.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredContent.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {getContentTypeIcon(item.content_type)}
                      <h3 className="font-semibold">{item.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.content_type && (
                        <Badge variant="outline">{item.content_type}</Badge>
                      )}
                      {item.target_age_group && (
                        <Badge variant="secondary">{item.target_age_group}</Badge>
                      )}
                      {item.relevance_score && (
                        <Badge>관련도: {item.relevance_score}%</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleBookmark(item.id)}
                    className="flex-shrink-0"
                  >
                    {bookmarks.has(item.id) ? (
                      <BookmarkCheck className="h-5 w-5 text-primary" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.summary && (
                  <p className="text-sm text-muted-foreground">{item.summary}</p>
                )}
                
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    출처: {item.source_name}
                  </span>
                  <Button variant="link" size="sm" asChild>
                    <a href={item.source_url} target="_blank" rel="noopener noreferrer">
                      원문 보기
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
