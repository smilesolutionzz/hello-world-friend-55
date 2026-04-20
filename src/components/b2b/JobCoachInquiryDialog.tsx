import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTier?: string;
}

export const JobCoachInquiryDialog: React.FC<Props> = ({ open, onOpenChange, defaultTier }) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    position: '',
    employee_count: '',
    industry: '',
    interested_tier: defaultTier || '',
    message: '',
  });

  React.useEffect(() => {
    if (defaultTier) setForm((p) => ({ ...p, interested_tier: defaultTier }));
  }, [defaultTier]);

  const handleSubmit = async () => {
    if (!form.company_name || !form.contact_name || !form.contact_email) {
      toast({ title: '회사명, 담당자명, 이메일을 입력해주세요.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('b2b_jobcoach_inquiries').insert({
        company_name: form.company_name,
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone || null,
        position: form.position || null,
        employee_count: parseInt(form.employee_count || '0', 10),
        industry: form.industry || null,
        interested_tier: form.interested_tier || null,
        message: form.message || null,
        source: 'b2b_jobcoach',
      });
      if (error) throw error;
      toast({
        title: '문의가 접수되었습니다!',
        description: '영업일 기준 1일 이내 전담 매니저가 연락드립니다.',
      });
      onOpenChange(false);
      setForm({
        company_name: '', contact_name: '', contact_email: '', contact_phone: '',
        position: '', employee_count: '', industry: '', interested_tier: '', message: '',
      });
    } catch (e: any) {
      toast({ title: '오류가 발생했습니다', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">기업 도입 문의</DialogTitle>
          </div>
          <DialogDescription className="break-keep">
            전담 매니저가 1일 이내 연락드려 무료 시범 운영을 안내해드립니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">회사명 *</Label>
              <Input
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="(주)예시기업"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">임직원 수</Label>
              <Input
                type="number"
                value={form.employee_count}
                onChange={(e) => setForm({ ...form, employee_count: e.target.value })}
                placeholder="150"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">담당자명 *</Label>
              <Input
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                placeholder="홍길동"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">직책</Label>
              <Input
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                placeholder="HR팀장"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">이메일 *</Label>
              <Input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                placeholder="hr@company.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">연락처</Label>
              <Input
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                placeholder="010-1234-5678"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">업종</Label>
              <Input
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                placeholder="IT/제조/금융 등"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">관심 플랜</Label>
              <Select
                value={form.interested_tier}
                onValueChange={(v) => setForm({ ...form, interested_tier: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">문의 내용</Label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="현재 임직원 정신건강 관리 현황, 도입 시점 등 자유롭게 작성해주세요."
              rows={3}
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-11 font-bold mt-2"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 접수 중...</>
            ) : (
              '도입 문의 보내기'
            )}
          </Button>
          <p className="text-[11px] text-muted-foreground text-center break-keep">
            제출하시면 개인정보 처리방침에 동의하는 것으로 간주됩니다. 영업 외 목적 미사용.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobCoachInquiryDialog;
