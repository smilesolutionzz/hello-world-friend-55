import React, { useState, useEffect } from 'react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { BookingList } from '@/components/booking/BookingList';
import { ExpertScheduleManager } from '@/components/booking/ExpertScheduleManager';
import { CancellationPolicyInfo } from '@/components/booking/CancellationPolicyInfo';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, List, Settings } from 'lucide-react';

const BookingManagement = () => {
  const [expertId, setExpertId] = useState<string | null>(null);
  const [isExpert, setIsExpert] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExpertStatus();
  }, []);

  const checkExpertStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: expert, error } = await supabase
        .from('experts')
        .select('id, is_verified')
        .eq('user_id', user.id)
        .single();

      if (expert && expert.is_verified) {
        setExpertId(expert.id);
        setIsExpert(true);
      }
    } catch (error) {
      console.error('전문가 상태 확인 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">예약 관리</h1>
          <p className="text-muted-foreground mb-8">
            {isExpert ? '전문가 스케줄 및 예약을 관리하세요' : '상담 예약을 확인하고 관리하세요'}
          </p>

          {isExpert ? (
            // Expert View
            <Tabs defaultValue="bookings" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bookings" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  예약 목록
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  스케줄 설정
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-6">
                <BookingList userView={false} />
              </TabsContent>

              <TabsContent value="schedule" className="space-y-6">
                {expertId && <ExpertScheduleManager expertId={expertId} />}
              </TabsContent>
            </Tabs>
          ) : (
            // User View
            <div className="space-y-6">
              <CancellationPolicyInfo />
              <BookingList userView={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;
