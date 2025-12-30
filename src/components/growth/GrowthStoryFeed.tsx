import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Calendar, Sparkles, Search, Quote, Star, TrendingUp, ChevronDown, ChevronUp, Trophy, Flame, Zap, Gift, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
    { value: 'all', label: '전체', icon: '🎮', emoji: '✨' },
    { value: 'therapy', label: '치료', icon: '💊', emoji: '🏥' },
    { value: 'education', label: '학습', icon: '📚', emoji: '🎓' },
    { value: 'emotional', label: '감정', icon: '💝', emoji: '🌈' },
    { value: 'family', label: '가족', icon: '👨‍👩‍👧', emoji: '🏠' },
    { value: 'social', label: '사회성', icon: '🤝', emoji: '🎯' },
    { value: 'personal', label: '성장', icon: '🌱', emoji: '⭐' }
  ];

  const categoryStyles: { [key: string]: { bg: string; text: string; border: string; gradient: string } } = {
    therapy: { bg: 'bg-purple-100/80 dark:bg-purple-950/50', text: 'text-purple-600 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-700', gradient: 'from-purple-400 to-pink-400' },
    education: { bg: 'bg-blue-100/80 dark:bg-blue-950/50', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700', gradient: 'from-blue-400 to-cyan-400' },
    emotional: { bg: 'bg-pink-100/80 dark:bg-pink-950/50', text: 'text-pink-600 dark:text-pink-300', border: 'border-pink-300 dark:border-pink-700', gradient: 'from-pink-400 to-rose-400' },
    family: { bg: 'bg-green-100/80 dark:bg-green-950/50', text: 'text-green-600 dark:text-green-300', border: 'border-green-300 dark:border-green-700', gradient: 'from-green-400 to-emerald-400' },
    social: { bg: 'bg-amber-100/80 dark:bg-amber-950/50', text: 'text-amber-600 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700', gradient: 'from-amber-400 to-orange-400' },
    personal: { bg: 'bg-teal-100/80 dark:bg-teal-950/50', text: 'text-teal-600 dark:text-teal-300', border: 'border-teal-300 dark:border-teal-700', gradient: 'from-teal-400 to-cyan-400' }
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
      {/* 게임 스타일 헤더 */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl animate-bounce">
              🎮
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">성장 스토리 퀘스트</h2>
              <p className="text-white/80 text-sm">실제 변화를 경험한 모험가들의 이야기</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-2">
            <Crown className="w-5 h-5 text-yellow-300" />
            <span className="font-bold">{filteredStories.length}</span>
            <span className="text-white/70 text-sm">스토리</span>
          </div>
        </div>
      </motion.div>

      {/* 검색 바 - 게임 스타일 */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl blur opacity-30" />
        <div className="relative flex items-center gap-2 bg-background rounded-2xl p-2 border-2 border-muted">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
            <Search className="w-5 h-5 text-white" />
          </div>
          <Input
            placeholder="🔍 스토리 검색하기..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 text-base placeholder:text-muted-foreground/60"
          />
        </div>
      </div>
      
      {/* 카테고리 - 게임 버튼 스타일 */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category, idx) => (
          <motion.button
            key={category.value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedCategory(category.value)}
            className={`
              relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
              ${selectedCategory === category.value 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105' 
                : 'bg-muted/80 hover:bg-muted text-foreground hover:scale-102 border-2 border-transparent hover:border-purple-300'
              }
            `}
          >
            <span className="mr-1.5">{category.icon}</span>
            {category.label}
            {selectedCategory === category.value && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 -z-10"
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* 게임 스타일 통계 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div 
          whileHover={{ scale: 1.02, y: -2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-4 text-white shadow-lg"
        >
          <Trophy className="absolute -right-2 -top-2 w-16 h-16 text-white/10" />
          <div className="relative">
            <div className="text-3xl font-black">{filteredStories.length}</div>
            <div className="text-xs text-white/80 font-medium">🏆 성장 스토리</div>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02, y: -2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-4 text-white shadow-lg"
        >
          <Flame className="absolute -right-2 -top-2 w-16 h-16 text-white/10" />
          <div className="relative">
            <div className="text-3xl font-black">
              {filteredStories.reduce((sum, s) => sum + s.likes_count, 0).toLocaleString()}
            </div>
            <div className="text-xs text-white/80 font-medium">❤️ 총 공감</div>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02, y: -2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-4 text-white shadow-lg"
        >
          <Zap className="absolute -right-2 -top-2 w-16 h-16 text-white/10" />
          <div className="relative">
            <div className="text-3xl font-black">98%</div>
            <div className="text-xs text-white/80 font-medium">⚡ 만족도</div>
          </div>
        </motion.div>
      </div>

      {/* 스토리 그리드 - 게임 카드 스타일 */}
      {visibleStories.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 border-2 border-dashed border-muted"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl animate-pulse">
            🎮
          </div>
          <h3 className="text-xl font-bold mb-2">
            {searchTerm || selectedCategory !== 'all' ? '퀘스트를 찾을 수 없어요!' : '첫 번째 모험가가 되어주세요!'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'all' 
              ? '다른 키워드나 카테고리를 선택해보세요 🔍'
              : '당신의 성장 스토리를 공유해주세요 ✨'
            }
          </p>
        </motion.div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {visibleStories.map((story, index) => {
                const style = categoryStyles[story.category] || categoryStyles.personal;
                const isExpanded = expandedStory === story.id;
                const levelBadge = story.likes_count >= 50 ? { icon: '👑', text: 'LEGEND' } 
                  : story.likes_count >= 30 ? { icon: '💎', text: 'EPIC' }
                  : story.likes_count >= 10 ? { icon: '⭐', text: 'RARE' }
                  : { icon: '🌟', text: 'COMMON' };
                
                return (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 30, rotateX: -10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.06, type: "spring", stiffness: 100 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <Card 
                      className={`
                        group cursor-pointer overflow-hidden border-0 shadow-lg
                        bg-gradient-to-br ${style.bg} backdrop-blur
                        transition-all duration-300 hover:shadow-2xl
                        rounded-2xl relative
                      `}
                      onClick={() => setExpandedStory(isExpanded ? null : story.id)}
                    >
                      {/* 게임 스타일 레벨 뱃지 */}
                      <div className="absolute top-3 right-3 z-10">
                        <div className={`
                          px-2.5 py-1 rounded-full text-xs font-black
                          bg-gradient-to-r ${style.gradient} text-white shadow-lg
                          flex items-center gap-1
                        `}>
                          <span>{levelBadge.icon}</span>
                          <span>{levelBadge.text}</span>
                        </div>
                      </div>
                      
                      <CardContent className="p-0">
                        {/* 헤더 */}
                        <div className="p-5 pb-3">
                          <Badge className={`
                            ${style.text} bg-white/90 dark:bg-background/90 
                            border-2 ${style.border} font-semibold mb-3
                            rounded-lg px-3 py-1
                          `}>
                            {categories.find(c => c.value === story.category)?.icon}{' '}
                            {categories.find(c => c.value === story.category)?.label}
                          </Badge>
                          
                          <h3 className="font-black text-lg leading-tight mb-4 text-foreground">
                            {story.title}
                          </h3>
                          
                          {/* Before/After 게임 스타일 */}
                          <div className="space-y-3">
                            <div className="relative">
                              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-red-400 to-red-500" />
                              <div className="pl-4 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30">
                                  <span className="text-sm">😢</span>
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Before</span>
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                    {story.before_story}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-center py-1">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
                                <TrendingUp className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            
                            <div className="relative">
                              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-green-400 to-emerald-500" />
                              <div className="pl-4 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-green-500/30">
                                  <span className="text-sm">🎉</span>
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-green-500 uppercase tracking-wider">After</span>
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                    {story.after_story}
                                  </p>
                                </div>
                              </div>
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
                              <div className="px-5 pb-4 space-y-4 border-t-2 border-dashed border-muted/50 pt-4">
                                <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-2xl p-4 border-2 border-red-100 dark:border-red-900/50">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-lg bg-red-500 flex items-center justify-center">
                                      <Quote className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="font-bold text-sm text-red-600 dark:text-red-400">🔴 변화 전 상태</span>
                                  </div>
                                  <p className="text-sm leading-relaxed">{story.before_story}</p>
                                </div>
                                
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-4 border-2 border-green-100 dark:border-green-900/50">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center">
                                      <Star className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="font-bold text-sm text-green-600 dark:text-green-400">🟢 변화 후 상태</span>
                                  </div>
                                  <p className="text-sm leading-relaxed">{story.after_story}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* 게임 스타일 푸터 */}
                        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-white/60 to-white/40 dark:from-background/40 dark:to-background/20 border-t-2 border-muted/30">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-purple-500/30">
                              {story.is_anonymous ? '?' : 'U'}
                            </div>
                            <div>
                              <span className="text-xs font-semibold block">
                                {story.is_anonymous ? '익명의 모험가' : '사용자'}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {story.transformation_date && formatDate(story.transformation_date)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => handleLike(story.id, e)}
                              className={`
                                flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm
                                transition-all duration-200 shadow-lg
                                ${likedStories.has(story.id) 
                                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/30' 
                                  : 'bg-white dark:bg-background text-pink-500 border-2 border-pink-200 dark:border-pink-800 hover:border-pink-400'
                                }
                              `}
                            >
                              <Heart className={`w-4 h-4 ${likedStories.has(story.id) ? 'fill-current' : ''}`} />
                              <span>{story.likes_count}</span>
                            </motion.button>
                            
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </motion.button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          
          {/* 게임 스타일 더보기 버튼 */}
          {visibleCount < filteredStories.length && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center pt-6"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVisibleCount(prev => prev + 6)}
                className="
                  relative px-8 py-4 rounded-2xl font-black text-lg
                  bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                  text-white shadow-2xl shadow-purple-500/30
                  flex items-center gap-3 mx-auto
                  hover:shadow-purple-500/40 transition-shadow
                "
              >
                <Gift className="w-6 h-6" />
                더 많은 스토리 발견하기
                <ChevronDown className="w-5 h-5 animate-bounce" />
              </motion.button>
              <p className="text-sm text-muted-foreground mt-3 font-medium">
                🎁 {filteredStories.length - visibleCount}개의 스토리가 기다리고 있어요!
              </p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default GrowthStoryFeed;
