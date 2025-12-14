import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Home, TrendingUp, Brain, Heart, Users, Calendar,
  Download, Share2, ChevronRight, Star, AlertTriangle,
  CheckCircle2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginRequiredOverlay from '@/components/auth/LoginRequiredOverlay';
import SEOHead from '@/components/common/SEOHead';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Legend
} from 'recharts';

const monthlyData = [
  { month: '7월', 정서: 65, 인지: 70, 사회성: 60, 신체: 75 },
  { month: '8월', 정서: 68, 인지: 72, 사회성: 65, 신체: 78 },
  { month: '9월', 정서: 72, 인지: 75, 사회성: 70, 신체: 80 },
  { month: '10월', 정서: 75, 인지: 78, 사회성: 72, 신체: 82 },
  { month: '11월', 정서: 78, 인지: 80, 사회성: 76, 신체: 85 },
  { month: '12월', 정서: 82, 인지: 83, 사회성: 80, 신체: 88 },
];

const radarData = [
  { subject: '정서 안정', A: 82, fullMark: 100 },
  { subject: '인지 발달', A: 83, fullMark: 100 },
  { subject: '사회성', A: 80, fullMark: 100 },
  { subject: '언어 발달', A: 78, fullMark: 100 },
  { subject: '신체 발달', A: 88, fullMark: 100 },
  { subject: '창의성', A: 75, fullMark: 100 },
];

const milestones = [
  { id: 1, title: '첫 그림일기 작성', date: '2024-07-15', achieved: true },
  { id: 2, title: '정서 안정도 70점 달성', date: '2024-08-20', achieved: true },
  { id: 3, title: '또래 관계 향상', date: '2024-09-10', achieved: true },
  { id: 4, title: '인지 발달 80점 돌파', date: '2024-11-05', achieved: true },
  { id: 5, title: '종합 점수 85점 목표', date: '2025-01-01', achieved: false },
];

const weeklyActivities = [
  { day: '월', 활동시간: 45, 목표: 60 },
  { day: '화', 활동시간: 60, 목표: 60 },
  { day: '수', 활동시간: 30, 목표: 60 },
  { day: '목', 활동시간: 55, 목표: 60 },
  { day: '금', 활동시간: 70, 목표: 60 },
  { day: '토', 활동시간: 90, 목표: 60 },
  { day: '일', 활동시간: 40, 목표: 60 },
];

export default function GrowthDevelopmentReport() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const overallScore = 83;
  const previousScore = 78;
  const scoreChange = overallScore - previousScore;

  return (
    <>
      <SEOHead 
        title="성장발달 리포트 - AIHPRO | 아동 발달 종합 분석"
        description="아이의 정서, 인지, 사회성 발달을 종합적으로 분석하고 월간/분기별 성장 추이를 확인하세요."
        keywords="성장발달,아동발달,발달검사,정서분석,인지발달,성장리포트,AIHPRO"
        canonicalUrl="https://aihpro.com/growth-report"
      />
      <LoginRequiredOverlay>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <Home className="w-5 h-5 mr-2" />
                홈으로
              </Button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                성장발달 리포트
              </h1>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Profile & Score Summary */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="md:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <CardContent className="py-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 mb-1">2024년 12월 리포트</p>
                      <h2 className="text-3xl font-bold mb-4">김지민 님의 성장 현황</h2>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-5xl font-bold">{overallScore}</div>
                          <p className="text-indigo-100 text-sm">종합 점수</p>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                          scoreChange > 0 ? 'bg-green-400/20' : 'bg-red-400/20'
                        }`}>
                          {scoreChange > 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          <span className="font-bold">{Math.abs(scoreChange)}점</span>
                          <span className="text-sm">지난달 대비</span>
                        </div>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <TrendingUp className="w-24 h-24 opacity-20" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    이번 달 성취
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">정서 안정도 80점 달성!</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">그림일기 12회 완료</span>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">사회성 훈련 권장</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
                <TabsTrigger value="overview">종합</TabsTrigger>
                <TabsTrigger value="trends">추이</TabsTrigger>
                <TabsTrigger value="details">영역별</TabsTrigger>
                <TabsTrigger value="milestones">마일스톤</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Radar Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>발달 영역별 분석</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar
                            name="현재"
                            dataKey="A"
                            stroke="#6366f1"
                            fill="#6366f1"
                            fillOpacity={0.5}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Score Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Heart, title: '정서 발달', score: 82, color: 'text-red-500', bg: 'bg-red-50' },
                      { icon: Brain, title: '인지 발달', score: 83, color: 'text-purple-500', bg: 'bg-purple-50' },
                      { icon: Users, title: '사회성', score: 80, color: 'text-blue-500', bg: 'bg-blue-50' },
                      { icon: TrendingUp, title: '신체 발달', score: 88, color: 'text-green-500', bg: 'bg-green-50' },
                    ].map((item, i) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className={item.bg}>
                          <CardContent className="py-6 text-center">
                            <item.icon className={`w-8 h-8 mx-auto mb-2 ${item.color}`} />
                            <p className="text-sm text-gray-600 mb-1">{item.title}</p>
                            <p className="text-2xl font-bold">{item.score}점</p>
                            <Progress value={item.score} className="mt-2" />
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Weekly Activity */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>주간 활동 현황</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={weeklyActivities}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="활동시간" fill="#6366f1" name="활동 시간(분)" />
                        <Bar dataKey="목표" fill="#e5e7eb" name="목표" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>월별 성장 추이</CardTitle>
                      <div className="flex gap-2">
                        {['monthly', 'quarterly'].map(period => (
                          <Button
                            key={period}
                            variant={selectedPeriod === period ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedPeriod(period)}
                          >
                            {period === 'monthly' ? '월간' : '분기'}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[50, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="정서" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="인지" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="사회성" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="신체" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <div className="space-y-4">
                  {[
                    { 
                      title: '정서 발달', 
                      score: 82, 
                      icon: Heart,
                      color: 'from-red-400 to-pink-500',
                      description: '감정 조절 능력이 향상되었습니다. 스트레스 상황에서도 안정적인 모습을 보입니다.',
                      tips: ['규칙적인 생활 패턴 유지', '감정 표현 격려하기', '안정적인 환경 제공']
                    },
                    { 
                      title: '인지 발달', 
                      score: 83, 
                      icon: Brain,
                      color: 'from-purple-400 to-indigo-500',
                      description: '문제 해결 능력과 논리적 사고가 발달하고 있습니다.',
                      tips: ['퍼즐, 블록 놀이 권장', '질문에 충분히 답변해주기', '다양한 경험 제공']
                    },
                    { 
                      title: '사회성 발달', 
                      score: 80, 
                      icon: Users,
                      color: 'from-blue-400 to-cyan-500',
                      description: '또래와의 상호작용이 점차 원활해지고 있습니다.',
                      tips: ['또래 놀이 기회 늘리기', '협동 활동 참여', '타인 배려 칭찬하기']
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card>
                        <CardContent className="py-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                              <item.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-lg">{item.title}</h3>
                                <span className="text-2xl font-bold">{item.score}점</span>
                              </div>
                              <Progress value={item.score} className="mb-3" />
                              <p className="text-gray-600 mb-3">{item.description}</p>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm font-medium mb-2">💡 발달 촉진 팁</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {item.tips.map((tip, j) => (
                                    <li key={j} className="flex items-center gap-2">
                                      <ChevronRight className="w-3 h-3" />
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="milestones">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      성장 마일스톤
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                      <div className="space-y-6">
                        {milestones.map((milestone, i) => (
                          <motion.div
                            key={milestone.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-4 relative"
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                              milestone.achieved 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-200 text-gray-400'
                            }`}>
                              {milestone.achieved ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                <Star className="w-4 h-4" />
                              )}
                            </div>
                            <div className={`flex-1 pb-6 ${!milestone.achieved && 'opacity-50'}`}>
                              <p className="font-medium">{milestone.title}</p>
                              <p className="text-sm text-gray-500">{milestone.date}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* CTA */}
            <Card className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <CardContent className="py-8 text-center">
                <h3 className="text-2xl font-bold mb-2">전문가와 상담하기</h3>
                <p className="opacity-90 mb-4">리포트를 바탕으로 맞춤형 상담을 받아보세요</p>
                <Button variant="secondary" size="lg" onClick={() => navigate('/experts')}>
                  전문가 연결하기
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </LoginRequiredOverlay>
    </>
  );
}
