import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lock, Download } from 'lucide-react';
import { z } from 'zod';

const schema = z.object({
  email: z.string().trim().email('올바른 이메일을 입력하세요').max(255),
  contact_name: z.string().trim().min(1, '이름을 입력하세요').max(80),
  company: z.string().trim().min(1, '회사명을 입력하세요').max(120),
  role: z.string().max(60).optional(),
  phone: z.string().max(40).optional(),
});

interface Props {
  assetKey: string;
  assetTitle: string;
  triggerLabel?: string;
  triggerVariant?: 'default' | 'outline' | 'secondary' | 'ghost';
  triggerClassName?: string;
  /** 제출 후 실행될 다운로드/이동 동작 */
  onUnlock: () => void | Promise<void>;
}

export const LeadCaptureGate = ({
  assetKey, assetTitle, triggerLabel = '이메일 입력 후 다운로드',
  triggerVariant = 'default', triggerClassName, onUnlock,
}: Props) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: '', contact_name: '', company: '', role: '', phone: '',
  });

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: '입력 확인', description: parsed.error.issues[0].message, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      // 1) lead 적재
      const { data: lead, error: leadErr } = await supabase.from('b2b_lead_downloads').insert({
        asset_key: assetKey,
        email: parsed.data.email,
        contact_name: parsed.data.contact_name,
        company: parsed.data.company,
        role: parsed.data.role || null,
        phone: parsed.data.phone || null,
        user_agent: navigator.userAgent,
        utm_source: new URLSearchParams(location.search).get('utm_source'),
        utm_medium: new URLSearchParams(location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(location.search).get('utm_campaign'),
      }).select().single();
      if (leadErr) throw leadErr;

      // 2) inquiry 자동 적재 (백엔드에서 처리)
      await supabase.functions.invoke('capture-b2b-lead', {
        body: {
          lead_id: lead.id,
          asset_key: assetKey,
          asset_title: assetTitle,
          email: parsed.data.email,
          contact_name: parsed.data.contact_name,
          company: parsed.data.company,
          role: parsed.data.role,
          phone: parsed.data.phone,
        },
      });

      toast({ title: '확인 메일을 보냈습니다', description: '곧 자료가 다운로드됩니다.' });
      setOpen(false);
      await onUnlock();
    } catch (e: any) {
      toast({ title: '실패', description: e.message || '잠시 후 다시 시도해주세요', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant={triggerVariant}
        className={triggerClassName}
        onClick={() => setOpen(true)}
      >
        <Lock className="w-4 h-4 mr-2" />
        {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-4 h-4" /> {assetTitle}
            </DialogTitle>
            <DialogDescription>
              회사 이메일로 자료를 보내드리고, 도입에 필요한 추가 자료를 안내해드립니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">회사 이메일 *</Label>
              <Input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@company.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">이름 *</Label>
                <Input value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">회사 *</Label>
                <Input value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">역할</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR/인사">HR/인사</SelectItem>
                    <SelectItem value="C레벨">C레벨</SelectItem>
                    <SelectItem value="EAP/복지">EAP/복지</SelectItem>
                    <SelectItem value="구매/총무">구매/총무</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">연락처</Label>
                <Input value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="010-0000-0000" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              제출 시 정보 수집·이용에 동의한 것으로 간주됩니다. 마케팅 수신은 언제든 거부 가능합니다.
            </p>
            <Button className="w-full" onClick={submit} disabled={submitting}>
              {submitting ? '처리 중...' : '자료 받기'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LeadCaptureGate;
