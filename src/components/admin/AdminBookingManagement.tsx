import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, Clock, Search, Check, Link2, 
  Phone, MessageSquare, CheckCircle, XCircle,
  DollarSign, Users, Hourglass, Ban
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface AdminBooking {
  id: string;
  user_id: string;
  expert_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  tokens_paid: number;
  notes: string | null;
  meeting_link: string | null;
  meeting_platform: string | null;
  created_at: string | null;
  confirmed_at: string | null;
  experts: {
    full_name: string;
    professional_title: string;
  };
  profiles?: {
    display_name: string | null;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  pending: { label: '입금 대기', variant: 'secondary', icon: Hourglass },
  confirmed: { label: '확정', variant: 'default', icon: CheckCircle },
  completed: { label: '완료', variant: 'outline', icon: Check },
  cancelled: { label: '취소', variant: 'destructive', icon: XCircle },
  no_show: { label: '노쇼', variant: 'destructive', icon: Ban },
};

const FILTER_TABS = [
  { key: 'all', label: '전체' },
  { key: 'pending', label: '대기 중' },
  { key: 'confirmed', label: '확정' },
  { key: 'cancelled', label: '취소' },
  { key: 'completed', label: '완료' },
];

export const AdminBookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({});
  const [savingLink, setSavingLink] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
    const channel = supabase
      .channel('admin-booking-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultation_bookings' }, () => loadBookings())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('consultation_bookings')
        .select(`*, experts (full_name, professional_title)`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load user profiles separately
      const userIds = [...new Set((data || []).map(b => b.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      
      const enriched = (data || []).map(b => ({
        ...b,
        profiles: profileMap.get(b.user_id) || null,
      }));

      setBookings(enriched as AdminBooking[]);
      
      // Initialize meeting links
      const links: Record<string, string> = {};
      (data || []).forEach(b => {
        if (b.meeting_link) links[b.id] = b.meeting_link;
      });
      setMeetingLinks(prev => ({ ...prev, ...links }));
    } catch (error) {
      console.error('예약 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const revenue = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + (b.tokens_paid > 0 ? b.tokens_paid * 100 : 49000), 0);
    return { total, pending, confirmed, completed, cancelled, revenue };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = b.experts?.full_name?.toLowerCase() || '';
        const userName = b.profiles?.display_name?.toLowerCase() || '';
        const notes = b.notes?.toLowerCase() || '';
        if (!name.includes(q) && !userName.includes(q) && !notes.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, searchQuery]);

  const confirmBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('consultation_bookings')
        .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
        .eq('id', bookingId);
      if (error) throw error;
      toast({ title: '예약 확정 완료' });
      loadBookings();
    } catch (error) {
      toast({ title: '확정 실패', variant: 'destructive' });
    }
  };

  const completeBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('consultation_bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId);
      if (error) throw error;
      toast({ title: '완료 처리됨' });
      loadBookings();
    } catch (error) {
      toast({ title: '처리 실패', variant: 'destructive' });
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('정말 이 예약을 취소하시겠습니까?')) return;
    try {
      const { error } = await supabase
        .from('consultation_bookings')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', bookingId);
      if (error) throw error;
      toast({ title: '예약 취소됨' });
      loadBookings();
    } catch (error) {
      toast({ title: '취소 실패', variant: 'destructive' });
    }
  };

  const saveMeetingLink = async (bookingId: string) => {
    const link = meetingLinks[bookingId];
    if (!link) return;
    setSavingLink(bookingId);
    try {
      const { error } = await supabase
        .from('consultation_bookings')
        .update({ meeting_link: link, meeting_platform: 'zoom' })
        .eq('id', bookingId);
      if (error) throw error;
      toast({ title: '줌 링크 저장 완료' });
      loadBookings();
    } catch (error) {
      toast({ title: '저장 실패', variant: 'destructive' });
    } finally {
      setSavingLink(null);
    }
  };

  const getPrice = (b: AdminBooking) => {
    return b.tokens_paid > 0 ? b.tokens_paid * 100 : 49000;
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon="📊" label="전체 예약" value={stats.total} />
        <StatCard icon="🏦" label="입금 대기" value={stats.pending} percent={stats.total > 0 ? Math.round(stats.pending / stats.total * 100) : 0} color="text-amber-600" />
        <StatCard icon="✅" label="확정" value={stats.confirmed} percent={stats.total > 0 ? Math.round(stats.confirmed / stats.total * 100) : 0} color="text-emerald-600" />
        <StatCard icon="🎉" label="완료" value={stats.completed} percent={stats.total > 0 ? Math.round(stats.completed / stats.total * 100) : 0} color="text-blue-600" />
        <StatCard icon="❌" label="취소" value={stats.cancelled} percent={stats.total > 0 ? Math.round(stats.cancelled / stats.total * 100) : 0} color="text-destructive" />
        <StatCard icon="💰" label="매출 (확정+완료)" value={`₩${stats.revenue.toLocaleString()}`} color="text-primary" />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="이름, 전문가, 메모 검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {FILTER_TABS.map(tab => (
            <Button
              key={tab.key}
              variant={statusFilter === tab.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(tab.key)}
              className="whitespace-nowrap"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Booking Cards */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          검색 결과가 없습니다
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => {
            const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const price = getPrice(booking);
            
            return (
              <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{booking.experts?.full_name || '전문가'}</h3>
                      <Badge variant={cfg.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </div>
                    <span className="text-lg font-bold text-primary">₩{price.toLocaleString()}</span>
                  </div>

                  {/* User info */}
                  <p className="text-sm text-muted-foreground mb-3">
                    <Users className="inline h-3.5 w-3.5 mr-1" />
                    {booking.profiles?.display_name || '사용자'} · {booking.experts?.professional_title || ''}
                  </p>

                  {/* Date/Time row */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(booking.booking_date), 'yyyy.MM.dd (E)', { locale: ko })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {booking.start_time?.substring(0, 5)}
                    </span>
                    {booking.created_at && (
                      <span className="ml-auto text-xs">
                        {format(new Date(booking.created_at), 'MM.dd HH:mm')}
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <div className="bg-muted/50 rounded-lg px-4 py-2.5 mb-3 text-sm flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span>{booking.notes}</span>
                    </div>
                  )}

                  {/* Meeting link input */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="https://zoom.us/j/... 줌 링크 입력"
                        value={meetingLinks[booking.id] || ''}
                        onChange={e => setMeetingLinks(prev => ({ ...prev, [booking.id]: e.target.value }))}
                        className="pl-10 text-sm"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => saveMeetingLink(booking.id)}
                      disabled={!meetingLinks[booking.id] || savingLink === booking.id}
                    >
                      저장
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {booking.status === 'pending' && (
                      <Button size="sm" onClick={() => confirmBooking(booking.id)} className="gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5" />
                        확정 처리
                      </Button>
                    )}
                    {(booking.status === 'confirmed') && (
                      <Button size="sm" variant="outline" onClick={() => completeBooking(booking.id)} className="gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        완료 처리
                      </Button>
                    )}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <Button size="sm" variant="ghost" className="text-destructive gap-1.5" onClick={() => cancelBooking(booking.id)}>
                        <XCircle className="h-3.5 w-3.5" />
                        취소
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

function StatCard({ icon, label, value, percent, color }: { 
  icon: string; label: string; value: number | string; percent?: number; color?: string 
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
          <span>{icon}</span>
          {label}
        </div>
        <div className={`text-2xl font-bold ${color || 'text-foreground'}`}>
          {value}
        </div>
        {percent !== undefined && (
          <div className="text-xs text-muted-foreground">{percent}%</div>
        )}
      </CardContent>
    </Card>
  );
}
