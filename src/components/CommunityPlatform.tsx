import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Users, MessageCircle, Heart, Star, Clock, 
  UserCheck, Building, Baby, Stethoscope, 
  BookOpen, TrendingUp, Shield, Award, Send
} from 'lucide-react';

const CommunityPlatform = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [comments, setComments] = useState<{[postId: number]: Array<{id: number, author: string, content: string, timeAgo: string}>}>({});
  const [newComment, setNewComment] = useState<{[postId: number]: string}>({});
  const [selectedPost, setSelectedPost] = useState<number | null>(null);

  // 커뮤니티 포스트 데이터
  const communityPosts = [
    {
      id: 1,
      author: {
        name: '유준만',
        role: 'parent',
        avatar: '/api/placeholder/40/40',
        badges: ['신뢰회원']
      },
      title: '여기 통해서',
      content: '최소한 관찰은 정안하게 되었나요',
      tags: ['관찰', '일반상담'],
      stats: { likes: 1, views: 23 },
      timeAgo: '16일 전',
      isVerified: false
    },
    {
      id: 2,
      author: {
        name: '별이엄마92',
        role: 'parent',
        avatar: '/api/placeholder/40/40',
        badges: ['활동장려상', '베스트댓글']
      },
      title: '5살 아들 감각통합 치료 후기 공유합니다!',
      content: '처음엔 정말 힘들었어요.. 아이가 소리에 너무 예민하고 미끄럼틀도 무서워해서.. 감각통합 치료 6개월 받고나니 완전 달라졌어요! 놀이터도 혼자 갈 수 있고, 마트에서도 울지 않아요. 혹시 고민 중이신 분들 있으면 꼭 상담받아보세요!! 우리 아이 변화 보니까 울컥하더라구요 ㅠㅠ',
      tags: ['감각통합', '5세', '성공후기'],
      stats: { likes: 47, views: 312 },
      timeAgo: '3시간 전',
      isVerified: false
    },
    {
      id: 3,
      author: {
        name: '든든한아빠',
        role: 'parent',
        avatar: '/api/placeholder/40/40',
        badges: ['신뢰회원', '경험공유왕']
      },
      title: 'ADHD 약물치료 vs 행동치료 고민이에요',
      content: '초1 아들이 ADHD 진단받았는데... 약물치료 시작할지 행동치료만 할지 너무 고민돼요. 약 먹이기가 무서우면서도 아이가 학교에서 힘들어하는 모습 보니까 마음이 아프네요. 비슷한 경험 있으신 분들 조언 좀 부탁드려요. 아이 아빠로서 어떤 게 맞는 선택인지 모르겠어요.',
      tags: ['ADHD', '약물치료', '행동치료', '초등학생'],
      stats: { likes: 34, views: 267 },
      timeAgo: '1시간 전',
      isVerified: false
    },
    {
      id: 4,
      author: {
        name: '희망이네',
        role: 'parent',
        avatar: '/api/placeholder/40/40',
        badges: ['따뜻한댓글', '도움왕']
      },
      title: '자폐스펙트럼 아이와 함께하는 일상 TIP',
      content: '3년차 자폐 스펙트럼 아이 엄마예요. 처음엔 정말 막막했는데 이제는 아이만의 특별함을 알겠어요 😊 매일 작은 루틴들이 정말 중요하더라구요! 아침에 일어나서 같은 순서로 옷입기, 정해진 자리에서 밥먹기 이런 것들이요. 그리고 아이가 좋아하는 것들 찾아주기! 우리 아이는 자동차 소리에 진짜 신기하게 반응해요 ㅎㅎ',
      tags: ['자폐스펙트럼', '일상팁', '루틴'],
      stats: { likes: 52, views: 421 },
      timeAgo: '5시간 전',
      isVerified: false
    },
    {
      id: 5,
      author: {
        name: '새벽맘',
        role: 'parent',
        avatar: '/api/placeholder/40/40',
        badges: ['신규회원']
      },
      title: '언어발달 늦은 3살, 언제부터 치료 시작해야 할까요?',
      content: '아직 두어마디 정도밖에 못해요.. 주변에선 남자아이라 원래 늦다고 하는데 정말 걱정이 많아요. 또래 아이들은 벌써 문장으로 말하는데 우리 아이만... 언어치료 받으면 정말 늘까요? 비용도 만만치 않고 아이가 스트레스받을까봐 고민도 되구요. 같은 경험 있으신 분들 이야기 들어보고 싶어요.',
      tags: ['언어발달', '3세', '치료시기'],
      stats: { likes: 28, views: 184 },
      timeAgo: '30분 전',
      isVerified: false
    }
  ];

  // 전문가 목록
  const expertsList = [
    {
      name: '김미영',
      specialty: '아동발달 전문가',
      experience: '12년',
      rating: 4.9,
      consultations: 450,
      online: true,
      credentials: ['아동발달 전문의', '언어재활사 1급'],
      description: '12년간 아동발달센터에서 근무하며 수백 명의 아이들을 치료해온 경험이 있습니다.'
    },
    {
      name: '박상훈',
      specialty: 'BCBA 행동분석사',
      experience: '8년',
      rating: 4.8,
      consultations: 280,
      online: true,
      credentials: ['BCBA 자격증', '행동분석사'],
      description: 'ABA 치료 전문가로 자폐스펙트럼 아동의 행동 개선에 특화되어 있습니다.'
    },
    {
      name: '이정아',
      specialty: '언어재활사',
      experience: '6년',
      rating: 4.7,
      consultations: 320,
      online: false,
      credentials: ['1급 언어재활사'],
      description: '언어발달지연 아동의 언어능력 향상을 위한 맞춤형 치료를 제공합니다.'
    },
    {
      name: '강은미',
      specialty: '임상심리사',
      experience: '14년',
      rating: 4.8,
      consultations: 420,
      online: true,
      credentials: ['임상심리사 1급'],
      description: '아동 및 청소년의 심리적 어려움을 전문적으로 평가하고 치료합니다.'
    }
  ];

  // 제휴기관 목록
  const institutionsList = [
    {
      name: '삼성웰니스의원 발달클리닉',
      type: '의원',
      location: '서울시 강남구',
      rating: 5.0,
      members: 25,
      programs: ['발달검진', '언어치료', '인지치료', '작업치료', '행동치료', '약물치료', '가족상담', '조기개입'],
      voucher_types: ['발달재활서비스', '언어치료', '인지치료', '작업치료', '의료급여'],
      featured: true,
      description: '최고 수준의 의료진과 최신 시설을 갖춘 프리미엄 발달클리닉'
    },
    {
      name: '한점미소발달센터 남양주점',
      type: '발달센터',
      location: '경기도 남양주시',
      rating: 4.7,
      members: 8,
      programs: ['언어치료', '인지치료', '작업치료', '사회성훈련', '부모상담'],
      voucher_types: ['발달재활서비스', '언어치료', '인지치료', '교육청서비스', '우리아이심리지원서비스']
    },
    {
      name: '메이플 ABA 목동센터',
      type: '발달센터',
      location: '서울시 양천구',
      rating: 4.8,
      members: 12,
      programs: ['ABA치료', '행동중재', '사회성훈련', '부모교육', '개별교육'],
      voucher_types: ['발달재활서비스', 'ABA치료', '행동중재', '교육청서비스']
    },
    {
      name: '해오름 아동발달센터',
      type: '발달센터',
      location: '경기도 수원시',
      rating: 4.8,
      members: 13,
      programs: ['언어치료', '인지치료', '작업치료', '물리치료', '사회성훈련', '감각통합치료'],
      voucher_types: ['발달재활서비스', '언어치료', '인지치료', '작업치료', '교육청서비스']
    },
    {
      name: '핌발달센터',
      type: '발달센터',
      location: '경기도 성남시',
      rating: 4.8,
      members: 11,
      programs: ['언어치료', '인지치료', '작업치료', '사회성훈련', '학습치료'],
      voucher_types: ['발달재활서비스', '언어치료', '인지치료', '작업치료']
    },
    {
      name: '해웃음 심리발달센터',
      type: '상담센터',
      location: '서울시 마포구',
      rating: 4.6,
      members: 8,
      programs: ['심리상담', '언어치료', '놀이치료', '가족상담', '부모교육'],
      voucher_types: ['발달재활서비스', '심리상담', '우리아이심리지원서비스']
    },
    {
      name: '넘나들 언어인지학습연구소',
      type: '연구소',
      location: '서울시 송파구',
      rating: 4.8,
      members: 12,
      programs: ['언어치료', '인지치료', '학습치료', '사회성훈련', '부모교육'],
      voucher_types: ['발달재활서비스', '언어치료', '인지치료', '교육청서비스']
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

  const handleCommentSubmit = (postId: number) => {
    const commentText = newComment[postId]?.trim();
    if (!commentText) return;

    const newCommentObj = {
      id: Date.now(),
      author: '나',
      content: commentText,
      timeAgo: '방금 전'
    };

    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newCommentObj]
    }));

    setNewComment(prev => ({
      ...prev,
      [postId]: ''
    }));
  };

  const handleCommentChange = (postId: number, value: string) => {
    setNewComment(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* 커뮤니티 헤더 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AIHPRO 커뮤니티</h2>
              <p className="text-muted-foreground">
                부모, 전문가, 기관이 함께하는 신뢰할 수 있는 육아 커뮤니티
              </p>
            </div>
          </div>
          
          {/* 커뮤니티 통계 */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2,459</div>
              <div className="text-xs text-muted-foreground">활성 회원</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">129</div>
              <div className="text-xs text-muted-foreground">인증 전문가</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">30+</div>
              <div className="text-xs text-muted-foreground">제휴 기관</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">247</div>
              <div className="text-xs text-muted-foreground">성공 사례</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 네비게이션 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">소통 게시판</TabsTrigger>
          <TabsTrigger value="experts">전문가</TabsTrigger>
          <TabsTrigger value="institutions">제휴기관</TabsTrigger>
          <TabsTrigger value="success">성공사례</TabsTrigger>
        </TabsList>

        {/* 소통 게시판 */}
        <TabsContent value="posts" className="space-y-4">
          {communityPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    {/* 작성자 정보 */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{post.author.name}</span>
                      {getRoleIcon(post.author.role)}
                      {getRoleBadge(post.author.role)}
                      {post.author.badges.map((badge, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                      <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
                    </div>

                    {/* 포스트 내용 */}
                    <div>
                      <h3 className="font-semibold mb-1">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">{post.content}</p>
                    </div>

                    {/* 태그 */}
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* 상호작용 통계 */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.stats.likes}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-1 p-1 h-auto text-sm text-muted-foreground hover:text-primary"
                        onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                      >
                        <MessageCircle className="w-4 h-4" />
                        {comments[post.id]?.length || 0}
                      </Button>
                      <div className="flex items-center gap-1">
                        조회 {post.stats.views}
                      </div>
                    </div>

                    {/* 댓글 섹션 */}
                    {selectedPost === post.id && (
                      <div className="mt-4 space-y-3 border-t pt-3">
                        {/* 기존 댓글 목록 */}
                        {comments[post.id]?.map((comment) => (
                          <div key={comment.id} className="flex items-start gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">{comment.author[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{comment.author}</span>
                                <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                        
                        {/* 댓글 입력 */}
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">나</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex gap-2">
                            <Input
                              placeholder="댓글을 입력하세요..."
                              value={newComment[post.id] || ''}
                              onChange={(e) => handleCommentChange(post.id, e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleCommentSubmit(post.id);
                                }
                              }}
                              className="text-sm"
                            />
                            <Button 
                              size="sm" 
                              onClick={() => handleCommentSubmit(post.id)}
                              disabled={!newComment[post.id]?.trim()}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
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
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>{expert.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{expert.name}</span>
                        <Badge className="bg-blue-100 text-blue-800">인증전문가</Badge>
                        {expert.online && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {expert.specialty} • 경력 {expert.experience}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{expert.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          상담 {expert.consultations}건
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm">
                    {expert.online ? '즉시 상담' : '예약 상담'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* 제휴기관 탭 */}
        <TabsContent value="institutions" className="space-y-6">
          {/* 프리미엄 제휴기관 섹션 */}
          {institutionsList.filter(institution => institution.featured).map((institution, index) => (
            <Card key={index} className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-white to-purple-50 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  {/* 프리미엄 뱃지 */}
                  <div className="flex justify-center">
                    <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-2 text-sm font-semibold">
                      ⭐ 프리미엄 제휴기관
                    </Badge>
                  </div>
                  
                  {/* 기관 아이콘 */}
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-br from-primary to-purple-600 p-6 rounded-2xl shadow-lg">
                      <Stethoscope className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  {/* 기관 정보 */}
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-primary">{institution.name}</h3>
                    <p className="text-lg text-muted-foreground font-medium">
                      {institution.description}
                    </p>
                    <div className="flex justify-center items-center gap-4 text-lg">
                      <Badge className="bg-primary/10 text-primary text-base px-3 py-1">
                        {institution.type}
                      </Badge>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-medium">{institution.location}</span>
                    </div>
                    
                    {/* 평점 및 회원 정보 */}
                    <div className="flex justify-center items-center gap-6 text-base">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                          ))}
                        </div>
                        <span className="font-bold text-primary">{institution.rating}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-medium text-primary">
                        전문의 {institution.members}명
                      </span>
                    </div>
                  </div>
                  
                  {/* 프로그램 */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold">제공 서비스</h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {institution.programs.map((program, idx) => (
                        <Badge key={idx} className="bg-primary/10 text-primary border border-primary/20 text-sm px-3 py-1">
                          {program}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* 바우처 정보 */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold">지원 바우처</h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {institution.voucher_types.map((voucher, idx) => (
                        <Badge key={idx} variant="outline" className="border-green-300 text-green-700 text-sm px-3 py-1">
                          {voucher}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* 액션 버튼 */}
                  <div className="flex justify-center gap-4 pt-4">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white px-8">
                      진료 예약
                    </Button>
                    <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5 px-8">
                      기관 정보
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* 일반 제휴기관 섹션 */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center mb-6 text-muted-foreground">기타 제휴기관</h3>
            {institutionsList.filter(institution => !institution.featured).map((institution, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Building className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{institution.name}</span>
                          <Badge className="bg-purple-100 text-purple-800">제휴기관</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {institution.type} • {institution.location}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{institution.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            회원 {institution.members}명
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {institution.programs.map((program, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {program}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      기관 정보
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 성공사례 탭 */}
        <TabsContent value="success" className="space-y-4">
          {/* 성공사례 헤더 */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">성공사례 모음집</h3>
                  <p className="text-sm text-muted-foreground">실제 치료 성공 후기와 변화 스토리</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 성공사례 목록 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>김</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">김지혜</span>
                    <Badge className="bg-green-100 text-green-800">성공사례</Badge>
                    <span className="text-xs text-muted-foreground">3일 전</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">7세 아들 언어발달지연 극복 후기</h4>
                    <p className="text-sm text-muted-foreground">
                      6개월간 언어치료를 받으며 아들이 놀라운 변화를 보였어요. 한점미소발달센터 선생님들 덕분에 이제 또래들과 대화도 잘하고 자신감도 생겼답니다.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">#언어치료</Badge>
                    <Badge variant="secondary" className="text-xs">#7세</Badge>
                    <Badge variant="secondary" className="text-xs">#한점미소센터</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      47
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      12
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>박</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">박민수</span>
                    <Badge className="bg-green-100 text-green-800">성공사례</Badge>
                    <span className="text-xs text-muted-foreground">5일 전</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">ADHD 아들, ABA 치료로 집중력 향상</h4>
                    <p className="text-sm text-muted-foreground">
                      메이플 ABA센터에서 1년간 치료받으며 아들의 집중력과 충동성이 크게 개선됐어요. 이제 학교에서도 안정적으로 수업을 듣고 있답니다.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">#ADHD</Badge>
                    <Badge variant="secondary" className="text-xs">#ABA치료</Badge>
                    <Badge variant="secondary" className="text-xs">#메이플센터</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      38
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      9
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>이</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">이현주</span>
                    <Badge className="bg-green-100 text-green-800">성공사례</Badge>
                    <span className="text-xs text-muted-foreground">1주 전</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">3세 딸 자폐스펙트럼, 조기개입으로 눈에 띄는 발전</h4>
                    <p className="text-sm text-muted-foreground">
                      해오름센터에서 조기개입 치료를 시작한 지 8개월, 아이가 눈맞춤도 하고 간단한 단어들을 말하기 시작했어요. 희망을 잃지 않길 바라요.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">#자폐스펙트럼</Badge>
                    <Badge variant="secondary" className="text-xs">#조기개입</Badge>
                    <Badge variant="secondary" className="text-xs">#해오름센터</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      62
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      18
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>최</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">최미나</span>
                    <Badge className="bg-green-100 text-green-800">성공사례</Badge>
                    <span className="text-xs text-muted-foreground">2주 전</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">5세 아들 감각통합장애, 작업치료로 일상생활 개선</h4>
                    <p className="text-sm text-muted-foreground">
                      핌발달센터에서 감각통합치료를 받으며 아이가 예전에 못하던 일들을 하나씩 해내고 있어요. 식사도 잘하고 놀이도 즐겁게 참여해요.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">#감각통합장애</Badge>
                    <Badge variant="secondary" className="text-xs">#작업치료</Badge>
                    <Badge variant="secondary" className="text-xs">#핌발달센터</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      29
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      7
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>정</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">정예린</span>
                    <Badge className="bg-green-100 text-green-800">성공사례</Badge>
                    <span className="text-xs text-muted-foreground">3주 전</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">15세 딸 우울증, 상담치료로 학교생활 회복</h4>
                    <p className="text-sm text-muted-foreground">
                      해웃음센터에서 심리상담을 받으며 딸이 다시 웃음을 찾았어요. 친구들과의 관계도 회복되고 성적도 점점 올라가고 있어요.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">#청소년우울증</Badge>
                    <Badge variant="secondary" className="text-xs">#심리상담</Badge>
                    <Badge variant="secondary" className="text-xs">#해웃음센터</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      41
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      13
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityPlatform;