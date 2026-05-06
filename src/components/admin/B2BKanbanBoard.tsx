import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Mail, Phone, FileText } from 'lucide-react';

type KanbanStatus = 'new' | 'contacted' | 'qualified' | 'quote_sent' | 'won' | 'lost';
const COLUMNS: { key: KanbanStatus; label: string; tone: string }[] = [
  { key: 'new', label: '신규', tone: 'bg-blue-50 border-blue-200' },
  { key: 'contacted', label: '컨택', tone: 'bg-amber-50 border-amber-200' },
  { key: 'qualified', label: '자격 검증', tone: 'bg-violet-50 border-violet-200' },
  { key: 'quote_sent', label: '견적 발송', tone: 'bg-cyan-50 border-cyan-200' },
  { key: 'won', label: '계약 성사', tone: 'bg-emerald-50 border-emerald-200' },
  { key: 'lost', label: '종료', tone: 'bg-zinc-100 border-zinc-200' },
];

interface Inquiry {
  id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  employee_count: number | null;
  interested_tier: string | null;
  source: string | null;
  message: string | null;
  kanban_status: KanbanStatus;
  lead_score: number;
  last_activity_at: string;
  created_at: string;
}

export default function B2BKanbanBoard() {
  const { toast } = useToast();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('b2b_jobcoach_inquiries')
      .select('*')
      .order('last_activity_at', { ascending: false })
      .limit(300);
    setItems(((data as any) || []).map((r: any) => ({ ...r, kanban_status: r.kanban_status || 'new', lead_score: r.lead_score ?? 0 })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: KanbanStatus) => {
    setItems((prev) => prev.map((p) => p.id === id ? { ...p, kanban_status: status } : p));
    const { error } = await supabase
      .from('b2b_jobcoach_inquiries')
      .update({ kanban_status: status, status, last_activity_at: new Date().toISOString() })
      .eq('id', id);
    if (error) toast({ title: '저장 실패', description: error.message, variant: 'destructive' });
  };

  const issueQuoteShortcut = async (inq: Inquiry) => {
    if (!inq.interested_tier || !inq.employee_count) {
      toast({ title: '데이터 부족', description: '플랜과 인원이 필요합니다', variant: 'destructive' });
      return;
    }
    const { data, error } = await supabase.functions.invoke('generate-b2b-document', {
      body: {
        mode: 'quote',
        inquiry_id: inq.id,
        plan_key: inq.interested_tier,
        company_name: inq.company_name,
        contact_name: inq.contact_name,
        contact_email: inq.contact_email,
        employee_count: inq.employee_count,
        months: 12,
      },
    });
    if (error || !data?.ok) {
      toast({ title: '견적 생성 실패', description: error?.message || data?.error, variant: 'destructive' });
      return;
    }
    toast({ title: '견적 생성됨', description: data.quote_no });
    updateStatus(inq.id, 'quote_sent');
  };

  if (loading) return <Skeleton className="h-96 w-full rounded-2xl" />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">B2B 영업 칸반 ({items.length})</h3>
        <Button variant="ghost" size="sm" onClick={load}>
          <RefreshCw className="w-3 h-3 mr-1" /> 새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 overflow-x-auto">
        {COLUMNS.map((col) => {
          const cards = items.filter((i) => i.kanban_status === col.key);
          return (
            <div key={col.key} className={`rounded-2xl border ${col.tone} p-3 min-h-[300px]`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wide">{col.label}</span>
                <Badge variant="outline" className="text-[10px]">{cards.length}</Badge>
              </div>
              <div className="space-y-2">
                {cards.map((c) => (
                  <Card key={c.id} className="p-3 bg-white text-xs space-y-2">
                    <div>
                      <p className="font-semibold text-sm truncate">{c.company_name}</p>
                      <p className="text-muted-foreground truncate">{c.contact_name || c.contact_email}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {c.employee_count && <Badge variant="secondary" className="text-[10px]">{c.employee_count}명</Badge>}
                      {c.interested_tier && <Badge variant="outline" className="text-[10px]">{c.interested_tier}</Badge>}
                      {c.source && <Badge variant="outline" className="text-[10px] truncate max-w-[100px]">{c.source}</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <a href={`mailto:${c.contact_email}`} className="hover:text-primary"><Mail className="w-3 h-3" /></a>
                      {c.contact_phone && <a href={`tel:${c.contact_phone}`} className="hover:text-primary"><Phone className="w-3 h-3" /></a>}
                      {(c.kanban_status === 'qualified' || c.kanban_status === 'contacted') && (
                        <button onClick={() => issueQuoteShortcut(c)} className="ml-auto text-primary flex items-center gap-1">
                          <FileText className="w-3 h-3" /> 견적
                        </button>
                      )}
                    </div>
                    <Select value={c.kanban_status} onValueChange={(v) => updateStatus(c.id, v as KanbanStatus)}>
                      <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {COLUMNS.map((cc) => <SelectItem key={cc.key} value={cc.key} className="text-xs">{cc.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
