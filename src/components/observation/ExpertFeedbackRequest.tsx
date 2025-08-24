import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Clock, CheckCircle, AlertTriangle, User, FileText } from 'lucide-react';

interface ExpertFeedbackRequestProps {
  observationId: string;
  observationTitle?: string;
}

interface FeedbackRequest {
  id: string;
  request_status: string;
  priority_level: string;
  request_note?: string;
  expert_report?: string;
  requested_at: string;
  completed_at?: string;
}

export const ExpertFeedbackRequest: React.FC<ExpertFeedbackRequestProps> = ({
  observationId,
  observationTitle
}) => {
  const [existingRequest, setExistingRequest] = useState<FeedbackRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [priorityLevel, setPriorityLevel] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const { toast } = useToast();

  useEffect(() => {
    checkExistingRequest();
  }, [observationId]);

  const checkExistingRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_feedback_requests')
        .select('*')
        .eq('observation_id', observationId)
        .order('requested_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setExistingRequest(data[0]);
      }
    } catch (error) {
      console.error('Error checking existing request:', error);
    }
  };

  const submitFeedbackRequest = async () => {
    if (!requestNote.trim()) {
      toast({
        title: "요청 내용 필요",
        description: "전문가에게 전달할 요청 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await supabase
        .from('expert_feedback_requests')
        .insert({
          user_id: user.id,
          observation_id: observationId,
          request_note: requestNote,
          priority_level: priorityLevel,
          request_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setExistingRequest(data);
      setIsDialogOpen(false);
      setRequestNote('');
      setPriorityLevel('normal');

      toast({
        title: "전문가 피드백 요청 완료",
        description: "전문가가 검토 후 피드백을 제공해드릴 예정입니다.",
      });
    } catch (error) {
      console.error('Error submitting feedback request:', error);
      toast({
        title: "요청 실패",
        description: error instanceof Error ? error.message : "피드백 요청 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelRequest = async () => {
    if (!existingRequest) return;

    try {
      const { error } = await supabase
        .from('expert_feedback_requests')
        .update({ request_status: 'cancelled' })
        .eq('id', existingRequest.id);

      if (error) throw error;

      setExistingRequest({ ...existingRequest, request_status: 'cancelled' });
      toast({
        title: "요청 취소됨",
        description: "전문가 피드백 요청이 취소되었습니다.",
      });
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast({
        title: "취소 실패",
        description: "요청 취소 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4" />,
          label: '대기중',
          color: 'bg-yellow-100 text-yellow-800',
          description: '전문가 배정을 기다리고 있습니다.'
        };
      case 'in_progress':
        return {
          icon: <MessageCircle className="h-4 w-4" />,
          label: '검토중',
          color: 'bg-blue-100 text-blue-800',
          description: '전문가가 관찰일지를 검토하고 있습니다.'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: '완료',
          color: 'bg-green-100 text-green-800',
          description: '전문가 피드백이 완료되었습니다.'
        };
      case 'cancelled':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          label: '취소됨',
          color: 'bg-gray-100 text-gray-800',
          description: '요청이 취소되었습니다.'
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          label: '알 수 없음',
          color: 'bg-gray-100 text-gray-800',
          description: ''
        };
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { label: '긴급', color: 'bg-red-100 text-red-800' };
      case 'high':
        return { label: '높음', color: 'bg-orange-100 text-orange-800' };
      case 'normal':
        return { label: '보통', color: 'bg-blue-100 text-blue-800' };
      case 'low':
        return { label: '낮음', color: 'bg-gray-100 text-gray-800' };
      default:
        return { label: '보통', color: 'bg-blue-100 text-blue-800' };
    }
  };

  if (existingRequest) {
    const statusInfo = getStatusInfo(existingRequest.request_status);
    const priorityInfo = getPriorityInfo(existingRequest.priority_level);

    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              전문가 피드백 요청
            </CardTitle>
            <div className="flex gap-2">
              <Badge className={priorityInfo.color}>
                {priorityInfo.label}
              </Badge>
              <Badge className={statusInfo.color}>
                {statusInfo.icon}
                <span className="ml-1">{statusInfo.label}</span>
              </Badge>
            </div>
          </div>
          <CardDescription>
            {observationTitle && `${observationTitle}에 대한 `}전문가 피드백 요청 상태
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {statusInfo.description}
            </AlertDescription>
          </Alert>

          {existingRequest.request_note && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">요청 내용</h4>
              <p className="text-sm text-gray-700">{existingRequest.request_note}</p>
            </div>
          )}

          {existingRequest.expert_report && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-sm mb-2 text-green-800 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                전문가 피드백
              </h4>
              <p className="text-sm text-green-700 whitespace-pre-wrap">
                {existingRequest.expert_report}
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500">
            요청일: {new Date(existingRequest.requested_at).toLocaleString()}
            {existingRequest.completed_at && (
              <> | 완료일: {new Date(existingRequest.completed_at).toLocaleString()}</>
            )}
          </div>

          {existingRequest.request_status === 'pending' && (
            <Button
              variant="outline"
              onClick={cancelRequest}
              className="w-full"
            >
              요청 취소
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <User className="h-4 w-4 mr-2" />
          전문가 피드백 요청
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            전문가 피드백 요청
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <MessageCircle className="h-4 w-4" />
            <AlertDescription>
              관찰일지에 대한 전문가의 상세한 분석과 개선 방안을 받을 수 있습니다.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium">
              우선순위
            </label>
            <Select value={priorityLevel} onValueChange={(value: any) => setPriorityLevel(value)}>
              <SelectTrigger>
                <SelectValue placeholder="우선순위를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">낮음 - 일반적인 피드백</SelectItem>
                <SelectItem value="normal">보통 - 상세한 분석 필요</SelectItem>
                <SelectItem value="high">높음 - 우선 검토 필요</SelectItem>
                <SelectItem value="urgent">긴급 - 즉시 검토 필요</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="request-note" className="text-sm font-medium">
              요청 내용 *
            </label>
            <Textarea
              id="request-note"
              placeholder="전문가에게 궁금한 점이나 특별히 분석받고 싶은 부분을 자세히 적어주세요..."
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={submitFeedbackRequest}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "요청 중..." : "피드백 요청"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};