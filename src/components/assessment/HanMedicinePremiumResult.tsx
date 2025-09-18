import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Crown, Heart, Utensils, Dumbbell, Leaf, Pill, Clock, AlertTriangle, MapPin, Phone, Calendar, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HanMedicinePremiumResultProps {
  result: any;
  onRestart: () => void;
}

export const HanMedicinePremiumResult: React.FC<HanMedicinePremiumResultProps> = ({ 
  result, 
  onRestart 
}) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    generateAnalysis();
  }, [result]);

  const generateAnalysis = async () => {
    try {
      const response = await supabase.functions.invoke('premium-assessment-analyzer', {
        body: {
          answers: result.answers,
          testType: 'han_medicine_premium'
        }
      });

      if (response.error) throw response.error;
      
      setAnalysis(response.data);
    } catch (error) {
      console.error('분석 생성 중 오류:', error);
      toast({
        title: "분석 오류",
        description: "AI 분석 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Crown className="h-12 w-12 text-amber-500 mb-4" />
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-lg font-medium">한의학 전문 분석 결과를 생성하고 있습니다...</p>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            종합적인 체질 분석과 맞춤 처방을 준비 중입니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p>분석 결과를 불러올 수 없습니다.</p>
          <Button onClick={onRestart} className="mt-4">다시 검사하기</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg px-6 py-2">
              <Crown className="h-4 w-4 mr-2" />
              프리미엄 한의학 분석
            </Badge>
          </div>
          <CardTitle className="text-2xl">종합 체질 분석 결과</CardTitle>
          <CardDescription className="text-lg">
            AI 한의학 전문가가 당신만의 맞춤 처방을 제공합니다
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 탭 구성 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">종합</TabsTrigger>
          <TabsTrigger value="constitution">체질</TabsTrigger>
          <TabsTrigger value="organs">오장육부</TabsTrigger>
          <TabsTrigger value="diet">식이요법</TabsTrigger>
          <TabsTrigger value="lifestyle">생활요법</TabsTrigger>
          <TabsTrigger value="treatment">처방</TabsTrigger>
          <TabsTrigger value="consultation">진료예약</TabsTrigger>
        </TabsList>

        {/* 종합 분석 */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                종합 진단
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 rounded-lg">
                <p className="text-lg font-medium mb-4">주요 체질: {analysis.constitution}</p>
                <p className="leading-relaxed whitespace-pre-line">{analysis.overview}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                주의사항
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm leading-relaxed whitespace-pre-line">{analysis.warnings}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 체질 분석 */}
        <TabsContent value="constitution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                AI 체질 성향 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">체질 특성</h4>
                  <div className="space-y-2">
                    {analysis.constitution_details?.characteristics?.map((item: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <span className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">성격적 특징</h4>
                  <div className="space-y-2">
                    {analysis.constitution_details?.personality?.map((item: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 오장육부 분석 */}
        <TabsContent value="organs" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {analysis.organ_analysis && Object.entries(analysis.organ_analysis).map(([organ, data]: [string, any]) => (
              <Card key={organ}>
                <CardHeader>
                  <CardTitle className="text-lg capitalize">{organ} (장부)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">상태</p>
                      <Badge variant={data.status === 'good' ? 'default' : 'secondary'}>
                        {data.status_text}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">관련 증상</p>
                      <div className="space-y-1">
                        {data.symptoms?.map((symptom: string, index: number) => (
                          <div key={index} className="text-sm flex items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 mr-2 flex-shrink-0" />
                            {symptom}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">관리법</p>
                      <p className="text-sm text-muted-foreground">{data.care_method}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 식이요법 */}
        <TabsContent value="diet" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <Utensils className="h-5 w-5 mr-2" />
                  권장 음식
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.diet_recommendations?.recommended?.map((category: any, index: number) => (
                    <div key={index}>
                      <p className="font-medium text-sm mb-2">{category.category}</p>
                      <div className="flex flex-wrap gap-1">
                        {category.foods.map((food: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800">
                            {food}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  피해야 할 음식
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.diet_recommendations?.avoid?.map((category: any, index: number) => (
                    <div key={index}>
                      <p className="font-medium text-sm mb-2">{category.category}</p>
                      <div className="flex flex-wrap gap-1">
                        {category.foods.map((food: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="bg-red-100 text-red-800">
                            {food}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                식습관 가이드
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.diet_recommendations?.guidelines?.map((guideline: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0" />
                    <span className="text-sm">{guideline}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 생활요법 */}
        <TabsContent value="lifestyle" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Dumbbell className="h-5 w-5 mr-2 text-purple-500" />
                  운동 요법
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-sm mb-2">권장 운동</p>
                    <div className="space-y-1">
                      {analysis.lifestyle_recommendations?.exercise?.recommended?.map((exercise: string, index: number) => (
                        <div key={index} className="text-sm flex items-start">
                          <span className="w-2 h-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0" />
                          {exercise}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-2">주의사항</p>
                    <p className="text-sm text-muted-foreground">{analysis.lifestyle_recommendations?.exercise?.precautions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-green-500" />
                  일상 관리
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.lifestyle_recommendations?.daily_care?.map((care: string, index: number) => (
                    <div key={index} className="text-sm flex items-start">
                      <span className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0" />
                      {care}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                계절별 관리법
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {analysis.seasonal_care && Object.entries(analysis.seasonal_care).map(([season, care]: [string, any]) => (
                  <div key={season}>
                    <h4 className="font-medium mb-2 capitalize">{season}</h4>
                    <div className="space-y-1">
                      {care.map((item: string, index: number) => (
                        <div key={index} className="text-sm flex items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 mr-2 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 한방 처방 */}
        <TabsContent value="treatment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="h-5 w-5 mr-2 text-indigo-500" />
                맞춤 한방 처방
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analysis.prescriptions?.map((prescription: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{prescription.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge>{prescription.type}</Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-xs">
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              한약 주문
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>한약 주문하기</DialogTitle>
                              <DialogDescription>
                                {prescription.name} 처방을 가까이한의원에서 조제 받으실 수 있습니다.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">복용 기간 선택</label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="복용 기간을 선택하세요" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1week">1주 (7첩) - 189,000원</SelectItem>
                                    <SelectItem value="2weeks">2주 (14첩) - 356,000원</SelectItem>
                                    <SelectItem value="1month">1개월 (30첩) - 750,000원</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium">배송 주소</label>
                                <Input placeholder="배송받을 주소를 입력하세요" />
                              </div>
                              <div>
                                <label className="text-sm font-medium">연락처</label>
                                <Input placeholder="연락처를 입력하세요" />
                              </div>
                              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
                                주문하기
                              </Button>
                              <p className="text-xs text-muted-foreground text-center">
                                * 한의사 원격 상담 후 최종 처방이 결정됩니다
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{prescription.description}</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-sm mb-2">주요 약재</p>
                        <div className="flex flex-wrap gap-1">
                          {prescription.herbs?.map((herb: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {herb}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">복용법</p>
                        <p className="text-sm text-muted-foreground">{prescription.usage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                혈자리 요법
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {analysis.acupuncture_points?.map((point: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{point.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{point.location}</p>
                    <p className="text-sm"><strong>효과:</strong> {point.effect}</p>
                    <p className="text-sm mt-1"><strong>방법:</strong> {point.method}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 진료 예약 */}
        <TabsContent value="consultation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                가까이한의원 맞춤상담
              </CardTitle>
              <CardDescription>
                체질 분석 결과를 바탕으로 전문 한의사와 상담하고 정확한 처방을 받아보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">가까이한의원</h3>
                      <Badge className="bg-green-100 text-green-800">온라인 진료 가능</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      서울시 중구 명동길 26
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2" />
                      02-1234-5678
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">전문 분야</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary">사상체질</Badge>
                        <Badge variant="secondary">소화기</Badge>
                        <Badge variant="secondary">불면증</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">예약 가능 시간</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-secondary/50 p-2 rounded">오늘 14:00</div>
                        <div className="bg-secondary/50 p-2 rounded">오늘 16:30</div>
                        <div className="bg-secondary/50 p-2 rounded">내일 10:00</div>
                        <div className="bg-secondary/50 p-2 rounded">내일 15:00</div>
                      </div>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => window.open('https://naver.me/xk1XPBhl', '_blank')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      맞춤한방 전화상담받기
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      진료비: 30,000원 (초진) / 20,000원 (재진)
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">가까이한의원 분점</h3>
                      <Badge className="bg-green-100 text-green-800">온라인 진료 가능</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      부산시 해운대구 센텀중앙로 97
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2" />
                      051-9876-5432
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">전문 분야</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary">체질개선</Badge>
                        <Badge variant="secondary">스트레스</Badge>
                        <Badge variant="secondary">피부질환</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">예약 가능 시간</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-secondary/50 p-2 rounded">오늘 13:30</div>
                        <div className="bg-secondary/50 p-2 rounded">오늘 17:00</div>
                        <div className="bg-secondary/50 p-2 rounded">내일 09:30</div>
                        <div className="bg-secondary/50 p-2 rounded">내일 14:30</div>
                      </div>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => window.open('https://naver.me/xk1XPBhl', '_blank')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      맞춤한방 전화상담받기
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      진료비: 35,000원 (초진) / 25,000원 (재진)
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <h3 className="font-semibold text-lg">💫 특별 혜택</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="font-medium">🎁 첫 진료 할인</p>
                        <p className="text-muted-foreground">AIH 사용자 20% 할인</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">🚚 한약 무료배송</p>
                        <p className="text-muted-foreground">전국 어디든 무료배송</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">📱 24시간 상담</p>
                        <p className="text-muted-foreground">카카오톡 무료 상담</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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