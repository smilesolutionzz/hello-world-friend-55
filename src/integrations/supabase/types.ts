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
      ai_coach_conversations: {
        Row: {
          content: string
          conversation_context: Json | null
          emotion_detected: string | null
          id: string
          intervention_type: string | null
          message_type: string
          profile_id: string
          session_id: string | null
          timestamp: string
        }
        Insert: {
          content: string
          conversation_context?: Json | null
          emotion_detected?: string | null
          id?: string
          intervention_type?: string | null
          message_type: string
          profile_id: string
          session_id?: string | null
          timestamp?: string
        }
        Update: {
          content?: string
          conversation_context?: Json | null
          emotion_detected?: string | null
          id?: string
          intervention_type?: string | null
          message_type?: string
          profile_id?: string
          session_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_coach_conversations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_coach_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_coach_sessions: {
        Row: {
          created_at: string
          effectiveness_score: number | null
          emotion_analysis: Json | null
          end_time: string | null
          id: string
          interventions_provided: Json | null
          profile_id: string
          session_data: Json
          session_type: string
          start_time: string
        }
        Insert: {
          created_at?: string
          effectiveness_score?: number | null
          emotion_analysis?: Json | null
          end_time?: string | null
          id?: string
          interventions_provided?: Json | null
          profile_id: string
          session_data?: Json
          session_type: string
          start_time?: string
        }
        Update: {
          created_at?: string
          effectiveness_score?: number | null
          emotion_analysis?: Json | null
          end_time?: string | null
          id?: string
          interventions_provided?: Json | null
          profile_id?: string
          session_data?: Json
          session_type?: string
          start_time?: string
        }
        Relationships: []
      }
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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          target_share_id: string | null
          target_timeline_id: string | null
          user_agent: string | null
          who_expert_id: string | null
          who_user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          target_share_id?: string | null
          target_timeline_id?: string | null
          user_agent?: string | null
          who_expert_id?: string | null
          who_user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          target_share_id?: string | null
          target_timeline_id?: string | null
          user_agent?: string | null
          who_expert_id?: string | null
          who_user_id?: string | null
        }
        Relationships: []
      }
      auth_attempts: {
        Row: {
          attempt_type: string
          created_at: string
          email: string | null
          id: string
          ip_address: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attempt_type: string
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attempt_type?: string
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      cbt_homework_assignments: {
        Row: {
          ai_feedback: string | null
          assignment_type: string
          completed_at: string | null
          completion_data: Json | null
          completion_status: string | null
          created_at: string
          description: string
          difficulty_level: number | null
          due_date: string | null
          id: string
          instructions: Json
          profile_id: string
          title: string
        }
        Insert: {
          ai_feedback?: string | null
          assignment_type: string
          completed_at?: string | null
          completion_data?: Json | null
          completion_status?: string | null
          created_at?: string
          description: string
          difficulty_level?: number | null
          due_date?: string | null
          id?: string
          instructions?: Json
          profile_id: string
          title: string
        }
        Update: {
          ai_feedback?: string | null
          assignment_type?: string
          completed_at?: string | null
          completion_data?: Json | null
          completion_status?: string | null
          created_at?: string
          description?: string
          difficulty_level?: number | null
          due_date?: string | null
          id?: string
          instructions?: Json
          profile_id?: string
          title?: string
        }
        Relationships: []
      }
      cbt_patterns: {
        Row: {
          behavior_experiments: Json
          cognitive_distortion_type: string
          created_at: string
          id: string
          improvement_score: number | null
          last_occurrence: string | null
          negative_thoughts: Json
          profile_id: string
          progress_notes: string | null
          restructured_thoughts: Json
          trigger_situations: Json
          updated_at: string
        }
        Insert: {
          behavior_experiments?: Json
          cognitive_distortion_type: string
          created_at?: string
          id?: string
          improvement_score?: number | null
          last_occurrence?: string | null
          negative_thoughts?: Json
          profile_id: string
          progress_notes?: string | null
          restructured_thoughts?: Json
          trigger_situations?: Json
          updated_at?: string
        }
        Update: {
          behavior_experiments?: Json
          cognitive_distortion_type?: string
          created_at?: string
          id?: string
          improvement_score?: number | null
          last_occurrence?: string | null
          negative_thoughts?: Json
          profile_id?: string
          progress_notes?: string | null
          restructured_thoughts?: Json
          trigger_situations?: Json
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string
          room_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string
          room_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          room_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          assessment_results: Json | null
          created_at: string
          expert_id: string | null
          id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assessment_results?: Json | null
          created_at?: string
          expert_id?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assessment_results?: Json | null
          created_at?: string
          expert_id?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
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
      coaching_effectiveness_metrics: {
        Row: {
          ai_coach_helpfulness_rating: number | null
          areas_needing_focus: Json | null
          cbt_skill_application_score: number | null
          created_at: string
          id: string
          lifestyle_adherence_score: number | null
          metric_date: string
          overall_wellbeing_score: number | null
          profile_id: string
          relationship_satisfaction_score: number | null
          specific_improvements: Json | null
          stress_management_score: number | null
        }
        Insert: {
          ai_coach_helpfulness_rating?: number | null
          areas_needing_focus?: Json | null
          cbt_skill_application_score?: number | null
          created_at?: string
          id?: string
          lifestyle_adherence_score?: number | null
          metric_date: string
          overall_wellbeing_score?: number | null
          profile_id: string
          relationship_satisfaction_score?: number | null
          specific_improvements?: Json | null
          stress_management_score?: number | null
        }
        Update: {
          ai_coach_helpfulness_rating?: number | null
          areas_needing_focus?: Json | null
          cbt_skill_application_score?: number | null
          created_at?: string
          id?: string
          lifestyle_adherence_score?: number | null
          metric_date?: string
          overall_wellbeing_score?: number | null
          profile_id?: string
          relationship_satisfaction_score?: number | null
          specific_improvements?: Json | null
          stress_management_score?: number | null
        }
        Relationships: []
      }
      consult_requests: {
        Row: {
          budget_range: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          matched_expert_ids: string[] | null
          mode: string
          preferred_slots: string[] | null
          region: string
          status: string
          user_id: string | null
        }
        Insert: {
          budget_range?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          matched_expert_ids?: string[] | null
          mode: string
          preferred_slots?: string[] | null
          region: string
          status?: string
          user_id?: string | null
        }
        Update: {
          budget_range?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          matched_expert_ids?: string[] | null
          mode?: string
          preferred_slots?: string[] | null
          region?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
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
      emotion_monitoring_logs: {
        Row: {
          created_at: string
          detection_source: string
          detection_timestamp: string
          emotion_type: string
          id: string
          intensity_level: number
          intervention_triggered: boolean | null
          intervention_type: string | null
          profile_id: string
          raw_data: Json
          user_response: string | null
        }
        Insert: {
          created_at?: string
          detection_source: string
          detection_timestamp?: string
          emotion_type: string
          id?: string
          intensity_level: number
          intervention_triggered?: boolean | null
          intervention_type?: string | null
          profile_id: string
          raw_data?: Json
          user_response?: string | null
        }
        Update: {
          created_at?: string
          detection_source?: string
          detection_timestamp?: string
          emotion_type?: string
          id?: string
          intensity_level?: number
          intervention_triggered?: boolean | null
          intervention_type?: string | null
          profile_id?: string
          raw_data?: Json
          user_response?: string | null
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
      expert_comments: {
        Row: {
          comment_text: string
          created_at: string
          created_via_share: boolean
          expert_id: string
          id: string
          is_private: boolean
          share_id: string | null
          timeline_activity_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          created_via_share?: boolean
          expert_id: string
          id?: string
          is_private?: boolean
          share_id?: string | null
          timeline_activity_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          created_via_share?: boolean
          expert_id?: string
          id?: string
          is_private?: boolean
          share_id?: string | null
          timeline_activity_id?: string
        }
        Relationships: []
      }
      expert_notes: {
        Row: {
          author_id: string
          created_at: string
          id: string
          is_visible_to_family: boolean | null
          observation_id: string
          text: string
          updated_at: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          is_visible_to_family?: boolean | null
          observation_id: string
          text: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          is_visible_to_family?: boolean | null
          observation_id?: string
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      experts: {
        Row: {
          availability_text: string
          calendly_url: string
          categories: string[]
          contact_form_url: string
          created_at: string
          credential: string
          id: string
          intro: string
          name: string
          online: boolean
          photo_url: string | null
          price_per_50: number
          rating: number
          region: string
          updated_at: string
          verified: boolean
          visible: boolean
        }
        Insert: {
          availability_text: string
          calendly_url: string
          categories?: string[]
          contact_form_url: string
          created_at?: string
          credential: string
          id?: string
          intro: string
          name: string
          online?: boolean
          photo_url?: string | null
          price_per_50: number
          rating?: number
          region: string
          updated_at?: string
          verified?: boolean
          visible?: boolean
        }
        Update: {
          availability_text?: string
          calendly_url?: string
          categories?: string[]
          contact_form_url?: string
          created_at?: string
          credential?: string
          id?: string
          intro?: string
          name?: string
          online?: boolean
          photo_url?: string | null
          price_per_50?: number
          rating?: number
          region?: string
          updated_at?: string
          verified?: boolean
          visible?: boolean
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
      lifestyle_coaching_data: {
        Row: {
          adherence_score: number | null
          ai_recommendations: Json | null
          created_at: string
          exercise_data: Json | null
          hormonal_factors: Json | null
          id: string
          mental_health_correlation: Json | null
          nutrition_data: Json | null
          profile_id: string
          seasonal_factors: Json | null
          sleep_data: Json | null
          tracking_date: string
        }
        Insert: {
          adherence_score?: number | null
          ai_recommendations?: Json | null
          created_at?: string
          exercise_data?: Json | null
          hormonal_factors?: Json | null
          id?: string
          mental_health_correlation?: Json | null
          nutrition_data?: Json | null
          profile_id: string
          seasonal_factors?: Json | null
          sleep_data?: Json | null
          tracking_date: string
        }
        Update: {
          adherence_score?: number | null
          ai_recommendations?: Json | null
          created_at?: string
          exercise_data?: Json | null
          hormonal_factors?: Json | null
          id?: string
          mental_health_correlation?: Json | null
          nutrition_data?: Json | null
          profile_id?: string
          seasonal_factors?: Json | null
          sleep_data?: Json | null
          tracking_date?: string
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
      metaverse_session_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          expires_at: string
          id: string
          invitation_code: string
          invitee_email: string | null
          invitee_profile_id: string | null
          inviter_profile_id: string
          message: string | null
          session_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invitation_code?: string
          invitee_email?: string | null
          invitee_profile_id?: string | null
          inviter_profile_id: string
          message?: string | null
          session_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invitation_code?: string
          invitee_email?: string | null
          invitee_profile_id?: string | null
          inviter_profile_id?: string
          message?: string | null
          session_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "metaverse_session_invitations_invitee_profile_id_fkey"
            columns: ["invitee_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metaverse_session_invitations_inviter_profile_id_fkey"
            columns: ["inviter_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metaverse_session_invitations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "metaverse_sessions"
            referencedColumns: ["id"]
          },
        ]
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
      observation_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          expert_user_id: string
          id: string
          observation_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          expert_user_id: string
          id?: string
          observation_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          expert_user_id?: string
          id?: string
          observation_id?: string
        }
        Relationships: []
      }
      observation_reports: {
        Row: {
          content: Json
          created_by: string
          generated_at: string
          id: string
          pdf_url: string | null
          report_type: string
          session_id: string | null
          title: string
        }
        Insert: {
          content?: Json
          created_by: string
          generated_at?: string
          id?: string
          pdf_url?: string | null
          report_type: string
          session_id?: string | null
          title: string
        }
        Update: {
          content?: Json
          created_by?: string
          generated_at?: string
          id?: string
          pdf_url?: string | null
          report_type?: string
          session_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "observation_reports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "observation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      observation_sessions: {
        Row: {
          ai_analysis: string | null
          analysis_data: Json | null
          created_at: string
          domain: string
          id: string
          media_files: Json | null
          observation_period_end: string
          observation_period_start: string
          observer_name: string
          profile_id: string
          raw_data: Json
          recommendations: Json | null
          session_name: string
          status: string | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          ai_analysis?: string | null
          analysis_data?: Json | null
          created_at?: string
          domain: string
          id?: string
          media_files?: Json | null
          observation_period_end: string
          observation_period_start: string
          observer_name: string
          profile_id: string
          raw_data?: Json
          recommendations?: Json | null
          session_name: string
          status?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          ai_analysis?: string | null
          analysis_data?: Json | null
          created_at?: string
          domain?: string
          id?: string
          media_files?: Json | null
          observation_period_end?: string
          observation_period_start?: string
          observer_name?: string
          profile_id?: string
          raw_data?: Json
          recommendations?: Json | null
          session_name?: string
          status?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "observation_sessions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "observation_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      observation_templates: {
        Row: {
          created_at: string
          description: string | null
          domain: string
          id: string
          is_active: boolean | null
          items: Json
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          items?: Json
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          items?: Json
          name?: string
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
      payment_history: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string
          payment_key: string | null
          payment_method: string | null
          status: string
          subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id: string
          payment_key?: string | null
          payment_method?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          payment_key?: string | null
          payment_method?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
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
      premium_assessment_results: {
        Row: {
          ai_analysis: string | null
          assessment_info: Json
          assessment_type: string
          created_at: string
          id: string
          results: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          assessment_info: Json
          assessment_type: string
          created_at?: string
          id?: string
          results: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          assessment_info?: Json
          assessment_type?: string
          created_at?: string
          id?: string
          results?: Json
          updated_at?: string
          user_id?: string
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
          subscription_tier: string | null
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
          subscription_tier?: string | null
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
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      relationship_analysis: {
        Row: {
          communication_patterns: Json
          conflict_triggers: Json
          created_at: string
          id: string
          improvement_suggestions: Json
          last_interaction_analysis: string | null
          positive_interactions: Json
          profile_id: string
          relationship_id: string | null
          relationship_type: string
          satisfaction_score: number | null
          updated_at: string
        }
        Insert: {
          communication_patterns?: Json
          conflict_triggers?: Json
          created_at?: string
          id?: string
          improvement_suggestions?: Json
          last_interaction_analysis?: string | null
          positive_interactions?: Json
          profile_id: string
          relationship_id?: string | null
          relationship_type: string
          satisfaction_score?: number | null
          updated_at?: string
        }
        Update: {
          communication_patterns?: Json
          conflict_triggers?: Json
          created_at?: string
          id?: string
          improvement_suggestions?: Json
          last_interaction_analysis?: string | null
          positive_interactions?: Json
          profile_id?: string
          relationship_id?: string | null
          relationship_type?: string
          satisfaction_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      role_change_audit: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          new_role: Database["public"]["Enums"]["app_role"]
          old_role: Database["public"]["Enums"]["app_role"] | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: string
          new_role: Database["public"]["Enums"]["app_role"]
          old_role?: Database["public"]["Enums"]["app_role"] | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          new_role?: Database["public"]["Enums"]["app_role"]
          old_role?: Database["public"]["Enums"]["app_role"] | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          created_at: string
          id: string
          setting_name: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_name: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_name?: string
          setting_value?: Json
          updated_at?: string
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
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          expert_consultation: boolean | null
          features: Json
          id: string
          max_reports: number | null
          name: string
          price: number
          priority_support: boolean | null
          yearly_price: number | null
        }
        Insert: {
          created_at?: string
          expert_consultation?: boolean | null
          features?: Json
          id?: string
          max_reports?: number | null
          name: string
          price: number
          priority_support?: boolean | null
          yearly_price?: number | null
        }
        Update: {
          created_at?: string
          expert_consultation?: boolean | null
          features?: Json
          id?: string
          max_reports?: number | null
          name?: string
          price?: number
          priority_support?: boolean | null
          yearly_price?: number | null
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
      test_results: {
        Row: {
          ai_analysis: string | null
          completed_at: string
          created_at: string
          expert_feedback: string | null
          id: string
          pdf_url: string | null
          raw_data: Json | null
          scores: Json
          test_type_id: string
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          completed_at?: string
          created_at?: string
          expert_feedback?: string | null
          id?: string
          pdf_url?: string | null
          raw_data?: Json | null
          scores: Json
          test_type_id: string
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          completed_at?: string
          created_at?: string
          expert_feedback?: string | null
          id?: string
          pdf_url?: string | null
          raw_data?: Json | null
          scores?: Json
          test_type_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_test_type_id_fkey"
            columns: ["test_type_id"]
            isOneToOne: false
            referencedRelation: "test_types"
            referencedColumns: ["id"]
          },
        ]
      }
      test_types: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          typebot_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          typebot_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          typebot_url?: string
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
      timeline_activities: {
        Row: {
          actor: Json
          created_at: string
          family_id: string
          files: Json | null
          id: string
          member_id: string | null
          meta: Json | null
          score_overall: number | null
          summary: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          actor?: Json
          created_at?: string
          family_id: string
          files?: Json | null
          id?: string
          member_id?: string | null
          meta?: Json | null
          score_overall?: number | null
          summary?: string | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          actor?: Json
          created_at?: string
          family_id?: string
          files?: Json | null
          id?: string
          member_id?: string | null
          meta?: Json | null
          score_overall?: number | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      timeline_shares: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          family_id: string
          id: string
          is_active: boolean
          member_id: string | null
          permission: string
          pin_code: string
          share_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at: string
          family_id: string
          id?: string
          is_active?: boolean
          member_id?: string | null
          permission: string
          pin_code: string
          share_id?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          family_id?: string
          id?: string
          is_active?: boolean
          member_id?: string | null
          permission?: string
          pin_code?: string
          share_id?: string
        }
        Relationships: []
      }
      token_purchases: {
        Row: {
          amount_paid: number
          created_at: string
          id: string
          payment_method: string | null
          plan_id: string | null
          status: string
          tokens_purchased: number
          toss_order_id: string | null
          user_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          status?: string
          tokens_purchased: number
          toss_order_id?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          status?: string
          tokens_purchased?: number
          toss_order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_purchases_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "token_subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      token_subscription_plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean | null
          name: string
          popular: boolean | null
          price: number
          tokens_included: number
          updated_at: string
          yearly_price: number
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean | null
          name: string
          popular?: boolean | null
          price: number
          tokens_included: number
          updated_at?: string
          yearly_price: number
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          popular?: boolean | null
          price?: number
          tokens_included?: number
          updated_at?: string
          yearly_price?: number
        }
        Relationships: []
      }
      token_usage_history: {
        Row: {
          created_at: string
          feature_id: string | null
          feature_type: string
          id: string
          tokens_used: number
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_id?: string | null
          feature_type: string
          id?: string
          tokens_used: number
          user_id: string
        }
        Update: {
          created_at?: string
          feature_id?: string | null
          feature_type?: string
          id?: string
          tokens_used?: number
          user_id?: string
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
      user_referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_profile_id: string
          referrer_profile_id: string
          reward_given: boolean
          reward_tokens: number
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_profile_id: string
          referrer_profile_id: string
          reward_given?: boolean
          reward_tokens?: number
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_profile_id?: string
          referrer_profile_id?: string
          reward_given?: boolean
          reward_tokens?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_referrals_referred_profile_id_fkey"
            columns: ["referred_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_referrals_referrer_profile_id_fkey"
            columns: ["referrer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscription_usage: {
        Row: {
          created_at: string | null
          id: string
          subscription_status: string | null
          trial_used: boolean | null
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          subscription_status?: string | null
          trial_used?: boolean | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          subscription_status?: string | null
          trial_used?: boolean | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          payment_method: string | null
          plan_id: string | null
          status: string
          subscription_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          status?: string
          subscription_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          status?: string
          subscription_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tokens: {
        Row: {
          created_at: string
          current_tokens: number
          id: string
          last_used_at: string | null
          total_purchased: number | null
          total_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_tokens?: number
          id?: string
          last_used_at?: string | null
          total_purchased?: number | null
          total_used?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_tokens?: number
          id?: string
          last_used_at?: string | null
          total_purchased?: number | null
          total_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_metaverse_session: {
        Args: { session_id: string }
        Returns: boolean
      }
      check_login_attempts: {
        Args: { user_email: string }
        Returns: boolean
      }
      consume_tokens: {
        Args: {
          p_feature_id?: string
          p_feature_type: string
          p_tokens_needed: number
          p_user_id: string
        }
        Returns: Json
      }
      generate_referral_code: {
        Args: { p_referrer_user_id: string }
        Returns: string
      }
      get_user_employee_org: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_family_ids: {
        Args: { user_uuid: string }
        Returns: string[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_family_creator: {
        Args: { family_uuid: string; user_uuid: string }
        Returns: boolean
      }
      is_organization_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_auth_attempt: {
        Args: {
          p_attempt_type?: string
          p_email?: string
          p_ip_address?: string
          p_success?: boolean
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: undefined
      }
      process_referral_reward: {
        Args: { p_referral_code: string; p_referred_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "expert" | "viewer"
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
    Enums: {
      app_role: ["admin", "expert", "viewer"],
    },
  },
} as const
