import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Zap, 
  Clock, 
  Video, 
  Phone, 
  MessageSquare, 
  Shield, 
  AlertTriangle,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface UrgentExpertConnectProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  crisisAlertId?: string;
  severityLevel?: 'low' | 'medium' | 'high' | 'critical';
}

interface RequestType {
  id: 'standard' | 'urgent' | 'emergency';
  name: string;
  description: string;
  fee: string;
  feeAmount: number;
  waitTime: string;
  badge?: string;
  badgeColor?: string;
}

const requestTypes: RequestType[] = [
  {
    id: 'standard',
    name: '일반 연결',
    description: '다음 가능한 시간에 전문가와 연결',
    fee: '상담료의 20%',
    feeAmount: 0,
    waitTime: '24시간 내',
  },
  {
    id: 'urgent',
    name: '긴급 연결',
    description: '빠른 시간 내 전문가 우선 매칭',
    fee: '+5,000원',
    feeAmount: 5000,
    waitTime: '3시간 내',
    badge: '추천',
    badgeColor: 'bg-orange-500',
  },
  {
    id: 'emergency',
    name: '즉시 연결',
    description: '현재 대기 중인 전문가와 즉시 연결',
    fee: '+10,000원',
    feeAmount: 10000,
    waitTime: '30분 내',
    badge: '가장 빠름',
    badgeColor: 'bg-red-500',
  },
];

const consultationMethods = [
  { id: 'video', name: '화상 상담', icon: Video, description: 'Zoom으로 얼굴을 보며 상담' },
  { id: 'phone', name: '전화 상담', icon: Phone, description: '편하게 전화로 상담' },
  { id: 'chat', name: '채팅 상담', icon: MessageSquare, description: '실시간 채팅으로 상담' },
];

export const UrgentExpertConnect = ({ 
  isOpen, 
  onClose, 
  userId,
  crisisAlertId,
  severityLevel = 'medium'
}: UrgentExpertConnectProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<'standard' | 'urgent' | 'emergency'>('urgent');
  const [selectedMethod, setSelectedMethod] = useState('video');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!userId) {
      toast({
        title: "로그인 필요",
        description: "전문가 연결을 위해 로그인이 필요합니다.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      // 긴급 연결 요청 생성
      const { data, error } = await supabase
        .from('urgent_expert_requests')
        .insert({
          user_id: userId,
          crisis_alert_id: crisisAlertId,
          request_type: selectedType,
          preferred_method: selectedMethod,
          urgency_fee: requestTypes.find(t => t.id === selectedType)?.feeAmount || 0,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // 위기 알림이 있으면 전문가 연결 상태 업데이트
      if (crisisAlertId) {
        await supabase
          .from('crisis_alerts')
          .update({ expert_connected: true })
          .eq('id', crisisAlertId);
      }

      setIsSuccess(true);
      
      toast({
        title: "연결 요청 완료!",
        description: `${requestTypes.find(t => t.id === selectedType)?.waitTime} 전문가가 연락드립니다.`,
      });

      // 3초 후 닫기
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        navigate('/expert-hiring');
      }, 3000);

    } catch (error) {
      console.error('긴급 연결 요청 실패:', error);
      toast({
        title: "요청 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTypeInfo = requestTypes.find(t => t.id === selectedType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">연결 요청 완료!</h3>
              <p className="text-muted-foreground mb-4">
                {selectedTypeInfo?.waitTime} 전문가가 연락드립니다
              </p>
              <p className="text-sm text-muted-foreground">
                잠시 후 전문가 목록 페이지로 이동합니다...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <DialogTitle>전문가 긴급 연결</DialogTitle>
                    <DialogDescription>
                      지금 바로 전문 상담사와 연결해드립니다
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {severityLevel === 'critical' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    위기 상황이 감지되었습니다. 즉시 연결을 권장합니다.
                  </p>
                </div>
              )}

              <div className="space-y-6 py-4">
                {/* 연결 유형 선택 */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">연결 유형</Label>
                  <RadioGroup value={selectedType} onValueChange={(v) => setSelectedType(v as typeof selectedType)}>
                    <div className="space-y-3">
                      {requestTypes.map((type) => (
                        <div
                          key={type.id}
                          className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedType === type.id 
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedType(type.id)}
                        >
                          <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={type.id} className="font-medium cursor-pointer">
                                {type.name}
                              </Label>
                              {type.badge && (
                                <Badge className={`${type.badgeColor} text-white text-xs`}>
                                  {type.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {type.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1 text-primary">
                                <Zap className="w-3 h-3" />
                                {type.fee}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {type.waitTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* 상담 방식 선택 */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">상담 방식</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {consultationMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedMethod(method.id)}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            selectedMethod === method.id
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mx-auto mb-1 ${
                            selectedMethod === method.id ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <p className="text-xs font-medium">{method.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 비용 안내 */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">기본 상담료</span>
                      <span className="text-sm">전문가별 상이</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">플랫폼 수수료</span>
                      <span className="text-sm">{selectedTypeInfo?.fee}</span>
                    </div>
                    {selectedTypeInfo?.feeAmount > 0 && (
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-medium">긴급 연결 추가 요금</span>
                        <span className="text-sm font-medium text-primary">
                          +{selectedTypeInfo.feeAmount.toLocaleString()}원
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  취소
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className={`flex-1 ${
                    selectedType === 'emergency' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : selectedType === 'urgent'
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      요청 중...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      전문가 연결 요청
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default UrgentExpertConnect;
