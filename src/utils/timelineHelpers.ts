import { supabase } from "@/integrations/supabase/client";

// Save metaverse session to timeline
export const saveMetaverseSessionToTimeline = async (
  environmentName: string, 
  duration: number, 
  therapistName?: string,
  sessionType?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('timeline_activities')
      .insert({
        family_id: 'temp-family-id',
        type: 'SYSTEM',
        title: `메타버스 치료 세션`,
        summary: `${environmentName} 환경에서 ${duration}분간 메타버스 치료를 진행했습니다.${therapistName ? ` 담당: ${therapistName}` : ''}`,
        tags: ['메타버스', '치료세션', environmentName],
        files: [],
        actor: { role: 'user', name: user.email || '사용자' },
        meta: {
          environment: environmentName,
          duration_minutes: duration,
          therapist: therapistName,
          session_type: sessionType,
          session_date: new Date().toISOString()
        }
      });

    console.log('Metaverse session saved to timeline');
  } catch (error) {
    console.error('Error saving metaverse session to timeline:', error);
  }
};

// Save assessment to timeline
export const saveAssessmentToTimeline = async (
  testType: string,
  testTitle: string,
  ageGroup: string,
  results: any
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const overallScore = typeof results === 'object' && results.overallScore 
      ? results.overallScore 
      : Object.values(results as Record<string, number>).reduce((a, b) => a + b, 0) / Object.keys(results).length;

    await supabase
      .from('timeline_activities')
      .insert({
        family_id: 'temp-family-id',
        type: 'TEST',
        title: testTitle,
        summary: `${ageGroup} 대상 ${testTitle}를 완료했습니다. 종합 점수: ${Math.round(overallScore)}점`,
        score_overall: Math.round(overallScore),
        tags: [testType, ageGroup, '자가체크'],
        files: [],
        actor: { role: 'user', name: user.email || '사용자' },
        meta: {
          test_type: testType,
          age_group: ageGroup,
          results: results,
          completion_date: new Date().toISOString()
        }
      });

    console.log('Assessment saved to timeline');
  } catch (error) {
    console.error('Error saving assessment to timeline:', error);
  }
};

// Save consultation to timeline
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
        family_id: 'temp-family-id',
        type: 'CONSULT',
        title: `${consultationType} 세션`,
        summary: summary,
        tags: [consultationType, '정신건강'],
        files: [],
        actor: { role: 'user', name: user.email || '사용자' },
        meta: { 
          session_id: sessionId,
          consultation_type: consultationType,
          session_date: new Date().toISOString()
        }
      });

    console.log('Consultation saved to timeline');
  } catch (error) {
    console.error('Error saving consultation to timeline:', error);
  }
};