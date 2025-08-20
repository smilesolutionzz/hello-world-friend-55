// Timeline helpers with simplified types to avoid TypeScript issues

const supabaseClient = async () => {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(
    'https://hrcqxjetmzxoephgyjlb.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyY3F4amV0bXp4b2VwaGd5amxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NjUzNDAsImV4cCI6MjA3MTI0MTM0MH0.LPXwumPDk6kq5W7jRI6yx39ajYxXw15yTQvfKYtmzzg'
  );
};

// Save metaverse session to timeline
export const saveMetaverseSessionToTimeline = async (
  environmentName: string, 
  duration: number, 
  therapistName?: string,
  sessionType?: string
) => {
  try {
    const supabase = await supabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 사용자 프로필 조회
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) return;

    // 가족 정보 조회 (simplified)
    const { data: familyMembers } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('profile_id', profile.id)
      .limit(1);

    const familyMember = familyMembers?.[0];

    await supabase
      .from('timeline_activities')
      .insert({
        family_id: familyMember?.family_id || null,
        member_id: profile.id,
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
    const supabase = await supabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let overallScore = 0;
    if (typeof results === 'object' && results?.overallScore) {
      overallScore = results.overallScore;
    } else if (typeof results === 'object' && results !== null) {
      const values = Object.values(results);
      const numbers = values.filter(v => typeof v === 'number') as number[];
      if (numbers.length > 0) {
        overallScore = numbers.reduce((a, b) => a + b, 0) / numbers.length;
      }
    }

    // 사용자 프로필 조회
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) return;

    // 가족 정보 조회 (simplified)
    const { data: familyMembers } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('profile_id', profile.id)
      .limit(1);

    const familyMember = familyMembers?.[0];

    await supabase
      .from('timeline_activities')
      .insert({
        family_id: familyMember?.family_id || null,
        member_id: profile.id,
        type: 'TEST',
        title: testTitle,
        summary: `${ageGroup} 대상 ${testTitle}를 완료했습니다. 종합 점수: ${Math.round(overallScore)}점`,
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
    const supabase = await supabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 사용자 프로필 조회
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) return;

    // 가족 정보 조회 (simplified)
    const { data: familyMembers } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('profile_id', profile.id)
      .limit(1);

    const familyMember = familyMembers?.[0];

    await supabase
      .from('timeline_activities')
      .insert({
        family_id: familyMember?.family_id || null,
        member_id: profile.id,
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