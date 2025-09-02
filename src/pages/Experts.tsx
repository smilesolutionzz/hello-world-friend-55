import React, { useState } from 'react';
import { ExpertList } from '@/components/expert/ExpertList';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Users, Star, Clock } from 'lucide-react';

const Experts = () => {
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
  const [selectedConsultationType, setSelectedConsultationType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const specializations = [
    '아동발달',
    '언어치료',
    '심리상담',
    '행동분석',
    '특수교육',
    '가족상담',
    '육아코칭',
    'ADHD',
    '자폐스펙트럼',
    '학습장애',
    '사회성훈련',
    '감정조절'
  ];

  const consultationTypes = [
    { value: 'text', label: '텍스트 상담', icon: '💬' },
    { value: 'voice', label: '음성 상담', icon: '🎤' },
    { value: 'video', label: '화상 상담', icon: '📹' }
  ];

  const clearFilters = () => {
    setSelectedSpecialization('');
    setSelectedConsultationType('');
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">전문가 상담</h1>
            <p className="text-muted-foreground text-lg">
              검증된 전문가와 1:1 맞춤 상담을 받아보세요
            </p>
          </div>

          {/* 상담 특징 */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">검증된 전문가</h3>
              <p className="text-sm text-muted-foreground">
                자격증과 경력을 검증받은 전문가들과 상담
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">즉시 상담 가능</h3>
              <p className="text-sm text-muted-foreground">
                예약 없이 바로 상담을 시작할 수 있습니다
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Star className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">개인 맞춤 상담</h3>
              <p className="text-sm text-muted-foreground">
                당신의 상황에 맞는 전문적인 솔루션 제공
              </p>
            </Card>
          </div>
        </div>

        {/* 필터 */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5" />
              전문가 필터
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '간단히 보기' : '자세히 보기'}
            </Button>
          </div>

          <div className="space-y-4">
            {/* 기본 필터 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">전문 분야</label>
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger>
                    <SelectValue placeholder="전문 분야 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">전체</SelectItem>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">상담 방식</label>
                <Select value={selectedConsultationType} onValueChange={setSelectedConsultationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="상담 방식 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">전체</SelectItem>
                    {consultationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 활성 필터 표시 */}
            {(selectedSpecialization || selectedConsultationType) && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-sm font-medium">활성 필터:</span>
                {selectedSpecialization && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedSpecialization}
                    <button
                      onClick={() => setSelectedSpecialization('')}
                      className="ml-1 hover:bg-destructive/20 rounded-full"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedConsultationType && (
                  <Badge variant="secondary" className="gap-1">
                    {consultationTypes.find(t => t.value === selectedConsultationType)?.label}
                    <button
                      onClick={() => setSelectedConsultationType('')}
                      className="ml-1 hover:bg-destructive/20 rounded-full"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  전체 초기화
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* 전문가 목록 */}
        <ExpertList 
          specialization={selectedSpecialization || undefined}
          consultationType={selectedConsultationType || undefined}
        />
      </div>
    </div>
  );
};

export default Experts;