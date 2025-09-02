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
      admin_analytics: {
        Row: {
          active_subscribers: number | null
          id: string
          last_updated: string | null
          total_observations: number | null
          total_revenue: number | null
          total_subscribers: number | null
          total_tests: number | null
          total_users: number | null
          users_with_observations: number | null
          users_with_tests: number | null
        }
        Insert: {
          active_subscribers?: number | null
          id?: string
          last_updated?: string | null
          total_observations?: number | null
          total_revenue?: number | null
          total_subscribers?: number | null
          total_tests?: number | null
          total_users?: number | null
          users_with_observations?: number | null
          users_with_tests?: number | null
        }
        Update: {
          active_subscribers?: number | null
          id?: string
          last_updated?: string | null
          total_observations?: number | null
          total_revenue?: number | null
          total_subscribers?: number | null
          total_tests?: number | null
          total_users?: number | null
          users_with_observations?: number | null
          users_with_tests?: number | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          notification_type: string
          priority: string
          related_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          notification_type: string
          priority?: string
          related_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          priority?: string
          related_id?: string | null
          title?: string
        }
        Relationships: []
      }
      assessment_enhanced_analysis: {
        Row: {
          assessment_type: string
          created_at: string
          enhanced_analysis: string
          id: string
          raw_results: Json
          recommendations: string[] | null
          risk_level: string | null
          score_interpretation: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assessment_type: string
          created_at?: string
          enhanced_analysis: string
          id?: string
          raw_results: Json
          recommendations?: string[] | null
          risk_level?: string | null
          score_interpretation: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assessment_type?: string
          created_at?: string
          enhanced_analysis?: string
          id?: string
          raw_results?: Json
          recommendations?: string[] | null
          risk_level?: string | null
          score_interpretation?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      assessments: {
        Row: {
          age_at_assessment: number | null
          age_group: string
          analysis: string | null
          created_at: string
          family_id: string | null
          id: string
          profile_id: string
          recommendations: string[] | null
          results: Json | null
          risk_level: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age_at_assessment?: number | null
          age_group: string
          analysis?: string | null
          created_at?: string
          family_id?: string | null
          id?: string
          profile_id: string
          recommendations?: string[] | null
          results?: Json | null
          risk_level?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age_at_assessment?: number | null
          age_group?: string
          analysis?: string | null
          created_at?: string
          family_id?: string | null
          id?: string
          profile_id?: string
          recommendations?: string[] | null
          results?: Json | null
          risk_level?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transfer_requests: {
        Row: {
          admin_note: string | null
          bank_name: string | null
          created_at: string
          depositor_name: string
          id: string
          processed_at: string | null
          processed_by: string | null
          request_note: string | null
          requested_tokens: number
          status: string
          transfer_amount: number
          transfer_date: string | null
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          bank_name?: string | null
          created_at?: string
          depositor_name: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          request_note?: string | null
          requested_tokens: number
          status?: string
          transfer_amount: number
          transfer_date?: string | null
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          bank_name?: string | null
          created_at?: string
          depositor_name?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          request_note?: string | null
          requested_tokens?: number
          status?: string
          transfer_amount?: number
          transfer_date?: string | null
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string | null
          room_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string | null
          room_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string | null
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
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_results?: Json | null
          created_at?: string
          expert_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_results?: Json | null
          created_at?: string
          expert_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          chat_room_id: string | null
          consultation_type: string
          created_at: string | null
          duration_minutes: number | null
          expert_id: string
          id: string
          notes: string | null
          payment_method: string | null
          price: number
          rating: number | null
          review: string | null
          scheduled_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chat_room_id?: string | null
          consultation_type?: string
          created_at?: string | null
          duration_minutes?: number | null
          expert_id: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          price: number
          rating?: number | null
          review?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chat_room_id?: string | null
          consultation_type?: string
          created_at?: string | null
          duration_minutes?: number | null
          expert_id?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          price?: number
          rating?: number | null
          review?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_stats_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      developmental_ml_analysis: {
        Row: {
          analysis_results: Json
          confidence_score: number
          created_at: string
          id: string
          raw_data_summary: Json
          student_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_results: Json
          confidence_score?: number
          created_at?: string
          id?: string
          raw_data_summary: Json
          student_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_results?: Json
          confidence_score?: number
          created_at?: string
          id?: string
          raw_data_summary?: Json
          student_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      developmental_screening_results: {
        Row: {
          age_group: string
          ai_analysis: Json | null
          confidence_score: number | null
          created_at: string
          id: string
          raw_scores: number[]
          risk_level: string | null
          test_type: string
          total_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          age_group: string
          ai_analysis?: Json | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          raw_scores: number[]
          risk_level?: string | null
          test_type?: string
          total_score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          age_group?: string
          ai_analysis?: Json | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          raw_scores?: number[]
          risk_level?: string | null
          test_type?: string
          total_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      developmental_tracking: {
        Row: {
          assessor_notes: string | null
          created_at: string
          current_level: number
          domain: string
          evidence_files: Json | null
          id: string
          notes: string | null
          skill_area: string
          student_id: string | null
          target_level: number | null
          tracking_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assessor_notes?: string | null
          created_at?: string
          current_level: number
          domain: string
          evidence_files?: Json | null
          id?: string
          notes?: string | null
          skill_area: string
          student_id?: string | null
          target_level?: number | null
          tracking_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assessor_notes?: string | null
          created_at?: string
          current_level?: number
          domain?: string
          evidence_files?: Json | null
          id?: string
          notes?: string | null
          skill_area?: string
          student_id?: string | null
          target_level?: number | null
          tracking_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expert_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          expert_id: string
          id: string
          is_active: boolean | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          expert_id: string
          id?: string
          is_active?: boolean | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          expert_id?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_availability_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_stats_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_availability_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_contracts: {
        Row: {
          additional_services: Json | null
          contract_end_date: string
          contract_start_date: string
          contract_terms: Json | null
          contract_type: string
          created_at: string
          duration_months: number
          expert_id: string
          hourly_rate: number
          id: string
          notes: string | null
          payment_status: string | null
          sessions_per_week: number
          status: string
          stripe_subscription_id: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_services?: Json | null
          contract_end_date: string
          contract_start_date: string
          contract_terms?: Json | null
          contract_type?: string
          created_at?: string
          duration_months?: number
          expert_id: string
          hourly_rate: number
          id?: string
          notes?: string | null
          payment_status?: string | null
          sessions_per_week?: number
          status?: string
          stripe_subscription_id?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_services?: Json | null
          contract_end_date?: string
          contract_start_date?: string
          contract_terms?: Json | null
          contract_type?: string
          created_at?: string
          duration_months?: number
          expert_id?: string
          hourly_rate?: number
          id?: string
          notes?: string | null
          payment_status?: string | null
          sessions_per_week?: number
          status?: string
          stripe_subscription_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expert_earnings: {
        Row: {
          amount: number
          commission_rate: number | null
          consultation_id: string
          created_at: string | null
          expert_earning: number
          expert_id: string
          id: string
          paid_at: string | null
          platform_fee: number
          status: string | null
        }
        Insert: {
          amount: number
          commission_rate?: number | null
          consultation_id: string
          created_at?: string | null
          expert_earning: number
          expert_id: string
          id?: string
          paid_at?: string | null
          platform_fee: number
          status?: string | null
        }
        Update: {
          amount?: number
          commission_rate?: number | null
          consultation_id?: string
          created_at?: string | null
          expert_earning?: number
          expert_id?: string
          id?: string
          paid_at?: string | null
          platform_fee?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_earnings_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_earnings_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_stats_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_earnings_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_feedback_requests: {
        Row: {
          admin_notes: string | null
          assigned_at: string | null
          completed_at: string | null
          created_at: string
          expert_id: string | null
          expert_report: string | null
          id: string
          observation_id: string | null
          priority_level: string
          request_note: string | null
          request_status: string
          requested_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string
          expert_id?: string | null
          expert_report?: string | null
          id?: string
          observation_id?: string | null
          priority_level?: string
          request_note?: string | null
          request_status?: string
          requested_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string
          expert_id?: string | null
          expert_report?: string | null
          id?: string
          observation_id?: string | null
          priority_level?: string
          request_note?: string | null
          request_status?: string
          requested_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_feedback_requests_observation_id_fkey"
            columns: ["observation_id"]
            isOneToOne: false
            referencedRelation: "observation_logs"
            referencedColumns: ["id"]
          },
        ]
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
          average_rating: number | null
          bio: string | null
          certifications: string[] | null
          consultation_methods: string[] | null
          created_at: string | null
          education_background: string[] | null
          full_name: string
          hourly_rate: number
          id: string
          is_available: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          license_number: string | null
          professional_title: string
          profile_image_url: string | null
          specializations: string[]
          total_sessions: number | null
          updated_at: string | null
          user_id: string
          years_experience: number
        }
        Insert: {
          average_rating?: number | null
          bio?: string | null
          certifications?: string[] | null
          consultation_methods?: string[] | null
          created_at?: string | null
          education_background?: string[] | null
          full_name: string
          hourly_rate?: number
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          license_number?: string | null
          professional_title: string
          profile_image_url?: string | null
          specializations?: string[]
          total_sessions?: number | null
          updated_at?: string | null
          user_id: string
          years_experience?: number
        }
        Update: {
          average_rating?: number | null
          bio?: string | null
          certifications?: string[] | null
          consultation_methods?: string[] | null
          created_at?: string | null
          education_background?: string[] | null
          full_name?: string
          hourly_rate?: number
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          license_number?: string | null
          professional_title?: string
          profile_image_url?: string | null
          specializations?: string[]
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string
          years_experience?: number
        }
        Relationships: []
      }
      family_members: {
        Row: {
          age: number | null
          birth_date: string | null
          created_at: string
          email: string | null
          family_id: string | null
          gender: string | null
          id: string
          is_primary_caregiver: boolean | null
          name: string
          notes: string | null
          phone: string | null
          relationship: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          family_id?: string | null
          gender?: string | null
          id?: string
          is_primary_caregiver?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          relationship?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          family_id?: string | null
          gender?: string | null
          id?: string
          is_primary_caregiver?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          relationship?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      individual_education_plans: {
        Row: {
          annual_goals: Json
          assessment_modifications: Json
          assessment_results: Json
          created_at: string
          current_performance: Json
          id: string
          plan_status: string
          related_services: Json
          short_term_objectives: Json
          special_education_services: Json
          student_age: number
          student_name: string
          supplementary_aids: Json
          transition_services: Json | null
          updated_at: string
          user_id: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          annual_goals?: Json
          assessment_modifications?: Json
          assessment_results?: Json
          created_at?: string
          current_performance?: Json
          id?: string
          plan_status?: string
          related_services?: Json
          short_term_objectives?: Json
          special_education_services?: Json
          student_age: number
          student_name: string
          supplementary_aids?: Json
          transition_services?: Json | null
          updated_at?: string
          user_id: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          annual_goals?: Json
          assessment_modifications?: Json
          assessment_results?: Json
          created_at?: string
          current_performance?: Json
          id?: string
          plan_status?: string
          related_services?: Json
          short_term_objectives?: Json
          special_education_services?: Json
          student_age?: number
          student_name?: string
          supplementary_aids?: Json
          transition_services?: Json | null
          updated_at?: string
          user_id?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      institution_analytics: {
        Row: {
          average_session_duration: number | null
          created_at: string
          id: string
          institution_id: string
          month_year: string
          new_clients: number | null
          popular_services: Json | null
          retention_rate: number | null
          total_consultations: number | null
          total_revenue: number | null
        }
        Insert: {
          average_session_duration?: number | null
          created_at?: string
          id?: string
          institution_id: string
          month_year: string
          new_clients?: number | null
          popular_services?: Json | null
          retention_rate?: number | null
          total_consultations?: number | null
          total_revenue?: number | null
        }
        Update: {
          average_session_duration?: number | null
          created_at?: string
          id?: string
          institution_id?: string
          month_year?: string
          new_clients?: number | null
          popular_services?: Json | null
          retention_rate?: number | null
          total_consultations?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_analytics_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "partner_institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_analytics_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "public_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_experts: {
        Row: {
          available_days: string[] | null
          available_hours: string | null
          created_at: string
          employment_type: string | null
          expert_id: string
          hourly_rate: number | null
          id: string
          institution_id: string
          is_primary_contact: boolean | null
          position: string | null
          specializations: string[] | null
          updated_at: string
          years_at_institution: number | null
        }
        Insert: {
          available_days?: string[] | null
          available_hours?: string | null
          created_at?: string
          employment_type?: string | null
          expert_id: string
          hourly_rate?: number | null
          id?: string
          institution_id: string
          is_primary_contact?: boolean | null
          position?: string | null
          specializations?: string[] | null
          updated_at?: string
          years_at_institution?: number | null
        }
        Update: {
          available_days?: string[] | null
          available_hours?: string | null
          created_at?: string
          employment_type?: string | null
          expert_id?: string
          hourly_rate?: number | null
          id?: string
          institution_id?: string
          is_primary_contact?: boolean | null
          position?: string | null
          specializations?: string[] | null
          updated_at?: string
          years_at_institution?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_experts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "partner_institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_experts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "public_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_members: {
        Row: {
          birth_date: string | null
          created_at: string
          custom_fields: Json | null
          enrollment_date: string
          id: string
          institution_admin_id: string
          member_email: string | null
          member_name: string
          member_phone: string | null
          member_user_id: string | null
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          custom_fields?: Json | null
          enrollment_date?: string
          id?: string
          institution_admin_id: string
          member_email?: string | null
          member_name: string
          member_phone?: string | null
          member_user_id?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          custom_fields?: Json | null
          enrollment_date?: string
          id?: string
          institution_admin_id?: string
          member_email?: string | null
          member_name?: string
          member_phone?: string | null
          member_user_id?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      institution_premium_analytics: {
        Row: {
          consultation_bookings: number | null
          contact_requests: number | null
          conversion_rate: number | null
          created_at: string
          date: string
          id: string
          institution_id: string
          page_views: number | null
          profile_clicks: number | null
          search_appearances: number | null
          search_rankings: Json | null
        }
        Insert: {
          consultation_bookings?: number | null
          contact_requests?: number | null
          conversion_rate?: number | null
          created_at?: string
          date?: string
          id?: string
          institution_id: string
          page_views?: number | null
          profile_clicks?: number | null
          search_appearances?: number | null
          search_rankings?: Json | null
        }
        Update: {
          consultation_bookings?: number | null
          contact_requests?: number | null
          conversion_rate?: number | null
          created_at?: string
          date?: string
          id?: string
          institution_id?: string
          page_views?: number | null
          profile_clicks?: number | null
          search_appearances?: number | null
          search_rankings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_premium_analytics_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "partner_institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_premium_analytics_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "public_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_premium_features: {
        Row: {
          created_at: string
          feature_type: string
          id: string
          institution_id: string
          is_enabled: boolean
          settings: Json | null
          updated_at: string
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          created_at?: string
          feature_type: string
          id?: string
          institution_id: string
          is_enabled?: boolean
          settings?: Json | null
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          created_at?: string
          feature_type?: string
          id?: string
          institution_id?: string
          is_enabled?: boolean
          settings?: Json | null
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_premium_features_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "partner_institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_premium_features_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "public_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_premium_plans: {
        Row: {
          auto_renew: boolean
          created_at: string
          expires_at: string | null
          features: Json
          id: string
          institution_id: string
          is_active: boolean
          monthly_price: number
          payment_status: string
          plan_name: string
          plan_type: string
          started_at: string
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string
          expires_at?: string | null
          features?: Json
          id?: string
          institution_id: string
          is_active?: boolean
          monthly_price?: number
          payment_status?: string
          plan_name: string
          plan_type: string
          started_at?: string
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string
          expires_at?: string | null
          features?: Json
          id?: string
          institution_id?: string
          is_active?: boolean
          monthly_price?: number
          payment_status?: string
          plan_name?: string
          plan_type?: string
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_premium_plans_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "partner_institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_premium_plans_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "public_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_reviews: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          rating: number
          review_text: string | null
          service_type: string | null
          updated_at: string
          user_id: string
          visit_date: string | null
          would_recommend: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          rating: number
          review_text?: string | null
          service_type?: string | null
          updated_at?: string
          user_id: string
          visit_date?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          rating?: number
          review_text?: string | null
          service_type?: string | null
          updated_at?: string
          user_id?: string
          visit_date?: string | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_reviews_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "partner_institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_reviews_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "public_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          address: string | null
          admin_id: string
          created_at: string
          description: string | null
          director_name: string | null
          email: string | null
          established_date: string | null
          id: string
          institution_name: string
          institution_type: string
          license_number: string | null
          logo_url: string | null
          phone: string | null
          settings: Json | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          admin_id: string
          created_at?: string
          description?: string | null
          director_name?: string | null
          email?: string | null
          established_date?: string | null
          id?: string
          institution_name: string
          institution_type: string
          license_number?: string | null
          logo_url?: string | null
          phone?: string | null
          settings?: Json | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          admin_id?: string
          created_at?: string
          description?: string | null
          director_name?: string | null
          email?: string | null
          established_date?: string | null
          id?: string
          institution_name?: string
          institution_type?: string
          license_number?: string | null
          logo_url?: string | null
          phone?: string | null
          settings?: Json | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      intervention_plans: {
        Row: {
          created_at: string
          id: string
          ml_analysis_id: string | null
          plan_data: Json
          status: string
          student_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ml_analysis_id?: string | null
          plan_data: Json
          status?: string
          student_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ml_analysis_id?: string | null
          plan_data?: Json
          status?: string
          student_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intervention_plans_ml_analysis_id_fkey"
            columns: ["ml_analysis_id"]
            isOneToOne: false
            referencedRelation: "developmental_ml_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      observation_domains: {
        Row: {
          color_class: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          color_class?: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          color_class?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      observation_logs: {
        Row: {
          behavior_type: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          family_member_id: string | null
          id: string
          is_crisis: boolean | null
          location: string | null
          media_files: Json | null
          session_name: string | null
          severity: number | null
          tags: string[] | null
          title: string
          triggers: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          behavior_type?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          family_member_id?: string | null
          id?: string
          is_crisis?: boolean | null
          location?: string | null
          media_files?: Json | null
          session_name?: string | null
          severity?: number | null
          tags?: string[] | null
          title: string
          triggers?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          behavior_type?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          family_member_id?: string | null
          id?: string
          is_crisis?: boolean | null
          location?: string | null
          media_files?: Json | null
          session_name?: string | null
          severity?: number | null
          tags?: string[] | null
          title?: string
          triggers?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "observation_logs_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      observation_sessions: {
        Row: {
          created_at: string
          duration_minutes: number | null
          family_member_id: string | null
          id: string
          observations: Json | null
          session_type: string
          status: string | null
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          family_member_id?: string | null
          id?: string
          observations?: Json | null
          session_type: string
          status?: string | null
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          family_member_id?: string | null
          id?: string
          observations?: Json | null
          session_type?: string
          status?: string | null
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "observation_sessions_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      observation_templates: {
        Row: {
          cost: string
          created_at: string
          description: string
          duration: string
          features: Json
          id: string
          is_active: boolean
          items: Json
          name: string
          sort_order: number
          suitable_for: string
          template_type: string
          updated_at: string
        }
        Insert: {
          cost: string
          created_at?: string
          description: string
          duration: string
          features?: Json
          id?: string
          is_active?: boolean
          items?: Json
          name: string
          sort_order?: number
          suitable_for: string
          template_type: string
          updated_at?: string
        }
        Update: {
          cost?: string
          created_at?: string
          description?: string
          duration?: string
          features?: Json
          id?: string
          is_active?: boolean
          items?: Json
          name?: string
          sort_order?: number
          suitable_for?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_institutions: {
        Row: {
          accessibility_features: string[] | null
          address: string
          business_license: string | null
          certification_info: Json | null
          commission_rate: number | null
          created_at: string
          description: string | null
          email: string | null
          established_year: number | null
          facilities: string[] | null
          gallery_images: string[] | null
          id: string
          institution_type: string
          is_voucher_approved: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          operating_hours: Json | null
          parking_available: boolean | null
          partnership_start_date: string | null
          partnership_status: string | null
          phone: string | null
          profile_image_url: string | null
          rating: number | null
          review_count: number | null
          services_offered: string[] | null
          specializations: string[] | null
          total_experts: number | null
          updated_at: string
          voucher_types: string[] | null
          website_url: string | null
        }
        Insert: {
          accessibility_features?: string[] | null
          address: string
          business_license?: string | null
          certification_info?: Json | null
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          established_year?: number | null
          facilities?: string[] | null
          gallery_images?: string[] | null
          id?: string
          institution_type: string
          is_voucher_approved?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          operating_hours?: Json | null
          parking_available?: boolean | null
          partnership_start_date?: string | null
          partnership_status?: string | null
          phone?: string | null
          profile_image_url?: string | null
          rating?: number | null
          review_count?: number | null
          services_offered?: string[] | null
          specializations?: string[] | null
          total_experts?: number | null
          updated_at?: string
          voucher_types?: string[] | null
          website_url?: string | null
        }
        Update: {
          accessibility_features?: string[] | null
          address?: string
          business_license?: string | null
          certification_info?: Json | null
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          established_year?: number | null
          facilities?: string[] | null
          gallery_images?: string[] | null
          id?: string
          institution_type?: string
          is_voucher_approved?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          operating_hours?: Json | null
          parking_available?: boolean | null
          partnership_start_date?: string | null
          partnership_status?: string | null
          phone?: string | null
          profile_image_url?: string | null
          rating?: number | null
          review_count?: number | null
          services_offered?: string[] | null
          specializations?: string[] | null
          total_experts?: number | null
          updated_at?: string
          voucher_types?: string[] | null
          website_url?: string | null
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_key: string | null
          payment_method: string | null
          plan_id: string | null
          status: string
          subscription_id: string | null
          subscription_type: string | null
          toss_order_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_key?: string | null
          payment_method?: string | null
          plan_id?: string | null
          status?: string
          subscription_id?: string | null
          subscription_type?: string | null
          toss_order_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_key?: string | null
          payment_method?: string | null
          plan_id?: string | null
          status?: string
          subscription_id?: string | null
          subscription_type?: string | null
          toss_order_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      personalized_missions: {
        Row: {
          based_on_data: Json | null
          generated_at: string
          id: string
          is_active: boolean
          mission_content: Json
          mission_type: string
          priority_level: number
          user_id: string
        }
        Insert: {
          based_on_data?: Json | null
          generated_at?: string
          id?: string
          is_active?: boolean
          mission_content: Json
          mission_type?: string
          priority_level?: number
          user_id: string
        }
        Update: {
          based_on_data?: Json | null
          generated_at?: string
          id?: string
          is_active?: boolean
          mission_content?: Json
          mission_type?: string
          priority_level?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referee_id: string | null
          referral_code: string
          referrer_id: string
          status: string
          tokens_awarded: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referee_id?: string | null
          referral_code: string
          referrer_id: string
          status?: string
          tokens_awarded?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referee_id?: string | null
          referral_code?: string
          referrer_id?: string
          status?: string
          tokens_awarded?: number | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          subscribed: boolean | null
          subscription_end: string | null
          subscription_start: string | null
          subscription_tier: string | null
          total_paid: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: string | null
          total_paid?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: string | null
          total_paid?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          is_active: boolean
          name: string
          price: number
          type: string
          updated_at: string
          yearly_price: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean
          name: string
          price?: number
          type?: string
          updated_at?: string
          yearly_price?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          type?: string
          updated_at?: string
          yearly_price?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          payment_method: string | null
          plan_type: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_method?: string | null
          plan_type: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_method?: string | null
          plan_type?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          scores: Json | null
          test_type_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          scores?: Json | null
          test_type_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          scores?: Json | null
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
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      therapists: {
        Row: {
          color_code: string
          created_at: string
          email: string | null
          id: string
          institution_id: string
          is_active: boolean
          name: string
          phone: string | null
          specialization: string
          updated_at: string
          working_hours: Json | null
        }
        Insert: {
          color_code?: string
          created_at?: string
          email?: string | null
          id?: string
          institution_id: string
          is_active?: boolean
          name: string
          phone?: string | null
          specialization: string
          updated_at?: string
          working_hours?: Json | null
        }
        Update: {
          color_code?: string
          created_at?: string
          email?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          specialization?: string
          updated_at?: string
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "therapists_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      therapy_appointments: {
        Row: {
          appointment_type: string
          client_name: string
          created_at: string
          end_time: string
          id: string
          institution_id: string
          member_id: string | null
          notes: string | null
          start_time: string
          status: string
          therapist_id: string
          updated_at: string
        }
        Insert: {
          appointment_type?: string
          client_name: string
          created_at?: string
          end_time: string
          id?: string
          institution_id: string
          member_id?: string | null
          notes?: string | null
          start_time: string
          status?: string
          therapist_id: string
          updated_at?: string
        }
        Update: {
          appointment_type?: string
          client_name?: string
          created_at?: string
          end_time?: string
          id?: string
          institution_id?: string
          member_id?: string | null
          notes?: string | null
          start_time?: string
          status?: string
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapy_appointments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapy_appointments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "institution_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapy_appointments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_activities: {
        Row: {
          actor: Json | null
          created_at: string
          family_id: string | null
          files: Json | null
          id: string
          member_id: string | null
          meta: Json | null
          summary: string | null
          tags: string[] | null
          title: string
          type: string
        }
        Insert: {
          actor?: Json | null
          created_at?: string
          family_id?: string | null
          files?: Json | null
          id?: string
          member_id?: string | null
          meta?: Json | null
          summary?: string | null
          tags?: string[] | null
          title: string
          type: string
        }
        Update: {
          actor?: Json | null
          created_at?: string
          family_id?: string | null
          files?: Json | null
          id?: string
          member_id?: string | null
          meta?: Json | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_activities_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_activities_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      token_orders: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string
          package_id: string
          payment_key: string | null
          status: string
          tokens_purchased: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id: string
          package_id: string
          payment_key?: string | null
          status?: string
          tokens_purchased: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          package_id?: string
          payment_key?: string | null
          status?: string
          tokens_purchased?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "token_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      token_packages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price_krw: number
          token_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price_krw: number
          token_count: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price_krw?: number
          token_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      tokens: {
        Row: {
          created_at: string
          id: string
          token_count: number | null
          total_purchased: number | null
          total_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          token_count?: number | null
          total_purchased?: number | null
          total_used?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          token_count?: number | null
          total_purchased?: number | null
          total_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          count: number | null
          created_at: string
          feature_type: string
          id: string
          usage_date: string
          user_id: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string
          feature_type: string
          id?: string
          usage_date?: string
          user_id?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string
          feature_type?: string
          id?: string
          usage_date?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          created_at: string
          emoji: string | null
          id: string
          is_public: boolean | null
          message: string
          rating: number
          test_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string | null
          id?: string
          is_public?: boolean | null
          message: string
          rating: number
          test_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string | null
          id?: string
          is_public?: boolean | null
          message?: string
          rating?: number
          test_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_mission_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          mission_id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          mission_id: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          mission_id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mission_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "weekly_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          assessment_history: Json | null
          created_at: string
          health_goals: string[] | null
          id: string
          lifestyle_preferences: Json | null
          primary_concerns: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_history?: Json | null
          created_at?: string
          health_goals?: string[] | null
          id?: string
          lifestyle_preferences?: Json | null
          primary_concerns?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_history?: Json | null
          created_at?: string
          health_goals?: string[] | null
          id?: string
          lifestyle_preferences?: Json | null
          primary_concerns?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          payment_method: string | null
          plan_id: string | null
          status: string
          subscription_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          status?: string
          subscription_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          status?: string
          subscription_type?: string | null
          updated_at?: string
          user_id?: string
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
          last_daily_bonus_date: string | null
          referral_bonus: number | null
          total_purchased: number
          total_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_tokens?: number
          id?: string
          last_daily_bonus_date?: string | null
          referral_bonus?: number | null
          total_purchased?: number
          total_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_tokens?: number
          id?: string
          last_daily_bonus_date?: string | null
          referral_bonus?: number | null
          total_purchased?: number
          total_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_missions: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty: string
          id: string
          is_active: boolean
          points: number
          title: string
          updated_at: string
          week_start_date: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          difficulty?: string
          id?: string
          is_active?: boolean
          points?: number
          title: string
          updated_at?: string
          week_start_date: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          id?: string
          is_active?: boolean
          points?: number
          title?: string
          updated_at?: string
          week_start_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_overview_view: {
        Row: {
          total_observations: number | null
          total_tests: number | null
          total_tokens_in_circulation: number | null
          total_users: number | null
        }
        Relationships: []
      }
      expert_stats_view: {
        Row: {
          average_rating: number | null
          consultation_count: number | null
          full_name: string | null
          id: string | null
          specializations: string[] | null
          total_sessions: number | null
        }
        Relationships: []
      }
      public_institutions: {
        Row: {
          accessibility_features: string[] | null
          address: string | null
          created_at: string | null
          description: string | null
          established_year: number | null
          facilities: string[] | null
          gallery_images: string[] | null
          id: string | null
          institution_type: string | null
          latitude: number | null
          longitude: number | null
          name: string | null
          operating_hours: Json | null
          parking_available: boolean | null
          partnership_status: string | null
          profile_image_url: string | null
          rating: number | null
          review_count: number | null
          services_offered: string[] | null
          specializations: string[] | null
          total_experts: number | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          accessibility_features?: string[] | null
          address?: string | null
          created_at?: string | null
          description?: string | null
          established_year?: number | null
          facilities?: string[] | null
          gallery_images?: string[] | null
          id?: string | null
          institution_type?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          operating_hours?: Json | null
          parking_available?: boolean | null
          partnership_status?: string | null
          profile_image_url?: string | null
          rating?: number | null
          review_count?: number | null
          services_offered?: string[] | null
          specializations?: string[] | null
          total_experts?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          accessibility_features?: string[] | null
          address?: string | null
          created_at?: string | null
          description?: string | null
          established_year?: number | null
          facilities?: string[] | null
          gallery_images?: string[] | null
          id?: string | null
          institution_type?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          operating_hours?: Json | null
          parking_available?: boolean | null
          partnership_status?: string | null
          profile_image_url?: string | null
          rating?: number | null
          review_count?: number | null
          services_offered?: string[] | null
          specializations?: string[] | null
          total_experts?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      token_usage_view: {
        Row: {
          current_tokens: number | null
          monthly_usage: number | null
          referral_bonus: number | null
          total_purchased: number | null
          user_id: string | null
        }
        Relationships: []
      }
      user_dashboard_view: {
        Row: {
          current_tokens: number | null
          display_name: string | null
          observation_count: number | null
          test_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_daily_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      admin_add_tokens: {
        Args: { target_user_id: string; token_amount: number }
        Returns: boolean
      }
      apply_referral_code: {
        Args: { p_referral_code: string; p_user_id: string }
        Returns: boolean
      }
      can_access_family_observation: {
        Args: { observation_user_id: string }
        Returns: boolean
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_monthly_usage: {
        Args: { p_feature_type: string; p_user_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      make_user_admin: {
        Args: { target_email: string }
        Returns: boolean
      }
      process_referral_reward: {
        Args: { p_referee_id: string; p_referral_code: string }
        Returns: boolean
      }
      refresh_admin_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      track_feature_usage: {
        Args: { p_feature_type: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "expert" | "user"
      subscription_type: "free" | "token_pack" | "monthly_unlimited"
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
      app_role: ["admin", "expert", "user"],
      subscription_type: ["free", "token_pack", "monthly_unlimited"],
    },
  },
} as const
