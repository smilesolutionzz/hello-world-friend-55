// Voucher sync: pulls voucher provider data from data.go.kr (odcloud.kr) and
// matches against partner_institutions. Admin-only.
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default UDDI endpoints. Admin may override via request body `endpoints`.
// Each entry: { uddi, type, year }
type Endpoint = { uddi: string; type: string; year: string };
const DEFAULT_ENDPOINTS: Endpoint[] = [
  // Placeholder UDDIs — admin must supply real UDDIs via UI/body.
  // Keeping these empty by default so the function fails clearly with a hint.
];

function normalizeName(s: string | null | undefined): string {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[()（）\[\]【】·.,\-_/]/g, '')
    .replace(/지점|점$/g, '');
}

function extractCityDistrict(addr: string | null | undefined): { city: string; district: string } {
  if (!addr) return { city: '', district: '' };
  const parts = addr.trim().split(/\s+/);
  const city = parts[0] ?? '';
  const district = parts[1] ?? '';
  return { city, district };
}

async function fetchPage(uddi: string, serviceKey: string, page: number, perPage = 1000) {
  const url = `https://api.odcloud.kr/api/3075166/v1/uddi:${uddi}?page=${page}&perPage=${perPage}&serviceKey=${encodeURIComponent(serviceKey)}&returnType=JSON`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`odcloud HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return await res.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
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

    const serviceKey = Deno.env.get('PUBLIC_DATA_API_KEY');
    if (!serviceKey) throw new Error('PUBLIC_DATA_API_KEY not configured');

    const body = await req.json().catch(() => ({}));
    const endpoints: Endpoint[] = Array.isArray(body?.endpoints) && body.endpoints.length > 0
      ? body.endpoints
      : DEFAULT_ENDPOINTS;

    if (endpoints.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No endpoints configured',
          hint: 'Pass { endpoints: [{ uddi, type, year }, ...] } in body. Find UDDIs at data.go.kr → 사회서비스 전자바우처 제공기관 현황.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startedAt = Date.now();
    const errors: any[] = [];
    let totalRows = 0;
    const rowsToUpsert: any[] = [];

    for (const ep of endpoints) {
      try {
        let page = 1;
        let totalCount = Infinity;
        let fetched = 0;
        while (fetched < totalCount && page < 50) {
          const json = await fetchPage(ep.uddi, serviceKey, page, 1000);
          totalCount = Number(json?.totalCount ?? 0);
          const items: any[] = Array.isArray(json?.data) ? json.data : [];
          if (items.length === 0) break;

          for (const it of items) {
            // Tolerant field extraction — Korean public APIs vary
            const business_no = String(it['사업자등록번호'] ?? it['사업자번호'] ?? it['bizNo'] ?? '').replace(/[^0-9]/g, '') || null;
            const org_name = String(it['제공기관명'] ?? it['기관명'] ?? it['시설명'] ?? it['업체명'] ?? '').trim();
            const address = String(it['소재지'] ?? it['주소'] ?? it['소재지주소'] ?? it['도로명주소'] ?? '').trim();
            if (!org_name) continue;
            const { city, district } = extractCityDistrict(address);
            rowsToUpsert.push({
              business_no,
              org_name,
              org_name_normalized: normalizeName(org_name),
              address,
              city,
              district,
              voucher_type: ep.type,
              source_year: ep.year,
              raw: it,
              synced_at: new Date().toISOString(),
            });
          }

          fetched += items.length;
          page += 1;
          await new Promise((r) => setTimeout(r, 200));
        }
        totalRows += fetched;
      } catch (e) {
        errors.push({ endpoint: ep, error: String(e) });
      }
    }

    // Batch upsert in chunks of 500
    let upserted = 0;
    for (let i = 0; i < rowsToUpsert.length; i += 500) {
      const chunk = rowsToUpsert.slice(i, i + 500);
      const { error } = await supabase
        .from('voucher_directory')
        .upsert(chunk, { onConflict: 'business_no,org_name_normalized,voucher_type', ignoreDuplicates: false });
      if (error) {
        errors.push({ phase: 'upsert', error: error.message, chunk_start: i });
      } else {
        upserted += chunk.length;
      }
    }

    // Match against partner_institutions
    let matched = 0;
    let unmatched = 0;
    const { data: partners } = await supabase
      .from('partner_institutions')
      .select('id, name, location, voucher_business_no');

    for (const p of partners ?? []) {
      const normalized = normalizeName(p.name);
      let q = supabase.from('voucher_directory').select('voucher_type, business_no');
      if (p.voucher_business_no) {
        q = q.eq('business_no', p.voucher_business_no);
      } else {
        q = q.eq('org_name_normalized', normalized);
      }
      const { data: hits } = await q;
      const programs = Array.from(new Set((hits ?? []).map((h: any) => h.voucher_type)));
      if (programs.length > 0) {
        matched += 1;
        const bizNo = p.voucher_business_no ?? (hits as any)?.[0]?.business_no ?? null;
        await supabase
          .from('partner_institutions')
          .update({
            voucher_programs: programs,
            voucher_source: 'api_matched',
            voucher_business_no: bizNo,
            voucher_verified_at: new Date().toISOString(),
          })
          .eq('id', p.id);
      } else {
        unmatched += 1;
      }
    }

    await supabase.from('voucher_sync_logs').insert({
      total: totalRows,
      matched,
      unmatched,
      duration_ms: Date.now() - startedAt,
      errors,
      triggered_by: user.id,
    });

    return new Response(
      JSON.stringify({ success: true, total: totalRows, upserted, matched, unmatched, errors }),
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
