import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { BookingList } from '@/components/booking/BookingList';
import { ExpertScheduleManager } from '@/components/booking/ExpertScheduleManager';
import { CancellationPolicyInfo } from '@/components/booking/CancellationPolicyInfo';
import { PackagesView } from '@/components/booking/PackagesView';
import { MyPackages } from '@/components/booking/MyPackages';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, List, Settings, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BookingManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expertId, setExpertId] = useState<string | null>(null);
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null);
  const [selectedExpertName, setSelectedExpertName] = useState<string>('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');
  const [isExpert, setIsExpert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);

  useEffect(() => {
    checkExpertStatus();
    
    // URL state에서 전문가/기관 정보 확인
    if (location.state) {
      const { expertId, expertName, institutionName, autoOpenBooking } = location.state as any;
      
      if (expertId) {
        setSelectedExpertId(expertId);
        setSelectedExpertName(expertName || '');
      }
      
      if (institutionName) {
        setSelectedInstitution(institutionName);
      }
      
      if (autoOpenBooking) {
        setShowBookingCalendar(true);
      }
    }
  }, [location]);

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

  // 예약 캘린더 표시 모드
  if (showBookingCalendar && selectedExpertId) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => {
                setShowBookingCalendar(false);
                navigate('/expert-hiring');
              }}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              전문가 목록으로 돌아가기
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {selectedExpertName} 전문가 예약
                </CardTitle>
                <CardDescription>
                  원하시는 날짜와 시간을 선택하여 상담을 예약하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingCalendar expertId={selectedExpertId} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // 제휴기관 예약 모드
  if (showBookingCalendar && selectedInstitution) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => {
                setShowBookingCalendar(false);
                navigate('/expert-hiring');
              }}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              제휴기관 목록으로 돌아가기
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {selectedInstitution} 예약
                </CardTitle>
                <CardDescription>
                  제휴기관 상담 예약 서비스를 준비 중입니다. 곧 이용하실 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  현재 제휴기관과의 상담 예약 시스템을 구축 중입니다.
                </p>
                <Button onClick={() => navigate('/expert-hiring')}>
                  개인 전문가 예약하기
                </Button>
              </CardContent>
            </Card>
          </div>
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
            <Tabs defaultValue="bookings" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bookings" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  내 예약
                </TabsTrigger>
                <TabsTrigger value="packages" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  패키지
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-6">
                <MyPackages />
                <CancellationPolicyInfo />
                <BookingList userView={true} />
              </TabsContent>

              <TabsContent value="packages" className="space-y-6">
                <PackagesView />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;
