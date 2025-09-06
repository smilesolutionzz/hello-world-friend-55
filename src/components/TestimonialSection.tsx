import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Quote, ChevronLeft, ChevronRight, Heart, Users, Award } from 'lucide-react';

const TestimonialSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    // 유아 (1-3세)
    {
      id: 1,
      type: 'parent',
      name: '김미영 님',
      role: '2세 자녀 부모',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '언어발달 지연 조기 발견으로 집중치료 시작',
      content: '24개월인데 말이 늦어서 걱정했는데, AIHPRO 검사로 언어발달 지연을 확인하고 바로 치료를 시작했어요. 6개월 만에 또래 수준까지 따라잡았습니다.',
      beforeAfter: '검사 전: 10개 단어만 표현 / 검사 후: 2단어 조합으로 의사소통 가능',
      tags: ['언어발달', '유아', '조기치료']
    },
    
    // 학령전기 (4-6세)
    {
      id: 2,
      type: 'parent',
      name: '김영희 님',
      role: '7세 자녀 부모',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: 'ADHD 조기 발견으로 적절한 치료 시작',
      content: '아이가 산만해서 걱정이 많았는데, 3분 검사로 ADHD 가능성을 발견하고 전문가 상담을 받을 수 있었어요. 조기 발견 덕분에 지금은 많이 좋아졌습니다.',
      beforeAfter: '검사 전: 학급에서 문제 행동 / 검사 후: 적절한 치료로 집중력 향상',
      tags: ['ADHD', '조기발견', '전문가상담']
    },

    // 학령기 (7-12세)
    {
      id: 3,
      type: 'parent',
      name: '박수진 님',
      role: '9세 자녀 부모',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '학습장애 진단 후 맞춤형 교육으로 성적 향상',
      content: '성적이 계속 떨어져서 고민이었는데, 검사 결과 난독증이 있다는 걸 알게 되었어요. 맞춤형 학습 방법을 적용한 후 자신감도 생기고 성적도 많이 올랐습니다.',
      beforeAfter: '검사 전: 평균 60점대 성적 / 검사 후: 평균 85점대로 향상',
      tags: ['학습장애', '난독증', '맞춤교육']
    },

    // 청소년 (13-18세)
    {
      id: 4,
      type: 'parent',
      name: '이수진 님',
      role: '16세 자녀 부모',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '청소년 우울증 조기 개입으로 학교 적응 성공',
      content: '고등학교 올라가면서 아이가 우울해하고 학교 가기 싫어했는데, AI상담으로 우울증 가능성을 발견하고 전문가 치료를 받았어요. 지금은 다시 밝은 모습을 되찾았습니다.',
      beforeAfter: '검사 전: 등교거부, 무기력 / 검사 후: 적극적인 학교생활 참여',
      tags: ['청소년우울증', '등교거부', '조기개입']
    },

    // 대학생 (19-22세)
    {
      id: 5,
      type: 'user',
      name: '최민준 님',
      role: '20세 대학생',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '진로 고민과 불안장애 해결로 새로운 시작',
      content: '대학 생활 적응이 힘들고 진로에 대한 불안이 컸는데, AIHPRO의 종합 상담을 통해 내 성향을 정확히 파악하고 맞는 전공으로 전과했어요. 지금은 만족스러운 대학생활을 하고 있습니다.',
      beforeAfter: '검사 전: 진로 고민, 불안장애 / 검사 후: 명확한 목표 설정, 안정적 심리상태',
      tags: ['진로상담', '불안장애', '대학생활']
    },

    // 직장인 (23-35세)
    {
      id: 6,
      type: 'user',
      name: '김태호 님',
      role: '28세 회사원',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '직장 스트레스와 번아웃 극복으로 승진 성공',
      content: '과도한 업무로 번아웃이 왔는데, AIHPRO 스트레스 관리 프로그램을 통해 건강한 업무 패턴을 찾았어요. 심리적 안정을 되찾고 업무 효율도 높아져서 승진도 했습니다.',
      beforeAfter: '검사 전: 심한 번아웃, 업무 효율 저하 / 검사 후: 스트레스 관리 능력 향상, 승진',
      tags: ['번아웃', '직장스트레스', '업무효율']
    },

    // 워킹맘 (30-40세)
    {
      id: 7,
      type: 'parent',
      name: '조은영 님',
      role: '35세 워킹맘',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '육아 스트레스와 우울감 해소로 행복한 가정 만들기',
      content: '첫째 출산 후 육아우울증이 심했는데, AI상담과 전문가 연결을 통해 점진적으로 회복했어요. 둘째도 건강하게 키우고 있고, 가족 관계도 훨씬 좋아졌습니다.',
      beforeAfter: '검사 전: 육아우울증, 가족 갈등 / 검사 후: 심리적 안정, 화목한 가정',
      tags: ['육아우울증', '워킹맘', '가족관계']
    },

    // 중년 (40-50세)
    {
      id: 8,
      type: 'user',
      name: '박철수 님',
      role: '45세 관리직',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '중년의 위기와 우울감 극복으로 제2의 인생 시작',
      content: '회사에서 승진이 막히고 가정에서도 소외감을 느끼던 중, AIHPRO를 통해 중년의 위기를 객관적으로 진단받았어요. 상담을 통해 새로운 목표를 설정하고 적극적인 삶의 태도를 되찾았습니다.',
      beforeAfter: '검사 전: 중년의 위기, 무기력감 / 검사 후: 새로운 목표 설정, 적극적 생활',
      tags: ['중년의위기', '우울감', '목표설정']
    },

    // 갱년기 (50-60세)
    {
      id: 9,
      type: 'user',
      name: '이순희 님',
      role: '52세 주부',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '갱년기 우울증과 불안 극복으로 새로운 취미 발견',
      content: '갱년기 증상으로 우울하고 불안했는데, AIHPRO의 맞춤형 상담을 통해 호르몬 변화에 대한 이해와 대처법을 배웠어요. 지금은 새로운 취미도 생기고 활발한 사회활동을 하고 있습니다.',
      beforeAfter: '검사 전: 갱년기 우울, 사회적 고립 / 검사 후: 활발한 사회활동, 새로운 취미',
      tags: ['갱년기', '우울증', '사회활동']
    },

    // 노년기 (60세 이상)
    {
      id: 10,
      type: 'user',
      name: '최노년 님',
      role: '68세 은퇴자',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '치매 예방과 인지기능 개선으로 건강한 노년 생활',
      content: '기억력이 떨어져서 치매가 걱정됐는데, AIHPRO의 인지기능 검사와 맞춤형 훈련 프로그램을 통해 많이 개선됐어요. 손자들과도 더 많은 시간을 보낼 수 있게 되었습니다.',
      beforeAfter: '검사 전: 기억력 저하, 치매 걱정 / 검사 후: 인지기능 개선, 활발한 손자 돌보기',
      tags: ['치매예방', '인지기능', '노년건강']
    },

    // 전문가 증언
    {
      id: 11,
      type: 'expert',
      name: '박민수 원장',
      role: '소아청소년정신과 전문의',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '체계적인 선별검사 시스템에 만족',
      content: 'AIHPRO의 발달 선별검사는 임상적으로 검증된 도구를 사용하고 있어 신뢰할 수 있습니다. 부모들이 조기에 발견하여 내원하는 케이스가 늘었어요.',
      expertise: '15년 경력, 발달장애 전문',
      tags: ['전문가인증', '임상검증', '조기개입']
    },

    // 제휴기관 증언
    {
      id: 12,
      type: 'institution',
      name: '서울발달센터',
      role: '제휴 발달센터',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '효과적인 환자 연결 시스템',
      content: 'AIHPRO를 통해 연결된 환자들은 이미 기본 선별이 완료된 상태여서 보다 정확하고 빠른 진단이 가능합니다. 협력 관계에 매우 만족합니다.',
      stats: '월 평균 50명 연결, 만족도 95%',
      tags: ['제휴기관', '효율성', '정확도']
    },

    // 기업 HR 담당자
    {
      id: 13,
      type: 'corporate',
      name: '김HR 님',
      role: 'IT기업 인사팀장',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '직원 번아웃 예방으로 회사 분위기 개선',
      content: '회사에서 AIHPRO 기업 솔루션을 도입한 후 직원들의 스트레스 관리가 크게 개선되었어요. 번아웃으로 인한 이직률도 30% 감소했고, 전체적인 업무 만족도가 높아졌습니다.',
      beforeAfter: '도입 전: 높은 이직률, 번아웃 만연 / 도입 후: 이직률 30% 감소, 업무만족도 향상',
      tags: ['기업복지', '번아웃예방', 'HR솔루션']
    },

    // 교육기관 상담교사
    {
      id: 14,
      type: 'educator',
      name: '정선생님',
      role: '초등학교 상담교사',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '학생 상담의 효율성과 정확성 크게 향상',
      content: 'AIHPRO를 활용한 후 학생들의 심리 상태를 더 객관적으로 파악할 수 있게 되었어요. 부모 상담 시에도 구체적인 데이터를 제시할 수 있어서 신뢰도가 높아졌습니다.',
      beforeAfter: '도입 전: 주관적 판단에 의존 / 도입 후: 객관적 데이터 기반 상담',
      tags: ['학교상담', '객관적진단', '부모상담']
    },

    // 특수교육 교사
    {
      id: 15,
      type: 'educator',
      name: '김특수교사',
      role: '특수교육 전문교사',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '개별화교육계획(IEP) 수립에 큰 도움',
      content: 'AIHPRO의 발달 평가 도구는 특수교육 대상 학생들의 IEP 수립에 매우 유용해요. 각 영역별 세밀한 평가가 가능해서 더 정확한 교육 목표를 설정할 수 있습니다.',
      expertise: '특수교육 10년, IEP 수립 전문',
      tags: ['특수교육', 'IEP', '개별화교육']
    },

    // 임상심리사
    {
      id: 16,
      type: 'expert',
      name: '이심리사',
      role: '임상심리전문가',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: 'AI와 전문가의 완벽한 협업 시스템',
      content: 'AIHPRO의 AI 분석은 예비 평가로서 매우 정확하고, 이를 바탕으로 한 전문가 상담이 훨씬 효율적입니다. 상담 시간을 단축하면서도 질적 향상을 이뤘어요.',
      expertise: '임상심리 12년, 인지행동치료 전문',
      tags: ['AI협업', '효율성', '임상심리']
    },

    // 언어치료사
    {
      id: 17,
      type: 'expert',
      name: '박언어치료사',
      role: '언어재활사',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '언어발달 평가의 정확성과 신속성 모두 만족',
      content: '언어발달 지연 아동들의 정확한 진단을 위해 AIHPRO를 활용하고 있어요. 표준화된 검사 도구와 AI 분석으로 더 객관적이고 신속한 평가가 가능합니다.',
      expertise: '언어치료 8년, 발달언어장애 전문',
      tags: ['언어치료', '발달평가', '객관적진단']
    },

    // 정신건강의학과 전문의
    {
      id: 18,
      type: 'expert',
      name: '최정신과의사',
      role: '정신건강의학과 전문의',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '정신건강 선별검사의 새로운 표준',
      content: 'AIHPRO의 정신건강 선별검사는 의학적으로 검증된 도구들을 잘 활용하고 있어요. 환자들이 병원 방문 전에 미리 상태를 파악할 수 있어서 진료 효율성이 크게 향상되었습니다.',
      expertise: '정신의학 20년, 우울증·불안장애 전문',
      tags: ['정신건강', '선별검사', '진료효율성']
    },

    // 소아과 의사
    {
      id: 19,
      type: 'expert',
      name: '김소아과의사',
      role: '소아청소년과 전문의',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '발달 스크리닝의 혁신적 도구',
      content: '영유아 건강검진 시 AIHPRO의 발달 평가를 함께 활용하면 더 종합적인 건강 체크가 가능해요. 부모들도 결과에 대해 더 잘 이해하고 수용하는 편입니다.',
      expertise: '소아청소년과 15년, 발달의학 전문',
      tags: ['발달스크리닝', '건강검진', '소아과']
    },

    // 상담센터 원장
    {
      id: 20,
      type: 'institution',
      name: '행복상담센터',
      role: '가족상담 전문기관',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '가족 상담의 효과성 크게 향상',
      content: 'AIHPRO를 통해 가족 구성원들의 심리 상태를 객관적으로 파악한 후 상담을 진행하니까 훨씬 구체적이고 실질적인 도움을 드릴 수 있게 되었어요.',
      stats: '월 평균 80가족 상담, 만족도 98%',
      tags: ['가족상담', '객관적평가', '상담효과']
    },

    // 청소년상담사
    {
      id: 21,
      type: 'expert',
      name: '이청소년상담사',
      role: '청소년상담복지센터',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '청소년 위기 조기 발견의 핵심 도구',
      content: '위험에 노출된 청소년들을 조기에 발견하고 개입하는 데 AIHPRO가 큰 도움이 되고 있어요. 객관적인 평가 결과로 청소년과 부모 모두 상담에 더 적극적으로 참여합니다.',
      expertise: '청소년상담 10년, 위기개입 전문',
      tags: ['청소년상담', '위기개입', '조기발견']
    },

    // 치매전문 의사
    {
      id: 22,
      type: 'expert',
      name: '박치매전문의',
      role: '신경과 전문의',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '인지기능 평가의 접근성 크게 개선',
      content: '치매 조기 진단을 위한 인지기능 검사를 AIHPRO로 1차 스크리닝하면 병원 방문 시 더 정밀한 검사에 집중할 수 있어요. 조기 발견율이 30% 향상되었습니다.',
      expertise: '신경과 18년, 치매 조기진단 전문',
      tags: ['치매진단', '인지기능', '조기발견']
    }
  ];

  const stats = [
    { icon: <Users className="w-5 h-5" />, label: '누적 사용자', value: '15,234명' },
    { icon: <Heart className="w-5 h-5" />, label: '만족도', value: '95.8%' },
    { icon: <Award className="w-5 h-5" />, label: '전문가 연결', value: '3,456건' }
  ];

  const handlePrevious = () => {
    setCurrentTestimonial((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentTestimonial((prev) => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const currentItem = testimonials[currentTestimonial];

  return (
    <div className="space-y-6">
      {/* 통계 */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2 text-primary">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 메인 후기 */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* 사용자 정보 */}
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={currentItem.avatar} />
                <AvatarFallback>{currentItem.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{currentItem.name}</div>
                <div className="text-sm text-muted-foreground">{currentItem.role}</div>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(currentItem.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* 후기 내용 */}
            <div className="relative">
              <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/20" />
              <h3 className="font-semibold mb-2 pl-6">{currentItem.title}</h3>
              <p className="text-muted-foreground leading-relaxed pl-6">
                {currentItem.content}
              </p>
            </div>

            {/* 추가 정보 */}
            {currentItem.beforeAfter && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-green-800 mb-1">변화 과정</div>
                <div className="text-sm text-green-700">{currentItem.beforeAfter}</div>
              </div>
            )}

            {currentItem.expertise && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-1">전문 분야</div>
                <div className="text-sm text-blue-700">{currentItem.expertise}</div>
              </div>
            )}

            {currentItem.stats && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-purple-800 mb-1">협력 현황</div>
                <div className="text-sm text-purple-700">{currentItem.stats}</div>
              </div>
            )}

            {/* 태그 */}
            <div className="flex flex-wrap gap-2">
              {currentItem.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestimonialSection;