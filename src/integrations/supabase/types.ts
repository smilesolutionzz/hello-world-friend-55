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
