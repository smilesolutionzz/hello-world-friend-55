import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, User, Coins } from 'lucide-react';

interface BankTransferRequest {
  id: string;
  user_email: string;
  depositor_name: string;
  transfer_amount: number;
  requested_tokens: number;
  bank_name: string;
  transfer_date: string;
  request_note: string;
  status: string;
  admin_note: string;
  created_at: string;
}

const AdminBankTransferManager = () => {
  const [requests, setRequests] = useState<BankTransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bank_transfer_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('요청 목록 조회 오류:', error);
      toast({
        title: "조회 실패",
        description: "무통장입금 요청을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processRequest = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingId(requestId);
    
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      if (action === 'approve') {
        // 1. 캐시 지급
        const { error: tokenError } = await supabase.functions.invoke('admin-add-tokens', {
          body: { 
            email: request.user_email,
            tokens: request.requested_tokens
          }
        });

        if (tokenError) throw tokenError;
      }

      // 2. 요청 상태 업데이트
      const { error: updateError } = await supabase
        .from('bank_transfer_requests')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          admin_note: adminNote,
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      toast({
        title: action === 'approve' ? "승인 완료" : "거절 완료",
        description: action === 'approve' 
          ? `${request.user_email}에 ${(request.requested_tokens * 100).toLocaleString()}캐시가 지급되었습니다.`
          : "요청이 거절되었습니다.",
      });

      setAdminNote('');
      fetchRequests(); // 목록 새로고침
    } catch (error) {
      console.error('처리 오류:', error);
      toast({
        title: "처리 실패",
        description: "요청 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />대기중</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />승인</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />거절</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Coins className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold">무통장입금 관리</h2>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">요청이 없습니다</h3>
            <p className="text-muted-foreground">아직 무통장입금 요청이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {request.user_email}
                    </CardTitle>
                    <CardDescription>
                      {new Date(request.created_at).toLocaleString('ko-KR')}
                    </CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">입금자명</Label>
                    <p className="font-medium">{request.depositor_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">입금금액</Label>
                    <p className="font-medium">₩{request.transfer_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">요청 캐시</Label>
                    <p className="font-medium">{(request.requested_tokens * 100).toLocaleString()}캐시</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">입금은행</Label>
                    <p className="font-medium">{request.bank_name || '-'}</p>
                  </div>
                </div>

                {request.transfer_date && (
                  <div>
                    <Label className="text-sm text-muted-foreground">입금일시</Label>
                    <p className="font-medium">{new Date(request.transfer_date).toLocaleDateString('ko-KR')}</p>
                  </div>
                )}

                {request.request_note && (
                  <div>
                    <Label className="text-sm text-muted-foreground">요청사항</Label>
                    <p className="font-medium">{request.request_note}</p>
                  </div>
                )}

                {request.admin_note && (
                  <div>
                    <Label className="text-sm text-muted-foreground">관리자 메모</Label>
                    <p className="font-medium text-blue-600">{request.admin_note}</p>
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`admin-note-${request.id}`}>관리자 메모</Label>
                        <Textarea
                          id={`admin-note-${request.id}`}
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="처리 사유를 입력하세요..."
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => processRequest(request.id, 'approve')}
                          disabled={processingId === request.id}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {processingId === request.id ? '처리중...' : '승인 & 캐시 지급'}
                        </Button>
                        <Button
                          onClick={() => processRequest(request.id, 'reject')}
                          disabled={processingId === request.id}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          거절
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBankTransferManager;