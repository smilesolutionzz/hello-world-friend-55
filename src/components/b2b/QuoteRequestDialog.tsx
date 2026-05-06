import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Loader2 } from 'lucide-react';
import { z } from 'zod';

const schema = z.object({
  company_name: z.string().trim().min(1).max(120),
  contact_name: z.string().trim().min(1).max(80),
  contact_email: z.string().trim().email().max(255),
  employee_count: z.coerce.number().int().min(1).max(100000),
  months: z.coerce.number().int().min(1).max(60),
});

interface Props {
  planKey: string;
  planName: string;
  unitPrice: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const QuoteRequestDialog = ({ planKey, planName, unitPrice, open, onOpenChange }: Props) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ pdf_url: string; quote_no: string; total: number } | null>(null);
  const [form, setForm] = useState({
    company_name: '', contact_name: '', contact_email: '',
    employee_count: 30, months: 12,
  });

  const subtotal = unitPrice * form.employee_count * form.months;
  const vat = Math.round(subtotal * 0.1);
  const total = subtotal + vat;

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: '입력 확인', description: parsed.error.issues[0].message, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      // 1) inquiry 생성
      const { data: inq } = await supabase.from('b2b_jobcoach_inquiries').insert({
        company_name: form.company_name,
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        employee_count: form.employee_count,
        interested_tier: planKey,
        source: 'quote_request',
        status: 'new',
        kanban_status: 'qualified',
        message: `[견적 요청] ${planName} ${form.employee_count}명 × ${form.months}개월`,
        last_activity_at: new Date().toISOString(),
      }).select().single();

      // 2) 견적서 생성
      const { data, error } = await supabase.functions.invoke('generate-b2b-document', {
        body: {
          mode: 'quote',
          inquiry_id: inq?.id,
          plan_key: planKey,
          ...parsed.data,
        },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'generation failed');

      setResult({ pdf_url: data.pdf_url, quote_no: data.quote_no, total: data.total });
      toast({ title: '견적서가 생성되었습니다', description: data.quote_no });
    } catch (e: any) {
      toast({ title: '실패', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setResult(null); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> {planName} 견적서 받기
          </DialogTitle>
          <DialogDescription>입력 즉시 PDF 견적서가 자동 생성됩니다.</DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 py-4">
            <div className="rounded-2xl border bg-emerald-50/50 border-emerald-200 p-4 text-center">
              <p className="text-xs text-emerald-700 mb-1">견적 번호</p>
              <p className="font-mono font-bold text-lg">{result.quote_no}</p>
              <p className="text-xs text-muted-foreground mt-2">총액 ₩{result.total.toLocaleString()}</p>
            </div>
            <Button asChild className="w-full">
              <a href={result.pdf_url} target="_blank" rel="noreferrer">
                <Download className="w-4 h-4 mr-2" /> 견적서 PDF 다운로드
              </a>
            </Button>
            <p className="text-[11px] text-center text-muted-foreground">
              담당자가 영업일 1일 내로 연락드립니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">회사명 *</Label>
                <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">담당자 *</Label>
                <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">이메일 *</Label>
              <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">직원 수</Label>
                <Input type="number" min={1} value={form.employee_count}
                  onChange={(e) => setForm({ ...form, employee_count: Number(e.target.value) })} />
              </div>
              <div>
                <Label className="text-xs">계약 개월</Label>
                <Input type="number" min={1} max={60} value={form.months}
                  onChange={(e) => setForm({ ...form, months: Number(e.target.value) })} />
              </div>
            </div>
            <div className="rounded-xl bg-muted p-3 text-sm space-y-1">
              <div className="flex justify-between text-muted-foreground"><span>월 단가</span><span>₩{unitPrice.toLocaleString()}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>소계</span><span>₩{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>VAT 10%</span><span>₩{vat.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold pt-1 border-t"><span>예상 총액</span><span>₩{total.toLocaleString()}</span></div>
            </div>
            <Button className="w-full" onClick={submit} disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 생성 중...</> : '견적서 생성'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuoteRequestDialog;
