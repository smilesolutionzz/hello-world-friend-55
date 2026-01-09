import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  FileText,
  Users,
  Brain,
  Video,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Download,
  Calendar,
  Target,
  Award,
  Zap,
  Gift,
  Calculator
} from 'lucide-react';

interface InstitutionValueDashboardProps {
  institutionId?: string;
  institutionType?: 'developmental' | 'counseling' | 'kindergarten' | 'special_school';
}

export function InstitutionValueDashboard({ 
  institutionId, 
  institutionType = 'developmental' 
}: InstitutionValueDashboardProps) {
  const navigate = useNavigate();
  
  // 실제 데이터 시뮬레이션 (Supabase 연동 시 교체)
  const [stats, setStats] = useState({
    // 비용 절감
    testCostSaved: 2340000, // 외부 심리검사 대비 절감액
    reportTimeSaved: 48, // 시간 (주당)
    adminTimeSaved: 12, // 시간 (주당)
    
    // 이용 현황
    totalMembers: 47,
    activeMembers: 38,
    totalTests: 156,
    totalObservations: 89,
    totalReports: 34,
    
    // 성과 지표
    earlyDetectionRate: 23, // 조기 발견율 (%)
    parentSatisfaction: 94, // 학부모 만족도 (%)
    treatmentProgressRate: 67, // 치료 진전율 (%)
    
    // 이번 달
    thisMonthTests: 28,
    thisMonthReports: 12,
    thisMonthNewMembers: 5
  });

  // 기관 유형별 가치 제안
  const valueByType = {
    developmental: {
      title: '발달센터',
      mainValue: '치료 효과 객관화',
      keyMetrics: [
        { label: '치료 전후 변화 추적', value: '156건', icon: TrendingUp, color: 'text-green-600' },
        { label: 'AI 영상 분석', value: '89건', icon: Video, color: 'text-blue-600' },
        { label: '바우처 리포트 생성', value: '34건', icon: FileText, color: 'text-purple-600' },
        { label: '부모 상담 자료', value: '자동생성', icon: Users, color: 'text-orange-600' }
      ],
      costComparison: {
        before: { label: '외부 검사 의뢰', cost: 50000, unit: '건당' },
        after: { label: 'AIHPRO 이용', cost: 0, unit: '무제한' }
      }
    },
    counseling: {
      title: '상담센터',
      mainValue: '상담 효율 극대화',
      keyMetrics: [
        { label: '심리검사 완료', value: '156건', icon: Brain, color: 'text-purple-600' },
        { label: 'AI 사전 스크리닝', value: '47명', icon: Sparkles, color: 'text-blue-600' },
        { label: '상담 효과 측정', value: '89건', icon: BarChart3, color: 'text-green-600' },
        { label: '자동 분석 리포트', value: '34건', icon: FileText, color: 'text-orange-600' }
      ],
      costComparison: {
        before: { label: '심리검사 키트 구매', cost: 35000, unit: '건당' },
        after: { label: 'AIHPRO 이용', cost: 0, unit: '무제한' }
      }
    },
    kindergarten: {
      title: '어린이집/유치원',
      mainValue: '발달 지연 조기 발견',
      keyMetrics: [
        { label: '발달 체크 완료', value: '156건', icon: CheckCircle, color: 'text-green-600' },
        { label: '조기 발견 케이스', value: '11건', icon: AlertTriangle, color: 'text-orange-600' },
        { label: '학부모 리포트', value: '34건', icon: FileText, color: 'text-blue-600' },
        { label: '전문기관 연계', value: '7건', icon: Users, color: 'text-purple-600' }
      ],
      costComparison: {
        before: { label: '외부 발달검사', cost: 80000, unit: '아동당' },
        after: { label: 'AIHPRO 이용', cost: 0, unit: '무제한' }
      }
    },
    special_school: {
      title: '특수학교',
      mainValue: 'IEP 수립 지원',
      keyMetrics: [
        { label: 'IEP 자료 생성', value: '47건', icon: Target, color: 'text-purple-600' },
        { label: '행동 변화 추적', value: '89건', icon: TrendingUp, color: 'text-green-600' },
        { label: '학부모 소통 자료', value: '34건', icon: FileText, color: 'text-blue-600' },
        { label: '중재 효과 문서화', value: '28건', icon: Award, color: 'text-orange-600' }
      ],
      costComparison: {
        before: { label: '전문 평가 의뢰', cost: 120000, unit: '학생당' },
        after: { label: 'AIHPRO 이용', cost: 0, unit: '무제한' }
      }
    }
  };

  const currentValue = valueByType[institutionType];

  // ROI 계산
  const calculateROI = () => {
    const testsPerMonth = stats.thisMonthTests;
    const costPerExternalTest = currentValue.costComparison.before.cost;
    const monthlySavings = testsPerMonth * costPerExternalTest;
    const yearlyProjection = monthlySavings * 12;
    const timeSavingsValue = (stats.reportTimeSaved + stats.adminTimeSaved) * 4 * 25000; // 시급 2.5만원 기준
    
    return {
      monthlySavings,
      yearlyProjection,
      timeSavingsValue,
      totalValue: monthlySavings + timeSavingsValue
    };
  };

  const roi = calculateROI();

  return (
    <div className="space-y-6">
      {/* 핵심 가치 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <Badge className="bg-white/20 text-white mb-2">{currentValue.title} 전용</Badge>
            <h2 className="text-2xl font-bold mb-1">
              AIHPRO로 {currentValue.mainValue}
            </h2>
            <p className="text-white/80">
              이번 달 절감 효과: <span className="font-bold text-xl">₩{roi.totalValue.toLocaleString()}</span>
            </p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-4xl font-bold">{stats.totalMembers}</div>
            <div className="text-white/80">등록 아동/내담자</div>
          </div>
        </div>
      </div>

      {/* 비용 절감 비교 - 가장 중요! */}
      <Card className="border-2 border-green-200 bg-green-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            <CardTitle className="text-green-800">💰 비용 절감 효과</CardTitle>
          </div>
          <CardDescription>외부 서비스 이용 대비 절감액</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Before vs After */}
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <TrendingDown className="w-4 h-4" />
                  <span className="font-semibold">기존 방식</span>
                </div>
                <div className="text-2xl font-bold text-red-700">
                  ₩{currentValue.costComparison.before.cost.toLocaleString()}
                </div>
                <div className="text-sm text-red-600">
                  {currentValue.costComparison.before.label} ({currentValue.costComparison.before.unit})
                </div>
              </div>
              
              <div className="p-4 bg-green-100 rounded-lg border border-green-300">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-semibold">AIHPRO 이용 시</span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  ₩{currentValue.costComparison.after.cost.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">
                  {currentValue.costComparison.after.label} ({currentValue.costComparison.after.unit})
                </div>
              </div>
            </div>

            {/* 월간 절감 */}
            <div className="p-4 bg-white rounded-lg border-2 border-green-300 text-center flex flex-col justify-center">
              <div className="text-sm text-gray-600 mb-1">이번 달 절감액</div>
              <div className="text-3xl font-bold text-green-600">
                ₩{roi.monthlySavings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                ({stats.thisMonthTests}건 × ₩{currentValue.costComparison.before.cost.toLocaleString()})
              </div>
            </div>

            {/* 연간 예상 */}
            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg text-white text-center flex flex-col justify-center">
              <div className="text-sm opacity-90 mb-1">연간 예상 절감액</div>
              <div className="text-3xl font-bold">
                ₩{roi.yearlyProjection.toLocaleString()}
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Gift className="w-4 h-4" />
                <span className="text-sm">구독료 대비 {Math.round(roi.yearlyProjection / (99000 * 12) * 100)}% 이득</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 시간 절감 효과 */}
      <Card className="border-2 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-blue-800">⏱️ 시간 절감 효과</CardTitle>
          </div>
          <CardDescription>자동화로 절약되는 업무 시간</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-lg text-center">
              <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{stats.reportTimeSaved}시간</div>
              <div className="text-sm text-gray-600">리포트 작성 시간</div>
              <div className="text-xs text-gray-400">주당 절감</div>
            </div>
            <div className="p-4 bg-white rounded-lg text-center">
              <Calculator className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{stats.adminTimeSaved}시간</div>
              <div className="text-sm text-gray-600">행정 업무 시간</div>
              <div className="text-xs text-gray-400">주당 절감</div>
            </div>
            <div className="p-4 bg-white rounded-lg text-center">
              <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{(stats.reportTimeSaved + stats.adminTimeSaved) * 4}시간</div>
              <div className="text-sm text-gray-600">월간 총 절감</div>
              <div className="text-xs text-gray-400">{Math.round((stats.reportTimeSaved + stats.adminTimeSaved) * 4 / 8)}일치</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <div className="text-2xl font-bold">₩{roi.timeSavingsValue.toLocaleString()}</div>
              <div className="text-sm opacity-90">인건비 환산 가치</div>
              <div className="text-xs opacity-75">월간</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 핵심 기능 사용 현황 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              이번 달 활용 현황
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentValue.keyMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white ${metric.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{metric.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3">
                    {metric.value}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              성과 지표
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">조기 발견율</span>
                <span className="text-sm text-green-600 font-bold">{stats.earlyDetectionRate}%</span>
              </div>
              <Progress value={stats.earlyDetectionRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                전체 아동 중 조기 발견/연계 비율
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">학부모 만족도</span>
                <span className="text-sm text-blue-600 font-bold">{stats.parentSatisfaction}%</span>
              </div>
              <Progress value={stats.parentSatisfaction} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                리포트 제공 학부모 만족도 조사
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">치료/상담 진전율</span>
                <span className="text-sm text-purple-600 font-bold">{stats.treatmentProgressRate}%</span>
              </div>
              <Progress value={stats.treatmentProgressRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                AI 분석 기준 개선 추이 보이는 비율
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 지금 바로 활용하기</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/observation')}
            >
              <Video className="w-6 h-6 text-blue-600" />
              <span>AI 영상 분석</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/assessment')}
            >
              <Brain className="w-6 h-6 text-purple-600" />
              <span>심리검사 실시</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/report-generator')}
            >
              <FileText className="w-6 h-6 text-green-600" />
              <span>리포트 생성</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/iep-generator')}
            >
              <Target className="w-6 h-6 text-orange-600" />
              <span>IEP 자료 생성</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 업그레이드 유도 (무료 플랜인 경우) */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">🎁 프로 플랜으로 업그레이드</h3>
              <p className="text-gray-600 text-sm">
                무제한 AI 분석, 바우처 연동, 우선 노출 등 더 많은 혜택을 누리세요
              </p>
            </div>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate('/partner-benefits')}
            >
              플랜 보기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InstitutionValueDashboard;
