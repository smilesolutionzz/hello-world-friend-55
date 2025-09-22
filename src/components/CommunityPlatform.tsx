import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, MessageCircle, Heart, Star, Clock, 
  UserCheck, Building, Baby, Stethoscope, 
  BookOpen, TrendingUp, Shield, Award
} from 'lucide-react';

const CommunityPlatform = () => {
  const [activeTab, setActiveTab] = useState('posts');

  // 커뮤니티 포스트 데이터
  const communityPosts = [
    {
      id: 1,
      author: {
        name: '김엄마',
        role: 'parent',
        avatar: '/api/placeholder/40/40',
        badges: ['신뢰회원', '활동장려상']
      },
      title: '7살 아이 언어발달 고민',
      content: '7살 아이 언어발달 고민이에요. 아직도 발음이 부정확하고 문장을 제대로 만들지 못해서 걱정이 많아요. 언어치료를 받아야 할까요? 어떤 전문가를 만나야 할지 조언 부탁드려요.',
      tags: ['언어발달', '7세'],
      stats: { likes: 12, comments: 8, views: 156 },
      timeAgo: '2시간 전',
      isVerified: false
    },
    {
      id: 2,
      author: {
        name: '김미영 아동발달전문가',
        role: 'expert',
        avatar: '/api/placeholder/40/40',
        badges: ['인증전문가', 'TOP기여자']
      },
      title: 'ADHD 치료 성공 후기',
      content: '우리 아이가 ADHD 진단을 받았어요. 처음엔 너무 충격이었는데, 전문가 선생님과 상담하면서 많이 달라졌어요. 아이도 훨씬 안정적이고 집중력도 좋아졌습니다. 혹시 비슷한 고민 있으신 분들, 너무 걱정하지 마세요!',
      tags: ['ADHD', '전문가상담'],
      stats: { likes: 25, comments: 15, views: 289 },
      timeAgo: '4시간 전',
      isExpert: true
    },
    {
      id: 3,
      author: {
        name: '박상훈 행동분석사',
        role: 'expert',
        avatar: '/api/placeholder/40/40',
        badges: ['인증전문가', 'BCBA']
      },
      title: '자폐스펙트럼 ABA 치료 효과',
      content: '자폐스펙트럼 아동의 ABA 치료 효과에 대해 많은 부모님들이 궁금해하시는데, 체계적인 접근을 통해 상당한 개선을 볼 수 있습니다. 무엇보다 가족의 꾸준한 지지가 중요해요.',
      tags: ['자폐스펙트럼', 'ABA치료'],
      stats: { likes: 31, comments: 18, views: 445 },
      timeAgo: '5시간 전',
      isExpert: true
    },
    {
      id: 4,
      author: {
        name: '한점미소발달센터',
        role: 'institution',
        avatar: '/api/placeholder/40/40',
        badges: ['제휴기관', '우수기관']
      },
      title: '발달재활서비스 바우처 이용 안내',
      content: '발달재활서비스 바우처를 통해 경제적 부담 없이 전문적인 치료를 받으실 수 있습니다. 언어치료, 인지치료, 작업치료 등 다양한 서비스를 제공하고 있어요.',
      tags: ['바우처', '발달재활서비스', '지원'],
      stats: { likes: 42, comments: 12, views: 567 },
      timeAgo: '6시간 전',
      isInstitution: true
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
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.stats.comments}
                      </div>
                      <div className="flex items-center gap-1">
                        조회 {post.stats.views}
                      </div>
                    </div>
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
        <TabsContent value="institutions" className="space-y-4">
          {institutionsList.map((institution, index) => (
            <Card key={index}>
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