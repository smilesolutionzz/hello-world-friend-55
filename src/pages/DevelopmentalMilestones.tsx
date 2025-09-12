import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, Baby, Brain, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface Milestone {
  id: string;
  text: string;
  ageRange: string;
  category: 'motor' | 'language' | 'cognitive' | 'social' | 'selfcare';
  isDelayed?: boolean;
}

const DevelopmentalMilestones = () => {
  const [childAge, setChildAge] = useState('');
  const [checkedMilestones, setCheckedMilestones] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const milestonesByAge = {
    '12': [
      { id: 'm12-1', text: '혼자 걷기', ageRange: '12-15개월', category: 'motor' as const },
      { id: 'm12-2', text: '간단한 단어 2-3개 말하기', ageRange: '12-18개월', category: 'language' as const },
      { id: 'm12-3', text: '손가락으로 가리키기', ageRange: '12-15개월', category: 'cognitive' as const },
      { id: 'm12-4', text: '컵으로 혼자 물 마시기', ageRange: '12-18개월', category: 'selfcare' as const },
      { id: 'm12-5', text: '간단한 지시 따르기', ageRange: '12-18개월', category: 'cognitive' as const }
    ],
    '18': [
      { id: 'm18-1', text: '뛰어다니기', ageRange: '18-24개월', category: 'motor' as const },
      { id: 'm18-2', text: '10-20개 단어 사용', ageRange: '18-24개월', category: 'language' as const },
      { id: 'm18-3', text: '계단 오르내리기', ageRange: '18-24개월', category: 'motor' as const },
      { id: 'm18-4', text: '숟가락으로 혼자 먹기', ageRange: '18-24개월', category: 'selfcare' as const },
      { id: 'm18-5', text: '다른 아이들에게 관심 보이기', ageRange: '18-24개월', category: 'social' as const }
    ],
    '24': [
      { id: 'm24-1', text: '공 차고 던지기', ageRange: '24-30개월', category: 'motor' as const },
      { id: 'm24-2', text: '2-3어절 문장 말하기', ageRange: '24-30개월', category: 'language' as const },
      { id: 'm24-3', text: '색깔과 모양 구분하기', ageRange: '24-36개월', category: 'cognitive' as const },
      { id: 'm24-4', text: '대소변 조절 시작', ageRange: '24-36개월', category: 'selfcare' as const },
      { id: 'm24-5', text: '병행놀이 (다른 아이 옆에서 놀기)', ageRange: '24-30개월', category: 'social' as const }
    ],
    '36': [
      { id: 'm36-1', text: '세발자전거 타기', ageRange: '36-42개월', category: 'motor' as const },
      { id: 'm36-2', text: '완전한 문장으로 대화', ageRange: '36-48개월', category: 'language' as const },
      { id: 'm36-3', text: '1-10까지 세기', ageRange: '36-48개월', category: 'cognitive' as const },
      { id: 'm36-4', text: '혼자 옷 입고 벗기', ageRange: '36-48개월', category: 'selfcare' as const },
      { id: 'm36-5', text: '친구들과 함께 놀기', ageRange: '36-48개월', category: 'social' as const }
    ],
    '48': [
      { id: 'm48-1', text: '한 발로 뛰기', ageRange: '48-60개월', category: 'motor' as const },
      { id: 'm48-2', text: '복잡한 이야기 이해하기', ageRange: '48-60개월', category: 'language' as const },
      { id: 'm48-3', text: '간단한 퍼즐 맞추기', ageRange: '48-60개월', category: 'cognitive' as const },
      { id: 'm48-4', text: '혼자 화장실 사용', ageRange: '48-60개월', category: 'selfcare' as const },
      { id: 'm48-5', text: '규칙이 있는 게임하기', ageRange: '48-60개월', category: 'social' as const }
    ]
  };

  const getCurrentMilestones = () => {
    const age = parseInt(childAge);
    if (age >= 48) return milestonesByAge['48'];
    if (age >= 36) return milestonesByAge['36'];
    if (age >= 24) return milestonesByAge['24'];
    if (age >= 18) return milestonesByAge['18'];
    if (age >= 12) return milestonesByAge['12'];
    return [];
  };

  const handleMilestoneCheck = (milestoneId: string) => {
    setCheckedMilestones(prev => 
      prev.includes(milestoneId) 
        ? prev.filter(id => id !== milestoneId)
        : [...prev, milestoneId]
    );
  };

  const analyzeResults = () => {
    if (!childAge) {
      toast.error('아이의 나이를 입력해주세요');
      return;
    }

    const currentMilestones = getCurrentMilestones();
    const completedCount = checkedMilestones.length;
    const totalCount = currentMilestones.length;
    const completionRate = (completedCount / totalCount) * 100;

    setShowResults(true);
    
    if (completionRate >= 80) {
      toast.success('우수한 발달을 보이고 있어요! 👏');
    } else if (completionRate >= 60) {
      toast('정상 범위 내 발달이에요', { icon: '✅' });
    } else {
      toast('전문가 상담을 권해드려요', { icon: '💙' });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'motor': return <Baby className="w-4 h-4" />;
      case 'language': return <Brain className="w-4 h-4" />;
      case 'cognitive': return <Brain className="w-4 h-4" />;
      case 'social': return <Heart className="w-4 h-4" />;
      case 'selfcare': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'motor': return '대근육운동';
      case 'language': return '언어발달';
      case 'cognitive': return '인지발달';
      case 'social': return '사회성발달';
      case 'selfcare': return '자조능력';
      default: return '기타';
    }
  };

  const currentMilestones = getCurrentMilestones();
  const completedCount = checkedMilestones.length;
  const totalCount = currentMilestones.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Baby className="w-8 h-8 text-pink-600" />
            <h1 className="text-3xl font-bold text-gray-900">발달 마일스톤 체크</h1>
          </div>
          <p className="text-gray-600">
            우리 아이의 발달 단계를 확인하고 조기 개입이 필요한지 알아보세요
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>아이 정보</CardTitle>
            <CardDescription>현재 아이의 나이를 개월 수로 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="age">아이 나이 (개월)</Label>
              <Input
                id="age"
                type="number"
                placeholder="예: 18"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                className="w-32"
              />
              <span className="text-sm text-gray-500">개월</span>
            </div>
          </CardContent>
        </Card>

        {childAge && currentMilestones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {childAge}개월 발달 체크리스트
              </CardTitle>
              <CardDescription>
                우리 아이가 할 수 있는 것들을 체크해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {currentMilestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={milestone.id}
                      checked={checkedMilestones.includes(milestone.id)}
                      onCheckedChange={() => handleMilestoneCheck(milestone.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(milestone.category)}
                        <Label htmlFor={milestone.id} className="font-medium">
                          {milestone.text}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(milestone.category)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        정상 범위: {milestone.ageRange}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={analyzeResults} className="w-full" size="lg">
                <Brain className="w-5 h-5 mr-2" />
                발달 분석하기
              </Button>
            </CardContent>
          </Card>
        )}

        {showResults && (
          <div className="space-y-6">
            <Card className={`border-2 ${
              completionRate >= 80 ? 'border-green-200 bg-green-50' :
              completionRate >= 60 ? 'border-blue-200 bg-blue-50' :
              'border-yellow-200 bg-yellow-50'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {completionRate >= 80 ? <CheckCircle className="w-6 h-6 text-green-600" /> :
                   completionRate >= 60 ? <Clock className="w-6 h-6 text-blue-600" /> :
                   <AlertTriangle className="w-6 h-6 text-yellow-600" />}
                  발달 분석 결과
                </CardTitle>
                <CardDescription>
                  {completedCount}/{totalCount} 항목 달성 ({Math.round(completionRate)}%)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={completionRate} className="h-3" />
                
                <div className="space-y-2">
                  {completionRate >= 80 && (
                    <div className="p-4 bg-green-100 rounded-lg">
                      <h4 className="font-semibold text-green-800">🎉 훌륭해요!</h4>
                      <p className="text-green-700">아이가 연령에 맞는 우수한 발달을 보이고 있어요.</p>
                    </div>
                  )}
                  
                  {completionRate >= 60 && completionRate < 80 && (
                    <div className="p-4 bg-blue-100 rounded-lg">
                      <h4 className="font-semibold text-blue-800">✅ 정상 범위예요</h4>
                      <p className="text-blue-700">개별 차이는 있지만 전반적으로 정상적인 발달을 보이고 있어요.</p>
                    </div>
                  )}
                  
                  {completionRate < 60 && (
                    <div className="p-4 bg-yellow-100 rounded-lg">
                      <h4 className="font-semibold text-yellow-800">💙 관심이 필요해요</h4>
                      <p className="text-yellow-700">
                        일부 영역에서 지연이 보일 수 있어요. 전문가와 상담해보시는 것을 권해드려요.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">📞 도움이 필요하시다면</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-white rounded border">
                      <strong>발달지원센터</strong><br />
                      무료 발달검사 및 상담
                    </div>
                    <div className="p-3 bg-white rounded border">
                      <strong>소아청소년과</strong><br />
                      전문의 진료 및 평가
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-purple-800">
                    💝 다른 부모님들과 경험을 나눠보세요
                  </h3>
                  <p className="text-purple-600">
                    아이의 발달에 대한 고민과 기쁨을 함께 나누는 것도 중요해요
                  </p>
                  <Button variant="outline" className="border-purple-300 text-purple-700">
                    결과 공유하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevelopmentalMilestones;