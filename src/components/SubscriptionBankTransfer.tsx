import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useSubscription } from '@/hooks/useSubscription';
import { Copy, CheckCircle, AlertCircle, Crown } from 'lucide-react';

interface SubscriptionBankTransferProps {
  selectedPlanId?: string;
}

const SubscriptionBankTransfer = ({ selectedPlanId }: SubscriptionBankTransferProps) => {
  const [formData, setFormData] = useState({
    depositorName: '',
    transferAmount: '',
    bankName: '',
    transferDate: '',
    requestNote: '',
    subscriptionPlanId: selectedPlanId || '',
    subscriptionDurationMonths: 1
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthGuard();
  const { availablePlans } = useSubscription();

  const bankInfo = {
    bankName: "신한은행",
    accountNumber: "110-421-048730",
    accountHolder: "이수석"
  };

  const subscriptionPlans = [
    { id: 'premium', name: '프리미엄 플랜', price: 29900 },
    { id: 'basic', name: '베이직 플랜', price: 19900 },
    { id: 'pro', name: '프로 플랜', price: 49900 }
  ];

  const durationOptions = [
    { value: 1, label: '1개월', discount: 0 },
    { value: 3, label: '3개월', discount: 10 },
    { value: 6, label: '6개월', discount: 15 },
    { value: 12, label: '12개월', discount: 20 }
  ];

  const getSelectedPlan = () => {
    return subscriptionPlans.find(plan => plan.id === formData.subscriptionPlanId);
  };

  const getDiscountRate = () => {
    const duration = durationOptions.find(d => d.value === formData.subscriptionDurationMonths);
    return duration?.discount || 0;
  };

  const calculateTotalAmount = () => {
    const plan = getSelectedPlan();
    if (!plan) return 0;
    
    const baseAmount = plan.price * formData.subscriptionDurationMonths;
    const discountRate = getDiscountRate();
    const discountAmount = baseAmount * (discountRate / 100);
    return baseAmount - discountAmount;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "복사 완료",
      description: "클립보드에 복사되었습니다.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "먼저 로그인해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.subscriptionPlanId) {
      toast({
        title: "플랜 선택 필요",
        description: "구독할 플랜을 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('bank_transfer_requests')
        .insert({
          user_id: user.id,
          user_email: user.email || '',
          depositor_name: formData.depositorName,
          transfer_amount: calculateTotalAmount(),
          requested_tokens: 0,
          bank_name: formData.bankName,
          transfer_date: formData.transferDate || null,
          request_note: formData.requestNote || null,
          request_type: 'subscription_payment',
          subscription_plan_id: formData.subscriptionPlanId,
          subscription_duration_months: formData.subscriptionDurationMonths
        });

      if (error) throw error;

      toast({
        title: "구독 결제 신청 완료",
        description: "입금 확인 후 구독이 활성화됩니다. 최대 24시간 소요됩니다.",
      });

      // 폼 초기화
      setFormData({
        depositorName: '',
        transferAmount: '',
        bankName: '',
        transferDate: '',
        requestNote: '',
        subscriptionPlanId: selectedPlanId || '',
        subscriptionDurationMonths: 1
      });
    } catch (error) {
      console.error('구독 신청 오류:', error);
      toast({
        title: "신청 실패",
        description: "구독 신청 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (selectedPlanId) {
      setFormData(prev => ({ ...prev, subscriptionPlanId: selectedPlanId }));
    }
  }, [selectedPlanId]);

  React.useEffect(() => {
    const totalAmount = calculateTotalAmount();
    setFormData(prev => ({ ...prev, transferAmount: totalAmount.toString() }));
  }, [formData.subscriptionPlanId, formData.subscriptionDurationMonths]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 구독 플랜 선택 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-500" />
            구독 플랜 선택
          </CardTitle>
          <CardDescription>원하는 구독 플랜과 기간을 선택해주세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subscriptionPlan">구독 플랜 *</Label>
              <Select 
                value={formData.subscriptionPlanId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, subscriptionPlanId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="구독 플랜을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - ₩{plan.price.toLocaleString()}/월
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">구독 기간 *</Label>
              <Select 
                value={formData.subscriptionDurationMonths.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, subscriptionDurationMonths: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="구독 기간을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label} {option.discount > 0 && `(${option.discount}% 할인)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.subscriptionPlanId && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>선택한 플랜:</span>
                  <span className="font-medium">{getSelectedPlan()?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>기간:</span>
                  <span className="font-medium">{formData.subscriptionDurationMonths}개월</span>
                </div>
                {getDiscountRate() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>할인율:</span>
                    <span className="font-medium">{getDiscountRate()}%</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>총 결제 금액:</span>
                  <span>₩{calculateTotalAmount().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 계좌 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            입금 계좌 정보
          </CardTitle>
          <CardDescription>아래 계좌로 구독 요금을 입금해주세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-6 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">은행명</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{bankInfo.bankName}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(bankInfo.bankName)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">계좌번호</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{bankInfo.accountNumber}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(bankInfo.accountNumber)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">예금주</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{bankInfo.accountHolder}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(bankInfo.accountHolder)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 입금 신청 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>입금 완료 신청</CardTitle>
          <CardDescription>
            입금 후 아래 정보를 입력하여 구독 활성화를 요청해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="depositorName">입금자명 *</Label>
                <Input
                  id="depositorName"
                  value={formData.depositorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, depositorName: e.target.value }))}
                  placeholder="홍길동"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferAmount">입금금액 *</Label>
                <Input
                  id="transferAmount"
                  type="number"
                  value={formData.transferAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, transferAmount: e.target.value }))}
                  placeholder="29900"
                  required
                  readOnly
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">입금 은행명</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="국민은행"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferDate">입금일시</Label>
                <Input
                  id="transferDate"
                  type="date"
                  value={formData.transferDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, transferDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestNote">요청사항</Label>
              <Textarea
                id="requestNote"
                value={formData.requestNote}
                onChange={(e) => setFormData(prev => ({ ...prev, requestNote: e.target.value }))}
                placeholder="추가 요청사항이 있으시면 입력해주세요."
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !formData.subscriptionPlanId}
            >
              {isLoading ? '신청 중...' : '구독 결제 신청'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionBankTransfer;