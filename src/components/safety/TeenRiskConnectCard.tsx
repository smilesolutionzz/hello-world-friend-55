import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Phone,
  MapPin,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Mail,
  Sparkles,
  Lock,
  CheckCircle2,
  Download,
} from 'lucide-react'
import type { MatchedCenter, ReferralResult } from '@/hooks/useTeenRiskReferral'
import { toast } from 'sonner'

interface Props {
  referral: ReferralResult
  showGuardianForm?: boolean
}

const GOLD = '#C8B88A'

const typeLabel: Record<MatchedCenter['center_type'], string> = {
  wee_class: '위(Wee) 클래스',
  wee_center: '위(Wee) 센터',
  wee_school: '위(Wee) 스쿨',
  youth_counseling_1388: '청소년상담복지센터 1388',
}

const STRENGTHS = [
  { k: '01', t: 'AI 위기 신호 자동 감지', d: '검사·자유응답 키워드를 실시간 분석' },
  { k: '02', t: '학교 위(Wee) · 1388 직접 연계', d: '거주 지역 기준 가까운 공식 채널 매칭' },
  { k: '03', t: '보호자 단건 안전 공유', d: '동의 시 1회용 비공개 링크로만 1건 열람' },
  { k: '04', t: 'AIHPRO 전문가 1:1 매칭', d: '비대면·익명 가능, 위급 시 우선 큐' },
]

export function TeenRiskConnectCard({ referral, showGuardianForm = true }: Props) {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

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

  const handleDownloadPDF = async () => {
    if (!reportRef.current || downloading) return
    setDownloading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `AIHPRO_TeenSafetyReport_${dateStr}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        } as any)
        .from(reportRef.current)
        .save()
    } catch (e) {
      toast.error('PDF 생성에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setDownloading(false)
    }
  }

  const matched = referral.matched_centers.slice(0, 4)

  return (
    <div>
      <Card
        ref={reportRef as any}
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-0 overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_60px_-30px_rgba(15,23,42,0.18)]"
      >
        {/* ───────── Editorial Header ───────── */}
        <header className="relative px-5 sm:px-8 md:px-10 pt-7 sm:pt-10 md:pt-12 pb-6 sm:pb-7 border-b border-slate-100">
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
          />
          <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-5">
            <span
              className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold tracking-[0.22em] sm:tracking-[0.28em] uppercase px-2 sm:px-2.5 py-1 rounded-full"
              style={{ color: GOLD, border: `1px solid ${GOLD}55` }}
            >
              <ShieldCheck className="size-3" />
              Teen Safety Report
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.22em] uppercase text-slate-400 font-semibold">
              Edition · {new Date().getFullYear()}
            </span>
          </div>

          <h3
            className="font-serif text-[22px] sm:text-[30px] md:text-[40px] leading-[1.15] tracking-tight text-slate-900 break-keep"
            style={{ fontFamily: '"Instrument Serif", serif' }}
          >
            혼자 감당하지 않아도 되는,<br />
            <span style={{ color: GOLD }}>10대 전용 안전 연결망</span>
          </h3>
          <p className="mt-3 sm:mt-4 text-[12px] sm:text-[13px] md:text-sm text-slate-500 leading-relaxed break-keep max-w-xl">
            전국 위(Wee) 인프라 · 청소년상담복지센터 1388 · AIHPRO 전문가까지 —
            가장 가까운 도움 채널을 한 화면에서 익명으로 연결합니다.
          </p>

          {/* trust strip */}
          <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-0 border-t border-slate-100 pt-4 sm:pt-5">
            {[
              { n: '24/7', l: '실시간 감지' },
              { n: matched.length.toString().padStart(2, '0'), l: '매칭 채널' },
              { n: '1:1', l: '익명 보장' },
            ].map((s, i) => (
              <div key={i} className={`px-1.5 sm:px-2 ${i > 0 ? 'border-l border-slate-100' : ''}`}>
                <div
                  className="font-serif text-[20px] sm:text-2xl md:text-[28px] text-slate-900 leading-none"
                  style={{ fontFamily: '"Instrument Serif", serif' }}
                >
                  {s.n}
                </div>
                <div className="text-[9px] sm:text-[10px] tracking-[0.14em] sm:tracking-[0.18em] uppercase text-slate-400 mt-1.5 font-semibold">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* ───────── 01. Why us — strengths ───────── */}
        <section className="px-5 sm:px-8 md:px-10 py-7 sm:py-9 md:py-10 border-b border-slate-100">
          <SectionHeader num="01" title="왜 AIHPRO 인가" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-4 sm:gap-y-5">
            {STRENGTHS.map((s) => (
              <div key={s.k} className="flex items-start gap-3">
                <span
                  className="font-serif text-[20px] sm:text-[22px] leading-none mt-0.5 shrink-0"
                  style={{ fontFamily: '"Instrument Serif", serif', color: GOLD }}
                >
                  {s.k}
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-[14px] font-bold text-slate-900 break-keep leading-snug">
                    {s.t}
                  </div>
                  <div className="text-[11.5px] sm:text-[12px] text-slate-500 mt-0.5 break-keep leading-relaxed">
                    {s.d}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── 02. Primary CTA — Expert ───────── */}
        <section className="px-5 sm:px-8 md:px-10 py-7 sm:py-8 border-b border-slate-100">
          <SectionHeader num="02" title="지금 바로 연결" />
          <Link
            to={referral.expert_referral_url.replace(/^https?:\/\/[^/]+/, '')}
            className="group block rounded-2xl bg-slate-900 text-white px-4 sm:px-6 py-4 sm:py-5 hover:bg-slate-800 transition-all"
          >
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <div
                  className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.24em] font-bold mb-1"
                  style={{ color: GOLD }}
                >
                  AIHPRO Premium · Priority Match
                </div>
                <div className="text-[15px] sm:text-[17px] md:text-[19px] font-bold break-keep leading-snug">
                  AIHPRO 전문가 즉시 1:1 상담 매칭
                </div>
                <div className="text-[11px] sm:text-[12px] text-slate-300 mt-1 break-keep">
                  평균 응답 5분 이내 · 비대면 · 익명 가능
                </div>
              </div>
              <span
                className="size-10 sm:size-11 rounded-full grid place-items-center shrink-0 transition-transform group-hover:translate-x-1"
                style={{ background: GOLD }}
              >
                <ArrowRight className="size-4 sm:size-5 text-slate-900" />
              </span>
            </div>
          </Link>
        </section>

        {/* ───────── 03. Matched channels ───────── */}
        {matched.length > 0 && (
          <section className="px-5 sm:px-8 md:px-10 py-7 sm:py-8 border-b border-slate-100">
            <SectionHeader num="03" title="가까운 공식 채널" />
            <div className="space-y-2.5">
              {matched.map((c, i) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 hover:border-slate-300 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-start gap-2.5 sm:gap-3">
                      <span
                        className="text-[10px] font-bold tracking-wider mt-1 shrink-0"
                        style={{ color: GOLD }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[9.5px] sm:text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-slate-400 font-bold">
                          {typeLabel[c.center_type]}
                        </div>
                        <div className="font-bold text-slate-900 truncate mt-0.5 text-[13.5px] sm:text-base">
                          {c.name}
                        </div>
                        {(c.region_sido || c.address) && (
                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <MapPin className="size-3 shrink-0" />
                            <span className="truncate">
                              {c.address || `${c.region_sido ?? ''} ${c.region_sigungu ?? ''}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0 items-end">
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          className="inline-flex items-center gap-1 text-[11.5px] sm:text-[12px] font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 hover:bg-slate-100 whitespace-nowrap"
                        >
                          <Phone className="size-3.5" /> {c.phone}
                        </a>
                      )}
                      {c.website && (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] text-slate-500 hover:text-slate-900"
                        >
                          <ExternalLink className="size-3" /> 자세히
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ───────── 04. Guardian secure share ───────── */}
        {showGuardianForm && !sent && referral.status !== 'guardian_notified' && (
          <section
            className="px-5 sm:px-8 md:px-10 py-7 sm:py-8 border-b border-slate-100 no-pdf"
            data-html2canvas-ignore="true"
          >
            <SectionHeader num="04" title="보호자에게 단건 안전 공유" />
            <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2 text-slate-900">
                <Lock className="size-4" style={{ color: GOLD }} />
                <h5 className="font-bold text-[13.5px] sm:text-[14px] break-keep">
                  이 1건만, 1회용 비공개 링크
                </h5>
              </div>
              <p className="text-[11px] text-slate-500 mb-4 break-keep leading-relaxed">
                보호자는 <code className="px-1 bg-slate-100 rounded text-slate-700">/g/토큰</code>{' '}
                링크로 이 결과 1건만 열람합니다. 과거 검사·다른 기록은 절대 공유되지 않아요.
              </p>
              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="guardian-email"
                    className="text-[10.5px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-bold"
                  >
                    Guardian Email
                  </Label>
                  <Input
                    id="guardian-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="mt-1.5 bg-white"
                  />
                </div>
                <label className="flex items-start gap-2 text-[11px] text-slate-600">
                  <Checkbox
                    checked={consent}
                    onCheckedChange={(v) => setConsent(!!v)}
                    className="mt-0.5"
                  />
                  <span className="break-keep leading-relaxed">
                    위 이메일로 1회 안내 메일 발송에 동의합니다. (이 1건만 열람 가능)
                  </span>
                </label>
                <Button
                  onClick={handleSend}
                  disabled={sending}
                  className="w-full mt-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl py-4 sm:py-5"
                >
                  <Mail className="size-4 mr-2" />
                  {sending ? '전송 중…' : '보호자에게 안내 이메일 보내기'}
                </Button>
              </div>
            </div>
          </section>
        )}

        {sent && (
          <section className="px-5 sm:px-8 md:px-10 py-5 sm:py-6 border-b border-slate-100">
            <div
              className="rounded-2xl bg-white border p-4 text-[12.5px] sm:text-[13px] text-slate-800 flex items-start gap-2"
              style={{ borderColor: `${GOLD}66` }}
            >
              <CheckCircle2 className="size-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
              <span className="break-keep">
                보호자에게 안내 이메일이 발송됐어요. 확인이 늦어지면 직접 한 번 더 알려 주세요.
              </span>
            </div>
          </section>
        )}

        {/* ───────── Footer ───────── */}
        <footer className="px-5 sm:px-8 md:px-10 py-4 sm:py-5 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 text-[9.5px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.2em] uppercase text-slate-400 font-semibold">
            <Sparkles className="size-3" style={{ color: GOLD }} />
            AIHPRO · Coaching & Connection
          </div>
          <p className="text-[10px] text-slate-400 sm:text-right break-keep leading-relaxed sm:max-w-[60%]">
            의료 진단을 대체하지 않습니다. 즉각적인 위험 신호가 있다면 가까운 응급실로 먼저 연락해 주세요.
          </p>
        </footer>
      </Card>

      {/* PDF Download Action */}
      <div className="mt-3 flex justify-end">
        <Button
          onClick={handleDownloadPDF}
          disabled={downloading}
          variant="outline"
          className="rounded-xl border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[12px] sm:text-[13px] gap-2"
        >
          <Download className="size-3.5" />
          {downloading ? 'PDF 생성 중…' : '리포트 PDF 저장'}
        </Button>
      </div>
    </div>
  )
}

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-baseline gap-2.5 sm:gap-3 mb-5 sm:mb-6">
      <span
        className="font-serif text-lg sm:text-xl text-slate-300"
        style={{ fontFamily: '"Instrument Serif", serif' }}
      >
        {num}
      </span>
      <h4 className="text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.24em] uppercase font-bold text-slate-700 break-keep">
        {title}
      </h4>
      <span className="flex-1 h-px bg-slate-100" />
    </div>
  )
}

export default TeenRiskConnectCard
