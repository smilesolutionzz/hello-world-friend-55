import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

interface RelatedTest {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  duration: string;
  category: string;
  categoryEn: string;
  relevance: "high" | "medium";
}

interface RelatedTestRecommendationsProps {
  currentTestType: string;
}

const testRecommendations: Record<string, RelatedTest[]> = {
  'adhd': [
    { id: 'learning-disability-test', title: '학습장애 검사', titleEn: 'Learning Disability Test', description: 'ADHD와 함께 나타날 수 있는 학습 문제를 확인합니다', descriptionEn: 'Check for learning issues that may co-occur with ADHD', duration: '3', category: '학습', categoryEn: 'Learning', relevance: 'high' },
    { id: 'social-development-test', title: '사회성 발달 검사', titleEn: 'Social Development Test', description: '또래 관계와 사회적 상호작용 능력을 평가합니다', descriptionEn: 'Assess peer relationships and social interaction skills', duration: '3', category: '사회성', categoryEn: 'Social', relevance: 'medium' },
    { id: 'self-esteem-test', title: '자존감 검사', titleEn: 'Self-Esteem Test', description: 'ADHD가 자존감에 미치는 영향을 확인합니다', descriptionEn: 'Check impact of ADHD on self-esteem', duration: '3', category: '정서', categoryEn: 'Emotional', relevance: 'high' },
  ],
  'autism': [
    { id: 'social-development-test', title: '사회성 발달 검사', titleEn: 'Social Development Test', description: '사회적 상호작용과 의사소통 능력을 평가합니다', descriptionEn: 'Evaluate social interaction and communication skills', duration: '3', category: '사회성', categoryEn: 'Social', relevance: 'high' },
    { id: 'language-development-test', title: '언어발달 검사', titleEn: 'Language Development Test', description: '언어 이해와 표현 능력을 종합적으로 평가합니다', descriptionEn: 'Comprehensive evaluation of language comprehension and expression', duration: '3', category: '언어', categoryEn: 'Language', relevance: 'high' },
    { id: 'developmental-delay-test', title: '발달지연 검사', titleEn: 'Developmental Delay Test', description: '전반적인 발달 수준을 확인합니다', descriptionEn: 'Check overall developmental level', duration: '3', category: '발달', categoryEn: 'Development', relevance: 'medium' },
  ],
  'developmental-delay': [
    { id: 'language-development-test', title: '언어발달 검사', titleEn: 'Language Development Test', description: '언어 영역의 발달 상태를 세부적으로 확인합니다', descriptionEn: 'Detailed check of language area development', duration: '3', category: '언어', categoryEn: 'Language', relevance: 'high' },
    { id: 'social-development-test', title: '사회성 발달 검사', titleEn: 'Social Development Test', description: '사회성 영역의 발달을 평가합니다', descriptionEn: 'Evaluate social development', duration: '3', category: '사회성', categoryEn: 'Social', relevance: 'high' },
    { id: 'autism-screening-test', title: '자폐스펙트럼 검사', titleEn: 'Autism Spectrum Test', description: '자폐 관련 특성을 확인합니다', descriptionEn: 'Check autism-related characteristics', duration: '3', category: '발달', categoryEn: 'Development', relevance: 'medium' },
  ],
  'learning-disability': [
    { id: 'adhd-test', title: 'ADHD 검사', titleEn: 'ADHD Test', description: '주의력과 집중력 문제를 확인합니다', descriptionEn: 'Check attention and focus issues', duration: '3', category: '주의력', categoryEn: 'Attention', relevance: 'high' },
    { id: 'self-esteem-test', title: '자존감 검사', titleEn: 'Self-Esteem Test', description: '학습 어려움이 자존감에 미치는 영향을 확인합니다', descriptionEn: 'Check impact of learning difficulties on self-esteem', duration: '3', category: '정서', categoryEn: 'Emotional', relevance: 'high' },
    { id: 'developmental-delay-test', title: '발달지연 검사', titleEn: 'Developmental Delay Test', description: '전반적인 발달 상태를 평가합니다', descriptionEn: 'Evaluate overall developmental status', duration: '3', category: '발달', categoryEn: 'Development', relevance: 'medium' },
  ],
  'social-development': [
    { id: 'autism-screening-test', title: '자폐스펙트럼 검사', titleEn: 'Autism Spectrum Test', description: '사회성 어려움의 원인을 확인합니다', descriptionEn: 'Identify causes of social difficulties', duration: '3', category: '발달', categoryEn: 'Development', relevance: 'high' },
    { id: 'self-esteem-test', title: '자존감 검사', titleEn: 'Self-Esteem Test', description: '또래 관계가 자존감에 미치는 영향을 확인합니다', descriptionEn: 'Check impact of peer relationships on self-esteem', duration: '3', category: '정서', categoryEn: 'Emotional', relevance: 'high' },
    { id: 'language-development-test', title: '언어발달 검사', titleEn: 'Language Development Test', description: '의사소통 능력을 평가합니다', descriptionEn: 'Evaluate communication skills', duration: '3', category: '언어', categoryEn: 'Language', relevance: 'medium' },
  ],
  'language-development': [
    { id: 'autism-screening-test', title: '자폐스펙트럼 검사', titleEn: 'Autism Spectrum Test', description: '언어 문제의 원인을 확인합니다', descriptionEn: 'Identify causes of language issues', duration: '3', category: '발달', categoryEn: 'Development', relevance: 'high' },
    { id: 'developmental-delay-test', title: '발달지연 검사', titleEn: 'Developmental Delay Test', description: '전반적인 발달 수준을 평가합니다', descriptionEn: 'Evaluate overall developmental level', duration: '3', category: '발달', categoryEn: 'Development', relevance: 'high' },
    { id: 'social-development-test', title: '사회성 발달 검사', titleEn: 'Social Development Test', description: '언어와 사회성의 연관성을 확인합니다', descriptionEn: 'Check correlation between language and social skills', duration: '3', category: '사회성', categoryEn: 'Social', relevance: 'medium' },
  ],
  'self-esteem': [
    { id: 'adhd-test', title: 'ADHD 검사', titleEn: 'ADHD Test', description: '주의력 문제가 자존감에 미치는 영향을 확인합니다', descriptionEn: 'Check impact of attention issues on self-esteem', duration: '3', category: '주의력', categoryEn: 'Attention', relevance: 'medium' },
    { id: 'social-development-test', title: '사회성 발달 검사', titleEn: 'Social Development Test', description: '또래 관계와 자존감의 연관성을 평가합니다', descriptionEn: 'Evaluate correlation between peer relationships and self-esteem', duration: '3', category: '사회성', categoryEn: 'Social', relevance: 'high' },
    { id: 'parenting-style-test', title: '양육방식 검사', titleEn: 'Parenting Style Test', description: '양육 환경이 자존감에 미치는 영향을 확인합니다', descriptionEn: 'Check impact of parenting on self-esteem', duration: '3', category: '양육', categoryEn: 'Parenting', relevance: 'high' },
  ],
  'parenting-style': [
    { id: 'self-esteem-test', title: '자녀 자존감 검사', titleEn: "Child's Self-Esteem Test", description: '양육방식이 자녀의 자존감에 미치는 영향을 확인합니다', descriptionEn: "Check impact of parenting style on child's self-esteem", duration: '3', category: '정서', categoryEn: 'Emotional', relevance: 'high' },
    { id: 'social-development-test', title: '사회성 발달 검사', titleEn: 'Social Development Test', description: '자녀의 사회성 발달 상태를 평가합니다', descriptionEn: "Evaluate child's social development", duration: '3', category: '사회성', categoryEn: 'Social', relevance: 'medium' },
    { id: 'developmental-delay-test', title: '발달지연 검사', titleEn: 'Developmental Delay Test', description: '자녀의 전반적인 발달을 확인합니다', descriptionEn: "Check child's overall development", duration: '3', category: '발달', categoryEn: 'Development', relevance: 'medium' },
  ],
  'child-assessment': [
    { id: 'adhd-test', title: 'ADHD 검사', titleEn: 'ADHD Test', description: '주의력과 충동성을 세부적으로 평가합니다', descriptionEn: 'Detailed evaluation of attention and impulsivity', duration: '3', category: '주의력', categoryEn: 'Attention', relevance: 'high' },
    { id: 'developmental-delay-test', title: '발달지연 검사', titleEn: 'Developmental Delay Test', description: '발달 영역별 상태를 확인합니다', descriptionEn: 'Check developmental status by domain', duration: '3', category: '발달', categoryEn: 'Development', relevance: 'high' },
    { id: 'social-development-test', title: '사회성 발달 검사', titleEn: 'Social Development Test', description: '또래 관계와 사회적 기술을 평가합니다', descriptionEn: 'Evaluate peer relationships and social skills', duration: '3', category: '사회성', categoryEn: 'Social', relevance: 'medium' },
  ],
  'challenging-behavior': [
    { id: 'adaptive-behavior-test', title: '적응행동 평가', titleEn: 'Adaptive Behavior Assessment', description: '일상생활 독립성과 사회적 기능을 평가합니다', descriptionEn: 'Evaluate daily living independence and social function', duration: '3', category: '적응', categoryEn: 'Adaptive', relevance: 'high' },
    { id: 'sensory-integration-test', title: '감각통합장애 검사', titleEn: 'Sensory Integration Test', description: '감각처리 문제가 도전행동의 원인일 수 있습니다', descriptionEn: 'Sensory processing issues may cause challenging behaviors', duration: '4', category: '감각', categoryEn: 'Sensory', relevance: 'high' },
    { id: 'social-development-test', title: '사회성 발달 검사', titleEn: 'Social Development Test', description: '사회적 상호작용 능력을 평가합니다', descriptionEn: 'Evaluate social interaction skills', duration: '3', category: '사회성', categoryEn: 'Social', relevance: 'medium' },
  ],
  'adaptive-behavior': [
    { id: 'challenging-behavior-test', title: '도전행동 평가', titleEn: 'Challenging Behavior Assessment', description: '문제 행동의 심각도를 평가합니다', descriptionEn: 'Evaluate severity of problem behaviors', duration: '3', category: '행동', categoryEn: 'Behavior', relevance: 'high' },
    { id: 'developmental-delay-test', title: '발달지연 검사', titleEn: 'Developmental Delay Test', description: '전반적인 발달 수준을 확인합니다', descriptionEn: 'Check overall developmental level', duration: '3', category: '발달', categoryEn: 'Development', relevance: 'high' },
    { id: 'social-development-test', title: '사회성 발달 검사', titleEn: 'Social Development Test', description: '사회적 기술과 상호작용을 평가합니다', descriptionEn: 'Evaluate social skills and interactions', duration: '3', category: '사회성', categoryEn: 'Social', relevance: 'medium' },
  ],
  'adult-assessment': [
    { id: 'adhd-test', title: 'ADHD 검사', titleEn: 'ADHD Test', description: '성인 ADHD 증상을 확인합니다', descriptionEn: 'Check adult ADHD symptoms', duration: '3', category: '주의력', categoryEn: 'Attention', relevance: 'high' },
    { id: 'self-esteem-test', title: '자존감 검사', titleEn: 'Self-Esteem Test', description: '자신에 대한 인식과 자존감을 평가합니다', descriptionEn: 'Evaluate self-perception and self-esteem', duration: '3', category: '정서', categoryEn: 'Emotional', relevance: 'medium' },
  ],
};

export const RelatedTestRecommendations = ({ currentTestType }: RelatedTestRecommendationsProps) => {
  const navigate = useNavigate();
  const { isEnglish, localePath } = useLanguage();
  const recommendations = testRecommendations[currentTestType] || [];

  if (recommendations.length === 0) return null;

  const handleTestClick = (testId: string) => {
    navigate(localePath('/assessment'), { state: { selectedTest: testId } });
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle className="text-xl">{isEnglish ? 'Recommended Tests' : '추천 검사'}</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {isEnglish ? 'Take related tests for a more accurate evaluation' : '더 정확한 평가를 위해 연관된 검사를 진행해보세요'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {recommendations.map((test) => (
            <Card
              key={test.id}
              className={`hover:shadow-lg transition-shadow cursor-pointer ${test.relevance === 'high' ? 'border-primary/30' : ''}`}
              onClick={() => handleTestClick(test.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-base">{isEnglish ? test.titleEn : test.title}</h4>
                      {test.relevance === 'high' && (
                        <Badge variant="default" className="text-xs">
                          {isEnglish ? 'Highly Recommended' : '강력 추천'}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {isEnglish ? test.categoryEn : test.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isEnglish ? test.descriptionEn : test.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{test.duration}{isEnglish ? ' min' : '분'}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="flex-shrink-0"
                    onClick={(e) => { e.stopPropagation(); handleTestClick(test.id); }}
                  >
                    {isEnglish ? 'Start' : '시작하기'}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-center text-muted-foreground">
            💡 <strong>{isEnglish ? 'Tip:' : '팁:'}</strong> {isEnglish ? 'Taking multiple related tests provides a more accurate assessment' : '여러 검사를 함께 진행하면 더 정확한 평가가 가능합니다'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
