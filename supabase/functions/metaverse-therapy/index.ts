import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    
    console.log('Metaverse therapy request:', { action });

    switch (action) {
      case 'recommend_environment':
        return await recommendEnvironment(data);
      case 'create_session':
        return await createMetaverseSession(data);
      case 'join_session':
        return await joinSession(data);
      case 'generate_ai_therapist_response':
        return await generateAITherapistResponse(data);
      case 'analyze_user_emotion':
        return await analyzeUserEmotion(data);
      case 'update_scenario_progress':
        return await updateScenarioProgress(data);
      case 'get_environment_suggestions':
        return await getEnvironmentSuggestions(data);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in metaverse therapy:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function recommendEnvironment(data: any) {
  console.log('Recommending environment for user:', data.profileId);
  
  const { profileId, currentMood, therapyGoals, previousSessions } = data;

  // Get user's assessment history and preferences
  const { data: assessments, error: assessError } = await supabase
    .from('assessments')
    .select('*')
    .eq('profile_id', profileId)
    .order('completed_at', { ascending: false })
    .limit(5);

  if (assessError) throw assessError;

  // Get user's environment preferences
  const { data: preferences, error: prefError } = await supabase
    .from('user_environment_preferences')
    .select('*')
    .eq('profile_id', profileId)
    .single();

  // Get available environments
  const { data: environments, error: envError } = await supabase
    .from('therapy_environments')
    .select('*');

  if (envError) throw envError;

  const recommendationPrompt = `
당신은 메타버스 치료 환경 추천 전문가입니다. 사용자의 상태와 선호도를 분석하여 최적의 3D 치료 환경을 추천해주세요.

사용자 정보:
- 현재 기분: ${currentMood}
- 치료 목표: ${JSON.stringify(therapyGoals)}
- 최근 평가 결과: ${JSON.stringify(assessments)}
- 환경 선호도: ${JSON.stringify(preferences)}
- 이전 세션 기록: ${JSON.stringify(previousSessions)}

사용 가능한 환경들:
${JSON.stringify(environments, null, 2)}

다음 형식으로 추천 결과를 제공해주세요:
{
  "recommended_environment_id": "환경 ID",
  "primary_reason": "주요 추천 이유",
  "expected_benefits": ["예상 효과 1", "예상 효과 2"],
  "customization_suggestions": {
    "lighting": "조명 설정 제안",
    "sounds": ["추천 배경음"],
    "interaction_elements": ["상호작용 요소들"]
  },
  "alternative_environments": [
    {
      "environment_id": "대안 환경 ID",
      "reason": "대안 선택 이유"
    }
  ],
  "session_duration_suggestion": "권장 세션 시간(분)"
}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: recommendationPrompt }],
      max_completion_tokens: 1500,
    }),
  });

  const aiResult = await response.json();
  const recommendation = JSON.parse(aiResult.choices[0].message.content);

  // Save recommendation to user preferences
  if (preferences) {
    await supabase
      .from('user_environment_preferences')
      .update({
        preferred_environments: [...(preferences.preferred_environments || []), recommendation.recommended_environment_id],
        updated_at: new Date().toISOString()
      })
      .eq('profile_id', profileId);
  } else {
    await supabase
      .from('user_environment_preferences')
      .insert({
        profile_id: profileId,
        preferred_environments: [recommendation.recommended_environment_id],
        favorite_environment_id: recommendation.recommended_environment_id
      });
  }

  return new Response(
    JSON.stringify({ recommendation, success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function createMetaverseSession(data: any) {
  console.log('Creating metaverse session:', data);
  
  const { 
    hostProfileId, 
    sessionType, 
    environmentId, 
    sessionName, 
    description,
    maxParticipants,
    sessionConfig,
    scenarioId,
    isPublic 
  } = data;

  // Get scenario data if provided
  let scenarioData = {};
  if (scenarioId) {
    const { data: scenario, error: scenarioError } = await supabase
      .from('therapy_scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single();

    if (scenarioError) throw scenarioError;
    scenarioData = scenario;
  }

  // Create the session
  const { data: session, error: sessionError } = await supabase
    .from('metaverse_sessions')
    .insert({
      session_type: sessionType,
      environment_id: environmentId,
      host_profile_id: hostProfileId,
      session_name: sessionName,
      description: description,
      max_participants: maxParticipants || 8,
      session_config: sessionConfig || {},
      scenario_data: scenarioData,
      status: 'planned',
      is_public: isPublic || false
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  // Add host as participant
  await supabase
    .from('session_participants')
    .insert({
      session_id: session.id,
      profile_id: hostProfileId,
      participant_role: 'host'
    });

  return new Response(
    JSON.stringify({ session, success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function joinSession(data: any) {
  console.log('Joining session:', data);
  
  const { sessionId, profileId, avatarId } = data;

  // Check if session exists and has space
  const { data: session, error: sessionError } = await supabase
    .from('metaverse_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError) throw sessionError;

  if (session.current_participants >= session.max_participants) {
    throw new Error('Session is full');
  }

  // Add participant
  const { data: participant, error: participantError } = await supabase
    .from('session_participants')
    .insert({
      session_id: sessionId,
      profile_id: profileId,
      avatar_id: avatarId,
      participant_role: 'participant'
    })
    .select()
    .single();

  if (participantError) throw participantError;

  // Update session participant count
  await supabase
    .from('metaverse_sessions')
    .update({
      current_participants: session.current_participants + 1
    })
    .eq('id', sessionId);

  // Create presence record
  await supabase
    .from('metaverse_presence')
    .upsert({
      profile_id: profileId,
      session_id: sessionId,
      environment_id: session.environment_id,
      avatar_id: avatarId,
      status: 'online',
      position_data: { x: 0, y: 0, z: 0 }
    });

  return new Response(
    JSON.stringify({ participant, session, success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateAITherapistResponse(data: any) {
  console.log('Generating AI therapist response:', data);
  
  const { 
    aiTherapistId, 
    userMessage, 
    profileId, 
    sessionContext, 
    emotionalState,
    therapyGoals 
  } = data;

  // Get AI therapist configuration
  const { data: aiTherapist, error: therapistError } = await supabase
    .from('ai_therapists')
    .select('*')
    .eq('id', aiTherapistId)
    .single();

  if (therapistError) throw therapistError;

  // Get recent interactions for context
  const { data: recentInteractions, error: interactionError } = await supabase
    .from('ai_therapist_interactions')
    .select('*')
    .eq('profile_id', profileId)
    .eq('ai_therapist_id', aiTherapistId)
    .order('created_at', { ascending: false })
    .limit(10);

  const therapistPrompt = `
당신은 가상 AI 치료사 "${aiTherapist.name}"입니다. 다음 설정에 따라 역할을 수행해주세요:

치료사 정보:
- 이름: ${aiTherapist.name}
- 전문분야: ${aiTherapist.specialization}
- 성격 특성: ${JSON.stringify(aiTherapist.personality_traits)}
- 치료 접근법: ${JSON.stringify(aiTherapist.therapy_approaches)}
- 상호작용 스타일: ${JSON.stringify(aiTherapist.interaction_styles)}

사용자 상황:
- 사용자 메시지: "${userMessage}"
- 현재 감정 상태: ${emotionalState}
- 치료 목표: ${JSON.stringify(therapyGoals)}
- 세션 맥락: ${JSON.stringify(sessionContext)}
- 최근 상호작용: ${JSON.stringify(recentInteractions)}

3D 메타버스 환경에서 자연스럽고 치료적인 대화를 해주세요. 다음 형식으로 응답해주세요:
{
  "verbal_response": "음성/텍스트 응답",
  "gesture_animation": "표현할 제스처나 동작",
  "facial_expression": "표정 설정",
  "therapeutic_technique": "사용된 치료 기법",
  "emotional_assessment": "사용자 감정 상태 평가",
  "suggested_activities": ["추천 활동들"],
  "follow_up_questions": ["후속 질문들"],
  "environment_adjustments": "환경 조정 제안"
}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: therapistPrompt }],
      max_completion_tokens: 2000,
    }),
  });

  const aiResult = await response.json();
  console.log('AI result from OpenAI:', aiResult);
  
  if (!aiResult.choices || !aiResult.choices[0]) {
    throw new Error('OpenAI API에서 유효한 응답을 받지 못했습니다.');
  }

  let therapistResponse;
  try {
    therapistResponse = JSON.parse(aiResult.choices[0].message.content);
  } catch (parseError) {
    console.error('JSON parsing error:', parseError);
    console.log('Raw content:', aiResult.choices[0].message.content);
    
    // Fallback response if JSON parsing fails
    therapistResponse = {
      verbal_response: aiResult.choices[0].message.content,
      gesture_animation: "차분한 손짓",
      facial_expression: "따뜻한 미소",
      therapeutic_technique: "경청",
      emotional_assessment: "대화 진행 중",
      suggested_activities: ["계속 대화하기"],
      follow_up_questions: ["더 자세히 말씀해 주시겠어요?"],
      environment_adjustments: "편안한 분위기 유지"
    };
  }

  console.log('Therapist response:', therapistResponse);

  // Save interaction
  try {
    await supabase
      .from('ai_therapist_interactions')
      .insert({
        profile_id: profileId,
        ai_therapist_id: aiTherapistId,
        interaction_type: 'chat',
        interaction_data: {
          user_message: userMessage,
          ai_response: therapistResponse,
          session_context: sessionContext
        },
        emotional_analysis: {
          detected_emotion: therapistResponse.emotional_assessment || 'neutral',
          confidence: 0.8
        },
        duration_minutes: 1
      });
  } catch (saveError) {
    console.error('Error saving interaction:', saveError);
    // Continue anyway, don't fail the response
  }

  return new Response(
    JSON.stringify({ response: therapistResponse, success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function analyzeUserEmotion(data: any) {
  console.log('Analyzing user emotion:', data);
  
  const { profileId, audioData, videoData, textData, sessionId } = data;

  const emotionPrompt = `
당신은 감정 분석 전문가입니다. 사용자의 다중 모달 데이터를 분석하여 감정 상태를 평가해주세요:

입력 데이터:
- 텍스트: "${textData}"
- 음성 분석 데이터: ${JSON.stringify(audioData)}
- 영상 분석 데이터: ${JSON.stringify(videoData)}

다음 형식으로 분석 결과를 제공해주세요:
{
  "primary_emotion": "주요 감정",
  "emotion_intensity": 1-10 강도,
  "emotional_valence": "positive/negative/neutral",
  "stress_level": 1-10 수준,
  "confidence_score": 0-1 신뢰도,
  "detected_emotions": {
    "joy": 0-1,
    "sadness": 0-1,
    "anger": 0-1,
    "fear": 0-1,
    "surprise": 0-1,
    "disgust": 0-1
  },
  "behavioral_indicators": ["관찰된 행동 지표들"],
  "therapeutic_recommendations": ["치료적 권장사항들"],
  "environment_adjustments": ["환경 조정 제안들"]
}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: emotionPrompt }],
      max_completion_tokens: 1500,
    }),
  });

  const aiResult = await response.json();
  const emotionAnalysis = JSON.parse(aiResult.choices[0].message.content);

  return new Response(
    JSON.stringify({ analysis: emotionAnalysis, success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateScenarioProgress(data: any) {
  console.log('Updating scenario progress:', data);
  
  const { sessionId, profileId, scenarioId, progressData, achievements } = data;

  // Update participant progress
  await supabase
    .from('session_participants')
    .update({
      therapy_progress: progressData,
      interaction_data: {
        ...data.interactionData,
        achievements: achievements,
        last_updated: new Date().toISOString()
      }
    })
    .eq('session_id', sessionId)
    .eq('profile_id', profileId);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getEnvironmentSuggestions(data: any) {
  console.log('Getting environment suggestions:', data);
  
  const { profileId, currentActivity, timeOfDay, weatherMood } = data;

  // Get user's assessment history
  const { data: assessments, error: assessError } = await supabase
    .from('assessments')
    .select('*')
    .eq('profile_id', profileId)
    .order('completed_at', { ascending: false })
    .limit(3);

  if (assessError) throw assessError;

  // Get all environments
  const { data: environments, error: envError } = await supabase
    .from('therapy_environments')
    .select('*');

  if (envError) throw envError;

  const suggestionPrompt = `
사용자의 현재 상황에 맞는 치료 환경을 제안해주세요:

사용자 정보:
- 현재 활동: ${currentActivity}
- 시간대: ${timeOfDay}
- 날씨/기분: ${weatherMood}
- 최근 평가 결과: ${JSON.stringify(assessments)}

사용 가능한 환경들:
${JSON.stringify(environments, null, 2)}

다음 형식으로 제안해주세요:
{
  "suggestions": [
    {
      "environment_id": "환경 ID",
      "environment_name": "환경 이름",
      "match_score": 1-100,
      "reason": "선택 이유",
      "mood_enhancement": "기분 개선 효과",
      "recommended_duration": "권장 체류 시간"
    }
  ],
  "personalized_message": "개인화된 메시지"
}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: suggestionPrompt }],
      max_completion_tokens: 1500,
    }),
  });

  const aiResult = await response.json();
  const suggestions = JSON.parse(aiResult.choices[0].message.content);

  return new Response(
    JSON.stringify({ suggestions, success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}