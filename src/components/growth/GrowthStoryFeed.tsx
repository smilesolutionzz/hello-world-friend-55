import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Calendar, ArrowRight, Sparkles, Filter, Search, Quote, Star, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { mockGrowthStories } from '@/data/mockGrowthStories';
import { motion, AnimatePresence } from 'framer-motion';

interface GrowthStory {
  id: string;
  title: string;
  before_story: string;
  after_story: string;
  category: string;
  transformation_date: string | null;
  is_anonymous: boolean;
  likes_count: number;
  created_at: string;
  user_id: string;
  media_files?: string[];
  media_types?: string[];
}

interface GrowthStoryFeedProps {
  refreshTrigger?: number;
}

const GrowthStoryFeed = ({ refreshTrigger }: GrowthStoryFeedProps) => {
  const [stories, setStories] = useState<GrowthStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const categories = [
    { value: 'all', label: '전체', icon: '✨' },
    { value: 'therapy', label: '치료 경험', icon: '💊' },
    { value: 'education', label: '교육/학습', icon: '📚' },
    { value: 'emotional', label: '감정 조절', icon: '💝' },
    { value: 'family', label: '가족 관계', icon: '👨‍👩‍👧' },
    { value: 'social', label: '사회성', icon: '🤝' },
    { value: 'personal', label: '개인 성장', icon: '🌱' }
  ];

  const categoryStyles: { [key: string]: { bg: string; text: string; border: string } } = {
    therapy: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    education: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    emotional: { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' },
    family: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
    social: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
    personal: { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' }
  };

  const fetchStories = async () => {
    try {
      let query = supabase
        .from('growth_stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      let storiesData = data || [];
      
      // 실제 데이터와 Mock 데이터 합치기
      const convertedMockData = mockGrowthStories.map(mockStory => ({
        ...mockStory,
        media_files: [] as string[],
        media_types: [] as string[],
        media_urls: [] as any,
        updated_at: mockStory.created_at
      }));
      
      // 필터링된 Mock 데이터
      const filteredMock = selectedCategory === 'all' 
        ? convertedMockData 
        : convertedMockData.filter(s => s.category === selectedCategory);
      
      storiesData = [...storiesData, ...filteredMock];
      
      setStories(storiesData);
    } catch (error: any) {
      console.error('성장 스토리 로딩 오류:', error);
      const convertedMockData = mockGrowthStories.map(mockStory => ({
        ...mockStory,
        media_files: [] as string[],
        media_types: [] as string[],
        media_urls: [] as any,
        updated_at: mockStory.created_at
      }));
      setStories(convertedMockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [selectedCategory, refreshTrigger]);

  const handleLike = async (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (likedStories.has(storyId)) {
      toast({
        title: "이미 좋아요를 누르셨습니다",
        description: "한 스토리당 한 번만 좋아요를 누를 수 있습니다.",
      });
      return;
    }

    setLikedStories(prev => new Set([...prev, storyId]));
    setStories(prev => prev.map(story => 
      story.id === storyId 
        ? { ...story, likes_count: story.likes_count + 1 }
        : story
    ));

    toast({
      title: "💗 감사합니다!",
      description: "작성자에게 큰 힘이 될 거예요!",
    });
  };

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.before_story.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.after_story.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleStories = filteredStories.slice(0, visibleCount);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 검색 및 카테고리 필터 */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="성장 스토리 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-base rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        
        {/* 카테고리 칩 */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className={`rounded-full transition-all ${
                selectedCategory === category.value 
                  ? 'shadow-md' 
                  : 'hover:bg-muted'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 통계 배너 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{filteredStories.length}</div>
          <div className="text-xs text-muted-foreground">성장 스토리</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {filteredStories.reduce((sum, s) => sum + s.likes_count, 0).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">총 공감</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">98%</div>
          <div className="text-xs text-muted-foreground">만족도</div>
        </div>
      </div>

      {/* 스토리 그리드 */}
      {visibleStories.length === 0 ? (
        <Card className="text-center py-16 bg-muted/30">
          <CardContent>
            <Sparkles className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || selectedCategory !== 'all' ? '검색 결과가 없습니다' : '아직 공유된 스토리가 없습니다'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== 'all' 
                ? '다른 검색어나 카테고리를 시도해보세요'
                : '첫 번째로 성장 스토리를 공유해보세요!'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {visibleStories.map((story, index) => {
                const style = categoryStyles[story.category] || categoryStyles.personal;
                const isExpanded = expandedStory === story.id;
                
                return (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden border-2 ${style.border} ${style.bg}`}
                      onClick={() => setExpandedStory(isExpanded ? null : story.id)}
                    >
                      <CardContent className="p-0">
                        {/* 헤더 */}
                        <div className="p-5 pb-3">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <Badge className={`${style.text} bg-white/80 dark:bg-background/80 border ${style.border}`}>
                              {categories.find(c => c.value === story.category)?.icon}{' '}
                              {categories.find(c => c.value === story.category)?.label}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {story.transformation_date && formatDate(story.transformation_date)}
                            </div>
                          </div>
                          
                          <h3 className={`font-bold text-lg leading-tight mb-3 ${style.text}`}>
                            {story.title}
                          </h3>
                          
                          {/* Before/After 미니 뷰 */}
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-xs">😢</span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {story.before_story}
                              </p>
                            </div>
                            
                            <div className="flex justify-center">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-xs">😊</span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {story.after_story}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* 확장 콘텐츠 */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-4 space-y-4 border-t border-dashed pt-4">
                                <div className="bg-white/60 dark:bg-background/40 rounded-xl p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Quote className="w-4 h-4 text-red-400" />
                                    <span className="font-medium text-sm text-red-600 dark:text-red-400">변화 전</span>
                                  </div>
                                  <p className="text-sm leading-relaxed">{story.before_story}</p>
                                </div>
                                
                                <div className="bg-white/60 dark:bg-background/40 rounded-xl p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Star className="w-4 h-4 text-green-500" />
                                    <span className="font-medium text-sm text-green-600 dark:text-green-400">변화 후</span>
                                  </div>
                                  <p className="text-sm leading-relaxed">{story.after_story}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* 푸터 */}
                        <div className="flex items-center justify-between px-5 py-3 bg-white/40 dark:bg-background/20 border-t">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarFallback className="text-xs bg-muted">
                                {story.is_anonymous ? '익명' : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {story.is_anonymous ? '익명의 부모님' : '사용자'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleLike(story.id, e)}
                              className={`gap-1.5 h-8 px-3 rounded-full transition-all ${
                                likedStories.has(story.id) 
                                  ? 'text-pink-500 bg-pink-50 dark:bg-pink-950/30' 
                                  : 'hover:bg-pink-50 dark:hover:bg-pink-950/30'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${likedStories.has(story.id) ? 'fill-current' : ''}`} />
                              <span className="font-medium">{story.likes_count}</span>
                            </Button>
                            
                            <button className="text-muted-foreground hover:text-foreground transition-colors">
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          
          {/* 더보기 버튼 */}
          {visibleCount < filteredStories.length && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setVisibleCount(prev => prev + 6)}
                className="rounded-full px-8 gap-2"
              >
                더 많은 스토리 보기
                <ChevronDown className="w-4 h-4" />
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                {filteredStories.length - visibleCount}개의 스토리가 더 있습니다
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GrowthStoryFeed;
