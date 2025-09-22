import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { 
      action, 
      profileId, 
      sessionType, 
      userMessage, 
      emotionData, 
      lifestyleData,
      relationshipData 
    } = await req.json();

    console.log('AI Coach request:', { action, profileId, sessionType });

    let response;

    switch (action) {
      case 'start_session':
        response = await startCoachingSession(supabase, profileId, sessionType);
        break;
      case 'analyze_emotion':
        response = await analyzeEmotion(supabase, openAIApiKey, profileId, emotionData);
        break;
      case 'chat_with_coach':
        response = await chatWithCoach(supabase, openAIApiKey, profileId, userMessage, sessionType);
        break;
      case 'generate_cbt_homework':
        response = await generateCBTHomework(supabase, openAIApiKey, profileId);
        break;
      case 'analyze_relationship':
        response = await analyzeRelationship(supabase, openAIApiKey, profileId, relationshipData);
        break;
      case 'lifestyle_coaching':
        response = await lifestyleCoaching(supabase, openAIApiKey, profileId, lifestyleData);
        break;
      case 'get_personalized_intervention':
        response = await getPersonalizedIntervention(supabase, openAIApiKey, profileId, emotionData);
        break;
      default:
        throw new Error('Unknown action');
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-coach-advanced function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function startCoachingSession(supabase: any, profileId: string, sessionType: string) {
  const { data: session, error } = await supabase
    .from('ai_coach_sessions')
    .insert({
      profile_id: profileId,
      session_type: sessionType,
      session_data: {},
    })
    .select()
    .single();

  if (error) throw error;
  return { sessionId: session.id, message: 'Coaching session started' };
}

async function analyzeEmotion(supabase: any, openAIApiKey: string, profileId: string, emotionData: any) {
  const { text, voiceTone, behaviorPattern } = emotionData;

  // Get user's emotion history for context
  const { data: emotionHistory } = await supabase
    .from('emotion_monitoring_logs')
    .select('*')
    .eq('profile_id', profileId)
    .order('detection_timestamp', { ascending: false })
    .limit(10);

  // Get user's CBT patterns for context
  const { data: cbtPatterns } = await supabase
    .from('cbt_patterns')
    .select('*')
    .eq('profile_id', profileId);

  const contextHistory = emotionHistory?.map(log => 
    `${log.detection_timestamp}: ${log.emotion_type} (intensity: ${log.intensity_level})`
  ).join('\n') || 'No previous emotions recorded';

  const cbtContext = cbtPatterns?.map(pattern =>
    `Distortion: ${pattern.cognitive_distortion_type}, Triggers: ${JSON.stringify(pattern.trigger_situations)}`
  ).join('\n') || 'No CBT patterns identified yet';

  const prompt = `
    You are an advanced AI psychology coach specializing in real-time emotion analysis and intervention.
    
    Current user input analysis:
    - Text: "${text || 'No text provided'}"
    - Voice tone indicators: ${voiceTone || 'No voice data'}
    - Behavior pattern: ${behaviorPattern || 'No behavior data'}
    
    User's emotion history (last 10 entries):
    ${contextHistory}
    
    User's cognitive distortion patterns:
    ${cbtContext}
    
    Please analyze:
    1. Primary emotion detected (anger, sadness, anxiety, stress, joy, etc.)
    2. Intensity level (1-10 scale)
    3. Underlying triggers or patterns
    4. Immediate intervention needed (yes/no)
    5. Specific intervention type and message
    6. Connection to past patterns
    
    Respond in JSON format:
    {
      "emotion": "primary_emotion",
      "intensity": number,
      "triggers": ["trigger1", "trigger2"],
      "needsIntervention": boolean,
      "interventionType": "breathing_exercise|cbt_reframing|crisis_support|positive_reinforcement",
      "interventionMessage": "Empathetic, specific message for user",
      "patternConnection": "How this relates to user's history",
      "recommendedActions": ["action1", "action2"]
    }
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-2025-08-07',
      messages: [
        { role: 'system', content: 'You are an expert AI psychology coach with deep knowledge of CBT, DBT, and emotion regulation techniques.' },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 1000,
    }),
  });

  const aiResponse = await response.json();
  const analysis = JSON.parse(aiResponse.choices[0].message.content);

  // Log the emotion detection
  await supabase
    .from('emotion_monitoring_logs')
    .insert({
      profile_id: profileId,
      emotion_type: analysis.emotion,
      intensity_level: analysis.intensity,
      detection_source: text ? 'text_pattern' : voiceTone ? 'voice_tone' : 'behavior_pattern',
      raw_data: emotionData,
      intervention_triggered: analysis.needsIntervention,
      intervention_type: analysis.interventionType,
    });

  return analysis;
}

async function chatWithCoach(supabase: any, openAIApiKey: string, profileId: string, userMessage: string, sessionType: string) {
  // Get user's conversation history
  const { data: conversationHistory } = await supabase
    .from('ai_coach_conversations')
    .select('*')
    .eq('profile_id', profileId)
    .order('timestamp', { ascending: false })
    .limit(20);

  // Get user's current patterns and data for context
  const { data: cbtPatterns } = await supabase
    .from('cbt_patterns')
    .select('*')
    .eq('profile_id', profileId);

  const { data: emotionLogs } = await supabase
    .from('emotion_monitoring_logs')
    .select('*')
    .eq('profile_id', profileId)
    .order('detection_timestamp', { ascending: false })
    .limit(5);

  const { data: lifestyleData } = await supabase
    .from('lifestyle_coaching_data')
    .select('*')
    .eq('profile_id', profileId)
    .order('tracking_date', { ascending: false })
    .limit(7);

  const conversationContext = conversationHistory?.map(msg => 
    `${msg.message_type}: ${msg.content}`
  ).reverse().join('\n') || 'First conversation';

  const cbtContext = cbtPatterns?.map(pattern =>
    `${pattern.cognitive_distortion_type}: ${pattern.progress_notes || 'No notes'}`
  ).join('\n') || 'No CBT patterns yet';

  const recentEmotions = emotionLogs?.map(log =>
    `${log.emotion_type} (${log.intensity_level}/10) - ${log.detection_timestamp}`
  ).join('\n') || 'No recent emotions logged';

  const lifestyleContext = lifestyleData?.map(data =>
    `${data.tracking_date}: Sleep ${JSON.stringify(data.sleep_data)}, Exercise ${JSON.stringify(data.exercise_data)}`
  ).join('\n') || 'No lifestyle data';

  let systemPrompt = '';
  
  switch (sessionType) {
    case 'emotion_monitoring':
      systemPrompt = `You are an empathetic AI psychology coach specializing in real-time emotion support. Help the user understand and regulate their emotions using evidence-based techniques.`;
      break;
    case 'cbt_coaching':
      systemPrompt = `You are an AI CBT (Cognitive Behavioral Therapy) coach. Help the user identify cognitive distortions, challenge negative thoughts, and develop healthier thinking patterns.`;
      break;
    case 'relationship_coaching':
      systemPrompt = `You are an AI relationship coach. Help the user improve their communication skills, resolve conflicts, and build healthier relationships.`;
      break;
    case 'lifestyle_coaching':
      systemPrompt = `You are an AI lifestyle coach focused on the connection between physical health and mental wellbeing. Provide personalized advice on sleep, nutrition, and exercise.`;
      break;
    default:
      systemPrompt = `You are a comprehensive AI psychology coach. Provide empathetic, evidence-based support across all areas of mental health.`;
  }

  const fullPrompt = `
    ${systemPrompt}
    
    User's conversation history:
    ${conversationContext}
    
    User's CBT patterns:
    ${cbtContext}
    
    Recent emotions:
    ${recentEmotions}
    
    Lifestyle context:
    ${lifestyleContext}
    
    Current user message: "${userMessage}"
    
    Provide a helpful, empathetic response that:
    1. Acknowledges their current state
    2. Offers specific, actionable advice
    3. References their patterns when relevant
    4. Uses appropriate therapeutic techniques
    5. Encourages progress and self-compassion
    
    Keep your response conversational, warm, and under 200 words.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-2025-08-07',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: fullPrompt }
      ],
      max_completion_tokens: 300,
    }),
  });

  const aiResponse = await response.json();
  const coachResponse = aiResponse.choices[0].message.content;

  // Log both messages
  await supabase
    .from('ai_coach_conversations')
    .insert([
      {
        profile_id: profileId,
        message_type: 'user',
        content: userMessage,
        conversation_context: { sessionType }
      },
      {
        profile_id: profileId,
        message_type: 'ai_coach',
        content: coachResponse,
        conversation_context: { sessionType }
      }
    ]);

  return { message: coachResponse, sessionType };
}

async function generateCBTHomework(supabase: any, openAIApiKey: string, profileId: string) {
  // Get user's CBT patterns and current progress
  const { data: cbtPatterns } = await supabase
    .from('cbt_patterns')
    .select('*')
    .eq('profile_id', profileId)
    .order('last_occurrence', { ascending: false });

  const { data: pastHomework } = await supabase
    .from('cbt_homework_assignments')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: emotionLogs } = await supabase
    .from('emotion_monitoring_logs')
    .select('*')
    .eq('profile_id', profileId)
    .order('detection_timestamp', { ascending: false })
    .limit(10);

  const patternsContext = cbtPatterns?.map(pattern =>
    `${pattern.cognitive_distortion_type}: Improvement score ${pattern.improvement_score || 'Not rated'}`
  ).join('\n') || 'No patterns identified yet';

  const homeworkHistory = pastHomework?.map(hw =>
    `${hw.assignment_type}: ${hw.completion_status} (Difficulty: ${hw.difficulty_level}/5)`
  ).join('\n') || 'No previous homework';

  const recentEmotions = emotionLogs?.map(log =>
    `${log.emotion_type} (${log.intensity_level}/10)`
  ).join(', ') || 'No recent emotions';

  const prompt = `
    Generate a personalized CBT homework assignment for this user:
    
    Current CBT patterns:
    ${patternsContext}
    
    Previous homework history:
    ${homeworkHistory}
    
    Recent emotional patterns: ${recentEmotions}
    
    Create a homework assignment that:
    1. Targets their most challenging cognitive distortion
    2. Is appropriately challenging (not too easy/hard based on history)
    3. Includes specific, actionable steps
    4. Has clear success criteria
    
    Respond in JSON format:
    {
      "assignmentType": "thought_record|behavior_experiment|exposure_exercise",
      "title": "Clear, motivating title",
      "description": "What they need to do and why",
      "instructions": {
        "steps": ["step1", "step2", "step3"],
        "duration": "how long to spend",
        "frequency": "how often to practice"
      },
      "difficultyLevel": 1-5,
      "expectedOutcomes": ["outcome1", "outcome2"],
      "successCriteria": "How to know they've completed it successfully"
    }
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-2025-08-07',
      messages: [
        { role: 'system', content: 'You are an expert CBT therapist creating personalized homework assignments.' },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 600,
    }),
  });

  const aiResponse = await response.json();
  const assignment = JSON.parse(aiResponse.choices[0].message.content);

  // Create the homework assignment
  const { data: homework, error } = await supabase
    .from('cbt_homework_assignments')
    .insert({
      profile_id: profileId,
      assignment_type: assignment.assignmentType,
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions,
      difficulty_level: assignment.difficultyLevel,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
    })
    .select()
    .single();

  if (error) throw error;
  return { assignment: homework, aiSuggestions: assignment };
}

async function analyzeRelationship(supabase: any, openAIApiKey: string, profileId: string, relationshipData: any) {
  const { relationshipType, recentInteraction, conflictDescription, communicationStyle } = relationshipData;

  // Get past relationship analysis
  const { data: pastAnalysis } = await supabase
    .from('relationship_analysis')
    .select('*')
    .eq('profile_id', profileId)
    .eq('relationship_type', relationshipType)
    .order('created_at', { ascending: false })
    .limit(3);

  const analysisHistory = pastAnalysis?.map(analysis =>
    `Satisfaction: ${analysis.satisfaction_score}/10, Triggers: ${JSON.stringify(analysis.conflict_triggers)}`
  ).join('\n') || 'No previous analysis';

  const prompt = `
    Analyze this relationship interaction and provide coaching advice:
    
    Relationship type: ${relationshipType}
    Recent interaction: "${recentInteraction}"
    Conflict description: "${conflictDescription || 'None provided'}"
    Communication style: "${communicationStyle || 'Not specified'}"
    
    Previous analysis history:
    ${analysisHistory}
    
    Provide analysis and specific advice in JSON format:
    {
      "communicationPatterns": {
        "strengths": ["strength1", "strength2"],
        "areasForImprovement": ["area1", "area2"]
      },
      "conflictTriggers": ["trigger1", "trigger2"],
      "improvementSuggestions": [
        {
          "category": "communication|boundaries|empathy|conflict_resolution",
          "suggestion": "Specific actionable advice",
          "example": "Example of how to implement"
        }
      ],
      "immediateActions": ["action1", "action2"],
      "satisfactionPrediction": 1-10,
      "encouragement": "Supportive message highlighting progress"
    }
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-2025-08-07',
      messages: [
        { role: 'system', content: 'You are an expert relationship coach with deep knowledge of communication patterns and conflict resolution.' },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 800,
    }),
  });

  const aiResponse = await response.json();
  const analysis = JSON.parse(aiResponse.choices[0].message.content);

  // Save the analysis
  await supabase
    .from('relationship_analysis')
    .insert({
      profile_id: profileId,
      relationship_type: relationshipType,
      relationship_id: `${relationshipType}_${Date.now()}`,
      communication_patterns: analysis.communicationPatterns,
      conflict_triggers: analysis.conflictTriggers,
      improvement_suggestions: analysis.improvementSuggestions,
      satisfaction_score: analysis.satisfactionPrediction,
    });

  return analysis;
}

async function lifestyleCoaching(supabase: any, openAIApiKey: string, profileId: string, lifestyleData: any) {
  const { sleepHours, sleepQuality, exerciseMinutes, moodRating, stressLevel, nutritionNotes } = lifestyleData;

  // Get recent lifestyle data for trend analysis
  const { data: recentData } = await supabase
    .from('lifestyle_coaching_data')
    .select('*')
    .eq('profile_id', profileId)
    .order('tracking_date', { ascending: false })
    .limit(14); // Last 2 weeks

  // Get recent emotion logs to correlate with lifestyle
  const { data: emotionLogs } = await supabase
    .from('emotion_monitoring_logs')
    .select('*')
    .eq('profile_id', profileId)
    .order('detection_timestamp', { ascending: false })
    .limit(10);

  const trendsContext = recentData?.map(data =>
    `${data.tracking_date}: Sleep ${JSON.stringify(data.sleep_data)}, Mood correlation: ${JSON.stringify(data.mental_health_correlation)}`
  ).join('\n') || 'No historical data';

  const emotionContext = emotionLogs?.map(log =>
    `${log.emotion_type} (${log.intensity_level}/10) on ${log.detection_timestamp.split('T')[0]}`
  ).join('\n') || 'No emotion data';

  const prompt = `
    Provide personalized lifestyle coaching based on this data:
    
    Today's data:
    - Sleep: ${sleepHours} hours, quality: ${sleepQuality}/10
    - Exercise: ${exerciseMinutes} minutes
    - Mood: ${moodRating}/10
    - Stress: ${stressLevel}/10
    - Nutrition notes: ${nutritionNotes || 'None provided'}
    
    Recent trends (last 2 weeks):
    ${trendsContext}
    
    Recent emotions:
    ${emotionContext}
    
    Analyze patterns and provide coaching in JSON format:
    {
      "mentalHealthCorrelation": {
        "sleepImpact": "How sleep affects their mental health",
        "exerciseImpact": "How exercise correlates with mood",
        "nutritionImpact": "Nutrition patterns and mental health"
      },
      "recommendations": [
        {
          "category": "sleep|exercise|nutrition|stress_management",
          "priority": "high|medium|low",
          "recommendation": "Specific action to take",
          "reasoning": "Why this will help their mental health",
          "targetMetric": "What improvement to expect"
        }
      ],
      "optimizedSchedule": {
        "bedtime": "Suggested bedtime",
        "exerciseTime": "Best time to exercise",
        "mealTiming": "Optimal meal schedule"
      },
      "seasonalAdjustments": "Considerations for current season",
      "adherenceScore": 1-10,
      "encouragement": "Motivational message celebrating progress"
    }
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-2025-08-07',
      messages: [
        { role: 'system', content: 'You are an expert lifestyle coach specializing in the connection between physical health and mental wellbeing.' },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 1000,
    }),
  });

  const aiResponse = await response.json();
  const coaching = JSON.parse(aiResponse.choices[0].message.content);

  // Save today's lifestyle data
  await supabase
    .from('lifestyle_coaching_data')
    .insert({
      profile_id: profileId,
      tracking_date: new Date().toISOString().split('T')[0],
      sleep_data: { hours: sleepHours, quality: sleepQuality },
      exercise_data: { minutes: exerciseMinutes },
      nutrition_data: { notes: nutritionNotes },
      mental_health_correlation: coaching.mentalHealthCorrelation,
      ai_recommendations: coaching.recommendations,
      adherence_score: coaching.adherenceScore,
    });

  return coaching;
}

async function getPersonalizedIntervention(supabase: any, openAIApiKey: string, profileId: string, emotionData: any) {
  const { currentEmotion, intensity, triggerSituation, urgencyLevel } = emotionData;

  // Get user's successful interventions from the past
  const { data: pastInterventions } = await supabase
    .from('emotion_monitoring_logs')
    .select('*')
    .eq('profile_id', profileId)
    .eq('intervention_triggered', true)
    .not('user_response', 'is', null)
    .order('detection_timestamp', { ascending: false })
    .limit(10);

  // Get user's CBT patterns for personalized approach
  const { data: cbtPatterns } = await supabase
    .from('cbt_patterns')
    .select('*')
    .eq('profile_id', profileId);

  const successfulInterventions = pastInterventions?.filter(log => 
    log.user_response && log.user_response.includes('helpful')
  ).map(log => 
    `${log.intervention_type}: ${log.user_response}`
  ).join('\n') || 'No previous interventions';

  const cognitivePatterns = cbtPatterns?.map(pattern =>
    `${pattern.cognitive_distortion_type}: ${pattern.restructured_thoughts}`
  ).join('\n') || 'No patterns identified';

  const prompt = `
    Create an immediate, personalized intervention for this emotional crisis:
    
    Current situation:
    - Emotion: ${currentEmotion}
    - Intensity: ${intensity}/10
    - Trigger: ${triggerSituation}
    - Urgency: ${urgencyLevel} (high/medium/low)
    
    User's successful past interventions:
    ${successfulInterventions}
    
    User's cognitive patterns:
    ${cognitivePatterns}
    
    Create an intervention that:
    1. Is immediately actionable
    2. Matches their proven response patterns
    3. Is appropriate for the urgency level
    4. Includes both immediate and follow-up actions
    
    Respond in JSON format:
    {
      "immediateAction": {
        "type": "breathing|grounding|movement|cognitive",
        "instruction": "Clear, step-by-step instructions",
        "duration": "How long to practice",
        "guidance": "Supportive voice guidance text"
      },
      "copingStrategy": {
        "technique": "Name of the technique",
        "steps": ["step1", "step2", "step3"],
        "whenToUse": "Future situations to apply this"
      },
      "followUpActions": [
        "Action to take after immediate relief",
        "Longer-term strategy"
      ],
      "riskAssessment": "low|medium|high",
      "referralNeeded": boolean,
      "checkInReminder": "When to check in again",
      "encouragement": "Personalized supportive message"
    }
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-2025-08-07',
      messages: [
        { role: 'system', content: 'You are an expert crisis intervention specialist with deep knowledge of evidence-based coping strategies.' },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 800,
    }),
  });

  const aiResponse = await response.json();
  const intervention = JSON.parse(aiResponse.choices[0].message.content);

  // Log this intervention
  await supabase
    .from('emotion_monitoring_logs')
    .insert({
      profile_id: profileId,
      emotion_type: currentEmotion,
      intensity_level: intensity,
      detection_source: 'user_report',
      raw_data: emotionData,
      intervention_triggered: true,
      intervention_type: intervention.immediateAction.type,
    });

  return intervention;
}