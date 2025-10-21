import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface OrganizationChartProps {
  organizationId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export const OrganizationChart = ({ organizationId, dateRange }: OrganizationChartProps) => {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [vulnerabilityData, setVulnerabilityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [organizationId, dateRange]);

  const fetchChartData = async () => {
    try {
      setLoading(true);

      // 멤버 ID 가져오기
      const { data: members } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', organizationId);

      const memberIds = members?.map(m => m.user_id) || [];

      if (memberIds.length === 0) {
        setMonthlyData([]);
        setVulnerabilityData([]);
        setLoading(false);
        return;
      }

      // 월별 검사 수 집계
      const { data: testResults } = await supabase
        .from('test_results')
        .select('created_at, test_type_id, scores')
        .in('user_id', memberIds)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
        .order('created_at');

      // 월별 데이터 집계
      const monthlyMap = new Map();
      testResults?.forEach(result => {
        const date = new Date(result.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { month: monthKey, count: 0, cumulative: 0 });
        }
        
        const monthData = monthlyMap.get(monthKey);
        monthData.count += 1;
      });

      // 누적 계산
      let cumulative = 0;
      const sortedMonths = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
      sortedMonths.forEach(month => {
        cumulative += month.count;
        month.cumulative = cumulative;
      });

      setMonthlyData(sortedMonths);

      // 취약점 분포 (검사 유형별)
      const testTypeMap = new Map();
      testResults?.forEach(result => {
        const testType = result.test_type_id || '기타';
        testTypeMap.set(testType, (testTypeMap.get(testType) || 0) + 1);
      });

      const vulnerabilities = Array.from(testTypeMap.entries()).map(([name, value]) => ({
        name: getTestTypeName(name),
        value,
        percentage: ((value / (testResults?.length || 1)) * 100).toFixed(1)
      }));

      setVulnerabilityData(vulnerabilities);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTestTypeName = (id: string): string => {
    const nameMap: Record<string, string> = {
      'adhd': 'ADHD',
      'depression': '우울',
      'anxiety': '불안',
      'stress': '스트레스',
      'bigfive': '성격',
      'attachment': '애착',
      'other': '기타'
    };
    return nameMap[id] || id;
  };

  const COLORS = ['#FF6B9D', '#FFA07A', '#FFD93D', '#6BCB77', '#4D96FF', '#9D84B7', '#FF8C94'];

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* 월별 검사 추이 */}
      <Card>
        <CardHeader>
          <CardTitle>누적 추이</CardTitle>
          <p className="text-sm text-muted-foreground">검사 수 누적 추이</p>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" name="월별 검사 수" />
                <Bar dataKey="cumulative" fill="#fbbf24" name="누적 검사 수" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground">
              <p>📊 데이터가 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 취약점 분포 */}
      <Card>
        <CardHeader>
          <CardTitle>취약점 분포</CardTitle>
          <p className="text-sm text-muted-foreground">검사 유형별 분포</p>
        </CardHeader>
        <CardContent>
          {vulnerabilityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vulnerabilityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}\n${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {vulnerabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground">
              <p>📊 데이터가 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
