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
      ab_test_experiments: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          experiment_name: string
          id: string
          is_active: boolean
          start_date: string | null
          target_metric: string
          updated_at: string
          variants: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          experiment_name: string
          id?: string
          is_active?: boolean
          start_date?: string | null
          target_metric: string
          updated_at?: string
          variants: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          experiment_name?: string
          id?: string
          is_active?: boolean
          start_date?: string | null
          target_metric?: string
          updated_at?: string
          variants?: Json
        }
        Relationships: []
      }
      aba_observations: {
        Row: {
          abc_antecedent: string | null
          abc_behavior: string | null
          abc_consequence: string | null
          child_profile_id: string | null
          created_at: string
          data_method: string
          day: number
          duration_seconds: number | null
          enrollment_id: string | null
          frequency_count: number | null
          id: string
          interval_hits: number | null
          interval_total: number | null
          notes: string | null
          parent_script_used: boolean
          phase: string
          reinforcer_used: string | null
          target_behavior: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          abc_antecedent?: string | null
          abc_behavior?: string | null
          abc_consequence?: string | null
          child_profile_id?: string | null
          created_at?: string
          data_method: string
          day: number
          duration_seconds?: number | null
          enrollment_id?: string | null
          frequency_count?: number | null
          id?: string
          interval_hits?: number | null
          interval_total?: number | null
          notes?: string | null
          parent_script_used?: boolean
          phase: string
          reinforcer_used?: string | null
          target_behavior?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          abc_antecedent?: string | null
          abc_behavior?: string | null
          abc_consequence?: string | null
          child_profile_id?: string | null
          created_at?: string
          data_method?: string
          day?: number
          duration_seconds?: number | null
          enrollment_id?: string | null
          frequency_count?: number | null
          id?: string
          interval_hits?: number | null
          interval_total?: number | null
          notes?: string | null
          parent_script_used?: boolean
          phase?: string
          reinforcer_used?: string | null
          target_behavior?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      agent_interactions: {
        Row: {
          agent_id: string
          collaboration_agents: string[] | null
          confidence_score: number | null
          created_at: string
          id: string
          interaction_type: string
          message: string | null
          response: string | null
          urgency_level: string | null
          user_id: string
          was_accepted: boolean | null
        }
        Insert: {
          agent_id: string
          collaboration_agents?: string[] | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          interaction_type?: string
          message?: string | null
          response?: string | null
          urgency_level?: string | null
          user_id: string
          was_accepted?: boolean | null
        }
        Update: {
          agent_id?: string
          collaboration_agents?: string[] | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          interaction_type?: string
          message?: string | null
          response?: string | null
          urgency_level?: string | null
          user_id?: string
          was_accepted?: boolean | null
        }
        Relationships: []
      }
      ai_analysis_feedback: {
        Row: {
          ai_output: string
          analysis_type: string
          created_at: string
          expert_revised: string | null
          feedback_type: string | null
          id: string
          input_data: Json
          is_expert_validated: boolean | null
          is_training_ready: boolean | null
          rating: number
          session_id: string | null
          training_exported_at: string | null
          user_comment: string | null
          user_id: string | null
        }
        Insert: {
          ai_output: string
          analysis_type: string
          created_at?: string
          expert_revised?: string | null
          feedback_type?: string | null
          id?: string
          input_data: Json
          is_expert_validated?: boolean | null
          is_training_ready?: boolean | null
          rating: number
          session_id?: string | null
          training_exported_at?: string | null
          user_comment?: string | null
          user_id?: string | null
        }
        Update: {
          ai_output?: string
          analysis_type?: string
          created_at?: string
          expert_revised?: string | null
          feedback_type?: string | null
          id?: string
          input_data?: Json
          is_expert_validated?: boolean | null
          is_training_ready?: boolean | null
          rating?: number
          session_id?: string | null
          training_exported_at?: string | null
          user_comment?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_coaching_sessions: {
        Row: {
          action_items: string[] | null
          completed_at: string | null
          conversation_history: Json
          created_at: string
          id: string
          mood_after: number | null
          mood_before: number | null
          next_session_date: string | null
          session_duration_minutes: number | null
          session_summary: string | null
          session_type: string
          user_id: string
        }
        Insert: {
          action_items?: string[] | null
          completed_at?: string | null
          conversation_history?: Json
          created_at?: string
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          next_session_date?: string | null
          session_duration_minutes?: number | null
          session_summary?: string | null
          session_type: string
          user_id: string
        }
        Update: {
          action_items?: string[] | null
          completed_at?: string | null
          conversation_history?: Json
          created_at?: string
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          next_session_date?: string | null
          session_duration_minutes?: number | null
          session_summary?: string | null
          session_type?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_consultation_matches: {
        Row: {
          concern_text: string
          created_at: string | null
          detected_category: string | null
          detected_severity: string | null
          id: string
          recommended_expert_ids: string[] | null
          recommended_offering_key: string | null
          resulted_in_booking_id: string | null
          selected_expert_id: string | null
          trigger_source: string | null
          user_id: string | null
        }
        Insert: {
          concern_text: string
          created_at?: string | null
          detected_category?: string | null
          detected_severity?: string | null
          id?: string
          recommended_expert_ids?: string[] | null
          recommended_offering_key?: string | null
          resulted_in_booking_id?: string | null
          selected_expert_id?: string | null
          trigger_source?: string | null
          user_id?: string | null
        }
        Update: {
          concern_text?: string
          created_at?: string | null
          detected_category?: string | null
          detected_severity?: string | null
          id?: string
          recommended_expert_ids?: string[] | null
          recommended_offering_key?: string | null
          resulted_in_booking_id?: string | null
          selected_expert_id?: string | null
          trigger_source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_health_insights: {
        Row: {
          confidence_score: number | null
          content: string
          created_at: string
          generated_at: string
          id: string
          insight_type: string
          is_read: boolean | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          content: string
          created_at?: string
          generated_at?: string
          id?: string
          insight_type: string
          is_read?: boolean | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          content?: string
          created_at?: string
          generated_at?: string
          id?: string
          insight_type?: string
          is_read?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      ai_observation_results: {
        Row: {
          age_group: string | null
          analysis_result: Json
          analysis_type: string
          created_at: string
          id: string
          input_context: string | null
          input_type: string
          risk_level: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_group?: string | null
          analysis_result: Json
          analysis_type: string
          created_at?: string
          id?: string
          input_context?: string | null
          input_type: string
          risk_level?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_group?: string | null
          analysis_result?: Json
          analysis_type?: string
          created_at?: string
          id?: string
          input_context?: string | null
          input_type?: string
          risk_level?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
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
      audit_checklist_items: {
        Row: {
          category: string
          check_frequency: string | null
          created_at: string
          description: string | null
          id: string
          is_critical: boolean | null
          item_name: string
          legal_basis: string | null
          penalty_info: string | null
          required_documents: string[] | null
        }
        Insert: {
          category: string
          check_frequency?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_critical?: boolean | null
          item_name: string
          legal_basis?: string | null
          penalty_info?: string | null
          required_documents?: string[] | null
        }
        Update: {
          category?: string
          check_frequency?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_critical?: boolean | null
          item_name?: string
          legal_basis?: string | null
          penalty_info?: string | null
          required_documents?: string[] | null
        }
        Relationships: []
      }
      b2b_ad_analytics: {
        Row: {
          ad_id: string | null
          ad_type: string
          created_at: string
          event_type: string
          id: string
          institution_id: string
          metadata: Json | null
          page_location: string | null
          user_id: string | null
        }
        Insert: {
          ad_id?: string | null
          ad_type: string
          created_at?: string
          event_type: string
          id?: string
          institution_id: string
          metadata?: Json | null
          page_location?: string | null
          user_id?: string | null
        }
        Update: {
          ad_id?: string | null
          ad_type?: string
          created_at?: string
          event_type?: string
          id?: string
          institution_id?: string
          metadata?: Json | null
          page_location?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_ad_analytics_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_ad_inquiries: {
        Row: {
          admin_notes: string | null
          attachment_filename: string | null
          attachment_url: string | null
          budget_range: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          id: string
          institution_name: string
          institution_type: string
          interested_plans: string[] | null
          message: string | null
          preferred_contact_at: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          attachment_filename?: string | null
          attachment_url?: string | null
          budget_range?: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string
          id?: string
          institution_name: string
          institution_type: string
          interested_plans?: string[] | null
          message?: string | null
          preferred_contact_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          attachment_filename?: string | null
          attachment_url?: string | null
          budget_range?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          id?: string
          institution_name?: string
          institution_type?: string
          interested_plans?: string[] | null
          message?: string | null
          preferred_contact_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      b2b_ad_plans: {
        Row: {
          created_at: string
          description: string | null
          display_priority: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          plan_name: string
          plan_type: string
          price_monthly: number
          price_yearly: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_priority?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          plan_name: string
          plan_type: string
          price_monthly?: number
          price_yearly?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_priority?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          plan_name?: string
          plan_type?: string
          price_monthly?: number
          price_yearly?: number | null
        }
        Relationships: []
      }
      b2b_banner_ads: {
        Row: {
          banner_image_url: string
          clicks: number | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          impressions: number | null
          institution_id: string
          is_active: boolean | null
          link_url: string | null
          position: string
          start_date: string | null
          subscription_id: string | null
          title: string | null
        }
        Insert: {
          banner_image_url: string
          clicks?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          institution_id: string
          is_active?: boolean | null
          link_url?: string | null
          position: string
          start_date?: string | null
          subscription_id?: string | null
          title?: string | null
        }
        Update: {
          banner_image_url?: string
          clicks?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          institution_id?: string
          is_active?: boolean | null
          link_url?: string | null
          position?: string
          start_date?: string | null
          subscription_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_banner_ads_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_banner_ads_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "b2b_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_demo_requests: {
        Row: {
          admin_notes: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          employee_count: number | null
          id: string
          institution_name: string
          institution_type: string
          message: string | null
          request_type: string
          source: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          employee_count?: number | null
          id?: string
          institution_name: string
          institution_type: string
          message?: string | null
          request_type?: string
          source?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          employee_count?: number | null
          id?: string
          institution_name?: string
          institution_type?: string
          message?: string | null
          request_type?: string
          source?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      b2b_feature_unlocks: {
        Row: {
          created_at: string | null
          feature_key: string
          id: string
          institution_id: string | null
          is_active: boolean | null
          months_required: number
          unlock_date: string
        }
        Insert: {
          created_at?: string | null
          feature_key: string
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          months_required: number
          unlock_date: string
        }
        Update: {
          created_at?: string | null
          feature_key?: string
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          months_required?: number
          unlock_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_feature_unlocks_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_followup_queue: {
        Row: {
          contact_name: string | null
          created_at: string
          error: string | null
          followup_type: string
          id: string
          inquiry_id: string | null
          institution_name: string | null
          recipient_email: string
          scheduled_at: string
          sent_at: string | null
          status: string
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          error?: string | null
          followup_type: string
          id?: string
          inquiry_id?: string | null
          institution_name?: string | null
          recipient_email: string
          scheduled_at: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          error?: string | null
          followup_type?: string
          id?: string
          inquiry_id?: string | null
          institution_name?: string | null
          recipient_email?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      b2b_funnel_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          page_path: string
          referrer: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_path: string
          referrer?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string
          referrer?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      b2b_inquiries: {
        Row: {
          assigned_admin: string | null
          contact_person: string
          created_at: string
          email: string
          id: string
          kanban_status: string | null
          last_activity_at: string | null
          lead_score: number | null
          message: string | null
          num_users: number | null
          organization_name: string
          organization_type: string
          phone: string
          position: string | null
          service_interest: string
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_admin?: string | null
          contact_person: string
          created_at?: string
          email: string
          id?: string
          kanban_status?: string | null
          last_activity_at?: string | null
          lead_score?: number | null
          message?: string | null
          num_users?: number | null
          organization_name: string
          organization_type: string
          phone: string
          position?: string | null
          service_interest: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_admin?: string | null
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          kanban_status?: string | null
          last_activity_at?: string | null
          lead_score?: number | null
          message?: string | null
          num_users?: number | null
          organization_name?: string
          organization_type?: string
          phone?: string
          position?: string | null
          service_interest?: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      b2b_invoices: {
        Row: {
          amount: number
          billing_period_end: string | null
          billing_period_start: string | null
          company_name: string
          contact_email: string
          created_at: string
          due_date: string
          id: string
          invoice_no: string
          paid_at: string | null
          pdf_url: string | null
          quote_id: string | null
          status: string
          toss_payment_key: string | null
          total: number
          updated_at: string
          vat: number
        }
        Insert: {
          amount: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          company_name: string
          contact_email: string
          created_at?: string
          due_date?: string
          id?: string
          invoice_no?: string
          paid_at?: string | null
          pdf_url?: string | null
          quote_id?: string | null
          status?: string
          toss_payment_key?: string | null
          total: number
          updated_at?: string
          vat?: number
        }
        Update: {
          amount?: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          company_name?: string
          contact_email?: string
          created_at?: string
          due_date?: string
          id?: string
          invoice_no?: string
          paid_at?: string | null
          pdf_url?: string | null
          quote_id?: string | null
          status?: string
          toss_payment_key?: string | null
          total?: number
          updated_at?: string
          vat?: number
        }
        Relationships: [
          {
            foreignKeyName: "b2b_invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "b2b_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_jobcoach_employee_sessions: {
        Row: {
          burnout_score: number | null
          created_at: string
          department_code: string | null
          duration_minutes: number | null
          employee_user_id: string
          id: string
          institution_id: string | null
          notes: string | null
          risk_level: string | null
          satisfaction_score: number | null
          session_type: string
          stress_score: number | null
        }
        Insert: {
          burnout_score?: number | null
          created_at?: string
          department_code?: string | null
          duration_minutes?: number | null
          employee_user_id: string
          id?: string
          institution_id?: string | null
          notes?: string | null
          risk_level?: string | null
          satisfaction_score?: number | null
          session_type: string
          stress_score?: number | null
        }
        Update: {
          burnout_score?: number | null
          created_at?: string
          department_code?: string | null
          duration_minutes?: number | null
          employee_user_id?: string
          id?: string
          institution_id?: string | null
          notes?: string | null
          risk_level?: string | null
          satisfaction_score?: number | null
          session_type?: string
          stress_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_jobcoach_employee_sessions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_jobcoach_inquiries: {
        Row: {
          admin_note: string | null
          assigned_admin: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          contacted_at: string | null
          created_at: string
          employee_count: number
          id: string
          industry: string | null
          interested_tier: string | null
          kanban_status: string | null
          last_activity_at: string | null
          lead_score: number | null
          message: string | null
          position: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          assigned_admin?: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          contacted_at?: string | null
          created_at?: string
          employee_count?: number
          id?: string
          industry?: string | null
          interested_tier?: string | null
          kanban_status?: string | null
          last_activity_at?: string | null
          lead_score?: number | null
          message?: string | null
          position?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          assigned_admin?: string | null
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          contacted_at?: string | null
          created_at?: string
          employee_count?: number
          id?: string
          industry?: string | null
          interested_tier?: string | null
          kanban_status?: string | null
          last_activity_at?: string | null
          lead_score?: number | null
          message?: string | null
          position?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      b2b_jobcoach_plans: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          features: Json
          free_coaching_per_employee: number
          id: string
          is_active: boolean
          is_recommended: boolean
          max_employees: number | null
          min_employees: number
          plan_key: string
          plan_name: string
          price_per_employee_monthly: number
          tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          features?: Json
          free_coaching_per_employee?: number
          id?: string
          is_active?: boolean
          is_recommended?: boolean
          max_employees?: number | null
          min_employees?: number
          plan_key: string
          plan_name: string
          price_per_employee_monthly?: number
          tier: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          features?: Json
          free_coaching_per_employee?: number
          id?: string
          is_active?: boolean
          is_recommended?: boolean
          max_employees?: number | null
          min_employees?: number
          plan_key?: string
          plan_name?: string
          price_per_employee_monthly?: number
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      b2b_jobcoach_team_reports: {
        Row: {
          ai_summary: string | null
          avg_burnout_score: number | null
          avg_satisfaction_score: number | null
          avg_stress_score: number | null
          created_at: string
          department_code: string | null
          generated_by: string | null
          high_risk_count: number | null
          id: string
          institution_id: string
          participated_employees: number | null
          recommendations: Json | null
          report_month: string
          total_employees: number | null
          turnover_risk_score: number | null
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          avg_burnout_score?: number | null
          avg_satisfaction_score?: number | null
          avg_stress_score?: number | null
          created_at?: string
          department_code?: string | null
          generated_by?: string | null
          high_risk_count?: number | null
          id?: string
          institution_id: string
          participated_employees?: number | null
          recommendations?: Json | null
          report_month: string
          total_employees?: number | null
          turnover_risk_score?: number | null
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          avg_burnout_score?: number | null
          avg_satisfaction_score?: number | null
          avg_stress_score?: number | null
          created_at?: string
          department_code?: string | null
          generated_by?: string | null
          high_risk_count?: number | null
          id?: string
          institution_id?: string
          participated_employees?: number | null
          recommendations?: Json | null
          report_month?: string
          total_employees?: number | null
          turnover_risk_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_jobcoach_team_reports_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_lead_downloads: {
        Row: {
          asset_key: string
          company: string | null
          contact_name: string | null
          created_at: string
          email: string
          id: string
          inquiry_id: string | null
          ip_address: string | null
          phone: string | null
          role: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          asset_key: string
          company?: string | null
          contact_name?: string | null
          created_at?: string
          email: string
          id?: string
          inquiry_id?: string | null
          ip_address?: string | null
          phone?: string | null
          role?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          asset_key?: string
          company?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string
          id?: string
          inquiry_id?: string | null
          ip_address?: string | null
          phone?: string | null
          role?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_lead_downloads_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "b2b_inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_partner_institutions: {
        Row: {
          address: string | null
          churn_risk_score: number | null
          cover_image_url: string | null
          created_at: string
          current_residents: number | null
          data_accumulated_months: number | null
          description: string | null
          email: string | null
          email_domain_whitelist: string[] | null
          id: string
          institution_name: string
          institution_type: string
          is_active: boolean | null
          is_verified: boolean | null
          join_code: string | null
          join_code_expires_at: string | null
          logo_url: string | null
          operating_hours: Json | null
          phone: string | null
          resident_capacity: number | null
          specializations: string[] | null
          subscription_started_at: string | null
          total_observations: number | null
          updated_at: string
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          churn_risk_score?: number | null
          cover_image_url?: string | null
          created_at?: string
          current_residents?: number | null
          data_accumulated_months?: number | null
          description?: string | null
          email?: string | null
          email_domain_whitelist?: string[] | null
          id?: string
          institution_name: string
          institution_type: string
          is_active?: boolean | null
          is_verified?: boolean | null
          join_code?: string | null
          join_code_expires_at?: string | null
          logo_url?: string | null
          operating_hours?: Json | null
          phone?: string | null
          resident_capacity?: number | null
          specializations?: string[] | null
          subscription_started_at?: string | null
          total_observations?: number | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          churn_risk_score?: number | null
          cover_image_url?: string | null
          created_at?: string
          current_residents?: number | null
          data_accumulated_months?: number | null
          description?: string | null
          email?: string | null
          email_domain_whitelist?: string[] | null
          id?: string
          institution_name?: string
          institution_type?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          join_code?: string | null
          join_code_expires_at?: string | null
          logo_url?: string | null
          operating_hours?: Json | null
          phone?: string | null
          resident_capacity?: number | null
          specializations?: string[] | null
          subscription_started_at?: string | null
          total_observations?: number | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      b2b_quotes: {
        Row: {
          company_name: string
          contact_email: string
          contact_name: string | null
          created_at: string
          created_by: string | null
          employee_count: number
          id: string
          inquiry_id: string | null
          months: number
          notes: string | null
          pdf_url: string | null
          plan_key: string
          plan_name: string | null
          quote_no: string
          status: string
          subtotal: number
          total: number
          unit_price: number
          updated_at: string
          valid_until: string
          vat: number
        }
        Insert: {
          company_name: string
          contact_email: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          employee_count: number
          id?: string
          inquiry_id?: string | null
          months?: number
          notes?: string | null
          pdf_url?: string | null
          plan_key: string
          plan_name?: string | null
          quote_no?: string
          status?: string
          subtotal: number
          total: number
          unit_price: number
          updated_at?: string
          valid_until?: string
          vat?: number
        }
        Update: {
          company_name?: string
          contact_email?: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          employee_count?: number
          id?: string
          inquiry_id?: string | null
          months?: number
          notes?: string | null
          pdf_url?: string | null
          plan_key?: string
          plan_name?: string | null
          quote_no?: string
          status?: string
          subtotal?: number
          total?: number
          unit_price?: number
          updated_at?: string
          valid_until?: string
          vat?: number
        }
        Relationships: [
          {
            foreignKeyName: "b2b_quotes_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "b2b_jobcoach_inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_retention_rewards: {
        Row: {
          applied_at: string | null
          created_at: string | null
          discount_rate: number | null
          id: string
          institution_id: string | null
          months_subscribed: number
          reward_description: string | null
          reward_type: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string | null
          discount_rate?: number | null
          id?: string
          institution_id?: string | null
          months_subscribed: number
          reward_description?: string | null
          reward_type: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string | null
          discount_rate?: number | null
          id?: string
          institution_id?: string | null
          months_subscribed?: number
          reward_description?: string | null
          reward_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_retention_rewards_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          export_options: string[] | null
          features: Json | null
          gov_subsidy_rate: number | null
          id: string
          is_active: boolean | null
          locked_features: Json | null
          max_capacity: number | null
          min_capacity: number | null
          plan_key: string
          plan_name: string
          price_monthly: number
          price_yearly: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          export_options?: string[] | null
          features?: Json | null
          gov_subsidy_rate?: number | null
          id?: string
          is_active?: boolean | null
          locked_features?: Json | null
          max_capacity?: number | null
          min_capacity?: number | null
          plan_key: string
          plan_name: string
          price_monthly: number
          price_yearly?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          export_options?: string[] | null
          features?: Json | null
          gov_subsidy_rate?: number | null
          id?: string
          is_active?: boolean | null
          locked_features?: Json | null
          max_capacity?: number | null
          min_capacity?: number | null
          plan_key?: string
          plan_name?: string
          price_monthly?: number
          price_yearly?: number | null
        }
        Relationships: []
      }
      b2b_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string
          end_date: string | null
          id: string
          institution_id: string
          payment_amount: number | null
          plan_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string
          end_date?: string | null
          id?: string
          institution_id: string
          payment_amount?: number | null
          plan_id: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string
          end_date?: string | null
          id?: string
          institution_id?: string
          payment_amount?: number | null
          plan_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_subscriptions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "b2b_ad_plans"
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
          request_type: string | null
          requested_tokens: number
          status: string
          subscription_duration_months: number | null
          subscription_plan_id: string | null
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
          request_type?: string | null
          requested_tokens: number
          status?: string
          subscription_duration_months?: number | null
          subscription_plan_id?: string | null
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
          request_type?: string | null
          requested_tokens?: number
          status?: string
          subscription_duration_months?: number | null
          subscription_plan_id?: string | null
          transfer_amount?: number
          transfer_date?: string | null
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      beta_discount_settings: {
        Row: {
          created_at: string | null
          discount_name: string
          end_date: string
          id: string
          is_active: boolean
          monthly_discount_percent: number
          start_date: string
          yearly_discount_percent: number
        }
        Insert: {
          created_at?: string | null
          discount_name: string
          end_date?: string
          id?: string
          is_active?: boolean
          monthly_discount_percent?: number
          start_date?: string
          yearly_discount_percent?: number
        }
        Update: {
          created_at?: string | null
          discount_name?: string
          end_date?: string
          id?: string
          is_active?: boolean
          monthly_discount_percent?: number
          start_date?: string
          yearly_discount_percent?: number
        }
        Relationships: []
      }
      book_idea_analyses: {
        Row: {
          additional_recommendations: string | null
          cover_image: string | null
          created_at: string | null
          estimated_cost: number | null
          estimated_pages: number | null
          estimated_quantity: number | null
          format_reason: string | null
          funnel_strategy: Json | null
          id: string
          production_timeline: string | null
          recommended_format: string | null
          revenue_forecast: Json | null
          story_input: string
          success_probability: number | null
          target_audience: Json | null
          toc: Json | null
          toc_image: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_recommendations?: string | null
          cover_image?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          estimated_pages?: number | null
          estimated_quantity?: number | null
          format_reason?: string | null
          funnel_strategy?: Json | null
          id?: string
          production_timeline?: string | null
          recommended_format?: string | null
          revenue_forecast?: Json | null
          story_input: string
          success_probability?: number | null
          target_audience?: Json | null
          toc?: Json | null
          toc_image?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_recommendations?: string | null
          cover_image?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          estimated_pages?: number | null
          estimated_quantity?: number | null
          format_reason?: string | null
          funnel_strategy?: Json | null
          id?: string
          production_timeline?: string | null
          recommended_format?: string | null
          revenue_forecast?: Json | null
          story_input?: string
          success_probability?: number | null
          target_audience?: Json | null
          toc?: Json | null
          toc_image?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      book_production_requests: {
        Row: {
          actual_completion_date: string | null
          book_id: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          delivery_address: string | null
          estimated_completion_date: string | null
          id: string
          memory_count: number
          payment_status: string | null
          preferred_style: string | null
          price_quote: number | null
          production_notes: string | null
          request_type: string
          special_requests: string | null
          status: string
          total_word_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_completion_date?: string | null
          book_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          delivery_address?: string | null
          estimated_completion_date?: string | null
          id?: string
          memory_count?: number
          payment_status?: string | null
          preferred_style?: string | null
          price_quote?: number | null
          production_notes?: string | null
          request_type: string
          special_requests?: string | null
          status?: string
          total_word_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_completion_date?: string | null
          book_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          delivery_address?: string | null
          estimated_completion_date?: string | null
          id?: string
          memory_count?: number
          payment_status?: string | null
          preferred_style?: string | null
          price_quote?: number | null
          production_notes?: string | null
          request_type?: string
          special_requests?: string | null
          status?: string
          total_word_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_production_requests_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "user_books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_projects: {
        Row: {
          ai_guide: Json | null
          auto_save_content: string | null
          chapters: Json | null
          created_at: string
          genre: string | null
          id: string
          is_published: boolean | null
          last_ai_generation: string | null
          outline: Json | null
          roadmap_data: Json | null
          target_audience: string | null
          theme: string | null
          title: string
          updated_at: string
          user_id: string
          writing_progress: Json | null
        }
        Insert: {
          ai_guide?: Json | null
          auto_save_content?: string | null
          chapters?: Json | null
          created_at?: string
          genre?: string | null
          id?: string
          is_published?: boolean | null
          last_ai_generation?: string | null
          outline?: Json | null
          roadmap_data?: Json | null
          target_audience?: string | null
          theme?: string | null
          title: string
          updated_at?: string
          user_id: string
          writing_progress?: Json | null
        }
        Update: {
          ai_guide?: Json | null
          auto_save_content?: string | null
          chapters?: Json | null
          created_at?: string
          genre?: string | null
          id?: string
          is_published?: boolean | null
          last_ai_generation?: string | null
          outline?: Json | null
          roadmap_data?: Json | null
          target_audience?: string | null
          theme?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          writing_progress?: Json | null
        }
        Relationships: []
      }
      booking_waitlist: {
        Row: {
          created_at: string | null
          duration_minutes: number
          expert_id: string
          id: string
          notified_at: string | null
          preferred_date: string
          preferred_time_end: string | null
          preferred_time_start: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number
          expert_id: string
          id?: string
          notified_at?: string | null
          preferred_date: string
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number
          expert_id?: string
          id?: string
          notified_at?: string | null
          preferred_date?: string
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_waitlist_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_booking_stats"
            referencedColumns: ["expert_id"]
          },
          {
            foreignKeyName: "booking_waitlist_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_health_stats: {
        Row: {
          cognitive_age: number | null
          created_at: string
          games_completed: number
          id: string
          improvement_percentage: number | null
          streak_days: number
          updated_at: string
          user_id: string
          week_end: string
          week_start: string
          weekly_average_score: number
        }
        Insert: {
          cognitive_age?: number | null
          created_at?: string
          games_completed?: number
          id?: string
          improvement_percentage?: number | null
          streak_days?: number
          updated_at?: string
          user_id: string
          week_end: string
          week_start: string
          weekly_average_score?: number
        }
        Update: {
          cognitive_age?: number | null
          created_at?: string
          games_completed?: number
          id?: string
          improvement_percentage?: number | null
          streak_days?: number
          updated_at?: string
          user_id?: string
          week_end?: string
          week_start?: string
          weekly_average_score?: number
        }
        Relationships: []
      }
      brain_training_scores: {
        Row: {
          created_at: string
          duration: number
          game_type: string
          id: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number
          game_type: string
          id?: string
          score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number
          game_type?: string
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      brain_training_sessions: {
        Row: {
          cognitive_metrics: Json | null
          created_at: string
          difficulty_level: number
          duration_seconds: number | null
          game_name: string
          game_type: string
          id: string
          max_score: number
          score: number
          session_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cognitive_metrics?: Json | null
          created_at?: string
          difficulty_level?: number
          duration_seconds?: number | null
          game_name: string
          game_type: string
          id?: string
          max_score?: number
          score?: number
          session_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cognitive_metrics?: Json | null
          created_at?: string
          difficulty_level?: number
          duration_seconds?: number | null
          game_name?: string
          game_type?: string
          id?: string
          max_score?: number
          score?: number
          session_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      business_plans: {
        Row: {
          budget: string | null
          business_goals: string | null
          channel_name: string
          content_strategy: string | null
          created_at: string
          generated_plan: string
          id: string
          is_favorite: boolean | null
          monetization_plan: string | null
          niche: string
          plan_type: string
          target_audience: string
          timeline: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: string | null
          business_goals?: string | null
          channel_name: string
          content_strategy?: string | null
          created_at?: string
          generated_plan: string
          id?: string
          is_favorite?: boolean | null
          monetization_plan?: string | null
          niche: string
          plan_type?: string
          target_audience: string
          timeline?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: string | null
          business_goals?: string | null
          channel_name?: string
          content_strategy?: string | null
          created_at?: string
          generated_plan?: string
          id?: string
          is_favorite?: boolean | null
          monetization_plan?: string | null
          niche?: string
          plan_type?: string
          target_audience?: string
          timeline?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      center_assessments: {
        Row: {
          assessment_date: string
          assessment_type: string | null
          center_id: string
          client_id: string
          content: string | null
          created_at: string
          id: string
          meta: Json
          status: string
          therapist_id: string | null
        }
        Insert: {
          assessment_date: string
          assessment_type?: string | null
          center_id: string
          client_id: string
          content?: string | null
          created_at?: string
          id?: string
          meta?: Json
          status?: string
          therapist_id?: string | null
        }
        Update: {
          assessment_date?: string
          assessment_type?: string | null
          center_id?: string
          client_id?: string
          content?: string | null
          created_at?: string
          id?: string
          meta?: Json
          status?: string
          therapist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "center_assessments_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_assessments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "center_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_assessments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "center_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      center_b2c_grants: {
        Row: {
          center_id: string
          client_id: string | null
          expires_at: string | null
          granted_at: string
          grants: Json
          id: string
          source: string
          user_id: string
        }
        Insert: {
          center_id: string
          client_id?: string | null
          expires_at?: string | null
          granted_at?: string
          grants?: Json
          id?: string
          source?: string
          user_id: string
        }
        Update: {
          center_id?: string
          client_id?: string | null
          expires_at?: string | null
          granted_at?: string
          grants?: Json
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_b2c_grants_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_b2c_grants_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "center_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      center_billing_closings: {
        Row: {
          center_id: string
          closed_at: string
          closed_by: string | null
          id: string
          notes: string | null
          period_yyyymm: string
          total_ar_krw: number
          total_charge_krw: number
          total_payment_krw: number
        }
        Insert: {
          center_id: string
          closed_at?: string
          closed_by?: string | null
          id?: string
          notes?: string | null
          period_yyyymm: string
          total_ar_krw?: number
          total_charge_krw?: number
          total_payment_krw?: number
        }
        Update: {
          center_id?: string
          closed_at?: string
          closed_by?: string | null
          id?: string
          notes?: string | null
          period_yyyymm?: string
          total_ar_krw?: number
          total_charge_krw?: number
          total_payment_krw?: number
        }
        Relationships: []
      }
      center_client_invites: {
        Row: {
          center_code: string
          center_id: string
          claimed_at: string | null
          claimed_by_user_id: string | null
          client_id: string
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          invite_token: string
          status: string
        }
        Insert: {
          center_code: string
          center_id: string
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          invite_token?: string
          status?: string
        }
        Update: {
          center_code?: string
          center_id?: string
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          invite_token?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_client_invites_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_client_invites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "center_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      center_clients: {
        Row: {
          address: string | null
          birth_date: string | null
          center_id: string
          created_at: string
          disability_info: string | null
          gender: string | null
          guardian_phone: string | null
          id: string
          initial_consult_date: string | null
          linked_user_id: string | null
          member_no: string | null
          meta: Json
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          center_id: string
          created_at?: string
          disability_info?: string | null
          gender?: string | null
          guardian_phone?: string | null
          id?: string
          initial_consult_date?: string | null
          linked_user_id?: string | null
          member_no?: string | null
          meta?: Json
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          center_id?: string
          created_at?: string
          disability_info?: string | null
          gender?: string | null
          guardian_phone?: string | null
          id?: string
          initial_consult_date?: string | null
          linked_user_id?: string | null
          member_no?: string | null
          meta?: Json
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_clients_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      center_directory: {
        Row: {
          address: string | null
          created_at: string
          id: string
          intro: string | null
          is_active: boolean
          is_partner: boolean
          name: string
          phone: string | null
          region: string
          slug: string
          specialties: string[]
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          intro?: string | null
          is_active?: boolean
          is_partner?: boolean
          name: string
          phone?: string | null
          region: string
          slug: string
          specialties?: string[]
          type: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          intro?: string | null
          is_active?: boolean
          is_partner?: boolean
          name?: string
          phone?: string | null
          region?: string
          slug?: string
          specialties?: string[]
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      center_import_jobs: {
        Row: {
          center_id: string
          completed_at: string | null
          created_at: string
          detected_format: string | null
          error_log: Json | null
          filename: string
          id: string
          import_options: Json | null
          status: string
          summary: Json
          user_id: string
        }
        Insert: {
          center_id: string
          completed_at?: string | null
          created_at?: string
          detected_format?: string | null
          error_log?: Json | null
          filename: string
          id?: string
          import_options?: Json | null
          status?: string
          summary?: Json
          user_id: string
        }
        Update: {
          center_id?: string
          completed_at?: string | null
          created_at?: string
          detected_format?: string | null
          error_log?: Json | null
          filename?: string
          id?: string
          import_options?: Json | null
          status?: string
          summary?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_import_jobs_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      center_inquiries: {
        Row: {
          center_id: string | null
          check_summary: Json | null
          child_age: string | null
          contact: string
          created_at: string
          id: string
          memo: string | null
          name: string
          source_path: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          center_id?: string | null
          check_summary?: Json | null
          child_age?: string | null
          contact: string
          created_at?: string
          id?: string
          memo?: string | null
          name: string
          source_path?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          center_id?: string | null
          check_summary?: Json | null
          child_age?: string | null
          contact?: string
          created_at?: string
          id?: string
          memo?: string | null
          name?: string
          source_path?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "center_inquiries_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      center_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          center_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          center_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          center_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_invites_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      center_members: {
        Row: {
          center_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["center_role"]
          user_id: string
        }
        Insert: {
          center_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["center_role"]
          user_id: string
        }
        Update: {
          center_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["center_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_members_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      center_notifications_log: {
        Row: {
          center_id: string
          channel: string
          id: string
          payload: Json
          recipient: string
          sent_at: string | null
          status: string
          template: string | null
        }
        Insert: {
          center_id: string
          channel: string
          id?: string
          payload?: Json
          recipient: string
          sent_at?: string | null
          status?: string
          template?: string | null
        }
        Update: {
          center_id?: string
          channel?: string
          id?: string
          payload?: Json
          recipient?: string
          sent_at?: string | null
          status?: string
          template?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "center_notifications_log_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      center_onboarding_progress: {
        Row: {
          center_id: string
          completed_at: string
          id: string
          step_key: string
        }
        Insert: {
          center_id: string
          completed_at?: string
          id?: string
          step_key: string
        }
        Update: {
          center_id?: string
          completed_at?: string
          id?: string
          step_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_onboarding_progress_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      center_organizations: {
        Row: {
          address: string | null
          business_no: string | null
          contract_expires_at: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
          phone: string | null
          plan: string
          storefront_slug: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
          trial_status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_no?: string | null
          contract_expires_at?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id: string
          phone?: string | null
          plan?: string
          storefront_slug?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          trial_status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_no?: string | null
          contract_expires_at?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          phone?: string | null
          plan?: string
          storefront_slug?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          trial_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      center_parent_report_comments: {
        Row: {
          author_role: string
          author_user_id: string
          body: string
          center_id: string
          created_at: string
          emoji: string | null
          id: string
          report_id: string
        }
        Insert: {
          author_role?: string
          author_user_id: string
          body: string
          center_id: string
          created_at?: string
          emoji?: string | null
          id?: string
          report_id: string
        }
        Update: {
          author_role?: string
          author_user_id?: string
          body?: string
          center_id?: string
          created_at?: string
          emoji?: string | null
          id?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_parent_report_comments_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_parent_report_comments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "center_parent_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      center_parent_reports: {
        Row: {
          ai_draft_json: Json | null
          ai_summary: string | null
          center_id: string
          client_id: string
          coach_comment: string | null
          created_at: string
          edited_html: string | null
          generated_at: string | null
          html_content: string | null
          id: string
          issued_at: string | null
          metrics: Json | null
          pdf_url: string | null
          period_end: string
          period_start: string
          period_type: string
          period_yyyymm: string | null
          published_at: string | null
          sent_at: string | null
          share_token: string | null
          source_upload_ids: string[] | null
          status: string
          title: string | null
          viewed_at: string | null
          week_key: string | null
        }
        Insert: {
          ai_draft_json?: Json | null
          ai_summary?: string | null
          center_id: string
          client_id: string
          coach_comment?: string | null
          created_at?: string
          edited_html?: string | null
          generated_at?: string | null
          html_content?: string | null
          id?: string
          issued_at?: string | null
          metrics?: Json | null
          pdf_url?: string | null
          period_end: string
          period_start: string
          period_type?: string
          period_yyyymm?: string | null
          published_at?: string | null
          sent_at?: string | null
          share_token?: string | null
          source_upload_ids?: string[] | null
          status?: string
          title?: string | null
          viewed_at?: string | null
          week_key?: string | null
        }
        Update: {
          ai_draft_json?: Json | null
          ai_summary?: string | null
          center_id?: string
          client_id?: string
          coach_comment?: string | null
          created_at?: string
          edited_html?: string | null
          generated_at?: string | null
          html_content?: string | null
          id?: string
          issued_at?: string | null
          metrics?: Json | null
          pdf_url?: string | null
          period_end?: string
          period_start?: string
          period_type?: string
          period_yyyymm?: string | null
          published_at?: string | null
          sent_at?: string | null
          share_token?: string | null
          source_upload_ids?: string[] | null
          status?: string
          title?: string | null
          viewed_at?: string | null
          week_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "center_parent_reports_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_parent_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "center_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      center_parent_share_links: {
        Row: {
          access_count: number
          center_id: string | null
          child_id: string | null
          created_at: string
          created_by: string
          expires_at: string
          failed_attempts: number
          first_verified_at: string | null
          id: string
          last_accessed_at: string | null
          locked_until: string | null
          parent_phone_e164: string
          parent_phone_last4: string
          resource_id: string
          resource_type: string
          revoked_at: string | null
          sms_sent_at: string | null
          token: string
          updated_at: string
        }
        Insert: {
          access_count?: number
          center_id?: string | null
          child_id?: string | null
          created_at?: string
          created_by: string
          expires_at?: string
          failed_attempts?: number
          first_verified_at?: string | null
          id?: string
          last_accessed_at?: string | null
          locked_until?: string | null
          parent_phone_e164: string
          parent_phone_last4: string
          resource_id: string
          resource_type: string
          revoked_at?: string | null
          sms_sent_at?: string | null
          token: string
          updated_at?: string
        }
        Update: {
          access_count?: number
          center_id?: string | null
          child_id?: string | null
          created_at?: string
          created_by?: string
          expires_at?: string
          failed_attempts?: number
          first_verified_at?: string | null
          id?: string
          last_accessed_at?: string | null
          locked_until?: string | null
          parent_phone_e164?: string
          parent_phone_last4?: string
          resource_id?: string
          resource_type?: string
          revoked_at?: string | null
          sms_sent_at?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      center_payments: {
        Row: {
          amount_krw: number
          center_id: string
          client_id: string | null
          copayment: number
          created_at: string
          id: string
          meta: Json
          method: string | null
          paid_at: string
          receipt_no: string | null
          session_id: string | null
          voucher_amount: number
        }
        Insert: {
          amount_krw?: number
          center_id: string
          client_id?: string | null
          copayment?: number
          created_at?: string
          id?: string
          meta?: Json
          method?: string | null
          paid_at: string
          receipt_no?: string | null
          session_id?: string | null
          voucher_amount?: number
        }
        Update: {
          amount_krw?: number
          center_id?: string
          client_id?: string | null
          copayment?: number
          created_at?: string
          id?: string
          meta?: Json
          method?: string | null
          paid_at?: string
          receipt_no?: string | null
          session_id?: string | null
          voucher_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "center_payments_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "center_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "center_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      center_programs: {
        Row: {
          category: string
          center_id: string
          created_at: string
          duration_min: number
          id: string
          is_voucher: boolean
          meta: Json
          name: string
          price_krw: number
        }
        Insert: {
          category: string
          center_id: string
          created_at?: string
          duration_min?: number
          id?: string
          is_voucher?: boolean
          meta?: Json
          name: string
          price_krw?: number
        }
        Update: {
          category?: string
          center_id?: string
          created_at?: string
          duration_min?: number
          id?: string
          is_voucher?: boolean
          meta?: Json
          name?: string
          price_krw?: number
        }
        Relationships: [
          {
            foreignKeyName: "center_programs_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      center_receipts: {
        Row: {
          center_id: string
          id: string
          issued_at: string
          payment_id: string | null
          pdf_url: string | null
        }
        Insert: {
          center_id: string
          id?: string
          issued_at?: string
          payment_id?: string | null
          pdf_url?: string | null
        }
        Update: {
          center_id?: string
          id?: string
          issued_at?: string
          payment_id?: string | null
          pdf_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "center_receipts_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "center_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      center_session_uploads: {
        Row: {
          ai_extracted: Json
          center_id: string
          client_id: string
          created_at: string
          error_message: string | null
          id: string
          image_url: string | null
          ocr_text: string | null
          session_date: string
          status: string
          storage_path: string | null
          therapist_id: string | null
          updated_at: string
          uploaded_by: string | null
          week_key: string
        }
        Insert: {
          ai_extracted?: Json
          center_id: string
          client_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          image_url?: string | null
          ocr_text?: string | null
          session_date?: string
          status?: string
          storage_path?: string | null
          therapist_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          week_key: string
        }
        Update: {
          ai_extracted?: Json
          center_id?: string
          client_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          image_url?: string | null
          ocr_text?: string | null
          session_date?: string
          status?: string
          storage_path?: string | null
          therapist_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          week_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_session_uploads_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_session_uploads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "center_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_session_uploads_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "center_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      center_sessions: {
        Row: {
          center_id: string
          client_id: string
          created_at: string
          duration_min: number | null
          end_time: string | null
          id: string
          is_voucher: boolean
          meta: Json
          note: string | null
          price_krw: number
          program_id: string | null
          recurrence_key: string | null
          session_date: string
          start_time: string | null
          status: Database["public"]["Enums"]["center_session_status"]
          therapist_id: string | null
          updated_at: string
        }
        Insert: {
          center_id: string
          client_id: string
          created_at?: string
          duration_min?: number | null
          end_time?: string | null
          id?: string
          is_voucher?: boolean
          meta?: Json
          note?: string | null
          price_krw?: number
          program_id?: string | null
          recurrence_key?: string | null
          session_date: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["center_session_status"]
          therapist_id?: string | null
          updated_at?: string
        }
        Update: {
          center_id?: string
          client_id?: string
          created_at?: string
          duration_min?: number | null
          end_time?: string | null
          id?: string
          is_voucher?: boolean
          meta?: Json
          note?: string | null
          price_krw?: number
          program_id?: string | null
          recurrence_key?: string | null
          session_date?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["center_session_status"]
          therapist_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_sessions_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "center_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_sessions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "center_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_sessions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "center_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      center_support_tickets: {
        Row: {
          body: string
          category: string
          center_id: string
          created_at: string
          id: string
          status: string
          title: string
          user_id: string | null
        }
        Insert: {
          body: string
          category: string
          center_id: string
          created_at?: string
          id?: string
          status?: string
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string
          category?: string
          center_id?: string
          created_at?: string
          id?: string
          status?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "center_support_tickets_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      center_therapists: {
        Row: {
          account_status: string
          birth_date: string | null
          calendar_color: string | null
          center_id: string
          created_at: string
          id: string
          last_login_at: string | null
          linked_user_id: string | null
          login_account: string | null
          meta: Json
          name: string
          phone: string | null
          specialty: string | null
          title: string | null
          updated_at: string
          work_phone: string | null
        }
        Insert: {
          account_status?: string
          birth_date?: string | null
          calendar_color?: string | null
          center_id: string
          created_at?: string
          id?: string
          last_login_at?: string | null
          linked_user_id?: string | null
          login_account?: string | null
          meta?: Json
          name: string
          phone?: string | null
          specialty?: string | null
          title?: string | null
          updated_at?: string
          work_phone?: string | null
        }
        Update: {
          account_status?: string
          birth_date?: string | null
          calendar_color?: string | null
          center_id?: string
          created_at?: string
          id?: string
          last_login_at?: string | null
          linked_user_id?: string | null
          login_account?: string | null
          meta?: Json
          name?: string
          phone?: string | null
          specialty?: string | null
          title?: string | null
          updated_at?: string
          work_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "center_therapists_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      center_voucher_claim_items: {
        Row: {
          amount_krw: number
          claim_id: string
          client_id: string | null
          copayment_krw: number
          created_at: string
          id: string
          service_date: string
          session_id: string | null
          status: string
          subsidy_krw: number
          therapist_id: string | null
          voucher_no: string | null
          warning: string | null
        }
        Insert: {
          amount_krw?: number
          claim_id: string
          client_id?: string | null
          copayment_krw?: number
          created_at?: string
          id?: string
          service_date: string
          session_id?: string | null
          status?: string
          subsidy_krw?: number
          therapist_id?: string | null
          voucher_no?: string | null
          warning?: string | null
        }
        Update: {
          amount_krw?: number
          claim_id?: string
          client_id?: string | null
          copayment_krw?: number
          created_at?: string
          id?: string
          service_date?: string
          session_id?: string | null
          status?: string
          subsidy_krw?: number
          therapist_id?: string | null
          voucher_no?: string | null
          warning?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "center_voucher_claim_items_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "center_voucher_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      center_voucher_claims: {
        Row: {
          approved_at: string | null
          center_id: string
          created_at: string
          created_by: string | null
          file_url: string | null
          id: string
          period_yyyymm: string
          rejected_reason: string | null
          status: string
          submitted_at: string | null
          total_amount_krw: number
          total_count: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          center_id: string
          created_at?: string
          created_by?: string | null
          file_url?: string | null
          id?: string
          period_yyyymm: string
          rejected_reason?: string | null
          status?: string
          submitted_at?: string | null
          total_amount_krw?: number
          total_count?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          center_id?: string
          created_at?: string
          created_by?: string | null
          file_url?: string | null
          id?: string
          period_yyyymm?: string
          rejected_reason?: string | null
          status?: string
          submitted_at?: string | null
          total_amount_krw?: number
          total_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      center_vouchers: {
        Row: {
          center_id: string
          client_id: string | null
          copayment: number | null
          created_at: string
          id: string
          meta: Json
          monthly_amount: number | null
          valid_from: string | null
          valid_until: string | null
          voucher_no: string | null
          voucher_type: string
        }
        Insert: {
          center_id: string
          client_id?: string | null
          copayment?: number | null
          created_at?: string
          id?: string
          meta?: Json
          monthly_amount?: number | null
          valid_from?: string | null
          valid_until?: string | null
          voucher_no?: string | null
          voucher_type: string
        }
        Update: {
          center_id?: string
          client_id?: string | null
          copayment?: number | null
          created_at?: string
          id?: string
          meta?: Json
          monthly_amount?: number | null
          valid_from?: string | null
          valid_until?: string | null
          voucher_no?: string | null
          voucher_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_vouchers_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_vouchers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "center_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      centers: {
        Row: {
          category: string | null
          contact_channel: string | null
          created_at: string
          external_link: string | null
          id: string
          intro: string | null
          name: string
          region: string | null
          status: string
          strength1: string | null
          strength2: string | null
          strength3: string | null
          updated_at: string
          voucher: string | null
        }
        Insert: {
          category?: string | null
          contact_channel?: string | null
          created_at?: string
          external_link?: string | null
          id?: string
          intro?: string | null
          name: string
          region?: string | null
          status?: string
          strength1?: string | null
          strength2?: string | null
          strength3?: string | null
          updated_at?: string
          voucher?: string | null
        }
        Update: {
          category?: string | null
          contact_channel?: string | null
          created_at?: string
          external_link?: string | null
          id?: string
          intro?: string | null
          name?: string
          region?: string | null
          status?: string
          strength1?: string | null
          strength2?: string | null
          strength3?: string | null
          updated_at?: string
          voucher?: string | null
        }
        Relationships: []
      }
      challenge_baselines: {
        Row: {
          baseline_scores: Json
          challenge_id: string | null
          challenge_started: boolean | null
          created_at: string
          id: string
          recommended_focus: string | null
          risk_areas: string[] | null
          source_test_id: string | null
          source_test_type: string
          strength_areas: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          baseline_scores?: Json
          challenge_id?: string | null
          challenge_started?: boolean | null
          created_at?: string
          id?: string
          recommended_focus?: string | null
          risk_areas?: string[] | null
          source_test_id?: string | null
          source_test_type: string
          strength_areas?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          baseline_scores?: Json
          challenge_id?: string | null
          challenge_started?: boolean | null
          created_at?: string
          id?: string
          recommended_focus?: string | null
          risk_areas?: string[] | null
          source_test_id?: string | null
          source_test_type?: string
          strength_areas?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_posts: {
        Row: {
          created_at: string
          id: string
          is_anonymous: boolean | null
          points_reward: number | null
          problem_description: string
          solution: string | null
          solved_at: string | null
          solved_by: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          points_reward?: number | null
          problem_description: string
          solution?: string | null
          solved_at?: string | null
          solved_by?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          points_reward?: number | null
          problem_description?: string
          solution?: string | null
          solved_at?: string | null
          solved_by?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty: string
          duration_days: number
          id: string
          is_active: boolean
          reward_points: number
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty?: string
          duration_days?: number
          id?: string
          is_active?: boolean
          reward_points?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          duration_days?: number
          id?: string
          is_active?: boolean
          reward_points?: number
          title?: string
          updated_at?: string
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
      child_dev_concern_results: {
        Row: {
          child_age_months: number | null
          created_at: string
          id: string
          interpretation: string | null
          responses: Json
          risk_level: Database["public"]["Enums"]["child_dev_risk_level"]
          score: number
          seven_day_plan: Json
          top_factors: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          child_age_months?: number | null
          created_at?: string
          id?: string
          interpretation?: string | null
          responses?: Json
          risk_level: Database["public"]["Enums"]["child_dev_risk_level"]
          score: number
          seven_day_plan?: Json
          top_factors?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          child_age_months?: number | null
          created_at?: string
          id?: string
          interpretation?: string | null
          responses?: Json
          risk_level?: Database["public"]["Enums"]["child_dev_risk_level"]
          score?: number
          seven_day_plan?: Json
          top_factors?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      churn_risk_analysis: {
        Row: {
          analysis_date: string
          created_at: string | null
          data_growth_score: number | null
          feature_usage_score: number | null
          id: string
          institution_id: string | null
          login_frequency_score: number | null
          overall_risk_score: number | null
          recommended_actions: Json | null
          risk_level: string | null
          support_ticket_score: number | null
        }
        Insert: {
          analysis_date: string
          created_at?: string | null
          data_growth_score?: number | null
          feature_usage_score?: number | null
          id?: string
          institution_id?: string | null
          login_frequency_score?: number | null
          overall_risk_score?: number | null
          recommended_actions?: Json | null
          risk_level?: string | null
          support_ticket_score?: number | null
        }
        Update: {
          analysis_date?: string
          created_at?: string | null
          data_growth_score?: number | null
          feature_usage_score?: number | null
          id?: string
          institution_id?: string | null
          login_frequency_score?: number | null
          overall_risk_score?: number | null
          recommended_actions?: Json | null
          risk_level?: string | null
          support_ticket_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "churn_risk_analysis_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      client_data_consents: {
        Row: {
          client_user_id: string
          consent_note: string | null
          consent_status: string
          created_at: string
          expires_at: string | null
          id: string
          institution_id: string
          revoked_at: string | null
          shared_data_types: string[]
          updated_at: string
        }
        Insert: {
          client_user_id: string
          consent_note?: string | null
          consent_status?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          institution_id: string
          revoked_at?: string | null
          shared_data_types?: string[]
          updated_at?: string
        }
        Update: {
          client_user_id?: string
          consent_note?: string | null
          consent_status?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          institution_id?: string
          revoked_at?: string | null
          shared_data_types?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_data_consents_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      cognitive_assessment_results: {
        Row: {
          assessed_at: string
          assessed_by: string | null
          assessment_type: string
          category_scores: Json | null
          created_at: string
          facility_id: string
          id: string
          max_score: number
          notes: string | null
          resident_id: string
          risk_level: string | null
          score: number
        }
        Insert: {
          assessed_at?: string
          assessed_by?: string | null
          assessment_type: string
          category_scores?: Json | null
          created_at?: string
          facility_id: string
          id?: string
          max_score?: number
          notes?: string | null
          resident_id: string
          risk_level?: string | null
          score: number
        }
        Update: {
          assessed_at?: string
          assessed_by?: string | null
          assessment_type?: string
          category_scores?: Json | null
          created_at?: string
          facility_id?: string
          id?: string
          max_score?: number
          notes?: string | null
          resident_id?: string
          risk_level?: string | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "cognitive_assessment_results_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_assessment_results_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      cognitive_reports: {
        Row: {
          ai_summary: string | null
          created_at: string
          facility_id: string
          generated_by: string | null
          id: string
          report_content: string | null
          report_period: string
          report_type: string
          resident_id: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          facility_id: string
          generated_by?: string | null
          id?: string
          report_content?: string | null
          report_period: string
          report_type?: string
          resident_id: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          facility_id?: string
          generated_by?: string | null
          id?: string
          report_content?: string | null
          report_period?: string
          report_type?: string
          resident_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cognitive_reports_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_reports_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      cognitive_training_records: {
        Row: {
          created_at: string
          difficulty: string
          duration_seconds: number | null
          facility_id: string
          id: string
          max_score: number | null
          notes: string | null
          program_id: string
          program_name: string
          resident_id: string
          score: number | null
          target_area: string
          trained_at: string
          trained_by: string | null
        }
        Insert: {
          created_at?: string
          difficulty?: string
          duration_seconds?: number | null
          facility_id: string
          id?: string
          max_score?: number | null
          notes?: string | null
          program_id: string
          program_name: string
          resident_id: string
          score?: number | null
          target_area: string
          trained_at?: string
          trained_by?: string | null
        }
        Update: {
          created_at?: string
          difficulty?: string
          duration_seconds?: number | null
          facility_id?: string
          id?: string
          max_score?: number | null
          notes?: string | null
          program_id?: string
          program_name?: string
          resident_id?: string
          score?: number | null
          target_area?: string
          trained_at?: string
          trained_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cognitive_training_records_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_training_records_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          anonymous_nickname: string | null
          content: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          likes_count: number | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anonymous_nickname?: string | null
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          likes_count?: number | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anonymous_nickname?: string | null
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          likes_count?: number | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts_public"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts_public"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          is_public: boolean | null
          likes_count: number | null
          media_urls: Json | null
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          media_urls?: Json | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          media_urls?: Json | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      competitor_monitoring: {
        Row: {
          category: string | null
          changes_detected: Json | null
          competitor_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_checked_at: string | null
          monitoring_data: Json | null
          updated_at: string | null
          website_url: string
        }
        Insert: {
          category?: string | null
          changes_detected?: Json | null
          competitor_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_checked_at?: string | null
          monitoring_data?: Json | null
          updated_at?: string | null
          website_url: string
        }
        Update: {
          category?: string | null
          changes_detected?: Json | null
          competitor_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_checked_at?: string | null
          monitoring_data?: Json | null
          updated_at?: string | null
          website_url?: string
        }
        Relationships: []
      }
      concern_storage: {
        Row: {
          analysis_advice: string | null
          analysis_severity: string | null
          analysis_type: string | null
          concern_text: string
          created_at: string
          full_analysis: Json | null
          id: string
          recommended_tests: Json | null
          report_images: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_advice?: string | null
          analysis_severity?: string | null
          analysis_type?: string | null
          concern_text: string
          created_at?: string
          full_analysis?: Json | null
          id?: string
          recommended_tests?: Json | null
          report_images?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_advice?: string | null
          analysis_severity?: string | null
          analysis_type?: string | null
          concern_text?: string
          created_at?: string
          full_analysis?: Json | null
          id?: string
          recommended_tests?: Json | null
          report_images?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      consultation_access_log: {
        Row: {
          access_type: string
          accessed_at: string | null
          accessed_by: string
          consultation_id: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          accessed_by: string
          consultation_id: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          accessed_by?: string
          consultation_id?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      consultation_bookings: {
        Row: {
          booking_date: string
          booking_type: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          channel: string | null
          commission_type: string | null
          confirmed_at: string | null
          created_at: string | null
          credit_used_id: string | null
          crisis_alert_id: string | null
          duration_minutes: number
          end_time: string
          expert_earning: number | null
          expert_id: string
          id: string
          is_emergency: boolean | null
          is_quick_consultation: boolean | null
          meeting_link: string | null
          meeting_platform: string | null
          notes: string | null
          offering_key: string | null
          platform_fee: number | null
          start_time: string
          status: string
          tokens_paid: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_date: string
          booking_type?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          channel?: string | null
          commission_type?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          credit_used_id?: string | null
          crisis_alert_id?: string | null
          duration_minutes?: number
          end_time: string
          expert_earning?: number | null
          expert_id: string
          id?: string
          is_emergency?: boolean | null
          is_quick_consultation?: boolean | null
          meeting_link?: string | null
          meeting_platform?: string | null
          notes?: string | null
          offering_key?: string | null
          platform_fee?: number | null
          start_time: string
          status?: string
          tokens_paid: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_date?: string
          booking_type?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          channel?: string | null
          commission_type?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          credit_used_id?: string | null
          crisis_alert_id?: string | null
          duration_minutes?: number
          end_time?: string
          expert_earning?: number | null
          expert_id?: string
          id?: string
          is_emergency?: boolean | null
          is_quick_consultation?: boolean | null
          meeting_link?: string | null
          meeting_platform?: string | null
          notes?: string | null
          offering_key?: string | null
          platform_fee?: number | null
          start_time?: string
          status?: string
          tokens_paid?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_bookings_crisis_alert_id_fkey"
            columns: ["crisis_alert_id"]
            isOneToOne: false
            referencedRelation: "crisis_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_bookings_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_booking_stats"
            referencedColumns: ["expert_id"]
          },
          {
            foreignKeyName: "consultation_bookings_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_limits: {
        Row: {
          created_at: string | null
          expert_assignment_type: string
          id: string
          monthly_consultations: number
          priority_level: number
          subscription_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expert_assignment_type?: string
          id?: string
          monthly_consultations?: number
          priority_level?: number
          subscription_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expert_assignment_type?: string
          id?: string
          monthly_consultations?: number
          priority_level?: number
          subscription_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      consultation_packages: {
        Row: {
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          name: string
          price_per_session: number
          sessions_count: number
          total_tokens: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price_per_session: number
          sessions_count: number
          total_tokens: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_per_session?: number
          sessions_count?: number
          total_tokens?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      consultation_reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string | null
          expert_id: string
          id: string
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string | null
          expert_id: string
          id?: string
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string | null
          expert_id?: string
          id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "consultation_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_reviews_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_booking_stats"
            referencedColumns: ["expert_id"]
          },
          {
            foreignKeyName: "consultation_reviews_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "expert_booking_stats"
            referencedColumns: ["expert_id"]
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
      conversation_files: {
        Row: {
          conversation_id: string | null
          created_at: string
          duration_minutes: number | null
          file_content: string
          file_name: string
          file_size: number
          file_type: string | null
          id: string
          is_public: boolean | null
          session_title: string | null
          total_messages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          file_content: string
          file_name: string
          file_size: number
          file_type?: string | null
          id?: string
          is_public?: boolean | null
          session_title?: string | null
          total_messages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          file_content?: string
          file_name?: string
          file_size?: number
          file_type?: string | null
          id?: string
          is_public?: boolean | null
          session_title?: string | null
          total_messages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_files_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "memory_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      copilot_conversations: {
        Row: {
          converted_to_track: boolean
          created_at: string
          detected_concerns: string[] | null
          detected_severity: string | null
          detected_target: string | null
          id: string
          is_complete: boolean
          messages: Json
          recommended_route: string | null
          recommended_track: string | null
          session_id: string
          summary: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          converted_to_track?: boolean
          created_at?: string
          detected_concerns?: string[] | null
          detected_severity?: string | null
          detected_target?: string | null
          id?: string
          is_complete?: boolean
          messages?: Json
          recommended_route?: string | null
          recommended_track?: string | null
          session_id: string
          summary?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          converted_to_track?: boolean
          created_at?: string
          detected_concerns?: string[] | null
          detected_severity?: string | null
          detected_target?: string | null
          id?: string
          is_complete?: boolean
          messages?: Json
          recommended_route?: string | null
          recommended_track?: string | null
          session_id?: string
          summary?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      corporate_clients: {
        Row: {
          company_name: string
          company_size: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          contract_value: number | null
          created_at: string
          created_by: string | null
          id: string
          industry: string | null
          notes: string | null
          seats_purchased: number | null
          seats_used: number | null
          status: string
          updated_at: string
        }
        Insert: {
          company_name: string
          company_size?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_value?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string | null
          notes?: string | null
          seats_purchased?: number | null
          seats_used?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          company_size?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_value?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string | null
          notes?: string | null
          seats_purchased?: number | null
          seats_used?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      corporate_user_assignments: {
        Row: {
          assigned_at: string
          corporate_client_id: string
          department: string | null
          id: string
          position: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string
          corporate_client_id: string
          department?: string | null
          id?: string
          position?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string
          corporate_client_id?: string
          department?: string | null
          id?: string
          position?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "corporate_user_assignments_corporate_client_id_fkey"
            columns: ["corporate_client_id"]
            isOneToOne: false
            referencedRelation: "corporate_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crisis_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          expert_connected: boolean | null
          expert_id: string | null
          guardian_notified: boolean | null
          id: string
          institution_notified: boolean | null
          is_resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity_level: string
          trigger_data: Json | null
          trigger_source: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_type?: string
          created_at?: string | null
          expert_connected?: boolean | null
          expert_id?: string | null
          guardian_notified?: boolean | null
          id?: string
          institution_notified?: boolean | null
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity_level?: string
          trigger_data?: Json | null
          trigger_source?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          expert_connected?: boolean | null
          expert_id?: string | null
          guardian_notified?: boolean | null
          id?: string
          institution_notified?: boolean | null
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity_level?: string
          trigger_data?: Json | null
          trigger_source?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crisis_alerts_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_booking_stats"
            referencedColumns: ["expert_id"]
          },
          {
            foreignKeyName: "crisis_alerts_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      cross_promotion_rewards: {
        Row: {
          created_at: string
          id: string
          is_claimed: boolean
          reward_date: string
          reward_tokens: number
          service_name: string
          user_id: string
          verification_code: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_claimed?: boolean
          reward_date?: string
          reward_tokens?: number
          service_name: string
          user_id: string
          verification_code?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_claimed?: boolean
          reward_date?: string
          reward_tokens?: number
          service_name?: string
          user_id?: string
          verification_code?: string | null
        }
        Relationships: []
      }
      curated_education_content: {
        Row: {
          content_type: string | null
          created_at: string | null
          full_content: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          relevance_score: number | null
          source_name: string | null
          source_url: string
          summary: string | null
          tags: string[] | null
          target_age_group: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          full_content?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          relevance_score?: number | null
          source_name?: string | null
          source_url: string
          summary?: string | null
          tags?: string[] | null
          target_age_group?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          full_content?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          relevance_score?: number | null
          source_name?: string | null
          source_url?: string
          summary?: string | null
          tags?: string[] | null
          target_age_group?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_brain_training: {
        Row: {
          assigned_game_name: string
          assigned_game_type: string
          completed_at: string | null
          created_at: string
          game_rotation_index: number
          id: string
          is_completed: boolean
          popup_shown: boolean
          popup_shown_at: string | null
          training_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_game_name: string
          assigned_game_type: string
          completed_at?: string | null
          created_at?: string
          game_rotation_index?: number
          id?: string
          is_completed?: boolean
          popup_shown?: boolean
          popup_shown_at?: string | null
          training_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_game_name?: string
          assigned_game_type?: string
          completed_at?: string | null
          created_at?: string
          game_rotation_index?: number
          id?: string
          is_completed?: boolean
          popup_shown?: boolean
          popup_shown_at?: string | null
          training_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          energy_level: number
          id: string
          mood_score: number
          notes: string | null
          stress_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          checkin_date: string
          created_at?: string
          energy_level: number
          id?: string
          mood_score: number
          notes?: string | null
          stress_level: number
          updated_at?: string
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          energy_level?: number
          id?: string
          mood_score?: number
          notes?: string | null
          stress_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_coaching_email_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_hash: string | null
          metadata: Json | null
          target_url: string | null
          token: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          target_url?: string | null
          token: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          target_url?: string | null
          token?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      daily_coaching_email_log: {
        Row: {
          category_label: string | null
          created_at: string
          day_number: number
          error_message: string | null
          evening_reflection: string | null
          expected_outcome: string | null
          goal_id: string
          id: string
          insight_content: string | null
          key_actions: Json | null
          micro_script: Json | null
          mission_content: string | null
          mission_summary: string | null
          research_base: string | null
          send_date: string
          status: string
          subject: string | null
          user_id: string
          videos: Json | null
          why_today: string | null
        }
        Insert: {
          category_label?: string | null
          created_at?: string
          day_number: number
          error_message?: string | null
          evening_reflection?: string | null
          expected_outcome?: string | null
          goal_id: string
          id?: string
          insight_content?: string | null
          key_actions?: Json | null
          micro_script?: Json | null
          mission_content?: string | null
          mission_summary?: string | null
          research_base?: string | null
          send_date: string
          status?: string
          subject?: string | null
          user_id: string
          videos?: Json | null
          why_today?: string | null
        }
        Update: {
          category_label?: string | null
          created_at?: string
          day_number?: number
          error_message?: string | null
          evening_reflection?: string | null
          expected_outcome?: string | null
          goal_id?: string
          id?: string
          insight_content?: string | null
          key_actions?: Json | null
          micro_script?: Json | null
          mission_content?: string | null
          mission_summary?: string | null
          research_base?: string | null
          send_date?: string
          status?: string
          subject?: string | null
          user_id?: string
          videos?: Json | null
          why_today?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_coaching_email_log_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_coaching_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_coaching_email_tokens: {
        Row: {
          category: string | null
          created_at: string
          day_number: number | null
          has_replacement_char: boolean | null
          has_section_04: boolean | null
          id: string
          recipient_email: string
          render_issues: Json | null
          send_log_message_id: string | null
          token: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          day_number?: number | null
          has_replacement_char?: boolean | null
          has_section_04?: boolean | null
          id?: string
          recipient_email: string
          render_issues?: Json | null
          send_log_message_id?: string | null
          token: string
        }
        Update: {
          category?: string | null
          created_at?: string
          day_number?: number | null
          has_replacement_char?: boolean | null
          has_section_04?: boolean | null
          id?: string
          recipient_email?: string
          render_issues?: Json | null
          send_log_message_id?: string | null
          token?: string
        }
        Relationships: []
      }
      daily_coaching_video_history: {
        Row: {
          category: string | null
          created_at: string
          id: string
          sent_date: string
          user_id: string
          video_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          sent_date?: string
          user_id: string
          video_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          sent_date?: string
          user_id?: string
          video_id?: string
        }
        Relationships: []
      }
      development_goals: {
        Row: {
          category: string
          created_at: string
          current_value: number | null
          deadline: string | null
          description: string | null
          id: string
          status: string | null
          target_value: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          status?: string | null
          target_value: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          status?: string | null
          target_value?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      diary_book_orders: {
        Row: {
          admin_notes: string | null
          binding_type: string
          cover_design: string
          created_at: string
          delivery_address: string
          delivery_name: string
          delivery_phone: string
          delivery_request: string | null
          estimated_price: number
          id: string
          paper_type: string
          payment_status: string
          period_end: string
          period_start: string
          status: string
          total_entries: number
          total_pages: number
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          binding_type?: string
          cover_design?: string
          created_at?: string
          delivery_address: string
          delivery_name: string
          delivery_phone: string
          delivery_request?: string | null
          estimated_price?: number
          id?: string
          paper_type?: string
          payment_status?: string
          period_end: string
          period_start: string
          status?: string
          total_entries?: number
          total_pages?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          binding_type?: string
          cover_design?: string
          created_at?: string
          delivery_address?: string
          delivery_name?: string
          delivery_phone?: string
          delivery_request?: string | null
          estimated_price?: number
          id?: string
          paper_type?: string
          payment_status?: string
          period_end?: string
          period_start?: string
          status?: string
          total_entries?: number
          total_pages?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      diary_generations: {
        Row: {
          character_count: number
          client_name: string | null
          created_at: string
          created_by: string
          generated_content: string
          generated_images: string[] | null
          id: string
          main_activity: string | null
          metadata: Json | null
          report_style: string
          session_number: number | null
          uploaded_images: string[] | null
          voucher_type: string
        }
        Insert: {
          character_count: number
          client_name?: string | null
          created_at?: string
          created_by: string
          generated_content: string
          generated_images?: string[] | null
          id?: string
          main_activity?: string | null
          metadata?: Json | null
          report_style: string
          session_number?: number | null
          uploaded_images?: string[] | null
          voucher_type: string
        }
        Update: {
          character_count?: number
          client_name?: string | null
          created_at?: string
          created_by?: string
          generated_content?: string
          generated_images?: string[] | null
          id?: string
          main_activity?: string | null
          metadata?: Json | null
          report_style?: string
          session_number?: number | null
          uploaded_images?: string[] | null
          voucher_type?: string
        }
        Relationships: []
      }
      diary_likes: {
        Row: {
          created_at: string
          diary_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          diary_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          diary_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diary_likes_diary_id_fkey"
            columns: ["diary_id"]
            isOneToOne: false
            referencedRelation: "memory_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_legacies: {
        Row: {
          attachments: Json | null
          content: string | null
          created_at: string
          encrypted_content: string | null
          id: string
          is_released: boolean | null
          legacy_type: string
          recipients: string[] | null
          release_condition: string | null
          release_date: string | null
          released_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          content?: string | null
          created_at?: string
          encrypted_content?: string | null
          id?: string
          is_released?: boolean | null
          legacy_type: string
          recipients?: string[] | null
          release_condition?: string | null
          release_date?: string | null
          released_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string | null
          created_at?: string
          encrypted_content?: string | null
          id?: string
          is_released?: boolean | null
          legacy_type?: string
          recipients?: string[] | null
          release_condition?: string | null
          release_date?: string | null
          released_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      disability_activity_logs: {
        Row: {
          birth_date: string | null
          created_at: string
          id: string
          logs_data: Json
          month: string | null
          provider_name: string | null
          service_number: string | null
          service_price: number | null
          service_type: string
          therapist_name: string | null
          therapist_phone: string | null
          total_sessions: number
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          id?: string
          logs_data: Json
          month?: string | null
          provider_name?: string | null
          service_number?: string | null
          service_price?: number | null
          service_type: string
          therapist_name?: string | null
          therapist_phone?: string | null
          total_sessions: number
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          id?: string
          logs_data?: Json
          month?: string | null
          provider_name?: string | null
          service_number?: string | null
          service_price?: number | null
          service_type?: string
          therapist_name?: string | null
          therapist_phone?: string | null
          total_sessions?: number
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      dream_records: {
        Row: {
          created_at: string
          dream_content: string
          dream_date: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dream_content: string
          dream_date: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dream_content?: string
          dream_date?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      education_bookmarks: {
        Row: {
          category: string | null
          content_id: string
          created_at: string | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          content_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_bookmarks_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "curated_education_content"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          rate_limit_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          rate_limit_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          rate_limit_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      emotion_diaries: {
        Row: {
          audio_url: string | null
          created_at: string
          detected_emotions: Json
          emotion_score: number | null
          id: string
          mood_rating: number | null
          notes: string | null
          primary_emotion: string | null
          recorded_at: string
          tags: string[] | null
          transcription: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          detected_emotions?: Json
          emotion_score?: number | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          primary_emotion?: string | null
          recorded_at?: string
          tags?: string[] | null
          transcription: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          detected_emotions?: Json
          emotion_score?: number | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          primary_emotion?: string | null
          recorded_at?: string
          tags?: string[] | null
          transcription?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      employee_data_sharing_preferences: {
        Row: {
          allow_crisis_alert: boolean
          consent_version: string
          consented_at: string
          created_at: string
          id: string
          institution_id: string
          revoked_at: string | null
          share_burnout_score: boolean
          share_coaching_usage: boolean
          share_identity: boolean
          share_stress_score: boolean
          share_turnover_risk: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_crisis_alert?: boolean
          consent_version?: string
          consented_at?: string
          created_at?: string
          id?: string
          institution_id: string
          revoked_at?: string | null
          share_burnout_score?: boolean
          share_coaching_usage?: boolean
          share_identity?: boolean
          share_stress_score?: boolean
          share_turnover_risk?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_crisis_alert?: boolean
          consent_version?: string
          consented_at?: string
          created_at?: string
          id?: string
          institution_id?: string
          revoked_at?: string | null
          share_burnout_score?: boolean
          share_coaching_usage?: boolean
          share_identity?: boolean
          share_stress_score?: boolean
          share_turnover_risk?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_data_sharing_preferences_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_organization_links: {
        Row: {
          created_at: string
          department_code: string | null
          employee_code: string | null
          id: string
          institution_id: string
          is_active: boolean
          joined_at: string
          joined_via_code: string | null
          left_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_code?: string | null
          employee_code?: string | null
          id?: string
          institution_id: string
          is_active?: boolean
          joined_at?: string
          joined_via_code?: string | null
          left_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_code?: string | null
          employee_code?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean
          joined_at?: string
          joined_via_code?: string | null
          left_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_organization_links_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_application_access_log: {
        Row: {
          access_reason: string | null
          access_type: string
          accessed_at: string | null
          accessed_by: string
          application_id: string | null
          id: string
          ip_address: string | null
          sensitive_fields_accessed: string[] | null
          user_agent: string | null
        }
        Insert: {
          access_reason?: string | null
          access_type: string
          accessed_at?: string | null
          accessed_by: string
          application_id?: string | null
          id?: string
          ip_address?: string | null
          sensitive_fields_accessed?: string[] | null
          user_agent?: string | null
        }
        Update: {
          access_reason?: string | null
          access_type?: string
          accessed_at?: string | null
          accessed_by?: string
          application_id?: string | null
          id?: string
          ip_address?: string | null
          sensitive_fields_accessed?: string[] | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_application_access_log_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "expert_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_applications: {
        Row: {
          address: string | null
          admin_notes: string | null
          application_reason: string | null
          application_status: string
          bio: string | null
          birth_date: string | null
          certificate_files: string[] | null
          certifications: string[] | null
          consultation_methods: string[]
          created_at: string
          education_background: string[] | null
          email: string
          full_name: string
          gender: string | null
          hourly_rate: number | null
          id: string
          license_number: string | null
          phone: string
          portfolio_files: string[] | null
          privacy_agreed: boolean
          profile_image_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          specializations: string[]
          target_age_groups: string[]
          terms_agreed: boolean
          updated_at: string
          user_id: string
          work_experience: Json | null
          years_experience: number
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          application_reason?: string | null
          application_status?: string
          bio?: string | null
          birth_date?: string | null
          certificate_files?: string[] | null
          certifications?: string[] | null
          consultation_methods?: string[]
          created_at?: string
          education_background?: string[] | null
          email: string
          full_name: string
          gender?: string | null
          hourly_rate?: number | null
          id?: string
          license_number?: string | null
          phone: string
          portfolio_files?: string[] | null
          privacy_agreed?: boolean
          profile_image_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specializations?: string[]
          target_age_groups?: string[]
          terms_agreed?: boolean
          updated_at?: string
          user_id: string
          work_experience?: Json | null
          years_experience?: number
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          application_reason?: string | null
          application_status?: string
          bio?: string | null
          birth_date?: string | null
          certificate_files?: string[] | null
          certifications?: string[] | null
          consultation_methods?: string[]
          created_at?: string
          education_background?: string[] | null
          email?: string
          full_name?: string
          gender?: string | null
          hourly_rate?: number | null
          id?: string
          license_number?: string | null
          phone?: string
          portfolio_files?: string[] | null
          privacy_agreed?: boolean
          profile_image_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specializations?: string[]
          target_age_groups?: string[]
          terms_agreed?: boolean
          updated_at?: string
          user_id?: string
          work_experience?: Json | null
          years_experience?: number
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
            referencedRelation: "expert_booking_stats"
            referencedColumns: ["expert_id"]
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
      expert_consultation_offerings: {
        Row: {
          base_price: number
          channel: string
          created_at: string | null
          description: string | null
          display_order: number | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          is_emergency: boolean | null
          monthly_subscriber_price: number
          name: string
          offering_key: string
          updated_at: string | null
          validity_days: number | null
          yearly_subscriber_price: number
        }
        Insert: {
          base_price: number
          channel: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          is_emergency?: boolean | null
          monthly_subscriber_price: number
          name: string
          offering_key: string
          updated_at?: string | null
          validity_days?: number | null
          yearly_subscriber_price: number
        }
        Update: {
          base_price?: number
          channel?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          is_emergency?: boolean | null
          monthly_subscriber_price?: number
          name?: string
          offering_key?: string
          updated_at?: string | null
          validity_days?: number | null
          yearly_subscriber_price?: number
        }
        Relationships: []
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
            referencedRelation: "expert_booking_stats"
            referencedColumns: ["expert_id"]
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
      expert_hour_packs: {
        Row: {
          created_at: string
          hours_remaining: number
          hours_total: number
          id: string
          pack_size: number
          payment_id: string | null
          price_paid: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hours_remaining: number
          hours_total: number
          id?: string
          pack_size: number
          payment_id?: string | null
          price_paid: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hours_remaining?: number
          hours_total?: number
          id?: string
          pack_size?: number
          payment_id?: string | null
          price_paid?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expert_hour_usages: {
        Row: {
          created_at: string
          delivery_mode: string
          expert_id: string | null
          expert_name: string | null
          hours_used: number
          id: string
          note: string | null
          pack_id: string
          session_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_mode?: string
          expert_id?: string | null
          expert_name?: string | null
          hours_used: number
          id?: string
          note?: string | null
          pack_id: string
          session_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_mode?: string
          expert_id?: string | null
          expert_name?: string | null
          hours_used?: number
          id?: string
          note?: string | null
          pack_id?: string
          session_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_hour_usages_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "expert_hour_packs"
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
      expert_profiles: {
        Row: {
          available_hours: string | null
          created_at: string | null
          experience_years: string | null
          expertise_areas: string[] | null
          id: string
          introduction: string | null
          license_info: string | null
          specialization: string[] | null
          status: string | null
          target_age_groups: string[] | null
          updated_at: string | null
          user_id: string
          workplace: string | null
        }
        Insert: {
          available_hours?: string | null
          created_at?: string | null
          experience_years?: string | null
          expertise_areas?: string[] | null
          id?: string
          introduction?: string | null
          license_info?: string | null
          specialization?: string[] | null
          status?: string | null
          target_age_groups?: string[] | null
          updated_at?: string | null
          user_id: string
          workplace?: string | null
        }
        Update: {
          available_hours?: string | null
          created_at?: string | null
          experience_years?: string | null
          expertise_areas?: string[] | null
          id?: string
          introduction?: string | null
          license_info?: string | null
          specialization?: string[] | null
          status?: string | null
          target_age_groups?: string[] | null
          updated_at?: string | null
          user_id?: string
          workplace?: string | null
        }
        Relationships: []
      }
      expert_queue: {
        Row: {
          created_at: string | null
          current_sessions: number | null
          expert_id: string
          id: string
          is_available: boolean | null
          last_assigned_at: string | null
          max_sessions: number | null
          specialties: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_sessions?: number | null
          expert_id: string
          id?: string
          is_available?: boolean | null
          last_assigned_at?: string | null
          max_sessions?: number | null
          specialties?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_sessions?: number | null
          expert_id?: string
          id?: string
          is_available?: boolean | null
          last_assigned_at?: string | null
          max_sessions?: number | null
          specialties?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expert_report_comments: {
        Row: {
          comment_text: string
          comment_type: string
          created_at: string
          expert_user_id: string
          highlighted_section: string | null
          id: string
          institution_id: string | null
          is_visible_to_parent: boolean
          parent_viewed_at: string | null
          report_history_id: string | null
          report_share_id: string | null
          updated_at: string
        }
        Insert: {
          comment_text: string
          comment_type?: string
          created_at?: string
          expert_user_id: string
          highlighted_section?: string | null
          id?: string
          institution_id?: string | null
          is_visible_to_parent?: boolean
          parent_viewed_at?: string | null
          report_history_id?: string | null
          report_share_id?: string | null
          updated_at?: string
        }
        Update: {
          comment_text?: string
          comment_type?: string
          created_at?: string
          expert_user_id?: string
          highlighted_section?: string | null
          id?: string
          institution_id?: string | null
          is_visible_to_parent?: boolean
          parent_viewed_at?: string | null
          report_history_id?: string | null
          report_share_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_report_comments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_reviews: {
        Row: {
          consultation_id: string | null
          created_at: string
          expert_id: string
          id: string
          is_anonymous: boolean | null
          is_public: boolean | null
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string
          expert_id: string
          id?: string
          is_anonymous?: boolean | null
          is_public?: boolean | null
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consultation_id?: string | null
          created_at?: string
          expert_id?: string
          id?: string
          is_anonymous?: boolean | null
          is_public?: boolean | null
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expert_schedules: {
        Row: {
          buffer_minutes: number | null
          created_at: string | null
          day_of_week: number
          end_time: string
          expert_id: string
          id: string
          is_available: boolean | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          buffer_minutes?: number | null
          created_at?: string | null
          day_of_week: number
          end_time: string
          expert_id: string
          id?: string
          is_available?: boolean | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          buffer_minutes?: number | null
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          expert_id?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_schedules_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_booking_stats"
            referencedColumns: ["expert_id"]
          },
          {
            foreignKeyName: "expert_schedules_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_time_off: {
        Row: {
          created_at: string | null
          end_date: string
          expert_id: string
          id: string
          reason: string | null
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          expert_id: string
          id?: string
          reason?: string | null
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          expert_id?: string
          id?: string
          reason?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_time_off_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_booking_stats"
            referencedColumns: ["expert_id"]
          },
          {
            foreignKeyName: "expert_time_off_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_views: {
        Row: {
          expert_id: string
          id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          expert_id: string
          id?: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          expert_id?: string
          id?: string
          user_id?: string
          viewed_at?: string
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
          featured_order: number | null
          full_name: string
          hourly_rate: number
          id: string
          is_available: boolean | null
          is_featured: boolean | null
          is_verified: boolean | null
          kakao_link: string | null
          languages: string[] | null
          license_number: string | null
          meeting_handle: string | null
          meeting_room_url: string | null
          meeting_tool_note: string | null
          preferred_meeting_tool: string
          professional_title: string
          profile_image_url: string | null
          specializations: string[]
          total_sessions: number | null
          updated_at: string | null
          user_id: string | null
          years_experience: number
        }
        Insert: {
          average_rating?: number | null
          bio?: string | null
          certifications?: string[] | null
          consultation_methods?: string[] | null
          created_at?: string | null
          education_background?: string[] | null
          featured_order?: number | null
          full_name: string
          hourly_rate?: number
          id?: string
          is_available?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          kakao_link?: string | null
          languages?: string[] | null
          license_number?: string | null
          meeting_handle?: string | null
          meeting_room_url?: string | null
          meeting_tool_note?: string | null
          preferred_meeting_tool?: string
          professional_title: string
          profile_image_url?: string | null
          specializations?: string[]
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number
        }
        Update: {
          average_rating?: number | null
          bio?: string | null
          certifications?: string[] | null
          consultation_methods?: string[] | null
          created_at?: string | null
          education_background?: string[] | null
          featured_order?: number | null
          full_name?: string
          hourly_rate?: number
          id?: string
          is_available?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          kakao_link?: string | null
          languages?: string[] | null
          license_number?: string | null
          meeting_handle?: string | null
          meeting_room_url?: string | null
          meeting_tool_note?: string | null
          preferred_meeting_tool?: string
          professional_title?: string
          profile_image_url?: string | null
          specializations?: string[]
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number
        }
        Relationships: []
      }
      facilities: {
        Row: {
          address: string | null
          capacity: number | null
          created_at: string | null
          email: string | null
          facility_type: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          registration_number: string | null
          settings: Json | null
          subscription_end: string | null
          subscription_start: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          email?: string | null
          facility_type?: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          registration_number?: string | null
          settings?: Json | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          email?: string | null
          facility_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          registration_number?: string | null
          settings?: Json | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      facility_audit_checks: {
        Row: {
          ai_generated_doc: string | null
          check_date: string
          checked_by: string | null
          checklist_item_id: string | null
          created_at: string
          evidence_urls: string[] | null
          facility_id: string | null
          id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ai_generated_doc?: string | null
          check_date?: string
          checked_by?: string | null
          checklist_item_id?: string | null
          created_at?: string
          evidence_urls?: string[] | null
          facility_id?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ai_generated_doc?: string | null
          check_date?: string
          checked_by?: string | null
          checklist_item_id?: string | null
          created_at?: string
          evidence_urls?: string[] | null
          facility_id?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_audit_checks_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "audit_checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_audit_checks_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_audit_item_status: {
        Row: {
          audit_item_id: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          document_url: string | null
          facility_id: string | null
          id: string
          is_completed: boolean | null
          last_checked_at: string | null
          next_due_date: string | null
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          audit_item_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          document_url?: string | null
          facility_id?: string | null
          id?: string
          is_completed?: boolean | null
          last_checked_at?: string | null
          next_due_date?: string | null
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          audit_item_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          document_url?: string | null
          facility_id?: string | null
          id?: string
          is_completed?: boolean | null
          last_checked_at?: string | null
          next_due_date?: string | null
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facility_audit_item_status_audit_item_id_fkey"
            columns: ["audit_item_id"]
            isOneToOne: false
            referencedRelation: "voucher_audit_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_audit_item_status_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_audit_schedules: {
        Row: {
          audit_name: string
          audit_type: string
          auditor_contact: string | null
          auditor_organization: string | null
          completed_at: string | null
          created_at: string
          facility_id: string
          id: string
          notes: string | null
          result_summary: string | null
          scheduled_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          audit_name: string
          audit_type: string
          auditor_contact?: string | null
          auditor_organization?: string | null
          completed_at?: string | null
          created_at?: string
          facility_id: string
          id?: string
          notes?: string | null
          result_summary?: string | null
          scheduled_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          audit_name?: string
          audit_type?: string
          auditor_contact?: string | null
          auditor_organization?: string | null
          completed_at?: string | null
          created_at?: string
          facility_id?: string
          id?: string
          notes?: string | null
          result_summary?: string | null
          scheduled_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_audit_schedules_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_staff: {
        Row: {
          created_at: string | null
          facility_id: string
          id: string
          is_active: boolean | null
          joined_at: string | null
          position: string | null
          role: Database["public"]["Enums"]["facility_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          facility_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["facility_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          facility_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["facility_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_staff_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_staff_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          facility_id: string
          id: string
          invitation_code: string
          invited_by: string | null
          name: string
          position: string | null
          role: Database["public"]["Enums"]["facility_role"]
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          facility_id: string
          id?: string
          invitation_code?: string
          invited_by?: string | null
          name: string
          position?: string | null
          role?: Database["public"]["Enums"]["facility_role"]
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          facility_id?: string
          id?: string
          invitation_code?: string
          invited_by?: string | null
          name?: string
          position?: string | null
          role?: Database["public"]["Enums"]["facility_role"]
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_staff_invitations_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_vouchers: {
        Row: {
          created_at: string
          expires_at: string | null
          facility_id: string
          id: string
          is_active: boolean | null
          notes: string | null
          registered_at: string | null
          registration_number: string | null
          voucher_type_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          facility_id: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          registered_at?: string | null
          registration_number?: string | null
          voucher_type_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          facility_id?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          registered_at?: string | null
          registration_number?: string | null
          voucher_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_vouchers_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_vouchers_voucher_type_id_fkey"
            columns: ["voucher_type_id"]
            isOneToOne: false
            referencedRelation: "voucher_types"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_check_results: {
        Row: {
          check_status: string
          checked_at: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          post_id: string | null
          sources: Json | null
          summary: string | null
        }
        Insert: {
          check_status: string
          checked_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          sources?: Json | null
          summary?: string | null
        }
        Update: {
          check_status?: string
          checked_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          sources?: Json | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fact_check_results_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_check_results_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts_public"
            referencedColumns: ["id"]
          },
        ]
      }
      family_connections: {
        Row: {
          connected_user_id: string
          created_at: string
          id: string
          notes: string | null
          relationship: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          connected_user_id: string
          created_at?: string
          id?: string
          notes?: string | null
          relationship: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          connected_user_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          relationship?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      family_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          expires_at: string
          family_relationship: string
          id: string
          invitation_code: string
          invitation_message: string | null
          invited_email: string
          invited_phone: string | null
          inviter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          expires_at?: string
          family_relationship: string
          id?: string
          invitation_code: string
          invitation_message?: string | null
          invited_email: string
          invited_phone?: string | null
          inviter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          expires_at?: string
          family_relationship?: string
          id?: string
          invitation_code?: string
          invitation_message?: string | null
          invited_email?: string
          invited_phone?: string | null
          inviter_id?: string
          status?: string
          updated_at?: string
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
      family_memory_reactions: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          reaction_type: string | null
          shared_memory_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          reaction_type?: string | null
          shared_memory_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          reaction_type?: string | null
          shared_memory_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_memory_reactions_shared_memory_id_fkey"
            columns: ["shared_memory_id"]
            isOneToOne: false
            referencedRelation: "family_shared_memories"
            referencedColumns: ["id"]
          },
        ]
      }
      family_shared_memories: {
        Row: {
          can_comment: boolean | null
          can_react: boolean | null
          id: string
          memory_id: string
          shared_at: string
          shared_by: string
          shared_with: string[]
        }
        Insert: {
          can_comment?: boolean | null
          can_react?: boolean | null
          id?: string
          memory_id: string
          shared_at?: string
          shared_by: string
          shared_with?: string[]
        }
        Update: {
          can_comment?: boolean | null
          can_react?: boolean | null
          id?: string
          memory_id?: string
          shared_at?: string
          shared_by?: string
          shared_with?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "family_shared_memories_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memory_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_access_log: {
        Row: {
          access_reason: string | null
          access_type: string
          accessed_at: string | null
          accessed_by: string
          accessed_record_id: string
          accessed_table: string
          id: string
          ip_address: string | null
          sensitive_fields_accessed: string[] | null
          user_agent: string | null
        }
        Insert: {
          access_reason?: string | null
          access_type: string
          accessed_at?: string | null
          accessed_by: string
          accessed_record_id: string
          accessed_table: string
          id?: string
          ip_address?: string | null
          sensitive_fields_accessed?: string[] | null
          user_agent?: string | null
        }
        Update: {
          access_reason?: string | null
          access_type?: string
          accessed_at?: string | null
          accessed_by?: string
          accessed_record_id?: string
          accessed_table?: string
          id?: string
          ip_address?: string | null
          sensitive_fields_accessed?: string[] | null
          user_agent?: string | null
        }
        Relationships: []
      }
      financial_data_access_log: {
        Row: {
          access_reason: string | null
          access_type: string
          accessed_at: string | null
          accessed_by: string
          accessed_record_id: string
          accessed_table: string
          id: string
          ip_address: string | null
          sensitive_fields_accessed: string[] | null
          user_agent: string | null
        }
        Insert: {
          access_reason?: string | null
          access_type: string
          accessed_at?: string | null
          accessed_by: string
          accessed_record_id: string
          accessed_table: string
          id?: string
          ip_address?: string | null
          sensitive_fields_accessed?: string[] | null
          user_agent?: string | null
        }
        Update: {
          access_reason?: string | null
          access_type?: string
          accessed_at?: string | null
          accessed_by?: string
          accessed_record_id?: string
          accessed_table?: string
          id?: string
          ip_address?: string | null
          sensitive_fields_accessed?: string[] | null
          user_agent?: string | null
        }
        Relationships: []
      }
      government_policies: {
        Row: {
          age_range: string | null
          announcement_date: string | null
          application_end_date: string | null
          application_process: string | null
          application_start_date: string | null
          budget_amount: number | null
          contact_info: Json | null
          created_at: string
          id: string
          is_active: boolean
          ministry: string | null
          policy_details: string
          policy_name: string
          policy_type: string
          region: string | null
          related_links: string[] | null
          required_documents: string[] | null
          support_period: string | null
          target_group: string
          updated_at: string
        }
        Insert: {
          age_range?: string | null
          announcement_date?: string | null
          application_end_date?: string | null
          application_process?: string | null
          application_start_date?: string | null
          budget_amount?: number | null
          contact_info?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          ministry?: string | null
          policy_details: string
          policy_name: string
          policy_type: string
          region?: string | null
          related_links?: string[] | null
          required_documents?: string[] | null
          support_period?: string | null
          target_group: string
          updated_at?: string
        }
        Update: {
          age_range?: string | null
          announcement_date?: string | null
          application_end_date?: string | null
          application_process?: string | null
          application_start_date?: string | null
          budget_amount?: number | null
          contact_info?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          ministry?: string | null
          policy_details?: string
          policy_name?: string
          policy_type?: string
          region?: string | null
          related_links?: string[] | null
          required_documents?: string[] | null
          support_period?: string | null
          target_group?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_participants: {
        Row: {
          avatar_url: string | null
          id: string
          is_speaking: boolean | null
          joined_at: string
          last_seen_at: string
          position_x: number | null
          position_y: number | null
          position_z: number | null
          session_id: string
          user_id: string
          user_name: string
        }
        Insert: {
          avatar_url?: string | null
          id?: string
          is_speaking?: boolean | null
          joined_at?: string
          last_seen_at?: string
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          session_id: string
          user_id: string
          user_name: string
        }
        Update: {
          avatar_url?: string | null
          id?: string
          is_speaking?: boolean | null
          joined_at?: string
          last_seen_at?: string
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          session_id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "group_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      group_sessions: {
        Row: {
          created_at: string
          host_user_id: string
          id: string
          is_active: boolean | null
          max_participants: number | null
          room_type: string
          session_name: string
        }
        Insert: {
          created_at?: string
          host_user_id: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          room_type: string
          session_name: string
        }
        Update: {
          created_at?: string
          host_user_id?: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          room_type?: string
          session_name?: string
        }
        Relationships: []
      }
      growth_stories: {
        Row: {
          after_story: string
          before_story: string
          category: string | null
          created_at: string
          id: string
          is_anonymous: boolean | null
          likes_count: number | null
          media_files: string[] | null
          media_types: string[] | null
          media_urls: Json | null
          title: string
          transformation_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          after_story: string
          before_story: string
          category?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          likes_count?: number | null
          media_files?: string[] | null
          media_types?: string[] | null
          media_urls?: Json | null
          title: string
          transformation_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          after_story?: string
          before_story?: string
          category?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          likes_count?: number | null
          media_files?: string[] | null
          media_types?: string[] | null
          media_urls?: Json | null
          title?: string
          transformation_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      health_diaries: {
        Row: {
          ai_insights: Json | null
          created_at: string | null
          entry_date: string
          exercise_minutes: number | null
          health_status: string | null
          id: string
          medications: string[] | null
          mood: string | null
          notes: string | null
          policy_id: string | null
          sleep_hours: number | null
          symptoms: string[] | null
          updated_at: string | null
          user_id: string
          water_intake: number | null
        }
        Insert: {
          ai_insights?: Json | null
          created_at?: string | null
          entry_date?: string
          exercise_minutes?: number | null
          health_status?: string | null
          id?: string
          medications?: string[] | null
          mood?: string | null
          notes?: string | null
          policy_id?: string | null
          sleep_hours?: number | null
          symptoms?: string[] | null
          updated_at?: string | null
          user_id: string
          water_intake?: number | null
        }
        Update: {
          ai_insights?: Json | null
          created_at?: string | null
          entry_date?: string
          exercise_minutes?: number | null
          health_status?: string | null
          id?: string
          medications?: string[] | null
          mood?: string | null
          notes?: string | null
          policy_id?: string | null
          sleep_hours?: number | null
          symptoms?: string[] | null
          updated_at?: string | null
          user_id?: string
          water_intake?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_diaries_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "insurance_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      home_service_bookings: {
        Row: {
          booking_date: string
          child_age: number
          child_birth_date: string | null
          child_name: string
          confirmed_at: string | null
          contact_phone: string
          created_at: string
          emergency_contact: string | null
          estimated_cost: number
          id: string
          notes: string | null
          payment_method: string
          preferred_schedule: Json | null
          self_pay_amount: number | null
          service_address: string
          service_id: string
          special_requests: string | null
          status: string
          updated_at: string
          user_id: string
          voucher_coverage: number | null
          voucher_id: string | null
        }
        Insert: {
          booking_date?: string
          child_age: number
          child_birth_date?: string | null
          child_name: string
          confirmed_at?: string | null
          contact_phone: string
          created_at?: string
          emergency_contact?: string | null
          estimated_cost?: number
          id?: string
          notes?: string | null
          payment_method?: string
          preferred_schedule?: Json | null
          self_pay_amount?: number | null
          service_address: string
          service_id: string
          special_requests?: string | null
          status?: string
          updated_at?: string
          user_id: string
          voucher_coverage?: number | null
          voucher_id?: string | null
        }
        Update: {
          booking_date?: string
          child_age?: number
          child_birth_date?: string | null
          child_name?: string
          confirmed_at?: string | null
          contact_phone?: string
          created_at?: string
          emergency_contact?: string | null
          estimated_cost?: number
          id?: string
          notes?: string | null
          payment_method?: string
          preferred_schedule?: Json | null
          self_pay_amount?: number | null
          service_address?: string
          service_id?: string
          special_requests?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          voucher_coverage?: number | null
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_home_service_bookings_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "institution_home_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_home_service_bookings_voucher"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "user_vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      home_service_sessions: {
        Row: {
          actual_duration: number | null
          booking_id: string
          created_at: string
          end_time: string | null
          id: string
          parent_signature: string | null
          provider_signature: string | null
          self_pay_used: number | null
          session_date: string
          session_notes: string | null
          start_time: string
          status: string
          updated_at: string
          voucher_used: number | null
        }
        Insert: {
          actual_duration?: number | null
          booking_id: string
          created_at?: string
          end_time?: string | null
          id?: string
          parent_signature?: string | null
          provider_signature?: string | null
          self_pay_used?: number | null
          session_date: string
          session_notes?: string | null
          start_time: string
          status?: string
          updated_at?: string
          voucher_used?: number | null
        }
        Update: {
          actual_duration?: number | null
          booking_id?: string
          created_at?: string
          end_time?: string | null
          id?: string
          parent_signature?: string | null
          provider_signature?: string | null
          self_pay_used?: number | null
          session_date?: string
          session_notes?: string | null
          start_time?: string
          status?: string
          updated_at?: string
          voucher_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_home_service_sessions_booking"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "home_service_bookings"
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
            referencedRelation: "partner_institutions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_bookings: {
        Row: {
          booking_date: string
          consultation_type: string
          created_at: string
          duration_minutes: number
          end_time: string
          id: string
          institution_id: string
          institution_name: string
          notes: string | null
          start_time: string
          status: string
          updated_at: string
          user_id: string
          user_name: string
          user_phone: string
        }
        Insert: {
          booking_date: string
          consultation_type?: string
          created_at?: string
          duration_minutes?: number
          end_time: string
          id?: string
          institution_id: string
          institution_name: string
          notes?: string | null
          start_time: string
          status?: string
          updated_at?: string
          user_id: string
          user_name: string
          user_phone: string
        }
        Update: {
          booking_date?: string
          consultation_type?: string
          created_at?: string
          duration_minutes?: number
          end_time?: string
          id?: string
          institution_id?: string
          institution_name?: string
          notes?: string | null
          start_time?: string
          status?: string
          updated_at?: string
          user_id?: string
          user_name?: string
          user_phone?: string
        }
        Relationships: []
      }
      institution_client_links: {
        Row: {
          assigned_therapist: string | null
          client_label: string | null
          client_user_id: string
          consent_id: string | null
          created_at: string
          id: string
          institution_id: string
          internal_notes: string | null
          last_viewed_at: string | null
          priority: string | null
          tags: string[] | null
          treatment_status: string | null
          updated_at: string
        }
        Insert: {
          assigned_therapist?: string | null
          client_label?: string | null
          client_user_id: string
          consent_id?: string | null
          created_at?: string
          id?: string
          institution_id: string
          internal_notes?: string | null
          last_viewed_at?: string | null
          priority?: string | null
          tags?: string[] | null
          treatment_status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_therapist?: string | null
          client_label?: string | null
          client_user_id?: string
          consent_id?: string | null
          created_at?: string
          id?: string
          institution_id?: string
          internal_notes?: string | null
          last_viewed_at?: string | null
          priority?: string | null
          tags?: string[] | null
          treatment_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_client_links_consent_id_fkey"
            columns: ["consent_id"]
            isOneToOne: false
            referencedRelation: "client_data_consents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_client_links_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_content_calendar: {
        Row: {
          channel: string
          content_type: string
          created_at: string
          date: string
          id: string
          institution_id: string | null
          notes: string | null
          status: string | null
          topic: string
          updated_at: string
          week_number: number
        }
        Insert: {
          channel: string
          content_type: string
          created_at?: string
          date: string
          id?: string
          institution_id?: string | null
          notes?: string | null
          status?: string | null
          topic: string
          updated_at?: string
          week_number: number
        }
        Update: {
          channel?: string
          content_type?: string
          created_at?: string
          date?: string
          id?: string
          institution_id?: string | null
          notes?: string | null
          status?: string | null
          topic?: string
          updated_at?: string
          week_number?: number
        }
        Relationships: []
      }
      institution_data_access_logs: {
        Row: {
          access_type: string
          accessed_by: string
          client_user_id: string
          created_at: string
          data_types_accessed: string[] | null
          id: string
          institution_id: string
          ip_address: string | null
        }
        Insert: {
          access_type: string
          accessed_by: string
          client_user_id: string
          created_at?: string
          data_types_accessed?: string[] | null
          id?: string
          institution_id: string
          ip_address?: string | null
        }
        Update: {
          access_type?: string
          accessed_by?: string
          client_user_id?: string
          created_at?: string
          data_types_accessed?: string[] | null
          id?: string
          institution_id?: string
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_data_access_logs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_data_metrics: {
        Row: {
          calculated_data_value: number | null
          created_at: string | null
          health_score_avg: number | null
          id: string
          improvement_rate: number | null
          institution_id: string | null
          metric_date: string
          observations_count: number | null
          residents_active: number | null
        }
        Insert: {
          calculated_data_value?: number | null
          created_at?: string | null
          health_score_avg?: number | null
          id?: string
          improvement_rate?: number | null
          institution_id?: string | null
          metric_date: string
          observations_count?: number | null
          residents_active?: number | null
        }
        Update: {
          calculated_data_value?: number | null
          created_at?: string | null
          health_score_avg?: number | null
          id?: string
          improvement_rate?: number | null
          institution_id?: string | null
          metric_date?: string
          observations_count?: number | null
          residents_active?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_data_metrics_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
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
            referencedRelation: "partner_institutions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_home_services: {
        Row: {
          created_at: string
          description: string | null
          id: string
          institution_id: string
          is_active: boolean
          max_travel_distance: number | null
          price_per_session: number
          requirements: Json | null
          service_area: Json | null
          service_name: string
          service_type: string
          session_duration: number
          target_age_max: number | null
          target_age_min: number | null
          updated_at: string
          voucher_types_accepted: string[] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          institution_id: string
          is_active?: boolean
          max_travel_distance?: number | null
          price_per_session?: number
          requirements?: Json | null
          service_area?: Json | null
          service_name: string
          service_type: string
          session_duration?: number
          target_age_max?: number | null
          target_age_min?: number | null
          updated_at?: string
          voucher_types_accepted?: string[] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean
          max_travel_distance?: number | null
          price_per_session?: number
          requirements?: Json | null
          service_area?: Json | null
          service_name?: string
          service_type?: string
          session_duration?: number
          target_age_max?: number | null
          target_age_min?: number | null
          updated_at?: string
          voucher_types_accepted?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_institution_home_services_institution"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
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
            referencedRelation: "partner_institutions_public"
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
            referencedRelation: "partner_institutions_public"
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
            referencedRelation: "partner_institutions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_profiles: {
        Row: {
          created_at: string | null
          department: string | null
          expected_user_count: string | null
          id: string
          institution_name: string | null
          institution_type: string | null
          role: string | null
          service_types: string[] | null
          status: string | null
          target_population: string[] | null
          updated_at: string | null
          usage_description: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          expected_user_count?: string | null
          id?: string
          institution_name?: string | null
          institution_type?: string | null
          role?: string | null
          service_types?: string[] | null
          status?: string | null
          target_population?: string[] | null
          updated_at?: string | null
          usage_description?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          expected_user_count?: string | null
          id?: string
          institution_name?: string | null
          institution_type?: string | null
          role?: string | null
          service_types?: string[] | null
          status?: string | null
          target_population?: string[] | null
          updated_at?: string | null
          usage_description?: string | null
          user_id?: string
        }
        Relationships: []
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
            referencedRelation: "partner_institutions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_treatment_reports: {
        Row: {
          ai_model_used: string | null
          client_user_id: string
          created_at: string
          generated_by: string
          html_content: string | null
          id: string
          institution_id: string
          report_content: string | null
          report_title: string
          report_type: string
          source_data_summary: Json | null
          status: string | null
          updated_at: string
        }
        Insert: {
          ai_model_used?: string | null
          client_user_id: string
          created_at?: string
          generated_by: string
          html_content?: string | null
          id?: string
          institution_id: string
          report_content?: string | null
          report_title: string
          report_type?: string
          source_data_summary?: Json | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          ai_model_used?: string | null
          client_user_id?: string
          created_at?: string
          generated_by?: string
          html_content?: string | null
          id?: string
          institution_id?: string
          report_content?: string | null
          report_title?: string
          report_type?: string
          source_data_summary?: Json | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_treatment_reports_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
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
      insurance_policies: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          policy_number: string | null
          policy_type: string
          premium_amount: number | null
          provider: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          policy_number?: string | null
          policy_type: string
          premium_amount?: number | null
          provider?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          policy_number?: string | null
          policy_type?: string
          premium_amount?: number | null
          provider?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
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
      invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          inviter_id: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          inviter_id: string
          role?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          inviter_id?: string
          role?: string
          token?: string
        }
        Relationships: []
      }
      kindergarten_action_plans: {
        Row: {
          ai_summary: string | null
          case_id: string
          created_at: string
          domain_scores: Json
          generated_at: string
          id: string
          improvement_status: string | null
          parent_actions: Json
          parent_pdf_url: string | null
          rci_changes: Json | null
          round_label: string
          teacher_actions: Json
          teacher_pdf_url: string | null
        }
        Insert: {
          ai_summary?: string | null
          case_id: string
          created_at?: string
          domain_scores?: Json
          generated_at?: string
          id?: string
          improvement_status?: string | null
          parent_actions?: Json
          parent_pdf_url?: string | null
          rci_changes?: Json | null
          round_label: string
          teacher_actions?: Json
          teacher_pdf_url?: string | null
        }
        Update: {
          ai_summary?: string | null
          case_id?: string
          created_at?: string
          domain_scores?: Json
          generated_at?: string
          id?: string
          improvement_status?: string | null
          parent_actions?: Json
          parent_pdf_url?: string | null
          rci_changes?: Json | null
          round_label?: string
          teacher_actions?: Json
          teacher_pdf_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kindergarten_action_plans_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "kindergarten_consultation_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      kindergarten_assessment_invites: {
        Row: {
          case_id: string
          completed_at: string | null
          computed_scores: Json | null
          created_at: string
          curated_assessment: Json
          expires_at: string
          id: string
          invite_token: string
          opened_at: string | null
          parent_responses: Json | null
          round_label: string
          sent_at: string
          status: string
        }
        Insert: {
          case_id: string
          completed_at?: string | null
          computed_scores?: Json | null
          created_at?: string
          curated_assessment?: Json
          expires_at?: string
          id?: string
          invite_token?: string
          opened_at?: string | null
          parent_responses?: Json | null
          round_label: string
          sent_at?: string
          status?: string
        }
        Update: {
          case_id?: string
          completed_at?: string | null
          computed_scores?: Json | null
          created_at?: string
          curated_assessment?: Json
          expires_at?: string
          id?: string
          invite_token?: string
          opened_at?: string | null
          parent_responses?: Json | null
          round_label?: string
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "kindergarten_assessment_invites_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "kindergarten_consultation_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      kindergarten_consultation_cases: {
        Row: {
          child_age_months: number
          child_gender: string | null
          child_nickname: string
          classroom_name: string | null
          consultation_focus: string[] | null
          created_at: string
          id: string
          institution_id: string
          notes: string | null
          scheduled_consultation_at: string | null
          status: string
          teacher_user_id: string
          updated_at: string
        }
        Insert: {
          child_age_months: number
          child_gender?: string | null
          child_nickname: string
          classroom_name?: string | null
          consultation_focus?: string[] | null
          created_at?: string
          id?: string
          institution_id: string
          notes?: string | null
          scheduled_consultation_at?: string | null
          status?: string
          teacher_user_id: string
          updated_at?: string
        }
        Update: {
          child_age_months?: number
          child_gender?: string | null
          child_nickname?: string
          classroom_name?: string | null
          consultation_focus?: string[] | null
          created_at?: string
          id?: string
          institution_id?: string
          notes?: string | null
          scheduled_consultation_at?: string | null
          status?: string
          teacher_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kindergarten_consultation_cases_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "kindergarten_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      kindergarten_institutions: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          institution_name: string
          institution_type: string
          is_active: boolean | null
          is_verified: boolean | null
          license_number: string | null
          owner_user_id: string
          region: string | null
          total_children: number | null
          total_teachers: number | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          institution_name: string
          institution_type: string
          is_active?: boolean | null
          is_verified?: boolean | null
          license_number?: string | null
          owner_user_id: string
          region?: string | null
          total_children?: number | null
          total_teachers?: number | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          institution_name?: string
          institution_type?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          license_number?: string | null
          owner_user_id?: string
          region?: string | null
          total_children?: number | null
          total_teachers?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          center_id: string | null
          child_age: string | null
          concern: string | null
          created_at: string
          id: string
          parent_name: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          center_id?: string | null
          child_age?: string | null
          concern?: string | null
          created_at?: string
          id?: string
          parent_name?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          center_id?: string | null
          child_age?: string | null
          concern?: string | null
          created_at?: string
          id?: string
          parent_name?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_memories: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_delivered: boolean | null
          media_type: string | null
          media_url: string | null
          recipients: Json | null
          scheduled_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_delivered?: boolean | null
          media_type?: string | null
          media_url?: string | null
          recipients?: Json | null
          scheduled_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_delivered?: boolean | null
          media_type?: string | null
          media_url?: string | null
          recipients?: Json | null
          scheduled_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      legacy_settings: {
        Row: {
          auto_deliver: boolean | null
          beneficiaries: Json
          created_at: string | null
          custom_message: string | null
          delivery_format: string | null
          id: string
          inactivity_days: number | null
          include_health_data: boolean | null
          include_memories: boolean | null
          include_voice_messages: boolean | null
          policy_id: string | null
          status: string | null
          trigger_condition: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_deliver?: boolean | null
          beneficiaries?: Json
          created_at?: string | null
          custom_message?: string | null
          delivery_format?: string | null
          id?: string
          inactivity_days?: number | null
          include_health_data?: boolean | null
          include_memories?: boolean | null
          include_voice_messages?: boolean | null
          policy_id?: string | null
          status?: string | null
          trigger_condition?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_deliver?: boolean | null
          beneficiaries?: Json
          created_at?: string | null
          custom_message?: string | null
          delivery_format?: string | null
          id?: string
          inactivity_days?: number | null
          include_health_data?: boolean | null
          include_memories?: boolean | null
          include_voice_messages?: boolean | null
          policy_id?: string | null
          status?: string | null
          trigger_condition?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legacy_settings_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "insurance_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_trustees: {
        Row: {
          accepted_at: string | null
          id: string
          invited_at: string
          permissions: Json | null
          relationship: string | null
          status: string | null
          trustee_email: string | null
          trustee_name: string
          trustee_user_id: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          invited_at?: string
          permissions?: Json | null
          relationship?: string | null
          status?: string | null
          trustee_email?: string | null
          trustee_name: string
          trustee_user_id?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          invited_at?: string
          permissions?: Json | null
          relationship?: string | null
          status?: string | null
          trustee_email?: string | null
          trustee_name?: string
          trustee_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      legal_disclaimer_views: {
        Row: {
          id: string
          ip_address: unknown
          page_url: string
          user_agent: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown
          page_url: string
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown
          page_url?: string
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: []
      }
      life_achievement_badges: {
        Row: {
          badge_type: string
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          rarity: string
          unlock_condition: Json
        }
        Insert: {
          badge_type: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          rarity?: string
          unlock_condition: Json
        }
        Update: {
          badge_type?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          rarity?: string
          unlock_condition?: Json
        }
        Relationships: []
      }
      life_achievement_goal_progress: {
        Row: {
          created_at: string | null
          goal_id: string
          id: string
          note: string | null
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          goal_id: string
          id?: string
          note?: string | null
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          goal_id?: string
          id?: string
          note?: string | null
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "life_achievement_goal_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "life_achievement_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      life_achievement_goals: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string | null
          goal_text: string
          id: string
          is_completed: boolean | null
          priority: string | null
          result_id: string | null
          target_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          goal_text: string
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          result_id?: string | null
          target_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          goal_text?: string
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          result_id?: string | null
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "life_achievement_goals_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "life_achievement_results"
            referencedColumns: ["id"]
          },
        ]
      }
      life_achievement_invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          invite_code: string
          invited_email: string
          invited_user_id: string | null
          inviter_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invite_code: string
          invited_email: string
          invited_user_id?: string | null
          inviter_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invite_code?: string
          invited_email?: string
          invited_user_id?: string | null
          inviter_id?: string
          status?: string
        }
        Relationships: []
      }
      life_achievement_leaderboard: {
        Row: {
          best_score: number
          created_at: string | null
          id: string
          improvement: number | null
          rank: number | null
          total_tests: number
          updated_at: string | null
          user_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          best_score: number
          created_at?: string | null
          id?: string
          improvement?: number | null
          rank?: number | null
          total_tests?: number
          updated_at?: string | null
          user_id: string
          week_end: string
          week_start: string
        }
        Update: {
          best_score?: number
          created_at?: string | null
          id?: string
          improvement?: number | null
          rank?: number | null
          total_tests?: number
          updated_at?: string | null
          user_id?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      life_achievement_reports: {
        Row: {
          ai_insights: string | null
          average_score: number | null
          created_at: string | null
          goals_completed: number | null
          goals_total: number | null
          id: string
          improvement_rate: number | null
          period_end: string
          period_start: string
          report_type: string
          summary_image: string | null
          top_category: string | null
          total_tests: number | null
          user_id: string
        }
        Insert: {
          ai_insights?: string | null
          average_score?: number | null
          created_at?: string | null
          goals_completed?: number | null
          goals_total?: number | null
          id?: string
          improvement_rate?: number | null
          period_end: string
          period_start: string
          report_type: string
          summary_image?: string | null
          top_category?: string | null
          total_tests?: number | null
          user_id: string
        }
        Update: {
          ai_insights?: string | null
          average_score?: number | null
          created_at?: string | null
          goals_completed?: number | null
          goals_total?: number | null
          id?: string
          improvement_rate?: number | null
          period_end?: string
          period_start?: string
          report_type?: string
          summary_image?: string | null
          top_category?: string | null
          total_tests?: number | null
          user_id?: string
        }
        Relationships: []
      }
      life_achievement_results: {
        Row: {
          answers: Json
          category_scores: Json
          created_at: string | null
          id: string
          level: number
          level_name: string
          total_score: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answers: Json
          category_scores: Json
          created_at?: string | null
          id?: string
          level: number
          level_name: string
          total_score: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json
          category_scores?: Json
          created_at?: string | null
          id?: string
          level?: number
          level_name?: string
          total_score?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      life_achievement_share_likes: {
        Row: {
          created_at: string | null
          id: string
          share_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          share_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          share_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "life_achievement_share_likes_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "life_achievement_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      life_achievement_shares: {
        Row: {
          achievement_data: Json | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_public: boolean | null
          likes_count: number | null
          share_type: string
          title: string
          user_id: string
        }
        Insert: {
          achievement_data?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          likes_count?: number | null
          share_type: string
          title: string
          user_id: string
        }
        Update: {
          achievement_data?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          likes_count?: number | null
          share_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      life_logs: {
        Row: {
          ai_summary: string | null
          content: string | null
          created_at: string | null
          health_data: Json | null
          id: string
          is_legacy_included: boolean | null
          is_private: boolean | null
          log_date: string
          log_type: string
          media_urls: string[] | null
          mood: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          content?: string | null
          created_at?: string | null
          health_data?: Json | null
          id?: string
          is_legacy_included?: boolean | null
          is_private?: boolean | null
          log_date?: string
          log_type: string
          media_urls?: string[] | null
          mood?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          content?: string | null
          created_at?: string | null
          health_data?: Json | null
          id?: string
          is_legacy_included?: boolean | null
          is_private?: boolean | null
          log_date?: string
          log_type?: string
          media_urls?: string[] | null
          mood?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lite_assessments: {
        Row: {
          area_code: string
          created_at: string
          is_active: boolean
          max_age_months: number
          min_age_months: number
          prompt: string
          question_no: number
          reverse_scored: boolean
          updated_at: string
          weight: number
        }
        Insert: {
          area_code: string
          created_at?: string
          is_active?: boolean
          max_age_months?: number
          min_age_months?: number
          prompt: string
          question_no: number
          reverse_scored?: boolean
          updated_at?: string
          weight?: number
        }
        Update: {
          area_code?: string
          created_at?: string
          is_active?: boolean
          max_age_months?: number
          min_age_months?: number
          prompt?: string
          question_no?: number
          reverse_scored?: boolean
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      mandatory_trainings: {
        Row: {
          created_at: string
          duration_hours: number
          frequency: string
          id: string
          legal_basis: string | null
          penalty_info: string | null
          recommended_providers: string[] | null
          target_audience: string
          training_name: string
          training_type: string
        }
        Insert: {
          created_at?: string
          duration_hours: number
          frequency: string
          id?: string
          legal_basis?: string | null
          penalty_info?: string | null
          recommended_providers?: string[] | null
          target_audience: string
          training_name: string
          training_type: string
        }
        Update: {
          created_at?: string
          duration_hours?: number
          frequency?: string
          id?: string
          legal_basis?: string | null
          penalty_info?: string | null
          recommended_providers?: string[] | null
          target_audience?: string
          training_name?: string
          training_type?: string
        }
        Relationships: []
      }
      media_albums: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_shared: boolean | null
          name: string
          shared_with: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_shared?: boolean | null
          name: string
          shared_with?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_shared?: boolean | null
          name?: string
          shared_with?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      media_archives: {
        Row: {
          album_id: string | null
          created_at: string
          date_taken: string | null
          description: string | null
          file_size: number | null
          file_url: string
          id: string
          is_archived: boolean | null
          is_public: boolean | null
          location: string | null
          media_type: string
          metadata: Json | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          album_id?: string | null
          created_at?: string
          date_taken?: string | null
          description?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          is_archived?: boolean | null
          is_public?: boolean | null
          location?: string | null
          media_type: string
          metadata?: Json | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          album_id?: string | null
          created_at?: string
          date_taken?: string | null
          description?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          is_archived?: boolean | null
          is_public?: boolean | null
          location?: string | null
          media_type?: string
          metadata?: Json | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          family_owner_id: string
          id: string
          invite_id: string | null
          member_id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          family_owner_id: string
          id?: string
          invite_id?: string | null
          member_id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          family_owner_id?: string
          id?: string
          invite_id?: string | null
          member_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "invites"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_conversations: {
        Row: {
          ai_generated_image_url: string | null
          audio_narration_url: string | null
          book_chapter_id: string | null
          conversation_type: string | null
          created_at: string
          emotion_analysis: Json | null
          id: string
          is_important: boolean | null
          is_public: boolean | null
          likes_count: number | null
          memory_extracted: string | null
          messages: Json | null
          updated_at: string
          uploaded_photos: string[] | null
          uploaded_videos: string[] | null
          user_id: string
          user_recording_url: string | null
          views_count: number | null
        }
        Insert: {
          ai_generated_image_url?: string | null
          audio_narration_url?: string | null
          book_chapter_id?: string | null
          conversation_type?: string | null
          created_at?: string
          emotion_analysis?: Json | null
          id?: string
          is_important?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          memory_extracted?: string | null
          messages?: Json | null
          updated_at?: string
          uploaded_photos?: string[] | null
          uploaded_videos?: string[] | null
          user_id: string
          user_recording_url?: string | null
          views_count?: number | null
        }
        Update: {
          ai_generated_image_url?: string | null
          audio_narration_url?: string | null
          book_chapter_id?: string | null
          conversation_type?: string | null
          created_at?: string
          emotion_analysis?: Json | null
          id?: string
          is_important?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          memory_extracted?: string | null
          messages?: Json | null
          updated_at?: string
          uploaded_photos?: string[] | null
          uploaded_videos?: string[] | null
          user_id?: string
          user_recording_url?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_conversations_book_chapter_id_fkey"
            columns: ["book_chapter_id"]
            isOneToOne: false
            referencedRelation: "user_book_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_interactions: {
        Row: {
          comment_text: string | null
          created_at: string
          id: string
          interaction_type: string
          memory_id: string
          reaction_emoji: string | null
          user_id: string
        }
        Insert: {
          comment_text?: string | null
          created_at?: string
          id?: string
          interaction_type: string
          memory_id: string
          reaction_emoji?: string | null
          user_id: string
        }
        Update: {
          comment_text?: string | null
          created_at?: string
          id?: string
          interaction_type?: string
          memory_id?: string
          reaction_emoji?: string | null
          user_id?: string
        }
        Relationships: []
      }
      metaverse_journals: {
        Row: {
          ai_feedback: string | null
          content: string
          created_at: string
          id: string
          mood_after: number | null
          mood_before: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          content: string
          created_at?: string
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          content?: string
          created_at?: string
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mind_condition_scores: {
        Row: {
          created_at: string
          dimensions: Json
          id: string
          note: string | null
          recorded_at: string
          score: number
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dimensions?: Json
          id?: string
          note?: string | null
          recorded_at?: string
          score: number
          source?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dimensions?: Json
          id?: string
          note?: string | null
          recorded_at?: string
          score?: number
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      mind_track_action_prescriptions: {
        Row: {
          actions: Json
          audience: string
          created_at: string
          day_number: number
          email_status: string
          enrollment_id: string
          framework: string | null
          generated_at: string
          id: string
          observation_points: Json
          product_picks: Json
          rationale: Json
          sent_at: string | null
          summary: string | null
          track_focus: string | null
          updated_at: string
          user_id: string
          video_picks: Json
        }
        Insert: {
          actions?: Json
          audience?: string
          created_at?: string
          day_number: number
          email_status?: string
          enrollment_id: string
          framework?: string | null
          generated_at?: string
          id?: string
          observation_points?: Json
          product_picks?: Json
          rationale?: Json
          sent_at?: string | null
          summary?: string | null
          track_focus?: string | null
          updated_at?: string
          user_id: string
          video_picks?: Json
        }
        Update: {
          actions?: Json
          audience?: string
          created_at?: string
          day_number?: number
          email_status?: string
          enrollment_id?: string
          framework?: string | null
          generated_at?: string
          id?: string
          observation_points?: Json
          product_picks?: Json
          rationale?: Json
          sent_at?: string | null
          summary?: string | null
          track_focus?: string | null
          updated_at?: string
          user_id?: string
          video_picks?: Json
        }
        Relationships: [
          {
            foreignKeyName: "mind_track_action_prescriptions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "mind_track_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_track_baseline_assessments: {
        Row: {
          ai_interpretation: string | null
          assessment_mode: string
          clarity_score: number | null
          created_at: string
          energy_score: number | null
          enrollment_id: string
          id: string
          measurement_point: string
          mood_label: string | null
          primary_concern: string | null
          raw_responses: Json | null
          stress_score: number | null
          user_id: string
        }
        Insert: {
          ai_interpretation?: string | null
          assessment_mode?: string
          clarity_score?: number | null
          created_at?: string
          energy_score?: number | null
          enrollment_id: string
          id?: string
          measurement_point?: string
          mood_label?: string | null
          primary_concern?: string | null
          raw_responses?: Json | null
          stress_score?: number | null
          user_id: string
        }
        Update: {
          ai_interpretation?: string | null
          assessment_mode?: string
          clarity_score?: number | null
          created_at?: string
          energy_score?: number | null
          enrollment_id?: string
          id?: string
          measurement_point?: string
          mood_label?: string | null
          primary_concern?: string | null
          raw_responses?: Json | null
          stress_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mind_track_baseline_assessments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "mind_track_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_track_checkins: {
        Row: {
          checked_at: string
          clarity_score: number | null
          completed: boolean | null
          day_number: number
          energy_score: number | null
          enrollment_id: string
          id: string
          mission_id: string | null
          mood_score: number | null
          reflection_note: string | null
          reflection_payload: Json | null
          user_id: string
          video_reflection: string | null
        }
        Insert: {
          checked_at?: string
          clarity_score?: number | null
          completed?: boolean | null
          day_number: number
          energy_score?: number | null
          enrollment_id: string
          id?: string
          mission_id?: string | null
          mood_score?: number | null
          reflection_note?: string | null
          reflection_payload?: Json | null
          user_id: string
          video_reflection?: string | null
        }
        Update: {
          checked_at?: string
          clarity_score?: number | null
          completed?: boolean | null
          day_number?: number
          energy_score?: number | null
          enrollment_id?: string
          id?: string
          mission_id?: string | null
          mood_score?: number | null
          reflection_note?: string | null
          reflection_payload?: Json | null
          user_id?: string
          video_reflection?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mind_track_checkins_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "mind_track_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mind_track_checkins_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mind_track_daily_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_track_child_mission_status: {
        Row: {
          child_profile_id: string
          completed_at: string | null
          created_at: string
          day: number
          id: string
          note: string | null
          started_at: string
          status: Database["public"]["Enums"]["child_mission_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          child_profile_id: string
          completed_at?: string | null
          created_at?: string
          day: number
          id?: string
          note?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["child_mission_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          child_profile_id?: string
          completed_at?: string | null
          created_at?: string
          day?: number
          id?: string
          note?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["child_mission_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mind_track_child_mission_status_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "user_child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_track_concern_threads: {
        Row: {
          audience: string
          baseline_score: number
          concern_detail: string | null
          concern_title: string
          created_at: string
          current_score: number
          enrollment_id: string
          goal_statement: string | null
          graduated_at: string | null
          id: string
          started_at: string
          status: string
          target_score: number
          track_focus: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audience?: string
          baseline_score?: number
          concern_detail?: string | null
          concern_title: string
          created_at?: string
          current_score?: number
          enrollment_id: string
          goal_statement?: string | null
          graduated_at?: string | null
          id?: string
          started_at?: string
          status?: string
          target_score?: number
          track_focus?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audience?: string
          baseline_score?: number
          concern_detail?: string | null
          concern_title?: string
          created_at?: string
          current_score?: number
          enrollment_id?: string
          goal_statement?: string | null
          graduated_at?: string | null
          id?: string
          started_at?: string
          status?: string
          target_score?: number
          track_focus?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mind_track_concern_threads_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: true
            referencedRelation: "mind_track_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_track_content_audit_log: {
        Row: {
          failed_items: Json | null
          id: string
          notes: string | null
          run_at: string
          total_checked: number
          total_failed: number
        }
        Insert: {
          failed_items?: Json | null
          id?: string
          notes?: string | null
          run_at?: string
          total_checked?: number
          total_failed?: number
        }
        Update: {
          failed_items?: Json | null
          id?: string
          notes?: string | null
          run_at?: string
          total_checked?: number
          total_failed?: number
        }
        Relationships: []
      }
      mind_track_daily_content_history: {
        Row: {
          action: Json | null
          assessment: Json | null
          change_type: string
          changed_by: string | null
          created_at: string
          day_number: number
          id: string
          is_active: boolean
          video: Json | null
        }
        Insert: {
          action?: Json | null
          assessment?: Json | null
          change_type: string
          changed_by?: string | null
          created_at?: string
          day_number: number
          id?: string
          is_active?: boolean
          video?: Json | null
        }
        Update: {
          action?: Json | null
          assessment?: Json | null
          change_type?: string
          changed_by?: string | null
          created_at?: string
          day_number?: number
          id?: string
          is_active?: boolean
          video?: Json | null
        }
        Relationships: []
      }
      mind_track_daily_content_overrides: {
        Row: {
          action: Json | null
          assessment: Json | null
          created_at: string
          day_number: number
          id: string
          is_active: boolean
          updated_at: string
          updated_by: string | null
          video: Json | null
        }
        Insert: {
          action?: Json | null
          assessment?: Json | null
          created_at?: string
          day_number: number
          id?: string
          is_active?: boolean
          updated_at?: string
          updated_by?: string | null
          video?: Json | null
        }
        Update: {
          action?: Json | null
          assessment?: Json | null
          created_at?: string
          day_number?: number
          id?: string
          is_active?: boolean
          updated_at?: string
          updated_by?: string | null
          video?: Json | null
        }
        Relationships: []
      }
      mind_track_daily_missions: {
        Row: {
          action_steps: Json | null
          created_at: string
          day_number: number
          deeper_prompts: Json | null
          difficulty: string | null
          enrollment_id: string
          estimated_minutes: number | null
          id: string
          mission_description: string | null
          mission_title: string
          mission_type: string | null
          selected_youtube_video_id: string | null
          success_criteria: string | null
          user_id: string
          video_reflection_draft: string | null
          watched_video_ids: Json
          week_number: number
          why_it_matters: string | null
          workbook_id: string
          youtube_candidates: Json | null
          youtube_query: string | null
          youtube_thumbnail: string | null
          youtube_title: string | null
          youtube_video_id: string | null
        }
        Insert: {
          action_steps?: Json | null
          created_at?: string
          day_number: number
          deeper_prompts?: Json | null
          difficulty?: string | null
          enrollment_id: string
          estimated_minutes?: number | null
          id?: string
          mission_description?: string | null
          mission_title: string
          mission_type?: string | null
          selected_youtube_video_id?: string | null
          success_criteria?: string | null
          user_id: string
          video_reflection_draft?: string | null
          watched_video_ids?: Json
          week_number: number
          why_it_matters?: string | null
          workbook_id: string
          youtube_candidates?: Json | null
          youtube_query?: string | null
          youtube_thumbnail?: string | null
          youtube_title?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          action_steps?: Json | null
          created_at?: string
          day_number?: number
          deeper_prompts?: Json | null
          difficulty?: string | null
          enrollment_id?: string
          estimated_minutes?: number | null
          id?: string
          mission_description?: string | null
          mission_title?: string
          mission_type?: string | null
          selected_youtube_video_id?: string | null
          success_criteria?: string | null
          user_id?: string
          video_reflection_draft?: string | null
          watched_video_ids?: Json
          week_number?: number
          why_it_matters?: string | null
          workbook_id?: string
          youtube_candidates?: Json | null
          youtube_query?: string | null
          youtube_thumbnail?: string | null
          youtube_title?: string | null
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mind_track_daily_missions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "mind_track_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mind_track_daily_missions_workbook_id_fkey"
            columns: ["workbook_id"]
            isOneToOne: false
            referencedRelation: "mind_track_workbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_track_day_content: {
        Row: {
          category: string
          created_at: string
          day_number: number
          focus_goal: string
          id: string
          last_validated_at: string | null
          meta: Json
          mission_description: string | null
          mission_duration_minutes: number
          mission_title: string
          reason: string | null
          updated_at: string
          validation_notes: string | null
          video_available: boolean
          video_id: string | null
          video_platform: string
          video_title: string | null
          video_url: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          day_number: number
          focus_goal: string
          id?: string
          last_validated_at?: string | null
          meta?: Json
          mission_description?: string | null
          mission_duration_minutes?: number
          mission_title: string
          reason?: string | null
          updated_at?: string
          validation_notes?: string | null
          video_available?: boolean
          video_id?: string | null
          video_platform?: string
          video_title?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          day_number?: number
          focus_goal?: string
          id?: string
          last_validated_at?: string | null
          meta?: Json
          mission_description?: string | null
          mission_duration_minutes?: number
          mission_title?: string
          reason?: string | null
          updated_at?: string
          validation_notes?: string | null
          video_available?: boolean
          video_id?: string | null
          video_platform?: string
          video_title?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      mind_track_enrollments: {
        Row: {
          audience: string
          baseline_data: Json | null
          completed_at: string | null
          created_at: string
          current_day: number
          daily_progress: Json | null
          goal_focus: string | null
          id: string
          payment_amount: number | null
          payment_status: string
          referrer_org_id: string | null
          referrer_slug: string | null
          started_at: string
          status: string
          track_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audience?: string
          baseline_data?: Json | null
          completed_at?: string | null
          created_at?: string
          current_day?: number
          daily_progress?: Json | null
          goal_focus?: string | null
          id?: string
          payment_amount?: number | null
          payment_status?: string
          referrer_org_id?: string | null
          referrer_slug?: string | null
          started_at?: string
          status?: string
          track_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audience?: string
          baseline_data?: Json | null
          completed_at?: string | null
          created_at?: string
          current_day?: number
          daily_progress?: Json | null
          goal_focus?: string | null
          id?: string
          payment_amount?: number | null
          payment_status?: string
          referrer_org_id?: string | null
          referrer_slug?: string | null
          started_at?: string
          status?: string
          track_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mind_track_enrollments_referrer_org_id_fkey"
            columns: ["referrer_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_track_final_workbooks: {
        Row: {
          ai_insights: string | null
          chart_data: Json | null
          compiled_data: Json
          completion_certificate: Json | null
          created_at: string
          enrollment_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_insights?: string | null
          chart_data?: Json | null
          compiled_data?: Json
          completion_certificate?: Json | null
          created_at?: string
          enrollment_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_insights?: string | null
          chart_data?: Json | null
          compiled_data?: Json
          completion_certificate?: Json | null
          created_at?: string
          enrollment_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mind_track_final_workbooks_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "mind_track_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_track_focus_changes: {
        Row: {
          created_at: string
          day_when_changed: number | null
          enrollment_id: string
          from_focus: string | null
          id: string
          to_focus: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_when_changed?: number | null
          enrollment_id: string
          from_focus?: string | null
          id?: string
          to_focus: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_when_changed?: number | null
          enrollment_id?: string
          from_focus?: string | null
          id?: string
          to_focus?: string
          user_id?: string
        }
        Relationships: []
      }
      mind_track_graduation_workbooks: {
        Row: {
          audience: string | null
          created_at: string
          enrollment_id: string
          id: string
          keepsake_quote: string | null
          narrative_html: string | null
          pdf_url: string | null
          score_journey: Json
          thread_id: string
          track_focus: string | null
          user_id: string
        }
        Insert: {
          audience?: string | null
          created_at?: string
          enrollment_id: string
          id?: string
          keepsake_quote?: string | null
          narrative_html?: string | null
          pdf_url?: string | null
          score_journey?: Json
          thread_id: string
          track_focus?: string | null
          user_id: string
        }
        Update: {
          audience?: string | null
          created_at?: string
          enrollment_id?: string
          id?: string
          keepsake_quote?: string | null
          narrative_html?: string | null
          pdf_url?: string | null
          score_journey?: Json
          thread_id?: string
          track_focus?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mind_track_graduation_workbooks_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "mind_track_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mind_track_graduation_workbooks_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: true
            referencedRelation: "mind_track_concern_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_track_interventions: {
        Row: {
          acted_at: string | null
          created_at: string
          enrollment_id: string | null
          id: string
          matched_expert_id: string | null
          metadata: Json | null
          offering_key: string
          offering_price: number
          payment_id: string | null
          status: string
          suggested_at: string
          trigger_day: number
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acted_at?: string | null
          created_at?: string
          enrollment_id?: string | null
          id?: string
          matched_expert_id?: string | null
          metadata?: Json | null
          offering_key: string
          offering_price: number
          payment_id?: string | null
          status?: string
          suggested_at?: string
          trigger_day: number
          trigger_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acted_at?: string | null
          created_at?: string
          enrollment_id?: string | null
          id?: string
          matched_expert_id?: string | null
          metadata?: Json | null
          offering_key?: string
          offering_price?: number
          payment_id?: string | null
          status?: string
          suggested_at?: string
          trigger_day?: number
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mind_track_milestone_emails_sent: {
        Row: {
          channel: string
          enrollment_id: string
          id: string
          milestone_day: number
          sent_at: string
        }
        Insert: {
          channel?: string
          enrollment_id: string
          id?: string
          milestone_day: number
          sent_at?: string
        }
        Update: {
          channel?: string
          enrollment_id?: string
          id?: string
          milestone_day?: number
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mind_track_milestone_emails_sent_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "mind_track_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_track_milestone_reports: {
        Row: {
          ai_narrative: string | null
          baseline_snapshot: Json | null
          checkin_summary: Json | null
          created_at: string
          enrollment_id: string
          id: string
          latest_snapshot: Json | null
          milestone_day: number
          pdf_url: string | null
          user_id: string
        }
        Insert: {
          ai_narrative?: string | null
          baseline_snapshot?: Json | null
          checkin_summary?: Json | null
          created_at?: string
          enrollment_id: string
          id?: string
          latest_snapshot?: Json | null
          milestone_day: number
          pdf_url?: string | null
          user_id: string
        }
        Update: {
          ai_narrative?: string | null
          baseline_snapshot?: Json | null
          checkin_summary?: Json | null
          created_at?: string
          enrollment_id?: string
          id?: string
          latest_snapshot?: Json | null
          milestone_day?: number
          pdf_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mind_track_onboarding_events: {
        Row: {
          created_at: string
          event: string
          id: string
          meta: Json | null
          stage: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          meta?: Json | null
          stage: string
          user_id: string
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          meta?: Json | null
          stage?: string
          user_id?: string
        }
        Relationships: []
      }
      mind_track_personal_lines: {
        Row: {
          base_mission: string | null
          child_profile_id: string
          created_at: string
          day: number
          id: string
          personal_line: string
          user_id: string
        }
        Insert: {
          base_mission?: string | null
          child_profile_id: string
          created_at?: string
          day: number
          id?: string
          personal_line: string
          user_id: string
        }
        Update: {
          base_mission?: string | null
          child_profile_id?: string
          created_at?: string
          day?: number
          id?: string
          personal_line?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mind_track_personal_lines_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "user_child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_track_progress_snapshots: {
        Row: {
          actions_completed: Json
          created_at: string
          day_number: number
          evidence_summary: string | null
          id: string
          mood_delta: number | null
          observations: Json
          self_score: number
          session_index: number | null
          thread_id: string
          user_id: string
        }
        Insert: {
          actions_completed?: Json
          created_at?: string
          day_number: number
          evidence_summary?: string | null
          id?: string
          mood_delta?: number | null
          observations?: Json
          self_score: number
          session_index?: number | null
          thread_id: string
          user_id: string
        }
        Update: {
          actions_completed?: Json
          created_at?: string
          day_number?: number
          evidence_summary?: string | null
          id?: string
          mood_delta?: number | null
          observations?: Json
          self_score?: number
          session_index?: number | null
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mind_track_progress_snapshots_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "mind_track_concern_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_track_regen_progress: {
        Row: {
          created_at: string
          enrollment_id: string
          id: string
          message: string | null
          percent: number
          session_id: string
          stage: string
          theory: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          enrollment_id: string
          id?: string
          message?: string | null
          percent?: number
          session_id: string
          stage: string
          theory?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          enrollment_id?: string
          id?: string
          message?: string | null
          percent?: number
          session_id?: string
          stage?: string
          theory?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mind_track_reminders_sent: {
        Row: {
          channel: string
          day_number: number
          enrollment_id: string
          id: string
          sent_at: string
          user_id: string
        }
        Insert: {
          channel?: string
          day_number: number
          enrollment_id: string
          id?: string
          sent_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          day_number?: number
          enrollment_id?: string
          id?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mind_track_risk_alerts: {
        Row: {
          alert_type: string
          created_at: string
          detected_at: string
          enrollment_id: string | null
          followup_intervention_id: string | null
          id: string
          notification_channel: string | null
          notification_sent: boolean
          resolved_at: string | null
          severity: string
          trigger_data: Json | null
          updated_at: string
          user_id: string
          user_response: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          detected_at?: string
          enrollment_id?: string | null
          followup_intervention_id?: string | null
          id?: string
          notification_channel?: string | null
          notification_sent?: boolean
          resolved_at?: string | null
          severity?: string
          trigger_data?: Json | null
          updated_at?: string
          user_id: string
          user_response?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          detected_at?: string
          enrollment_id?: string | null
          followup_intervention_id?: string | null
          id?: string
          notification_channel?: string | null
          notification_sent?: boolean
          resolved_at?: string | null
          severity?: string
          trigger_data?: Json | null
          updated_at?: string
          user_id?: string
          user_response?: string | null
        }
        Relationships: []
      }
      mind_track_self_checks: {
        Row: {
          answers: Json
          created_at: string
          goal_id: string
          goal_title: string
          id: string
          is_public: boolean
          level: string
          max_score: number
          questions: Json
          score: number
          share_id: string
          summary: string | null
          user_id: string | null
        }
        Insert: {
          answers?: Json
          created_at?: string
          goal_id: string
          goal_title: string
          id?: string
          is_public?: boolean
          level: string
          max_score: number
          questions?: Json
          score: number
          share_id?: string
          summary?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json
          created_at?: string
          goal_id?: string
          goal_title?: string
          id?: string
          is_public?: boolean
          level?: string
          max_score?: number
          questions?: Json
          score?: number
          share_id?: string
          summary?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      mind_track_session_logs: {
        Row: {
          answers: Json
          created_at: string
          day_number: number
          enrollment_id: string
          feedback: string | null
          id: string
          meta: Json
          step: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          day_number: number
          enrollment_id: string
          feedback?: string | null
          id?: string
          meta?: Json
          step?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          day_number?: number
          enrollment_id?: string
          feedback?: string | null
          id?: string
          meta?: Json
          step?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mind_track_session_reports: {
        Row: {
          created_at: string
          day_number: number
          enrollment_id: string
          id: string
          key_wins: Json
          next_focus: string | null
          report_html: string | null
          report_json: Json
          risk_flags: Json
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_number: number
          enrollment_id: string
          id?: string
          key_wins?: Json
          next_focus?: string | null
          report_html?: string | null
          report_json?: Json
          risk_flags?: Json
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_number?: number
          enrollment_id?: string
          id?: string
          key_wins?: Json
          next_focus?: string | null
          report_html?: string | null
          report_json?: Json
          risk_flags?: Json
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mind_track_session_reports_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "mind_track_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mind_track_session_reports_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "mind_track_concern_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_track_video_events: {
        Row: {
          created_at: string
          day_number: number | null
          event_type: string
          id: string
          metadata: Json | null
          user_id: string
          video_id: string
          video_title: string | null
        }
        Insert: {
          created_at?: string
          day_number?: number | null
          event_type: string
          id?: string
          metadata?: Json | null
          user_id: string
          video_id: string
          video_title?: string | null
        }
        Update: {
          created_at?: string
          day_number?: number | null
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
          video_id?: string
          video_title?: string | null
        }
        Relationships: []
      }
      mind_track_video_feedback: {
        Row: {
          comment: string | null
          created_at: string
          day: number
          id: string
          reason_type: string
          user_id: string
          video_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          day: number
          id?: string
          reason_type?: string
          user_id: string
          video_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          day?: number
          id?: string
          reason_type?: string
          user_id?: string
          video_id?: string
        }
        Relationships: []
      }
      mind_track_video_suggestions: {
        Row: {
          admin_note: string | null
          created_at: string
          id: string
          note: string | null
          status: string
          suggested_for_day: number | null
          updated_at: string
          user_id: string
          video_id: string | null
          youtube_url: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          id?: string
          note?: string | null
          status?: string
          suggested_for_day?: number | null
          updated_at?: string
          user_id: string
          video_id?: string | null
          youtube_url: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          id?: string
          note?: string | null
          status?: string
          suggested_for_day?: number | null
          updated_at?: string
          user_id?: string
          video_id?: string | null
          youtube_url?: string
        }
        Relationships: []
      }
      mind_track_workbooks: {
        Row: {
          challenge_theme: string | null
          created_at: string
          enrollment_id: string
          expected_outcomes: Json | null
          generated_by_ai: boolean | null
          id: string
          initial_summary: string | null
          root_causes: Json | null
          strength_areas: Json | null
          updated_at: string
          user_id: string
          weekly_themes: Json | null
        }
        Insert: {
          challenge_theme?: string | null
          created_at?: string
          enrollment_id: string
          expected_outcomes?: Json | null
          generated_by_ai?: boolean | null
          id?: string
          initial_summary?: string | null
          root_causes?: Json | null
          strength_areas?: Json | null
          updated_at?: string
          user_id: string
          weekly_themes?: Json | null
        }
        Update: {
          challenge_theme?: string | null
          created_at?: string
          enrollment_id?: string
          expected_outcomes?: Json | null
          generated_by_ai?: boolean | null
          id?: string
          initial_summary?: string | null
          root_causes?: Json | null
          strength_areas?: Json | null
          updated_at?: string
          user_id?: string
          weekly_themes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mind_track_workbooks_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: true
            referencedRelation: "mind_track_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_program_plans: {
        Row: {
          activities: Json | null
          categories: Json | null
          created_at: string | null
          facility_name: string | null
          generated_plan: string
          id: string
          is_finalized: boolean | null
          month: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activities?: Json | null
          categories?: Json | null
          created_at?: string | null
          facility_name?: string | null
          generated_plan: string
          id?: string
          is_finalized?: boolean | null
          month: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activities?: Json | null
          categories?: Json | null
          created_at?: string | null
          facility_name?: string | null
          generated_plan?: string
          id?: string
          is_finalized?: boolean | null
          month?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
          {
            foreignKeyName: "observation_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      observation_shares: {
        Row: {
          created_at: string | null
          id: string
          observation_id: string
          share_message: string | null
          shared_by: string
          shared_with_email: string
          shared_with_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          observation_id: string
          share_message?: string | null
          shared_by: string
          shared_with_email: string
          shared_with_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          observation_id?: string
          share_message?: string | null
          shared_by?: string
          shared_with_email?: string
          shared_with_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "observation_shares_observation_id_fkey"
            columns: ["observation_id"]
            isOneToOne: false
            referencedRelation: "observations"
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
      observations: {
        Row: {
          ai_suggestions: string[] | null
          behaviors: string[] | null
          concerns: string[] | null
          content: string
          created_at: string
          detailed_advice: string | null
          emotions: string[] | null
          expert_advice: string | null
          id: string
          is_voice_generated: boolean | null
          media_urls: Json | null
          observation_date: string
          profile_id: string | null
          qa_history: Json | null
          recommended_tests: Json | null
          severity: string | null
          title: string
          updated_at: string
          user_id: string
          voice_transcription: string | null
        }
        Insert: {
          ai_suggestions?: string[] | null
          behaviors?: string[] | null
          concerns?: string[] | null
          content: string
          created_at?: string
          detailed_advice?: string | null
          emotions?: string[] | null
          expert_advice?: string | null
          id?: string
          is_voice_generated?: boolean | null
          media_urls?: Json | null
          observation_date?: string
          profile_id?: string | null
          qa_history?: Json | null
          recommended_tests?: Json | null
          severity?: string | null
          title: string
          updated_at?: string
          user_id: string
          voice_transcription?: string | null
        }
        Update: {
          ai_suggestions?: string[] | null
          behaviors?: string[] | null
          concerns?: string[] | null
          content?: string
          created_at?: string
          detailed_advice?: string | null
          emotions?: string[] | null
          expert_advice?: string | null
          id?: string
          is_voice_generated?: boolean | null
          media_urls?: Json | null
          observation_date?: string
          profile_id?: string | null
          qa_history?: Json | null
          recommended_tests?: Json | null
          severity?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          voice_transcription?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "observations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          added_at: string
          added_by: string | null
          id: string
          member_identifier: string | null
          metadata: Json | null
          name: string | null
          organization_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          id?: string
          member_identifier?: string | null
          metadata?: Json | null
          name?: string | null
          organization_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          id?: string
          member_identifier?: string | null
          metadata?: Json | null
          name?: string | null
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          admin_user_id: string | null
          commission_rate: number
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          is_referral_active: boolean
          logo_url: string | null
          name: string
          org_type: Database["public"]["Enums"]["organization_type"]
          phone: string | null
          registration_number: string | null
          settings: Json | null
          slug: string | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          admin_user_id?: string | null
          commission_rate?: number
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_referral_active?: boolean
          logo_url?: string | null
          name: string
          org_type: Database["public"]["Enums"]["organization_type"]
          phone?: string | null
          registration_number?: string | null
          settings?: Json | null
          slug?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          admin_user_id?: string | null
          commission_rate?: number
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_referral_active?: boolean
          logo_url?: string | null
          name?: string
          org_type?: Database["public"]["Enums"]["organization_type"]
          phone?: string | null
          registration_number?: string | null
          settings?: Json | null
          slug?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      parent_otp_codes: {
        Row: {
          attempts: number
          code_hash: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          phone: string
          share_link_id: string
        }
        Insert: {
          attempts?: number
          code_hash: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          phone: string
          share_link_id: string
        }
        Update: {
          attempts?: number
          code_hash?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          share_link_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_otp_codes_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "center_parent_share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_phone_links: {
        Row: {
          children_ids: string[]
          created_at: string
          last_verified_at: string | null
          parent_user_id: string | null
          phone_e164: string
          updated_at: string
        }
        Insert: {
          children_ids?: string[]
          created_at?: string
          last_verified_at?: string | null
          parent_user_id?: string | null
          phone_e164: string
          updated_at?: string
        }
        Update: {
          children_ids?: string[]
          created_at?: string
          last_verified_at?: string | null
          parent_user_id?: string | null
          phone_e164?: string
          updated_at?: string
        }
        Relationships: []
      }
      parent_phone_sessions: {
        Row: {
          child_id: string | null
          created_at: string
          expires_at: string
          last_used_at: string
          phone: string
          share_link_id: string | null
          token: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          expires_at?: string
          last_used_at?: string
          phone: string
          share_link_id?: string | null
          token: string
        }
        Update: {
          child_id?: string | null
          created_at?: string
          expires_at?: string
          last_used_at?: string
          phone?: string
          share_link_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_phone_sessions_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "center_parent_share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_content_clicks: {
        Row: {
          content_id: string | null
          content_type: string
          created_at: string
          id: string
          partner_slug: string
          user_id: string | null
        }
        Insert: {
          content_id?: string | null
          content_type: string
          created_at?: string
          id?: string
          partner_slug: string
          user_id?: string | null
        }
        Update: {
          content_id?: string | null
          content_type?: string
          created_at?: string
          id?: string
          partner_slug?: string
          user_id?: string | null
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
          voucher_business_no: string | null
          voucher_evidence_url: string | null
          voucher_programs: string[] | null
          voucher_source: string | null
          voucher_types: string[] | null
          voucher_verified_at: string | null
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
          voucher_business_no?: string | null
          voucher_evidence_url?: string | null
          voucher_programs?: string[] | null
          voucher_source?: string | null
          voucher_types?: string[] | null
          voucher_verified_at?: string | null
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
          voucher_business_no?: string | null
          voucher_evidence_url?: string | null
          voucher_programs?: string[] | null
          voucher_source?: string | null
          voucher_types?: string[] | null
          voucher_verified_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      partner_owners: {
        Row: {
          created_at: string
          id: string
          partner_slug: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          partner_slug: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          partner_slug?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_products: {
        Row: {
          author: string | null
          created_at: string
          created_by: string | null
          description: string | null
          external_buy_url: string | null
          id: string
          is_published: boolean
          kind: string
          partner_slug: string
          price_krw: number | null
          sort_order: number
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          external_buy_url?: string | null
          id?: string
          is_published?: boolean
          kind?: string
          partner_slug: string
          price_krw?: number | null
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          external_buy_url?: string | null
          id?: string
          is_published?: boolean
          kind?: string
          partner_slug?: string
          price_krw?: number | null
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_programs: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          cta_label: string | null
          cta_url: string | null
          description: string | null
          duration_text: string | null
          id: string
          is_published: boolean
          partner_slug: string
          price_krw: number | null
          sort_order: number
          target_age: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          duration_text?: string | null
          id?: string
          is_published?: boolean
          partner_slug: string
          price_krw?: number | null
          sort_order?: number
          target_age?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          duration_text?: string | null
          id?: string
          is_published?: boolean
          partner_slug?: string
          price_krw?: number | null
          sort_order?: number
          target_age?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_referral_clicks: {
        Row: {
          created_at: string
          id: string
          org_id: string | null
          referrer_url: string | null
          slug: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          org_id?: string | null
          referrer_url?: string | null
          slug: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string | null
          referrer_url?: string | null
          slug?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_referral_clicks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_service_info: {
        Row: {
          available_slots: number | null
          created_at: string
          id: string
          institution_id: string
          insurance_coverage: string | null
          is_active: boolean
          pricing_info: Json | null
          service_category: string
          service_description: string
          special_programs: string[] | null
          staff_qualifications: string[] | null
          target_age_group: string | null
          updated_at: string
          waiting_period: string | null
        }
        Insert: {
          available_slots?: number | null
          created_at?: string
          id?: string
          institution_id: string
          insurance_coverage?: string | null
          is_active?: boolean
          pricing_info?: Json | null
          service_category: string
          service_description: string
          special_programs?: string[] | null
          staff_qualifications?: string[] | null
          target_age_group?: string | null
          updated_at?: string
          waiting_period?: string | null
        }
        Update: {
          available_slots?: number | null
          created_at?: string
          id?: string
          institution_id?: string
          insurance_coverage?: string | null
          is_active?: boolean
          pricing_info?: Json | null
          service_category?: string
          service_description?: string
          special_programs?: string[] | null
          staff_qualifications?: string[] | null
          target_age_group?: string | null
          updated_at?: string
          waiting_period?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_service_info_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "partner_institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_service_info_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "partner_institutions_public"
            referencedColumns: ["id"]
          },
        ]
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
          token_amount: number | null
          token_package_id: string | null
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
          token_amount?: number | null
          token_package_id?: string | null
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
          token_amount?: number | null
          token_package_id?: string | null
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
          {
            foreignKeyName: "payment_history_token_package_id_fkey"
            columns: ["token_package_id"]
            isOneToOne: false
            referencedRelation: "token_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_sessions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          product_name: string
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          product_name: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          product_name?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          approved_at: string | null
          created_at: string | null
          customer_name: string | null
          id: string
          method: string | null
          order_id: string
          payment_key: string
          token_pack: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          created_at?: string | null
          customer_name?: string | null
          id?: string
          method?: string | null
          order_id: string
          payment_key: string
          token_pack?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          created_at?: string | null
          customer_name?: string | null
          id?: string
          method?: string | null
          order_id?: string
          payment_key?: string
          token_pack?: string | null
        }
        Relationships: []
      }
      personality_analysis: {
        Row: {
          analysis_text: string
          created_at: string
          data_sources: Json | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_text: string
          created_at?: string
          data_sources?: Json | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_text?: string
          created_at?: string
          data_sources?: Json | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personality_test_results: {
        Row: {
          answers: Json
          created_at: string
          id: string
          personality_type: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          personality_type: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          personality_type?: string
          user_id?: string
        }
        Relationships: []
      }
      personalized_challenges: {
        Row: {
          ai_generated: boolean | null
          category: string
          created_at: string
          custom_goals: Json | null
          description: string
          difficulty_level: number
          duration_days: number
          end_date: string | null
          id: string
          progress_metrics: Json | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          category: string
          created_at?: string
          custom_goals?: Json | null
          description: string
          difficulty_level: number
          duration_days: number
          end_date?: string | null
          id?: string
          progress_metrics?: Json | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          category?: string
          created_at?: string
          custom_goals?: Json | null
          description?: string
          difficulty_level?: number
          duration_days?: number
          end_date?: string | null
          id?: string
          progress_metrics?: Json | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personalized_missions: {
        Row: {
          completed_at: string | null
          created_at: string
          day_of_week: number
          difficulty_level: number
          id: string
          is_completed: boolean
          mission_description: string
          mission_title: string
          target_behavior: string
          updated_at: string
          user_id: string
          verification_note: string | null
          verification_photo_url: string | null
          week_end: string
          week_start: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          day_of_week: number
          difficulty_level: number
          id?: string
          is_completed?: boolean
          mission_description: string
          mission_title: string
          target_behavior: string
          updated_at?: string
          user_id: string
          verification_note?: string | null
          verification_photo_url?: string | null
          week_end: string
          week_start: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          day_of_week?: number
          difficulty_level?: number
          id?: string
          is_completed?: boolean
          mission_description?: string
          mission_title?: string
          target_behavior?: string
          updated_at?: string
          user_id?: string
          verification_note?: string | null
          verification_photo_url?: string | null
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      play_assessment_results: {
        Row: {
          age_group: string
          ai_analysis: string | null
          answers: Json
          child_age: number
          cognitive_score: number
          created_at: string
          emotional_score: number
          id: string
          physical_score: number
          scores: Json
          social_score: number
          style: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age_group: string
          ai_analysis?: string | null
          answers: Json
          child_age: number
          cognitive_score?: number
          created_at?: string
          emotional_score?: number
          id?: string
          physical_score?: number
          scores: Json
          social_score?: number
          style: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age_group?: string
          ai_analysis?: string | null
          answers?: Json
          child_age?: number
          cognitive_score?: number
          created_at?: string
          emotional_score?: number
          id?: string
          physical_score?: number
          scores?: Json
          social_score?: number
          style?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pmf_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          page_path: string | null
          screen_size: string | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
          user_segment: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          page_path?: string | null
          screen_size?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_segment?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          page_path?: string | null
          screen_size?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_segment?: string | null
        }
        Relationships: []
      }
      pmf_feedback: {
        Row: {
          context: string | null
          created_at: string | null
          feedback_text: string | null
          id: string
          nps_score: number | null
          user_id: string | null
          would_pay: boolean | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          nps_score?: number | null
          user_id?: string | null
          would_pay?: boolean | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          nps_score?: number | null
          user_id?: string | null
          would_pay?: boolean | null
        }
        Relationships: []
      }
      premium_report_history: {
        Row: {
          created_at: string
          data_source_counts: Json | null
          data_span_days: number | null
          dimension_scores: Json | null
          id: string
          is_shared: boolean | null
          model_used: string | null
          overall_score: number | null
          preprocessed_data: Json
          report_data: Json
          report_mode: string | null
          report_number: number
          research_citations: Json | null
          risk_level: string | null
          share_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data_source_counts?: Json | null
          data_span_days?: number | null
          dimension_scores?: Json | null
          id?: string
          is_shared?: boolean | null
          model_used?: string | null
          overall_score?: number | null
          preprocessed_data?: Json
          report_data?: Json
          report_mode?: string | null
          report_number?: number
          research_citations?: Json | null
          risk_level?: string | null
          share_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          data_source_counts?: Json | null
          data_span_days?: number | null
          dimension_scores?: Json | null
          id?: string
          is_shared?: boolean | null
          model_used?: string | null
          overall_score?: number | null
          preprocessed_data?: Json
          report_data?: Json
          report_mode?: string | null
          report_number?: number
          research_citations?: Json | null
          risk_level?: string | null
          share_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"] | null
          birth_date: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          organization_id: string | null
          phone: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          organization_id?: string | null
          phone?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          organization_id?: string | null
          phone?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_tracking: {
        Row: {
          created_at: string
          dimension_scores: Json
          id: string
          metadata: Json | null
          source_id: string | null
          source_label: string | null
          source_type: string
          summary: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dimension_scores?: Json
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_label?: string | null
          source_type: string
          summary?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          dimension_scores?: Json
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_label?: string | null
          source_type?: string
          summary?: string | null
          user_id?: string
        }
        Relationships: []
      }
      realtime_consultation_messages: {
        Row: {
          content: string
          created_at: string
          file_url: string | null
          id: string
          is_read: boolean
          message_type: Database["public"]["Enums"]["message_type"]
          sender_id: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_read?: boolean
          message_type?: Database["public"]["Enums"]["message_type"]
          sender_id: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_read?: boolean
          message_type?: Database["public"]["Enums"]["message_type"]
          sender_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "realtime_consultation_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "realtime_consultation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      realtime_consultation_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          expert_id: string | null
          id: string
          started_at: string | null
          status: Database["public"]["Enums"]["consultation_session_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          expert_id?: string | null
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["consultation_session_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          expert_id?: string | null
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["consultation_session_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "realtime_consultation_sessions_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_booking_stats"
            referencedColumns: ["expert_id"]
          },
          {
            foreignKeyName: "realtime_consultation_sessions_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_records: {
        Row: {
          created_at: string
          id: string
          referred_user_id: string
          referrer_code: string
          reward_status: string
          tokens_awarded: number
        }
        Insert: {
          created_at?: string
          id?: string
          referred_user_id: string
          referrer_code: string
          reward_status?: string
          tokens_awarded?: number
        }
        Update: {
          created_at?: string
          id?: string
          referred_user_id?: string
          referrer_code?: string
          reward_status?: string
          tokens_awarded?: number
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          created_at: string
          id: string
          referee_id: string | null
          referral_code: string | null
          referrer_id: string
          reward_type: string
          tokens_awarded: number
        }
        Insert: {
          created_at?: string
          id?: string
          referee_id?: string | null
          referral_code?: string | null
          referrer_id: string
          reward_type: string
          tokens_awarded: number
        }
        Update: {
          created_at?: string
          id?: string
          referee_id?: string | null
          referral_code?: string | null
          referrer_id?: string
          reward_type?: string
          tokens_awarded?: number
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          daily_referral_count: number | null
          device_fingerprint: string | null
          id: string
          ip_address: string | null
          is_verified: boolean | null
          last_referral_date: string | null
          referee_id: string | null
          referral_code: string
          referrer_id: string
          status: string
          tokens_awarded: number | null
          verified_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          daily_referral_count?: number | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          is_verified?: boolean | null
          last_referral_date?: string | null
          referee_id?: string | null
          referral_code: string
          referrer_id: string
          status?: string
          tokens_awarded?: number | null
          verified_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          daily_referral_count?: number | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          is_verified?: boolean | null
          last_referral_date?: string | null
          referee_id?: string | null
          referral_code?: string
          referrer_id?: string
          status?: string
          tokens_awarded?: number | null
          verified_at?: string | null
        }
        Relationships: []
      }
      report_reassessment_reminders: {
        Row: {
          created_at: string
          id: string
          message: string | null
          reminder_type: string
          report_id: string | null
          scheduled_at: string
          sent_at: string | null
          status: string
          test_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          reminder_type?: string
          report_id?: string | null
          scheduled_at: string
          sent_at?: string | null
          status?: string
          test_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          reminder_type?: string
          report_id?: string | null
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          test_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      report_share_links: {
        Row: {
          created_at: string | null
          current_views: number | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_views: number | null
          report_history_id: string | null
          share_token: string
          share_type: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_views?: number | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_views?: number | null
          report_history_id?: string | null
          share_token?: string
          share_type?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_views?: number | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_views?: number | null
          report_history_id?: string | null
          share_token?: string
          share_type?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_share_links_report_history_id_fkey"
            columns: ["report_history_id"]
            isOneToOne: false
            referencedRelation: "premium_report_history"
            referencedColumns: ["id"]
          },
        ]
      }
      report_share_reports: {
        Row: {
          created_at: string | null
          id: string
          report_history_id: string
          report_order: number
          share_link_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          report_history_id: string
          report_order?: number
          share_link_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          report_history_id?: string
          report_order?: number
          share_link_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_share_reports_report_history_id_fkey"
            columns: ["report_history_id"]
            isOneToOne: false
            referencedRelation: "premium_report_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_share_reports_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "report_share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      report_share_views: {
        Row: {
          id: string
          share_link_id: string
          viewed_at: string | null
          viewer_agent: string | null
          viewer_ip: string | null
        }
        Insert: {
          id?: string
          share_link_id: string
          viewed_at?: string | null
          viewer_agent?: string | null
          viewer_ip?: string | null
        }
        Update: {
          id?: string
          share_link_id?: string
          viewed_at?: string | null
          viewer_agent?: string | null
          viewer_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_share_views_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "report_share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      resident_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          duration_minutes: number | null
          facility_id: string
          id: string
          notes: string | null
          resident_id: string
          score: number | null
          staff_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          duration_minutes?: number | null
          facility_id: string
          id?: string
          notes?: string | null
          resident_id: string
          score?: number | null
          staff_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          duration_minutes?: number | null
          facility_id?: string
          id?: string
          notes?: string | null
          resident_id?: string
          score?: number | null
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resident_activities_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resident_activities_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      resident_families: {
        Row: {
          can_receive_notifications: boolean | null
          can_view_activities: boolean | null
          created_at: string | null
          email: string | null
          id: string
          invitation_code: string | null
          invitation_status: string | null
          name: string
          phone: string | null
          relationship: string | null
          resident_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          can_receive_notifications?: boolean | null
          can_view_activities?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          invitation_code?: string | null
          invitation_status?: string | null
          name: string
          phone?: string | null
          relationship?: string | null
          resident_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          can_receive_notifications?: boolean | null
          can_view_activities?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          invitation_code?: string | null
          invitation_status?: string | null
          name?: string
          phone?: string | null
          relationship?: string | null
          resident_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resident_families_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      residents: {
        Row: {
          admission_date: string | null
          birth_date: string | null
          care_grade: string | null
          care_level: string | null
          created_at: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          facility_id: string
          gender: string | null
          id: string
          is_active: boolean | null
          medical_notes: string | null
          name: string
          photo_url: string | null
          room_number: string | null
          settings: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admission_date?: string | null
          birth_date?: string | null
          care_grade?: string | null
          care_level?: string | null
          created_at?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          facility_id: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          medical_notes?: string | null
          name: string
          photo_url?: string | null
          room_number?: string | null
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admission_date?: string | null
          birth_date?: string | null
          care_grade?: string | null
          care_level?: string | null
          created_at?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          facility_id?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          medical_notes?: string | null
          name?: string
          photo_url?: string | null
          room_number?: string | null
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residents_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      reversal_stories: {
        Row: {
          created_at: string
          id: string
          lesson_learned: string | null
          mood_after: number | null
          mood_before: number | null
          reactions: Json | null
          reversal_moment: string
          story_date: string | null
          title: string
          updated_at: string
          user_id: string
          worst_moment: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_learned?: string | null
          mood_after?: number | null
          mood_before?: number | null
          reactions?: Json | null
          reversal_moment: string
          story_date?: string | null
          title: string
          updated_at?: string
          user_id: string
          worst_moment: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_learned?: string | null
          mood_after?: number | null
          mood_before?: number | null
          reactions?: Json | null
          reversal_moment?: string
          story_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          worst_moment?: string
        }
        Relationships: []
      }
      reward_attendance: {
        Row: {
          check_date: string
          created_at: string
          id: string
          points_earned: number
          streak_days: number
          user_id: string
        }
        Insert: {
          check_date?: string
          created_at?: string
          id?: string
          points_earned?: number
          streak_days?: number
          user_id: string
        }
        Update: {
          check_date?: string
          created_at?: string
          id?: string
          points_earned?: number
          streak_days?: number
          user_id?: string
        }
        Relationships: []
      }
      reward_history: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          points: number
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          points: number
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      reward_roulette_spins: {
        Row: {
          created_at: string
          id: string
          points_won: number
          spin_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_won?: number
          spin_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_won?: number
          spin_date?: string
          user_id?: string
        }
        Relationships: []
      }
      reward_transactions: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          points: number
          reason: string | null
          reward_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          points: number
          reason?: string | null
          reward_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          points?: number
          reason?: string | null
          reward_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_transactions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "user_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      room_decorations: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          position_x: number
          position_y: number
          position_z: number
          room_type: string
          rotation_y: number | null
          scale: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          position_x: number
          position_y: number
          position_z: number
          room_type: string
          rotation_y?: number | null
          scale?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          position_x?: number
          position_y?: number
          position_z?: number
          room_type?: string
          rotation_y?: number | null
          scale?: number | null
          user_id?: string
        }
        Relationships: []
      }
      service_reviews: {
        Row: {
          created_at: string
          id: string
          is_anonymous: boolean | null
          is_public: boolean | null
          rating: number
          review_text: string | null
          service_id: string | null
          service_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_public?: boolean | null
          rating: number
          review_text?: string | null
          service_id?: string | null
          service_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_public?: boolean | null
          rating?: number
          review_text?: string | null
          service_id?: string | null
          service_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_memories: {
        Row: {
          allow_comments: boolean
          allow_reactions: boolean
          created_at: string
          family_group_id: string | null
          id: string
          memory_id: string
          shared_by: string
          shared_with: string[] | null
          updated_at: string
          visibility: string
        }
        Insert: {
          allow_comments?: boolean
          allow_reactions?: boolean
          created_at?: string
          family_group_id?: string | null
          id?: string
          memory_id: string
          shared_by: string
          shared_with?: string[] | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          allow_comments?: boolean
          allow_reactions?: boolean
          created_at?: string
          family_group_id?: string | null
          id?: string
          memory_id?: string
          shared_by?: string
          shared_with?: string[] | null
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      shuttle_logs: {
        Row: {
          created_at: string
          dropoff_time: string | null
          id: string
          log_date: string
          notes: string | null
          pickup_status: string | null
          pickup_time: string | null
          resident_id: string | null
          route_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dropoff_time?: string | null
          id?: string
          log_date?: string
          notes?: string | null
          pickup_status?: string | null
          pickup_time?: string | null
          resident_id?: string | null
          route_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          dropoff_time?: string | null
          id?: string
          log_date?: string
          notes?: string | null
          pickup_status?: string | null
          pickup_time?: string | null
          resident_id?: string | null
          route_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shuttle_logs_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "shuttle_residents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shuttle_logs_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "shuttle_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      shuttle_residents: {
        Row: {
          address: string
          area: string
          created_at: string
          emergency_contact: string | null
          estimated_pickup_time: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          phone: string | null
          pickup_order: number | null
          route_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          area: string
          created_at?: string
          emergency_contact?: string | null
          estimated_pickup_time?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          pickup_order?: number | null
          route_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          area?: string
          created_at?: string
          emergency_contact?: string | null
          estimated_pickup_time?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          pickup_order?: number | null
          route_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shuttle_residents_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "shuttle_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      shuttle_routes: {
        Row: {
          area: string
          color: string | null
          created_at: string
          departure_time: string
          driver_name: string | null
          driver_phone: string | null
          id: string
          is_active: boolean | null
          name: string
          return_time: string
          updated_at: string
          user_id: string
          vehicle_number: string | null
        }
        Insert: {
          area: string
          color?: string | null
          created_at?: string
          departure_time?: string
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          return_time?: string
          updated_at?: string
          user_id: string
          vehicle_number?: string | null
        }
        Update: {
          area?: string
          color?: string | null
          created_at?: string
          departure_time?: string
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          return_time?: string
          updated_at?: string
          user_id?: string
          vehicle_number?: string | null
        }
        Relationships: []
      }
      social_media_generations: {
        Row: {
          content_type: string
          created_at: string
          created_by: string
          generated_text: string
          hashtags: string[] | null
          id: string
          image_data: string | null
          image_url: string | null
          metadata: Json | null
          platform: string
        }
        Insert: {
          content_type: string
          created_at?: string
          created_by: string
          generated_text: string
          hashtags?: string[] | null
          id?: string
          image_data?: string | null
          image_url?: string | null
          metadata?: Json | null
          platform: string
        }
        Update: {
          content_type?: string
          created_at?: string
          created_by?: string
          generated_text?: string
          hashtags?: string[] | null
          id?: string
          image_data?: string | null
          image_url?: string | null
          metadata?: Json | null
          platform?: string
        }
        Relationships: []
      }
      staff_training_records: {
        Row: {
          certificate_url: string | null
          completion_date: string | null
          created_at: string
          expiry_date: string | null
          facility_id: string | null
          id: string
          reminder_sent_at: string | null
          staff_id: string | null
          status: string
          training_id: string | null
          training_provider: string | null
          updated_at: string
        }
        Insert: {
          certificate_url?: string | null
          completion_date?: string | null
          created_at?: string
          expiry_date?: string | null
          facility_id?: string | null
          id?: string
          reminder_sent_at?: string | null
          staff_id?: string | null
          status?: string
          training_id?: string | null
          training_provider?: string | null
          updated_at?: string
        }
        Update: {
          certificate_url?: string | null
          completion_date?: string | null
          created_at?: string
          expiry_date?: string | null
          facility_id?: string | null
          id?: string
          reminder_sent_at?: string | null
          staff_id?: string | null
          status?: string
          training_id?: string | null
          training_provider?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_training_records_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_training_records_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "facility_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_training_records_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "mandatory_trainings"
            referencedColumns: ["id"]
          },
        ]
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
          custom_templates: boolean | null
          description: string | null
          features: string[] | null
          id: string
          is_active: boolean
          max_ai_conversations: number | null
          max_memories: number | null
          name: string
          price: number
          priority_support: boolean | null
          type: string
          updated_at: string
          voice_cloning: boolean | null
          yearly_price: number | null
        }
        Insert: {
          created_at?: string
          custom_templates?: boolean | null
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean
          max_ai_conversations?: number | null
          max_memories?: number | null
          name: string
          price?: number
          priority_support?: boolean | null
          type?: string
          updated_at?: string
          voice_cloning?: boolean | null
          yearly_price?: number | null
        }
        Update: {
          created_at?: string
          custom_templates?: boolean | null
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean
          max_ai_conversations?: number | null
          max_memories?: number | null
          name?: string
          price?: number
          priority_support?: boolean | null
          type?: string
          updated_at?: string
          voice_cloning?: boolean | null
          yearly_price?: number | null
        }
        Relationships: []
      }
      subscription_requests: {
        Row: {
          admin_notes: string | null
          contact_email: string | null
          contact_name: string
          contact_phone: string
          created_at: string | null
          id: string
          institution_name: string
          institution_type: string
          message: string | null
          requested_plan: string
          resident_count: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          contact_email?: string | null
          contact_name: string
          contact_phone: string
          created_at?: string | null
          id?: string
          institution_name: string
          institution_type: string
          message?: string | null
          requested_plan: string
          resident_count?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string
          created_at?: string | null
          id?: string
          institution_name?: string
          institution_type?: string
          message?: string | null
          requested_plan?: string
          resident_count?: number | null
          status?: string | null
          updated_at?: string | null
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
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      teen_risk_referral_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          event_type: string
          id: string
          payload: Json
          referral_id: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          referral_id: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          referral_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teen_risk_referral_events_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "teen_risk_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      teen_risk_referrals: {
        Row: {
          age: number | null
          age_band: string | null
          assessment_type: string | null
          created_at: string
          detected_score: number | null
          expert_referral_url: string | null
          guardian_consent: boolean
          guardian_contact_email: string | null
          guardian_contact_phone: string | null
          guardian_notified_at: string | null
          guardian_token: string | null
          guest_session_id: string | null
          id: string
          matched_centers: Json
          notes: string | null
          region_sido: string | null
          region_sigungu: string | null
          risk_level: Database["public"]["Enums"]["teen_risk_level"]
          status: Database["public"]["Enums"]["teen_referral_status"]
          trigger_keywords: string[]
          trigger_source: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age?: number | null
          age_band?: string | null
          assessment_type?: string | null
          created_at?: string
          detected_score?: number | null
          expert_referral_url?: string | null
          guardian_consent?: boolean
          guardian_contact_email?: string | null
          guardian_contact_phone?: string | null
          guardian_notified_at?: string | null
          guardian_token?: string | null
          guest_session_id?: string | null
          id?: string
          matched_centers?: Json
          notes?: string | null
          region_sido?: string | null
          region_sigungu?: string | null
          risk_level: Database["public"]["Enums"]["teen_risk_level"]
          status?: Database["public"]["Enums"]["teen_referral_status"]
          trigger_keywords?: string[]
          trigger_source: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age?: number | null
          age_band?: string | null
          assessment_type?: string | null
          created_at?: string
          detected_score?: number | null
          expert_referral_url?: string | null
          guardian_consent?: boolean
          guardian_contact_email?: string | null
          guardian_contact_phone?: string | null
          guardian_notified_at?: string | null
          guardian_token?: string | null
          guest_session_id?: string | null
          id?: string
          matched_centers?: Json
          notes?: string | null
          region_sido?: string | null
          region_sigungu?: string | null
          risk_level?: Database["public"]["Enums"]["teen_risk_level"]
          status?: Database["public"]["Enums"]["teen_referral_status"]
          trigger_keywords?: string[]
          trigger_source?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      temperament_test_results: {
        Row: {
          answers: Json
          created_at: string
          id: string
          temperament_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          temperament_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          temperament_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      test_access_control: {
        Row: {
          access_level: string
          created_at: string | null
          id: string
          is_free: boolean
          required_subscription_type: string | null
          test_type: string
          updated_at: string | null
        }
        Insert: {
          access_level?: string
          created_at?: string | null
          id?: string
          is_free?: boolean
          required_subscription_type?: string | null
          test_type: string
          updated_at?: string | null
        }
        Update: {
          access_level?: string
          created_at?: string | null
          id?: string
          is_free?: boolean
          required_subscription_type?: string | null
          test_type?: string
          updated_at?: string | null
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
      therapy_goals: {
        Row: {
          created_at: string | null
          goal_description: string | null
          goal_title: string
          id: string
          milestones: Json | null
          priority: string | null
          progress_percentage: number | null
          status: string | null
          target_date: string | null
          therapist_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          goal_description?: string | null
          goal_title: string
          id?: string
          milestones?: Json | null
          priority?: string | null
          progress_percentage?: number | null
          status?: string | null
          target_date?: string | null
          therapist_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          goal_description?: string | null
          goal_title?: string
          id?: string
          milestones?: Json | null
          priority?: string | null
          progress_percentage?: number | null
          status?: string | null
          target_date?: string | null
          therapist_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      therapy_insights: {
        Row: {
          ai_generated: boolean | null
          confidence_score: number | null
          created_at: string | null
          id: string
          insight_content: string
          insight_type: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          insight_content: string
          insight_type?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          insight_content?: string
          insight_type?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapy_insights_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapy_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      therapy_institutions: {
        Row: {
          address: string | null
          business_type: string
          created_at: string
          detailed_info: Json | null
          id: string
          institution_name: string
          is_public: boolean | null
          latitude: number | null
          longitude: number | null
          phone: string | null
          quality_grade: string | null
          rating: number | null
          service_type: string | null
          sido: string
          sigungu: string
          staff_count: number | null
          updated_at: string
          user_count: number | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          business_type: string
          created_at?: string
          detailed_info?: Json | null
          id?: string
          institution_name: string
          is_public?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          quality_grade?: string | null
          rating?: number | null
          service_type?: string | null
          sido: string
          sigungu: string
          staff_count?: number | null
          updated_at?: string
          user_count?: number | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          business_type?: string
          created_at?: string
          detailed_info?: Json | null
          id?: string
          institution_name?: string
          is_public?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          quality_grade?: string | null
          rating?: number | null
          service_type?: string | null
          sido?: string
          sigungu?: string
          staff_count?: number | null
          updated_at?: string
          user_count?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      therapy_sessions: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          homework_assigned: string[] | null
          id: string
          key_insights: string[] | null
          mood_after: number | null
          mood_before: number | null
          next_session_goals: string[] | null
          progress_rating: number | null
          session_date: string
          session_notes: string | null
          session_number: number
          therapist_observations: string | null
          therapist_type: string
          updated_at: string | null
          user_concern: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          homework_assigned?: string[] | null
          id?: string
          key_insights?: string[] | null
          mood_after?: number | null
          mood_before?: number | null
          next_session_goals?: string[] | null
          progress_rating?: number | null
          session_date?: string
          session_notes?: string | null
          session_number?: number
          therapist_observations?: string | null
          therapist_type: string
          updated_at?: string | null
          user_concern?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          homework_assigned?: string[] | null
          id?: string
          key_insights?: string[] | null
          mood_after?: number | null
          mood_before?: number | null
          next_session_goals?: string[] | null
          progress_rating?: number | null
          session_date?: string
          session_notes?: string | null
          session_number?: number
          therapist_observations?: string | null
          therapist_type?: string
          updated_at?: string | null
          user_concern?: string | null
          user_id?: string
        }
        Relationships: []
      }
      therapy_techniques_log: {
        Row: {
          client_response: string | null
          created_at: string | null
          effectiveness_rating: number | null
          id: string
          session_id: string | null
          technique_category: string | null
          technique_name: string
          therapist_notes: string | null
        }
        Insert: {
          client_response?: string | null
          created_at?: string | null
          effectiveness_rating?: number | null
          id?: string
          session_id?: string | null
          technique_category?: string | null
          technique_name: string
          therapist_notes?: string | null
        }
        Update: {
          client_response?: string | null
          created_at?: string | null
          effectiveness_rating?: number | null
          id?: string
          session_id?: string | null
          technique_category?: string | null
          technique_name?: string
          therapist_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapy_techniques_log_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapy_sessions"
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
          bonus_tokens: number
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
          bonus_tokens?: number
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
          bonus_tokens?: number
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
      token_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          description: string | null
          expires_at: string | null
          feature_type: string | null
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          feature_type?: string | null
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          feature_type?: string | null
          id?: string
          transaction_type?: string
          user_id?: string
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
      toss_payments: {
        Row: {
          amount: number
          approved_at: string | null
          cancel_reason: string | null
          cancelled_at: string | null
          created_at: string
          id: string
          order_id: string
          payment_key: string
          payment_method: string | null
          receipt_url: string | null
          status: string
          tokens_purchased: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          id?: string
          order_id: string
          payment_key: string
          payment_method?: string | null
          receipt_url?: string | null
          status?: string
          tokens_purchased: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          id?: string
          order_id?: string
          payment_key?: string
          payment_method?: string | null
          receipt_url?: string | null
          status?: string
          tokens_purchased?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      urgent_expert_requests: {
        Row: {
          created_at: string | null
          crisis_alert_id: string | null
          id: string
          matched_at: string | null
          matched_expert_id: string | null
          preferred_method: string | null
          request_type: string
          specialization_needed: string[] | null
          status: string | null
          updated_at: string | null
          urgency_fee: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          crisis_alert_id?: string | null
          id?: string
          matched_at?: string | null
          matched_expert_id?: string | null
          preferred_method?: string | null
          request_type?: string
          specialization_needed?: string[] | null
          status?: string | null
          updated_at?: string | null
          urgency_fee?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          crisis_alert_id?: string | null
          id?: string
          matched_at?: string | null
          matched_expert_id?: string | null
          preferred_method?: string | null
          request_type?: string
          specialization_needed?: string[] | null
          status?: string | null
          updated_at?: string | null
          urgency_fee?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "urgent_expert_requests_crisis_alert_id_fkey"
            columns: ["crisis_alert_id"]
            isOneToOne: false
            referencedRelation: "crisis_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "urgent_expert_requests_matched_expert_id_fkey"
            columns: ["matched_expert_id"]
            isOneToOne: false
            referencedRelation: "expert_booking_stats"
            referencedColumns: ["expert_id"]
          },
          {
            foreignKeyName: "urgent_expert_requests_matched_expert_id_fkey"
            columns: ["matched_expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
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
      user_analytics_events: {
        Row: {
          created_at: string
          event_name: string
          event_properties: Json | null
          id: string
          ip_address: unknown
          page_path: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          event_properties?: Json | null
          id?: string
          ip_address?: unknown
          page_path?: string | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          event_properties?: Json | null
          id?: string
          ip_address?: unknown
          page_path?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_book_builder_projects: {
        Row: {
          book_type: string
          created_at: string | null
          current_step: number | null
          id: string
          last_modified: string | null
          project_data: Json
          title: string
          user_id: string
        }
        Insert: {
          book_type: string
          created_at?: string | null
          current_step?: number | null
          id?: string
          last_modified?: string | null
          project_data?: Json
          title: string
          user_id: string
        }
        Update: {
          book_type?: string
          created_at?: string | null
          current_step?: number | null
          id?: string
          last_modified?: string | null
          project_data?: Json
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_book_chapters: {
        Row: {
          book_id: string
          chapter_number: number
          content: string | null
          created_at: string
          id: string
          is_ai_generated: boolean | null
          is_completed: boolean | null
          keywords: string[] | null
          title: string
          updated_at: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          book_id: string
          chapter_number: number
          content?: string | null
          created_at?: string
          id?: string
          is_ai_generated?: boolean | null
          is_completed?: boolean | null
          keywords?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          book_id?: string
          chapter_number?: number
          content?: string | null
          created_at?: string
          id?: string
          is_ai_generated?: boolean | null
          is_completed?: boolean | null
          keywords?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_book_chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "user_books"
            referencedColumns: ["id"]
          },
        ]
      }
      user_books: {
        Row: {
          completed_chapters: number | null
          created_at: string
          id: string
          keywords: string
          status: string | null
          title: string
          topic: string
          total_chapters: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_chapters?: number | null
          created_at?: string
          id?: string
          keywords: string
          status?: string | null
          title: string
          topic: string
          total_chapters?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_chapters?: number | null
          created_at?: string
          id?: string
          keywords?: string
          status?: string | null
          title?: string
          topic?: string
          total_chapters?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          id: string
          joined_at: string
          points_earned: number
          progress: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          joined_at?: string
          points_earned?: number
          progress?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          joined_at?: string
          points_earned?: number
          progress?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_child_profiles: {
        Row: {
          birth_date: string
          child_nickname: string
          created_at: string
          goal_text: string | null
          id: string
          pain_points: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date: string
          child_nickname: string
          created_at?: string
          goal_text?: string | null
          id?: string
          pain_points?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string
          child_nickname?: string
          created_at?: string
          goal_text?: string | null
          id?: string
          pain_points?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_coaching_goals: {
        Row: {
          created_at: string
          current_day: number
          daily_email_opt_in: boolean
          end_date: string | null
          goal_category: string
          goal_description: string | null
          id: string
          is_active: boolean
          preferred_send_hour: number
          start_date: string
          target_age_group: string | null
          total_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_day?: number
          daily_email_opt_in?: boolean
          end_date?: string | null
          goal_category: string
          goal_description?: string | null
          id?: string
          is_active?: boolean
          preferred_send_hour?: number
          start_date?: string
          target_age_group?: string | null
          total_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_day?: number
          daily_email_opt_in?: boolean
          end_date?: string | null
          goal_category?: string
          goal_description?: string | null
          id?: string
          is_active?: boolean
          preferred_send_hour?: number
          start_date?: string
          target_age_group?: string | null
          total_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_cohorts: {
        Row: {
          acquisition_channel: string | null
          cohort_date: string
          created_at: string
          first_activity_type: string | null
          id: string
          lifetime_value: number | null
          retention_day_1: boolean | null
          retention_day_30: boolean | null
          retention_day_7: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acquisition_channel?: string | null
          cohort_date: string
          created_at?: string
          first_activity_type?: string | null
          id?: string
          lifetime_value?: number | null
          retention_day_1?: boolean | null
          retention_day_30?: boolean | null
          retention_day_7?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acquisition_channel?: string | null
          cohort_date?: string
          created_at?: string
          first_activity_type?: string | null
          id?: string
          lifetime_value?: number | null
          retention_day_1?: boolean | null
          retention_day_30?: boolean | null
          retention_day_7?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_consultation_credits: {
        Row: {
          created_at: string | null
          credit_amount: number
          expires_at: string | null
          granted_at: string
          id: string
          offering_key: string
          source: string
          used_at: string | null
          used_booking_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credit_amount?: number
          expires_at?: string | null
          granted_at?: string
          id?: string
          offering_key: string
          source: string
          used_at?: string | null
          used_booking_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credit_amount?: number
          expires_at?: string | null
          granted_at?: string
          id?: string
          offering_key?: string
          source?: string
          used_at?: string | null
          used_booking_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_experiment_assignments: {
        Row: {
          assigned_at: string
          experiment_id: string
          id: string
          user_id: string
          variant_name: string
        }
        Insert: {
          assigned_at?: string
          experiment_id: string
          id?: string
          user_id: string
          variant_name: string
        }
        Update: {
          assigned_at?: string
          experiment_id?: string
          id?: string
          user_id?: string
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_experiment_assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "ab_test_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          expert_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expert_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expert_id?: string
          id?: string
          user_id?: string
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
      user_free_trials: {
        Row: {
          created_at: string
          id: string
          is_converted: boolean | null
          plan_type: string
          trial_ends_at: string
          trial_started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_converted?: boolean | null
          plan_type?: string
          trial_ends_at: string
          trial_started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_converted?: boolean | null
          plan_type?: string
          trial_ends_at?: string
          trial_started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_growth_points: {
        Row: {
          challenge_points: number | null
          created_at: string
          current_rank: number | null
          id: string
          last_activity_date: string | null
          reversal_points: number | null
          story_points: number | null
          streak_days: number | null
          total_points: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_points?: number | null
          created_at?: string
          current_rank?: number | null
          id?: string
          last_activity_date?: string | null
          reversal_points?: number | null
          story_points?: number | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_points?: number | null
          created_at?: string
          current_rank?: number | null
          id?: string
          last_activity_date?: string | null
          reversal_points?: number | null
          story_points?: number | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_life_achievement_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          is_new: boolean | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          is_new?: boolean | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          is_new?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_life_achievement_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "life_achievement_badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_memory: {
        Row: {
          created_at: string
          family_context: Json | null
          id: string
          long_term_memory: Json | null
          short_term_memory: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          family_context?: Json | null
          id?: string
          long_term_memory?: Json | null
          short_term_memory?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          family_context?: Json | null
          id?: string
          long_term_memory?: Json | null
          short_term_memory?: Json | null
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
      user_notifications: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "consultation_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding_data: {
        Row: {
          baseline_answers: Json | null
          child_age: number | null
          child_gender: string | null
          concern_keywords: string[] | null
          created_at: string
          id: string
          onboarding_completed_at: string | null
          subject_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          baseline_answers?: Json | null
          child_age?: number | null
          child_gender?: string | null
          concern_keywords?: string[] | null
          created_at?: string
          id?: string
          onboarding_completed_at?: string | null
          subject_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          baseline_answers?: Json | null
          child_age?: number | null
          child_gender?: string | null
          concern_keywords?: string[] | null
          created_at?: string
          id?: string
          onboarding_completed_at?: string | null
          subject_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_packages: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          package_id: string
          purchased_at: string | null
          sessions_remaining: number
          sessions_total: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          package_id: string
          purchased_at?: string | null
          sessions_remaining: number
          sessions_total: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          package_id?: string
          purchased_at?: string | null
          sessions_remaining?: number
          sessions_total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "consultation_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          created_at: string
          id: string
          level_name: string
          level_number: number
          points_this_month: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level_name?: string
          level_number?: number
          points_this_month?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level_name?: string
          level_number?: number
          points_this_month?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          referral_code: string
          referred_by_code: string | null
          tokens: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          referral_code: string
          referred_by_code?: string | null
          tokens?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          referral_code?: string
          referred_by_code?: string | null
          tokens?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          total_bonus_tokens: number | null
          total_invites: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          total_bonus_tokens?: number | null
          total_invites?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          total_bonus_tokens?: number | null
          total_invites?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_report_credits: {
        Row: {
          created_at: string
          credits: number
          id: string
          payment_id: string | null
          source: string
          used_at: string | null
          used_credits: number
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          id?: string
          payment_id?: string | null
          source?: string
          used_at?: string | null
          used_credits?: number
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          payment_id?: string | null
          source?: string
          used_at?: string | null
          used_credits?: number
          user_id?: string
        }
        Relationships: []
      }
      user_reward_points: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_earned: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_rewards: {
        Row: {
          created_at: string | null
          id: string
          last_activity_date: string | null
          points: number | null
          policy_id: string | null
          streak_days: number | null
          tier: string | null
          total_earned: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_activity_date?: string | null
          points?: number | null
          policy_id?: string | null
          streak_days?: number | null
          tier?: string | null
          total_earned?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_activity_date?: string | null
          points?: number | null
          policy_id?: string | null
          streak_days?: number | null
          tier?: string | null
          total_earned?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "insurance_policies"
            referencedColumns: ["id"]
          },
        ]
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
          is_lifetime: boolean | null
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
          is_lifetime?: boolean | null
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
          is_lifetime?: boolean | null
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
      user_test_credits: {
        Row: {
          created_at: string
          credits: number
          id: string
          payment_id: string | null
          source: string
          used_at: string | null
          used_credits: number
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          id?: string
          payment_id?: string | null
          source?: string
          used_at?: string | null
          used_credits?: number
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          payment_id?: string | null
          source?: string
          used_at?: string | null
          used_credits?: number
          user_id?: string
        }
        Relationships: []
      }
      user_tokens: {
        Row: {
          created_at: string
          current_tokens: number
          expiring_tokens: Json | null
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
          expiring_tokens?: Json | null
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
          expiring_tokens?: Json | null
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
      user_video_preferences: {
        Row: {
          created_at: string
          difficulty_level: string
          interest_topics: string[]
          language: string
          preferred_duration: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty_level?: string
          interest_topics?: string[]
          language?: string
          preferred_duration?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty_level?: string
          interest_topics?: string[]
          language?: string
          preferred_duration?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_vouchers: {
        Row: {
          created_at: string
          expire_date: string
          id: string
          issue_date: string
          notes: string | null
          remaining_amount: number
          remaining_sessions: number
          status: string
          total_amount: number
          total_sessions: number
          updated_at: string
          used_amount: number
          used_sessions: number
          user_id: string
          voucher_number: string
          voucher_type_id: string
        }
        Insert: {
          created_at?: string
          expire_date: string
          id?: string
          issue_date: string
          notes?: string | null
          remaining_amount?: number
          remaining_sessions?: number
          status?: string
          total_amount?: number
          total_sessions?: number
          updated_at?: string
          used_amount?: number
          used_sessions?: number
          user_id: string
          voucher_number: string
          voucher_type_id: string
        }
        Update: {
          created_at?: string
          expire_date?: string
          id?: string
          issue_date?: string
          notes?: string | null
          remaining_amount?: number
          remaining_sessions?: number
          status?: string
          total_amount?: number
          total_sessions?: number
          updated_at?: string
          used_amount?: number
          used_sessions?: number
          user_id?: string
          voucher_number?: string
          voucher_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_vouchers_voucher_type"
            columns: ["voucher_type_id"]
            isOneToOne: false
            referencedRelation: "voucher_types"
            referencedColumns: ["id"]
          },
        ]
      }
      viral_shares: {
        Row: {
          content_id: string
          content_type: string
          conversion_tracked: boolean | null
          created_at: string
          id: string
          recipient_info: Json | null
          share_platform: string
          share_url: string | null
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          conversion_tracked?: boolean | null
          created_at?: string
          id?: string
          recipient_info?: Json | null
          share_platform: string
          share_url?: string | null
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          conversion_tracked?: boolean | null
          created_at?: string
          id?: string
          recipient_info?: Json | null
          share_platform?: string
          share_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      visual_notes: {
        Row: {
          background_image_url: string | null
          created_at: string
          id: string
          source_type: string
          summary_data: Json
          title: string
          user_id: string
        }
        Insert: {
          background_image_url?: string | null
          created_at?: string
          id?: string
          source_type?: string
          summary_data: Json
          title: string
          user_id: string
        }
        Update: {
          background_image_url?: string | null
          created_at?: string
          id?: string
          source_type?: string
          summary_data?: Json
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_counseling_sessions: {
        Row: {
          created_at: string
          duration_seconds: number
          ended_at: string
          id: string
          message_count: number
          started_at: string
          summary: string | null
          title: string | null
          transcript: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number
          ended_at?: string
          id?: string
          message_count?: number
          started_at?: string
          summary?: string | null
          title?: string | null
          transcript?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          ended_at?: string
          id?: string
          message_count?: number
          started_at?: string
          summary?: string | null
          title?: string | null
          transcript?: Json
          user_id?: string
        }
        Relationships: []
      }
      voice_diary_entries: {
        Row: {
          audio_duration: number | null
          audio_url: string | null
          created_at: string
          diary_date: string
          emotion_analysis: Json | null
          id: string
          title: string | null
          transcription: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_duration?: number | null
          audio_url?: string | null
          created_at?: string
          diary_date?: string
          emotion_analysis?: Json | null
          id?: string
          title?: string | null
          transcription?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_duration?: number | null
          audio_url?: string | null
          created_at?: string
          diary_date?: string
          emotion_analysis?: Json | null
          id?: string
          title?: string | null
          transcription?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voucher_audit_categories: {
        Row: {
          category: string
          created_at: string
          id: string
          is_mandatory: boolean | null
          voucher_type_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_mandatory?: boolean | null
          voucher_type_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_mandatory?: boolean | null
          voucher_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voucher_audit_categories_voucher_type_id_fkey"
            columns: ["voucher_type_id"]
            isOneToOne: false
            referencedRelation: "voucher_types"
            referencedColumns: ["id"]
          },
        ]
      }
      voucher_audit_items: {
        Row: {
          category: string
          check_frequency: string | null
          created_at: string | null
          description: string | null
          id: string
          is_critical: boolean | null
          item_name: string
          legal_basis: string | null
          penalty_info: string | null
          preparation_days: number | null
          voucher_type_id: string | null
        }
        Insert: {
          category: string
          check_frequency?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_critical?: boolean | null
          item_name: string
          legal_basis?: string | null
          penalty_info?: string | null
          preparation_days?: number | null
          voucher_type_id?: string | null
        }
        Update: {
          category?: string
          check_frequency?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_critical?: boolean | null
          item_name?: string
          legal_basis?: string | null
          penalty_info?: string | null
          preparation_days?: number | null
          voucher_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voucher_audit_items_voucher_type_id_fkey"
            columns: ["voucher_type_id"]
            isOneToOne: false
            referencedRelation: "voucher_types"
            referencedColumns: ["id"]
          },
        ]
      }
      voucher_audit_requirements: {
        Row: {
          additional_notes: string | null
          audit_item_id: string
          created_at: string
          id: string
          is_mandatory: boolean | null
          voucher_type_id: string
        }
        Insert: {
          additional_notes?: string | null
          audit_item_id: string
          created_at?: string
          id?: string
          is_mandatory?: boolean | null
          voucher_type_id: string
        }
        Update: {
          additional_notes?: string | null
          audit_item_id?: string
          created_at?: string
          id?: string
          is_mandatory?: boolean | null
          voucher_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voucher_audit_requirements_audit_item_id_fkey"
            columns: ["audit_item_id"]
            isOneToOne: false
            referencedRelation: "audit_checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_audit_requirements_voucher_type_id_fkey"
            columns: ["voucher_type_id"]
            isOneToOne: false
            referencedRelation: "voucher_types"
            referencedColumns: ["id"]
          },
        ]
      }
      voucher_directory: {
        Row: {
          address: string | null
          business_no: string | null
          city: string | null
          created_at: string
          district: string | null
          id: string
          org_name: string
          org_name_normalized: string | null
          raw: Json | null
          source_year: string | null
          synced_at: string
          voucher_type: string
        }
        Insert: {
          address?: string | null
          business_no?: string | null
          city?: string | null
          created_at?: string
          district?: string | null
          id?: string
          org_name: string
          org_name_normalized?: string | null
          raw?: Json | null
          source_year?: string | null
          synced_at?: string
          voucher_type: string
        }
        Update: {
          address?: string | null
          business_no?: string | null
          city?: string | null
          created_at?: string
          district?: string | null
          id?: string
          org_name?: string
          org_name_normalized?: string | null
          raw?: Json | null
          source_year?: string | null
          synced_at?: string
          voucher_type?: string
        }
        Relationships: []
      }
      voucher_sync_logs: {
        Row: {
          created_at: string
          duration_ms: number | null
          errors: Json | null
          id: string
          matched: number
          run_at: string
          total: number
          triggered_by: string | null
          unmatched: number
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          errors?: Json | null
          id?: string
          matched?: number
          run_at?: string
          total?: number
          triggered_by?: string | null
          unmatched?: number
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          errors?: Json | null
          id?: string
          matched?: number
          run_at?: string
          total?: number
          triggered_by?: string | null
          unmatched?: number
        }
        Relationships: []
      }
      voucher_types: {
        Row: {
          age_max: number | null
          age_min: number | null
          billing_cycle: string | null
          created_at: string
          description: string | null
          eligibility_criteria: Json | null
          government_agency: string | null
          id: string
          is_active: boolean
          monthly_amount: number
          name: string
          required_documents: string[] | null
          session_limit: number
          updated_at: string
          voucher_code: string | null
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          billing_cycle?: string | null
          created_at?: string
          description?: string | null
          eligibility_criteria?: Json | null
          government_agency?: string | null
          id?: string
          is_active?: boolean
          monthly_amount?: number
          name: string
          required_documents?: string[] | null
          session_limit?: number
          updated_at?: string
          voucher_code?: string | null
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          billing_cycle?: string | null
          created_at?: string
          description?: string | null
          eligibility_criteria?: Json | null
          government_agency?: string | null
          id?: string
          is_active?: boolean
          monthly_amount?: number
          name?: string
          required_documents?: string[] | null
          session_limit?: number
          updated_at?: string
          voucher_code?: string | null
        }
        Relationships: []
      }
      voucher_usage_records: {
        Row: {
          amount: number | null
          approval_date: string | null
          created_at: string
          facility_id: string
          id: string
          notes: string | null
          resident_id: string | null
          service_duration_minutes: number | null
          service_type: string
          status: string | null
          submission_date: string | null
          usage_date: string
          voucher_type_id: string
        }
        Insert: {
          amount?: number | null
          approval_date?: string | null
          created_at?: string
          facility_id: string
          id?: string
          notes?: string | null
          resident_id?: string | null
          service_duration_minutes?: number | null
          service_type: string
          status?: string | null
          submission_date?: string | null
          usage_date: string
          voucher_type_id: string
        }
        Update: {
          amount?: number | null
          approval_date?: string | null
          created_at?: string
          facility_id?: string
          id?: string
          notes?: string | null
          resident_id?: string | null
          service_duration_minutes?: number | null
          service_type?: string
          status?: string | null
          submission_date?: string | null
          usage_date?: string
          voucher_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voucher_usage_records_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_usage_records_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_usage_records_voucher_type_id_fkey"
            columns: ["voucher_type_id"]
            isOneToOne: false
            referencedRelation: "voucher_types"
            referencedColumns: ["id"]
          },
        ]
      }
      website_orders: {
        Row: {
          admin_notes: string | null
          created_at: string
          estimated_completion_date: string | null
          id: string
          order_data: Json
          status: string
          stripe_payment_id: string | null
          total_price: number
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          estimated_completion_date?: string | null
          id?: string
          order_data: Json
          status?: string
          stripe_payment_id?: string | null
          total_price: number
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          estimated_completion_date?: string | null
          id?: string
          order_data?: Json
          status?: string
          stripe_payment_id?: string | null
          total_price?: number
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      wee_center_directory: {
        Row: {
          address: string | null
          center_type: Database["public"]["Enums"]["wee_center_type"]
          created_at: string
          hours: string | null
          id: string
          is_active: boolean
          lat: number | null
          lng: number | null
          name: string
          phone: string | null
          region_sido: string
          region_sigungu: string | null
          source: string | null
          source_updated_at: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          center_type: Database["public"]["Enums"]["wee_center_type"]
          created_at?: string
          hours?: string | null
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          name: string
          phone?: string | null
          region_sido: string
          region_sigungu?: string | null
          source?: string | null
          source_updated_at?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          center_type?: Database["public"]["Enums"]["wee_center_type"]
          created_at?: string
          hours?: string | null
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string | null
          region_sido?: string
          region_sigungu?: string | null
          source?: string | null
          source_updated_at?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      weekly_mission_completions: {
        Row: {
          completed_missions: number
          created_at: string
          id: string
          is_week_completed: boolean
          tokens_awarded: number
          total_missions: number
          updated_at: string
          user_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          completed_missions?: number
          created_at?: string
          id?: string
          is_week_completed?: boolean
          tokens_awarded?: number
          total_missions?: number
          updated_at?: string
          user_id: string
          week_end: string
          week_start: string
        }
        Update: {
          completed_missions?: number
          created_at?: string
          id?: string
          is_week_completed?: boolean
          tokens_awarded?: number
          total_missions?: number
          updated_at?: string
          user_id?: string
          week_end?: string
          week_start?: string
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
      welfare_services: {
        Row: {
          age_range: string | null
          application_deadline: string | null
          application_method: string | null
          benefits: string
          budget_info: string | null
          contact_info: Json | null
          created_at: string
          description: string
          eligibility_criteria: string
          id: string
          is_active: boolean
          region: string | null
          required_documents: string[] | null
          service_name: string
          service_period: string | null
          service_type: string
          target_group: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          age_range?: string | null
          application_deadline?: string | null
          application_method?: string | null
          benefits: string
          budget_info?: string | null
          contact_info?: Json | null
          created_at?: string
          description: string
          eligibility_criteria: string
          id?: string
          is_active?: boolean
          region?: string | null
          required_documents?: string[] | null
          service_name: string
          service_period?: string | null
          service_type: string
          target_group: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          age_range?: string | null
          application_deadline?: string | null
          application_method?: string | null
          benefits?: string
          budget_info?: string | null
          contact_info?: Json | null
          created_at?: string
          description?: string
          eligibility_criteria?: string
          id?: string
          is_active?: boolean
          region?: string | null
          required_documents?: string[] | null
          service_name?: string
          service_period?: string | null
          service_type?: string
          target_group?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      wellness_prevention_scores: {
        Row: {
          analysis_data: Json | null
          created_at: string | null
          current_status: string
          id: string
          key_message: string | null
          predictions: Json
          prevention_tips: string[] | null
          risk_factors: string[] | null
          score: number
          score_level: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          created_at?: string | null
          current_status: string
          id?: string
          key_message?: string | null
          predictions?: Json
          prevention_tips?: string[] | null
          risk_factors?: string[] | null
          score: number
          score_level: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          created_at?: string | null
          current_status?: string
          id?: string
          key_message?: string | null
          predictions?: Json
          prevention_tips?: string[] | null
          risk_factors?: string[] | null
          score?: number
          score_level?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      youtube_production_orders: {
        Row: {
          additional_requirements: string | null
          admin_notes: string | null
          base_price: number
          business_plan_data: Json | null
          channel_name: string
          contact_email: string
          contact_phone: string
          created_at: string | null
          discount_rate: number
          final_price: number
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_requirements?: string | null
          admin_notes?: string | null
          base_price: number
          business_plan_data?: Json | null
          channel_name: string
          contact_email: string
          contact_phone: string
          created_at?: string | null
          discount_rate?: number
          final_price: number
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_requirements?: string | null
          admin_notes?: string | null
          base_price?: number
          business_plan_data?: Json | null
          channel_name?: string
          contact_email?: string
          contact_phone?: string
          created_at?: string | null
          discount_rate?: number
          final_price?: number
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      community_comments_public: {
        Row: {
          content: string | null
          created_at: string | null
          id: string | null
          is_anonymous: boolean | null
          post_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts_public"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts_public: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string | null
          id: string | null
          is_anonymous: boolean | null
          is_public: boolean | null
          likes_count: number | null
          media_urls: Json | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          media_urls?: Json | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: never
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          media_urls?: Json | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: never
        }
        Relationships: []
      }
      expert_booking_stats: {
        Row: {
          average_rating: number | null
          cancellation_rate: number | null
          cancelled_bookings: number | null
          completed_bookings: number | null
          confirmed_bookings: number | null
          expert_id: string | null
          review_count: number | null
          total_bookings: number | null
          total_tokens_earned: number | null
          user_id: string | null
        }
        Relationships: []
      }
      mind_track_video_event_stats: {
        Row: {
          click_count: number | null
          complete_count: number | null
          day_number: number | null
          last_event_at: string | null
          start_count: number | null
          unique_users: number | null
          video_id: string | null
          video_title: string | null
        }
        Relationships: []
      }
      partner_institutions_public: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          established_year: number | null
          gallery_images: string[] | null
          id: string | null
          institution_type: string | null
          is_voucher_approved: boolean | null
          latitude: number | null
          longitude: number | null
          name: string | null
          operating_hours: Json | null
          partnership_status: string | null
          profile_image_url: string | null
          rating: number | null
          review_count: number | null
          services_offered: string[] | null
          total_experts: number | null
          updated_at: string | null
          voucher_types: string[] | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          established_year?: number | null
          gallery_images?: string[] | null
          id?: string | null
          institution_type?: string | null
          is_voucher_approved?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          operating_hours?: Json | null
          partnership_status?: string | null
          profile_image_url?: string | null
          rating?: number | null
          review_count?: number | null
          services_offered?: string[] | null
          total_experts?: number | null
          updated_at?: string | null
          voucher_types?: string[] | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          established_year?: number | null
          gallery_images?: string[] | null
          id?: string | null
          institution_type?: string | null
          is_voucher_approved?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          operating_hours?: Json | null
          partnership_status?: string | null
          profile_image_url?: string | null
          rating?: number | null
          review_count?: number | null
          services_offered?: string[] | null
          total_experts?: number | null
          updated_at?: string | null
          voucher_types?: string[] | null
          website_url?: string | null
        }
        Relationships: []
      }
      v_b2b_company_overview: {
        Row: {
          at_risk_employees: number | null
          at_risk_sessions: number | null
          avg_burnout: number | null
          avg_satisfaction: number | null
          avg_stress: number | null
          institution_id: string | null
          last_session_at: string | null
          total_employees: number | null
          total_sessions: number | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_jobcoach_employee_sessions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      v_b2b_dept_weekly_aggregates: {
        Row: {
          at_risk_count: number | null
          avg_burnout: number | null
          avg_satisfaction: number | null
          avg_stress: number | null
          department_code: string | null
          employee_count: number | null
          institution_id: string | null
          is_visible: boolean | null
          session_count: number | null
          week_start: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_jobcoach_employee_sessions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "b2b_partner_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_center_invite: {
        Args: { _token: string }
        Returns: {
          address: string | null
          business_no: string | null
          contract_expires_at: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
          phone: string | null
          plan: string
          storefront_slug: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
          trial_status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "center_organizations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      add_daily_tokens: { Args: never; Returns: undefined }
      add_reward_points: {
        Args: {
          p_action_type: string
          p_description?: string
          p_metadata?: Json
          p_points: number
          p_user_id: string
        }
        Returns: Json
      }
      add_tokens: {
        Args: {
          p_amount: number
          p_description?: string
          p_transaction_type?: string
          p_user_id: string
        }
        Returns: Json
      }
      admin_add_tokens: {
        Args: { target_user_id: string; token_amount: number }
        Returns: boolean
      }
      admin_view_bank_transfer_requests: {
        Args: { access_reason?: string; limit_count?: number }
        Returns: {
          created_at: string
          id: string
          masked_bank_name: string
          masked_depositor_name: string
          requested_tokens: number
          status: string
          transfer_amount: number
          user_email: string
        }[]
      }
      admin_view_expert_application: {
        Args: { access_reason?: string; application_id: string }
        Returns: {
          application_status: string
          created_at: string
          email: string
          full_name: string
          id: string
          specializations: string[]
          updated_at: string
          user_id: string
          years_experience: number
        }[]
      }
      admin_view_transfer_request: {
        Args: { access_reason?: string; request_id: string }
        Returns: {
          admin_note: string
          bank_name: string
          created_at: string
          depositor_name: string
          id: string
          requested_tokens: number
          status: string
          transfer_amount: number
          user_email: string
        }[]
      }
      analyze_stress_test_results: {
        Args: {
          p_age?: number
          p_answers: number[]
          p_total_score: number
          p_user_id: string
        }
        Returns: Json
      }
      apply_referral_code: {
        Args: { p_referral_code: string; p_user_id: string }
        Returns: boolean
      }
      apply_referral_code_v2: {
        Args: {
          p_device_fingerprint?: string
          p_ip_address?: string
          p_referral_code: string
          p_user_id: string
        }
        Returns: boolean
      }
      assign_institution_admin: {
        Args: { institution_id: string; target_user_id: string }
        Returns: boolean
      }
      calculate_consultation_fees: {
        Args: { p_amount: number; p_booking_type?: string }
        Returns: {
          commission_rate: number
          expert_earning: number
          platform_fee: number
        }[]
      }
      calculate_daily_reward_points: {
        Args: { p_entry_date: string; p_user_id: string }
        Returns: number
      }
      calculate_mind_condition_score: {
        Args: { p_user_id: string }
        Returns: Json
      }
      calculate_weekly_brain_stats: {
        Args: { p_user_id: string; p_week_start: string }
        Returns: undefined
      }
      can_access_facility: { Args: { facility_uuid: string }; Returns: boolean }
      can_access_family_observation: {
        Args: { observation_user_id: string }
        Returns: boolean
      }
      can_access_realtime_topic: { Args: { _topic: string }; Returns: boolean }
      check_and_award_badges: {
        Args: { p_result_id: string; p_user_id: string }
        Returns: undefined
      }
      check_attendance: { Args: { p_user_id: string }; Returns: Json }
      check_daily_referral_limit: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_email_availability: {
        Args: { check_email: string }
        Returns: boolean
      }
      check_nickname_availability: {
        Args: { nickname: string }
        Returns: boolean
      }
      check_phone_availability: {
        Args: { phone_number: string }
        Returns: boolean
      }
      claim_cross_promotion_reward: {
        Args: { p_service_name: string; p_verification_code: string }
        Returns: Json
      }
      claim_therapist_account: {
        Args: { _login_account: string }
        Returns: string
      }
      cleanup_expert_access_logs: { Args: never; Returns: undefined }
      cleanup_financial_audit_logs: { Args: never; Returns: undefined }
      consume_expert_hours:
        | {
            Args: {
              _delivery?: string
              _expert_id?: string
              _expert_name?: string
              _hours: number
              _note?: string
              _pack_id: string
              _session_date?: string
            }
            Returns: Json
          }
        | {
            Args: {
              _delivery?: string
              _expert_id?: string
              _expert_name?: string
              _hours: number
              _note?: string
              _pack_id: string
              _session_date?: string
            }
            Returns: Json
          }
      consume_tokens: {
        Args: {
          p_amount: number
          p_description?: string
          p_feature_type: string
          p_user_id: string
        }
        Returns: Json
      }
      create_center_invite: {
        Args: { _center_id: string; _email: string; _role?: string }
        Returns: {
          accepted_at: string | null
          accepted_by: string | null
          center_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          token: string
        }
        SetofOptions: {
          from: "*"
          to: "center_invites"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_center_org: {
        Args: { _name: string }
        Returns: {
          address: string | null
          business_no: string | null
          contract_expires_at: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
          phone: string | null
          plan: string
          storefront_slug: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
          trial_status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "center_organizations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_crisis_alert: {
        Args: {
          p_alert_type: string
          p_severity_level: string
          p_trigger_data?: Json
          p_trigger_source: string
          p_user_id: string
        }
        Returns: string
      }
      ensure_center_storefront: {
        Args: { _center_id: string }
        Returns: string
      }
      generate_center_code: { Args: never; Returns: string }
      generate_institution_join_code: {
        Args: { _institution_id: string }
        Returns: string
      }
      generate_invitation_code: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      get_admin_overview: {
        Args: never
        Returns: {
          total_observations: number
          total_tests: number
          total_tokens_in_circulation: number
          total_users: number
        }[]
      }
      get_anonymous_leaderboard: {
        Args: never
        Returns: {
          challenge_points: number
          rank: number
          reversal_points: number
          story_points: number
          total_points: number
        }[]
      }
      get_b2b_funnel_summary: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          event_count: number
          event_type: string
          page_path: string
          unique_sessions: number
        }[]
      }
      get_center_parent_report_by_token: {
        Args: { _token: string }
        Returns: {
          ai_draft_json: Json | null
          ai_summary: string | null
          center_id: string
          client_id: string
          coach_comment: string | null
          created_at: string
          edited_html: string | null
          generated_at: string | null
          html_content: string | null
          id: string
          issued_at: string | null
          metrics: Json | null
          pdf_url: string | null
          period_end: string
          period_start: string
          period_type: string
          period_yyyymm: string | null
          published_at: string | null
          sent_at: string | null
          share_token: string | null
          source_upload_ids: string[] | null
          status: string
          title: string | null
          viewed_at: string | null
          week_key: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "center_parent_reports"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_comment_likes_count: { Args: { comment_id: string }; Returns: number }
      get_community_posts_safe: {
        Args: never
        Returns: {
          author_display: string
          comments_count: number
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          is_public: boolean
          likes_count: number
          media_urls: Json
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }[]
      }
      get_department_aggregated_stats: {
        Args: { p_institution_id: string; p_period_days?: number }
        Returns: {
          avg_burnout_score: number
          avg_stress_score: number
          department_code: string
          high_risk_count: number
          is_masked: boolean
          participated_employees: number
          total_employees: number
        }[]
      }
      get_expert_stats: {
        Args: never
        Returns: {
          average_rating: number
          consultation_count: number
          full_name: string
          id: string
          specializations: string[]
          total_sessions: number
        }[]
      }
      get_feedback_statistics: {
        Args: never
        Returns: {
          average_rating: number
          positive_feedback: number
          test_type: string
          total_feedback: number
        }[]
      }
      get_monthly_usage: {
        Args: { p_feature_type: string; p_user_id: string }
        Returns: number
      }
      get_my_application_status: {
        Args: never
        Returns: {
          admin_notes: string
          application_status: string
          created_at: string
          id: string
          specializations: string[]
          updated_at: string
        }[]
      }
      get_my_linked_children: {
        Args: never
        Returns: {
          center_id: string
          center_name: string
          child_name: string
          client_id: string
        }[]
      }
      get_parent_invite_by_token: {
        Args: { p_token: string }
        Returns: {
          case_id: string
          child_age_months: number
          child_nickname: string
          curated_assessment: Json
          expires_at: string
          institution_name: string
          invite_id: string
          round_label: string
          status: string
        }[]
      }
      get_parent_report_by_token: {
        Args: { _token: string }
        Returns: {
          ai_draft_json: Json
          ai_summary: string
          center_id: string
          center_name: string
          client_id: string
          client_name: string
          coach_comment: string
          edited_html: string
          html_content: string
          id: string
          issued_at: string
          metrics: Json
          period_end: string
          period_start: string
          period_type: string
          period_yyyymm: string
          published_at: string
          status: string
          title: string
        }[]
      }
      get_partner_org_by_slug: {
        Args: { _slug: string }
        Returns: {
          id: string
          is_referral_active: boolean
          logo_url: string
          name: string
          org_type: string
          slug: string
          tagline: string
        }[]
      }
      get_payment_statistics_secure: {
        Args: never
        Returns: {
          approved_transfers: number
          average_order_value: number
          pending_transfers: number
          total_orders: number
          total_revenue: number
        }[]
      }
      get_peer_percentile: {
        Args: {
          p_age_group?: string
          p_dimension: string
          p_user_id: string
          p_user_score: number
        }
        Returns: Json
      }
      get_post_likes_count: { Args: { post_id: string }; Returns: number }
      get_public_expert_info: {
        Args: { expert_id: string }
        Returns: {
          average_rating: number
          certifications: string[]
          consultation_methods: string[]
          education_background: string[]
          hourly_rate: number
          id: string
          is_available: boolean
          is_verified: boolean
          languages: string[]
          professional_title: string
          profile_image_url: string
          sanitized_bio: string
          specializations: string[]
          total_sessions: number
          years_experience: number
        }[]
      }
      get_public_institutions: {
        Args: never
        Returns: {
          accessibility_features: string[]
          address: string
          created_at: string
          description: string
          email: string
          established_year: number
          facilities: string[]
          gallery_images: string[]
          id: string
          institution_type: string
          latitude: number
          longitude: number
          name: string
          operating_hours: Json
          parking_available: boolean
          partnership_status: string
          phone: string
          profile_image_url: string
          rating: number
          review_count: number
          services_offered: string[]
          specializations: string[]
          total_experts: number
          updated_at: string
          website_url: string
        }[]
      }
      get_referral_by_guardian_token: {
        Args: { _token: string }
        Returns: {
          age_band: string
          created_at: string
          expert_referral_url: string
          id: string
          matched_centers: Json
          region_sido: string
          region_sigungu: string
          risk_level: Database["public"]["Enums"]["teen_risk_level"]
          status: Database["public"]["Enums"]["teen_referral_status"]
        }[]
      }
      get_report_comparison: { Args: { p_user_id: string }; Returns: Json }
      get_self_check_by_share_id: {
        Args: { p_share_id: string }
        Returns: {
          answers: Json
          created_at: string
          goal_id: string
          goal_title: string
          id: string
          is_public: boolean
          level: string
          max_score: number
          questions: Json
          score: number
          share_id: string
          summary: string
        }[]
      }
      get_teen_risk_aggregates: {
        Args: { _region_sido?: string; _since?: string; _until?: string }
        Returns: {
          age_band: string
          is_masked: boolean
          region_sido: string
          region_sigungu: string
          risk_level: Database["public"]["Enums"]["teen_risk_level"]
          total_count: number
        }[]
      }
      get_transfer_statistics: {
        Args: never
        Returns: {
          average_request_amount: number
          completed_requests: number
          pending_requests: number
          total_amount_processed: number
          total_requests: number
        }[]
      }
      get_user_dashboard_data: {
        Args: { p_user_id?: string }
        Returns: {
          current_tokens: number
          display_name: string
          observation_count: number
          test_count: number
          user_id: string
        }[]
      }
      get_user_growth_with_rank: {
        Args: { p_user_id?: string }
        Returns: {
          challenge_points: number
          current_rank: number
          last_activity_date: string
          reversal_points: number
          story_points: number
          streak_days: number
          total_points: number
          updated_at: string
          user_id: string
        }[]
      }
      get_user_institution_id: { Args: { _user_id: string }; Returns: string }
      get_user_token_usage: {
        Args: { p_user_id?: string }
        Returns: {
          current_tokens: number
          monthly_usage: number
          referral_bonus: number
          total_purchased: number
          user_id: string
        }[]
      }
      grant_premium_access: {
        Args: {
          duration_days?: number
          reason?: string
          target_user_id: string
        }
        Returns: boolean
      }
      grant_subscriber_consultation_credit: {
        Args: { p_user_id: string }
        Returns: string
      }
      has_active_consent: {
        Args: { p_client_user_id: string; p_institution_id: string }
        Returns: boolean
      }
      has_center_role: {
        Args: {
          _center_id: string
          _roles: Database["public"]["Enums"]["center_role"][]
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_user_tokens: {
        Args: { p_amount: number; p_user_id: string }
        Returns: undefined
      }
      is_center_admin: {
        Args: { _center_id: string; _user_id: string }
        Returns: boolean
      }
      is_center_member: { Args: { _center_id: string }; Returns: boolean }
      is_facility_admin: { Args: { facility_uuid: string }; Returns: boolean }
      is_institution_admin:
        | {
            Args: { _institution_id: string; _user_id: string }
            Returns: boolean
          }
        | { Args: { p_institution_id: string }; Returns: boolean }
      is_partner_owner: {
        Args: { _slug: string; _user_id: string }
        Returns: boolean
      }
      is_session_participant: {
        Args: { session_uuid: string }
        Returns: boolean
      }
      make_user_admin: { Args: { target_email: string }; Returns: boolean }
      normalize_kr_phone: { Args: { _p: string }; Returns: string }
      peek_parent_report_token: {
        Args: { _token: string }
        Returns: {
          client_name: string
          exists_flag: boolean
          phone_hint: string
        }[]
      }
      process_referral_reward: {
        Args: { p_referee_id: string; p_referral_code: string }
        Returns: boolean
      }
      process_referral_reward_v2: {
        Args: {
          p_device_fingerprint?: string
          p_ip_address?: string
          p_referee_id: string
          p_referral_code: string
        }
        Returns: Json
      }
      process_verified_referral_rewards: { Args: never; Returns: number }
      redeem_join_code: {
        Args: { _code: string; _department?: string }
        Returns: Json
      }
      refresh_admin_analytics: { Args: never; Returns: undefined }
      revoke_premium_access: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      secure_cleanup_old_payment_data: { Args: never; Returns: undefined }
      spin_roulette: { Args: { p_user_id: string }; Returns: Json }
      submit_parent_assessment: {
        Args: { p_responses: Json; p_scores: Json; p_token: string }
        Returns: string
      }
      switch_mind_track_focus: {
        Args: { _enrollment_id: string; _new_focus: string }
        Returns: Json
      }
      track_feature_usage: {
        Args: { p_feature_type: string; p_user_id: string }
        Returns: undefined
      }
      track_partner_referral_click: {
        Args: { _referrer_url?: string; _slug: string; _user_agent?: string }
        Returns: undefined
      }
      upsert_parent_phone_link: {
        Args: { _child_id: string; _phone: string; _user_id: string }
        Returns: undefined
      }
      user_can_access_community: { Args: never; Returns: boolean }
      user_facility_role: {
        Args: { facility_uuid: string }
        Returns: Database["public"]["Enums"]["facility_role"]
      }
      user_has_liked_comment: { Args: { comment_id: string }; Returns: boolean }
      user_has_liked_post: { Args: { post_id: string }; Returns: boolean }
      validate_payment_session: {
        Args: { session_id: string; user_id: string }
        Returns: boolean
      }
      verify_consultation_access: {
        Args: { consultation_id: string; requesting_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_type: "parent" | "teacher" | "therapist" | "admin"
      app_role: "admin" | "expert" | "user" | "institution_admin"
      center_role: "owner" | "admin" | "therapist" | "viewer"
      center_session_status:
        | "scheduled"
        | "completed"
        | "cancelled"
        | "cancelled_carry"
        | "cancelled_makeup"
      child_dev_risk_level: "low" | "medium" | "high"
      child_mission_status: "started" | "in_progress" | "completed"
      consultation_session_status: "waiting" | "active" | "ended"
      facility_role: "owner" | "admin" | "staff" | "viewer"
      message_type: "text" | "image" | "file"
      organization_type:
        | "academy"
        | "daycare"
        | "kindergarten"
        | "development_center"
        | "none"
      subscription_type: "free" | "token_pack" | "monthly_unlimited"
      teen_referral_status:
        | "detected"
        | "guardian_consent_pending"
        | "guardian_notified"
        | "center_contacted"
        | "expert_assigned"
        | "resolved"
        | "dismissed"
      teen_risk_level: "moderate" | "high" | "critical"
      wee_center_type:
        | "wee_class"
        | "wee_center"
        | "wee_school"
        | "youth_counseling_1388"
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
      account_type: ["parent", "teacher", "therapist", "admin"],
      app_role: ["admin", "expert", "user", "institution_admin"],
      center_role: ["owner", "admin", "therapist", "viewer"],
      center_session_status: [
        "scheduled",
        "completed",
        "cancelled",
        "cancelled_carry",
        "cancelled_makeup",
      ],
      child_dev_risk_level: ["low", "medium", "high"],
      child_mission_status: ["started", "in_progress", "completed"],
      consultation_session_status: ["waiting", "active", "ended"],
      facility_role: ["owner", "admin", "staff", "viewer"],
      message_type: ["text", "image", "file"],
      organization_type: [
        "academy",
        "daycare",
        "kindergarten",
        "development_center",
        "none",
      ],
      subscription_type: ["free", "token_pack", "monthly_unlimited"],
      teen_referral_status: [
        "detected",
        "guardian_consent_pending",
        "guardian_notified",
        "center_contacted",
        "expert_assigned",
        "resolved",
        "dismissed",
      ],
      teen_risk_level: ["moderate", "high", "critical"],
      wee_center_type: [
        "wee_class",
        "wee_center",
        "wee_school",
        "youth_counseling_1388",
      ],
    },
  },
} as const
