import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Copy, CheckCircle, AlertCircle } from 'lucide-react';

const BankTransferRequest = () => {
  const [formData, setFormData] = useState({
    depositorName: '',
    transferAmount: '',
    requestedTokens: '',
    bankName: '',
    transferDate: '',
    requestNote: '',
    requestType: 'token_purchase',
    subscriptionPlanId: '',
    subscriptionDurationMonths: 1
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthGuard();

  const bankInfo = {
    bankName: "신한은행",
    accountNumber: "110-421-048730",
    accountHolder: "이수석"
  };

  const tokenPrices = [
    { tokens: 50, price: 9900, name: "토큰팩 50" },
    { tokens: 150, price: 19900, name: "토큰팩 150 (추천)" },
    { tokens: 400, price: 39900, name: "토큰팩 400" }
  ];

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

    setIsLoading(true);
    try {
      const insertData: any = {
        user_id: user.id,
        user_email: user.email || '',
        depositor_name: formData.depositorName,
        transfer_amount: parseInt(formData.transferAmount),
        bank_name: formData.bankName,
        transfer_date: formData.transferDate || null,
        request_note: formData.requestNote || null,
        request_type: formData.requestType
      };

      if (formData.requestType === 'token_purchase') {
        insertData.requested_tokens = parseInt(formData.requestedTokens);
      } else if (formData.requestType === 'subscription_payment') {
        insertData.subscription_plan_id = formData.subscriptionPlanId || null;
        insertData.subscription_duration_months = formData.subscriptionDurationMonths;
        insertData.requested_tokens = 0; // 구독은 토큰이 아님
      }

      const { error } = await supabase
        .from('bank_transfer_requests')
        .insert(insertData);

      if (error) throw error;

      const successMessage = formData.requestType === 'subscription_payment' 
        ? "구독 결제 신청이 완료되었습니다. 입금 확인 후 구독이 활성화됩니다."
        : "입금 신청 완료되었습니다. 입금 확인 후 토큰이 지급됩니다.";

      toast({
        title: "신청 완료",
        description: successMessage,
      });

      // 폼 초기화
      setFormData({
        depositorName: '',
        transferAmount: '',
        requestedTokens: '',
        bankName: '',
        transferDate: '',
        requestNote: '',
        requestType: 'token_purchase',
        subscriptionPlanId: '',
        subscriptionDurationMonths: 1
      });
    } catch (error) {
      console.error('입금 신청 오류:', error);
      toast({
        title: "신청 실패",
        description: "입금 신청 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 토큰 가격표 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            토큰 가격표
          </CardTitle>
          <CardDescription>원하는 토큰 수량을 확인하고 해당 금액을 입금해주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tokenPrices.map((plan) => (
              <div key={plan.tokens} className="p-4 border rounded-lg text-center">
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <div className="text-2xl font-bold text-primary my-2">
                  {plan.tokens}토큰
                </div>
                <div className="text-lg">₩{plan.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 계좌 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            입금 계좌 정보
          </CardTitle>
          <CardDescription>아래 계좌로 토큰 구매 금액을 입금해주세요.</CardDescription>
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
            입금 후 아래 정보를 입력하여 토큰 지급을 요청해주세요.
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
                  placeholder="9900"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestedTokens">요청 토큰 수 *</Label>
                <Input
                  id="requestedTokens"
                  type="number"
                  value={formData.requestedTokens}
                  onChange={(e) => setFormData(prev => ({ ...prev, requestedTokens: e.target.value }))}
                  placeholder="100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">입금 은행명</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="국민은행"
                />
              </div>
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
              disabled={isLoading}
            >
              {isLoading ? '신청 중...' : '입금 완료 신청'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankTransferRequest;