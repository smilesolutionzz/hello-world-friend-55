import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, RefreshCw, Bell, Settings, Calendar, 
  UserCheck, Search, Coins, CreditCard, LayoutDashboard, Activity, Heart, Mail, BookOpen, Inbox, TrendingUp, Share2
} from 'lucide-react';
import PartnerReferralStats from '@/components/admin/PartnerReferralStats';
import B2BInquiryInbox from '@/components/admin/B2BInquiryInbox';
import B2BFunnelDashboard from '@/components/admin/B2BFunnelDashboard';
import B2BKanbanBoard from '@/components/admin/B2BKanbanBoard';
import { EmailSendLogPanel } from '@/components/admin/EmailSendLogPanel';
import MindTrackInterventionStats from '@/components/admin/MindTrackInterventionStats';
import WorkbookFunnelDashboard from '@/components/admin/WorkbookFunnelDashboard';
import { AdminNotifications } from '@/components/AdminNotifications';
import { ExpertApplicationManagement } from '@/components/admin/ExpertApplicationManagement';
import { EnhancedUserDataViewer } from '@/components/admin/EnhancedUserDataViewer';
import { ExpertManagement } from '@/components/admin/ExpertManagement';
import { InstitutionManagement } from '@/components/admin/InstitutionManagement';
import { InstitutionAdminAssignment } from '@/components/admin/InstitutionAdminAssignment';
import AdminTokenAdd from '@/components/AdminTokenAdd';
import { AdminBookingManagement } from '@/components/admin/AdminBookingManagement';
import { AdminPaymentManager } from '@/components/admin/AdminPaymentManager';
import { AdminOverviewPanel } from '@/components/admin/AdminOverviewPanel';
import { ReportQualityCard } from '@/components/admin/ReportQualityCard';
import { AdminUserActivityTracker } from '@/components/admin/AdminUserActivityTracker';
import AdminNSMHero from '@/components/admin/AdminNSMHero';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminDashboard() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!adminLoading && !isAdmin) {
    navigate('/');
    return null;
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-sm font-semibold text-gray-900">AIHPRO 관리자</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <Button onClick={() => setRefreshKey(k => k + 1)} variant="ghost" size="sm" className="text-gray-500 h-7 text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              새로고침
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-500 h-7 text-xs">
                  <Coins className="h-3 w-3 mr-1" />
                  캐시 지급
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>캐시 지급</DialogTitle>
                </DialogHeader>
                <AdminTokenAdd />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 space-y-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-white border border-gray-100 p-0.5 h-auto flex-wrap shadow-sm">
            <TabsTrigger value="overview" className="text-[11px] gap-1 px-3 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <LayoutDashboard className="h-3 w-3" />
              대시보드
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-[11px] gap-1 px-3 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Activity className="h-3 w-3" />
              활동 추적
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-[11px] gap-1 px-3 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <CreditCard className="h-3 w-3" />
              결제/구독
            </TabsTrigger>
            <TabsTrigger value="bookings" className="text-[11px] gap-1 px-3 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Calendar className="h-3 w-3" />
              예약
            </TabsTrigger>
            <TabsTrigger value="mindtrack" className="text-[11px] gap-1 px-3 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Heart className="h-3 w-3" />
              마음트랙
            </TabsTrigger>
            <TabsTrigger value="workbook_funnel" className="text-[11px] gap-1 px-3 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <BookOpen className="h-3 w-3" />
              워크북 퍼널
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-[11px] gap-1 px-3 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Bell className="h-3 w-3" />
              알림
            </TabsTrigger>
            <TabsTrigger value="email_logs" className="text-[11px] gap-1 px-3 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Mail className="h-3 w-3" />
              발송 로그
            </TabsTrigger>
            <TabsTrigger value="b2b_inbox" className="text-[11px] gap-1 px-3 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Inbox className="h-3 w-3" />
              B2B 문의
            </TabsTrigger>
            <TabsTrigger value="b2b_kanban" className="text-[11px] gap-1 px-3 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <TrendingUp className="h-3 w-3" />
              B2B 칸반
            </TabsTrigger>
            <TabsTrigger value="b2b_funnel" className="text-[11px] gap-1 px-3 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <TrendingUp className="h-3 w-3" />
              B2B 퍼널
            </TabsTrigger>
            <TabsTrigger value="experts" className="text-[11px] gap-1 px-3 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <UserCheck className="h-3 w-3" />
              전문가
            </TabsTrigger>
            <TabsTrigger value="user-data" className="text-[11px] gap-1 px-3 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Search className="h-3 w-3" />
              사용자 조회
            </TabsTrigger>
            <TabsTrigger value="partner_referrals" className="text-[11px] gap-1 px-3 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Share2 className="h-3 w-3" />
              파트너 추천
            </TabsTrigger>
            <TabsTrigger value="management" className="text-[11px] gap-1 px-3 py-1.5 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Settings className="h-3 w-3" />
              관리
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <AdminNSMHero key={`nsm-${refreshKey}`} />
            <ReportQualityCard key={`rq-${refreshKey}`} />
            <AdminOverviewPanel key={refreshKey} />
          </TabsContent>
          <TabsContent value="activity"><AdminUserActivityTracker /></TabsContent>
          <TabsContent value="payments"><AdminPaymentManager /></TabsContent>
          <TabsContent value="bookings"><AdminBookingManagement /></TabsContent>
          <TabsContent value="mindtrack"><MindTrackInterventionStats /></TabsContent>
          <TabsContent value="workbook_funnel"><WorkbookFunnelDashboard /></TabsContent>
          <TabsContent value="notifications"><AdminNotifications /></TabsContent>
          <TabsContent value="email_logs"><EmailSendLogPanel /></TabsContent>
          <TabsContent value="b2b_inbox"><B2BInquiryInbox key={`b2b-${refreshKey}`} /></TabsContent>
          <TabsContent value="b2b_kanban"><B2BKanbanBoard /></TabsContent>
          <TabsContent value="b2b_funnel"><B2BFunnelDashboard key={`bf-${refreshKey}`} /></TabsContent>
          <TabsContent value="experts"><ExpertApplicationManagement /></TabsContent>
          <TabsContent value="user-data"><EnhancedUserDataViewer /></TabsContent>
          <TabsContent value="partner_referrals"><PartnerReferralStats /></TabsContent>
          <TabsContent value="management">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExpertManagement />
                <InstitutionManagement />
              </div>
              <InstitutionAdminAssignment />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
