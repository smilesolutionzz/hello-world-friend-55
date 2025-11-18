import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  AlertTriangle, 
  Heart, 
  Users, 
  Home, 
  Brain,
  Clock,
  Target
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface SCTVisualizationProps {
  results: {
    totalScore: number;
    averageScore: number;
    sentimentDistribution: {
      positive: number;
      negative: number;
      neutral: number;
      concern: number;
    };
    categoryAverages: Array<{ category: string; average: number }>;
    topKeywords: Array<{ keyword: string; count: number }>;
    severity: 'low' | 'medium' | 'high' | 'critical';
    totalResponses: number;
    concernResponses: any[];
  };
  ageGroup: string;
}

const COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280',
  concern: '#dc2626'
};

const CATEGORY_ICONS: Record<string, any> = {
  self: Brain,
  family: Home,
  social: Users,
  emotion: Heart,
  future: Target,
  past: Clock
};

const CATEGORY_LABELS: Record<string, string> = {
  self: '자아',
  family: '가족',
  social: '사회',
  emotion: '감정',
  future: '미래',
  past: '과거'
};

export const SCTVisualization = ({ results, ageGroup }: SCTVisualizationProps) => {
  // 레이더 차트 데이터
  const radarData = results.categoryAverages.map(cat => ({
    category: CATEGORY_LABELS[cat.category] || cat.category,
    score: cat.average,
    fullMark: 10
  }));

  // 파이 차트 데이터
  const pieData = [
    { name: '긍정', value: results.sentimentDistribution.positive, color: COLORS.positive },
    { name: '부정', value: results.sentimentDistribution.negative, color: COLORS.negative },
    { name: '중립', value: results.sentimentDistribution.neutral, color: COLORS.neutral },
    { name: '우려', value: results.sentimentDistribution.concern, color: COLORS.concern }
  ];

  // 키워드 바 차트 데이터
  const keywordData = results.topKeywords.map(k => ({
    keyword: k.keyword,
    count: k.count
  }));

  const getSeverityBadge = () => {
    switch (results.severity) {
      case 'critical':
        return <Badge variant="destructive" className="gap-2"><AlertTriangle className="w-3 h-3" />긴급</Badge>;
      case 'high':
        return <Badge variant="destructive" className="gap-2">높음</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="gap-2">보통</Badge>;
      case 'low':
        return <Badge variant="outline" className="gap-2">낮음</Badge>;
    }
  };

  const getSeverityMessage = () => {
    switch (results.severity) {
      case 'critical':
        return '즉시 전문가의 도움이 필요합니다. 정신건강위기상담전화 1577-0199로 연락하세요.';
      case 'high':
        return '전문가 상담을 권장합니다. 심리적 어려움이 있을 수 있습니다.';
      case 'medium':
        return '주의 깊게 관찰이 필요합니다. 지속적인 관심과 대화가 도움이 됩니다.';
      case 'low':
        return '전반적으로 안정적입니다. 긍정적인 환경을 유지해주세요.';
    }
  };

  const ageGroupLabel = {
    infant: '유아',
    teen: '청소년',
    adult: '성인',
    parent: '부모',
    senior: '노인'
  }[ageGroup] || ageGroup;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">SCT 분석 결과</h3>
            <p className="text-muted-foreground">
              {ageGroupLabel} • {results.totalResponses}개 문항 응답
            </p>
          </div>
          {getSeverityBadge()}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-background/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">평균 점수</p>
            <p className="text-3xl font-bold">{results.averageScore.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-1">/ 10점</p>
          </div>
          <div className="bg-background/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">우려 응답</p>
            <p className="text-3xl font-bold text-destructive">{results.concernResponses.length}</p>
            <p className="text-xs text-muted-foreground mt-1">/ {results.totalResponses}개</p>
          </div>
          <div className="bg-background/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">긍정 비율</p>
            <p className="text-3xl font-bold text-green-600">
              {((results.sentimentDistribution.positive / results.totalResponses) * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-background/50 rounded-lg">
          <p className="text-sm font-medium mb-2">종합 소견</p>
          <p className="text-sm text-muted-foreground">{getSeverityMessage()}</p>
        </div>
      </Card>

      {/* 감정 분포 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            감정 분포
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name} (${entry.value})`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            영역별 점수
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 10]} />
              <Radar
                name="점수"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* 영역별 상세 분석 */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">영역별 상세 분석</h4>
        <div className="space-y-4">
          {results.categoryAverages.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.category] || Brain;
            const percentage = (cat.average / 10) * 100;
            const isHigh = cat.average >= 6;
            
            return (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="font-medium">{CATEGORY_LABELS[cat.category]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isHigh ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {cat.average.toFixed(1)}점
                    </span>
                    {isHigh && <AlertTriangle className="w-4 h-4 text-destructive" />}
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className={`h-2 ${isHigh ? '[&>div]:bg-destructive' : ''}`}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* 주요 키워드 */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">주요 키워드 분석</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={keywordData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="keyword" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="hsl(var(--primary))" name="빈도" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 mt-4">
          {results.topKeywords.map((kw) => (
            <Badge key={kw.keyword} variant="secondary">
              {kw.keyword} ({kw.count})
            </Badge>
          ))}
        </div>
      </Card>

      {/* 우려 응답 상세 */}
      {results.concernResponses.length > 0 && (
        <Card className="p-6 border-destructive/50 bg-destructive/5">
          <h4 className="font-semibold mb-4 flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            주의가 필요한 응답
          </h4>
          <div className="space-y-3">
            {results.concernResponses.map((response, idx) => (
              <div key={idx} className="p-3 bg-background rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {response.stem}
                </p>
                <p className="text-sm">{response.completion}</p>
                {response.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {response.keywords.map((kw: string, i: number) => (
                      <Badge key={i} variant="destructive" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
