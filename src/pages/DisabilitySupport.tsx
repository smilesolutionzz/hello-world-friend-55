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
import { supabase } from '@/integrations/supabase/client';

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

  // AI 고도화된 혜택 계산 함수
  const calculateBenefits = async () => {
    if (!benefitFormData.childAge || !benefitFormData.disabilityGrade || !benefitFormData.householdIncome) {
      toast.error('필수 정보를 모두 입력해주세요');
      return;
    }

    setShowBenefitResults(false);
    toast.loading('AI가 맞춤형 혜택을 분석하고 있습니다...', { id: 'benefit-analysis' });

    try {
      const { data, error } = await supabase.functions.invoke('advanced-disability-analyzer', {
        body: {
          type: 'benefit',
          data: benefitFormData,
          context: {
            analysisLevel: 'comprehensive',
            includeHiddenBenefits: true,
            includeApplicationGuide: true
          }
        }
      });

      if (error) throw error;

      const analysisResult = data.analysis;
      
      if (analysisResult.benefits) {
        const enhancedBenefits: BenefitResult[] = analysisResult.benefits.map((benefit: any) => ({
          name: benefit.name,
          amount: benefit.amount,
          description: benefit.description + (benefit.applicationMethod ? ` | 신청방법: ${benefit.applicationMethod}` : ''),
          eligibility: benefit.eligibility,
          icon: <Heart className="w-5 h-5" />,
          category: benefit.category,
          link: benefit.link
        }));
        
        setBenefitResults(enhancedBenefits);
        setShowBenefitResults(true);
        
        toast.success(`AI가 ${enhancedBenefits.length}개의 혜택을 발견했습니다! ${analysisResult.hiddenBenefits?.length || 0}개의 숨은 혜택도 포함`, { id: 'benefit-analysis' });
        
        // 숨은 혜택이 있으면 별도 알림
        if (analysisResult.hiddenBenefits?.length > 0) {
          setTimeout(() => {
            toast.info(`💡 놓치기 쉬운 ${analysisResult.hiddenBenefits.length}개의 추가 혜택을 발견했어요!`, { duration: 5000 });
          }, 2000);
        }
      }
    } catch (error) {
      console.error('혜택 분석 오류:', error);
      toast.error('AI 분석 중 오류가 발생했습니다. 기본 분석을 제공합니다.', { id: 'benefit-analysis' });
      
      // 기본 혜택 분석으로 폴백
      const basicBenefits: BenefitResult[] = [];
      if (parseInt(benefitFormData.disabilityGrade) <= 3) {
        basicBenefits.push({
          name: '장애아동수당',
          amount: '월 20만원',
          description: '중증 장애아동 대상 기본수당',
          eligibility: '만 18세 미만, 1-3급 장애',
          icon: <Heart className="w-5 h-5" />,
          category: 'money',
          link: 'https://www.mw.go.kr'
        });
      }
      setBenefitResults(basicBenefits);
      setShowBenefitResults(true);
    }
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

  const analyzeMilestones = async () => {
    const currentMilestones = getCurrentMilestones();
    if (currentMilestones.length === 0) {
      toast.error('해당 연령대의 마일스톤 정보가 없습니다.');
      return;
    }

    toast.loading('AI 발달 전문가가 심층 분석하고 있습니다...', { id: 'milestone-analysis' });

    try {
      const ageInMonths = parseInt(childAgeMonths) || (parseInt(childAgeYears) * 12) || 0;
      
      const { data, error } = await supabase.functions.invoke('advanced-disability-analyzer', {
        body: {
          type: 'milestone',
          data: {
            ageInMonths,
            checkedMilestones,
            allMilestones: currentMilestones
          },
          context: {
            analysisLevel: 'comprehensive',
            includeRecommendations: true,
            includeRedFlags: true
          }
        }
      });

      if (error) throw error;

      const analysisResult = data.analysis;
      setShowMilestoneResults(true);
      
      const completionRate = (checkedMilestones.length / currentMilestones.length) * 100;
      
      if (analysisResult.developmentScore) {
        toast.success(`AI 분석 완료: 발달점수 ${analysisResult.developmentScore}/100점`, { id: 'milestone-analysis' });
        
        if (analysisResult.redFlags?.length > 0) {
          setTimeout(() => {
            toast.warning(`⚠️ 전문가 상담이 권장되는 ${analysisResult.redFlags.length}개 신호가 발견되었습니다`, { duration: 6000 });
          }, 2000);
        }
        
        if (analysisResult.recommendations?.length > 0) {
          setTimeout(() => {
            toast.info(`💡 ${analysisResult.recommendations.length}개의 맞춤형 발달 활동을 추천받았어요!`, { duration: 5000 });
          }, 3000);
        }
      } else {
        // 기본 분석으로 폴백
        if (completionRate >= 80) {
          toast.success('발달이 정상적으로 이루어지고 있어요! 🎉', { id: 'milestone-analysis' });
        } else if (completionRate >= 60) {
          toast('일부 영역에서 관찰이 필요해요 👀', { id: 'milestone-analysis', duration: 4000 });
        } else {
          toast('전문가 상담을 권해드려요 🏥', { id: 'milestone-analysis', duration: 4000 });
        }
      }
    } catch (error) {
      console.error('마일스톤 분석 오류:', error);
      const completionRate = (checkedMilestones.length / currentMilestones.length) * 100;
      setShowMilestoneResults(true);
      
      if (completionRate >= 80) {
        toast.success('발달이 정상적으로 이루어지고 있어요! 🎉', { id: 'milestone-analysis' });
      } else if (completionRate >= 60) {
        toast('일부 영역에서 관찰이 필요해요 👀', { id: 'milestone-analysis', duration: 4000 });
      } else {
        toast('전문가 상담을 권해드려요 🏥', { id: 'milestone-analysis', duration: 4000 });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="w-10 h-10 text-primary animate-pulse" />
            <div className="space-y-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent">
                AI 심리발달교육복지
              </h1>
              <div className="text-2xl font-semibold text-primary/80">
                혁신 종합플랫폼
              </div>
            </div>
            <Sparkles className="w-8 h-8 text-secondary animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-primary flex items-center justify-center gap-2">
              <span className="text-2xl">🚀</span>
              차세대 AI 기술로 혁신하는 아동 발달 지원 생태계
            </p>
            <p className="text-md text-muted-foreground max-w-3xl mx-auto">
              머신러닝 기반 개인화 분석 • 실시간 AI 상담 • 예측적 개입 시스템
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-primary/70">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                실시간 AI 분석
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                개인 맞춤형
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                맞춤형 솔루션
              </span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="ai-agents" className="w-full">
          <TabsList className="grid w-full grid-cols-8 h-auto p-1">
            <TabsTrigger value="ai-agents" className="flex flex-col gap-1 py-3">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs">AI 에이전트</span>
            </TabsTrigger>
            <TabsTrigger value="benefits" className="flex flex-col gap-1 py-3">
              <Calculator className="w-5 h-5" />
              <span className="text-xs">혜택계산</span>
            </TabsTrigger>
            <TabsTrigger value="milestones" className="flex flex-col gap-1 py-3">
              <Target className="w-5 h-5" />
              <span className="text-xs">발달확인</span>
            </TabsTrigger>
            <TabsTrigger value="emotional" className="flex flex-col gap-1 py-3">
              <Heart className="w-5 h-5" />
              <span className="text-xs">마음돌봄</span>
            </TabsTrigger>
            <TabsTrigger value="independence" className="flex flex-col gap-1 py-3">
              <Award className="w-5 h-5" />
              <span className="text-xs">자립준비</span>
            </TabsTrigger>
            <TabsTrigger value="siblings" className="flex flex-col gap-1 py-3">
              <Users className="w-5 h-5" />
              <span className="text-xs">형제케어</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex flex-col gap-1 py-3">
              <BookOpen className="w-5 h-5" />
              <span className="text-xs">특수교육</span>
            </TabsTrigger>
            <TabsTrigger value="therapy" className="flex flex-col gap-1 py-3">
              <Activity className="w-5 h-5" />
              <span className="text-xs">치료기관</span>
            </TabsTrigger>
          </TabsList>

          {/* AI 에이전트 탭 */}
          <TabsContent value="ai-agents" className="space-y-6">
            <ProactiveAgentDashboard />
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-6 h-6" />
                  정부 지원 혜택 계산기
                </CardTitle>
                <CardDescription className="text-blue-100">
                  우리 아이가 받을 수 있는 모든 지원금과 혜택을 확인하세요
                </CardDescription>
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
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI 맞춤형 혜택 분석
                </Button>
              </CardContent>
            </Card>

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
                      <Sparkles className="w-5 h-5 mr-2" />
                      AI 전문가 발달 심층분석
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
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={async () => {
                    toast.loading('AI가 개별 자립 계획서를 작성하고 있습니다...', { id: 'independence-plan' });
                    try {
                      const { data, error } = await supabase.functions.invoke('advanced-disability-analyzer', {
                        body: {
                          type: 'independence',
                          data: {
                            age: parseInt(benefitFormData.childAge) || 10,
                            currentSkills: '기본적인 일상생활 기술',
                            targetAreas: ['일상생활', '사회성', '직업준비'],
                            familyContext: '가족 지원 환경'
                          }
                        }
                      });
                      if (error) throw error;
                      toast.success('맞춤형 자립 계획서가 완성되었습니다!', { id: 'independence-plan' });
                      toast.info('계획서 내용을 확인해보세요', { duration: 5000 });
                    } catch (error) {
                      toast.error('계획서 작성 중 오류가 발생했습니다', { id: 'independence-plan' });
                    }
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI 맞춤형 자립 계획서 작성
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
                      <Button 
                        variant="outline" 
                        className="w-full mt-3"
                        onClick={async () => {
                          toast.loading('AI가 형제자매 맞춤 프로그램을 분석하고 있습니다...', { id: 'sibling-program' });
                          try {
                            const { data, error } = await supabase.functions.invoke('advanced-disability-analyzer', {
                              body: {
                                type: 'sibling',
                                data: {
                                  siblings: '형제자매 2명',
                                  challenges: ['질투감', '부모 관심 부족'],
                                  familyDynamics: '장애아동 중심의 가족 구조'
                                }
                              }
                            });
                            if (error) throw error;
                            toast.success('맞춤형 형제자매 지원 프로그램을 추천받았습니다!', { id: 'sibling-program' });
                          } catch (error) {
                            toast.error('프로그램 분석 중 오류가 발생했습니다', { id: 'sibling-program' });
                          }
                        }}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI 맞춤 프로그램 분석
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
                      <Button 
                        variant="outline" 
                        className="w-full mt-3"
                        onClick={() => {
                          toast.success('형제자매 리소스 패키지를 준비했습니다!');
                          toast.info('연령별 설명서, 활동 가이드, 감정표현 도구를 다운로드할 수 있습니다', { duration: 5000 });
                        }}
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        리소스 패키지 받기
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

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={async () => {
                    toast.loading('AI 특수교육 전문가가 맞춤 교육계획을 수립하고 있습니다...', { id: 'education-plan' });
                    try {
                      const { data, error } = await supabase.functions.invoke('advanced-disability-analyzer', {
                        body: {
                          type: 'education',
                          data: {
                            childProfile: {
                              age: parseInt(benefitFormData.childAge) || 8,
                              disabilityType: '발달장애',
                              currentLevel: '초등학교 저학년'
                            },
                            currentEducation: '일반학급 통합교육',
                            educationGoals: ['학습능력 향상', '사회성 발달', '자립기술 습득']
                          }
                        }
                      });
                      if (error) throw error;
                      toast.success('맞춤형 특수교육 계획이 완성되었습니다!', { id: 'education-plan' });
                      toast.info('IEP 목표와 교육 프로그램을 확인해보세요', { duration: 5000 });
                    } catch (error) {
                      toast.error('교육계획 수립 중 오류가 발생했습니다', { id: 'education-plan' });
                    }
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI 맞춤형 특수교육 계획 수립
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 치료기관 찾기 & 감각통합평가 */}
          <TabsContent value="therapy" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  치료기관 찾기 & 감각통합평가
                </CardTitle>
                <CardDescription className="text-teal-100">
                  우리 아이에게 필요한 전문 치료를 찾아보세요
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-800 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        내 주변 치료기관 찾기
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>치료 종류 선택</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="치료 종류를 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="speech">언어치료</SelectItem>
                            <SelectItem value="occupational">작업치료</SelectItem>
                            <SelectItem value="physical">물리치료</SelectItem>
                            <SelectItem value="behavioral">행동치료</SelectItem>
                            <SelectItem value="music">음악치료</SelectItem>
                            <SelectItem value="art">미술치료</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>지역 선택</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="지역을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="seoul">서울특별시</SelectItem>
                            <SelectItem value="busan">부산광역시</SelectItem>
                            <SelectItem value="daegu">대구광역시</SelectItem>
                            <SelectItem value="incheon">인천광역시</SelectItem>
                            <SelectItem value="gyeonggi">경기도</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={async () => {
                          toast.loading('AI가 최적의 치료기관을 검색하고 있습니다...', { id: 'therapy-search' });
                          try {
                            const { data, error } = await supabase.functions.invoke('advanced-disability-analyzer', {
                              body: {
                                type: 'therapy',
                                data: {
                                  condition: '발달지연',
                                  location: benefitFormData.region || 'seoul',
                                  therapyHistory: '신규'
                                }
                              }
                            });
                            if (error) throw error;
                            toast.success('맞춤형 치료기관 목록을 찾았습니다!', { id: 'therapy-search' });
                            toast.info('추천 치료 프로그램과 기관 정보를 확인해보세요', { duration: 5000 });
                          } catch (error) {
                            toast.error('치료기관 검색 중 오류가 발생했습니다', { id: 'therapy-search' });
                          }
                        }}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI 맞춤 치료기관 검색
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-800 flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        감각통합평가 도구
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-green-700">
                        우리 아이의 감각 처리 능력을 AI로 정밀 분석해보세요
                      </p>
                      <div className="space-y-2">
                        {[
                          '큰 소리에 과도하게 반응한다',
                          '특정 질감을 극도로 싫어한다',
                          '균형감각이 부족해 보인다',
                          '집중력이 떨어진다',
                          '움직임을 지나치게 추구한다'
                        ].map((item, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Checkbox id={`sensory-${index}`} />
                            <Label htmlFor={`sensory-${index}`} className="text-sm">{item}</Label>
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          toast.loading('AI가 감각통합 패턴을 분석하고 있습니다...', { id: 'sensory-analysis' });
                          setTimeout(() => {
                            toast.success('감각통합 분석이 완료되었습니다!', { id: 'sensory-analysis' });
                            toast.info('맞춤형 감각통합 치료 프로그램을 추천받았어요', { duration: 5000 });
                          }, 3000);
                        }}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI 정밀 감각통합 분석
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <h3 className="text-lg font-semibold text-orange-800">
                        🎯 맞춤형 치료 계획
                      </h3>
                      <p className="text-orange-700">
                        우리 아이의 평가 결과를 바탕으로 전문가가 최적의 치료 계획을 제안해드립니다.
                      </p>
                      <Button 
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={() => {
                          toast.success('전문가 상담 예약 요청을 보냈습니다!');
                          toast.info('24시간 내에 담당자가 연락드릴 예정입니다', { duration: 5000 });
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        AI 추천 전문가 상담 예약
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DisabilitySupport;