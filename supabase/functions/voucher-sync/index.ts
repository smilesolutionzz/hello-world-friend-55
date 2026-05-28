// Voucher sync: 한국사회보장정보원 사회서비스 제공기관 정보 검색 API에서
// 전국 바우처 제공기관을 끌어와 voucher_directory를 전수 갱신한다.
// Endpoint: https://api.socialservice.or.kr:444/api/service/provider/providerList (XML)
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 행정표준 시도 코드 (17개 광역)
const SIDO_CODES = [
  '11', '26', '27', '28', '29', '30', '31', '36',
  '41', '42', '43', '44', '45', '46', '47', '48', '50',
];

const API_BASE = 'http://api.socialservice.or.kr:8080/api/service/provider/providerList';

function normalizeName(s: string | null | undefined): string {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[()（）\[\]【】·.,\-_/]/g, '')
    .replace(/지점|점$/g, '');
}

function pick(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!m) return '';
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function parseItems(xml: string): { totalCount: number; items: Record<string, string>[] } {
  const totalCount = Number(pick(xml, 'totalCount') || '0');
  const items: Record<string, string>[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const row: Record<string, string> = {};
    const fields = ['providerId', 'providerName', 'serviceName', 'serviceTypeName',
      'address', 'addressDetail', 'loadAddress', 'loadAddressDetail',
      'sidoName', 'signguName', 'telNumber', 'ownerName', 'email', 'zip'];
    for (const f of fields) row[f] = pick(block, f);
    items.push(row);
  }
  return { totalCount, items };
}

async function fetchPage(serviceKey: string, sido: string, pageNo: number, numOfRows: number) {
  const url = `${API_BASE}?serviceKey=${encodeURIComponent(serviceKey)}&sido=${sido}&pageNo=${pageNo}&numOfRows=${numOfRows}`;
  const res = await fetch(url);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HTTP ${res.status}: ${t.slice(0, 300)}`);
  }
  return await res.text();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    // Admin secret bypass (for server-side/agent triggers)
    const adminSecretHeader = req.headers.get('x-admin-secret');
    const adminSecret = Deno.env.get('SOCIAL_SERVICE_API_KEY') || '';
    const isSecretBypass = !!adminSecret && adminSecretHeader === adminSecret;

    let userId: string | null = null;
    if (!isSecretBypass) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const { data: { user }, error: userErr } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (userErr || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Admin only' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      userId = user.id;
    }


    const serviceKey = Deno.env.get('SOCIAL_SERVICE_API_KEY') || Deno.env.get('PUBLIC_DATA_API_KEY');
    if (!serviceKey) throw new Error('SOCIAL_SERVICE_API_KEY not configured');

    const body = await req.json().catch(() => ({}));
    const sidos: string[] = Array.isArray(body?.sidos) && body.sidos.length > 0 ? body.sidos : SIDO_CODES;
    const numOfRows = Number(body?.numOfRows ?? 500);

    const startedAt = Date.now();
    const errors: any[] = [];
    const perSido: Record<string, number> = {};
    const allRows: any[] = [];

    for (const sido of sidos) {
      try {
        let pageNo = 1;
        let collected = 0;
        let totalCount = Infinity;
        while (collected < totalCount && pageNo <= 200) {
          const xml = await fetchPage(serviceKey, sido, pageNo, numOfRows);
          const { totalCount: tc, items } = parseItems(xml);
          totalCount = tc;
          if (items.length === 0) break;
          for (const it of items) {
            const org_name = it.providerName?.trim();
            if (!org_name) continue;
            const address = [it.loadAddress, it.loadAddressDetail].filter(Boolean).join(' ').trim()
              || [it.address, it.addressDetail].filter(Boolean).join(' ').trim();
            allRows.push({
              business_no: it.providerId || null,
              org_name,
              org_name_normalized: normalizeName(org_name),
              address,
              city: it.sidoName?.trim() || '',
              district: it.signguName?.trim() || '',
              voucher_type: it.serviceTypeName?.trim() || '기타',
              source_year: new Date().getFullYear().toString(),
              raw: it,
              synced_at: new Date().toISOString(),
            });
          }
          collected += items.length;
          pageNo += 1;
          await new Promise((r) => setTimeout(r, 100));
        }
        perSido[sido] = collected;
      } catch (e) {
        errors.push({ sido, error: String(e) });
      }
    }

    // Wipe & reinsert (expression-based unique index doesn't play well with upsert)
    await supabase.from('voucher_directory').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    let inserted = 0;
    for (let i = 0; i < allRows.length; i += 500) {
      const chunk = allRows.slice(i, i + 500);
      const { error } = await supabase.from('voucher_directory').insert(chunk);
      if (error) errors.push({ phase: 'insert', error: error.message, chunk_start: i });
      else inserted += chunk.length;
    }

    // Match against partner_institutions
    let matched = 0, unmatched = 0;
    const { data: partners } = await supabase
      .from('partner_institutions')
      .select('id, name, voucher_business_no');

    for (const p of partners ?? []) {
      const normalized = normalizeName(p.name);
      let q = supabase.from('voucher_directory').select('voucher_type, business_no');
      if (p.voucher_business_no) q = q.eq('business_no', p.voucher_business_no);
      else q = q.eq('org_name_normalized', normalized);
      const { data: hits } = await q;
      const programs = Array.from(new Set((hits ?? []).map((h: any) => h.voucher_type)));
      if (programs.length > 0) {
        matched += 1;
        const bizNo = p.voucher_business_no ?? (hits as any)?.[0]?.business_no ?? null;
        await supabase.from('partner_institutions').update({
          voucher_programs: programs,
          voucher_source: 'api_matched',
          voucher_business_no: bizNo,
          voucher_verified_at: new Date().toISOString(),
        }).eq('id', p.id);
      } else unmatched += 1;
    }

    await supabase.from('voucher_sync_logs').insert({
      total: allRows.length,
      matched,
      unmatched,
      duration_ms: Date.now() - startedAt,
      errors,
      triggered_by: userId,
    });

    return new Response(
      JSON.stringify({ success: true, total: allRows.length, inserted, matched, unmatched, perSido, errors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('voucher-sync error', e);
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
