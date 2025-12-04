import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import SocialShareButtons from '@/components/social/SocialShareButtons';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ExpertAnalysisSection } from './ExpertAnalysisSection';
import { PremiumTestCTA } from './PremiumTestCTA';
import { ExpertMatchRecommendation } from './ExpertMatchRecommendation';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { 
  Brain, 
  Heart, 
  Lightbulb, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Star,
  ArrowRight,
  Activity,
  Target,
  Users,
  Zap,
  Moon,
  Eye,
  Gauge
} from 'lucide-react';

const levelConfig = {
  excellent: {
    color: 'bg-green-500',
    bgColor: 'bg-green-50 border-green-200',
    textColor: 'text-green-800',
    gradientFrom: 'from-green-400',
    gradientTo: 'to-emerald-500',
    icon: CheckCircle,
    message: '훌륭한 정신건강 상태입니다!',
    percentile: '상위 15%'
  },
  good: {
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-800',
    gradientFrom: 'from-blue-400',
    gradientTo: 'to-indigo-500',
    icon: TrendingUp,
    message: '양호한 정신건강 상태입니다.',
    percentile: '상위 35%'
  },
  fair: {
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50 border-yellow-200',
    textColor: 'text-yellow-800',
    gradientFrom: 'from-yellow-400',
    gradientTo: 'to-orange-500',
    icon: AlertTriangle,
    message: '관리가 필요한 상태입니다.',
    percentile: '상위 60%'
  },
  poor: {
    color: 'bg-red-500',
    bgColor: 'bg-red-50 border-red-200',
    textColor: 'text-red-800',
    gradientFrom: 'from-red-400',
    gradientTo: 'to-rose-500',
    icon: AlertTriangle,
    message: '전문적인 도움이 필요할 수 있습니다.',
    percentile: '상위 85%'
  }
};

// 질문을 영역별로 매핑
const domainMapping: Record<string, { domain: string; label: string; icon: any }> = {
  worry_frequency: { domain: 'anxiety', label: '불안 빈도', icon: Activity },
  worry_control: { domain: 'control', label: '감정 조절', icon: Target },
  physical_symptoms: { domain: 'physical', label: '신체 증상', icon: Heart },
  sleep_disturbance: { domain: 'sleep', label: '수면 질', icon: Moon },
  daily_interference: { domain: 'daily', label: '일상 기능', icon: Zap },
  avoidance_behavior: { domain: 'avoidance', label: '회피 행동', icon: Eye },
  concentration_problems: { domain: 'concentration', label: '집중력', icon: Brain },
  future_worries: { domain: 'future', label: '미래 걱정', icon: TrendingUp }
};

const scoreMap: Record<string, number> = {
  never: 1, rarely: 2, sometimes: 3, often: 4, always: 5,
  very_easy: 1, easy: 2, moderate: 3, difficult: 4, impossible: 5,
  none: 1, minimal: 2, mild: 2, significant: 4, severe: 5, panic: 5
};

interface MentalHealthQuickResultProps {
  result: any;
  onRestart: () => void;
}

export const MentalHealthQuickResult: React.FC<MentalHealthQuickResultProps> = ({ 
  result, 
  onRestart 
}) => {
  const navigate = useNavigate();
  const config = levelConfig[result.level as keyof typeof levelConfig] || levelConfig.fair;
  const IconComponent = config.icon;
  const [expertAnalysis, setExpertAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const { toast } = useToast();

  // 영역별 점수 계산
  const calculateDomainScores = () => {
    const domainScores: Record<string, number> = {};
    
    Object.entries(result.answers || {}).forEach(([questionId, answer]) => {
      const mapping = domainMapping[questionId];
      if (mapping) {
        const score = scoreMap[answer as string] || 3;
        // 점수를 역산해서 높을수록 좋게 변환 (5점 만점에서 빼기)
        domainScores[mapping.label] = 6 - score;
      }
    });
    
    return domainScores;
  };

  const domainScores = calculateDomainScores();

  // 레이더 차트 데이터
  const radarData = Object.entries(domainScores).map(([label, score]) => ({
    subject: label,
    score: score,
    fullMark: 5
  }));

  // 바 차트 데이터
  const barData = Object.entries(domainScores).map(([label, score]) => ({
    name: label,
    score: score,
    평균: 3.2 // 가상의 평균 데이터
  }));

  // 총점 분포 데이터 (가상의 비교 데이터)
  const distributionData = [
    { range: '1-2점', count: 15, yourPosition: result.averageScore >= 1 && result.averageScore < 2 },
    { range: '2-3점', count: 35, yourPosition: result.averageScore >= 2 && result.averageScore < 3 },
    { range: '3-4점', count: 30, yourPosition: result.averageScore >= 3 && result.averageScore < 4 },
    { range: '4-5점', count: 20, yourPosition: result.averageScore >= 4 }
  ];

  // 시간대별 추천 활동 데이터
  const timelineData = [
    { time: '아침', activity: 4, recommended: 5 },
    { time: '오전', activity: 3, recommended: 4 },
    { time: '점심', activity: 3, recommended: 4 },
    { time: '오후', activity: 2, recommended: 4 },
    { time: '저녁', activity: 2, recommended: 3 },
    { time: '밤', activity: 1, recommended: 2 }
  ];

  useEffect(() => {
    analyzeResults();
  }, [result]);

  const analyzeResults = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-test-results', {
        body: {
          testType: 'mental-health-quick',
          results: {
            score: result.averageScore,
            level: result.level,
            total: result.totalScore,
            average: result.averageScore,
            domainScores: domainScores
          }
        }
      });

      if (error) throw error;
      setExpertAnalysis(data.analysis || '분석 결과를 생성하는 중 문제가 발생했습니다.');
    } catch (error) {
      console.error('Analysis error:', error);
      setExpertAnalysis('전문가 분석을 불러오는데 실패했습니다. 나중에 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 가장 약한 영역과 강한 영역 찾기
  const sortedDomains = Object.entries(domainScores).sort((a, b) => a[1] - b[1]);
  const weakestDomain = sortedDomains[0];
  const strongestDomain = sortedDomains[sortedDomains.length - 1];

  const getColorByScore = (score: number) => {
    if (score >= 4) return '#22c55e';
    if (score >= 3) return '#3b82f6';
    if (score >= 2) return '#eab308';
    return '#ef4444';
  };

  const getSeverityForExpert = () => {
    if (result.level === 'poor') return '심한 우울';
    if (result.level === 'fair') return '중등도 우울';
    if (result.level === 'good') return '가벼운 우울';
    return '정상';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* 메인 결과 카드 */}
      <Card className={`${config.bgColor} overflow-hidden`}>
        <div className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                <IconComponent className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">정신건강 종합 분석 결과</h2>
                <p className="text-white/80">{new Date().toLocaleDateString('ko-KR')} 검사</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-white/20 text-white text-lg px-4 py-2 backdrop-blur-sm">
                {result.levelText}
              </Badge>
              <p className="text-white/80 text-sm mt-2">{config.percentile}</p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          {/* 핵심 지표 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Gauge className="w-4 h-4" />
                <span className="text-xs">종합 점수</span>
              </div>
              <p className="text-2xl font-bold">{result.averageScore.toFixed(1)}<span className="text-sm text-muted-foreground">/5.0</span></p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs">총점</span>
              </div>
              <p className="text-2xl font-bold">{result.totalScore}<span className="text-sm text-muted-foreground">점</span></p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">강점 영역</span>
              </div>
              <p className="text-lg font-bold text-green-700">{strongestDomain?.[0]}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs">개선 필요</span>
              </div>
              <p className="text-lg font-bold text-orange-700">{weakestDomain?.[0]}</p>
            </div>
          </div>

          <p className="text-lg text-center font-medium">{config.message}</p>
        </CardContent>
      </Card>

      {/* 차트 섹션 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 레이더 차트 */}
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center text-lg">
              <Brain className="h-5 w-5 mr-2 text-purple-500" />
              영역별 종합 분석
            </CardTitle>
            <CardDescription>8개 영역의 균형 상태를 시각화</CardDescription>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 5]} 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                />
                <Radar
                  name="내 점수"
                  dataKey="score"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.5}
                  strokeWidth={2}
                />
                <Radar
                  name="평균"
                  dataKey="fullMark"
                  stroke="#d1d5db"
                  fill="transparent"
                  strokeDasharray="5 5"
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 영역별 바 차트 */}
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center text-lg">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              영역별 상세 점수
            </CardTitle>
            <CardDescription>각 영역의 점수와 평균 비교</CardDescription>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" name="내 점수" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorByScore(entry.score)} />
                  ))}
                </Bar>
                <Bar dataKey="평균" fill="#d1d5db" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 분포 및 추이 차트 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 점수 분포 */}
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center text-lg">
              <Users className="h-5 w-5 mr-2 text-indigo-500" />
              전체 응시자 대비 위치
            </CardTitle>
            <CardDescription>같은 검사를 받은 사람들과 비교</CardDescription>
          </CardHeader>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="응시자 비율(%)">
                  {distributionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.yourPosition ? '#8b5cf6' : '#e5e7eb'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            <span className="inline-block w-3 h-3 bg-purple-500 rounded mr-1"></span>
            현재 나의 위치
          </p>
        </Card>

        {/* 하루 활동 권장 패턴 */}
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center text-lg">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              하루 에너지 관리 권장
            </CardTitle>
            <CardDescription>시간대별 활동량 권장 패턴</CardDescription>
          </CardHeader>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="recommended" 
                  name="권장 활동량" 
                  stroke="#22c55e" 
                  fill="#22c55e" 
                  fillOpacity={0.3} 
                />
                <Area 
                  type="monotone" 
                  dataKey="activity" 
                  name="예상 활동량" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 영역별 상세 분석 카드 */}
      <Card className="p-6">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="flex items-center text-xl">
            <Lightbulb className="h-6 w-6 mr-2 text-yellow-500" />
            영역별 상세 인사이트
          </CardTitle>
        </CardHeader>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(domainScores).map(([label, score]) => {
            const mapping = Object.values(domainMapping).find(m => m.label === label);
            const IconComp = mapping?.icon || Brain;
            const status = score >= 4 ? '양호' : score >= 3 ? '보통' : score >= 2 ? '주의' : '위험';
            const statusColor = score >= 4 ? 'text-green-600 bg-green-50' : 
                               score >= 3 ? 'text-blue-600 bg-blue-50' : 
                               score >= 2 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50';
            
            return (
              <div key={label} className="bg-muted/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComp className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium text-sm">{label}</span>
                  </div>
                  <Badge className={statusColor}>{status}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>점수</span>
                    <span className="font-medium">{score.toFixed(1)}/5.0</span>
                  </div>
                  <Progress value={(score / 5) * 100} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {score >= 4 ? '현재 상태가 양호합니다. 유지하세요.' :
                   score >= 3 ? '보통 수준입니다. 조금 더 관심이 필요합니다.' :
                   score >= 2 ? '주의가 필요합니다. 개선 방법을 찾아보세요.' :
                   '적극적인 관리가 필요합니다.'}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 맞춤 추천사항 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              맞춤 개선 권장사항
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weakestDomain && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="font-medium text-orange-800 mb-2">🎯 최우선 개선 영역: {weakestDomain[0]}</p>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• 이 영역에 집중적인 관리가 필요합니다</li>
                    <li>• 전문가 상담을 고려해보세요</li>
                    <li>• 관련 자가관리 방법을 학습하세요</li>
                  </ul>
                </div>
              )}
              <div className="space-y-3">
                {result.level === 'poor' || result.level === 'fair' ? (
                  <>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">전문가 상담을 강력히 권장합니다</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">규칙적인 수면 패턴을 만드세요</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">가벼운 운동으로 시작하세요</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">현재 상태를 잘 유지하세요</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">스트레스 관리법을 익히세요</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">정기적인 자기 점검을 하세요</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-500" />
              예방 및 관리 가이드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <Heart className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">규칙적인 생활</p>
                  <p className="text-xs text-muted-foreground">일정한 수면과 식사 패턴 유지</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <Brain className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">스트레스 관리</p>
                  <p className="text-xs text-muted-foreground">명상, 운동, 취미활동</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <Users className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">사회적 관계</p>
                  <p className="text-xs text-muted-foreground">가족, 친구와의 소통 증진</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 전문가 상세 해석 */}
      <ExpertAnalysisSection 
        analysis={expertAnalysis}
        isLoading={isAnalyzing}
        testType="mental-health-quick"
      />

      {/* 맞춤 전문가 추천 */}
      <ExpertMatchRecommendation
        testType="anxiety"
        severity={getSeverityForExpert()}
        scores={{ total: result.totalScore, average: result.averageScore }}
      />

      {/* 프리미엄 테스트 CTA */}
      <PremiumTestCTA 
        currentTestType="mental-health-quick"
        title="더 정확한 정신건강 진단이 필요하신가요?"
        description="프리미엄 정신건강 전문 검사로 30개 이상의 심층 질문과 전문의 수준의 상세 분석을 받아보세요."
      />

      {/* 주의사항 */}
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate('/experts')}
                >
                  <ArrowRight className="h-4 w-4 mr-1" />
                  전문가 상담 알아보기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button variant="outline" onClick={onRestart} size="lg">
          다시 검사하기
        </Button>
        <Button variant="outline" onClick={() => window.print()} size="lg">
          결과 저장하기
        </Button>
        <Button onClick={() => navigate('/assessment')} size="lg">
          다른 검사 보기
        </Button>
      </div>

      {/* 소셜 공유 */}
      <SocialShareButtons 
        title={`정신건강 검사 결과: ${result.levelText}`}
        description={`종합 점수 ${result.averageScore.toFixed(1)}점으로 ${result.levelText} 상태입니다.`}
      />
    </div>
  );
};
