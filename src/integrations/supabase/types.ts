export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_therapist_interactions: {
        Row: {
          ai_therapist_id: string
          created_at: string
          duration_minutes: number | null
          emotional_analysis: Json | null
          id: string
          interaction_data: Json
          interaction_type: string | null
          profile_id: string
          session_id: string | null
          therapy_progress: Json | null
        }
        Insert: {
          ai_therapist_id: string
          created_at?: string
          duration_minutes?: number | null
          emotional_analysis?: Json | null
          id?: string
          interaction_data?: Json
          interaction_type?: string | null
          profile_id: string
          session_id?: string | null
          therapy_progress?: Json | null
        }
        Update: {
          ai_therapist_id?: string
          created_at?: string
          duration_minutes?: number | null
          emotional_analysis?: Json | null
          id?: string
          interaction_data?: Json
          interaction_type?: string | null
          profile_id?: string
          session_id?: string | null
          therapy_progress?: Json | null
        }
        Relationships: []
      }
      ai_therapists: {
        Row: {
          animation_config: Json | null
          appearance_config: Json
          created_at: string
          id: string
          interaction_styles: Json | null
          is_active: boolean | null
          name: string
          personality_traits: Json | null
          specialization: string
          therapy_approaches: Json | null
          voice_config: Json | null
        }
        Insert: {
          animation_config?: Json | null
          appearance_config?: Json
          created_at?: string
          id?: string
          interaction_styles?: Json | null
          is_active?: boolean | null
          name: string
          personality_traits?: Json | null
          specialization: string
          therapy_approaches?: Json | null
          voice_config?: Json | null
        }
        Update: {
          animation_config?: Json | null
          appearance_config?: Json
          created_at?: string
          id?: string
          interaction_styles?: Json | null
          is_active?: boolean | null
          name?: string
          personality_traits?: Json | null
          specialization?: string
          therapy_approaches?: Json | null
          voice_config?: Json | null
        }
        Relationships: []
      }
      assessments: {
        Row: {
          age_at_assessment: number
          age_group: string
          analysis: string | null
          completed_at: string
          family_id: string | null
          id: string
          profile_id: string
          recommendations: string | null
          results: Json
          risk_level: string | null
        }
        Insert: {
          age_at_assessment: number
          age_group: string
          analysis?: string | null
          completed_at?: string
          family_id?: string | null
          id?: string
          profile_id: string
          recommendations?: string | null
          results: Json
          risk_level?: string | null
        }
        Update: {
          age_at_assessment?: number
          age_group?: string
          analysis?: string | null
          completed_at?: string
          family_id?: string | null
          id?: string
          profile_id?: string
          recommendations?: string | null
          results?: Json
          risk_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_impact_metrics: {
        Row: {
          absenteeism_reduction_percent: number | null
          additional_metrics: Json | null
          created_at: string
          employee_satisfaction_improvement: number | null
          estimated_cost_savings: number | null
          id: string
          metric_period_end: string
          metric_period_start: string
          organization_id: string
          productivity_improvement_percent: number | null
          roi_percentage: number | null
          turnover_rate_after: number | null
          turnover_rate_before: number | null
          wellness_investment_amount: number | null
        }
        Insert: {
          absenteeism_reduction_percent?: number | null
          additional_metrics?: Json | null
          created_at?: string
          employee_satisfaction_improvement?: number | null
          estimated_cost_savings?: number | null
          id?: string
          metric_period_end: string
          metric_period_start: string
          organization_id: string
          productivity_improvement_percent?: number | null
          roi_percentage?: number | null
          turnover_rate_after?: number | null
          turnover_rate_before?: number | null
          wellness_investment_amount?: number | null
        }
        Update: {
          absenteeism_reduction_percent?: number | null
          additional_metrics?: Json | null
          created_at?: string
          employee_satisfaction_improvement?: number | null
          estimated_cost_savings?: number | null
          id?: string
          metric_period_end?: string
          metric_period_start?: string
          organization_id?: string
          productivity_improvement_percent?: number | null
          roi_percentage?: number | null
          turnover_rate_after?: number | null
          turnover_rate_before?: number | null
          wellness_investment_amount?: number | null
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          ended_at: string | null
          id: string
          is_active: boolean | null
          messages: Json
          profile_id: string
          risk_levels: Json
          session_summary: string | null
          started_at: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          messages?: Json
          profile_id: string
          risk_levels?: Json
          session_summary?: string | null
          started_at?: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          messages?: Json
          profile_id?: string
          risk_levels?: Json
          session_summary?: string | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          assessment_id: string | null
          created_at: string
          duration_minutes: number | null
          expert_name: string
          expert_specialization: string | null
          family_id: string | null
          id: string
          next_appointment: string | null
          notes: string | null
          profile_id: string
          session_type: string | null
          status: string | null
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          expert_name: string
          expert_specialization?: string | null
          family_id?: string | null
          id?: string
          next_appointment?: string | null
          notes?: string | null
          profile_id: string
          session_type?: string | null
          status?: string | null
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          expert_name?: string
          expert_specialization?: string | null
          family_id?: string | null
          id?: string
          next_appointment?: string | null
          notes?: string | null
          profile_id?: string
          session_type?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_programs: {
        Row: {
          completion_rate: number | null
          created_at: string
          effectiveness_score: number | null
          end_date: string | null
          id: string
          organization_id: string
          participants_count: number | null
          program_content: Json
          program_type: string
          roi_metrics: Json | null
          start_date: string
          status: string | null
          target_demographic: Json
        }
        Insert: {
          completion_rate?: number | null
          created_at?: string
          effectiveness_score?: number | null
          end_date?: string | null
          id?: string
          organization_id: string
          participants_count?: number | null
          program_content: Json
          program_type: string
          roi_metrics?: Json | null
          start_date: string
          status?: string | null
          target_demographic: Json
        }
        Update: {
          completion_rate?: number | null
          created_at?: string
          effectiveness_score?: number | null
          end_date?: string | null
          id?: string
          organization_id?: string
          participants_count?: number | null
          program_content?: Json
          program_type?: string
          roi_metrics?: Json | null
          start_date?: string
          status?: string | null
          target_demographic?: Json
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          employee_count: number | null
          head_profile_id: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          employee_count?: number | null
          head_profile_id?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          employee_count?: number | null
          head_profile_id?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: []
      }
      emotional_contagion_logs: {
        Row: {
          detection_confidence: number | null
          emotion_type: string
          family_id: string
          id: string
          influence_strength: number | null
          source_member_id: string
          target_member_id: string
          time_delay_hours: number | null
          timestamp: string
        }
        Insert: {
          detection_confidence?: number | null
          emotion_type: string
          family_id: string
          id?: string
          influence_strength?: number | null
          source_member_id: string
          target_member_id: string
          time_delay_hours?: number | null
          timestamp?: string
        }
        Update: {
          detection_confidence?: number | null
          emotion_type?: string
          family_id?: string
          id?: string
          influence_strength?: number | null
          source_member_id?: string
          target_member_id?: string
          time_delay_hours?: number | null
          timestamp?: string
        }
        Relationships: []
      }
      employee_profiles: {
        Row: {
          created_at: string
          department_id: string | null
          employment_type: string | null
          hire_date: string
          id: string
          is_active: boolean | null
          level: string
          organization_id: string
          position: string
          profile_id: string
          years_of_experience: number | null
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          employment_type?: string | null
          hire_date: string
          id?: string
          is_active?: boolean | null
          level: string
          organization_id: string
          position: string
          profile_id: string
          years_of_experience?: number | null
        }
        Update: {
          created_at?: string
          department_id?: string | null
          employment_type?: string | null
          hire_date?: string
          id?: string
          is_active?: boolean | null
          level?: string
          organization_id?: string
          position?: string
          profile_id?: string
          years_of_experience?: number | null
        }
        Relationships: []
      }
      employee_wellness_tracking: {
        Row: {
          burnout_score: number | null
          created_at: string
          employee_profile_id: string
          id: string
          job_satisfaction: number | null
          productivity_self_rating: number | null
          stress_level: number | null
          team_satisfaction: number | null
          tracking_date: string
          turnover_intention: number | null
          wellness_factors: Json | null
          work_life_balance: number | null
        }
        Insert: {
          burnout_score?: number | null
          created_at?: string
          employee_profile_id: string
          id?: string
          job_satisfaction?: number | null
          productivity_self_rating?: number | null
          stress_level?: number | null
          team_satisfaction?: number | null
          tracking_date: string
          turnover_intention?: number | null
          wellness_factors?: Json | null
          work_life_balance?: number | null
        }
        Update: {
          burnout_score?: number | null
          created_at?: string
          employee_profile_id?: string
          id?: string
          job_satisfaction?: number | null
          productivity_self_rating?: number | null
          stress_level?: number | null
          team_satisfaction?: number | null
          tracking_date?: string
          turnover_intention?: number | null
          wellness_factors?: Json | null
          work_life_balance?: number | null
        }
        Relationships: []
      }
      families: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "families_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_dynamics: {
        Row: {
          analysis_date: string
          created_at: string
          dynamics_data: Json
          family_id: string
          family_wellness_index: number | null
          id: string
        }
        Insert: {
          analysis_date: string
          created_at?: string
          dynamics_data: Json
          family_id: string
          family_wellness_index?: number | null
          id?: string
        }
        Update: {
          analysis_date?: string
          created_at?: string
          dynamics_data?: Json
          family_id?: string
          family_wellness_index?: number | null
          id?: string
        }
        Relationships: []
      }
      family_events: {
        Row: {
          affected_members: string[] | null
          created_at: string
          event_date: string
          event_description: string | null
          event_type: string
          family_id: string
          id: string
          impact_level: number | null
          resolution_status: string | null
        }
        Insert: {
          affected_members?: string[] | null
          created_at?: string
          event_date: string
          event_description?: string | null
          event_type: string
          family_id: string
          id?: string
          impact_level?: number | null
          resolution_status?: string | null
        }
        Update: {
          affected_members?: string[] | null
          created_at?: string
          event_date?: string
          event_description?: string | null
          event_type?: string
          family_id?: string
          id?: string
          impact_level?: number | null
          resolution_status?: string | null
        }
        Relationships: []
      }
      family_intervention_strategies: {
        Row: {
          created_at: string
          effectiveness_score: number | null
          family_id: string
          id: string
          intervention_order: number | null
          predicted_effectiveness: number | null
          status: string | null
          strategy_content: Json
          strategy_type: string
          target_members: string[] | null
        }
        Insert: {
          created_at?: string
          effectiveness_score?: number | null
          family_id: string
          id?: string
          intervention_order?: number | null
          predicted_effectiveness?: number | null
          status?: string | null
          strategy_content: Json
          strategy_type: string
          target_members?: string[] | null
        }
        Update: {
          created_at?: string
          effectiveness_score?: number | null
          family_id?: string
          id?: string
          intervention_order?: number | null
          predicted_effectiveness?: number | null
          status?: string | null
          strategy_content?: Json
          strategy_type?: string
          target_members?: string[] | null
        }
        Relationships: []
      }
      family_members: {
        Row: {
          family_id: string
          id: string
          is_primary_caregiver: boolean | null
          joined_at: string
          profile_id: string
          relationship: string
        }
        Insert: {
          family_id: string
          id?: string
          is_primary_caregiver?: boolean | null
          joined_at?: string
          profile_id: string
          relationship: string
        }
        Update: {
          family_id?: string
          id?: string
          is_primary_caregiver?: boolean | null
          joined_at?: string
          profile_id?: string
          relationship?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_relationships: {
        Row: {
          created_at: string
          family_id: string
          generation: number
          id: string
          influence_weight: number | null
          profile_id: string
          relationship_type: string
          stress_sensitivity: number | null
        }
        Insert: {
          created_at?: string
          family_id: string
          generation: number
          id?: string
          influence_weight?: number | null
          profile_id: string
          relationship_type: string
          stress_sensitivity?: number | null
        }
        Update: {
          created_at?: string
          family_id?: string
          generation?: number
          id?: string
          influence_weight?: number | null
          profile_id?: string
          relationship_type?: string
          stress_sensitivity?: number | null
        }
        Relationships: []
      }
      family_wellness_metrics: {
        Row: {
          collective_harmony: number | null
          communication_quality: number | null
          created_at: string
          family_id: string
          id: string
          individual_scores: Json
          metric_date: string
          overall_wellness_index: number | null
          resilience_index: number | null
          stress_distribution: number | null
        }
        Insert: {
          collective_harmony?: number | null
          communication_quality?: number | null
          created_at?: string
          family_id: string
          id?: string
          individual_scores: Json
          metric_date: string
          overall_wellness_index?: number | null
          resilience_index?: number | null
          stress_distribution?: number | null
        }
        Update: {
          collective_harmony?: number | null
          communication_quality?: number | null
          created_at?: string
          family_id?: string
          id?: string
          individual_scores?: Json
          metric_date?: string
          overall_wellness_index?: number | null
          resilience_index?: number | null
          stress_distribution?: number | null
        }
        Relationships: []
      }
      generational_patterns: {
        Row: {
          family_id: string
          generations_involved: number[] | null
          id: string
          intervention_recommendations: Json | null
          last_analyzed: string
          pattern_description: string | null
          pattern_strength: number | null
          pattern_type: string
        }
        Insert: {
          family_id: string
          generations_involved?: number[] | null
          id?: string
          intervention_recommendations?: Json | null
          last_analyzed?: string
          pattern_description?: string | null
          pattern_strength?: number | null
          pattern_type: string
        }
        Update: {
          family_id?: string
          generations_involved?: number[] | null
          id?: string
          intervention_recommendations?: Json | null
          last_analyzed?: string
          pattern_description?: string | null
          pattern_strength?: number | null
          pattern_type?: string
        }
        Relationships: []
      }
      lifestyle_patterns: {
        Row: {
          created_at: string
          exercise_minutes: number | null
          id: string
          menstrual_cycle_day: number | null
          mood_score: number | null
          notes: string | null
          pattern_date: string
          profile_id: string
          sleep_hours: number | null
          sleep_quality: number | null
          social_interactions: number | null
          stress_level: number | null
          updated_at: string
          weather_condition: string | null
        }
        Insert: {
          created_at?: string
          exercise_minutes?: number | null
          id?: string
          menstrual_cycle_day?: number | null
          mood_score?: number | null
          notes?: string | null
          pattern_date: string
          profile_id: string
          sleep_hours?: number | null
          sleep_quality?: number | null
          social_interactions?: number | null
          stress_level?: number | null
          updated_at?: string
          weather_condition?: string | null
        }
        Update: {
          created_at?: string
          exercise_minutes?: number | null
          id?: string
          menstrual_cycle_day?: number | null
          mood_score?: number | null
          notes?: string | null
          pattern_date?: string
          profile_id?: string
          sleep_hours?: number | null
          sleep_quality?: number | null
          social_interactions?: number | null
          stress_level?: number | null
          updated_at?: string
          weather_condition?: string | null
        }
        Relationships: []
      }
      metaverse_presence: {
        Row: {
          avatar_id: string | null
          connection_quality: Json | null
          environment_id: string | null
          id: string
          last_activity: string | null
          position_data: Json | null
          profile_id: string
          session_id: string | null
          status: string | null
        }
        Insert: {
          avatar_id?: string | null
          connection_quality?: Json | null
          environment_id?: string | null
          id?: string
          last_activity?: string | null
          position_data?: Json | null
          profile_id: string
          session_id?: string | null
          status?: string | null
        }
        Update: {
          avatar_id?: string | null
          connection_quality?: Json | null
          environment_id?: string | null
          id?: string
          last_activity?: string | null
          position_data?: Json | null
          profile_id?: string
          session_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      metaverse_sessions: {
        Row: {
          created_at: string
          current_participants: number | null
          description: string | null
          end_time: string | null
          environment_id: string
          host_profile_id: string
          id: string
          is_public: boolean | null
          max_participants: number | null
          scenario_data: Json | null
          session_config: Json | null
          session_name: string | null
          session_type: string
          start_time: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_participants?: number | null
          description?: string | null
          end_time?: string | null
          environment_id: string
          host_profile_id: string
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          scenario_data?: Json | null
          session_config?: Json | null
          session_name?: string | null
          session_type: string
          start_time?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_participants?: number | null
          description?: string | null
          end_time?: string | null
          environment_id?: string
          host_profile_id?: string
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          scenario_data?: Json | null
          session_config?: Json | null
          session_name?: string | null
          session_type?: string
          start_time?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      organizational_wellness: {
        Row: {
          burnout_risk_count: number | null
          created_at: string
          department_scores: Json
          employee_satisfaction: number | null
          high_stress_count: number | null
          id: string
          level_scores: Json
          metric_date: string
          organization_id: string
          overall_wellness_score: number | null
          productivity_index: number | null
          team_cohesion_score: number | null
          turnover_risk_score: number | null
        }
        Insert: {
          burnout_risk_count?: number | null
          created_at?: string
          department_scores?: Json
          employee_satisfaction?: number | null
          high_stress_count?: number | null
          id?: string
          level_scores?: Json
          metric_date: string
          organization_id: string
          overall_wellness_score?: number | null
          productivity_index?: number | null
          team_cohesion_score?: number | null
          turnover_risk_score?: number | null
        }
        Update: {
          burnout_risk_count?: number | null
          created_at?: string
          department_scores?: Json
          employee_satisfaction?: number | null
          high_stress_count?: number | null
          id?: string
          level_scores?: Json
          metric_date?: string
          organization_id?: string
          overall_wellness_score?: number | null
          productivity_index?: number | null
          team_cohesion_score?: number | null
          turnover_risk_score?: number | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          admin_profile_id: string
          created_at: string
          employee_count: number
          id: string
          industry: string
          name: string
          settings: Json | null
          size_category: string
          subscription_plan: string | null
          updated_at: string
        }
        Insert: {
          admin_profile_id: string
          created_at?: string
          employee_count: number
          id?: string
          industry: string
          name: string
          settings?: Json | null
          size_category: string
          subscription_plan?: string | null
          updated_at?: string
        }
        Update: {
          admin_profile_id?: string
          created_at?: string
          employee_count?: number
          id?: string
          industry?: string
          name?: string
          settings?: Json | null
          size_category?: string
          subscription_plan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      personalized_recommendations: {
        Row: {
          content: Json
          created_at: string
          delivered_at: string | null
          effectiveness_score: number | null
          engaged_at: string | null
          id: string
          profile_id: string
          recommendation_type: string
          status: string | null
          trigger_reason: string | null
        }
        Insert: {
          content: Json
          created_at?: string
          delivered_at?: string | null
          effectiveness_score?: number | null
          engaged_at?: string | null
          id?: string
          profile_id: string
          recommendation_type: string
          status?: string | null
          trigger_reason?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          delivered_at?: string | null
          effectiveness_score?: number | null
          engaged_at?: string | null
          id?: string
          profile_id?: string
          recommendation_type?: string
          status?: string | null
          trigger_reason?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          display_name: string
          gender: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          display_name: string
          gender?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          display_name?: string
          gender?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_participants: {
        Row: {
          avatar_id: string | null
          id: string
          interaction_data: Json | null
          joined_at: string | null
          left_at: string | null
          participant_role: string | null
          profile_id: string
          session_id: string
          therapy_progress: Json | null
        }
        Insert: {
          avatar_id?: string | null
          id?: string
          interaction_data?: Json | null
          joined_at?: string | null
          left_at?: string | null
          participant_role?: string | null
          profile_id: string
          session_id: string
          therapy_progress?: Json | null
        }
        Update: {
          avatar_id?: string | null
          id?: string
          interaction_data?: Json | null
          joined_at?: string | null
          left_at?: string | null
          participant_role?: string | null
          profile_id?: string
          session_id?: string
          therapy_progress?: Json | null
        }
        Relationships: []
      }
      social_matches: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          match_score: number | null
          match_type: string
          profile_id_1: string
          profile_id_2: string
          status: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          match_score?: number | null
          match_type: string
          profile_id_1: string
          profile_id_2: string
          status?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          match_score?: number | null
          match_type?: string
          profile_id_1?: string
          profile_id_2?: string
          status?: string | null
        }
        Relationships: []
      }
      team_dynamics: {
        Row: {
          analysis_date: string
          collaboration_effectiveness: number | null
          communication_quality: number | null
          conflict_risk_level: string | null
          created_at: string
          department_id: string
          id: string
          intervention_recommendations: Json | null
          leadership_satisfaction: number | null
          stress_propagation_risk: number | null
          team_harmony_score: number | null
        }
        Insert: {
          analysis_date: string
          collaboration_effectiveness?: number | null
          communication_quality?: number | null
          conflict_risk_level?: string | null
          created_at?: string
          department_id: string
          id?: string
          intervention_recommendations?: Json | null
          leadership_satisfaction?: number | null
          stress_propagation_risk?: number | null
          team_harmony_score?: number | null
        }
        Update: {
          analysis_date?: string
          collaboration_effectiveness?: number | null
          communication_quality?: number | null
          conflict_risk_level?: string | null
          created_at?: string
          department_id?: string
          id?: string
          intervention_recommendations?: Json | null
          leadership_satisfaction?: number | null
          stress_propagation_risk?: number | null
          team_harmony_score?: number | null
        }
        Relationships: []
      }
      therapy_environments: {
        Row: {
          ambient_sounds: Json | null
          created_at: string
          description: string | null
          environment_type: string
          id: string
          lighting_config: Json | null
          name: string
          scene_config: Json
        }
        Insert: {
          ambient_sounds?: Json | null
          created_at?: string
          description?: string | null
          environment_type: string
          id?: string
          lighting_config?: Json | null
          name: string
          scene_config?: Json
        }
        Update: {
          ambient_sounds?: Json | null
          created_at?: string
          description?: string | null
          environment_type?: string
          id?: string
          lighting_config?: Json | null
          name?: string
          scene_config?: Json
        }
        Relationships: []
      }
      therapy_scenarios: {
        Row: {
          ai_characters: Json | null
          created_at: string
          description: string | null
          difficulty_level: number | null
          environment_requirements: Json | null
          id: string
          scenario_config: Json
          scenario_type: string
          success_criteria: Json | null
          target_age_group: string | null
          therapeutic_goals: Json | null
          title: string
        }
        Insert: {
          ai_characters?: Json | null
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          environment_requirements?: Json | null
          id?: string
          scenario_config?: Json
          scenario_type: string
          success_criteria?: Json | null
          target_age_group?: string | null
          therapeutic_goals?: Json | null
          title: string
        }
        Update: {
          ai_characters?: Json | null
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          environment_requirements?: Json | null
          id?: string
          scenario_config?: Json
          scenario_type?: string
          success_criteria?: Json | null
          target_age_group?: string | null
          therapeutic_goals?: Json | null
          title?: string
        }
        Relationships: []
      }
      user_avatars: {
        Row: {
          animation_preferences: Json | null
          appearance_config: Json
          avatar_name: string | null
          created_at: string
          id: string
          is_active: boolean | null
          profile_id: string
          updated_at: string
        }
        Insert: {
          animation_preferences?: Json | null
          appearance_config?: Json
          avatar_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          profile_id: string
          updated_at?: string
        }
        Update: {
          animation_preferences?: Json | null
          appearance_config?: Json
          avatar_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_behavior_logs: {
        Row: {
          behavior_data: Json
          behavior_type: string
          device_info: Json | null
          id: string
          profile_id: string
          session_id: string | null
          timestamp: string
        }
        Insert: {
          behavior_data?: Json
          behavior_type: string
          device_info?: Json | null
          id?: string
          profile_id: string
          session_id?: string | null
          timestamp?: string
        }
        Update: {
          behavior_data?: Json
          behavior_type?: string
          device_info?: Json | null
          id?: string
          profile_id?: string
          session_id?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      user_environment_preferences: {
        Row: {
          accessibility_settings: Json | null
          comfort_settings: Json | null
          created_at: string
          favorite_environment_id: string | null
          id: string
          preferred_environments: Json
          profile_id: string
          updated_at: string
        }
        Insert: {
          accessibility_settings?: Json | null
          comfort_settings?: Json | null
          created_at?: string
          favorite_environment_id?: string | null
          id?: string
          preferred_environments?: Json
          profile_id: string
          updated_at?: string
        }
        Update: {
          accessibility_settings?: Json | null
          comfort_settings?: Json | null
          created_at?: string
          favorite_environment_id?: string | null
          id?: string
          preferred_environments?: Json
          profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_insights: {
        Row: {
          confidence_score: number | null
          id: string
          insight_data: Json
          insight_type: string
          last_updated: string
          profile_id: string
        }
        Insert: {
          confidence_score?: number | null
          id?: string
          insight_data: Json
          insight_type: string
          last_updated?: string
          profile_id: string
        }
        Update: {
          confidence_score?: number | null
          id?: string
          insight_data?: Json
          insight_type?: string
          last_updated?: string
          profile_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
