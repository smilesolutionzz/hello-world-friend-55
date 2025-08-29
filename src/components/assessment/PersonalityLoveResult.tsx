import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Star,
  Gift,
  MessageCircle,
  Zap
} from 'lucide-react';

const typeColors = {
  '열정적인 로맨티스트': 'from-red-500 to-pink-500',
  '안정적인 동반자': 'from-blue-500 to-indigo-500',
  '독립적인 개인주의자': 'from-purple-500 to-violet-500',
  '감성적인 공감형': 'from-green-500 to-emerald-500',
  '사교적인 활동가': 'from-orange-500 to-yellow-500',
  '계획적인 현실주의자': 'from-gray-600 to-slate-600'
};

const compatibilityAdvice = {
  '열정적인 로맨티스트': {
    best: ['감성적인 공감형', '사교적인 활동가'],
    good: ['열정적인 로맨티스트'],
    challenge: ['독립적인 개인주의자', '계획적인 현실주의자']
  },
  '안정적인 동반자': {
    best: ['계획적인 현실주의자', '안정적인 동반자'],
    good: ['감성적인 공감형'],
    challenge: ['열정적인 로맨티스트', '사교적인 활동가']
  },
  '독립적인 개인주의자': {
    best: ['독립적인 개인주의자', '계획적인 현실주의자'],
    good: ['사교적인 활동가'],
    challenge: ['열정적인 로맨티스트', '감성적인 공감형']
  },
  '감성적인 공감형': {
    best: ['열정적인 로맨티스트', '감성적인 공감형'],
    good: ['안정적인 동반자'],
    challenge: ['독립적인 개인주의자']
  },
  '사교적인 활동가': {
    best: ['열정적인 로맨티스트', '사교적인 활동가'],
    good: ['독립적인 개인주의자'],
    challenge: ['안정적인 동반자']
  },
  '계획적인 현실주의자': {
    best: ['안정적인 동반자', '독립적인 개인주의자'],
    good: ['계획적인 현실주의자'],
    challenge: ['열정적인 로맨티스트']
  }
};

interface PersonalityLoveResultProps {
  result: any;
  onRestart: () => void;
}

export const PersonalityLoveResult: React.FC<PersonalityLoveResultProps> = ({ 
  result, 
  onRestart 
}) => {
  const { personalityType, aiAnalysis } = result;
  const typeColor = typeColors[personalityType.type as keyof typeof typeColors] || 'from-gray-500 to-gray-600';
  const compatibility = compatibilityAdvice[personalityType.type as keyof typeof compatibilityAdvice];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 주요 결과 */}
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${typeColor} opacity-10`}></div>
        <CardHeader className="text-center relative">
          <div className="flex justify-center mb-4">
            <div className={`bg-gradient-to-br ${typeColor} p-4 rounded-full`}>
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">연애 성격 분석 결과</CardTitle>
          <CardDescription className="text-lg">
            당신의 연애 스타일을 분석했습니다
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 relative">
          <div className="text-center space-y-4">
            <Badge className={`bg-gradient-to-r ${typeColor} text-white text-lg px-6 py-2`}>
              {personalityType.type}
            </Badge>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {personalityType.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI 분석 결과 */}
      {aiAnalysis && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
              AI 맞춤 연애 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {aiAnalysis}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 성격 특성 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              나의 강점
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {personalityType.strengths.map((strength: string, index: number) => (
                <Badge key={index} variant="secondary" className="justify-center py-2">
                  {strength}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              개선 포인트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {personalityType.tips.map((tip: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 궁합 분석 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-500" />
            연애 궁합 분석
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-green-600 mb-2 flex items-center">
              <Heart className="h-4 w-4 mr-1" />
              최고 궁합
            </h4>
            <div className="flex flex-wrap gap-2">
              {compatibility.best.map((type: string, index: number) => (
                <Badge key={index} variant="outline" className="border-green-200 text-green-700">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-600 mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-1" />
              좋은 궁합
            </h4>
            <div className="flex flex-wrap gap-2">
              {compatibility.good.map((type: string, index: number) => (
                <Badge key={index} variant="outline" className="border-blue-200 text-blue-700">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-orange-600 mb-2 flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" />
              소통이 중요한 궁합
            </h4>
            <div className="flex flex-wrap gap-2">
              {compatibility.challenge.map((type: string, index: number) => (
                <Badge key={index} variant="outline" className="border-orange-200 text-orange-700">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 연애 조언 */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2 text-pink-500" />
            맞춤 연애 조언
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {personalityType.type === '열정적인 로맨티스트' && (
              <p className="text-sm">
                당신의 열정은 큰 매력이지만, 상대방의 속도에 맞춰주는 것도 중요해요. 
                때로는 차분한 시간을 갖고 깊이 있는 대화를 나눠보세요.
              </p>
            )}
            {personalityType.type === '안정적인 동반자' && (
              <p className="text-sm">
                신뢰할 수 있는 당신의 모습은 많은 사람들이 좋아해요. 
                하지만 가끔은 예상치 못한 서프라이즈로 관계에 활력을 불어넣어보세요.
              </p>
            )}
            {personalityType.type === '독립적인 개인주의자' && (
              <p className="text-sm">
                개인의 공간을 중시하는 것은 건강한 관계의 기초예요. 
                하지만 친밀감도 관계에서 중요한 요소라는 것을 기억하세요.
              </p>
            )}
            {personalityType.type === '감성적인 공감형' && (
              <p className="text-sm">
                따뜻한 마음과 공감 능력은 당신의 큰 장점이에요. 
                감정이 앞설 때는 잠시 멈춰서 객관적으로 상황을 바라보는 연습을 해보세요.
              </p>
            )}
            {personalityType.type === '사교적인 활동가' && (
              <p className="text-sm">
                활발하고 재미있는 당신과 함께 있으면 즐거워요. 
                하지만 때로는 조용한 시간을 통해 더 깊은 감정을 나누는 것도 좋답니다.
              </p>
            )}
            {personalityType.type === '계획적인 현실주의자' && (
              <p className="text-sm">
                체계적이고 신중한 당신의 모습은 안정감을 줘요. 
                가끔은 계획에 없던 즉흥적인 데이트로 관계에 재미를 더해보세요.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

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