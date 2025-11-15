import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Baby, GraduationCap, Briefcase, Heart, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";

interface AgeSelectorProps {
  onAgeGroupSelect: (ageGroup: 'infant' | 'child' | 'adult', age: number) => void;
  testType?: 'psychological' | 'language' | 'panic' | 'depression' | 'adhd' | null;
}

const AgeSelector = ({ onAgeGroupSelect, testType }: AgeSelectorProps) => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<'infant' | 'child' | 'adult' | null>(null);
  const [specificAge, setSpecificAge] = useState<number>(0);

  const getAgeGroupContent = (groupKey: 'infant' | 'child' | 'adult') => {
    if (testType === 'language') {
      const languageContent = {
        infant: {
          description: '언어발달 체크',
          features: ['언어 이해력', '표현 능력', '의사소통 기술', '발음 발달']
        },
        child: {
          description: '언어발달 체크',
          features: ['어휘력', '문장 구성', '읽기 쓰기', '대화 능력']
        },
        adult: {
          description: '언어발달 체크',
          features: ['언어 유창성', '이해력', '표현력', '의사소통']
        }
      };
      return languageContent[groupKey];
    }
    
    if (testType === 'adhd') {
      const adhdContent = {
        infant: {
          description: 'ADHD 검사',
          features: ['주의력 평가', '과잉행동 관찰', '충동성 체크', '발달 수준']
        },
        child: {
          description: 'ADHD 검사',
          features: ['주의력 결핍', '과잉행동', '충동성', '집중력 문제']
        },
        adult: {
          description: 'ADHD 검사',
          features: ['주의력 결핍', '시간관리 어려움', '충동성', '조직화 문제']
        }
      };
      return adhdContent[groupKey];
    }
    
    // 우울검사 내용
    const depressionContent = {
      infant: {
        description: '우울검사',
        features: ['정서 상태', '행동 변화', '수면/식욕 패턴', '사회적 위축']
      },
      child: {
        description: '우울검사',
        features: ['우울 기분', '흥미/즐거움 상실', '자기비하', '신체 증상']
      },
      adult: {
        description: '우울검사',
        features: ['우울 정서', '인지 증상', '신체화 증상', '사회적 기능']
      }
    };
    return depressionContent[groupKey];
  };

  const ageGroups = [
    {
      key: 'infant' as const,
      title: '영유아',
      subtitle: '0-5세',
      ...getAgeGroupContent('infant'),
      icon: Baby,
      color: 'from-gentle-peach to-warm-lavender'
    },
    {
      key: 'child' as const, 
      title: '아동청소년',
      subtitle: '6-18세',
      ...getAgeGroupContent('child'),
      icon: GraduationCap,
      color: 'from-calm-blue to-soft-mint'
    },
    {
      key: 'adult' as const,
      title: '성인',
      subtitle: '19-64세',
      ...getAgeGroupContent('adult'),
      icon: Briefcase,
      color: 'from-primary to-primary-glow'
    }
  ];

  const handleGroupSelect = (group: 'infant' | 'child' | 'adult') => {
    setSelectedGroup(group);
    // 기본 연령 설정
    const defaultAges = { infant: 3, child: 10, adult: 30 };
    setSpecificAge(defaultAges[group]);
  };

  const handleAgeSubmit = () => {
    if (selectedGroup && specificAge > 0) {
      onAgeGroupSelect(selectedGroup, specificAge);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 relative overflow-hidden">
      {/* Navigation */}
      <UnifiedNavigation />
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-24 pb-16">
        {/* Back to Home Button */}
        <div className="mb-6 flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            메인으로
          </Button>
        </div>
        
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-border">
              <Heart className="w-6 h-6 text-primary animate-pulse-glow" />
              <span className="text-xl font-semibold text-brand-gradient">전문 선별 평가 시스템</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="block text-foreground mb-2">
              {testType === 'language' ? '영유아언어발달체크' : testType === 'panic' ? '불안감 수준 확인' : testType === 'depression' ? '우울감 자가체크' : testType === 'adhd' ? '주의집중력 자가체크' : '3분으로 시작하는'}
            </span>
            <span className="block text-brand-gradient">
              {testType === 'language' ? '연령별 맞춤 확인' : testType === 'panic' ? '자가체크 (참고용)' : testType === 'depression' ? '참고용 체크' : testType === 'adhd' ? '연령별 체크 (참고용)' : '마음상태 체크'}
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground">
            {testType === 'language' 
              ? '영유아 발달 수준을 확인해보세요 (참고용)' 
              : testType === 'panic'
              ? '연령대를 선택하여 불안감 수준을 체크해보세요 (참고용)'
              : testType === 'depression'
              ? '연령대를 선택하여 우울감 수준을 확인해보세요 (참고용)'
              : testType === 'adhd'
              ? '연령대를 선택하여 ADHD 증상을 체크해보세요 (참고용)'
              : '연령에 맞는 마음상태 체크로 참고 분석을 받아보세요'
            }
          </p>
        </div>

        {/* Age Group Selection */}
        {!selectedGroup && (
          <div className="max-w-6xl mx-auto">
            <div className={`grid ${testType === 'language' ? 'md:grid-cols-1 max-w-md mx-auto' : (testType === 'panic' || testType === 'depression') ? 'md:grid-cols-1 max-w-2xl mx-auto' : testType === 'adhd' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-8`}>
              {ageGroups.filter(group => {
                if (testType === 'language') return group.key === 'infant';
                if (testType === 'panic' || testType === 'depression') return group.key === 'adult';
                if (testType === 'adhd') return group.key !== 'infant';
                return true;
              }).map((group) => {
                const IconComponent = group.icon;
                return (
                  <Card 
                    key={group.key}
                    className="relative overflow-hidden cursor-pointer hover-glow transition-all duration-300 hover:scale-105 group"
                    onClick={() => handleGroupSelect(group.key)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${group.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    
                    <div className="relative p-8 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${group.color}`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">{group.title}</h3>
                          <p className="text-lg text-muted-foreground">{group.subtitle}</p>
                        </div>
                      </div>
                      
                      <p className="text-lg text-brand-gradient font-semibold">
                        {group.description}
                      </p>
                      
                      <div className="space-y-2">
                        <ul className="space-y-1">
                          {group.features.map((feature, index) => (
                            <li key={index} className="text-muted-foreground flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button className="w-full btn-brand">
                        선택하기
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Specific Age Input */}
        {selectedGroup && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-brand-gradient">
                  {ageGroups.find(g => g.key === selectedGroup)?.title} 검사
                </h2>
                <p className="text-muted-foreground">
                  정확한 진단을 위해 구체적인 연령을 입력해주세요
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-semibold text-foreground">
                  연령 입력
                </label>
                
                {selectedGroup === 'infant' && (
                  <div className="space-y-3">
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={specificAge}
                      onChange={(e) => setSpecificAge(parseInt(e.target.value) || 0)}
                      className="w-full p-4 text-xl text-center border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="예: 3"
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      0-5세 사이의 나이를 입력해주세요
                    </p>
                  </div>
                )}

                {selectedGroup === 'child' && (
                  <div className="space-y-3">
                    <input
                      type="number"
                      min="6"
                      max="18"
                      value={specificAge}
                      onChange={(e) => setSpecificAge(parseInt(e.target.value) || 0)}
                      className="w-full p-4 text-xl text-center border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="예: 10"
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      6-18세 사이의 나이를 입력해주세요
                    </p>
                  </div>
                )}

                {selectedGroup === 'adult' && (
                  <div className="space-y-3">
                    <input
                      type="number" 
                      min="19"
                      max="80"
                      value={specificAge}
                      onChange={(e) => setSpecificAge(parseInt(e.target.value) || 0)}
                      className="w-full p-4 text-xl text-center border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="예: 30"
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      19세 이상의 나이를 입력해주세요
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedGroup(null)}
                  className="flex-1"
                >
                  뒤로가기
                </Button>
                <Button 
                  onClick={handleAgeSubmit}
                  disabled={!specificAge}
                  className="flex-1 btn-brand"
                >
                  검사 시작하기
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgeSelector;