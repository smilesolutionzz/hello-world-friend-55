import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock,
  Calendar,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Bell,
  Filter
} from 'lucide-react';

interface ConsultationRequest {
  id: string;
  user_id: string;
  expert_id?: string;
  consultation_type: string;
  status: string;
  scheduled_at?: string;
  notes?: string;
  created_at: string;
  price: number;
  duration_minutes: number;
  profiles?: {
    display_name: string;
    phone?: string;
  } | null;
  experts?: {
    full_name: string;
  } | null;
}

interface ConsultationRequestManagerProps {
  institutionId: string;
}

export default function ConsultationRequestManager({ institutionId }: ConsultationRequestManagerProps) {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { toast } = useToast();

  const [scheduleForm, setScheduleForm] = useState({
    scheduled_date: '',
    scheduled_time: '',
    expert_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchRequests();
  }, [institutionId]);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter, typeFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      // 샘플 데이터로 대체 (실제 구현시 데이터베이스 연동)
      const sampleRequests = [
        {
          id: '1',
          user_id: 'user1',
          expert_id: 'expert1',
          consultation_type: 'video',
          status: 'pending',
          created_at: new Date().toISOString(),
          price: 50000,
          duration_minutes: 50,
          profiles: { display_name: '김영희', phone: '010-1234-5678' },
          experts: { full_name: '박상담사' }
        }
      ];
      
      setRequests(sampleRequests as any);
    } catch (error: any) {
      console.error('Error fetching consultation requests:', error);
      toast({
        title: "상담 요청 조회 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(req => req.consultation_type === typeFilter);
    }

    setFilteredRequests(filtered);
  };

  const updateRequestStatus = async (requestId: string, status: string, scheduledAt?: string) => {
    try {
      const updateData: any = { status };
      if (scheduledAt) {
        updateData.scheduled_at = scheduledAt;
      }

      const { error } = await supabase
        .from('consultations')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "상태 변경 완료",
        description: "상담 요청 상태가 변경되었습니다.",
      });

      await fetchRequests();
      setShowDetailDialog(false);
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('Error updating request status:', error);
      toast({
        title: "상태 변경 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const scheduleConsultation = async () => {
    if (!selectedRequest) return;

    const scheduledDateTime = `${scheduleForm.scheduled_date}T${scheduleForm.scheduled_time}:00`;
    
    try {
      const { error } = await supabase
        .from('consultations')
        .update({
          status: 'confirmed',
          scheduled_at: scheduledDateTime,
          expert_id: scheduleForm.expert_id || selectedRequest.expert_id,
          notes: scheduleForm.notes
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: "일정 확정 완료",
        description: "상담 일정이 확정되었습니다.",
      });

      await fetchRequests();
      setShowDetailDialog(false);
      setSelectedRequest(null);
      setScheduleForm({
        scheduled_date: '',
        scheduled_time: '',
        expert_id: '',
        notes: ''
      });
    } catch (error: any) {
      console.error('Error scheduling consultation:', error);
      toast({
        title: "일정 확정 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">대기중</Badge>;
      case 'confirmed':
        return <Badge variant="default">확정</Badge>;
      case 'completed':
        return <Badge variant="outline">완료</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">취소</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'text':
        return '텍스트 상담';
      case 'video':
        return '화상 상담';
      case 'phone':
        return '전화 상담';
      default:
        return type;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">상담 요청 관리</h2>
          <p className="text-muted-foreground">상담 요청을 확인하고 일정을 관리하세요</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            <SelectItem value="pending">대기중</SelectItem>
            <SelectItem value="confirmed">확정</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
            <SelectItem value="cancelled">취소</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="유형 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 유형</SelectItem>
            <SelectItem value="text">텍스트 상담</SelectItem>
            <SelectItem value="video">화상 상담</SelectItem>
            <SelectItem value="phone">전화 상담</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 요청</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}건</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기중</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'pending').length}건
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">확정</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'confirmed').length}건
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'completed').length}건
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 요청 목록 */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold">
                      {request.profiles?.display_name || '사용자'}
                    </h3>
                    {getStatusBadge(request.status)}
                    <Badge variant="outline">
                      {getTypeLabel(request.consultation_type)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {request.duration_minutes}분
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {request.experts?.full_name || '미배정'}
                    </div>
                    {request.profiles?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {request.profiles.phone}
                      </div>
                    )}
                  </div>

                  {request.scheduled_at && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      <strong>예정 일시:</strong> {new Date(request.scheduled_at).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDetailDialog(true);
                    }}
                  >
                    상세보기
                  </Button>
                  
                  {request.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateRequestStatus(request.id, 'confirmed')}
                      >
                        승인
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => updateRequestStatus(request.id, 'cancelled')}
                      >
                        거절
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">상담 요청이 없습니다</h3>
            <p className="text-muted-foreground">
              새로운 상담 요청이 들어오면 여기에 표시됩니다
            </p>
          </CardContent>
        </Card>
      )}

      {/* 상세보기 다이얼로그 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>상담 요청 상세</DialogTitle>
            <DialogDescription>
              상담 요청의 세부 정보와 일정을 관리하세요
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">상세 정보</TabsTrigger>
                <TabsTrigger value="schedule">일정 관리</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>요청자</Label>
                    <p className="text-sm">{selectedRequest.profiles?.display_name || '사용자'}</p>
                  </div>
                  <div>
                    <Label>연락처</Label>
                    <p className="text-sm">{selectedRequest.profiles?.phone || '-'}</p>
                  </div>
                  <div>
                    <Label>상담 유형</Label>
                    <p className="text-sm">{getTypeLabel(selectedRequest.consultation_type)}</p>
                  </div>
                  <div>
                    <Label>예상 시간</Label>
                    <p className="text-sm">{selectedRequest.duration_minutes}분</p>
                  </div>
                  <div>
                    <Label>요청 일시</Label>
                    <p className="text-sm">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>상태</Label>
                    <div className="text-sm">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>
                
                {selectedRequest.notes && (
                  <div>
                    <Label>요청 사항</Label>
                    <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedRequest.notes}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduled_date">상담 일자</Label>
                    <Input
                      id="scheduled_date"
                      type="date"
                      value={scheduleForm.scheduled_date}
                      onChange={(e) => setScheduleForm({
                        ...scheduleForm,
                        scheduled_date: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduled_time">상담 시간</Label>
                    <Input
                      id="scheduled_time"
                      type="time"
                      value={scheduleForm.scheduled_time}
                      onChange={(e) => setScheduleForm({
                        ...scheduleForm,
                        scheduled_time: e.target.value
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">상담 메모</Label>
                  <Textarea
                    id="notes"
                    value={scheduleForm.notes}
                    onChange={(e) => setScheduleForm({
                      ...scheduleForm,
                      notes: e.target.value
                    })}
                    placeholder="상담에 대한 추가 메모를 입력하세요"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={scheduleConsultation}
                    disabled={!scheduleForm.scheduled_date || !scheduleForm.scheduled_time}
                  >
                    일정 확정
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateRequestStatus(selectedRequest.id, 'cancelled')}
                  >
                    요청 거절
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}