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
          id: string
          profile_id: string
          results: Json | null
          risk_level: string | null
          updated_at: string
        }
        Insert: {
          age_at_assessment?: number | null
          age_group: string
          analysis?: string | null
          created_at?: string
          id?: string
          profile_id: string
          results?: Json | null
          risk_level?: string | null
          updated_at?: string
        }
        Update: {
          age_at_assessment?: number | null
          age_group?: string
          analysis?: string | null
          created_at?: string
          id?: string
          profile_id?: string
          results?: Json | null
          risk_level?: string | null
          updated_at?: string
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
          id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_results?: Json | null
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_results?: Json | null
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
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
      family_members: {
        Row: {
          age: number | null
          created_at: string
          family_id: string | null
          id: string
          name: string
          relationship: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          family_id?: string | null
          id?: string
          name: string
          relationship?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          created_at?: string
          family_id?: string | null
          id?: string
          name?: string
          relationship?: string | null
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
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
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
      user_tokens: {
        Row: {
          created_at: string
          current_tokens: number
          id: string
          total_purchased: number
          total_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_tokens?: number
          id?: string
          total_purchased?: number
          total_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_tokens?: number
          id?: string
          total_purchased?: number
          total_used?: number
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
      add_daily_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      apply_referral_code: {
        Args: { p_referral_code: string; p_user_id: string }
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
      process_referral_reward: {
        Args: { p_referee_id: string; p_referral_code: string }
        Returns: boolean
      }
      track_feature_usage: {
        Args: { p_feature_type: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
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
      subscription_type: ["free", "token_pack", "monthly_unlimited"],
    },
  },
} as const
