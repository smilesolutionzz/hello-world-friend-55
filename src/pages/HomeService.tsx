import { useState } from 'react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomeServiceList } from '@/components/home-service/HomeServiceList';
import { VoucherManager } from '@/components/home-service/VoucherManager';
import { BookingHistory } from '@/components/home-service/BookingHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, CreditCard, Calendar, Shield } from 'lucide-react';

const HomeService = () => {
  const [activeTab, setActiveTab] = useState('services');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            재가방문 서비스
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            바우처를 사용하여 집에서 편안하게 받는 전문 방문 서비스
          </p>
        </div>

        {/* 주요 기능 소개 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader>
              <MapPin className="h-8 w-8 mx-auto text-primary" />
              <CardTitle className="text-lg">집에서 편안하게</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                익숙한 환경에서 전문 서비스를 받아보세요
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CreditCard className="h-8 w-8 mx-auto text-primary" />
              <CardTitle className="text-lg">바우처 사용</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                정부 지원 바우처로 비용 부담을 줄여보세요
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Calendar className="h-8 w-8 mx-auto text-primary" />
              <CardTitle className="text-lg">유연한 일정</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                원하는 시간에 맞춰 일정을 조정할 수 있어요
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-8 w-8 mx-auto text-primary" />
              <CardTitle className="text-lg">검증된 전문가</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                자격을 갖춘 전문가들의 서비스를 받아보세요
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* 탭 메뉴 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services">서비스 찾기</TabsTrigger>
            <TabsTrigger value="vouchers">바우처 관리</TabsTrigger>
            <TabsTrigger value="bookings">예약 내역</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-6">
            <HomeServiceList />
          </TabsContent>

          <TabsContent value="vouchers" className="mt-6">
            <VoucherManager />
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <BookingHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HomeService;