import { supabase } from '@/integrations/supabase/client';

// 평가 결과를 타임라인에 저장
export const saveAssessmentToTimeline = async (
  testType: string,
  testTitle: string,
  ageGroup: string,
  results: any,
  profileId?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 평균 점수 계산
    const scores = Object.values(results).filter(v => typeof v === 'number') as number[];
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    await supabase
      .from('timeline_activities')
      .insert({
        type: 'TEST',
        title: testTitle,
        summary: `${testType} 완료 - 평균 점수: ${Math.round(averageScore)}점`,
        tags: [testType, ageGroup, '심리평가'],
        actor: { role: 'user', name: user.email },
        meta: {
          test_type: testType,
          age_group: ageGroup,
          average_score: averageScore,
          results: results,
          profile_id: profileId
        }
      });

    console.log('Assessment saved to timeline');
  } catch (error) {
    console.error('Error saving assessment to timeline:', error);
  }
};

// 상담 세션을 타임라인에 저장
export const saveConsultationToTimeline = async (
  sessionId: string,
  summary: string,
  consultationType: string = 'AI상담'
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('timeline_activities')
      .insert({
        type: 'CONSULT',
        title: `${consultationType} 세션 완료`,
        summary: summary,
        tags: [consultationType, '심리상담'],
        actor: { role: 'user', name: user.email },
        meta: {
          session_id: sessionId,
          consultation_type: consultationType
        }
      });

    console.log('Consultation saved to timeline');
  } catch (error) {
    console.error('Error saving consultation to timeline:', error);
  }
};

// 관찰 기록을 타임라인에 저장
export const saveObservationToTimeline = async (
  title: string,
  description: string,
  behaviorType: string,
  memberId?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('timeline_activities')
      .insert({
        member_id: memberId,
        type: 'NOTE',
        title: title,
        summary: description,
        tags: [behaviorType, '행동관찰'],
        actor: { role: 'user', name: user.email },
        meta: {
          behavior_type: behaviorType,
          observation_type: 'manual'
        }
      });

    console.log('Observation saved to timeline');
  } catch (error) {
    console.error('Error saving observation to timeline:', error);
  }
};

// 가족 이벤트를 타임라인에 저장
export const saveFamilyEventToTimeline = async (
  eventType: string,
  title: string,
  description: string,
  affectedMembers: string[] = []
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('timeline_activities')
      .insert({
        type: 'SYSTEM',
        title: title,
        summary: description,
        tags: [eventType, '가족이벤트'],
        actor: { role: 'user', name: user.email },
        meta: {
          event_type: eventType,
          affected_members: affectedMembers
        }
      });

    console.log('Family event saved to timeline');
  } catch (error) {
    console.error('Error saving family event to timeline:', error);
  }
};

// 결제 완료를 타임라인에 저장
export const savePaymentToTimeline = async (
  planType: string,
  amount: number,
  method: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('timeline_activities')
      .insert({
        type: 'PAYMENT',
        title: `${planType} 구독 결제 완료`,
        summary: `${amount.toLocaleString()}원 결제가 완료되었습니다. (${method})`,
        tags: ['결제', planType],
        actor: { role: 'system', name: '결제 시스템' },
        meta: {
          plan_type: planType,
          amount: amount,
          payment_method: method
        }
      });

    console.log('Payment saved to timeline');
  } catch (error) {
    console.error('Error saving payment to timeline:', error);
  }
};