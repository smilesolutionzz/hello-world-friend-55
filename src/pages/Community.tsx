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

  // 확장된 커뮤니티 포스트 데이터 (20개 이상의 다양한 연령대 사례)
  const [communityPosts] = useState([
    // 유아 사례
    {
      id: 1,
      author: {
        name: '김미영',
        role: 'parent',
        avatar: '/api/placeholder/40/40',
        badges: ['신뢰회원'],
        isAnonymous: false
      },
      title: '24개월 아이 언어발달 지연 조기 발견 성공',
      content: '아이가 24개월인데 단어를 10개 정도밖에 못해서 걱정이 많았어요. AIHPRO 검사를 받아보니 언어발달 지연이 확인되어서 바로 언어치료를 시작했어요. 6개월 치료 후 지금은 2단어 조합도 하고 의사소통이 훨씬 수월해졌습니다.',
      tags: ['언어발달', '유아', '조기치료'],
      stats: { likes: 45, comments: 12, views: 234, shares: 8 },
      timeAgo: '1일 전',
      category: 'success_story'
    },
    
    // 학령전기 사례
    {
      id: 2,
      author: {
        name: '김영희',
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

    // 학령기 사례
    {
      id: 3,
      author: {
        name: '박수진',
        role: 'parent',
        avatar: '/api/placeholder/40/40',
        badges: ['신뢰회원'],
        isAnonymous: false
      },
      title: '9세 아이 학습장애 진단 후 성적 향상 성공',
      content: '3학년인데 성적이 계속 떨어져서 고민이 많았어요. AIHPRO 검사 결과 난독증이 있다는 걸 알게 되었고, 맞춤형 학습 방법을 적용한 후 자신감도 생기고 성적도 평균 60점대에서 85점대로 올랐어요!',
      tags: ['학습장애', '난독증', '성적향상'],
      stats: { likes: 67, comments: 15, views: 289, shares: 12 },
      timeAgo: '3시간 전',
      category: 'success_story'
    },

    // 청소년 사례
    {
      id: 4,
      author: {
        name: '이수진',
        role: 'parent',
        avatar: '/api/placeholder/40/40',
        badges: ['신뢰회원'],
        isAnonymous: false
      },
      title: '16세 아이 청소년 우울증 조기 개입 성공',
      content: '고등학교 올라가면서 아이가 우울해하고 학교 가기 싫어했어요. AIHPRO AI상담으로 우울증 가능성을 발견하고 전문가 치료를 받았어요. 지금은 다시 밝은 모습을 되찾고 적극적으로 학교생활에 참여하고 있습니다.',
      tags: ['청소년우울증', '등교거부', '조기개입'],
      stats: { likes: 89, comments: 23, views: 445, shares: 18 },
      timeAgo: '5시간 전',
      category: 'success_story'
    },

    // 대학생 사례
    {
      id: 5,
      author: {
        name: '최민준',
        role: 'user',
        avatar: '/api/placeholder/40/40',
        badges: ['대학생회원'],
        isAnonymous: false
      },
      title: '20세 대학생 진로 고민과 불안장애 해결',
      content: '대학 생활 적응이 힘들고 진로에 대한 불안이 컸는데, AIHPRO의 종합 상담을 통해 내 성향을 정확히 파악하고 맞는 전공으로 전과했어요. 지금은 만족스러운 대학생활을 하고 있습니다.',
      tags: ['진로상담', '불안장애', '대학생활'],
      stats: { likes: 156, comments: 45, views: 678, shares: 34 },
      timeAgo: '1일 전',
      category: 'success_story'
    },

    // 직장인 번아웃 사례
    {
      id: 6,
      author: {
        name: '김태호',
        role: 'user',
        avatar: '/api/placeholder/40/40',
        badges: ['직장인회원'],
        isAnonymous: false
      },
      title: '28세 회사원 번아웃 극복으로 승진 성공',
      content: '과도한 업무로 번아웃이 와서 퇴사를 고려하고 있었어요. AIHPRO 스트레스 관리 프로그램을 통해 건강한 업무 패턴을 찾았고, 심리적 안정을 되찾아 업무 효율도 높아져서 승진까지 했습니다!',
      tags: ['번아웃', '직장스트레스', '승진성공'],
      stats: { likes: 234, comments: 67, views: 891, shares: 45 },
      timeAgo: '2일 전',
      category: 'success_story'
    },

    // 워킹맘 사례
    {
      id: 7,
      author: {
        name: '조은영',
        role: 'parent',
        avatar: '/api/placeholder/40/40',
        badges: ['워킹맘', '신뢰회원'],
        isAnonymous: false
      },
      title: '35세 워킹맘 육아우울증 극복 후기',
      content: '첫째 출산 후 육아우울증이 심해서 힘들었는데, AIHPRO AI상담과 전문가 연결을 통해 점진적으로 회복했어요. 둘째도 건강하게 키우고 있고, 가족 관계도 훨씬 좋아졌습니다.',
      tags: ['육아우울증', '워킹맘', '가족관계'],
      stats: { likes: 178, comments: 56, views: 567, shares: 28 },
      timeAgo: '3일 전',
      category: 'success_story'
    },

    // 중년의 위기 사례
    {
      id: 8,
      author: {
        name: '박철수',
        role: 'user',
        avatar: '/api/placeholder/40/40',
        badges: ['중년회원'],
        isAnonymous: false
      },
      title: '45세 관리직 중년의 위기 극복',
      content: '회사에서 승진이 막히고 가정에서도 소외감을 느끼던 중, AIHPRO를 통해 중년의 위기를 객관적으로 진단받았어요. 상담을 통해 새로운 목표를 설정하고 적극적인 삶의 태도를 되찾았습니다.',
      tags: ['중년의위기', '목표설정', '적극적생활'],
      stats: { likes: 145, comments: 34, views: 456, shares: 22 },
      timeAgo: '4일 전',
      category: 'success_story'
    },

    // 갱년기 사례
    {
      id: 9,
      author: {
        name: '이순희',
        role: 'user',
        avatar: '/api/placeholder/40/40',
        badges: ['시니어회원'],
        isAnonymous: false
      },
      title: '52세 주부 갱년기 우울증 극복',
      content: '갱년기 증상으로 우울하고 불안했는데, AIHPRO의 맞춤형 상담을 통해 호르몬 변화에 대한 이해와 대처법을 배웠어요. 지금은 새로운 취미도 생기고 활발한 사회활동을 하고 있습니다.',
      tags: ['갱년기', '우울증', '사회활동'],
      stats: { likes: 167, comments: 42, views: 389, shares: 19 },
      timeAgo: '5일 전',
      category: 'success_story'
    },

    // 노년기 사례
    {
      id: 10,
      author: {
        name: '최노년',
        role: 'user',
        avatar: '/api/placeholder/40/40',
        badges: ['시니어회원', '건강관리'],
        isAnonymous: false
      },
      title: '68세 은퇴자 치매 예방과 인지기능 개선',
      content: '기억력이 떨어져서 치매가 걱정됐는데, AIHPRO의 인지기능 검사와 맞춤형 훈련 프로그램을 통해 많이 개선됐어요. 손자들과도 더 많은 시간을 보낼 수 있게 되었습니다.',
      tags: ['치매예방', '인지기능', '노년건강'],
      stats: { likes: 289, comments: 78, views: 723, shares: 45 },
      timeAgo: '1주 전',
      category: 'success_story'
    },

    // 기업 HR 번아웃 관리 사례
    {
      id: 11,
      author: {
        name: '김HR매니저',
        role: 'corporate',
        avatar: '/api/placeholder/40/40',
        badges: ['기업회원', 'HR전문가'],
        isAnonymous: false
      },
      title: 'IT기업 직원 번아웃 예방 프로그램 도입 성공',
      content: '저희 회사에서 AIHPRO 기업 솔루션을 도입한 후 직원들의 스트레스 관리가 크게 개선되었어요. 번아웃으로 인한 이직률이 30% 감소했고, 전체적인 업무 만족도가 85%에서 94%로 향상되었습니다.',
      tags: ['기업복지', '번아웃예방', 'HR솔루션'],
      stats: { likes: 345, comments: 89, views: 1234, shares: 67 },
      timeAgo: '1주 전',
      category: 'success_story'
    },

    // 교육기관 사례
    {
      id: 12,
      author: {
        name: '정상담교사',
        role: 'educator',
        avatar: '/api/placeholder/40/40',
        badges: ['교육전문가', '상담교사'],
        isAnonymous: false
      },
      title: '초등학교 학생 상담의 효율성 크게 향상',
      content: 'AIHPRO를 활용한 후 학생들의 심리 상태를 더 객관적으로 파악할 수 있게 되었어요. 부모 상담 시에도 구체적인 데이터를 제시할 수 있어서 학부모님들의 신뢰도가 크게 높아졌습니다.',
      tags: ['학교상담', '객관적진단', '부모상담'],
      stats: { likes: 198, comments: 45, views: 567, shares: 28 },
      timeAgo: '2주 전',
      category: 'success_story'
    },

    // 제휴기관 리더 번아웃 극복 사례
    {
      id: 13,
      author: {
        name: '박센터장',
        role: 'institution',
        avatar: '/api/placeholder/40/40',
        badges: ['제휴기관', '센터장'],
        isAnonymous: false
      },
      title: '상담센터 운영 중 번아웃 위기를 극복한 이야기',
      content: '상담센터를 10년간 운영하면서 직원들과 내 자신의 번아웃이 심각했어요. AIHPRO를 통해 체계적인 스트레스 관리와 조직 분석을 받은 후, 센터 운영 방식을 개선했고 직원 만족도와 상담 효과가 모두 향상되었습니다.',
      tags: ['센터운영', '리더번아웃', '조직개선'],
      stats: { likes: 234, comments: 56, views: 678, shares: 34 },
      timeAgo: '2주 전',
      category: 'success_story'
    },

    // 전문가 의견
    {
      id: 14,
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

    // 질문 사례
    {
      id: 15,
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
    },

    // 추가 성공사례들
    {
      id: 16,
      author: {
        name: '강병원장',
        role: 'expert',
        avatar: '/api/placeholder/40/40',
        badges: ['의료진', '정신과전문의'],
        isAnonymous: false
      },
      title: '정신건강 선별검사의 새로운 표준이 되다',
      content: 'AIHPRO의 정신건강 선별검사는 의학적으로 검증된 도구들을 잘 활용하고 있습니다. 환자들이 병원 방문 전에 미리 상태를 파악할 수 있어서 진료 효율성이 크게 향상되었고, 조기 개입이 가능해졌습니다.',
      tags: ['정신건강', '선별검사', '진료효율성'],
      stats: { likes: 156, comments: 34, views: 456, shares: 23 },
      timeAgo: '3일 전',
      isExpert: true,
      category: 'expert_advice'
    },

    {
      id: 17,
      author: {
        name: '서울대병원',
        role: 'institution',
        avatar: '/api/placeholder/40/40',
        badges: ['대학병원', '제휴기관'],
        isAnonymous: false
      },
      title: '대학병원 소아정신과 협력 성과 보고',
      content: 'AIHPRO와의 협력을 통해 소아정신과 외래 대기시간이 평균 2주에서 3일로 단축되었습니다. 사전 선별검사를 통해 더 정확한 진단과 치료 계획 수립이 가능해져서 치료 만족도가 90%에서 96%로 향상되었습니다.',
      tags: ['대학병원', '소아정신과', '대기시간단축'],
      stats: { likes: 298, comments: 67, views: 789, shares: 45 },
      timeAgo: '4일 전',
      category: 'success_story'
    },

    {
      id: 18,
      author: {
        name: '이복지사',
        role: 'social_worker',
        avatar: '/api/placeholder/40/40',
        badges: ['사회복지사', '아동보호'],
        isAnonymous: false
      },
      title: '아동보호 현장에서의 AIHPRO 활용 경험',
      content: '학대 피해 아동들의 심리 상태를 객관적으로 평가하는 데 AIHPRO가 큰 도움이 되고 있습니다. 아이들이 직접 말하기 어려운 트라우마나 정서적 문제를 조기에 발견할 수 있어서 적절한 치료 연결이 가능해졌어요.',
      tags: ['아동보호', '트라우마', '사회복지'],
      stats: { likes: 234, comments: 45, views: 567, shares: 28 },
      timeAgo: '5일 전',
      category: 'expert_advice'
    },

    {
      id: 19,
      author: {
        name: '익명의 간병인',
        role: 'caregiver',
        avatar: '/api/placeholder/40/40',
        badges: [],
        isAnonymous: true
      },
      title: '치매 어르신 돌봄의 새로운 희망',
      content: '5년째 치매 시어머님을 돌보고 있는데 정말 힘들었어요. AIHPRO의 치매 케어 가이드라인과 가족 상담 프로그램을 통해 더 효과적인 돌봄 방법을 배웠고, 제 스트레스도 많이 줄었습니다.',
      tags: ['치매돌봄', '가족간병', '스트레스관리'],
      stats: { likes: 167, comments: 38, views: 445, shares: 19 },
      timeAgo: '6일 전',
      category: 'success_story'
    },

    {
      id: 20,
      author: {
        name: '김스타트업대표',
        role: 'corporate',
        avatar: '/api/placeholder/40/40',
        badges: ['스타트업', 'CEO'],
        isAnonymous: false
      },
      title: '스타트업 팀원들의 번아웃 예방 성공 사례',
      content: '빠르게 성장하는 스타트업 환경에서 팀원들의 번아웃이 심각한 문제였어요. AIHPRO 기업 솔루션을 도입한 후 개별 맞춤형 스트레스 관리와 정기 심리 체크를 통해 팀 생산성이 40% 향상되고 이직률이 절반으로 줄었습니다.',
      tags: ['스타트업', '팀관리', '생산성향상'],
      stats: { likes: 345, comments: 78, views: 892, shares: 56 },
      timeAgo: '1주 전',
      category: 'success_story'
    },

    {
      id: 21,
      author: {
        name: '정교감선생님',
        role: 'educator',
        avatar: '/api/placeholder/40/40',
        badges: ['교육행정', '중학교교감'],
        isAnonymous: false
      },
      title: '중학교 학교폭력 예방에 큰 효과',
      content: '학교폭력 가해·피해 학생들의 심리 상태를 정확히 파악하기 위해 AIHPRO를 활용하고 있어요. 조기 발견과 적절한 개입을 통해 학교폭력 발생률이 60% 감소했고, 학급 분위기도 크게 개선되었습니다.',
      tags: ['학교폭력예방', '중학교', '조기개입'],
      stats: { likes: 289, comments: 67, views: 723, shares: 43 },
      timeAgo: '1주 전',
      category: 'success_story'
    },

    {
      id: 22,
      author: {
        name: '익명의 군인',
        role: 'military',
        avatar: '/api/placeholder/40/40',
        badges: [],
        isAnonymous: true
      },
      title: '군 복무 중 PTSD 조기 발견과 치료',
      content: '군 복무 중 동료의 사고를 목격한 후 악몽과 불안감이 심했는데, AIHPRO 검사를 통해 PTSD 초기 증상을 발견했어요. 조기 치료로 전역 후에도 정상적인 사회생활을 하고 있습니다.',
      tags: ['PTSD', '군복무', '트라우마치료'],
      stats: { likes: 198, comments: 45, views: 456, shares: 22 },
      timeAgo: '2주 전',
      category: 'success_story'
    },

    {
      id: 23,
      author: {
        name: '박재활의학과',
        role: 'expert',
        avatar: '/api/placeholder/40/40',
        badges: ['의료진', '재활의학과'],
        isAnonymous: false
      },
      title: '뇌손상 환자 인지 재활에 새로운 전환점',
      content: '뇌손상 환자들의 인지 기능 평가와 재활 계획 수립에 AIHPRO를 활용하고 있습니다. 표준화된 평가를 통해 더 정확한 재활 목표 설정이 가능해졌고, 환자 만족도와 기능 회복률이 모두 향상되었습니다.',
      tags: ['뇌손상', '인지재활', '재활의학'],
      stats: { likes: 156, comments: 34, views: 389, shares: 18 },
      timeAgo: '2주 전',
      isExpert: true,
      category: 'expert_advice'
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
                <div className="text-3xl font-bold text-primary">3,847</div>
                <div className="text-sm text-muted-foreground">활성 회원</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">289</div>
                <div className="text-sm text-muted-foreground">인증 전문가</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">156</div>
                <div className="text-sm text-muted-foreground">제휴 기관</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">2,847</div>
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