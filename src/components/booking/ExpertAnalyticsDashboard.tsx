import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Calendar, TrendingUp, DollarSign, Star, Clock } from 'lucide-react';

interface ExpertAnalyticsDashboardProps {
  expertId: string;
}

interface BookingStats {
  expert_id: string;
  user_id: string;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  confirmed_bookings: number;
  total_tokens_earned: number;
  cancellation_rate: number;
  average_rating: number;
  review_count: number;
}

export const ExpertAnalyticsDashboard: React.FC<ExpertAnalyticsDashboardProps> = ({ expertId }) => {
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [expertId]);

  const loadAnalytics = async () => {
    try {
      // Load booking stats
      const { data: statsData, error: statsError } = await supabase
        .from('expert_booking_stats')
        .select('*')
        .eq('expert_id', expertId)
        .single();

      if (statsError) throw statsError;
      setStats(statsData);

      // Load hourly distribution - using raw SQL due to view limitations
      const { data: bookings, error: bookingsError } = await supabase
        .from('consultation_bookings')
        .select('start_time')
        .eq('expert_id', expertId)
        .in('status', ['completed', 'confirmed']);

      if (!bookingsError && bookings) {
        const hourCounts: { [key: number]: number } = {};
        bookings.forEach(b => {
          if (b.start_time) {
            const hour = parseInt(b.start_time.split(':')[0]);
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
          }
        });

        const formattedHourly = Object.entries(hourCounts).map(([hour, count]) => ({
          hour: `${hour}:00`,
          bookings: count
        })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
        
        setHourlyData(formattedHourly);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8">통계 데이터가 없습니다.</div>;
  }

  const pieData = [
    { name: '완료', value: stats.completed_bookings, color: '#22c55e' },
    { name: '확정', value: stats.confirmed_bookings, color: '#3b82f6' },
    { name: '취소', value: stats.cancelled_bookings, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 예약</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_bookings}</div>
            <p className="text-xs text-muted-foreground">완료: {stats.completed_bookings}건</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">수익 (토큰)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_tokens_earned}</div>
            <p className="text-xs text-muted-foreground">완료된 상담 기준</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 평점</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.average_rating.toFixed(1)} ⭐</div>
            <p className="text-xs text-muted-foreground">리뷰: {stats.review_count}개</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">취소율</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancellation_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">취소: {stats.cancelled_bookings}건</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>예약 상태 분포</CardTitle>
            <CardDescription>전체 예약의 상태별 비율</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>시간대별 예약 현황</CardTitle>
            <CardDescription>인기 시간대 분석</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
