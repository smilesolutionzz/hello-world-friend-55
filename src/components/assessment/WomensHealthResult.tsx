import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, MapPin, Phone, Clock, Star, ChevronRight, Activity, TrendingUp, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface WomensHealthResultProps {
  result: any;
  onRestart: () => void;
}

const constitutionData = {
  taeyang: {
    name: '태양인',
    description: '에너지가 넘치고 적극적인 체질',
    color: '#ef4444',
    herbs: ['황기', '인삼', '당귀'],
    diet: ['따뜻한 음식', '견과류', '따뜻한 차'],
    exercise: ['요가', '가벼운 유산소', '명상'],
    caution: ['과로 주의', '스트레스 관리', '충분한 휴식']
  },
  taeeum: {
    name: '태음인',
    description: '안정적이고 차분한 체질',
    color: '#3b82f6',
    herbs: ['숙지황', '산약', '구기자'],
    diet: ['담백한 음식', '채소', '따뜻한 물'],
    exercise: ['산책', '스트레칭', '수영'],
    caution: ['체중 관리', '규칙적인 식사', '적당한 운동']
  },
  soyang: {
    name: '소양인',
    description: '활발하고 열정적인 체질',
    color: '#f59e0b',
    herbs: ['생지황', '맥문동', '오미자'],
    diet: ['시원한 음식', '과일', '녹차'],
    exercise: ['달리기', '에어로빅', '테니스'],
    caution: ['과열 주의', '충분한 수분 섭취', '열성 음식 제한']
  },
  soeum: {
    name: '소음인',
    description: '섬세하고 조용한 체질',
    color: '#10b981',
    herbs: ['건강', '백출', '감초'],
    diet: ['따뜻한 음식', '생강차', '따뜻한 국물'],
    exercise: ['가벼운 운동', '태극권', '실내 운동'],
    caution: ['몸 따뜻하게 유지', '소화 관리', '과도한 운동 금지']
  }
};

const nearbyClinicsMockData = [
  {
    id: 1,
    name: '서울여성한의원',
    rating: 4.8,
    distance: '850m',
    specialties: ['여성질환', '다이어트', '월경불순'],
    address: '서울시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    hours: '09:00-18:00',
    telemedicine: true,
    image: '/api/placeholder/80/80'
  },
  {
    id: 2,
    name: '미소한의원',
    rating: 4.6,
    distance: '1.2km',
    specialties: ['체질개선', '피부미용', '갱년기'],
    address: '서울시 강남구 역삼동 456',
    phone: '02-2345-6789',
    hours: '10:00-19:00',
    telemedicine: true,
    image: '/api/placeholder/80/80'
  },
  {
    id: 3,
    name: '건강한의원',
    rating: 4.9,
    distance: '1.8km',
    specialties: ['불임치료', '산후조리', '호르몬 균형'],
    address: '서울시 서초구 서초대로 789',
    phone: '02-3456-7890',
    hours: '09:30-18:30',
    telemedicine: false,
    image: '/api/placeholder/80/80'
  }
];

export const WomensHealthResult: React.FC<WomensHealthResultProps> = ({ result, onRestart }) => {
  const [selectedTab, setSelectedTab] = useState<'analysis' | 'clinics'>('analysis');
  
  const constitution = constitutionData[result.constitution as keyof typeof constitutionData];
  
  // 체질 점수 데이터 (파이차트용)
  const pieData = Object.entries(result.constitutionScore).map(([key, value]) => ({
    name: constitutionData[key as keyof typeof constitutionData]?.name || key,
    value: Math.max(0, value as number),
    fill: constitutionData[key as keyof typeof constitutionData]?.color || '#8884d8'
  }));

  // 오장육부 균형 데이터 (레이더차트용)
  const radarData = [
    { subject: '간장', score: Math.max(0, Math.min(10, result.scores.liver + 5)) },
    { subject: '심장', score: Math.max(0, Math.min(10, result.scores.heart + 5)) },
    { subject: '비장', score: Math.max(0, Math.min(10, result.scores.spleen + 5)) },
    { subject: '폐장', score: Math.max(0, Math.min(10, result.scores.lung + 5)) },
    { subject: '신장', score: Math.max(0, Math.min(10, result.scores.kidney + 5)) }
  ];

  // 기혈 균형 데이터 (바차트용)
  const barData = [
    { name: '기혈순환', score: Math.max(0, Math.min(10, result.scores.qi + result.scores.blood + 8)) },
    { name: '음양균형', score: Math.max(0, Math.min(10, result.scores.yang + result.scores.yin + 7)) },
    { name: '열한균형', score: Math.max(0, Math.min(10, 10 - Math.abs(result.scores.heat - result.scores.cold))) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-pink-500 mr-3" />
            <h1 className="text-3xl font-bold text-foreground">여성 건강 체질 분석 결과</h1>
          </div>
          <p className="text-lg text-muted-foreground">당신의 체질에 맞는 맞춤 건강 솔루션을 확인하세요</p>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant={selectedTab === 'analysis' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('analysis')}
              className="mr-1"
            >
              <Activity className="h-4 w-4 mr-2" />
              체질 분석
            </Button>
            <Button
              variant={selectedTab === 'clinics' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('clinics')}
            >
              <MapPin className="h-4 w-4 mr-2" />
              근처 한의원
            </Button>
          </div>
        </div>

        {selectedTab === 'analysis' && (
          <>
            {/* 메인 체질 결과 */}
            <Card className="mb-8 border-2" style={{ borderColor: constitution.color }}>
              <CardHeader className="text-center" style={{ backgroundColor: `${constitution.color}10` }}>
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" 
                     style={{ backgroundColor: `${constitution.color}20` }}>
                  <Heart className="h-10 w-10" style={{ color: constitution.color }} />
                </div>
                <CardTitle className="text-2xl mb-2">당신은 <span style={{ color: constitution.color }}>{constitution.name}</span> 체질입니다</CardTitle>
                <p className="text-muted-foreground">{constitution.description}</p>
              </CardHeader>
            </Card>

            {/* 차트 섹션 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* 체질 분포 파이차트 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    체질 분포
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {pieData.map((entry, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: entry.fill }}></div>
                        <span className="text-xs">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 오장육부 균형 레이더차트 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    오장육부 균형
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 10]} />
                      <Radar
                        name="균형도"
                        dataKey="score"
                        stroke={constitution.color}
                        fill={constitution.color}
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 기혈음양 균형 바차트 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    기혈음양 균형
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Bar dataKey="score" fill={constitution.color} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* 맞춤 처방 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">추천 한약재</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {constitution.herbs.map((herb, index) => (
                      <Badge key={index} variant="outline" className="mr-2">
                        {herb}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">권장 식단</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {constitution.diet.map((food, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm">{food}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">추천 운동</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {constitution.exercise.map((ex, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm">{ex}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">주의사항</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {constitution.caution.map((caution, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                        <span className="text-sm">{caution}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {selectedTab === 'clinics' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">가까운 여성 전문 한의원</h2>
              <p className="text-muted-foreground">비대면 처방이 가능한 한의원을 찾아보세요</p>
            </div>

            {nearbyClinicsMockData.map((clinic) => (
              <Card key={clinic.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold">{clinic.name}</h3>
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
                                  비대면 처방
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {clinic.address}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          {clinic.phone}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          {clinic.hours}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {clinic.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex space-x-2">
                        {clinic.telemedicine && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            비대면 상담 예약
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <MapPin className="h-4 w-4 mr-2" />
                          길찾기
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          전화하기
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="text-center mt-8">
          <Button onClick={onRestart} variant="outline" size="lg">
            다시 검사하기
          </Button>
        </div>
      </div>
    </div>
  );
};