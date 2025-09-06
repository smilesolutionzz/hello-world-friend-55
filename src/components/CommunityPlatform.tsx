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
      title: '5세 아이 언어발달 고민 해결 후기',
      content: 'AIHPRO 검사를 통해 언어치료를 시작했는데 3개월 만에 놀라운 변화가...',
      tags: ['언어발달', '5세', '성공후기'],
      stats: { likes: 24, comments: 8, views: 156 },
      timeAgo: '2시간 전',
      isVerified: true
    },
    {
      id: 2,
      author: {
        name: '박선생님',
        role: 'expert',
        avatar: '/api/placeholder/40/40',
        badges: ['인증전문가', 'TOP기여자']
      },
      title: '겨울철 아동 우울증 예방법',
      content: '일조량이 부족한 겨울철, 아이들의 정서적 변화를 주의깊게 관찰해야...',
      tags: ['아동우울증', '겨울철', '예방법'],
      stats: { likes: 45, comments: 12, views: 289 },
      timeAgo: '5시간 전',
      isExpert: true
    },
    {
      id: 3,
      author: {
        name: '서울발달센터',
        role: 'institution',
        avatar: '/api/placeholder/40/40',
        badges: ['제휴기관', '우수기관']
      },
      title: '발달평가 무료 상담 이벤트 안내',
      content: '2월 한 달간 AIHPRO 회원 대상으로 발달평가 무료 상담을 진행합니다...',
      tags: ['무료상담', '발달평가', '이벤트'],
      stats: { likes: 67, comments: 23, views: 445 },
      timeAgo: '1일 전',
      isInstitution: true
    }
  ];

  // 전문가 목록
  const expertsList = [
    {
      name: '김소아과 원장',
      specialty: '소아청소년정신과',
      experience: '15년',
      rating: 4.9,
      consultations: 1234,
      online: true
    },
    {
      name: '이심리사',
      specialty: '임상심리학',
      experience: '8년',
      rating: 4.8,
      consultations: 856,
      online: false
    },
    {
      name: '박언어치료사',
      specialty: '언어발달치료',
      experience: '12년',
      rating: 4.9,
      consultations: 967,
      online: true
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
      programs: ['발달평가', '언어치료', '인지치료']
    },
    {
      name: '행복한육아상담소',
      type: '상담센터',
      location: '부산 해운대구',
      rating: 4.7,
      members: 32,
      programs: ['부모상담', '가족치료', '놀이치료']
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
              <div className="text-2xl font-bold text-primary">2,456</div>
              <div className="text-xs text-muted-foreground">활성 회원</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="text-xs text-muted-foreground">인증 전문가</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">89</div>
              <div className="text-xs text-muted-foreground">제휴 기관</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">1,234</div>
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
        <TabsContent value="success">
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold mb-2">성공사례 모음집</h3>
              <p className="text-muted-foreground mb-4">
                AIHPRO를 통해 긍정적인 변화를 경험한 가족들의 이야기
              </p>
              <Button>성공사례 보기</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityPlatform;