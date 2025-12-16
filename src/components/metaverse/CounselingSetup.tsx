import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { CHARACTERS, type AgeGroup, type CharacterType } from '@/utils/CounselingQuestions';
import { Users, Baby, GraduationCap, UserCircle, ArrowRight, Shield, Heart } from 'lucide-react';

interface CounselingSetupProps {
  onStart: (ageGroup: AgeGroup, character: CharacterType) => void;
}

export const CounselingSetup = ({ onStart }: CounselingSetupProps) => {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>('child');
  // 코끼리 선생님 고정
  const selectedCharacter: CharacterType = 'elephant';
  const elephantCharacter = CHARACTERS.elephant;

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-white drop-shadow-lg">금쪽같은 대화</h2>
        <p className="text-white/90 drop-shadow-md">
          금쪽같은 내새끼의 코끼리와 나누는 상담 방식 처럼 , 가상의 구조화된 전문가의 질문으로 마음을 들어봅니다
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Badge variant="outline" className="gap-2 bg-white/10 text-white border-white/30">
            <Shield className="w-3 h-3" />
            100% 비밀 보장
          </Badge>
          <Badge variant="outline" className="gap-2 bg-white/10 text-white border-white/30">
            <Heart className="w-3 h-3" />
            AI 심리 분석
          </Badge>
        </div>
      </div>

      <Card className="p-6 space-y-6 bg-black/40 backdrop-blur-sm border-white/20">
        {/* 고정 캐릭터 표시 */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-white/10 border border-white/20">
          <div className="text-5xl">🐘</div>
          <div className="flex-1">
            <div className="font-semibold text-white text-lg">{elephantCharacter.name}</div>
            <div className="text-sm text-white/80">{elephantCharacter.personality}</div>
            <Badge variant="secondary" className="text-xs mt-2 bg-white/20 text-white border-white/30">
              {elephantCharacter.voice} 목소리
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-lg font-semibold text-white">연령대를 선택해주세요</Label>
          <RadioGroup 
            value={selectedAgeGroup} 
            onValueChange={(value) => setSelectedAgeGroup(value as AgeGroup)}
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
                      transition-all hover:shadow-md bg-white/10 backdrop-blur-sm
                      peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white/20
                      border-white/30 text-white
                    `}
                  >
                    <div className="mt-1">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm text-white/80">{option.description}</div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4" />
              안심하고 이야기해주세요
            </h4>
            <ul className="text-sm space-y-1 text-white/80 ml-6">
              <li>• 모든 대화는 비밀이 보장됩니다</li>
              <li>• 편안하게 솔직한 마음을 나눠주세요</li>
              <li>• 10개의 질문으로 마음 상태를 체크합니다</li>
              <li>• 결과는 마이데이터에 안전하게 저장됩니다</li>
            </ul>
          </div>
        </Card>

        <Button
          onClick={() => onStart(selectedAgeGroup, selectedCharacter)}
          className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
          size="lg"
        >
          대화 시작하기
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Card>
    </div>
  );
};
