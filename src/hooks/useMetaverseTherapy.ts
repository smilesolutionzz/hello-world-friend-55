import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TherapyEnvironment {
  id: string;
  name: string;
  environment_type: string;
  description: string;
  scene_config: any;
  ambient_sounds: any;
  lighting_config: any;
}

export interface MetaverseSession {
  id: string;
  session_type: string;
  environment_id: string;
  host_profile_id: string;
  session_name: string;
  description: string;
  max_participants: number;
  current_participants: number;
  session_config: any;
  scenario_data: any;
  start_time: string;
  end_time: string;
  status: string;
  is_public: boolean;
}

export interface UserAvatar {
  id: string;
  profile_id: string;
  avatar_name: string;
  appearance_config: any;
  animation_preferences: any;
  is_active: boolean;
}

export interface AITherapist {
  id: string;
  name: string;
  specialization: string;
  appearance_config: any;
  personality_traits: any;
  therapy_approaches: any;
  interaction_styles: any;
  voice_config: any;
  animation_config: any;
}

export interface TherapyScenario {
  id: string;
  scenario_type: string;
  title: string;
  description: string;
  difficulty_level: number;
  target_age_group: string;
  scenario_config: any;
  therapeutic_goals: any;
}

export const useMetaverseTherapy = () => {
  const [loading, setLoading] = useState(false);
  const [environments, setEnvironments] = useState<TherapyEnvironment[]>([]);
  const [sessions, setSessions] = useState<MetaverseSession[]>([]);
  const [userAvatars, setUserAvatars] = useState<UserAvatar[]>([]);
  const [aiTherapists, setAITherapists] = useState<AITherapist[]>([]);
  const [scenarios, setScenarios] = useState<TherapyScenario[]>([]);
  const [currentSession, setCurrentSession] = useState<MetaverseSession | null>(null);
  const [recommendedEnvironment, setRecommendedEnvironment] = useState<any>(null);

  const loadTherapyEnvironments = async () => {
    try {
      const { data, error } = await supabase
        .from('therapy_environments')
        .select('*')
        .order('name');

      if (error) throw error;

      setEnvironments(data || []);
      return data;
    } catch (error) {
      console.error('Error loading therapy environments:', error);
      throw error;
    }
  };

  const loadMetaverseSessions = async (isPublic: boolean = true) => {
    try {
      const { data, error } = await supabase
        .from('metaverse_sessions')
        .select(`
          *,
          therapy_environments (name, environment_type),
          profiles!metaverse_sessions_host_profile_id_fkey (display_name)
        `)
        .eq('is_public', isPublic)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSessions(data || []);
      return data;
    } catch (error) {
      console.error('Error loading metaverse sessions:', error);
      throw error;
    }
  };

  const loadUserAvatars = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUserAvatars(data || []);
      return data;
    } catch (error) {
      console.error('Error loading user avatars:', error);
      throw error;
    }
  };

  const loadAITherapists = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_therapists')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setAITherapists(data || []);
      return data;
    } catch (error) {
      console.error('Error loading AI therapists:', error);
      throw error;
    }
  };

  const loadTherapyScenarios = async (targetAgeGroup?: string) => {
    try {
      let query = supabase
        .from('therapy_scenarios')
        .select('*');

      if (targetAgeGroup) {
        query = query.or(`target_age_group.eq.${targetAgeGroup},target_age_group.eq.all`);
      }

      const { data, error } = await query.order('title');

      if (error) throw error;

      setScenarios(data || []);
      return data;
    } catch (error) {
      console.error('Error loading therapy scenarios:', error);
      throw error;
    }
  };

  const recommendEnvironment = async (profileId: string, currentMood: string, therapyGoals: string[]) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('metaverse-therapy', {
        body: {
          action: 'recommend_environment',
          data: {
            profileId,
            currentMood,
            therapyGoals,
            previousSessions: []
          }
        }
      });

      if (error) throw error;

      setRecommendedEnvironment(data.recommendation);
      return data.recommendation;
    } catch (error) {
      console.error('Error recommending environment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createMetaverseSession = async (sessionData: {
    hostProfileId: string;
    sessionType: string;
    environmentId: string;
    sessionName: string;
    description?: string;
    maxParticipants?: number;
    sessionConfig?: any;
    scenarioId?: string;
    isPublic?: boolean;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('metaverse-therapy', {
        body: {
          action: 'create_session',
          data: sessionData
        }
      });

      if (error) throw error;

      setCurrentSession(data.session);
      return data.session;
    } catch (error) {
      console.error('Error creating metaverse session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const joinMetaverseSession = async (sessionId: string, profileId: string, avatarId?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('metaverse-therapy', {
        body: {
          action: 'join_session',
          data: {
            sessionId,
            profileId,
            avatarId
          }
        }
      });

      if (error) throw error;

      setCurrentSession(data.session);
      return data;
    } catch (error) {
      console.error('Error joining metaverse session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateAITherapistResponse = async (
    aiTherapistId: string,
    userMessage: string,
    profileId: string,
    sessionContext: any,
    emotionalState?: string,
    therapyGoals?: string[]
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('metaverse-therapy', {
        body: {
          action: 'generate_ai_therapist_response',
          data: {
            aiTherapistId,
            userMessage,
            profileId,
            sessionContext,
            emotionalState,
            therapyGoals
          }
        }
      });

      if (error) throw error;

      return data.response;
    } catch (error) {
      console.error('Error generating AI therapist response:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const analyzeUserEmotion = async (
    profileId: string,
    textData?: string,
    audioData?: any,
    videoData?: any,
    sessionId?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('metaverse-therapy', {
        body: {
          action: 'analyze_user_emotion',
          data: {
            profileId,
            textData,
            audioData,
            videoData,
            sessionId
          }
        }
      });

      if (error) throw error;

      return data.analysis;
    } catch (error) {
      console.error('Error analyzing user emotion:', error);
      throw error;
    }
  };

  const updateScenarioProgress = async (
    sessionId: string,
    profileId: string,
    scenarioId: string,
    progressData: any,
    achievements?: string[]
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('metaverse-therapy', {
        body: {
          action: 'update_scenario_progress',
          data: {
            sessionId,
            profileId,
            scenarioId,
            progressData,
            achievements
          }
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating scenario progress:', error);
      throw error;
    }
  };

  const getEnvironmentSuggestions = async (
    profileId: string,
    currentActivity?: string,
    timeOfDay?: string,
    weatherMood?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('metaverse-therapy', {
        body: {
          action: 'get_environment_suggestions',
          data: {
            profileId,
            currentActivity,
            timeOfDay,
            weatherMood
          }
        }
      });

      if (error) throw error;

      return data.suggestions;
    } catch (error) {
      console.error('Error getting environment suggestions:', error);
      throw error;
    }
  };

  const createUserAvatar = async (
    profileId: string,
    avatarName: string,
    appearanceConfig: any,
    animationPreferences?: any
  ) => {
    try {
      const { data, error } = await supabase
        .from('user_avatars')
        .insert({
          profile_id: profileId,
          avatar_name: avatarName,
          appearance_config: appearanceConfig,
          animation_preferences: animationPreferences || {},
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Deactivate other avatars
      await supabase
        .from('user_avatars')
        .update({ is_active: false })
        .eq('profile_id', profileId)
        .neq('id', data.id);

      return data;
    } catch (error) {
      console.error('Error creating user avatar:', error);
      throw error;
    }
  };

  const updateUserPresence = async (
    profileId: string,
    sessionId: string,
    positionData: any,
    status: string = 'online'
  ) => {
    try {
      const { data, error } = await supabase
        .from('metaverse_presence')
        .upsert({
          profile_id: profileId,
          session_id: sessionId,
          position_data: positionData,
          status: status,
          last_activity: new Date().toISOString()
        });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating user presence:', error);
      throw error;
    }
  };

  const subscribeToSessionUpdates = (sessionId: string, onUpdate: (payload: any) => void) => {
    return supabase
      .channel('session-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'metaverse_presence',
          filter: `session_id=eq.${sessionId}`
        },
        onUpdate
      )
      .subscribe();
  };

  return {
    loading,
    environments,
    sessions,
    userAvatars,
    aiTherapists,
    scenarios,
    currentSession,
    recommendedEnvironment,
    loadTherapyEnvironments,
    loadMetaverseSessions,
    loadUserAvatars,
    loadAITherapists,
    loadTherapyScenarios,
    recommendEnvironment,
    createMetaverseSession,
    joinMetaverseSession,
    generateAITherapistResponse,
    analyzeUserEmotion,
    updateScenarioProgress,
    getEnvironmentSuggestions,
    createUserAvatar,
    updateUserPresence,
    subscribeToSessionUpdates
  };
};