import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertPayload {
  userId: string;
  guardianId?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  alertType: 'crisis_detected' | 'high_risk' | 'check_in_missed' | 'emergency';
  crisisLevel: 'critical' | 'high' | 'medium';
  message?: string;
  location?: { latitude: number; longitude: number };
  anonymized?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AlertPayload = await req.json();
    
    console.log('[Guardian Alert] Processing alert:', {
      userId: payload.userId,
      type: payload.alertType,
      level: payload.crisisLevel
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. 보호자 정보 조회 (프로필에서)
    let guardianInfo = null;
    if (payload.guardianId) {
      const { data: guardian } = await supabase
        .from('profiles')
        .select('email, phone, nickname')
        .eq('id', payload.guardianId)
        .single();
      guardianInfo = guardian;
    }

    // 2. 알림 내용 생성
    const alertContent = generateAlertContent(payload);
    
    // 3. 알림 기록 저장
    const { data: alertRecord, error: insertError } = await supabase
      .from('guardian_alerts')
      .insert({
        user_id: payload.userId,
        guardian_id: payload.guardianId,
        guardian_phone: payload.guardianPhone || guardianInfo?.phone,
        guardian_email: payload.guardianEmail || guardianInfo?.email,
        alert_type: payload.alertType,
        crisis_level: payload.crisisLevel,
        message: alertContent.message,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.log('[Guardian Alert] DB insert note:', insertError.message);
    }

    // 4. 실제 알림 발송 시뮬레이션 (실제 구현 시 SMS/이메일 API 연동)
    const notificationResult = {
      sms: false,
      email: false,
      push: false,
    };

    // SMS 발송 (실제 구현 필요)
    if (payload.guardianPhone || guardianInfo?.phone) {
      // TODO: Twilio, NHN Cloud 등 SMS API 연동
      console.log('[Guardian Alert] SMS would be sent to:', payload.guardianPhone || guardianInfo?.phone);
      notificationResult.sms = true;
    }

    // 이메일 발송 (실제 구현 필요)
    if (payload.guardianEmail || guardianInfo?.email) {
      // TODO: SendGrid, Resend 등 이메일 API 연동
      console.log('[Guardian Alert] Email would be sent to:', payload.guardianEmail || guardianInfo?.email);
      notificationResult.email = true;
    }

    // 5. 위기 수준에 따른 추가 조치
    const additionalActions = [];
    
    if (payload.crisisLevel === 'critical') {
      additionalActions.push('전문 상담사 즉시 배정');
      additionalActions.push('119 응급 연락 준비');
      
      // 관리자 알림
      await supabase
        .from('admin_notifications')
        .insert({
          title: '🚨 긴급 위기 감지',
          message: `사용자 ${payload.userId}의 위기 상황이 감지되었습니다. 즉각적인 개입이 필요합니다.`,
          notification_type: 'crisis_alert',
          priority: 'high',
          related_id: payload.userId,
        });
    }

    const response = {
      success: true,
      alertId: alertRecord?.id || `alert_${Date.now()}`,
      notification: {
        sent: notificationResult,
        content: alertContent,
      },
      additionalActions,
      emergencyContacts: payload.crisisLevel === 'critical' ? [
        { name: '자살예방상담전화', number: '1393' },
        { name: '응급신고', number: '119' },
        { name: '경찰신고', number: '112' },
      ] : [],
      timestamp: new Date().toISOString(),
    };

    console.log('[Guardian Alert] Alert processed successfully');

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Guardian Alert] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateAlertContent(payload: AlertPayload) {
  const levelText = {
    critical: '긴급',
    high: '주의',
    medium: '관심'
  };

  const typeText = {
    crisis_detected: '위기 상황 감지',
    high_risk: '위험 신호 발견',
    check_in_missed: '체크인 누락',
    emergency: '응급 상황'
  };

  const baseMessage = `[AIH 보호자 알림] ${levelText[payload.crisisLevel]} - ${typeText[payload.alertType]}`;
  
  let detailMessage = '';
  switch (payload.crisisLevel) {
    case 'critical':
      detailMessage = '자녀/피보호자에게 즉각적인 도움이 필요할 수 있습니다. 가능하시면 즉시 연락해주세요. 자살예방상담전화 1393';
      break;
    case 'high':
      detailMessage = '자녀/피보호자의 정서 상태에 관심이 필요합니다. 시간이 되실 때 대화를 나눠보세요.';
      break;
    case 'medium':
      detailMessage = '자녀/피보호자의 최근 활동에서 관심이 필요한 신호가 감지되었습니다.';
      break;
  }

  return {
    title: baseMessage,
    message: detailMessage,
    smsContent: `${baseMessage}\n${detailMessage}`.substring(0, 90), // SMS 길이 제한
    emailSubject: baseMessage,
    emailBody: `
안녕하세요,

${detailMessage}

${payload.crisisLevel === 'critical' ? `
긴급 연락처:
- 자살예방상담전화: 1393
- 정신건강위기상담전화: 1577-0199
- 응급신고: 119
` : ''}

AIH 정신건강 플랫폼에서 발송되었습니다.
    `.trim()
  };
}
