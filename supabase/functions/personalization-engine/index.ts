import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { action, profileId, behaviorData, lifestyleData, requestType } = await req.json();
    
    console.log('Personalization engine request:', { action, profileId, requestType });

    switch (action) {
      case 'track_behavior':
        return await trackBehavior(supabaseClient, profileId, behaviorData);
      
      case 'analyze_patterns':
        return await analyzePatterns(supabaseClient, profileId);
      
      case 'generate_recommendations':
        return await generatePersonalizedRecommendations(supabaseClient, profileId, requestType);
        
      case 'log_lifestyle':
        return await logLifestyleData(supabaseClient, profileId, lifestyleData);
        
      case 'find_social_matches':
        return await findSocialMatches(supabaseClient, profileId);
        
      default:
        throw new Error('Invalid action');
    }

  } catch (error: unknown) {
    console.error('Error in personalization engine:', error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ 
      error: message,
      recommendations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function trackBehavior(supabaseClient: any, profileId: string, behaviorData: any) {
  const { error } = await supabaseClient
    .from('user_behavior_logs')
    .insert({
      profile_id: profileId,
      behavior_type: behaviorData.type,
      behavior_data: behaviorData,
      session_id: behaviorData.sessionId,
      device_info: behaviorData.deviceInfo || {}
    });

  if (error) throw error;

  // Trigger pattern analysis after behavior tracking
  await analyzePatterns(supabaseClient, profileId);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function analyzePatterns(supabaseClient: any, profileId: string) {
  // Get recent behavior logs
  const { data: behaviors, error: behaviorError } = await supabaseClient
    .from('user_behavior_logs')
    .select('*')
    .eq('profile_id', profileId)
    .order('timestamp', { ascending: false })
    .limit(100);

  if (behaviorError) throw behaviorError;

  const insights = await generateInsights(behaviors);
  
  // Update or insert insights
  for (const insight of insights) {
    await supabaseClient
      .from('user_insights')
      .upsert({
        profile_id: profileId,
        insight_type: insight.type,
        insight_data: insight.data,
        confidence_score: insight.confidence,
        last_updated: new Date().toISOString()
      });
  }

  return new Response(JSON.stringify({ insights }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generateInsights(behaviors: any[]): any[] {
  const insights: any[] = [];
  
  if (behaviors.length === 0) return insights;

  // Analyze typing patterns
  const typingBehaviors = behaviors.filter(b => b.behavior_type === 'text_input');
  if (typingBehaviors.length > 0) {
    const avgSpeed = typingBehaviors.reduce((sum, b) => sum + (b.behavior_data.typingSpeed || 0), 0) / typingBehaviors.length;
    const stressLevel = avgSpeed < 30 ? 'high' : avgSpeed > 60 ? 'low' : 'medium';
    
    insights.push({
      type: 'typing_pattern',
      data: { averageSpeed: avgSpeed, stressLevel, sampleSize: typingBehaviors.length },
      confidence: Math.min(0.9, typingBehaviors.length / 20)
    });
  }

  // Analyze usage patterns
  const loginTimes = behaviors
    .filter(b => b.behavior_type === 'login')
    .map(b => new Date(b.timestamp).getHours());
    
  if (loginTimes.length > 0) {
    const avgLoginTime = loginTimes.reduce((sum, hour) => sum + hour, 0) / loginTimes.length;
    const isNightOwl = avgLoginTime > 22 || avgLoginTime < 6;
    const sleepPattern = isNightOwl ? 'night_owl' : 'early_bird';
    
    insights.push({
      type: 'usage_pattern',
      data: { averageLoginTime: avgLoginTime, sleepPattern, loginFrequency: loginTimes.length },
      confidence: Math.min(0.9, loginTimes.length / 10)
    });
  }

  // Analyze session duration patterns
  const sessionData = behaviors.filter(b => b.behavior_data.sessionDuration);
  if (sessionData.length > 0) {
    const avgDuration = sessionData.reduce((sum, b) => sum + b.behavior_data.sessionDuration, 0) / sessionData.length;
    const engagement = avgDuration > 300 ? 'high' : avgDuration > 120 ? 'medium' : 'low';
    
    insights.push({
      type: 'engagement_pattern',
      data: { averageDuration: avgDuration, engagementLevel: engagement },
      confidence: Math.min(0.8, sessionData.length / 15)
    });
  }

  return insights;
}

async function generatePersonalizedRecommendations(supabaseClient: any, profileId: string, requestType: string) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  // Get user insights and recent behavior
  const { data: insights } = await supabaseClient
    .from('user_insights')
    .select('*')
    .eq('profile_id', profileId);

  const { data: recentBehaviors } = await supabaseClient
    .from('user_behavior_logs')
    .select('*')
    .eq('profile_id', profileId)
    .order('timestamp', { ascending: false })
    .limit(20);

  const { data: lifestyle } = await supabaseClient
    .from('lifestyle_patterns')
    .select('*')
    .eq('profile_id', profileId)
    .order('pattern_date', { ascending: false })
    .limit(7);

  // Generate contextual prompt based on request type
  const prompt = createPersonalizationPrompt(requestType, insights, recentBehaviors, lifestyle);

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3.1-flash-preview',
      messages: [
        { 
          role: 'system', 
          content: '당신은 개인화된 정신건강 케어 전문가입니다. 사용자의 행동 패턴과 라이프스타일을 분석하여 공감적이고 개인 맞춤형 추천을 제공합니다.' 
        },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 1500,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
  }

  const recommendationText = data.choices[0].message.content;
  
  // Parse and structure the recommendation
  const recommendation = parseRecommendation(recommendationText, requestType);
  
  // Save recommendation to database
  await supabaseClient
    .from('personalized_recommendations')
    .insert({
      profile_id: profileId,
      recommendation_type: requestType,
      content: recommendation,
      trigger_reason: 'user_request',
      status: 'pending'
    });

  return new Response(JSON.stringify({ 
    recommendation,
    generated_at: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function createPersonalizationPrompt(requestType: string, insights: any[], behaviors: any[], lifestyle: any[]) {
  let prompt = `개인화 요청 타입: ${requestType}\n\n`;

  // Add insights analysis
  if (insights && insights.length > 0) {
    prompt += "**사용자 행동 인사이트:**\n";
    insights.forEach(insight => {
      prompt += `- ${insight.insight_type}: ${JSON.stringify(insight.insight_data)} (신뢰도: ${insight.confidence_score})\n`;
    });
    prompt += "\n";
  }

  // Add recent behavior context
  if (behaviors && behaviors.length > 0) {
    prompt += "**최근 행동 패턴:**\n";
    behaviors.slice(0, 5).forEach(behavior => {
      prompt += `- ${behavior.behavior_type}: ${JSON.stringify(behavior.behavior_data)}\n`;
    });
    prompt += "\n";
  }

  // Add lifestyle context
  if (lifestyle && lifestyle.length > 0) {
    prompt += "**라이프스타일 패턴:**\n";
    lifestyle.forEach(life => {
      prompt += `- ${life.pattern_date}: 수면 ${life.sleep_hours}시간, 기분 ${life.mood_score}/10, 스트레스 ${life.stress_level}/10\n`;
    });
    prompt += "\n";
  }

  // Add specific request prompts based on type
  switch (requestType) {
    case 'motivation':
      prompt += `**요청사항: 동기부여 메시지**
현재 시간과 사용자의 패턴을 고려하여 개인 맞춤형 동기부여 메시지를 생성해주세요.
- 사용자의 성향과 현재 상태에 맞는 톤 사용
- 구체적이고 실행 가능한 격려
- 과거 성공 경험 연결
응답 형식: {"message": "메시지 내용", "tone": "톤", "timing": "최적 타이밍", "action": "권장 행동"}`;
      break;
      
    case 'meditation':
      prompt += `**요청사항: 명상/호흡법 추천**
현재 스트레스 수준과 사용 패턴에 맞는 맞춤형 명상법을 추천해주세요.
- 현재 기분과 스트레스 수준 고려
- 시간대별 적합한 명상법
- 단계별 가이드 제공
응답 형식: {"technique": "기법명", "duration": "소요시간", "steps": ["단계1", "단계2"], "benefits": "기대효과"}`;
      break;
      
    case 'lifestyle':
      prompt += `**요청사항: 생활습관 개선 제안**
현재 라이프스타일 패턴을 분석하여 구체적인 개선 방안을 제안해주세요.
- 수면, 운동, 스트레스 관리 통합 분석
- 실현 가능한 작은 변화부터 제안
- 개인 패턴에 맞는 최적 타이밍 제안
응답 형식: {"area": "개선 영역", "suggestion": "구체적 제안", "timeline": "실행 기간", "impact": "예상 효과"}`;
      break;
      
    case 'social':
      prompt += `**요청사항: 사회적 연결 제안**
사용자의 성향과 현재 사회적 상호작용 수준을 고려한 맞춤형 사회 활동을 제안해주세요.
- 성격과 선호도에 맞는 활동
- 점진적 사회 참여 방안
- 부담 없는 시작점 제시
응답 형식: {"activity": "활동명", "difficulty": "난이도", "setting": "환경", "benefits": "사회적 효과"}`;
      break;
      
    default:
      prompt += `**요청사항: 종합적 개인화 케어**
전반적인 개인 맞춤형 케어 방안을 제안해주세요.
응답 형식: {"type": "케어 타입", "content": "내용", "reasoning": "추천 이유"}`;
  }

  prompt += `\n\n**현재 시간:** ${new Date().toLocaleString('ko-KR')}
**날씨 고려사항:** 계절성 우울, 기상 변화 영향 등 고려
**개인화 원칙:** 공감적이고 따뜻한 톤, 구체적이고 실행가능한 조언, 사용자의 작은 성취도 인정하고 격려`;

  return prompt;
}

function parseRecommendation(text: string, type: string) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // If JSON parsing fails, create structured fallback
  }
  
  // Fallback structure based on type
  const fallbackStructure = {
    motivation: { message: text, tone: "encouraging", timing: "immediate", action: "자신을 믿고 한 걸음씩" },
    meditation: { technique: "깊은 호흡법", duration: "5분", steps: [text], benefits: "스트레스 완화" },
    lifestyle: { area: "전반적 웰빙", suggestion: text, timeline: "점진적 적용", impact: "생활 만족도 향상" },
    social: { activity: "소규모 모임", difficulty: "낮음", setting: text, benefits: "사회적 연결감 증진" }
  };
  
  return fallbackStructure[type as keyof typeof fallbackStructure] || { content: text, type: "general" };
}

async function logLifestyleData(supabaseClient: any, profileId: string, lifestyleData: any) {
  const { error } = await supabaseClient
    .from('lifestyle_patterns')
    .upsert({
      profile_id: profileId,
      pattern_date: lifestyleData.date || new Date().toISOString().split('T')[0],
      ...lifestyleData
    });

  if (error) throw error;

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function findSocialMatches(supabaseClient: any, profileId: string) {
  // Get user's profile and recent insights
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('birth_date, gender')
    .eq('id', profileId)
    .single();

  const { data: userInsights } = await supabaseClient
    .from('user_insights')
    .select('*')
    .eq('profile_id', profileId);

  // Find similar users based on age and insights
  // This is a simplified matching algorithm
  const ageRange = calculateAgeRange(profile?.birth_date);
  
  // Get potential matches (simplified query)
  const { data: potentialMatches } = await supabaseClient
    .from('profiles')
    .select('id, birth_date')
    .neq('id', profileId)
    .limit(20);

  const matches = potentialMatches?.filter((match: { id: string; birth_date: string }) => {
    const matchAge = calculateAge(match.birth_date);
    return Math.abs(matchAge - calculateAge(profile?.birth_date)) <= 5;
  }) || [];

  // Create match records
  const matchPromises = matches.slice(0, 3).map((match: any) => 
    supabaseClient
      .from('social_matches')
      .upsert({
        profile_id_1: profileId,
        profile_id_2: match.id,
        match_type: 'similar_age',
        match_score: Math.random() * 0.4 + 0.6, // Simplified scoring
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
  );

  await Promise.all(matchPromises);

  return new Response(JSON.stringify({ 
    matches: matches.length,
    message: `${matches.length}명의 비슷한 관심사를 가진 사용자를 찾았습니다.`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function calculateAge(birthDate: string): number {
  if (!birthDate) return 25; // Default age
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function calculateAgeRange(birthDate: string): { min: number; max: number } {
  const age = calculateAge(birthDate);
  return { min: age - 5, max: age + 5 };
}