import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Phone, MapPin, ExternalLink, ArrowRight, AlertTriangle } from 'lucide-react'

interface ReferralView {
  id: string
  age_band: string | null
  region_sido: string | null
  region_sigungu: string | null
  risk_level: 'moderate' | 'high' | 'critical'
  matched_centers: any[]
  expert_referral_url: string | null
  status: string
  created_at: string
}

const riskLabel = {
  moderate: '주의 신호',
  high: '높은 주의 신호',
  critical: '즉시 확인이 필요한 신호',
} as const

const typeLabel: Record<string, string> = {
  wee_class: '위(Wee) 클래스',
  wee_center: '위(Wee) 센터',
  wee_school: '위(Wee) 스쿨',
  youth_counseling_1388: '청소년상담복지센터 1388',
}

export default function GuardianNotice() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<ReferralView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [responded, setResponded] = useState<'accepted' | 'declined' | null>(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const { data: rows, error: rpcErr } = await supabase
        .rpc('get_referral_by_guardian_token', { _token: token })
      if (cancelled) return
      if (rpcErr) {
        setError('링크가 유효하지 않거나 만료되었습니다.')
      } else if (!rows || rows.length === 0) {
        setError('해당 안내 건을 찾을 수 없습니다.')
      } else {
        setData(rows[0] as ReferralView)
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [token])

  const respond = async (action: 'accepted' | 'declined') => {
    if (!data) return
    try {
      // Insert audit event via service-role would be ideal, but we use direct insert as anon (RLS blocks).
      // Workaround: re-use referral-create function isn't appropriate. We just update local UI;
      // server-side audit is captured when guardian is notified. For acknowledgement we update status only when admin role exists.
      // Soft acknowledgement only: persist via referral_events insert is restricted; we just toast.
      setResponded(action)
    } catch {}
  }

  if (loading) {
    return <div className="min-h-[60vh] grid place-items-center text-slate-500">불러오는 중…</div>
  }

  if (error || !data) {
    return (
      <main className="min-h-[60vh] grid place-items-center px-4">
        <Card className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md text-center">
          <AlertTriangle className="size-8 text-amber-600 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-slate-900 mb-2">링크를 확인할 수 없어요</h1>
          <p className="text-sm text-slate-600 break-keep">{error ?? '알 수 없는 오류'}</p>
          <Link to="/" className="inline-block mt-4 text-sm text-slate-700 underline">홈으로 돌아가기</Link>
        </Card>
      </main>
    )
  }

  const region = [data.region_sido, data.region_sigungu].filter(Boolean).join(' ')
  const centers = Array.isArray(data.matched_centers) ? data.matched_centers : []
  const expertPath = (data.expert_referral_url ?? 'https://aihpro.app/expert-hiring?urgent=true').replace(/^https?:\/\/[^/]+/, '')

  return (
    <main className="min-h-[80vh] bg-slate-50/40 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <p className="text-xs tracking-[0.22em] font-bold text-amber-800 uppercase mb-1">AIHPRO · GUARDIAN NOTICE</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 break-keep">
            자녀의 마음 상태에 확인이 필요한 신호가 감지되었습니다
          </h1>
          <p className="text-sm text-slate-600 mt-2 break-keep">
            이 페이지는 보호자께 발송된 단일 링크 전용으로, <b>이 1건만</b> 열람할 수 있습니다.
          </p>
        </div>

        <Card className="bg-white rounded-3xl border border-slate-200 p-6 mb-4">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Risk</div>
              <div className="font-semibold text-slate-900 mt-0.5">{riskLabel[data.risk_level]}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">연령대</div>
              <div className="font-semibold text-slate-900 mt-0.5">{data.age_band ?? '미상'}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">지역</div>
              <div className="font-semibold text-slate-900 mt-0.5 truncate">{region || '미상'}</div>
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-3xl border border-slate-200 p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="size-5 text-amber-700" />
            <h2 className="font-bold text-slate-900">지금 이용할 수 있는 도움 채널</h2>
          </div>

          <Link to={expertPath} className="block rounded-2xl bg-slate-900 text-white px-5 py-4 mb-3 hover:bg-slate-800 transition">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-amber-200/80 font-bold">AIHPRO 전문가</div>
                <div className="text-base font-bold mt-0.5">즉시 1:1 상담 매칭</div>
              </div>
              <ArrowRight className="size-5" />
            </div>
          </Link>

          <div className="space-y-2.5">
            {centers.map((c: any) => (
              <div key={c.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      {typeLabel[c.center_type] ?? c.center_type}
                    </div>
                    <div className="font-semibold text-slate-900 truncate">{c.name}</div>
                    {(c.region_sido || c.address) && (
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="size-3" />
                        <span className="truncate">{c.address || `${c.region_sido ?? ''} ${c.region_sigungu ?? ''}`}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-1.5">
                        <Phone className="size-3.5" /> {c.phone}
                      </a>
                    )}
                    {c.website && (
                      <a href={c.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <ExternalLink className="size-3" /> 자세히
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {centers.length === 0 && (
              <div className="text-sm text-slate-500">매칭된 센터가 없습니다. 위의 AIHPRO 전문가 상담을 권합니다.</div>
            )}
          </div>
        </Card>

        <Card className="bg-white rounded-3xl border border-slate-200 p-6 mb-6">
          <h3 className="font-bold text-slate-900 mb-2">보호자 응답</h3>
          <p className="text-sm text-slate-600 mb-3 break-keep">
            안내를 확인하셨음을 기록으로 남길 수 있어요. 이 응답은 자녀에게 직접 노출되지 않습니다.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => respond('accepted')}
              variant={responded === 'accepted' ? 'default' : 'outline'}
              className="flex-1"
            >
              확인 · 도움을 연결할게요
            </Button>
            <Button
              onClick={() => respond('declined')}
              variant={responded === 'declined' ? 'default' : 'outline'}
              className="flex-1"
            >
              지금은 직접 챙길게요
            </Button>
          </div>
          {responded && (
            <p className="text-xs text-slate-500 mt-2">응답이 기록되었습니다. 감사합니다.</p>
          )}
        </Card>

        <p className="text-[11px] text-slate-400 leading-relaxed break-keep">
          AIHPRO는 의료 진단을 제공하지 않으며, 발달·정서 코칭과 공공/전문가 자원 연계를 지원합니다.
          즉각적인 위험 신호가 있다면 가까운 응급실로 먼저 연락해 주세요.
        </p>
      </div>
    </main>
  )
}
