import { supabase } from '@/integrations/supabase/client';

export type PartnerProgram = {
  id: string;
  partner_slug: string;
  title: string;
  thumbnail_url: string | null;
  category: string | null;
  target_age: string | null;
  duration_text: string | null;
  price_krw: number | null;
  cta_label: string | null;
  cta_url: string | null;
  description: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type PartnerProductKind = 'book' | 'goods' | 'kit';

export type PartnerProduct = {
  id: string;
  partner_slug: string;
  title: string;
  thumbnail_url: string | null;
  kind: PartnerProductKind;
  author: string | null;
  price_krw: number | null;
  external_buy_url: string | null;
  description: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export const formatKRW = (n: number | null | undefined) =>
  n == null ? '가격 문의' : `₩${n.toLocaleString('ko-KR')}`;

export async function fetchPartnerPrograms(slug: string, opts?: { ownerView?: boolean }) {
  let q = supabase.from('partner_programs').select('*').eq('partner_slug', slug);
  if (!opts?.ownerView) q = q.eq('is_published', true);
  const { data, error } = await q.order('sort_order', { ascending: true }).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PartnerProgram[];
}

export async function fetchPartnerProducts(slug: string, opts?: { ownerView?: boolean }) {
  let q = supabase.from('partner_products').select('*').eq('partner_slug', slug);
  if (!opts?.ownerView) q = q.eq('is_published', true);
  const { data, error } = await q.order('sort_order', { ascending: true }).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PartnerProduct[];
}

export async function fetchPartnerCounts(slugs: string[]) {
  if (slugs.length === 0) return {} as Record<string, { programs: number; products: number }>;
  const [{ data: progs }, { data: prods }] = await Promise.all([
    supabase.from('partner_programs').select('partner_slug').in('partner_slug', slugs).eq('is_published', true),
    supabase.from('partner_products').select('partner_slug').in('partner_slug', slugs).eq('is_published', true),
  ]);
  const out: Record<string, { programs: number; products: number }> = {};
  slugs.forEach((s) => (out[s] = { programs: 0, products: 0 }));
  (progs ?? []).forEach((r: any) => (out[r.partner_slug].programs += 1));
  (prods ?? []).forEach((r: any) => (out[r.partner_slug].products += 1));
  return out;
}

export async function fetchMyOwnedSlugs(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('partner_owners')
    .select('partner_slug')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r: any) => r.partner_slug);
}

export async function logPartnerClick(
  partner_slug: string,
  content_type: 'program' | 'product' | 'contact',
  content_id?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('partner_content_clicks').insert({
      partner_slug,
      content_type,
      content_id: content_id ?? null,
      user_id: user?.id ?? null,
    });
  } catch {
    /* fire and forget */
  }
}

export async function uploadPartnerMedia(slug: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('partner-media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('partner-media').getPublicUrl(path);
  return data.publicUrl;
}
