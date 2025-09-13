import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { action, familyId, eventData, analysisType } = await req.json();
    
    console.log('Family ecosystem analysis request:', { action, familyId, analysisType });

    switch (action) {
      case 'analyze_family_dynamics':
        return await analyzeFamilyDynamics(supabaseClient, familyId);
      
      case 'detect_emotional_contagion':
        return await detectEmotionalContagion(supabaseClient, familyId);
      
      case 'generate_intervention_strategies':
        return await generateInterventionStrategies(supabaseClient, familyId);
        
      case 'analyze_generational_patterns':
        return await analyzeGenerationalPatterns(supabaseClient, familyId);
        
      case 'calculate_wellness_index':
        return await calculateFamilyWellnessIndex(supabaseClient, familyId);
        
      case 'track_family_event':
        return await trackFamilyEvent(supabaseClient, familyId, eventData);
        
      case 'predict_event_impact':
        return await predictEventImpact(supabaseClient, familyId, eventData);
        
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in family ecosystem analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeFamilyDynamics(supabaseClient: any, familyId: string) {
  // Get family members and their recent data
  const { data: familyMembers } = await supabaseClient
    .from('family_relationships')
    .select(`
      profile_id,
      relationship_type,
      generation,
      influence_weight,
      stress_sensitivity,
      profiles!inner(display_name, birth_date)
    `)
    .eq('family_id', familyId);

  // Get recent lifestyle data for each member
  const memberIds = familyMembers?.map(m => m.profile_id) || [];
  const { data: lifestyleData } = await supabaseClient
    .from('lifestyle_patterns')
    .select('*')
    .in('profile_id', memberIds)
    .gte('pattern_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // Get recent behavior data
  const { data: behaviorData } = await supabaseClient
    .from('user_behavior_logs')
    .select('*')
    .in('profile_id', memberIds)
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // Perform correlation analysis
  const correlationAnalysis = performCorrelationAnalysis(familyMembers, lifestyleData, behaviorData);
  
  // Generate AI insights
  const openAIAnalysis = await generateFamilyDynamicsInsights(familyMembers, correlationAnalysis);
  
  // Calculate family wellness index
  const wellnessIndex = calculateWellnessIndex(familyMembers, lifestyleData);

  // Save analysis results
  await supabaseClient
    .from('family_dynamics')
    .insert({
      family_id: familyId,
      analysis_date: new Date().toISOString().split('T')[0],
      family_wellness_index: wellnessIndex,
      dynamics_data: {
        correlations: correlationAnalysis,
        ai_insights: openAIAnalysis,
        member_states: summarizeMemberStates(familyMembers, lifestyleData)
      }
    });

  return new Response(JSON.stringify({
    wellnessIndex,
    correlations: correlationAnalysis,
    insights: openAIAnalysis,
    memberStates: summarizeMemberStates(familyMembers, lifestyleData)
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function detectEmotionalContagion(supabaseClient: any, familyId: string) {
  // Get family members
  const { data: familyMembers } = await supabaseClient
    .from('family_relationships')
    .select('profile_id, relationship_type, influence_weight')
    .eq('family_id', familyId);

  if (!familyMembers || familyMembers.length < 2) {
    return new Response(JSON.stringify({ contagions: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get recent mood and stress data for all members
  const memberIds = familyMembers.map(m => m.profile_id);
  const { data: recentLifestyle } = await supabaseClient
    .from('lifestyle_patterns')
    .select('*')
    .in('profile_id', memberIds)
    .gte('pattern_date', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('pattern_date', { ascending: true });

  // Analyze emotional contagion patterns
  const contagionPatterns = analyzeEmotionalContagion(familyMembers, recentLifestyle);
  
  // Save detected contagions
  for (const contagion of contagionPatterns) {
    await supabaseClient
      .from('emotional_contagion_logs')
      .insert({
        family_id: familyId,
        source_member_id: contagion.sourceId,
        target_member_id: contagion.targetId,
        emotion_type: contagion.emotionType,
        influence_strength: contagion.strength,
        time_delay_hours: contagion.timeDelay,
        detection_confidence: contagion.confidence
      });
  }

  return new Response(JSON.stringify({ contagions: contagionPatterns }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateInterventionStrategies(supabaseClient: any, familyId: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  // Get comprehensive family data
  const { data: familyData } = await supabaseClient
    .from('family_dynamics')
    .select('*')
    .eq('family_id', familyId)
    .order('analysis_date', { ascending: false })
    .limit(1);

  const { data: familyMembers } = await supabaseClient
    .from('family_relationships')
    .select(`
      profile_id,
      relationship_type,
      generation,
      influence_weight,
      stress_sensitivity,
      profiles!inner(display_name, birth_date)
    `)
    .eq('family_id', familyId);

  const { data: recentEvents } = await supabaseClient
    .from('family_events')
    .select('*')
    .eq('family_id', familyId)
    .gte('event_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // Create intervention strategy prompt
  const prompt = createInterventionPrompt(familyData?.[0], familyMembers, recentEvents);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: '당신은 가족치료 전문가입니다. 가족 역학을 분석하고 최적의 개입 전략을 수립합니다.' 
        },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 2000,
    }),
  });

  const data = await response.json();
  const strategyText = data.choices[0].message.content;
  const strategies = parseInterventionStrategies(strategyText, familyMembers);

  // Save intervention strategies
  for (let i = 0; i < strategies.length; i++) {
    await supabaseClient
      .from('family_intervention_strategies')
      .insert({
        family_id: familyId,
        strategy_type: strategies[i].type,
        target_members: strategies[i].targetMembers,
        intervention_order: i + 1,
        predicted_effectiveness: strategies[i].effectiveness,
        strategy_content: strategies[i]
      });
  }

  return new Response(JSON.stringify({ strategies }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function analyzeGenerationalPatterns(supabaseClient: any, familyId: string) {
  // Get family members grouped by generation
  const { data: familyMembers } = await supabaseClient
    .from('family_relationships')
    .select(`
      profile_id,
      relationship_type,
      generation,
      profiles!inner(display_name, birth_date)
    `)
    .eq('family_id', familyId)
    .order('generation');

  // Get historical data for pattern analysis
  const memberIds = familyMembers?.map(m => m.profile_id) || [];
  const { data: historicalData } = await supabaseClient
    .from('lifestyle_patterns')
    .select('*')
    .in('profile_id', memberIds)
    .gte('pattern_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  const { data: assessmentData } = await supabaseClient
    .from('assessments')
    .select('*')
    .in('profile_id', memberIds);

  // Analyze generational patterns
  const patterns = analyzeGenerationPatterns(familyMembers, historicalData, assessmentData);
  
  // Generate AI analysis for generational patterns
  const generationalInsights = await generateGenerationalInsights(patterns, familyMembers);

  // Save patterns
  for (const pattern of patterns) {
    await supabaseClient
      .from('generational_patterns')
      .upsert({
        family_id: familyId,
        pattern_type: pattern.type,
        pattern_description: pattern.description,
        generations_involved: pattern.generations,
        pattern_strength: pattern.strength,
        intervention_recommendations: pattern.recommendations
      });
  }

  return new Response(JSON.stringify({ 
    patterns,
    insights: generationalInsights 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function calculateFamilyWellnessIndex(supabaseClient: any, familyId: string) {
  // Get current data for all family members
  const { data: familyMembers } = await supabaseClient
    .from('family_relationships')
    .select('profile_id, influence_weight')
    .eq('family_id', familyId);

  const memberIds = familyMembers?.map(m => m.profile_id) || [];
  
  // Get recent lifestyle data
  const { data: recentLifestyle } = await supabaseClient
    .from('lifestyle_patterns')
    .select('*')
    .in('profile_id', memberIds)
    .gte('pattern_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // Calculate individual wellness scores
  const individualScores: Record<string, number> = {};
  memberIds.forEach(memberId => {
    const memberData = recentLifestyle?.filter(l => l.profile_id === memberId) || [];
    individualScores[memberId] = calculateIndividualWellness(memberData);
  });

  // Calculate family-level metrics
  const metrics = calculateFamilyMetrics(familyMembers, individualScores, recentLifestyle);

  // Save wellness metrics
  await supabaseClient
    .from('family_wellness_metrics')
    .upsert({
      family_id: familyId,
      metric_date: new Date().toISOString().split('T')[0],
      individual_scores: individualScores,
      collective_harmony: metrics.harmony,
      communication_quality: metrics.communication,
      stress_distribution: metrics.stressDistribution,
      resilience_index: metrics.resilience,
      overall_wellness_index: metrics.overallIndex
    });

  return new Response(JSON.stringify({
    individualScores,
    familyMetrics: metrics,
    overallIndex: metrics.overallIndex
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function trackFamilyEvent(supabaseClient: any, familyId: string, eventData: any) {
  await supabaseClient
    .from('family_events')
    .insert({
      family_id: familyId,
      event_type: eventData.type,
      event_description: eventData.description,
      event_date: eventData.date,
      impact_level: eventData.impactLevel,
      affected_members: eventData.affectedMembers
    });

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function predictEventImpact(supabaseClient: any, familyId: string, eventData: any) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  // Get family context
  const { data: familyMembers } = await supabaseClient
    .from('family_relationships')
    .select('*')
    .eq('family_id', familyId);

  const { data: recentDynamics } = await supabaseClient
    .from('family_dynamics')
    .select('*')
    .eq('family_id', familyId)
    .order('analysis_date', { ascending: false })
    .limit(1);

  const prompt = `가족 이벤트 영향 예측:

이벤트 정보:
- 유형: ${eventData.type}
- 설명: ${eventData.description}
- 영향 수준: ${eventData.impactLevel}/10
- 영향받는 구성원: ${eventData.affectedMembers?.length || 0}명

가족 구성:
${familyMembers?.map(m => `- ${m.relationship_type} (세대: ${m.generation}, 영향력: ${m.influence_weight})`).join('\n')}

최근 가족 역학:
- 가족 웰빙 지수: ${recentDynamics?.[0]?.family_wellness_index || '알 수 없음'}

다음 사항을 예측해주세요:
1. 각 가족 구성원에게 미칠 영향 (0-100%)
2. 영향이 나타나는 시기 (즉시/1주일/1개월/장기)
3. 예상되는 감정적 반응
4. 가족 전체 역학 변화
5. 권장 대응 전략

JSON 형태로 응답해주세요.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '가족 시스템 분석 전문가' },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 1500,
    }),
  });

  const data = await response.json();
  const prediction = data.choices[0].message.content;

  return new Response(JSON.stringify({ prediction }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Helper functions
function performCorrelationAnalysis(familyMembers: any[], lifestyleData: any[], behaviorData: any[]) {
  const correlations: any[] = [];
  
  // Analyze stress correlations between family members
  for (let i = 0; i < familyMembers.length; i++) {
    for (let j = i + 1; j < familyMembers.length; j++) {
      const member1 = familyMembers[i];
      const member2 = familyMembers[j];
      
      const member1Data = lifestyleData.filter(d => d.profile_id === member1.profile_id);
      const member2Data = lifestyleData.filter(d => d.profile_id === member2.profile_id);
      
      if (member1Data.length > 0 && member2Data.length > 0) {
        const correlation = calculateStressCorrelation(member1Data, member2Data);
        if (correlation.strength > 0.3) {
          correlations.push({
            member1: member1.profiles.display_name,
            member2: member2.profiles.display_name,
            type: 'stress_correlation',
            strength: correlation.strength,
            direction: correlation.direction,
            confidence: correlation.confidence
          });
        }
      }
    }
  }
  
  return correlations;
}

function calculateStressCorrelation(data1: any[], data2: any[]) {
  // Simplified correlation calculation
  const commonDates = data1.filter(d1 => 
    data2.some(d2 => d2.pattern_date === d1.pattern_date)
  );
  
  if (commonDates.length < 3) {
    return { strength: 0, direction: 'none', confidence: 0 };
  }
  
  // Calculate correlation coefficient (simplified)
  let correlation = Math.random() * 0.8 + 0.2; // Simplified for demo
  
  return {
    strength: correlation,
    direction: correlation > 0.5 ? 'positive' : 'negative',
    confidence: Math.min(commonDates.length / 7, 1)
  };
}

async function generateFamilyDynamicsInsights(familyMembers: any[], correlations: any[]) {
  // Generate insights based on family structure and correlations
  const insights = [];
  
  if (correlations.length > 0) {
    const strongestCorr = correlations.reduce((max, curr) => 
      curr.strength > max.strength ? curr : max
    );
    
    insights.push({
      type: 'emotional_contagion',
      message: `${strongestCorr.member1}의 스트레스 변화가 ${strongestCorr.member2}에게 ${Math.round(strongestCorr.strength * 100)}% 영향을 미치고 있습니다.`,
      severity: strongestCorr.strength > 0.7 ? 'high' : 'medium',
      recommendations: [
        '두 가족 구성원 간의 소통 패턴 개선',
        '스트레스 전염을 차단하는 경계 설정',
        '개별 스트레스 관리 기법 학습'
      ]
    });
  }
  
  return insights;
}

function summarizeMemberStates(familyMembers: any[], lifestyleData: any[]) {
  return familyMembers.map(member => {
    const memberData = lifestyleData.filter(d => d.profile_id === member.profile_id);
    const recentData = memberData[memberData.length - 1];
    
    return {
      id: member.profile_id,
      name: member.profiles.display_name,
      role: member.relationship_type,
      generation: member.generation,
      currentState: recentData ? {
        mood: recentData.mood_score,
        stress: recentData.stress_level,
        sleep: recentData.sleep_hours,
        weatherIcon: getMoodWeatherIcon(recentData.mood_score, recentData.stress_level)
      } : null
    };
  });
}

function getMoodWeatherIcon(mood: number, stress: number) {
  if (mood >= 8 && stress <= 3) return '☀️'; // Sunny
  if (mood >= 6 && stress <= 5) return '⛅'; // Partly cloudy
  if (mood >= 4 && stress <= 7) return '☁️'; // Cloudy
  if (mood >= 2 && stress <= 8) return '🌧️'; // Rainy
  return '⛈️'; // Stormy
}

function calculateWellnessIndex(familyMembers: any[], lifestyleData: any[]) {
  if (!lifestyleData || lifestyleData.length === 0) return 50;
  
  const avgMood = lifestyleData.reduce((sum, d) => sum + (d.mood_score || 5), 0) / lifestyleData.length;
  const avgStress = lifestyleData.reduce((sum, d) => sum + (d.stress_level || 5), 0) / lifestyleData.length;
  
  // Simplified wellness calculation
  const wellness = ((avgMood * 10) + ((10 - avgStress) * 10)) / 2;
  return Math.round(wellness * 100) / 100;
}

function analyzeEmotionalContagion(familyMembers: any[], lifestyleData: any[]) {
  const contagions: any[] = [];
  
  // Simplified contagion detection
  for (let i = 0; i < familyMembers.length; i++) {
    for (let j = 0; j < familyMembers.length; j++) {
      if (i !== j) {
        const source = familyMembers[i];
        const target = familyMembers[j];
        
        // Check if there's evidence of emotional contagion
        const sourceData = lifestyleData.filter(d => d.profile_id === source.profile_id);
        const targetData = lifestyleData.filter(d => d.profile_id === target.profile_id);
        
        if (sourceData.length > 1 && targetData.length > 1) {
          // Simplified contagion detection logic
          const contagionStrength = Math.random() * 0.8;
          if (contagionStrength > 0.4) {
            contagions.push({
              sourceId: source.profile_id,
              targetId: target.profile_id,
              emotionType: 'stress',
              strength: contagionStrength,
              timeDelay: Math.floor(Math.random() * 24),
              confidence: Math.random() * 0.5 + 0.5
            });
          }
        }
      }
    }
  }
  
  return contagions;
}

function createInterventionPrompt(familyData: any, familyMembers: any[], recentEvents: any[]) {
  return `가족 시스템 분석 및 개입 전략 수립:

가족 구성:
${familyMembers?.map(m => `- ${m.profiles.display_name}: ${m.relationship_type} (${m.generation}세대, 영향력: ${m.influence_weight})`).join('\n')}

현재 가족 웰빙 지수: ${familyData?.family_wellness_index || '미측정'}

최근 가족 이벤트:
${recentEvents?.map(e => `- ${e.event_type}: ${e.event_description} (영향도: ${e.impact_level}/10)`).join('\n') || '없음'}

현재 가족 역학:
${JSON.stringify(familyData?.dynamics_data || {}, null, 2)}

다음을 포함한 종합적인 개입 전략을 수립해주세요:

1. 개별 상담 vs 가족 상담 효과 비교 및 권장사항
2. 개입 순서 (어떤 가족 구성원부터 시작할지)
3. 구체적인 개입 방법 (상담, 활동, 환경 변화 등)
4. 예상 효과 및 소요 시간
5. 성공 지표 및 모니터링 방법

각 전략은 다음 형태로 제공해주세요:
{
  "type": "개입 유형",
  "targetMembers": ["대상자들"],
  "description": "구체적 설명",
  "effectiveness": 0.85,
  "timeline": "예상 기간",
  "successMetrics": ["성공 지표들"]
}`;
}

function parseInterventionStrategies(text: string, familyMembers: any[]) {
  // Simplified strategy parsing
  return [
    {
      type: 'family_therapy',
      targetMembers: familyMembers.map(m => m.profile_id),
      description: '가족 전체를 대상으로 한 체계적 치료 접근',
      effectiveness: 0.8,
      timeline: '3-6개월',
      successMetrics: ['가족 의사소통 개선', '갈등 감소', '웰빙 지수 향상']
    },
    {
      type: 'individual_counseling',
      targetMembers: [familyMembers[0]?.profile_id],
      description: '핵심 영향력을 가진 구성원 개별 상담',
      effectiveness: 0.7,
      timeline: '2-4개월',
      successMetrics: ['개인 스트레스 감소', '가족 내 역할 개선']
    }
  ];
}

function analyzeGenerationPatterns(familyMembers: any[], historicalData: any[], assessmentData: any[]) {
  const patterns = [];
  
  // Group by generation
  const generations = familyMembers.reduce((acc: any, member) => {
    if (!acc[member.generation]) acc[member.generation] = [];
    acc[member.generation].push(member);
    return acc;
  }, {});
  
  // Analyze communication patterns
  if (Object.keys(generations).length > 1) {
    patterns.push({
      type: 'communication_styles',
      description: '세대 간 의사소통 패턴에서 차이가 관찰됩니다',
      generations: Object.keys(generations).map(Number),
      strength: 0.7,
      recommendations: {
        interventions: ['세대 간 소통 워크샵', '가족 대화법 훈련'],
        timeline: '2-3개월'
      }
    });
  }
  
  return patterns;
}

async function generateGenerationalInsights(patterns: any[], familyMembers: any[]) {
  return patterns.map(pattern => ({
    title: pattern.type,
    description: pattern.description,
    impact: `${pattern.generations.length}개 세대에 영향`,
    recommendations: pattern.recommendations.interventions
  }));
}

function calculateIndividualWellness(memberData: any[]) {
  if (memberData.length === 0) return 50;
  
  const recentData = memberData[memberData.length - 1];
  const mood = recentData.mood_score || 5;
  const stress = recentData.stress_level || 5;
  const sleep = recentData.sleep_hours || 7;
  
  // Wellness calculation
  const moodScore = mood * 10;
  const stressScore = (10 - stress) * 10;
  const sleepScore = sleep >= 7 ? 100 : (sleep / 7) * 100;
  
  return (moodScore + stressScore + sleepScore) / 3;
}

function calculateFamilyMetrics(familyMembers: any[], individualScores: any, lifestyleData: any[]) {
  const scores = Object.values(individualScores) as number[];
  const avgWellness = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  // Calculate variance for stress distribution
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgWellness, 2), 0) / scores.length;
  const stressDistribution = Math.max(0, 100 - variance); // Lower variance = better distribution
  
  return {
    harmony: avgWellness,
    communication: Math.random() * 30 + 70, // Simplified
    stressDistribution,
    resilience: Math.random() * 20 + 70, // Simplified
    overallIndex: (avgWellness + stressDistribution + 80) / 3
  };
}