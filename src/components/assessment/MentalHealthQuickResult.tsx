import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Heart, 
  Lightbulb, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react';

const levelConfig = {
  excellent: {
    color: 'bg-green-500',
    bgColor: 'bg-green-50 border-green-200',
    textColor: 'text-green-800',
    icon: CheckCircle,
    message: '훌륭한 정신건강 상태입니다!'
  },
  good: {
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-800',
    icon: TrendingUp,
    message: '양호한 정신건강 상태입니다.'
  },
  fair: {
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50 border-yellow-200',
    textColor: 'text-yellow-800',
    icon: AlertTriangle,
    message: '관리가 필요한 상태입니다.'
  },
  poor: {
    color: 'bg-red-500',
    bgColor: 'bg-red-50 border-red-200',
    textColor: 'text-red-800',
    icon: AlertTriangle,
    message: '전문적인 도움이 필요할 수 있습니다.'
  }
};

const recommendations = {
  excellent: [
    '현재 상태를 잘 유지하세요',
    '꾸준한 자기관리가 중요합니다',
    '주변 사람들과의 관계를 소중히 하세요',
    '새로운 도전을 통해 성장해보세요'
  ],
  good: [
    '규칙적인 운동을 해보세요',
    '충분한 수면을 취하세요',
    '스트레스 관리법을 익혀보세요',
    '취미 활동을 늘려보세요'
  ],
  fair: [
    '전문가와 상담을 고려해보세요',
    '휴식과 여가시간을 늘리세요',
    '신뢰할 수 있는 사람과 대화하세요',
    '명상이나 요가를 시도해보세요'
  ],
  poor: [
    '전문가 상담을 강력히 권합니다',
    '충분한 휴식을 취하세요',
    '가족이나 친구의 도움을 받으세요',
    '작은 목표부터 차근차근 시작하세요'
  ]
};

interface MentalHealthQuickResultProps {
  result: any;
  onRestart: () => void;
}

export const MentalHealthQuickResult: React.FC<MentalHealthQuickResultProps> = ({ 
  result, 
  onRestart 
}) => {
  const config = levelConfig[result.level as keyof typeof levelConfig];
  const IconComponent = config.icon;
  const progressValue = (result.averageScore / 5) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 주요 결과 */}
      <Card className={`${config.bgColor}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`${config.color} p-4 rounded-full`}>
              <IconComponent className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">정신건강 검사 결과</CardTitle>
          <CardDescription className="text-lg">
            {config.message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 점수 표시 */}
          <div className="text-center space-y-4">
            <div>
              <Badge className={`${config.color} text-white text-lg px-6 py-2 mb-4`}>
                {result.levelText}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>종합 점수</span>
                <span>{result.averageScore.toFixed(1)}/5.0</span>
              </div>
              <Progress value={progressValue} className="h-3" />
            </div>
          </div>

          {/* 상세 분석 */}
          <div className="bg-white/70 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold flex items-center">
              <Brain className="h-4 w-4 mr-2 text-purple-500" />
              AI 분석 결과
            </h4>
            <p className="text-sm text-muted-foreground">
              총 {Object.keys(result.answers).length}개 항목을 종합 분석한 결과, 
              평균 {result.averageScore.toFixed(1)}점으로 '{result.levelText}' 상태입니다.
              {result.level === 'excellent' && ' 현재 매우 안정적인 정신건강 상태를 유지하고 계십니다.'}
              {result.level === 'good' && ' 전반적으로 양호한 상태이지만 지속적인 관리가 필요합니다.'}
              {result.level === 'fair' && ' 일부 영역에서 주의가 필요한 상태입니다.'}
              {result.level === 'poor' && ' 전문적인 도움을 받으시는 것을 권장합니다.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 맞춤 추천사항 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              맞춤 추천사항
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations[result.level as keyof typeof recommendations].map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-500" />
              예방 관리법
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Heart className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">규칙적인 생활</p>
                  <p className="text-xs text-muted-foreground">일정한 수면과 식사 패턴 유지</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Brain className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">스트레스 관리</p>
                  <p className="text-xs text-muted-foreground">명상, 운동, 취미활동</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">사회적 관계</p>
                  <p className="text-xs text-muted-foreground">가족, 친구와의 소통 증진</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 주의사항 및 안내 */}
      {(result.level === 'fair' || result.level === 'poor') && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-800 mb-2">전문가 상담 권장</h4>
                <p className="text-sm text-orange-700">
                  현재 상태가 지속되거나 악화된다면 정신건강 전문가와의 상담을 받으시길 권합니다. 
                  조기 개입이 빠른 회복에 도움이 됩니다.
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  전문가 상담 알아보기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 액션 버튼 */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={onRestart}>
          다시 검사하기
        </Button>
        <Button onClick={() => window.print()}>
          결과 저장하기
        </Button>
      </div>
    </div>
  );
};