import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Phone, MapPin, ExternalLink, ShieldCheck, ArrowRight, Mail } from 'lucide-react'
import type { MatchedCenter, ReferralResult } from '@/hooks/useTeenRiskReferral'
import { toast } from 'sonner'

interface Props {
  referral: ReferralResult
  showGuardianForm?: boolean
}

const typeLabel: Record<MatchedCenter['center_type'], string> = {
  wee_class: '위(Wee) 클래스',
  wee_center: '위(Wee) 센터',
  wee_school: '위(Wee) 스쿨',
  youth_counseling_1388: '청소년상담복지센터 1388',
}

export function TeenRiskConnectCard({ referral, showGuardianForm = true }: Props) {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    if (!consent) {
      toast.error('보호자 알림 동의에 체크해 주세요.')
      return
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('보호자 이메일을 정확히 입력해 주세요.')
      return
    }
    setSending(true)
    try {
      const { supabase } = await import('@/integrations/supabase/client')
      // Single source of truth: edge function records consent + dispatches email atomically.
      const { error: respondErr } = await supabase.functions.invoke('teen-risk-guardian-respond', {
        body: {
          referral_id: referral.referral_id,
          action: 'consent',
          guardian_email: email,
          notify: true,
        },
      })
      if (respondErr) throw respondErr
      setSent(true)
      toast.success('보호자에게 안내 이메일을 보냈어요.')
    } catch (e: any) {
      toast.error('전송에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="size-10 rounded-2xl bg-amber-50 grid place-items-center text-amber-700">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] font-bold text-amber-800 uppercase mb-1">
            Safety Connect · {referral.status === 'guardian_notified' ? '보호자 알림 완료' : '확인이 필요한 신호'}
          </p>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 break-keep">
            지금 이용할 수 있는 가까운 도움 채널
          </h3>
          <p className="text-sm text-slate-600 mt-1 break-keep">
            학교 위(Wee) 인프라 · 청소년상담복지센터 · AIHPRO 전문가 1:1 — 익명으로도 이용할 수 있어요.
          </p>
        </div>
      </div>

      {/* Expert primary CTA */}
      <Link
        to={referral.expert_referral_url.replace(/^https?:\/\/[^/]+/, '')}
        className="block rounded-2xl bg-slate-900 text-white px-5 py-4 mb-3 hover:bg-slate-800 transition"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-amber-200/80 font-bold">AIHPRO 전문가</div>
            <div className="text-base font-bold mt-0.5">즉시 1:1 상담 매칭</div>
          </div>
          <ArrowRight className="size-5" />
        </div>
      </Link>

      <div className="space-y-2.5 mb-5">
        {referral.matched_centers.slice(0, 4).map((c) => (
          <div key={c.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  {typeLabel[c.center_type]}
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
      </div>

      {showGuardianForm && !sent && referral.status !== 'guardian_notified' && (
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="size-4 text-slate-700" />
            <h4 className="font-semibold text-slate-900">보호자에게 이 1건만 안전하게 공유</h4>
          </div>
          <p className="text-xs text-slate-500 mb-3 break-keep">
            보호자는 비공개 단일 링크(/g/토큰)로만 이 결과 1건을 열람합니다. 다른 기록은 공유되지 않아요.
          </p>
          <div className="space-y-2">
            <div>
              <Label htmlFor="guardian-email" className="text-xs">보호자 이메일</Label>
              <Input
                id="guardian-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                className="mt-1"
              />
            </div>
            <label className="flex items-start gap-2 text-xs text-slate-600">
              <Checkbox checked={consent} onCheckedChange={(v) => setConsent(!!v)} className="mt-0.5" />
              <span className="break-keep">
                위 이메일로 1회 안내 메일이 발송되는 것에 동의합니다. (이 1건만 열람 가능)
              </span>
            </label>
            <Button onClick={handleSend} disabled={sending} className="w-full mt-1">
              {sending ? '전송 중…' : '보호자에게 안내 이메일 보내기'}
            </Button>
          </div>
        </div>
      )}

      {sent && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
          보호자에게 안내 이메일이 발송됐어요. 확인이 늦어지면 직접 한 번 더 알려 주세요.
        </div>
      )}

      <p className="text-[11px] text-slate-400 mt-4 leading-relaxed break-keep">
        AIHPRO는 의료 진단을 하지 않으며, 발달·정서 코칭과 공공/전문가 자원 연계를 지원합니다.
        즉각적인 위험 신호가 있다면 가장 먼저 가까운 응급실로 연락해 주세요.
      </p>
    </Card>
  )
}

export default TeenRiskConnectCard
