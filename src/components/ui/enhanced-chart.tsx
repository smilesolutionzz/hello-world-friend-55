import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
  description?: string;
  level?: string;
  maxValue?: number;
}

interface EnhancedChartProps {
  data: ChartDataPoint[];
  title: string;
  description?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-border rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium">{data.name}</span>
        </div>
        <div className="text-sm text-muted-foreground mb-1">
          점수: {data.value}점
        </div>
        {data.description && (
          <div className="text-xs text-muted-foreground max-w-48">
            {data.description}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const getScoreLevel = (value: number, maxValue: number = 100, providedLevel?: string) => {
  // 제공된 레벨이 있으면 그것을 사용
  if (providedLevel) {
    const levelColors: Record<string, string> = {
      '매우 높음': 'bg-blue-100 text-blue-800',
      '우수': 'bg-blue-100 text-blue-800',
      '높음': 'bg-orange-100 text-orange-800',
      '양호': 'bg-green-100 text-green-800',
      '보통': 'bg-yellow-100 text-yellow-800',
      '다소 낮음': 'bg-green-100 text-green-800',
      '낮음': 'bg-blue-100 text-blue-800',
      '매우 낮음': 'bg-red-100 text-red-800',
      '관심필요': 'bg-red-100 text-red-800'
    };
    return { label: providedLevel, color: levelColors[providedLevel] || 'bg-gray-100 text-gray-800' };
  }
  
  // 기본 백분율 기준 해석
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  if (percentage >= 80) return { label: '우수', color: 'bg-green-100 text-green-800' };
  if (percentage >= 60) return { label: '양호', color: 'bg-blue-100 text-blue-800' };
  if (percentage >= 40) return { label: '보통', color: 'bg-yellow-100 text-yellow-800' };
  return { label: '관심필요', color: 'bg-red-100 text-red-800' };
};

export const EnhancedChart: React.FC<EnhancedChartProps> = ({ 
  data, 
  title, 
  description 
}) => {
  const averageScore = data.length > 0 
    ? data.reduce((sum, item) => sum + item.value, 0) / data.length
    : 0;

  const maxValue = data[0]?.maxValue || 7; // 데이터에서 maxValue 가져오기
  const averageLevel = getScoreLevel(averageScore, maxValue);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">{averageScore.toFixed(1)}</div>
            <Badge className={averageLevel.color} variant="secondary">
              {averageLevel.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Chart */}
          <div className="flex-1 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend with details */}
          <div className="flex-1 space-y-3">
            {data.map((item, index) => {
              const level = getScoreLevel(item.value, item.maxValue || 7, item.level);
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.value.toFixed(1)}점</div>
                    <Badge className={level.color} variant="secondary">
                      {level.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📊</div>
            <div className="font-medium mb-1">아직 데이터가 없습니다</div>
            <div className="text-sm">첫 번째 검사를 완료하면 분석 결과를 볼 수 있습니다</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};