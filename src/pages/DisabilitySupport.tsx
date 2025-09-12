import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, Heart, Home, GraduationCap, Car, Utensils, MessageCircle, Phone, 
  Coffee, Clock, Smile, Frown, Meh, Brain, Target, Users, BookOpen, 
  Activity, MapPin, Calendar, FileText, Search, ExternalLink, Lightbulb,
  Shield, Award, Gift, Stethoscope, Building2, UserCheck, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { chatWithAICounselor } from '@/services/openai';
import ProactiveAgentDashboard from '@/components/agents/ProactiveAgentDashboard';
import TherapyInstitutionSearch from '@/components/therapy/TherapyInstitutionSearch';

interface BenefitResult {
  name: string;
  amount: string;
  description: string;
  eligibility: string;
  icon: React.ReactNode;
  category: 'money' | 'service' | 'discount';
  link?: string;
}

interface EmotionalEntry {
  id: string;
  mood: 'good' | 'okay' | 'hard';
  content: string;
  timestamp: Date;
  supportReceived?: boolean;
}

interface Milestone {
  id: string;
  text: string;
  ageRange: string;
  category: 'motor' | 'language' | 'cognitive' | 'social' | 'selfcare';
  isDelayed?: boolean;
}

const DisabilitySupport = () => {
  // 혜택 계산기 상태
  const [benefitFormData, setBenefitFormData] = useState({
    childAge: '',
    disabilityGrade: '',
    householdIncome: '',
    region: '',
    hasCaregiver: false,
    needsSpecialEducation: false,
    needsTherapy: false,
    isWorkingParent: false
  });
  const [benefitResults, setBenefitResults] = useState<BenefitResult[]>([]);
  const [showBenefitResults, setShowBenefitResults] = useState(false);

  // 마음 돌봄 상태
  const [currentMood, setCurrentMood] = useState<'good' | 'okay' | 'hard' | null>(null);
  const [emotionalNote, setEmotionalNote] = useState('');
  const [emotionalEntries, setEmotionalEntries] = useState<EmotionalEntry[]>([]);
  const [aiConversation, setAiConversation] = useState<Array<{ role: string; content: string }>>([]);
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 발달 마일스톤 상태
  const [childAgeMonths, setChildAgeMonths] = useState('');
  const [childAgeYears, setChildAgeYears] = useState('');
  const [checkedMilestones, setCheckedMilestones] = useState<string[]>([]);
  const [showMilestoneResults, setShowMilestoneResults] = useState(false);

  // 혜택 계산 함수
  const calculateBenefits = () => {
    if (!benefitFormData.childAge || !benefitFormData.disabilityGrade || !benefitFormData.householdIncome) {
      toast.error('필수 정보를 모두 입력해주세요');
      return;
    }

    const benefits: BenefitResult[] = [];

    // 기본 급여
    if (parseInt(benefitFormData.disabilityGrade) <= 3) {
      benefits.push({
        name: '장애아동수당',
        amount: '월 20만원',
        description: '중증 장애아동 대상 기본수당',
        eligibility: '만 18세 미만, 1-3급 장애',
        icon: <Heart className="w-5 h-5" />,
        category: 'money',
        link: 'https://www.mw.go.kr'
      });
    }

    if (parseInt(benefitFormData.disabilityGrade) <= 6) {
      benefits.push({
        name: '장애인연금',
        amount: '월 32만원',
        description: '만 18세 이상 중증장애인 기초연금',
        eligibility: '만 18세 이상, 1-3급 장애',
        icon: <Heart className="w-5 h-5" />,
        category: 'money',
        link: 'https://www.nps.or.kr'
      });
    }

    // 특수교육비
    if (benefitFormData.needsSpecialEducation) {
      benefits.push({
        name: '특수교육비 지원',
        amount: '월 50-100만원',
        description: '특수교육기관 이용료 지원',
        eligibility: '특수교육 대상자',
        icon: <GraduationCap className="w-5 h-5" />,
        category: 'service',
        link: 'https://www.sen.go.kr'
      });
    }

    // 치료비 지원
    if (benefitFormData.needsTherapy) {
      benefits.push({
        name: '발달재활서비스',
        amount: '월 22만원',
        description: '언어치료, 인지치료 등 바우처',
        eligibility: '만 18세 미만 장애아동',
        icon: <Heart className="w-5 h-5" />,
        category: 'service',
        link: 'https://www.socialservice.or.kr'
      });
    }

    setBenefitResults(benefits);
    setShowBenefitResults(true);
    toast.success(`${benefits.length}개의 혜택을 찾았습니다!`);
  };

  // AI 상담 함수
  const sendMessageToAI = async (message: string) => {
    if (!message.trim()) return;

    setIsAiLoading(true);
    const updatedConversation = [...aiConversation, { role: 'user', content: message }];
    setAiConversation(updatedConversation);

    try {
      const response = await chatWithAICounselor(message, updatedConversation);
      setAiResponse(response.response);
      setAiConversation([...updatedConversation, { role: 'assistant', content: response.response }]);
    } catch (error) {
      toast.error('AI 상담사와 연결에 문제가 발생했습니다.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // 발달 마일스톤 데이터
  const milestonesByAge: Record<string, Milestone[]> = {
    '0-6': [
      { id: '1', text: '목을 가눌 수 있어요', ageRange: '3-4개월', category: 'motor' },
      { id: '2', text: '혼자 앉을 수 있어요', ageRange: '6개월', category: 'motor' },
      { id: '3', text: '옹알이를 해요', ageRange: '4-6개월', category: 'language' }
    ],
    '6-12': [
      { id: '4', text: '기어다닐 수 있어요', ageRange: '7-10개월', category: 'motor' },
      { id: '5', text: '혼자 설 수 있어요', ageRange: '9-12개월', category: 'motor' },
      { id: '6', text: '간단한 단어를 말해요', ageRange: '10-14개월', category: 'language' }
    ],
    '12-24': [
      { id: '7', text: '혼자 걸을 수 있어요', ageRange: '12-15개월', category: 'motor' },
      { id: '8', text: '2단어 문장을 말해요', ageRange: '18-24개월', category: 'language' },
      { id: '9', text: '다른 아이들에게 관심을 보여요', ageRange: '18-24개월', category: 'social' }
    ]
  };

  const getCurrentMilestones = () => {
    const ageInMonths = parseInt(childAgeMonths) || (parseInt(childAgeYears) * 12) || 0;
    
    if (ageInMonths <= 6) return milestonesByAge['0-6'] || [];
    if (ageInMonths <= 12) return milestonesByAge['6-12'] || [];
    if (ageInMonths <= 24) return milestonesByAge['12-24'] || [];
    return [];
  };

  const analyzeMilestones = () => {
    const currentMilestones = getCurrentMilestones();
    if (currentMilestones.length === 0) {
      toast.error('해당 연령대의 마일스톤 정보가 없습니다.');
      return;
    }

    const completionRate = (checkedMilestones.length / currentMilestones.length) * 100;
    setShowMilestoneResults(true);
    
    if (completionRate >= 80) {
      toast.success('발달이 정상적으로 이루어지고 있어요! 🎉');
    } else if (completionRate >= 60) {
      toast('일부 영역에서 관찰이 필요해요 👀', { duration: 4000 });
    } else {
      toast('전문가 상담을 권해드려요 🏥', { duration: 4000 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-innovation bg-fixed relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--neural-blue)/0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--cyber-purple)/0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--future-mint)/0.1),transparent_70%)]" />
      
      {/* 플로팅 요소들 */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-neural-blue/20 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-cyber-purple/20 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}} />
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-future-mint/20 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}} />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-8 p-4">
        {/* 혁신적인 헤더 */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-neural rounded-full blur-md opacity-60 animate-ai-glow" />
              <Brain className="relative w-16 h-16 text-white z-10 animate-neural-pulse" />
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-bold bg-gradient-neural bg-clip-text text-transparent leading-tight">
                AI 심리발달교육복지
              </h1>
              <h2 className="text-3xl font-semibold text-white/90">
                혁신 종합플랫폼
              </h2>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-neural rounded-full blur-md opacity-60 animate-ai-glow" style={{animationDelay: '1s'}} />
              <Sparkles className="relative w-16 h-16 text-innovation-gold z-10 animate-neural-pulse" style={{animationDelay: '1s'}} />
            </div>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20" />
            <div className="relative p-8 space-y-4">
              <p className="text-xl text-white/90 font-medium">
                🚀 차세대 AI 기술로 혁신하는 아동 발달 지원 생태계
              </p>
              <p className="text-lg text-white/80">
                머신러닝 기반 개인화 분석 • 실시간 AI 상담 • 예측적 개입 시스템
              </p>
              <div className="flex justify-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-neural-blue">
                  <div className="w-2 h-2 rounded-full bg-neural-blue animate-ping" />
                  <span className="text-sm font-medium">실시간 AI 분석</span>
                </div>
                <div className="flex items-center gap-2 text-cyber-purple">
                  <div className="w-2 h-2 rounded-full bg-cyber-purple animate-ping" style={{animationDelay: '0.5s'}} />
                  <span className="text-sm font-medium">예측적 개입</span>
                </div>
                <div className="flex items-center gap-2 text-future-mint">
                  <div className="w-2 h-2 rounded-full bg-future-mint animate-ping" style={{animationDelay: '1s'}} />
                  <span className="text-sm font-medium">맞춤형 솔루션</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 혁신적인 탭 시스템 */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10" />
          <div className="relative p-2">
            <Tabs defaultValue="ai-agents" className="w-full">
              <TabsList className="grid w-full grid-cols-8 h-auto p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                <TabsTrigger 
                  value="ai-agents" 
                  className="flex flex-col gap-2 py-4 px-3 rounded-xl transition-all duration-300 hover:bg-white/20 data-[state=active]:bg-gradient-neural data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:animate-ai-glow"
                >
                  <div className="relative">
                    <Sparkles className="w-6 h-6 animate-neural-pulse" />
                    <div className="absolute inset-0 bg-innovation-gold/30 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs font-medium">AI 에이전트</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="benefits" 
                  className="flex flex-col gap-2 py-4 px-3 rounded-xl transition-all duration-300 hover:bg-white/20 data-[state=active]:bg-gradient-neural data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Calculator className="w-6 h-6" />
                  <span className="text-xs font-medium">혜택계산</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="milestones" 
                  className="flex flex-col gap-2 py-4 px-3 rounded-xl transition-all duration-300 hover:bg-white/20 data-[state=active]:bg-gradient-neural data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Target className="w-6 h-6" />
                  <span className="text-xs font-medium">발달확인</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="emotional" 
                  className="flex flex-col gap-2 py-4 px-3 rounded-xl transition-all duration-300 hover:bg-white/20 data-[state=active]:bg-gradient-neural data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Heart className="w-6 h-6" />
                  <span className="text-xs font-medium">마음돌봄</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="independence" 
                  className="flex flex-col gap-2 py-4 px-3 rounded-xl transition-all duration-300 hover:bg-white/20 data-[state=active]:bg-gradient-neural data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Award className="w-6 h-6" />
                  <span className="text-xs font-medium">자립준비</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="siblings" 
                  className="flex flex-col gap-2 py-4 px-3 rounded-xl transition-all duration-300 hover:bg-white/20 data-[state=active]:bg-gradient-neural data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Users className="w-6 h-6" />
                  <span className="text-xs font-medium">형제케어</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="education" 
                  className="flex flex-col gap-2 py-4 px-3 rounded-xl transition-all duration-300 hover:bg-white/20 data-[state=active]:bg-gradient-neural data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <BookOpen className="w-6 h-6" />
                  <span className="text-xs font-medium">특수교육</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="therapy" 
                  className="flex flex-col gap-2 py-4 px-3 rounded-xl transition-all duration-300 hover:bg-white/20 data-[state=active]:bg-gradient-neural data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Activity className="w-6 h-6" />
                  <span className="text-xs font-medium">치료기관</span>
                </TabsTrigger>
              </TabsList>

          {/* 혜택 계산기 탭 */}
        <TabsContent value="ai-agents" className="space-y-6">
          <ProactiveAgentDashboard />
        </TabsContent>

          <TabsContent value="ai-agents" className="space-y-6">
            <ProactiveAgentDashboard />
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20" />
              <Card className="relative border-0 bg-transparent shadow-none">
                <CardHeader className="bg-gradient-neural text-white rounded-t-3xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-shimmer animate-shimmer opacity-30" />
                  <div className="relative z-10">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="relative">
                        <Calculator className="w-8 h-8 animate-neural-pulse" />
                        <div className="absolute inset-0 bg-innovation-gold/30 rounded-full blur-sm" />
                      </div>
                      AI 혜택 계산 시스템
                    </CardTitle>
                    <CardDescription className="text-white/90 text-lg mt-2">
                      🤖 머신러닝 기반으로 개인 맞춤형 지원금과 혜택을 실시간 분석합니다
                    </CardDescription>
                  </div>
                </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="childAge">자녀 나이</Label>
                    <Input
                      id="childAge"
                      type="number"
                      placeholder="예: 8"
                      value={benefitFormData.childAge}
                      onChange={(e) => setBenefitFormData({...benefitFormData, childAge: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="disabilityGrade">장애 등급</Label>
                    <Select onValueChange={(value) => setBenefitFormData({...benefitFormData, disabilityGrade: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="등급 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1급 (중증)</SelectItem>
                        <SelectItem value="2">2급 (중증)</SelectItem>
                        <SelectItem value="3">3급 (중증)</SelectItem>
                        <SelectItem value="4">4급 (경증)</SelectItem>
                        <SelectItem value="5">5급 (경증)</SelectItem>
                        <SelectItem value="6">6급 (경증)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="income">가구 월소득</Label>
                    <Input
                      id="income"
                      type="number"
                      placeholder="만원 단위로 입력"
                      value={benefitFormData.householdIncome}
                      onChange={(e) => setBenefitFormData({...benefitFormData, householdIncome: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">거주지역</Label>
                    <Select onValueChange={(value) => setBenefitFormData({...benefitFormData, region: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="지역 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seoul">서울특별시</SelectItem>
                        <SelectItem value="busan">부산광역시</SelectItem>
                        <SelectItem value="daegu">대구광역시</SelectItem>
                        <SelectItem value="incheon">인천광역시</SelectItem>
                        <SelectItem value="gwangju">광주광역시</SelectItem>
                        <SelectItem value="daejeon">대전광역시</SelectItem>
                        <SelectItem value="ulsan">울산광역시</SelectItem>
                        <SelectItem value="gyeonggi">경기도</SelectItem>
                        <SelectItem value="other">기타 지역</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>추가 정보 (해당사항 체크)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="caregiver"
                        checked={benefitFormData.hasCaregiver}
                        onCheckedChange={(checked) => setBenefitFormData({...benefitFormData, hasCaregiver: checked as boolean})}
                      />
                      <Label htmlFor="caregiver">주 돌봄자가 있음</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="specialed"
                        checked={benefitFormData.needsSpecialEducation}
                        onCheckedChange={(checked) => setBenefitFormData({...benefitFormData, needsSpecialEducation: checked as boolean})}
                      />
                      <Label htmlFor="specialed">특수교육 필요</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="therapy"
                        checked={benefitFormData.needsTherapy}
                        onCheckedChange={(checked) => setBenefitFormData({...benefitFormData, needsTherapy: checked as boolean})}
                      />
                      <Label htmlFor="therapy">치료서비스 필요</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="working"
                        checked={benefitFormData.isWorkingParent}
                        onCheckedChange={(checked) => setBenefitFormData({...benefitFormData, isWorkingParent: checked as boolean})}
                      />
                      <Label htmlFor="working">부모 직장인</Label>
                    </div>
                  </div>
                </div>

                <Button onClick={calculateBenefits} className="w-full" size="lg">
                  <Calculator className="w-5 h-5 mr-2" />
                  혜택 계산하기
                </Button>
              </CardContent>
              </Card>
            </div>

            {showBenefitResults && (
              <div className="space-y-6">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800">계산 결과</CardTitle>
                    <CardDescription className="text-green-600">
                      예상 월 수령액: <span className="text-2xl font-bold">
                        {benefitResults.filter(r => r.category === 'money')
                          .reduce((total, benefit) => {
                            const amount = benefit.amount.match(/\d+/)?.[0];
                            return total + (amount ? parseInt(amount) : 0);
                          }, 0).toLocaleString()}만원
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {benefitResults.map((benefit, index) => (
                    <Card key={index} className="hover:shadow-lg transition-all duration-300 group cursor-pointer" 
                          onClick={() => benefit.link && window.open(benefit.link, '_blank')}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {benefit.icon}
                            <CardTitle className="text-lg">{benefit.name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={benefit.category === 'money' ? 'default' : 'secondary'}>
                              {benefit.category === 'money' ? '현금' : benefit.category === 'service' ? '서비스' : '할인'}
                            </Badge>
                            {benefit.link && <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-primary">{benefit.amount}</div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">{benefit.description}</p>
                        <p className="text-xs text-muted-foreground">자격요건: {benefit.eligibility}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* 발달 마일스톤 탭 */}
          <TabsContent value="milestones" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  AI 발달 마일스톤 분석
                </CardTitle>
                <CardDescription className="text-purple-100">
                  우리 아이의 발달 상황을 체크하고 AI 전문가의 조언을 받아보세요
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ageMonths">개월수</Label>
                    <Input
                      id="ageMonths"
                      type="number"
                      placeholder="예: 18개월"
                      value={childAgeMonths}
                      onChange={(e) => setChildAgeMonths(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ageYears">나이</Label>
                    <Input
                      id="ageYears"
                      type="number"
                      placeholder="예: 2세"
                      value={childAgeYears}
                      onChange={(e) => setChildAgeYears(e.target.value)}
                    />
                  </div>
                </div>

                {(childAgeMonths || childAgeYears) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">해당 연령대 발달 체크리스트</h3>
                    <div className="grid gap-3">
                      {getCurrentMilestones().map((milestone) => (
                        <div key={milestone.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                          <Checkbox
                            id={milestone.id}
                            checked={checkedMilestones.includes(milestone.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCheckedMilestones([...checkedMilestones, milestone.id]);
                              } else {
                                setCheckedMilestones(checkedMilestones.filter(id => id !== milestone.id));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <Label htmlFor={milestone.id} className="font-medium">{milestone.text}</Label>
                            <p className="text-sm text-muted-foreground">{milestone.ageRange}</p>
                          </div>
                          <Badge variant="outline">
                            {milestone.category === 'motor' ? '운동' : 
                             milestone.category === 'language' ? '언어' : 
                             milestone.category === 'cognitive' ? '인지' : 
                             milestone.category === 'social' ? '사회성' : '자조'}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <Button onClick={analyzeMilestones} className="w-full" size="lg">
                      <Brain className="w-5 h-5 mr-2" />
                      AI 발달 분석 받기
                    </Button>

                    {showMilestoneResults && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="text-center">
                              <h4 className="text-lg font-semibold text-blue-800">발달 분석 결과</h4>
                              <div className="mt-2">
                                <Progress 
                                  value={(checkedMilestones.length / getCurrentMilestones().length) * 100} 
                                  className="w-full h-3"
                                />
                                <p className="text-sm text-blue-600 mt-1">
                                  {getCurrentMilestones().length}개 항목 중 {checkedMilestones.length}개 달성 
                                  ({Math.round((checkedMilestones.length / getCurrentMilestones().length) * 100)}%)
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => sendMessageToAI(`우리 아이 발달 상황: ${getCurrentMilestones().length}개 마일스톤 중 ${checkedMilestones.length}개 달성. 전문적인 조언을 부탁드립니다.`)}
                            >
                              <Brain className="w-4 h-4 mr-2" />
                              AI 발달센터장에게 상담받기
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 마음 돌봄 탭 */}
          <TabsContent value="emotional" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-6 h-6" />
                  AI 마음 돌봄 서비스
                </CardTitle>
                <CardDescription className="text-rose-100">
                  혼자가 아니에요. AI 상담사와 함께 이겨내요 💙
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* SOS 버튼 */}
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button 
                        variant="destructive" 
                        onClick={() => toast.success('긴급 상담 요청을 보냈어요. 곧 연락드릴게요 💙', { duration: 5000 })}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        긴급 상담 요청
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-red-300 text-red-700"
                        onClick={() => sendMessageToAI('지금 매우 힘든 상황입니다. 즉시 도움이 필요해요.')}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        AI 상담사와 대화
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 기분 선택 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">오늘 기분은 어떠세요?</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { mood: 'good', icon: Smile, label: '좋아요', color: 'bg-green-500' },
                      { mood: 'okay', icon: Meh, label: '그냥 그래요', color: 'bg-yellow-500' },
                      { mood: 'hard', icon: Frown, label: '힘들어요', color: 'bg-red-500' }
                    ].map(({ mood, icon: Icon, label, color }) => (
                      <Button
                        key={mood}
                        variant={currentMood === mood ? 'default' : 'outline'}
                        onClick={() => setCurrentMood(mood as any)}
                        className="h-20 flex-col space-y-2"
                      >
                        <Icon className="w-8 h-8" />
                        <span>{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 마음 기록 */}
                {currentMood && (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="오늘 하루는 어땠나요? 어떤 일이 있었는지, 어떤 기분인지 자유롭게 적어보세요..."
                      value={emotionalNote}
                      onChange={(e) => setEmotionalNote(e.target.value)}
                      rows={4}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button 
                        onClick={() => {
                          if (!emotionalNote.trim()) return;
                          const newEntry: EmotionalEntry = {
                            id: Date.now().toString(),
                            mood: currentMood,
                            content: emotionalNote,
                            timestamp: new Date()
                          };
                          setEmotionalEntries(prev => [newEntry, ...prev]);
                          setEmotionalNote('');
                          setCurrentMood(null);
                          toast.success('소중한 마음을 기록했어요 💙');
                        }} 
                        className="w-full"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        마음 기록하기
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => sendMessageToAI(`오늘 기분: ${currentMood === 'good' ? '좋음' : currentMood === 'okay' ? '보통' : '힘듦'}. ${emotionalNote}`)}
                        disabled={isAiLoading}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        AI 상담 받기
                      </Button>
                    </div>
                  </div>
                )}

                {/* AI 응답 */}
                {(aiResponse || isAiLoading) && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-800 flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        AI 발달센터장의 조언
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isAiLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-blue-600 mt-2">AI가 신중히 답변을 준비하고 있어요...</p>
                        </div>
                      ) : (
                        <p className="text-blue-700 whitespace-pre-wrap">{aiResponse}</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 성인기 자립 준비 로드맵 */}
          <TabsContent value="independence" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  성인기 자립 준비 로드맵
                </CardTitle>
                <CardDescription className="text-green-100">
                  우리 아이의 미래를 체계적으로 준비해보세요
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: '일상생활 기술', icon: Home, items: ['개인위생 관리', '식사 준비', '집안일', '대중교통 이용'] },
                    { title: '사회성 발달', icon: Users, items: ['대인관계 기술', '의사소통', '갈등 해결', '사회 규칙 이해'] },
                    { title: '직업 준비', icon: Building2, items: ['직업 탐색', '기술 훈련', '면접 연습', '직장 예절'] },
                    { title: '금융 관리', icon: Calculator, items: ['용돈 관리', '은행 이용', '예산 계획', '소비자 권리'] },
                    { title: '주거 계획', icon: Home, items: ['주거 형태 선택', '주택 관리', '이웃 관계', '응급 상황 대처'] },
                    { title: '건강 관리', icon: Stethoscope, items: ['정기 검진', '약물 관리', '운동', '스트레스 관리'] }
                  ].map((area, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <area.icon className="w-5 h-5 text-primary" />
                          {area.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {area.items.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Button className="w-full" size="lg">
                  <FileText className="w-5 h-5 mr-2" />
                  개별 자립 계획서 작성하기
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 형제자매 심리 케어 */}
          <TabsContent value="siblings" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  형제자매 심리 케어
                </CardTitle>
                <CardDescription className="text-orange-100">
                  온 가족이 함께 건강하게 성장할 수 있도록 도와드려요
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-800">형제자매 지원 프로그램</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">개별 상담 세션</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">또래 지원 그룹</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">가족 치료 세션</span>
                      </div>
                      <Button variant="outline" className="w-full mt-3">
                        프로그램 신청하기
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-800">형제자매를 위한 리소스</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-green-600" />
                        <span className="text-sm">연령별 설명 가이드</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-600" />
                        <span className="text-sm">함께하는 활동 제안</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-green-600" />
                        <span className="text-sm">감정 표현 도구</span>
                      </div>
                      <Button variant="outline" className="w-full mt-3">
                        리소스 다운로드
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <h3 className="text-lg font-semibold text-purple-800">
                        💜 형제자매도 소중한 우리 가족
                      </h3>
                      <p className="text-purple-700">
                        장애아동의 형제자매들도 특별한 관심과 지원이 필요합니다. 
                        혼자 감당하지 마시고 함께 해결해 나가요.
                      </p>
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => sendMessageToAI('형제자매 심리 케어에 대한 조언이 필요해요. 어떻게 접근하면 좋을까요?')}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        AI 전문가 상담받기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 특수교육 지원 제도 가이드 */}
          <TabsContent value="education" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  특수교육 지원 제도 가이드
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  우리 아이에게 맞는 최적의 교육 환경을 찾아보세요
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: '특수교육 대상자 선정', link: 'https://www.sen.go.kr', description: '선정 절차 및 기준 안내' },
                    { title: '개별화교육계획(IEP)', link: 'https://www.sen.go.kr', description: '맞춤형 교육계획 수립' },
                    { title: '통합교육 지원', link: 'https://www.sen.go.kr', description: '일반학교 통합교육 정보' },
                    { title: '특수교육 관련서비스', link: 'https://www.sen.go.kr', description: '치료지원, 보조공학기기 등' },
                    { title: '진로직업교육', link: 'https://www.sen.go.kr', description: '직업교육 및 전환교육' },
                    { title: '특수교육기관 찾기', link: 'https://www.sen.go.kr', description: '지역별 특수교육기관 정보' }
                  ].map((item, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => window.open(item.link, '_blank')}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                          {item.title}
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button className="w-full" size="lg">
                  <FileText className="w-5 h-5 mr-2" />
                  우리 아이 맞춤 교육계획 상담받기
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 치료기관 찾기 */}
          <TabsContent value="therapy" className="space-y-6">
            <TherapyInstitutionSearch />
          </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisabilitySupport;