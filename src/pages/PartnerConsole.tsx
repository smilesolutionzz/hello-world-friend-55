import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import SEOHead from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PARTNER_INSTITUTIONS } from '@/data/partnerInstitutions';
import {
  fetchMyOwnedSlugs,
  fetchPartnerPrograms,
  fetchPartnerProducts,
  uploadPartnerMedia,
  type PartnerProgram,
  type PartnerProduct,
} from '@/lib/partnerMarket';
import { Pencil, Plus, Trash2, ExternalLink, ImagePlus, Building2 } from 'lucide-react';

type Tab = 'programs' | 'products';

const PartnerConsole: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, authenticated } = useAuthGuard();
  const qc = useQueryClient();

  const [ownedSlugs, setOwnedSlugs] = useState<string[] | null>(null);
  const [activeSlug, setActiveSlug] = useState<string>('');
  const [tab, setTab] = useState<Tab>('programs');
  const [editing, setEditing] = useState<null | { kind: 'program' | 'product'; row?: any }>(null);

  useEffect(() => {
    if (!user) return;
    fetchMyOwnedSlugs(user.id).then((slugs) => {
      setOwnedSlugs(slugs);
      if (slugs.length > 0 && !activeSlug) setActiveSlug(slugs[0]);
    });
  }, [user]);

  const institution = useMemo(
    () => PARTNER_INSTITUTIONS.find((p) => p.id === activeSlug),
    [activeSlug],
  );

  const programsQ = useQuery({
    queryKey: ['console_programs', activeSlug],
    queryFn: () => fetchPartnerPrograms(activeSlug, { ownerView: true }),
    enabled: !!activeSlug,
  });
  const productsQ = useQuery({
    queryKey: ['console_products', activeSlug],
    queryFn: () => fetchPartnerProducts(activeSlug, { ownerView: true }),
    enabled: !!activeSlug,
  });

  if (authLoading) return null;
  if (!user) return null;

  if (ownedSlugs && ownedSlugs.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <UnifiedNavigation />
        <div className="max-w-2xl mx-auto px-5 py-16 text-center">
          <Building2 className="w-10 h-10 text-muted-foreground mx-auto" />
          <h1 className="mt-4 text-xl font-bold text-foreground">아직 등록된 운영 기관이 없습니다</h1>
          <p className="mt-2 text-sm text-muted-foreground break-keep">
            협력기관 콘솔은 운영 권한이 부여된 사용자만 사용할 수 있습니다. 관리자에게 등록을 요청해 주세요.
          </p>
          <Button className="mt-6" onClick={() => navigate('/institution-application')}>
            협력기관 신청하기
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = async (kind: 'program' | 'product', id: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    const table = kind === 'program' ? 'partner_programs' : 'partner_products';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('삭제되었습니다');
    qc.invalidateQueries({ queryKey: [kind === 'program' ? 'console_programs' : 'console_products', activeSlug] });
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <SEOHead title="협력기관 콘솔" description="기관 운영자가 프로그램과 도서를 등록·관리합니다." />
      <UnifiedNavigation />

      <div className="max-w-5xl mx-auto px-5 pt-6">
        <h1 className="text-2xl font-bold text-foreground">협력기관 콘솔</h1>
        <p className="text-sm text-muted-foreground mt-1">운영 프로그램과 추천 도서를 직접 등록하고 노출합니다.</p>

        {/* Slug picker */}
        {ownedSlugs && ownedSlugs.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {ownedSlugs.map((s) => {
              const ins = PARTNER_INSTITUTIONS.find((p) => p.id === s);
              return (
                <button
                  key={s}
                  onClick={() => setActiveSlug(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    activeSlug === s
                      ? 'bg-foreground text-white border-foreground'
                      : 'bg-white text-foreground border-border hover:border-foreground/30'
                  }`}
                >
                  {ins?.name ?? s}
                </button>
              );
            })}
          </div>
        )}

        {institution && (
          <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] text-muted-foreground">관리 중</p>
                <p className="font-bold text-foreground">{institution.name}</p>
                <p className="text-xs text-muted-foreground">{institution.type} · {institution.location}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate(`/partner/${activeSlug}`)}>
                공개 페이지 보기 <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-6 flex gap-2 border-b border-border/60">
          {(['programs', 'products'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === t
                  ? 'border-[#C8B88A] text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'programs' ? '운영 프로그램' : '도서·굿즈'}
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={() => setEditing({ kind: tab === 'programs' ? 'program' : 'product' })}>
            <Plus className="w-4 h-4 mr-1" /> 새로 등록
          </Button>
        </div>

        {/* List */}
        <div className="mt-3 space-y-2">
          {tab === 'programs' &&
            (programsQ.data ?? []).map((row) => (
              <RowItem
                key={row.id}
                title={row.title}
                subtitle={[row.category, row.target_age, row.duration_text].filter(Boolean).join(' · ')}
                priceLabel={row.price_krw ? `₩${row.price_krw.toLocaleString('ko-KR')}` : '가격 문의'}
                thumb={row.thumbnail_url}
                published={row.is_published}
                onEdit={() => setEditing({ kind: 'program', row })}
                onDelete={() => handleDelete('program', row.id)}
              />
            ))}
          {tab === 'products' &&
            (productsQ.data ?? []).map((row) => (
              <RowItem
                key={row.id}
                title={row.title}
                subtitle={[row.kind === 'book' ? '도서' : row.kind === 'kit' ? '키트' : '굿즈', row.author].filter(Boolean).join(' · ')}
                priceLabel={row.price_krw ? `₩${row.price_krw.toLocaleString('ko-KR')}` : '가격 문의'}
                thumb={row.thumbnail_url}
                published={row.is_published}
                onEdit={() => setEditing({ kind: 'product', row })}
                onDelete={() => handleDelete('product', row.id)}
              />
            ))}
          {tab === 'programs' && (programsQ.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">아직 등록된 프로그램이 없습니다.</p>
          )}
          {tab === 'products' && (productsQ.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">아직 등록된 도서·굿즈가 없습니다.</p>
          )}
        </div>
      </div>

      {editing && (
        <EditDialog
          slug={activeSlug}
          userId={user.id}
          kind={editing.kind}
          row={editing.row}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            qc.invalidateQueries({ queryKey: ['console_programs', activeSlug] });
            qc.invalidateQueries({ queryKey: ['console_products', activeSlug] });
          }}
        />
      )}
    </div>
  );
};

const RowItem: React.FC<{
  title: string;
  subtitle: string;
  priceLabel: string;
  thumb: string | null;
  published: boolean;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ title, subtitle, priceLabel, thumb, published, onEdit, onDelete }) => (
  <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-3">
    <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
      {thumb ? <img src={thumb} className="w-full h-full object-cover" /> : null}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-sm text-foreground truncate">{title}</p>
        {!published && (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">비공개</span>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground truncate">{subtitle || '—'}</p>
      <p className="text-xs font-bold text-foreground mt-0.5">{priceLabel}</p>
    </div>
    <div className="flex gap-1 shrink-0">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
        <Pencil className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

const EditDialog: React.FC<{
  slug: string;
  userId: string;
  kind: 'program' | 'product';
  row?: PartnerProgram | PartnerProduct;
  onClose: () => void;
  onSaved: () => void;
}> = ({ slug, userId, kind, row, onClose, onSaved }) => {
  const [form, setForm] = useState<any>(
    row ?? {
      title: '',
      thumbnail_url: '',
      price_krw: '',
      is_published: true,
      sort_order: 0,
      ...(kind === 'program'
        ? { category: '', target_age: '', duration_text: '', cta_label: '신청하기', cta_url: '', description: '' }
        : { kind: 'book', author: '', external_buy_url: '', description: '' }),
    },
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const setField = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPartnerMedia(slug, file);
      setField('thumbnail_url', url);
    } catch (err: any) {
      toast.error(err.message || '업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title?.trim()) return toast.error('제목을 입력해 주세요');
    setSaving(true);
    const table = kind === 'program' ? 'partner_programs' : 'partner_products';
    const payload: any = {
      ...form,
      partner_slug: slug,
      created_by: userId,
      price_krw: form.price_krw === '' || form.price_krw == null ? null : Number(form.price_krw),
      sort_order: Number(form.sort_order) || 0,
    };
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;

    let error;
    if (row?.id) {
      ({ error } = await supabase.from(table).update(payload).eq('id', row.id));
    } else {
      ({ error } = await supabase.from(table).insert(payload));
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('저장되었습니다');
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{kind === 'program' ? '운영 프로그램' : '도서·굿즈'} {row ? '수정' : '등록'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Thumbnail */}
          <div>
            <Label>썸네일</Label>
            <div className="mt-1 flex items-center gap-3">
              <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden border border-border">
                {form.thumbnail_url ? (
                  <img src={form.thumbnail_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImagePlus className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <Input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="text-xs" />
                <p className="text-[10px] text-muted-foreground">{uploading ? '업로드 중…' : '권장 1200px 이상, JPG/PNG'}</p>
              </div>
            </div>
          </div>

          <div>
            <Label>제목</Label>
            <Input value={form.title} onChange={(e) => setField('title', e.target.value)} />
          </div>

          {kind === 'program' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>카테고리</Label>
                  <Input value={form.category || ''} onChange={(e) => setField('category', e.target.value)} placeholder="예: ABA, 언어치료" />
                </div>
                <div>
                  <Label>대상</Label>
                  <Input value={form.target_age || ''} onChange={(e) => setField('target_age', e.target.value)} placeholder="예: 만 3~7세" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>기간/회기</Label>
                  <Input value={form.duration_text || ''} onChange={(e) => setField('duration_text', e.target.value)} placeholder="예: 주 1회 50분" />
                </div>
                <div>
                  <Label>가격 (KRW)</Label>
                  <Input type="number" value={form.price_krw ?? ''} onChange={(e) => setField('price_krw', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>CTA 버튼 텍스트</Label>
                  <Input value={form.cta_label || ''} onChange={(e) => setField('cta_label', e.target.value)} />
                </div>
                <div>
                  <Label>신청 링크 (외부)</Label>
                  <Input value={form.cta_url || ''} onChange={(e) => setField('cta_url', e.target.value)} placeholder="https://" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>종류</Label>
                  <select
                    value={form.kind}
                    onChange={(e) => setField('kind', e.target.value)}
                    className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                  >
                    <option value="book">도서</option>
                    <option value="kit">키트</option>
                    <option value="goods">굿즈</option>
                  </select>
                </div>
                <div>
                  <Label>저자/브랜드</Label>
                  <Input value={form.author || ''} onChange={(e) => setField('author', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>가격 (KRW)</Label>
                  <Input type="number" value={form.price_krw ?? ''} onChange={(e) => setField('price_krw', e.target.value)} />
                </div>
                <div>
                  <Label>구매 링크 (외부)</Label>
                  <Input value={form.external_buy_url || ''} onChange={(e) => setField('external_buy_url', e.target.value)} placeholder="https://" />
                </div>
              </div>
            </>
          )}

          <div>
            <Label>설명</Label>
            <Textarea rows={3} value={form.description || ''} onChange={(e) => setField('description', e.target.value)} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-foreground">공개 게시</p>
              <p className="text-[11px] text-muted-foreground">끄면 비공개 상태로 저장됩니다</p>
            </div>
            <button
              onClick={() => setField('is_published', !form.is_published)}
              className={`w-11 h-6 rounded-full transition-colors ${form.is_published ? 'bg-foreground' : 'bg-muted-foreground/30'}`}
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_published ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>취소</Button>
          <Button onClick={handleSave} disabled={saving || uploading}>{saving ? '저장 중…' : '저장'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerConsole;
