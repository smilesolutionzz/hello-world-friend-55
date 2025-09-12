import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Brain, Share2, RotateCcw, Users, Target, Heart, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimplePersonalityResultProps {
  result: {
    type: string;
    counts: Record<string, number>;
    answers: Record<number, string>;
  };
}

const SimplePersonalityResult = ({ result }: SimplePersonalityResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const personalityTypes = {
    'ESTJ': {
      name: '경영자형',
      description: '체계적이고 현실적인 리더십을 발휘하는 성격',
      traits: ['책임감 강함', '조직적', '결단력 있음', '전통 중시'],
      strengths: ['뛰어난 조직 능력', '신뢰할 수 있는 리더십', '목표 달성력'],
      challenges: ['융통성 부족', '감정적 배려 부족', '변화에 대한 저항'],
      career: ['경영진', '프로젝트 매니저', '교사', '판사'],
      color: 'text-blue-600',
      icon: Target
    },
    'ESTP': {
      name: '사업가형',
      description: '현실적이고 활동적인 문제 해결사',
      traits: ['적응력 뛰어남', '실용적', '사교적', '즉흥적'],
      strengths: ['위기 상황 대처력', '뛰어난 협상 능력', '현실 감각'],
      challenges: ['장기 계획 부족', '세심함 부족', '일관성 부족'],
      career: ['영업직', '응급실 의사', '경찰', '운동선수'],
      color: 'text-orange-600',
      icon: Lightbulb
    },
    'ESFJ': {
      name: '친선도모형',
      description: '따뜻하고 배려심 많은 조화로운 성격',
      traits: ['친화적', '협력적', '배려심 많음', '책임감 강함'],
      strengths: ['뛰어난 대인관계', '팀워크 능력', '세심한 배려'],
      challenges: ['비판에 민감', '갈등 회피', '자기주장 부족'],
      career: ['간호사', '교사', '상담사', '인사담당자'],
      color: 'text-pink-600',
      icon: Heart
    },
    'ESFP': {
      name: '연예인형',
      description: '자유롭고 열정적인 즐거움 추구자',
      traits: ['낙천적', '유연함', '친근함', '창의적'],
      strengths: ['뛰어난 소통 능력', '긍정적 에너지', '창의성'],
      challenges: ['계획성 부족', '비판에 민감', '집중력 부족'],
      career: ['연예인', '디자이너', '이벤트 기획자', '마케터'],
      color: 'text-yellow-600',
      icon: Heart
    },
    'ENTJ': {
      name: '지휘관형',
      description: '대담하고 의지력 강한 천생 리더',
      traits: ['카리스마 있음', '결단력 있음', '효율적', '목표지향적'],
      strengths: ['뛰어난 리더십', '전략적 사고', '추진력'],
      challenges: ['감정적 배려 부족', '성급함', '고집스러움'],
      career: ['CEO', '변호사', '정치인', '컨설턴트'],
      color: 'text-red-600',
      icon: Target
    },
    'ENTP': {
      name: '발명가형',
      description: '영리하고 호기심 많은 혁신가',
      traits: ['창의적', '논리적', '독립적', '유연함'],
      strengths: ['창의적 문제해결', '뛰어난 토론 능력', '적응력'],
      challenges: ['일상 업무 지루함', '마무리 부족', '세부사항 놓침'],
      career: ['기업가', '발명가', '저널리스트', '마케터'],
      color: 'text-purple-600',
      icon: Lightbulb
    },
    'ENFJ': {
      name: '선도자형',
      description: '카리스마 있고 영감을 주는 지도자',
      traits: ['이상주의적', '공감 능력 뛰어남', '설득력 있음', '헌신적'],
      strengths: ['뛰어난 소통 능력', '영감을 주는 리더십', '배려심'],
      challenges: ['이상과 현실의 괴리', '자기희생 과다', '비판에 민감'],
      career: ['교사', '상담사', '종교인', '정치인'],
      color: 'text-green-600',
      icon: Users
    },
    'ENFP': {
      name: '활동가형',
      description: '열정적이고 창의적인 자유로운 영혼',
      traits: ['열정적', '창의적', '사교적', '호기심 많음'],
      strengths: ['뛰어난 소통 능력', '창의성', '적응력'],
      challenges: ['계획성 부족', '집중력 부족', '루틴 업무 어려움'],
      career: ['상담사', '기자', '광고기획자', '예술가'],
      color: 'text-teal-600',
      icon: Heart
    },
    'ISTJ': {
      name: '논리주의자형',
      description: '신뢰할 수 있는 현실적 완벽주의자',
      traits: ['신중함', '책임감 강함', '체계적', '신뢰할 수 있음'],
      strengths: ['높은 신뢰도', '체계적 업무 처리', '인내심'],
      challenges: ['융통성 부족', '변화 적응 어려움', '감정 표현 부족'],
      career: ['회계사', '의사', '엔지니어', '공무원'],
      color: 'text-gray-600',
      icon: Target
    },
    'ISTP': {
      name: '만능재주꾼형',
      description: '대담하고 실용적인 실험가',
      traits: ['실용적', '논리적', '독립적', '적응력 뛰어남'],
      strengths: ['문제해결 능력', '손재주', '침착함'],
      challenges: ['감정 표현 부족', '계획성 부족', '팀워크 어려움'],
      career: ['엔지니어', '정비사', '외과의사', '조종사'],
      color: 'text-brown-600',
      icon: Lightbulb
    },
    'ISFJ': {
      name: '수호자형',
      description: '따뜻하고 헌신적인 보호자',
      traits: ['온화함', '책임감 강함', '세심함', '헌신적'],
      strengths: ['세심한 배려', '높은 책임감', '안정성'],
      challenges: ['자기주장 부족', '변화 적응 어려움', '과도한 희생'],
      career: ['간호사', '교사', '사회복지사', '비서'],
      color: 'text-rose-600',
      icon: Heart
    },
    'ISFP': {
      name: '모험가형',
      description: '유연하고 매력적인 예술가 기질',
      traits: ['온화함', '친근함', '유연함', '예술적 감각'],
      strengths: ['창의성', '감수성', '배려심'],
      challenges: ['계획성 부족', '비판에 민감', '자기주장 부족'],
      career: ['예술가', '디자이너', '상담사', '요리사'],
      color: 'text-indigo-600',
      icon: Heart
    },
    'INTJ': {
      name: '건축가형',
      description: '상상력이 풍부한 전략적 사고가',
      traits: ['독립적', '미래지향적', '완벽주의', '논리적'],
      strengths: ['전략적 사고', '독창성', '결단력'],
      challenges: ['감정적 배려 부족', '현실성 부족', '고집스러움'],
      career: ['연구원', '건축가', '컨설턴트', '작가'],
      color: 'text-violet-600',
      icon: Brain
    },
    'INTP': {
      name: '논리술사형',
      description: '혁신적인 발명가 기질의 사색가',
      traits: ['논리적', '독립적', '창의적', '객관적'],
      strengths: ['분석 능력', '창의성', '논리적 사고'],
      challenges: ['실행력 부족', '감정 표현 어려움', '루틴 업무 지루함'],
      career: ['연구원', '프로그래머', '대학교수', '작가'],
      color: 'text-cyan-600',
      icon: Brain
    },
    'INFJ': {
      name: '옹호자형',
      description: '선의의 옹호자이자 이상주의자',
      traits: ['이상주의적', '통찰력 있음', '헌신적', '창의적'],
      strengths: ['깊은 통찰력', '창의성', '공감 능력'],
      challenges: ['완벽주의', '현실성 부족', '스트레스에 민감'],
      career: ['상담사', '작가', '종교인', '심리학자'],
      color: 'text-emerald-600',
      icon: Users
    },
    'INFP': {
      name: '중재자형',
      description: '이상주의적이고 충성심 강한 중재자',
      traits: ['이상주의적', '충성심 강함', '적응력 있음', '호기심 많음'],
      strengths: ['창의성', '공감 능력', '진정성'],
      challenges: ['현실성 부족', '결정 어려움', '비판에 민감'],
      career: ['작가', '예술가', '상담사', '사회복지사'],
      color: 'text-lime-600',
      icon: Heart
    }
  };

  const currentType = personalityTypes[result.type as keyof typeof personalityTypes] || personalityTypes['ISFP'];
  const IconComponent = currentType.icon;

  const handleShare = async () => {
    const shareText = `성격유형 테스트 결과\n유형: ${result.type} (${currentType.name})\n${currentType.description}\n\n나도 테스트해보기!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '성격유형 테스트 결과',
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "결과가 복사되었습니다",
        description: "클립보드에 결과를 복사했습니다!",
      });
    }
  };

  const getDimensionScore = (dim1: string, dim2: string) => {
    const total = result.counts[dim1] + result.counts[dim2];
    const percentage1 = Math.round((result.counts[dim1] / total) * 100);
    const percentage2 = Math.round((result.counts[dim2] / total) * 100);
    return { percentage1, percentage2 };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-purple-500/10">
              <IconComponent className="w-8 h-8 text-purple-500" />
            </div>
            <h1 className="text-3xl font-bold">성격유형 테스트 결과</h1>
          </div>
          <p className="text-muted-foreground">
            당신의 성격 유형과 특성을 확인해보세요
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* 주요 결과 */}
            <Card className="border-purple-200/50">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <IconComponent className={`w-12 h-12 ${currentType.color}`} />
                  <div>
                    <CardTitle className={`text-2xl ${currentType.color}`}>
                      {result.type}
                    </CardTitle>
                    <p className="text-lg font-medium text-muted-foreground">
                      {currentType.name}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-lg">
                  {currentType.description}
                </p>
              </CardHeader>
            </Card>

            {/* 성격 차원 분석 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  성격 차원 분석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { dim1: 'E', dim2: 'I', label1: '외향형', label2: '내향형', desc: '에너지 방향' },
                    { dim1: 'S', dim2: 'N', label1: '감각형', label2: '직관형', desc: '정보 인식' },
                    { dim1: 'T', dim2: 'F', label1: '사고형', label2: '감정형', desc: '판단 기준' },
                    { dim1: 'J', dim2: 'P', label1: '판단형', label2: '인식형', desc: '생활 양식' }
                  ].map((dimension, index) => {
                    const scores = getDimensionScore(dimension.dim1, dimension.dim2);
                    const dominant = scores.percentage1 > scores.percentage2 ? dimension.dim1 : dimension.dim2;
                    const dominantLabel = scores.percentage1 > scores.percentage2 ? dimension.label1 : dimension.label2;
                    const dominantPercent = Math.max(scores.percentage1, scores.percentage2);
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{dimension.desc}</span>
                          <Badge variant="secondary">{dominantLabel} {dominantPercent}%</Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 relative">
                          <div 
                            className="h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${scores.percentage1}%` }}
                          />
                          <div className="absolute inset-0 flex justify-between items-center px-2 text-xs font-medium">
                            <span className="text-white">{dimension.label1}</span>
                            <span className="text-gray-600">{dimension.label2}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 특성 분석 */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Target className="w-5 h-5" />
                    주요 특성
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentType.traits.map((trait, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm">{trait}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Lightbulb className="w-5 h-5" />
                    강점
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentType.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 개발 영역 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Users className="w-5 h-5" />
                  개발이 필요한 영역
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentType.challenges.map((challenge, index) => (
                    <div key={index} className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                      <span className="text-sm text-orange-700">{challenge}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 추천 직업 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  적합한 직업군
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentType.career.map((job, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {job}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 액션 버튼들 */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button 
                    onClick={handleShare}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    결과 공유하기
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/assessment')}
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    다른 테스트 하기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 관련 테스트 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">추천 테스트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate('/assessment?test=relationship')}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    관계 스타일 진단
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate('/assessment?test=stress')}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    스트레스 측정
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplePersonalityResult;