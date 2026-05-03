// validate-track-content — 9개 트랙 × 30일 매트릭스 무결성 + 영상 가용성 검증
// 매주 cron으로 실행되어 결과를 mind_track_content_audit_log에 적재합니다.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FOCUS_IDS = [
  'sleep','stress','mood','focus','relationship','self',
  'parenting','child_development','family_communication',
];

// 트랙별 풀에서 사용하는 모든 videoId (mindTrackTrackContent.ts와 동기화 필요)
const TRACK_POOL_IDS: Record<string, string[]> = {
  sleep: ['c9W414XrdF0','inxAScz0PTM','NsVVO9hnCJ4','ZcEBlA-9r9k','dZewQEbQQM0','yiysD0Jl2Wo','GBBh694I1bw'],
  stress: ['TGoAN5L_oPI','dZewQEbQQM0','XgVjs-WeBWY','QN9v0nkmR_o','NKoiz6YtlRE','GQgjJUN02u4','Lllh4HdUMvk'],
  mood: ['3hyTLOCQFTE','wQfWgYCMeLw','YkFiiNBo6O0','TtTbhde9A3E','hTSLx_wCQjU','xeul9fEvo-Q','RptypCXGN-c'],
  focus: ['Uuq4OME-7-M','Bcs33wFg-KA','6Qu5E3MrVH8','LaM3-_ntnjU','cvPS_25gRPs','PIoK5ZdYk6E','0KROAacWzEA'],
  relationship: ['Oo43FrfVXOk','Tiwk1f6ZS9Y','inxAScz0PTM','NsVVO9hnCJ4','YkFiiNBo6O0','3hyTLOCQFTE','NKoiz6YtlRE'],
  self: ['Lllh4HdUMvk','0KROAacWzEA','LaM3-_ntnjU','YkFiiNBo6O0','xeul9fEvo-Q','ZcEBlA-9r9k','3hyTLOCQFTE'],
  parenting: ['YkFiiNBo6O0','NsVVO9hnCJ4','hTSLx_wCQjU','dZewQEbQQM0','inxAScz0PTM','xeul9fEvo-Q','c9W414XrdF0'],
  child_development: ['Lllh4HdUMvk','3hyTLOCQFTE','Bcs33wFg-KA','YkFiiNBo6O0','dZewQEbQQM0','PIoK5ZdYk6E','ZcEBlA-9r9k'],
  family_communication: ['Oo43FrfVXOk','3hyTLOCQFTE','NKoiz6YtlRE','YkFiiNBo6O0','hTSLx_wCQjU','TtTbhde9A3E','xeul9fEvo-Q'],
};

async function checkVideo(id: string): Promise<boolean> {
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
      { method: 'GET' },
    );
    return r.status === 200;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const failed: Array<{ focus: string; videoId: string }> = [];
  let total = 0;
  const seen = new Set<string>();

  // 1) 트랙 ID 무결성
  for (const f of FOCUS_IDS) {
    if (!TRACK_POOL_IDS[f] || TRACK_POOL_IDS[f].length < 5) {
      failed.push({ focus: f, videoId: 'POOL_MISSING_OR_TOO_SMALL' });
    }
  }

  // 2) 영상 가용성 (중복 제거)
  for (const [focus, ids] of Object.entries(TRACK_POOL_IDS)) {
    for (const id of ids) {
      const key = `${id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      total++;
      const ok = await checkVideo(id);
      if (!ok) failed.push({ focus, videoId: id });
    }
  }

  await supabase.from('mind_track_content_audit_log').insert({
    total_checked: total,
    total_failed: failed.length,
    failed_items: failed,
    notes: `tracks=${FOCUS_IDS.length} unique_videos=${total}`,
  });

  return new Response(
    JSON.stringify({ ok: failed.length === 0, total_checked: total, total_failed: failed.length, failed }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
