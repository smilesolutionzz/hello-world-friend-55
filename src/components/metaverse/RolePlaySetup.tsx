import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ROLEPLAY_SCENARIOS, 
  CATEGORY_META, 
  getScenariosByAge,
  type RolePlayScenario,
  type RolePlayCategory 
} from '@/utils/RolePlayScenarios';
import { ArrowRight, Shield, Target, Lightbulb, Baby, GraduationCap, UserCircle, Star } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RolePlaySetupProps {
  onStart: (scenario: RolePlayScenario) => void;
}

export const RolePlaySetup = ({ onStart }: RolePlaySetupProps) => {
  const [selectedAge, setSelectedAge] = useState<'child' | 'teen' | 'adult'>('adult');
  const [selectedCategory, setSelectedCategory] = useState<RolePlayCategory | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<RolePlayScenario | null>(null);

  const ageOptions = [
    { value: 'child' as const, label: '아동 (5-12세)', icon: Baby, color: 'bg-blue-500/10 text-blue-600' },
    { value: 'teen' as const, label: '청소년 (13-18세)', icon: GraduationCap, color: 'bg-purple-500/10 text-purple-600' },
    { value: 'adult' as const, label: '성인', icon: UserCircle, color: 'bg-green-500/10 text-green-600' }
  ];

  const filteredScenarios = getScenariosByAge(selectedAge);
  
  // 카테고리별로 그룹화
  const categorizedScenarios: Partial<Record<RolePlayCategory, RolePlayScenario[]>> = {};
  filteredScenarios.forEach(scenario => {
    if (!categorizedScenarios[scenario.category]) {
      categorizedScenarios[scenario.category] = [];
    }
    categorizedScenarios[scenario.category]!.push(scenario);
  });

  const getDifficultyBadge = (difficulty: string) => {
    const badges = {
      easy: { label: '쉬움', color: 'bg-green-500/20 text-green-600' },
      medium: { label: '보통', color: 'bg-yellow-500/20 text-yellow-600' },
      hard: { label: '어려움', color: 'bg-red-500/20 text-red-600' }
    };
    return badges[difficulty as keyof typeof badges] || badges.easy;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-white drop-shadow-lg">AI 롤플레이 연습</h2>
        <p className="text-white/90 drop-shadow-md">
          다양한 상황에서 대화 연습을 해보세요. AI가 상대 역할을 맡아 실제처럼 대화합니다.
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Badge variant="outline" className="gap-2 bg-white/10 text-white border-white/30">
            <Target className="w-3 h-3" />
            실전 대화 연습
          </Badge>
          <Badge variant="outline" className="gap-2 bg-white/10 text-white border-white/30">
            <Star className="w-3 h-3" />
            맞춤형 피드백
          </Badge>
          <Badge variant="outline" className="gap-2 bg-white/10 text-white border-white/30">
            <Shield className="w-3 h-3" />
            안전한 환경
          </Badge>
        </div>
      </div>

      {/* Step 1: 연령대 선택 */}
      <Card className="p-6 space-y-4 bg-black/40 backdrop-blur-sm border-white/20">
        <Label className="text-lg font-semibold text-white">1. 연령대를 선택하세요</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ageOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                onClick={() => {
                  setSelectedAge(option.value);
                  setSelectedCategory(null);
                  setSelectedScenario(null);
                }}
                variant={selectedAge === option.value ? "default" : "outline"}
                className={`h-auto p-4 ${selectedAge === option.value 
                  ? 'bg-white/20 text-white border-white' 
                  : 'bg-white/10 text-white border-white/30 hover:bg-white/20'}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{option.label}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Step 2: 카테고리 및 시나리오 선택 */}
      {selectedAge && (
        <Card className="p-6 space-y-4 bg-black/40 backdrop-blur-sm border-white/20">
          <Label className="text-lg font-semibold text-white">
            2. 연습하고 싶은 상황을 선택하세요
          </Label>
          
          <Tabs defaultValue={Object.keys(categorizedScenarios)[0]} className="w-full">
            <TabsList className="w-full flex-wrap h-auto gap-2 bg-black/40">
              {Object.keys(categorizedScenarios).map((category) => {
                const meta = CATEGORY_META[category as RolePlayCategory];
                return (
                  <TabsTrigger 
                    key={category}
                    value={category}
                    className="gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.name}</span>
                    <Badge variant="secondary" className="ml-2 bg-white/20 text-white text-xs">
                      {categorizedScenarios[category as RolePlayCategory]?.length || 0}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(categorizedScenarios).map(([category, scenarios]) => {
              const meta = CATEGORY_META[category as RolePlayCategory];
              return (
                <TabsContent key={category} value={category} className="mt-4">
                  <div className="mb-4 p-4 bg-white/10 rounded-lg">
                    <p className="text-white/90 text-sm">{meta.description}</p>
                  </div>
                  
                  <ScrollArea className="h-[400px] pr-4">
                    <RadioGroup 
                      value={selectedScenario?.id} 
                      onValueChange={(value) => {
                        const scenario = scenarios?.find(s => s.id === value);
                        if (scenario) setSelectedScenario(scenario);
                      }}
                      className="space-y-3"
                    >
                      {scenarios?.map((scenario) => {
                        const difficultyBadge = getDifficultyBadge(scenario.difficulty);
                        return (
                          <div key={scenario.id} className="relative">
                            <RadioGroupItem
                              value={scenario.id}
                              id={scenario.id}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={scenario.id}
                              className={`
                                block p-4 rounded-lg border-2 cursor-pointer
                                transition-all hover:shadow-md bg-white/10 backdrop-blur-sm
                                peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white/20
                                border-white/30 text-white
                              `}
                            >
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="space-y-1 flex-1">
                                    <div className="font-semibold text-lg">{scenario.title}</div>
                                    <p className="text-sm text-white/80">{scenario.description}</p>
                                  </div>
                                  <Badge className={`${difficultyBadge.color} shrink-0`}>
                                    {difficultyBadge.label}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-1">
                                    <div className="text-white/70 flex items-center gap-2">
                                      <UserCircle className="w-4 h-4" />
                                      내 역할
                                    </div>
                                    <div className="text-white font-medium">{scenario.userRole}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-white/70 flex items-center gap-2">
                                      <UserCircle className="w-4 h-4" />
                                      AI 역할
                                    </div>
                                    <div className="text-white font-medium">{scenario.aiRole}</div>
                                  </div>
                                </div>

                                {selectedScenario?.id === scenario.id && (
                                  <div className="pt-3 border-t border-white/20 space-y-3">
                                    <div className="space-y-2">
                                      <div className="text-white/90 font-medium flex items-center gap-2">
                                        <Target className="w-4 h-4" />
                                        연습 목표
                                      </div>
                                      <ul className="text-sm space-y-1 text-white/80 ml-6">
                                        {scenario.goals.map((goal, i) => (
                                          <li key={i}>• {goal}</li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="text-white/90 font-medium flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4" />
                                        도움 팁
                                      </div>
                                      <ul className="text-sm space-y-1 text-white/80 ml-6">
                                        {scenario.tips.map((tip, i) => (
                                          <li key={i}>• {tip}</li>
                                        ))}
                                      </ul>
                                    </div>

                                    {scenario.exampleDialogue && (
                                      <div className="space-y-2">
                                        <div className="text-white/90 font-medium">예시 대화</div>
                                        <div className="space-y-2 text-sm">
                                          {scenario.exampleDialogue.map((dialogue, i) => (
                                            <div key={i} className="space-y-1">
                                              <div className="text-blue-300">나: {dialogue.user}</div>
                                              <div className="text-green-300">상대: {dialogue.ai}</div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </ScrollArea>
                </TabsContent>
              );
            })}
          </Tabs>
        </Card>
      )}

      {/* 시작 버튼 */}
      {selectedScenario && (
        <Card className="p-6 bg-black/40 backdrop-blur-sm border-white/20">
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-white/80 text-sm">
              <Shield className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">안전한 연습 환경</p>
                <p className="text-white/70">
                  실수해도 괜찮아요! AI와의 대화는 안전하게 보호되며, 
                  원하는 만큼 다시 연습할 수 있습니다.
                </p>
              </div>
            </div>

            <Button
              onClick={() => onStart(selectedScenario)}
              className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
              size="lg"
            >
              {selectedScenario.title} 시작하기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
