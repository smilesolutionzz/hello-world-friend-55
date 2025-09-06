import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, MessageCircle, Heart, Star, Clock, 
  UserCheck, Building, Baby, Stethoscope, 
  BookOpen, TrendingUp, Shield, Award,
  Plus, ThumbsUp, MessageSquare, Share,
  CheckCircle, Crown, Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Community = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '', isAnonymous: false });
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkAuth();
  }, []);

  // 커뮤니티 포스트 데이터 (실제로는 Supabase에서 가져와야 함)
  const [communityPosts] = useState([
    {
      id: 1,
      author: {
        name: '김엄마',
        role: 'parent',
        avatar: '/api/placeholder/40/40',
        badges: ['신뢰회원', '활동장려상'],
        isAnonymous: false
      },
      title: '5세 아이 언어발달 고민 해결 후기',
      content: 'AIHPRO 검사를 통해 언어치료를 시작했는데 3개월 만에 놀라운 변화가 있었어요. 처음에는 단어 몇 개만 말하던 아이가 이제는 문장으로 자신의 생각을 표현하려고 노력해요. 특히 AI 상담을 통해 받은 맞춤형 놀이 방법이 정말 도움이 되었습니다.',
      tags: ['언어발달', '5세', '성공후기'],
      stats: { likes: 24, comments: 8, views: 156, shares: 3 },
      timeAgo: '2시간 전',
      isVerified: true,
      category: 'success_story',
      comments: [
        {
          id: 1,
          author: { name: '이엄마', isAnonymous: false },
          content: '저희 아이도 비슷한 상황이었는데 정말 용기가 나네요! 혹시 어떤 전문가분께 상담받으셨나요?',
          timeAgo: '1시간 전',
          likes: 5
        },
        {
          id: 2,
          author: { name: '박언어치료사', role: 'expert', isAnonymous: false },
          content: '언어발달은 개별 차이가 크므로 꾸준한 관찰과 적절한 자극이 중요합니다. 좋은 결과 공유해주셔서 감사해요.',
          timeAgo: '30분 전',
          likes: 12,
          isExpert: true
        }
      ]
    },
    {
      id: 2,
      author: {
        name: '박선생님',
        role: 'expert',
        avatar: '/api/placeholder/40/40',
        badges: ['인증전문가', 'TOP기여자'],
        isAnonymous: false
      },
      title: '겨울철 아동 우울증 예방법',
      content: '일조량이 부족한 겨울철, 아이들의 정서적 변화를 주의깊게 관찰해야 합니다. 실내 조명을 밝게 하고, 규칙적인 운동과 야외 활동을 통해 세로토닌 생성을 도울 수 있어요. 또한 부모와의 충분한 대화와 스킨십도 중요합니다.',
      tags: ['아동우울증', '겨울철', '예방법'],
      stats: { likes: 45, comments: 12, views: 289, shares: 8 },
      timeAgo: '5시간 전',
      isExpert: true,
      category: 'expert_advice'
    },
    {
      id: 3,
      author: {
        name: '익명의 사용자',
        role: 'parent',
        avatar: '/api/placeholder/40/40',
        badges: [],
        isAnonymous: true
      },
      title: '7세 아이 틱 증상 고민입니다',
      content: '최근 아이가 눈을 자주 깜빡이고 목을 돌리는 행동을 반복해요. 스트레스 때문인지 정말 틱 장애인지 구분이 안 가서 걱정됩니다. 비슷한 경험 있으신 분들 조언 부탁드려요.',
      tags: ['틱장애', '7세', '고민상담'],
      stats: { likes: 18, comments: 15, views: 124, shares: 2 },
      timeAgo: '1일 전',
      category: 'question'
    }
  ]);

  // 전문가 목록
  const expertsList = [
    {
      name: '김소아과 원장',
      specialty: '소아청소년정신과',
      experience: '15년',
      rating: 4.9,
      consultations: 1234,
      online: true,
      verified: true
    },
    {
      name: '이심리사',
      specialty: '임상심리학',
      experience: '8년',
      rating: 4.8,
      consultations: 856,
      online: false,
      verified: true
    },
    {
      name: '박언어치료사',
      specialty: '언어발달치료',
      experience: '12년',
      rating: 4.9,
      consultations: 967,
      online: true,
      verified: true
    }
  ];

  // 제휴기관 목록
  const institutionsList = [
    {
      name: '서울아동발달센터',
      type: '발달센터',
      location: '서울 강남구',
      rating: 4.8,
      members: 45,
      programs: ['발달평가', '언어치료', '인지치료'],
      isPartner: true
    },
    {
      name: '행복한육아상담소',
      type: '상담센터',
      location: '부산 해운대구',
      rating: 4.7,
      members: 32,
      programs: ['부모상담', '가족치료', '놀이치료'],
      isPartner: true
    }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'expert': return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'institution': return <Building className="w-4 h-4 text-purple-600" />;
      default: return <Baby className="w-4 h-4 text-green-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'expert': return <Badge className="bg-blue-100 text-blue-800">전문가</Badge>;
      case 'institution': return <Badge className="bg-purple-100 text-purple-800">기관</Badge>;
      default: return <Badge className="bg-green-100 text-green-800">부모</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'success_story': return <Badge className="bg-green-100 text-green-800">성공사례</Badge>;
      case 'expert_advice': return <Badge className="bg-blue-100 text-blue-800">전문가 조언</Badge>;
      case 'question': return <Badge className="bg-orange-100 text-orange-800">질문</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">일반</Badge>;
    }
  };

  const handleNewPost = async () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "게시글 작성을 위해 로그인해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "내용을 입력해주세요",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    // 실제로는 Supabase에 저장
    toast({
      title: "게시글이 등록되었습니다",
      description: "커뮤니티에 새로운 게시글이 추가되었습니다."
    });
    
    setIsNewPostOpen(false);
    setNewPost({ title: '', content: '', category: '', isAnonymous: false });
  };

  const handleLike = (postId: number) => {
    toast({
      title: "좋아요를 눌렀습니다",
      description: "해당 게시글에 공감을 표시했습니다."
    });
  };

  const handleComment = (postId: number) => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "댓글 작성을 위해 로그인해주세요.",
        variant: "destructive"
      });
      return;
    }
    // 댓글 작성 기능
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* 커뮤니티 헤더 */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">AIHPRO 커뮤니티</h1>
                  <p className="text-lg text-muted-foreground mt-2">
                    부모, 전문가, 기관이 함께하는 신뢰할 수 있는 육아 커뮤니티
                  </p>
                </div>
              </div>
              
              <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4" />
                    글쓰기
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>새 게시글 작성</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Input
                        placeholder="제목을 입력하세요"
                        value={newPost.title}
                        onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <Select value={newPost.category} onValueChange={(value) => setNewPost({...newPost, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="question">질문</SelectItem>
                          <SelectItem value="success_story">성공사례</SelectItem>
                          <SelectItem value="general">일반</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Textarea
                        placeholder="내용을 입력하세요..."
                        rows={6}
                        value={newPost.content}
                        onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={newPost.isAnonymous}
                        onChange={(e) => setNewPost({...newPost, isAnonymous: e.target.checked})}
                      />
                      <label htmlFor="anonymous" className="text-sm">익명으로 작성</label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsNewPostOpen(false)}>
                        취소
                      </Button>
                      <Button onClick={handleNewPost}>
                        등록
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* 커뮤니티 통계 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">2,456</div>
                <div className="text-sm text-muted-foreground">활성 회원</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">156</div>
                <div className="text-sm text-muted-foreground">인증 전문가</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">89</div>
                <div className="text-sm text-muted-foreground">제휴 기관</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">1,234</div>
                <div className="text-sm text-muted-foreground">성공 사례</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="posts" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              소통 게시판
            </TabsTrigger>
            <TabsTrigger value="experts" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              전문가
            </TabsTrigger>
            <TabsTrigger value="institutions" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              제휴기관
            </TabsTrigger>
            <TabsTrigger value="success" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              성공사례
            </TabsTrigger>
          </TabsList>

          {/* 소통 게시판 */}
          <TabsContent value="posts" className="space-y-6">
            {communityPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-all duration-300 border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>
                        {post.author.isAnonymous ? '익' : post.author.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-3">
                      {/* 작성자 정보 */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium">
                          {post.author.isAnonymous ? '익명의 사용자' : post.author.name}
                        </span>
                        {!post.author.isAnonymous && getRoleIcon(post.author.role)}
                        {!post.author.isAnonymous && getRoleBadge(post.author.role)}
                        {getCategoryBadge(post.category)}
                        {post.isExpert && (
                          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            인증전문가
                          </Badge>
                        )}
                        {post.author.badges.map((badge, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                        <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
                      </div>

                      {/* 포스트 내용 */}
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                        <p className="text-gray-700 leading-relaxed">{post.content}</p>
                      </div>

                      {/* 태그 */}
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      {/* 상호작용 버튼 */}
                      <div className="flex items-center gap-6 pt-2 border-t border-gray-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-2 text-gray-600 hover:text-red-500"
                        >
                          <Heart className="w-4 h-4" />
                          {post.stats.likes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleComment(post.id)}
                          className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {post.stats.comments}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2 text-gray-600 hover:text-green-500"
                        >
                          <Share className="w-4 h-4" />
                          {post.stats.shares}
                        </Button>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
                          <Eye className="w-4 h-4" />
                          {post.stats.views}
                        </div>
                      </div>

                      {/* 댓글 (첫 번째 게시글만 표시) */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
                          {post.comments.slice(0, 2).map((comment) => (
                            <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">
                                  {comment.author.isAnonymous ? '익명' : comment.author.name}
                                </span>
                                {comment.isExpert && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">전문가</Badge>
                                )}
                                <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-red-500">
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  {comment.likes}
                                </Button>
                                <Button variant="ghost" size="sm" className="text-xs text-gray-500">
                                  답글
                                </Button>
                              </div>
                            </div>
                          ))}
                          {post.comments.length > 2 && (
                            <Button variant="ghost" size="sm" className="text-primary">
                              댓글 {post.comments.length - 2}개 더 보기
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 전문가 탭 */}
          <TabsContent value="experts" className="space-y-4">
            {expertsList.map((expert, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="text-lg">{expert.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-lg">{expert.name}</span>
                          {expert.verified && (
                            <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              인증전문가
                            </Badge>
                          )}
                          {expert.online && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="text-xs text-green-600">온라인</span>
                            </div>
                          )}
                        </div>
                        <div className="text-muted-foreground mb-2">
                          {expert.specialty} • 경력 {expert.experience}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{expert.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            상담 {expert.consultations}건
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button className="bg-primary hover:bg-primary/90">
                        {expert.online ? '즉시 상담' : '예약 상담'}
                      </Button>
                      <Button variant="outline">
                        프로필 보기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 제휴기관 탭 */}
          <TabsContent value="institutions" className="space-y-4">
            {institutionsList.map((institution, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <Building className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-lg">{institution.name}</span>
                          {institution.isPartner && (
                            <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              공식제휴기관
                            </Badge>
                          )}
                        </div>
                        <div className="text-muted-foreground mb-3">
                          {institution.type} • {institution.location}
                        </div>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{institution.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            회원 {institution.members}명
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {institution.programs.map((program, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {program}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        상담 예약
                      </Button>
                      <Button variant="outline">
                        기관 정보
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 성공사례 탭 */}
          <TabsContent value="success" className="space-y-4">
            {communityPosts
              .filter(post => post.category === 'success_story')
              .map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow border-none shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <Badge className="bg-green-100 text-green-800">성공사례</Badge>
                        </div>
                        <p className="text-gray-700 mb-4">{post.content}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>작성자: {post.author.isAnonymous ? '익명' : post.author.name}</span>
                          <span>{post.timeAgo}</span>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.stats.likes}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;