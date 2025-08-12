export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          created_at: string
          id: number
          pool_question_id: number | null
          question_id: number | null
          questionnaire_id: string | null
          score: number
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          pool_question_id?: number | null
          question_id?: number | null
          questionnaire_id?: string | null
          score: number
          session_id: string
        }
        Update: {
          created_at?: string
          id?: number
          pool_question_id?: number | null
          question_id?: number | null
          questionnaire_id?: string | null
          score?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_pool_question_id_fkey"
            columns: ["pool_question_id"]
            isOneToOne: false
            referencedRelation: "question_pool"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_weights: {
        Row: {
          created_at: string
          description: string | null
          gift: Database["public"]["Enums"]["gift_key"]
          id: number
          is_active: boolean
          multiplier: number
          pclass: Database["public"]["Enums"]["weight_class"]
          source: Database["public"]["Enums"]["source_type"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          gift: Database["public"]["Enums"]["gift_key"]
          id?: number
          is_active?: boolean
          multiplier?: number
          pclass: Database["public"]["Enums"]["weight_class"]
          source: Database["public"]["Enums"]["source_type"]
        }
        Update: {
          created_at?: string
          description?: string | null
          gift?: Database["public"]["Enums"]["gift_key"]
          id?: number
          is_active?: boolean
          multiplier?: number
          pclass?: Database["public"]["Enums"]["weight_class"]
          source?: Database["public"]["Enums"]["source_type"]
        }
        Relationships: []
      }
      migration_log: {
        Row: {
          description: string | null
          executed_at: string | null
          id: number
          step: string
        }
        Insert: {
          description?: string | null
          executed_at?: string | null
          id?: number
          step: string
        }
        Update: {
          description?: string | null
          executed_at?: string | null
          id?: number
          step?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      question_pool: {
        Row: {
          created_at: string
          default_weight: number
          gift: Database["public"]["Enums"]["gift_key"]
          id: number
          is_active: boolean
          pclass: Database["public"]["Enums"]["weight_class"]
          reverse_scored: boolean
          source: Database["public"]["Enums"]["source_type"]
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_weight?: number
          gift: Database["public"]["Enums"]["gift_key"]
          id?: number
          is_active?: boolean
          pclass?: Database["public"]["Enums"]["weight_class"]
          reverse_scored?: boolean
          source?: Database["public"]["Enums"]["source_type"]
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_weight?: number
          gift?: Database["public"]["Enums"]["gift_key"]
          id?: number
          is_active?: boolean
          pclass?: Database["public"]["Enums"]["weight_class"]
          reverse_scored?: boolean
          source?: Database["public"]["Enums"]["source_type"]
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      question_translations: {
        Row: {
          created_at: string
          id: number
          locale: string
          question_id: number
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          locale: string
          question_id: number
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          locale?: string
          question_id?: number
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_translations_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_pool"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean | null
          questionnaire_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          questionnaire_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          questionnaire_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      quiz_results_weighted: {
        Row: {
          avg_weighted: number | null
          gift: Database["public"]["Enums"]["gift_key"] | null
          question_count: number | null
          session_id: string | null
          total_raw: number | null
          total_weighted: number | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      v_answer_effective_weights: {
        Row: {
          answer_id: number | null
          gift: Database["public"]["Enums"]["gift_key"] | null
          matrix_multiplier: number | null
          normalized_score: number | null
          pclass: Database["public"]["Enums"]["weight_class"] | null
          pool_question_id: number | null
          question_weight: number | null
          reverse_scored: boolean | null
          score: number | null
          session_id: string | null
          source: Database["public"]["Enums"]["source_type"] | null
          weighted_score: number | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_pool_question_id_fkey"
            columns: ["pool_question_id"]
            isOneToOne: false
            referencedRelation: "question_pool"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_quiz_result: {
        Args: { p_session_id: string }
        Returns: {
          gift: Database["public"]["Enums"]["gift_key"]
          total_weighted: number
          total_raw: number
          question_count: number
          avg_weighted: number
        }[]
      }
      get_questions_by_locale: {
        Args: { target_locale?: string }
        Returns: {
          id: number
          gift: Database["public"]["Enums"]["gift_key"]
          source: Database["public"]["Enums"]["source_type"]
          pclass: Database["public"]["Enums"]["weight_class"]
          reverse_scored: boolean
          default_weight: number
          text: string
          is_active: boolean
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      validate_multilingual_system: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          status: string
          details: string
          is_critical: boolean
        }[]
      }
    }
    Enums: {
      gift_key:
        | "A_PROPHECY"
        | "B_SERVICE"
        | "C_TEACHING"
        | "D_EXHORTATION"
        | "E_GIVING"
        | "F_LEADERSHIP"
        | "G_MERCY"
      source_type:
        | "QUALITY"
        | "CHARACTERISTIC"
        | "DANGER"
        | "MISUNDERSTANDING"
        | "OTHER"
      weight_class: "P1" | "P2" | "P3"
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
      gift_key: [
        "A_PROPHECY",
        "B_SERVICE",
        "C_TEACHING",
        "D_EXHORTATION",
        "E_GIVING",
        "F_LEADERSHIP",
        "G_MERCY",
      ],
      source_type: [
        "QUALITY",
        "CHARACTERISTIC",
        "DANGER",
        "MISUNDERSTANDING",
        "OTHER",
      ],
      weight_class: ["P1", "P2", "P3"],
    },
  },
} as const
