import { useCallback, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface MatchedCenter {
  id: string
  name: string
  center_type: 'wee_class' | 'wee_center' | 'wee_school' | 'youth_counseling_1388'
  phone: string | null
  region_sido: string | null
  region_sigungu: string | null
  address: string | null
  website: string | null
}

export interface CreateReferralInput {
  age?: number
  region_sido?: string
  region_sigungu?: string
  risk_level: 'moderate' | 'high' | 'critical'
  trigger_source: 'assessment_score' | 'free_response_keyword' | 'manual'
  trigger_keywords?: string[]
  detected_score?: number
  assessment_type?: string
  guardian_consent?: boolean
  guardian_contact_email?: string
  guardian_contact_phone?: string
  notes?: string
}

export interface ReferralResult {
  referral_id: string
  guardian_token: string
  guardian_url: string
  expert_referral_url: string
  matched_centers: MatchedCenter[]
  status: string
}

const GUEST_KEY = 'aihpro_guest_session_id'

function getGuestSessionId(): string {
  try {
    let id = localStorage.getItem(GUEST_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(GUEST_KEY, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export function useTeenRiskReferral() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReferralResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createReferral = useCallback(async (input: CreateReferralInput): Promise<ReferralResult | null> => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('teen-risk-referral-create', {
        body: { ...input, guest_session_id: getGuestSessionId() },
      })
      if (fnErr) throw fnErr
      const r = data as ReferralResult
      setResult(r)
      return r
    } catch (e: any) {
      setError(e?.message ?? 'unknown_error')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const notifyGuardian = useCallback(async (referral_id: string, guardian_email: string) => {
    const { data, error: fnErr } = await supabase.functions.invoke('teen-risk-notify-guardian', {
      body: { referral_id, guardian_email },
    })
    if (fnErr) throw fnErr
    return data as { ok: boolean; guardian_url: string }
  }, [])

  return { createReferral, notifyGuardian, loading, result, error }
}
