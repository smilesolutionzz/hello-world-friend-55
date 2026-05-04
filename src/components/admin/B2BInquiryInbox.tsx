import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Paperclip, Mail, Phone, Calendar, RefreshCw, ExternalLink, Building2 } from 'lucide-react';

const GOLD = '#C8B88A';

type InquirySource = 'b2b_proposal' | 'b2b_jobcoach';

interface UnifiedInquiry {
  id: string;
  source: InquirySource;
  created_at: string;
  status: string | null;
  institution_name: string;
  institution_type?: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  message: string | null;
  admin_notes: string | null;
  preferred_contact_at?: string | null;
  attachment_url?: string | null;
  attachment_filename?: string | null;
  employee_count?: number | null;
  interested_tier?: string | null;
}

const STATUS_OPTIONS = ['new', 'contacted', 'in_review', 'won', 'lost'];

const STATUS_LABEL: Record<string, string> = {
  new: '신규',
  contacted: '컨택 완료',
  in_review: '검토 중',
  won: '계약 성사',
  lost: '종료',
};

function fmtKST(iso?: string | null) {
  if (!iso) return '-';
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date(iso));
  } catch { return iso; }
}

export default function B2BInquiryInbox() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<UnifiedInquiry[]>([]);
  const [filter, setFilter] = useState<'all' | InquirySource>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const [a, b] = await Promise.all([
      supabase.from('b2b_ad_inquiries').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('b2b_jobcoach_inquiries').select('*').order('created_at', { ascending: false }).limit(200),
    ]);

    const adRows: UnifiedInquiry[] = (a.data ?? []).map((r: any) => ({
      id: r.id,
      source: 'b2b_proposal',
      created_at: r.created_at,
      status: r.status ?? 'new',
      institution_name: r.institution_name,
      institution_type: r.institution_type,
      contact_name: r.contact_name,
      contact_email: r.contact_email,
      contact_phone: r.contact_phone,
      message: r.message,
      admin_notes: r.admin_notes,
      preferred_contact_at: r.preferred_contact_at,
      attachment_url: r.attachment_url,
      attachment_filename: r.attachment_filename,
    }));

    const jcRows: UnifiedInquiry[] = (b.data ?? []).map((r: any) => ({
      id: r.id,
      source: 'b2b_jobcoach',
      created_at: r.created_at,
      status: r.status ?? 'new',
      institution_name: r.company_name,
      institution_type: r.industry,
      contact_name: r.contact_name,
      contact_email: r.contact_email,
      contact_phone: r.contact_phone,
      message: r.message,
      admin_notes: r.admin_note,
      employee_count: r.employee_count,
      interested_tier: r.interested_tier,
    }));

    const merged = [...adRows, ...jcRows].sort(
      (x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime()
    );

    setItems(merged);
    const drafts: Record<string, string> = {};
    merged.forEach((m) => { drafts[m.id] = m.admin_notes ?? ''; });
    setNoteDraft(drafts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (filter !== 'all' && i.source !== filter) return false;
      if (statusFilter !== 'all' && (i.status ?? 'new') !== statusFilter) return false;
      return true;
    });
  }, [items, filter, statusFilter]);

  const counts = useMemo(() => {
    const c = { all: items.length, b2b_proposal: 0, b2b_jobcoach: 0, new: 0 };
    items.forEach((i) => {
      if (i.source === 'b2b_proposal') c.b2b_proposal++;
      if (i.source === 'b2b_jobcoach') c.b2b_jobcoach++;
      if ((i.status ?? 'new') === 'new') c.new++;
    });
    return c;
  }, [items]);

  const updateStatus = async (item: UnifiedInquiry, status: string) => {
    setSavingId(item.id);
    const table = item.source === 'b2b_proposal' ? 'b2b_ad_inquiries' : 'b2b_jobcoach_inquiries';
    const patch: any = { status };
    if (item.source === 'b2b_jobcoach' && status === 'contacted') patch.contacted_at = new Date().toISOString();
    const { error } = await supabase.from(table).update(patch).eq('id', item.id);
    setSavingId(null);
    if (error) {
      toast({ title: '저장 실패', description: error.message, variant: 'destructive' });
      return;
    }
    setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, status } : p)));
    toast({ title: '상태 업데이트', description: STATUS_LABEL[status] ?? status });
  };

  const saveNote = async (item: UnifiedInquiry) => {
    setSavingId(item.id);
    const table = item.source === 'b2b_proposal' ? 'b2b_ad_inquiries' : 'b2b_jobcoach_inquiries';
    const field = item.source === 'b2b_proposal' ? 'admin_notes' : 'admin_note';
    const value = noteDraft[item.id] ?? '';
    const { error } = await supabase.from(table).update({ [field]: value }).eq('id', item.id);
    setSavingId(null);
    if (error) {
      toast({ title: '저장 실패', description: error.message, variant: 'destructive' });
      return;
    }
    setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, admin_notes: value } : p)));
    toast({ title: '메모 저장됨' });
  };

  const openAttachment = async (path?: string | null) => {
    if (!path) return;
    const { data, error } = await supabase.storage.from('b2b-attachments').createSignedUrl(path, 60 * 10);
    if (error || !data?.signedUrl) {
      toast({ title: '첨부 열기 실패', description: error?.message, variant: 'destructive' });
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="rounded-3xl border bg-white p-6 shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold">B2B 문의 인박스</h2>
          <p className="text-xs text-foreground/60 mt-1">
            전체 {counts.all} · 신규 {counts.new} · 도입제안 {counts.b2b_proposal} · 잡코치 {counts.b2b_jobcoach}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="rounded-full">
          <RefreshCw className="h-3 w-3 mr-1" />
          새로고침
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="b2b_proposal">도입 제안</TabsTrigger>
            <TabsTrigger value="b2b_jobcoach">잡코치</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">상태 전체</TabsTrigger>
            {STATUS_OPTIONS.map((s) => (
              <TabsTrigger key={s} value={s}>{STATUS_LABEL[s]}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-foreground/50 text-sm">
          표시할 문의가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const status = item.status ?? 'new';
            return (
              <div key={`${item.source}-${item.id}`} className="rounded-2xl border bg-white p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge variant="outline" className="text-[10px]" style={{ borderColor: GOLD, color: GOLD }}>
                        {item.source === 'b2b_proposal' ? '도입 제안' : '잡코치'}
                      </Badge>
                      <Badge variant={status === 'new' ? 'default' : 'secondary'} className="text-[10px]">
                        {STATUS_LABEL[status] ?? status}
                      </Badge>
                      <span className="text-[11px] text-foreground/50">{fmtKST(item.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-foreground/50" />
                      <h3 className="font-semibold">{item.institution_name}</h3>
                      {item.institution_type && (
                        <span className="text-xs text-foreground/50">· {item.institution_type}</span>
                      )}
                      {item.employee_count != null && (
                        <span className="text-xs text-foreground/50">· {item.employee_count}명</span>
                      )}
                      {item.interested_tier && (
                        <span className="text-xs text-foreground/50">· {item.interested_tier}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-foreground/70 flex-wrap">
                      <span>{item.contact_name}</span>
                      <a href={`mailto:${item.contact_email}`} className="flex items-center gap-1 hover:underline">
                        <Mail className="h-3 w-3" />{item.contact_email}
                      </a>
                      {item.contact_phone && (
                        <a href={`tel:${item.contact_phone}`} className="flex items-center gap-1 hover:underline">
                          <Phone className="h-3 w-3" />{item.contact_phone}
                        </a>
                      )}
                      {item.preferred_contact_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />희망: {fmtKST(item.preferred_contact_at)}
                        </span>
                      )}
                      {item.attachment_url && (
                        <button onClick={() => openAttachment(item.attachment_url)}
                          className="flex items-center gap-1 hover:underline" style={{ color: GOLD }}>
                          <Paperclip className="h-3 w-3" />
                          {item.attachment_filename ?? '첨부파일'}
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {item.message && (
                  <div className="mt-3 p-3 rounded-xl bg-[#FAF8F2] text-sm text-foreground/80 whitespace-pre-wrap">
                    {item.message}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={status === s ? 'default' : 'outline'}
                      className="rounded-full text-[11px] h-7"
                      disabled={savingId === item.id}
                      onClick={() => updateStatus(item, s)}
                    >
                      {STATUS_LABEL[s]}
                    </Button>
                  ))}
                </div>

                <div className="mt-3">
                  <Textarea
                    value={noteDraft[item.id] ?? ''}
                    onChange={(e) => setNoteDraft((p) => ({ ...p, [item.id]: e.target.value }))}
                    placeholder="내부 메모 (후속 조치, 통화 요약 등)"
                    rows={2}
                    className="text-xs"
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm" variant="outline" className="rounded-full"
                      disabled={savingId === item.id}
                      onClick={() => saveNote(item)}>
                      메모 저장
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
