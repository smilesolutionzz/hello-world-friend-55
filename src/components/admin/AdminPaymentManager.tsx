import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, DollarSign, Search, RefreshCw, Users, Clock, CheckCircle, XCircle, Coins } from 'lucide-react';
import { format } from 'date-fns';

interface SubscriptionRecord {
  user_id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  subscription_type: string;
  payment_method: string | null;
  status: string;
  is_lifetime: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
}

interface BankTransferRecord {
  id: string;
  user_id: string;
  user_email: string;
  depositor_name: string;
  transfer_amount: number;
  requested_tokens: number;
  bank_name: string | null;
  transfer_date: string | null;
  request_note: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  display_name: string | null;
}

export function AdminPaymentManager() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [bankTransfers, setBankTransfers] = useState<BankTransferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'paid' | 'free'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadSubscriptions(), loadBankTransfers()]);
    setLoading(false);
  };

  const loadSubscriptions = async () => {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('user_id, subscription_type, payment_method, status, is_lifetime, current_period_start, current_period_end, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Subscription load error:', error);
      return;
    }

    // Get profiles for each subscription
    const userIds = [...new Set((data || []).map(s => s.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, email, phone')
      .in('user_id', userIds);

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

    setSubscriptions((data || []).map(s => ({
      ...s,
      display_name: profileMap.get(s.user_id)?.display_name || null,
      email: profileMap.get(s.user_id)?.email || null,
      phone: profileMap.get(s.user_id)?.phone || null,
    })));
  };

  const loadBankTransfers = async () => {
    const { data, error } = await supabase
      .from('bank_transfer_requests')
      .select('id, user_id, user_email, depositor_name, transfer_amount, requested_tokens, bank_name, transfer_date, request_note, status, admin_note, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Bank transfer load error:', error);
      return;
    }

    const userIds = [...new Set((data || []).map(b => b.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', userIds);

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

    setBankTransfers((data || []).map(b => ({
      ...b,
      display_name: profileMap.get(b.user_id)?.display_name || null,
    })));
  };

  const filteredSubscriptions = subscriptions.filter(s => {
    const matchesSearch = !searchTerm || 
      s.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.user_id.includes(searchTerm) ||
      s.phone?.includes(searchTerm);
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'paid' && s.subscription_type !== 'free') ||
      (filterType === 'free' && s.subscription_type === 'free');

    return matchesSearch && matchesFilter;
  });

  const paidCount = subscriptions.filter(s => s.subscription_type !== 'free').length;
  const activeCount = subscriptions.filter(s => s.status === 'active' && s.subscription_type !== 'free').length;
  const pendingTransfers = bankTransfers.filter(b => b.status === 'pending').length;

  const getSubscriptionBadge = (type: string) => {
    switch (type) {
      case 'lifetime': return <Badge className="bg-amber-100 text-amber-800 border-amber-200">평생</Badge>;
      case 'premium': return <Badge className="bg-violet-100 text-violet-800 border-violet-200">프리미엄</Badge>;
      case 'monthly': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">월간</Badge>;
      case 'yearly': return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">연간</Badge>;
      case 'free': return <Badge variant="secondary">무료</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />활성</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />취소</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />대기</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />승인</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />거절</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isExpired = (endDate: string | null) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-gray-500">전체 구독</span>
            </div>
            <p className="text-2xl font-bold">{subscriptions.length}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-4 w-4 text-violet-500" />
              <span className="text-xs text-gray-500">유료 구독</span>
            </div>
            <p className="text-2xl font-bold">{paidCount}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs text-gray-500">활성 유료</span>
            </div>
            <p className="text-2xl font-bold">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-gray-500">입금 대기</span>
            </div>
            <p className="text-2xl font-bold">{pendingTransfers}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscriptions">
        <TabsList className="bg-gray-50 border border-gray-100">
          <TabsTrigger value="subscriptions" className="text-xs">구독 현황 ({subscriptions.length})</TabsTrigger>
          <TabsTrigger value="bank-transfers" className="text-xs">무통장입금 ({bankTransfers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="이름, 이메일, ID, 전화번호 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex gap-1">
              {(['all', 'paid', 'free'] as const).map(f => (
                <Button
                  key={f}
                  variant={filterType === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(f)}
                  className="text-xs h-9"
                >
                  {f === 'all' ? '전체' : f === 'paid' ? '유료만' : '무료만'}
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={loadData} className="h-9">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 border-gray-100">
                    <TableHead className="text-xs font-medium text-gray-500">사용자</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500">이메일</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500">연락처</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500">구독</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500">결제방법</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500">상태</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500">기간</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500">등록일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <TableCell key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredSubscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-400 text-sm">
                        검색 결과가 없습니다
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubscriptions.map((sub) => (
                      <TableRow key={`${sub.user_id}-${sub.created_at}`} className="border-gray-50 hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                              {sub.display_name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{sub.display_name || '미설정'}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{sub.user_id.slice(0, 12)}...</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">{sub.email || '-'}</TableCell>
                        <TableCell className="text-xs text-gray-600">{sub.phone || '-'}</TableCell>
                        <TableCell>{getSubscriptionBadge(sub.subscription_type)}</TableCell>
                        <TableCell>
                          <span className="text-xs text-gray-600">
                            {sub.payment_method === 'toss' ? '토스' : 
                             sub.payment_method === 'free_trial' ? '무료체험' :
                             sub.payment_method || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            {getStatusBadge(sub.status)}
                            {sub.current_period_end && isExpired(sub.current_period_end) && (
                              <span className="text-[10px] text-red-500">만료됨</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {sub.current_period_start && sub.current_period_end ? (
                            <div className="text-[11px] text-gray-500">
                              <div>{format(new Date(sub.current_period_start), 'yy.MM.dd')}</div>
                              <div>~{format(new Date(sub.current_period_end), 'yy.MM.dd')}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[11px] text-gray-500">
                          {format(new Date(sub.created_at), 'yy.MM.dd HH:mm')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bank-transfers" className="space-y-4">
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 border-gray-100">
                    <TableHead className="text-xs font-medium text-gray-500">요청자</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500">이메일</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500">입금자명</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500">금액</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500">요청 토큰</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500">은행</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500">상태</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500">요청일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankTransfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-400 text-sm">
                        무통장입금 요청이 없습니다
                      </TableCell>
                    </TableRow>
                  ) : (
                    bankTransfers.map((bt) => (
                      <TableRow key={bt.id} className="border-gray-50 hover:bg-gray-50/50">
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{bt.display_name || '미설정'}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{bt.user_id.slice(0, 12)}...</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">{bt.user_email}</TableCell>
                        <TableCell className="text-xs font-medium">{bt.depositor_name}</TableCell>
                        <TableCell className="text-xs font-medium">₩{bt.transfer_amount.toLocaleString()}</TableCell>
                        <TableCell className="text-xs">{bt.requested_tokens}개</TableCell>
                        <TableCell className="text-xs text-gray-600">{bt.bank_name || '-'}</TableCell>
                        <TableCell>{getStatusBadge(bt.status)}</TableCell>
                        <TableCell className="text-[11px] text-gray-500">
                          {format(new Date(bt.created_at), 'yy.MM.dd HH:mm')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
