import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Quote, ChevronLeft, ChevronRight, Heart, Users, Award } from 'lucide-react';

const TestimonialSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
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
    {
      id: 2,
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
    {
      id: 3,
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
    {
      id: 4,
      type: 'parent',
      name: '이수진 님',
      role: '5세 자녀 부모',
      avatar: '/api/placeholder/50/50',
      rating: 5,
      title: '안전하고 믿을 수 있는 상담 플랫폼',
      content: '처음엔 온라인 상담이 걱정됐지만, 전문가가 직접 검토해주고 개인정보도 안전하게 보호되니까 안심하고 이용할 수 있었어요.',
      beforeAfter: '검사 전: 육아 스트레스로 고민 / 검사 후: 전문가 조언으로 양육 자신감 향상',
      tags: ['신뢰성', '개인정보보호', '전문가검토']
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