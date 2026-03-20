import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, MapPin, Phone, Clock, Star, ChevronRight, Pill, Utensils, Activity, Shield, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface EnhancedConstitutionResultProps {
  result: any;
  onRestart: () => void;
}

const constitutionColors = {
  soyang: '#ef4444', // 빨강
  soeum: '#10b981',  // 녹색
  taeyang: '#f59e0b', // 주황
  taeeum: '#3b82f6'   // 파랑
};

export const EnhancedConstitutionResult: React.FC<EnhancedConstitutionResultProps> = ({ result, onRestart }) => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'analysis' | 'prescription' | 'lifestyle' | 'clinics'>('analysis');
  
  const analysis = result.analysis || {};
  const constitution = result.constitution;
  const constitutionName = result.constitution_name || '체질';
  const color = constitutionColors[constitution as keyof typeof constitutionColors] || '#6b7280';

  // 체질 점수 데이터 (파이차트용)
  const pieData = [
    { name: '소양인', value: result.scores?.soyang || 0, fill: constitutionColors.soyang },
    { name: '소음인', value: result.scores?.soeum || 0, fill: constitutionColors.soeum },
    { name: '태양인', value: result.scores?.taeyang || 0, fill: constitutionColors.taeyang },
    { name: '태음인', value: result.scores?.taeeum || 0, fill: constitutionColors.taeeum }
  ].filter(item => item.value > 0);

  // 체질별 특성 레이더차트용 데이터
  const radarData = [
    { subject: '활동성', score: constitution === 'soyang' ? 9 : constitution === 'taeyang' ? 8 : constitution === 'soeum' ? 4 : 6 },
    { subject: '소화력', score: constitution === 'taeeum' ? 9 : constitution === 'soyang' ? 7 : constitution === 'taeyang' ? 6 : 4 },
    { subject: '체력', score: constitution === 'taeeum' ? 8 : constitution === 'taeyang' ? 9 : constitution === 'soyang' ? 6 : 5 },
    { subject: '면역력', score: constitution === 'soeum' ? 8 : constitution === 'taeyang' ? 7 : constitution === 'taeeum' ? 8 : 6 },
    { subject: '정신력', score: constitution === 'soeum' ? 9 : constitution === 'taeyang' ? 8 : constitution === 'soyang' ? 7 : 6 }
  ];

  const strengthWeaknessData = [
    { name: '장점', value: analysis.characteristics?.strengths?.length || 3, fill: '#22c55e' },
    { name: '주의점', value: analysis.characteristics?.weaknesses?.length || 3, fill: '#ef4444' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mr-4" 
                 style={{ backgroundColor: `${color}20`, border: `2px solid ${color}` }}>
              <Heart className="h-8 w-8" style={{ color }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI 체질 분석 결과</h1>
              <p className="text-lg text-muted-foreground">당신은 <span className="font-bold" style={{ color }}>{constitutionName}</span> 체질입니다</p>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis" className="flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              체질 분석
            </TabsTrigger>
            <TabsTrigger value="prescription" className="flex items-center">
              <Pill className="h-4 w-4 mr-2" />
              한약 처방
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              생활 관리
            </TabsTrigger>
            <TabsTrigger value="clinics" className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              제휴 한의원
            </TabsTrigger>
          </TabsList>

          {/* 체질 분석 탭 */}
          <TabsContent value="analysis" className="space-y-6">
            {/* 체질 분석 결과 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" style={{ color }} />
                  상세 체질 분석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed mb-6">
                  {analysis.constitution_analysis || "체질 분석 결과를 표시합니다."}
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* 체질 분포 차트 */}
                  <div>
                    <h4 className="font-semibold mb-4">체질 분포</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 체질별 특성 레이더차트 */}
                  <div>
                    <h4 className="font-semibold mb-4">체질별 특성</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={90} domain={[0, 10]} />
                        <Radar
                          name="점수"
                          dataKey="score"
                          stroke={color}
                          fill={color}
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 장단점 분석 */}
                  <div>
                    <h4 className="font-semibold mb-4">특성 분석</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={strengthWeaknessData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 장단점 */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">🌟 체질의 장점</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.characteristics?.strengths?.map((strength: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span>{strength}</span>
                      </div>
                    )) || <p>체질별 장점을 분석 중입니다.</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">⚠️ 주의사항</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.characteristics?.weaknesses?.map((weakness: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        <span>{weakness}</span>
                      </div>
                    )) || <p>체질별 주의사항을 분석 중입니다.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 한약 처방 탭 */}
          <TabsContent value="prescription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Pill className="h-5 w-5 mr-2 text-green-600" />
                  맞춤 한약 처방
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">처방명: {analysis.herbal_prescription?.formula_name || "맞춤 처방"}</h4>
                    <p className="text-muted-foreground mb-4">
                      {analysis.herbal_prescription?.preparation_method || "전문 한의사 상담 후 조제"}
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <h4 className="font-semibold">주요 약재</h4>
                    {analysis.herbal_prescription?.main_herbs?.map((herb: any, index: number) => (
                      <Card key={index} className="border-l-4 border-green-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{herb.name}</h5>
                              <p className="text-sm text-muted-foreground mt-1">{herb.effect}</p>
                            </div>
                            <Badge variant="outline">{herb.dosage}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )) || (
                      <p className="text-muted-foreground">전문 한의사와 상담하여 정확한 처방을 받으세요.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 식이요법 */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <Utensils className="h-5 w-5 mr-2" />
                    좋은 음식
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.diet_therapy?.beneficial_foods?.map((food: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span>{food}</span>
                      </div>
                    )) || <p>체질에 맞는 음식을 분석 중입니다.</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <Shield className="h-5 w-5 mr-2" />
                    피해야 할 음식
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.diet_therapy?.foods_to_avoid?.map((food: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                        <span>{food}</span>
                      </div>
                    )) || <p>피해야 할 음식을 분석 중입니다.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 생활 관리 탭 */}
          <TabsContent value="lifestyle" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    운동 관리
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{analysis.lifestyle_recommendations?.exercise || "체질에 맞는 운동법을 분석 중입니다."}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    수면 관리
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{analysis.lifestyle_recommendations?.sleep || "수면 관리법을 분석 중입니다."}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    스트레스 관리
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{analysis.lifestyle_recommendations?.stress_management || "스트레스 관리법을 분석 중입니다."}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    계절별 관리
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{analysis.lifestyle_recommendations?.seasonal_care || "계절별 건강관리법을 분석 중입니다."}</p>
                </CardContent>
              </Card>
            </div>

            {/* 건강 관리 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  건강 관리 포인트
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-2">취약 질환</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.health_management?.vulnerable_conditions?.map((condition: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-orange-300">
                          {condition}
                        </Badge>
                      )) || <p>취약 질환을 분석 중입니다.</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">예방 방법</h4>
                    <div className="space-y-1">
                      {analysis.health_management?.prevention_methods?.map((method: string, index: number) => (
                        <div key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span>{method}</span>
                        </div>
                      )) || <p>예방 방법을 분석 중입니다.</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 제휴 한의원 탭 */}
          <TabsContent value="clinics" className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">가까운 제휴 한의원</h3>
              <p className="text-muted-foreground">체질에 맞는 전문 치료를 받아보세요</p>
            </div>

            {result.partner_clinics?.map((clinic: any, index: number) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-xl font-semibold">{clinic.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm ml-1">{clinic.rating}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{clinic.distance}</span>
                            {clinic.telemedicine && (
                              <>
                                <span className="text-sm text-muted-foreground">•</span>
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  비대면 진료
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {clinic.specialties?.map((specialty: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {clinic.telemedicine && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Heart className="h-4 w-4 mr-2" />
                            비대면 상담 예약
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          {clinic.phone}
                        </Button>
                        <Button variant="outline" size="sm">
                          <MapPin className="h-4 w-4 mr-2" />
                          길찾기
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <Card>
                <CardContent className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">제휴 한의원 정보를 불러오는 중입니다...</p>
                </CardContent>
              </Card>
            )}

            {/* 전문 상담 권장 */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">전문 한의사 상담 권장</h4>
                <p className="text-muted-foreground mb-4">
                  {analysis.clinic_recommendation || "더 정확한 체질 진단과 맞춤 처방을 위해 전문 한의사와 상담하시기 바랍니다."}
                </p>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Phone className="h-5 w-5 mr-2" />
                  무료 전화 상담 신청
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 액션 버튼 */}
        <div className="text-center mt-8 space-y-4">
          {/* 가까이한의원 비대면 진료 CTA */}
          <Card className="overflow-hidden border-2 mb-6" style={{ borderColor: "hsl(var(--herbal-primary))", background: "linear-gradient(135deg, hsl(var(--herbal-bg)), hsl(var(--herbal-bg-warm)))" }}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-primary)), hsl(var(--herbal-primary-light)))" }}>
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>
                      가까이한의원 비대면 진료
                    </h3>
                  </div>
                  <p className="text-base mb-2" style={{ color: "hsl(var(--herbal-secondary))" }}>
                    체질 분석 결과를 바탕으로 전문 한의사와 1:1 맞춤 상담을 받아보세요
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm" style={{ color: "hsl(var(--herbal-text-dark))" }}>
                    <Clock className="h-4 w-4" />
                    <span>평일 09:00-18:00 | 토요일 09:00-15:00</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <Button 
                    onClick={() => window.open('tel:01066249990')}
                    size="lg"
                    className="text-white text-lg font-bold py-6 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all w-full md:w-auto"
                    style={{ 
                      background: "linear-gradient(135deg, hsl(var(--herbal-primary)), hsl(var(--herbal-primary-light)))",
                      fontFamily: "'Noto Serif KR', serif"
                    }}
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    전화 상담 신청 (010-6624-9990)
                  </Button>
                  <p className="text-xs text-center" style={{ color: "hsl(var(--herbal-secondary))" }}>
                    ✓ 체질 맞춤 처방 | ✓ 건강보험 적용 | ✓ 비대면 진료 가능
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button onClick={onRestart} variant="outline" size="lg">
              다시 검사하기
            </Button>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <Heart className="h-5 w-5 mr-2" />
              결과 저장하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};