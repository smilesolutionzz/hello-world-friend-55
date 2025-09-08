import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Calendar, ArrowRight, Sparkles, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { mockGrowthStories } from '@/data/mockGrowthStories';

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

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'personal', label: '개인 성장' },
    { value: 'family', label: '가족 관계' },
    { value: 'therapy', label: '치료 경험' },
    { value: 'education', label: '교육/학습' },
    { value: 'social', label: '사회성' },
    { value: 'emotional', label: '감정 조절' }
  ];

  const categoryColors: { [key: string]: string } = {
    personal: 'bg-blue-100 text-blue-800',
    family: 'bg-green-100 text-green-800',
    therapy: 'bg-purple-100 text-purple-800',
    education: 'bg-orange-100 text-orange-800',
    social: 'bg-pink-100 text-pink-800',
    emotional: 'bg-indigo-100 text-indigo-800'
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

      // 실제 데이터가 없을 때 예시 데이터 사용
      const storiesData = data && data.length > 0 ? data : mockGrowthStories;
      setStories(storiesData);
    } catch (error: any) {
      console.error('성장 스토리 로딩 오류:', error);
      toast({
        title: "로딩 오류",
        description: "성장 스토리를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [selectedCategory, refreshTrigger]);

  const handleLike = async (storyId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast({
          title: "로그인 필요",
          description: "좋아요를 누르려면 로그인이 필요합니다.",
          variant: "destructive"
        });
        return;
      }

      // 이미 좋아요를 눌렀는지 확인
      if (likedStories.has(storyId)) {
        toast({
          title: "이미 좋아요를 누르셨습니다",
          description: "한 스토리당 한 번만 좋아요를 누를 수 있습니다.",
        });
        return;
      }

      // 좋아요 수 증가
      const { error } = await supabase
        .from('growth_stories')
        .update({ likes_count: stories.find(s => s.id === storyId)?.likes_count + 1 })
        .eq('id', storyId);

      if (error) throw error;

      // 로컬 상태 업데이트
      setLikedStories(prev => new Set([...prev, storyId]));
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, likes_count: story.likes_count + 1 }
          : story
      ));

      toast({
        title: "감사합니다!",
        description: "좋아요가 반영되었습니다. 작성자에게 큰 힘이 될 거예요!",
      });

    } catch (error: any) {
      console.error('좋아요 오류:', error);
      toast({
        title: "오류 발생",
        description: "좋아요 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.before_story.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.after_story.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="스토리 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 스토리 목록 */}
      {filteredStories.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm || selectedCategory !== 'all' ? '검색 결과가 없습니다' : '아직 공유된 스토리가 없습니다'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== 'all' 
                ? '다른 검색어나 카테고리를 시도해보세요'
                : '첫 번째로 성장 스토리를 공유해보세요!'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredStories.map((story) => (
            <Card key={story.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{story.title}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={categoryColors[story.category] || 'bg-gray-100 text-gray-800'}>
                        {categories.find(c => c.value === story.category)?.label || story.category}
                      </Badge>
                      {story.transformation_date && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(story.transformation_date)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {story.is_anonymous ? '익명' : '사용자'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Before */}
                <div className="border-l-4 border-red-200 pl-4">
                  <h4 className="font-medium text-red-700 mb-2">변화 이전</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {story.before_story.length > 150 
                      ? story.before_story.substring(0, 150) + '...' 
                      : story.before_story
                    }
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>

                {/* After */}
                <div className="border-l-4 border-green-200 pl-4">
                  <h4 className="font-medium text-green-700 mb-2">변화 이후</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {story.after_story.length > 150 
                      ? story.after_story.substring(0, 150) + '...' 
                      : story.after_story
                    }
                  </p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatDate(story.created_at)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(story.id)}
                    className={`flex items-center gap-1 ${
                      likedStories.has(story.id) ? 'text-red-500' : 'text-gray-500'
                    }`}
                    disabled={likedStories.has(story.id)}
                  >
                    <Heart className={`w-4 h-4 ${likedStories.has(story.id) ? 'fill-current' : ''}`} />
                    <span>{story.likes_count}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GrowthStoryFeed;