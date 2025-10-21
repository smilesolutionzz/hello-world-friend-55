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
      b2b_inquiries: {
        Row: {
          contact_person: string
          created_at: string
          email: string
          id: string
          message: string | null
          num_users: number | null
          organization_name: string
          organization_type: string
          phone: string
          position: string | null
          service_interest: string
          status: string
          updated_at: string
        }
        Insert: {
          contact_person: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          num_users?: number | null
          organization_name: string
          organization_type: string
          phone: string
          position?: string | null
          service_interest: string
          status?: string
          updated_at?: string
        }
        Update: {
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          num_users?: number | null
          organization_name?: string
          organization_type?: string
          phone?: string
          position?: string | null
          service_interest?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
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
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
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
      legal_disclaimer_views: {
        Row: {
          id: string
          ip_address: unknown | null
          page_url: string
          user_agent: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          page_url: string
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
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
      memory_conversations: {
        Row: {
          ai_generated_image_url: string | null
          audio_narration_url: string | null
          book_chapter_id: string | null
          conversation_type: string | null
          created_at: string
          emotion_analysis: Json | null
          id: string
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
          admin_user_id: string | null
          created_at: string
          id: string
          name: string
          settings: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          admin_user_id?: string | null
          created_at?: string
          id?: string
          name: string
          settings?: Json | null
          type: string
          updated_at?: string
        }
        Update: {
          admin_user_id?: string | null
          created_at?: string
          id?: string
          name?: string
          settings?: Json | null
          type?: string
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
      profiles: {
        Row: {
          birth_date: string | null
          created_at: string
          display_name: string | null
          email: string | null
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
          email?: string | null
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
          email?: string | null
          id?: string
          phone?: string | null
          subscription_tier?: string | null
          updated_at?: string
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
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
          page_path?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
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
      voucher_types: {
        Row: {
          age_max: number | null
          age_min: number | null
          created_at: string
          description: string | null
          eligibility_criteria: Json | null
          id: string
          is_active: boolean
          monthly_amount: number
          name: string
          session_limit: number
          updated_at: string
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          created_at?: string
          description?: string | null
          eligibility_criteria?: Json | null
          id?: string
          is_active?: boolean
          monthly_amount?: number
          name: string
          session_limit?: number
          updated_at?: string
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          created_at?: string
          description?: string | null
          eligibility_criteria?: Json | null
          id?: string
          is_active?: boolean
          monthly_amount?: number
          name?: string
          session_limit?: number
          updated_at?: string
        }
        Relationships: []
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
      [_ in never]: never
    }
    Functions: {
      add_daily_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      calculate_weekly_brain_stats: {
        Args: { p_user_id: string; p_week_start: string }
        Returns: undefined
      }
      can_access_family_observation: {
        Args: { observation_user_id: string }
        Returns: boolean
      }
      check_and_award_badges: {
        Args: { p_result_id: string; p_user_id: string }
        Returns: undefined
      }
      check_daily_referral_limit: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_phone_availability: {
        Args: { phone_number: string }
        Returns: boolean
      }
      cleanup_expert_access_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_financial_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      generate_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_overview: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_observations: number
          total_tests: number
          total_tokens_in_circulation: number
          total_users: number
        }[]
      }
      get_anonymous_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          challenge_points: number
          rank: number
          reversal_points: number
          story_points: number
          total_points: number
        }[]
      }
      get_comment_likes_count: {
        Args: { comment_id: string }
        Returns: number
      }
      get_community_posts_safe: {
        Args: Record<PropertyKey, never>
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
      get_expert_stats: {
        Args: Record<PropertyKey, never>
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
        Args: Record<PropertyKey, never>
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
        Args: Record<PropertyKey, never>
        Returns: {
          admin_notes: string
          application_status: string
          created_at: string
          id: string
          specializations: string[]
          updated_at: string
        }[]
      }
      get_payment_statistics_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          approved_transfers: number
          average_order_value: number
          pending_transfers: number
          total_orders: number
          total_revenue: number
        }[]
      }
      get_post_likes_count: {
        Args: { post_id: string }
        Returns: number
      }
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
        Args: Record<PropertyKey, never>
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
      get_transfer_statistics: {
        Args: Record<PropertyKey, never>
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
      process_referral_reward_v2: {
        Args: {
          p_device_fingerprint?: string
          p_ip_address?: string
          p_referee_id: string
          p_referral_code: string
        }
        Returns: Json
      }
      process_verified_referral_rewards: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      refresh_admin_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      secure_cleanup_old_payment_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      track_feature_usage: {
        Args: { p_feature_type: string; p_user_id: string }
        Returns: undefined
      }
      user_can_access_community: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_has_liked_comment: {
        Args: { comment_id: string }
        Returns: boolean
      }
      user_has_liked_post: {
        Args: { post_id: string }
        Returns: boolean
      }
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
      app_role: "admin" | "expert" | "user"
      consultation_session_status: "waiting" | "active" | "ended"
      message_type: "text" | "image" | "file"
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
      consultation_session_status: ["waiting", "active", "ended"],
      message_type: ["text", "image", "file"],
      subscription_type: ["free", "token_pack", "monthly_unlimited"],
    },
  },
} as const
