import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { CHARACTERS, type AgeGroup, type CharacterType } from '@/utils/CounselingQuestions';
import { type SCTAgeGroup } from '@/utils/SCTQuestions';
import { Users, Baby, GraduationCap, UserCircle, ArrowRight, Shield, Heart, FileText } from 'lucide-react';

interface CounselingSetupProps {
  onStart: (config: { 
    mode: 'structured' | 'sct';
    ageGroup: AgeGroup | SCTAgeGroup; 
    character?: CharacterType;
  }) => void;
}

export const CounselingSetup = ({ onStart }: CounselingSetupProps) => {
  const [selectedMode, setSelectedMode] = useState<'structured' | 'sct'>('sct');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | SCTAgeGroup>('child');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('elephant');

  const ageGroupOptions = [
    { 
      value: 'child' as AgeGroup, 
      label: '아동 (5-12세)', 
      icon: Baby,
      description: '초등학생 아이들을 위한 상담',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200'
    },
    { 
      value: 'teen' as AgeGroup, 
      label: '사춘기 (13-18세)', 
      icon: GraduationCap,
      description: '청소년을 위한 상담',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200'
    },
    { 
      value: 'adult' as AgeGroup, 
      label: '성인', 
      icon: UserCircle,
      description: '성인을 위한 상담',
      color: 'bg-green-500/10 text-green-600 border-green-200'
    },
    { 
      value: 'parent' as AgeGroup, 
      label: '부모', 
      icon: Users,
      description: '부모 심리상태 점검',
      color: 'bg-orange-500/10 text-orange-600 border-orange-200'
    }
  ];

  const availableCharacters = Object.values(CHARACTERS).filter(
    c => c.ageGroups.includes(selectedAgeGroup)
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold">금쪽같은 대화</h2>
        <p className="text-muted-foreground">
          오은영 박사님의 상담 방식처럼, 구조화된 질문으로 마음을 들어봅니다
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Badge variant="outline" className="gap-2">
            <Shield className="w-3 h-3" />
            100% 비밀 보장
          </Badge>
          <Badge variant="outline" className="gap-2">
            <Heart className="w-3 h-3" />
            AI 심리 분석
          </Badge>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <Label className="text-lg font-semibold">1. 연령대를 선택해주세요</Label>
          <RadioGroup 
            value={selectedAgeGroup} 
            onValueChange={(value) => {
              setSelectedAgeGroup(value as AgeGroup);
              // 연령대 변경 시 해당 연령대에 맞는 첫 번째 캐릭터 자동 선택
              const firstAvailable = Object.values(CHARACTERS).find(
                c => c.ageGroups.includes(value as AgeGroup)
              );
              if (firstAvailable) {
                setSelectedCharacter(firstAvailable.type);
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {ageGroupOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.value} className="relative">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className={`
                      flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer
                      transition-all hover:shadow-md
                      peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                      ${option.color}
                    `}
                  >
                    <div className="mt-1">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm opacity-80">{option.description}</div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label className="text-lg font-semibold">2. 대화할 캐릭터를 선택해주세요</Label>
          <p className="text-sm text-muted-foreground">
            각 캐릭터는 고유한 성격과 목소리를 가지고 있어요
          </p>
          <RadioGroup 
            value={selectedCharacter} 
            onValueChange={(value) => setSelectedCharacter(value as CharacterType)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {availableCharacters.map((character) => (
              <div key={character.type} className="relative">
                <RadioGroupItem
                  value={character.type}
                  id={character.type}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={character.type}
                  className={`
                    flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer
                    transition-all hover:shadow-md
                    peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                  `}
                  style={{
                    backgroundColor: `${character.color}10`,
                    borderColor: selectedCharacter === character.type ? character.color : undefined
                  }}
                >
                  <div className="text-4xl">
                    {character.type === 'elephant' && '🐘'}
                    {character.type === 'bear' && '🐻'}
                    {character.type === 'rabbit' && '🐰'}
                    {character.type === 'fox' && '🦊'}
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="font-semibold">{character.name}</div>
                    <div className="text-sm opacity-80">{character.personality}</div>
                    <Badge variant="secondary" className="text-xs">
                      {character.voice} 목소리
                    </Badge>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="space-y-2">
            <h4 className="font-semibold text-primary flex items-center gap-2">
              <Shield className="w-4 h-4" />
              안심하고 이야기해주세요
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-6">
              <li>• 모든 대화는 비밀이 보장됩니다</li>
              <li>• 편안하게 솔직한 마음을 나눠주세요</li>
              <li>• 10개의 질문으로 마음 상태를 체크합니다</li>
              <li>• 결과는 마이데이터에 안전하게 저장됩니다</li>
            </ul>
          </div>
        </Card>

        <Button
          onClick={() => onStart(selectedAgeGroup, selectedCharacter)}
          className="w-full"
          size="lg"
        >
          대화 시작하기
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Card>
    </div>
  );
};
