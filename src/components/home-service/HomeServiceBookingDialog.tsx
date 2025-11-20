import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Loader2, CreditCard } from 'lucide-react';

interface HomeService {
  id: string;
  service_name: string;
  service_type: string;
  target_age_min: number;
  target_age_max: number;
  session_duration: number;
  price_per_session: number;
  voucher_types_accepted: string[];
  institutions: {
    institution_name: string;
    address: string;
    phone: string;
  };
}

interface VoucherType {
  id: string;
  name: string;
  description: string;
  monthly_amount: number;
  session_limit: number;
  age_min: number;
  age_max: number;
}

interface UserVoucher {
  id: string;
  voucher_number: string;
  remaining_amount: number;
  remaining_sessions: number;
  voucher_types: {
    name: string;
  };
}

interface HomeServiceBookingDialogProps {
  service: HomeService;
  voucherTypes: VoucherType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingComplete: () => void;
}

export const HomeServiceBookingDialog = ({
  service,
  voucherTypes,
  open,
  onOpenChange,
  onBookingComplete
}: HomeServiceBookingDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('voucher');
  
  const [formData, setFormData] = useState({
    child_name: '',
    child_age: '',
    child_birth_date: '',
    service_address: '',
    contact_phone: '',
    emergency_contact: '',
    special_requests: '',
  });

  const { toast } = useToast();
  const { user } = useAuthGuard();

  useEffect(() => {
    if (open && user) {
      fetchUserVouchers();
    }
  }, [open, user]);

  const fetchUserVouchers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_vouchers')
        .select(`
          id,
          voucher_number,
          remaining_amount,
          remaining_sessions,
          voucher_type_id,
          voucher_types (
            name
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .in('voucher_type_id', service.voucher_types_accepted)
        .gt('remaining_amount', 0)
        .gt('remaining_sessions', 0);

      if (error) throw error;
      setUserVouchers(data || []);
    } catch (error) {
      console.error('Error fetching user vouchers:', error);
    }
  };

  const calculateCosts = () => {
    const baseCost = service.price_per_session;
    let voucherCoverage = 0;
    let selfPayAmount = baseCost;

    if (paymentMethod === 'voucher' && selectedVoucher) {
      const voucher = userVouchers.find(v => v.id === selectedVoucher);
      if (voucher) {
        voucherCoverage = Math.min(baseCost, voucher.remaining_amount);
        selfPayAmount = baseCost - voucherCoverage;
      }
    } else if (paymentMethod === 'self_pay') {
      voucherCoverage = 0;
      selfPayAmount = baseCost;
    }

    return {
      estimated_cost: baseCost,
      voucher_coverage: voucherCoverage,
      self_pay_amount: selfPayAmount,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "오류",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const costs = calculateCosts();
      
      const bookingData = {
        user_id: user.id,
        service_id: service.id,
        voucher_id: paymentMethod === 'voucher' ? selectedVoucher : null,
        child_name: formData.child_name,
        child_age: parseInt(formData.child_age),
        child_birth_date: formData.child_birth_date || null,
        service_address: formData.service_address,
        contact_phone: formData.contact_phone,
        emergency_contact: formData.emergency_contact || null,
        special_requests: formData.special_requests || null,
        payment_method: paymentMethod,
        ...costs,
      };

      const { error } = await supabase
        .from('home_service_bookings')
        .insert(bookingData);

      if (error) throw error;

      toast({
        title: "예약 신청 완료",
        description: "재가방문 서비스 예약이 신청되었습니다. 기관에서 연락드릴 예정입니다.",
      });

      onBookingComplete();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "오류",
        description: "예약 신청에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const costs = calculateCosts();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>재가방문 서비스 예약</DialogTitle>
          <DialogDescription>
            {service.service_name} - {service.institutions.institution_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 서비스 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">서비스 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">세션 시간:</span>
                  <span className="ml-2">{service.session_duration}분</span>
                </div>
                <div>
                  <span className="font-medium">세션당 요금:</span>
                  <span className="ml-2">{service.price_per_session.toLocaleString()}원</span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">대상 연령:</span>
                  <span className="ml-2">{service.target_age_min}세 - {service.target_age_max}세</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 아동 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">아동 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="child_name">아동명 *</Label>
                  <Input
                    id="child_name"
                    value={formData.child_name}
                    onChange={(e) => setFormData({...formData, child_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="child_age">나이 *</Label>
                  <Input
                    id="child_age"
                    type="number"
                    min={service.target_age_min}
                    max={service.target_age_max}
                    value={formData.child_age}
                    onChange={(e) => setFormData({...formData, child_age: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="child_birth_date">생년월일</Label>
                <Input
                  id="child_birth_date"
                  type="date"
                  value={formData.child_birth_date}
                  onChange={(e) => setFormData({...formData, child_birth_date: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* 연락처 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">연락처 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="service_address">서비스 주소 *</Label>
                <Input
                  id="service_address"
                  value={formData.service_address}
                  onChange={(e) => setFormData({...formData, service_address: e.target.value})}
                  placeholder="방문 서비스를 받을 주소를 입력하세요"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_phone">연락처 *</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact">비상연락처</Label>
                  <Input
                    id="emergency_contact"
                    type="tel"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 결제 방법 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">결제 방법</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="voucher" id="voucher" />
                  <Label htmlFor="voucher">바우처 사용</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="self_pay" id="self_pay" />
                  <Label htmlFor="self_pay">자부담</Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'voucher' && (
                <div>
                  <Label htmlFor="voucher_select">사용할 바우처 선택</Label>
                  {userVouchers.length > 0 ? (
                    <Select value={selectedVoucher} onValueChange={setSelectedVoucher}>
                      <SelectTrigger>
                        <SelectValue placeholder="바우처를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {userVouchers.map((voucher) => (
                          <SelectItem key={voucher.id} value={voucher.id}>
                            {voucher.voucher_types.name} - {voucher.voucher_number}
                            (잔액: {voucher.remaining_amount.toLocaleString()}원)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-muted-foreground p-3 bg-gray-50 rounded">
                      이 서비스에 사용할 수 있는 바우처가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 비용 계산 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                예상 비용
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>기본 요금:</span>
                  <span>{costs.estimated_cost.toLocaleString()}원</span>
                </div>
                {costs.voucher_coverage > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>바우처 지원:</span>
                    <span>-{costs.voucher_coverage.toLocaleString()}원</span>
                  </div>
                )}
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>실제 부담금:</span>
                  <span>{costs.self_pay_amount.toLocaleString()}원</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 특별 요청사항 */}
          <div>
            <Label htmlFor="special_requests">특별 요청사항</Label>
            <Textarea
              id="special_requests"
              value={formData.special_requests}
              onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
              placeholder="서비스 관련 특별한 요청사항이 있으시면 작성해주세요"
              rows={3}
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              취소
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (paymentMethod === 'voucher' && !selectedVoucher)}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              예약 신청하기
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};