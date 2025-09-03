import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Loader2, Info } from 'lucide-react';

interface VoucherType {
  id: string;
  name: string;
  description: string;
  monthly_amount: number;
  session_limit: number;
  age_min: number;
  age_max: number;
}

interface VoucherRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistrationComplete: () => void;
}

export const VoucherRegistrationDialog = ({
  open,
  onOpenChange,
  onRegistrationComplete
}: VoucherRegistrationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [voucherTypes, setVoucherTypes] = useState<VoucherType[]>([]);
  const [selectedVoucherType, setSelectedVoucherType] = useState<string>('');
  
  const [formData, setFormData] = useState({
    voucher_number: '',
    issue_date: '',
    expire_date: '',
    notes: '',
  });

  const { toast } = useToast();
  const { user } = useAuthGuard();

  useEffect(() => {
    if (open) {
      fetchVoucherTypes();
    }
  }, [open]);

  const fetchVoucherTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('voucher_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setVoucherTypes(data || []);
    } catch (error) {
      console.error('Error fetching voucher types:', error);
      toast({
        title: "오류",
        description: "바우처 유형을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const getSelectedVoucherType = () => {
    return voucherTypes.find(vt => vt.id === selectedVoucherType);
  };

  const calculateVoucherDetails = () => {
    const voucherType = getSelectedVoucherType();
    if (!voucherType) return null;

    return {
      total_amount: voucherType.monthly_amount,
      remaining_amount: voucherType.monthly_amount,
      used_amount: 0,
      total_sessions: voucherType.session_limit,
      remaining_sessions: voucherType.session_limit,
      used_sessions: 0,
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

    if (!selectedVoucherType) {
      toast({
        title: "오류",
        description: "바우처 유형을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const voucherDetails = calculateVoucherDetails();
      
      const { error } = await supabase
        .from('user_vouchers')
        .insert({
          user_id: user.id,
          voucher_type_id: selectedVoucherType,
          voucher_number: formData.voucher_number,
          issue_date: formData.issue_date,
          expire_date: formData.expire_date,
          notes: formData.notes || null,
          ...voucherDetails,
        });

      if (error) throw error;

      toast({
        title: "등록 완료",
        description: "바우처가 성공적으로 등록되었습니다.",
      });

      // 폼 초기화
      setFormData({
        voucher_number: '',
        issue_date: '',
        expire_date: '',
        notes: '',
      });
      setSelectedVoucherType('');

      onRegistrationComplete();
    } catch (error: any) {
      console.error('Error registering voucher:', error);
      
      let errorMessage = "바우처 등록에 실패했습니다.";
      if (error.code === '23505') {
        errorMessage = "이미 등록된 바우처 번호입니다.";
      }
      
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedVoucherTypeInfo = getSelectedVoucherType();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>바우처 등록</DialogTitle>
          <DialogDescription>
            보유하신 바우처 정보를 등록하여 재가방문 서비스를 이용하세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 바우처 유형 선택 */}
          <div>
            <Label htmlFor="voucher_type">바우처 유형 *</Label>
            <Select value={selectedVoucherType} onValueChange={setSelectedVoucherType}>
              <SelectTrigger>
                <SelectValue placeholder="바우처 유형을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {voucherTypes.map((voucherType) => (
                  <SelectItem key={voucherType.id} value={voucherType.id}>
                    {voucherType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 선택된 바우처 유형 정보 */}
          {selectedVoucherTypeInfo && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  {selectedVoucherTypeInfo.name}
                </CardTitle>
                <CardDescription>{selectedVoucherTypeInfo.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">월 지원금액:</span>
                    <span className="ml-2">{selectedVoucherTypeInfo.monthly_amount.toLocaleString()}원</span>
                  </div>
                  <div>
                    <span className="font-medium">월 이용횟수:</span>
                    <span className="ml-2">{selectedVoucherTypeInfo.session_limit}회</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">대상 연령:</span>
                    <span className="ml-2">
                      {selectedVoucherTypeInfo.age_min}세 - {selectedVoucherTypeInfo.age_max}세
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 바우처 상세 정보 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="voucher_number">바우처 번호 *</Label>
              <Input
                id="voucher_number"
                value={formData.voucher_number}
                onChange={(e) => setFormData({...formData, voucher_number: e.target.value})}
                placeholder="바우처 번호를 입력하세요"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issue_date">발급일 *</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="expire_date">만료일 *</Label>
                <Input
                  id="expire_date"
                  type="date"
                  value={formData.expire_date}
                  onChange={(e) => setFormData({...formData, expire_date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">메모</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="추가 메모사항이 있으시면 입력하세요"
                rows={3}
              />
            </div>
          </div>

          {/* 안내사항 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">바우처 등록 안내사항</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 바우처 번호는 중복 등록이 불가능합니다.</li>
              <li>• 등록 후 바우처 정보는 수정이 제한될 수 있습니다.</li>
              <li>• 바우처 사용 내역은 실시간으로 업데이트됩니다.</li>
              <li>• 만료일이 지난 바우처는 사용할 수 없습니다.</li>
            </ul>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              취소
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              바우처 등록
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};