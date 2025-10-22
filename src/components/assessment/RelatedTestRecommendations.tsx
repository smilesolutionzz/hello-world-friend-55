import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RelatedTest {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  relevance: "high" | "medium";
}

interface RelatedTestRecommendationsProps {
  currentTestType: string;
}

const testRecommendations: Record<string, RelatedTest[]> = {
  'adhd': [
    {
      id: 'learning-disability-test',
      title: '학습장애 검사',
      description: 'ADHD와 함께 나타날 수 있는 학습 문제를 확인합니다',
      duration: '3분',
      category: '학습',
      relevance: 'high'
    },
    {
      id: 'social-development-test',
      title: '사회성 발달 검사',
      description: '또래 관계와 사회적 상호작용 능력을 평가합니다',
      duration: '3분',
      category: '사회성',
      relevance: 'medium'
    },
    {
      id: 'self-esteem-test',
      title: '자존감 검사',
      description: 'ADHD가 자존감에 미치는 영향을 확인합니다',
      duration: '3분',
      category: '정서',
      relevance: 'high'
    }
  ],
  'autism': [
    {
      id: 'social-development-test',
      title: '사회성 발달 검사',
      description: '사회적 상호작용과 의사소통 능력을 평가합니다',
      duration: '3분',
      category: '사회성',
      relevance: 'high'
    },
    {
      id: 'language-development-test',
      title: '언어발달 검사',
      description: '언어 이해와 표현 능력을 종합적으로 평가합니다',
      duration: '3분',
      category: '언어',
      relevance: 'high'
    },
    {
      id: 'developmental-delay-test',
      title: '발달지연 검사',
      description: '전반적인 발달 수준을 확인합니다',
      duration: '3분',
      category: '발달',
      relevance: 'medium'
    }
  ],
  'developmental-delay': [
    {
      id: 'language-development-test',
      title: '언어발달 검사',
      description: '언어 영역의 발달 상태를 세부적으로 확인합니다',
      duration: '3분',
      category: '언어',
      relevance: 'high'
    },
    {
      id: 'social-development-test',
      title: '사회성 발달 검사',
      description: '사회성 영역의 발달을 평가합니다',
      duration: '3분',
      category: '사회성',
      relevance: 'high'
    },
    {
      id: 'autism-screening-test',
      title: '자폐스펙트럼 검사',
      description: '자폐 관련 특성을 확인합니다',
      duration: '3분',
      category: '발달',
      relevance: 'medium'
    }
  ],
  'learning-disability': [
    {
      id: 'adhd-test',
      title: 'ADHD 검사',
      description: '주의력과 집중력 문제를 확인합니다',
      duration: '3분',
      category: '주의력',
      relevance: 'high'
    },
    {
      id: 'self-esteem-test',
      title: '자존감 검사',
      description: '학습 어려움이 자존감에 미치는 영향을 확인합니다',
      duration: '3분',
      category: '정서',
      relevance: 'high'
    },
    {
      id: 'developmental-delay-test',
      title: '발달지연 검사',
      description: '전반적인 발달 상태를 평가합니다',
      duration: '3분',
      category: '발달',
      relevance: 'medium'
    }
  ],
  'social-development': [
    {
      id: 'autism-screening-test',
      title: '자폐스펙트럼 검사',
      description: '사회성 어려움의 원인을 확인합니다',
      duration: '3분',
      category: '발달',
      relevance: 'high'
    },
    {
      id: 'self-esteem-test',
      title: '자존감 검사',
      description: '또래 관계가 자존감에 미치는 영향을 확인합니다',
      duration: '3분',
      category: '정서',
      relevance: 'high'
    },
    {
      id: 'language-development-test',
      title: '언어발달 검사',
      description: '의사소통 능력을 평가합니다',
      duration: '3분',
      category: '언어',
      relevance: 'medium'
    }
  ],
  'language-development': [
    {
      id: 'autism-screening-test',
      title: '자폐스펙트럼 검사',
      description: '언어 문제의 원인을 확인합니다',
      duration: '3분',
      category: '발달',
      relevance: 'high'
    },
    {
      id: 'developmental-delay-test',
      title: '발달지연 검사',
      description: '전반적인 발달 수준을 평가합니다',
      duration: '3분',
      category: '발달',
      relevance: 'high'
    },
    {
      id: 'social-development-test',
      title: '사회성 발달 검사',
      description: '언어와 사회성의 연관성을 확인합니다',
      duration: '3분',
      category: '사회성',
      relevance: 'medium'
    }
  ],
  'self-esteem': [
    {
      id: 'adhd-test',
      title: 'ADHD 검사',
      description: '주의력 문제가 자존감에 미치는 영향을 확인합니다',
      duration: '3분',
      category: '주의력',
      relevance: 'medium'
    },
    {
      id: 'social-development-test',
      title: '사회성 발달 검사',
      description: '또래 관계와 자존감의 연관성을 평가합니다',
      duration: '3분',
      category: '사회성',
      relevance: 'high'
    },
    {
      id: 'parenting-style-test',
      title: '양육방식 검사',
      description: '양육 환경이 자존감에 미치는 영향을 확인합니다',
      duration: '3분',
      category: '양육',
      relevance: 'high'
    }
  ],
  'parenting-style': [
    {
      id: 'self-esteem-test',
      title: '자녀 자존감 검사',
      description: '양육방식이 자녀의 자존감에 미치는 영향을 확인합니다',
      duration: '3분',
      category: '정서',
      relevance: 'high'
    },
    {
      id: 'social-development-test',
      title: '사회성 발달 검사',
      description: '자녀의 사회성 발달 상태를 평가합니다',
      duration: '3분',
      category: '사회성',
      relevance: 'medium'
    },
    {
      id: 'developmental-delay-test',
      title: '발달지연 검사',
      description: '자녀의 전반적인 발달을 확인합니다',
      duration: '3분',
      category: '발달',
      relevance: 'medium'
    }
  ],
  'child-assessment': [
    {
      id: 'adhd-test',
      title: 'ADHD 검사',
      description: '주의력과 충동성을 세부적으로 평가합니다',
      duration: '3분',
      category: '주의력',
      relevance: 'high'
    },
    {
      id: 'developmental-delay-test',
      title: '발달지연 검사',
      description: '발달 영역별 상태를 확인합니다',
      duration: '3분',
      category: '발달',
      relevance: 'high'
    },
    {
      id: 'social-development-test',
      title: '사회성 발달 검사',
      description: '또래 관계와 사회적 기술을 평가합니다',
      duration: '3분',
      category: '사회성',
      relevance: 'medium'
    }
  ],
  'challenging-behavior': [
    {
      id: 'adaptive-behavior-test',
      title: '적응행동 평가',
      description: '일상생활 독립성과 사회적 기능을 평가합니다',
      duration: '3분',
      category: '적응',
      relevance: 'high'
    },
    {
      id: 'sensory-integration-test',
      title: '감각통합장애 검사',
      description: '감각처리 문제가 도전행동의 원인일 수 있습니다',
      duration: '4분',
      category: '감각',
      relevance: 'high'
    },
    {
      id: 'social-development-test',
      title: '사회성 발달 검사',
      description: '사회적 상호작용 능력을 평가합니다',
      duration: '3분',
      category: '사회성',
      relevance: 'medium'
    }
  ],
  'adaptive-behavior': [
    {
      id: 'challenging-behavior-test',
      title: '도전행동 평가',
      description: '문제 행동의 심각도를 평가합니다',
      duration: '3분',
      category: '행동',
      relevance: 'high'
    },
    {
      id: 'developmental-delay-test',
      title: '발달지연 검사',
      description: '전반적인 발달 수준을 확인합니다',
      duration: '3분',
      category: '발달',
      relevance: 'high'
    },
    {
      id: 'social-development-test',
      title: '사회성 발달 검사',
      description: '사회적 기술과 상호작용을 평가합니다',
      duration: '3분',
      category: '사회성',
      relevance: 'medium'
    }
  ],
  'adult-assessment': [
    {
      id: 'adhd-test',
      title: 'ADHD 검사',
      description: '성인 ADHD 증상을 확인합니다',
      duration: '3분',
      category: '주의력',
      relevance: 'high'
    },
    {
      id: 'self-esteem-test',
      title: '자존감 검사',
      description: '자신에 대한 인식과 자존감을 평가합니다',
      duration: '3분',
      category: '정서',
      relevance: 'medium'
    }
  ]
};

export const RelatedTestRecommendations = ({ currentTestType }: RelatedTestRecommendationsProps) => {
  const navigate = useNavigate();
  const recommendations = testRecommendations[currentTestType] || [];

  if (recommendations.length === 0) {
    return null;
  }

  const handleTestClick = (testId: string) => {
    navigate('/assessment', { state: { selectedTest: testId } });
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle className="text-xl">추천 검사</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          더 정확한 평가를 위해 연관된 검사를 진행해보세요
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {recommendations.map((test, index) => (
            <Card 
              key={test.id}
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                test.relevance === 'high' ? 'border-primary/30' : ''
              }`}
              onClick={() => handleTestClick(test.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-base">{test.title}</h4>
                      {test.relevance === 'high' && (
                        <Badge variant="default" className="text-xs">
                          강력 추천
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {test.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {test.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{test.duration}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestClick(test.id);
                    }}
                  >
                    시작하기
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-center text-muted-foreground">
            💡 <strong>팁:</strong> 여러 검사를 함께 진행하면 더 정확한 평가가 가능합니다
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
