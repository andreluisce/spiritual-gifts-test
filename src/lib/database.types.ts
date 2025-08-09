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
          question_id: number
          score: number
          session_id: string
        }
        Insert: {
          created_at?: string
          question_id: number
          score: number
          session_id: string
        }
        Update: {
          created_at?: string
          question_id?: number
          score?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
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
      biblical_activities: {
        Row: {
          activity_name: string
          biblical_reference: string | null
          biblical_text: string | null
          id: number
        }
        Insert: {
          activity_name: string
          biblical_reference?: string | null
          biblical_text?: string | null
          id?: number
        }
        Update: {
          activity_name?: string
          biblical_reference?: string | null
          biblical_text?: string | null
          id?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          description: string | null
          greek_term: string | null
          id: number
          name: string
          purpose: string | null
        }
        Insert: {
          description?: string | null
          greek_term?: string | null
          id?: number
          name: string
          purpose?: string | null
        }
        Update: {
          description?: string | null
          greek_term?: string | null
          id?: number
          name?: string
          purpose?: string | null
        }
        Relationships: []
      }
      characteristics: {
        Row: {
          characteristic: string
          gift_id: number | null
          id: number
          order_sequence: number | null
        }
        Insert: {
          characteristic: string
          gift_id?: number | null
          id?: number
          order_sequence?: number | null
        }
        Update: {
          characteristic?: string
          gift_id?: number | null
          id?: number
          order_sequence?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "characteristics_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "spiritual_gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      dangers: {
        Row: {
          danger: string
          gift_id: number | null
          id: number
          order_sequence: number | null
        }
        Insert: {
          danger: string
          gift_id?: number | null
          id?: number
          order_sequence?: number | null
        }
        Update: {
          danger?: string
          gift_id?: number | null
          id?: number
          order_sequence?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dangers_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "spiritual_gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_bridge: {
        Row: {
          gift: Database["public"]["Enums"]["gift_key"]
          spiritual_gift_id: number
        }
        Insert: {
          gift: Database["public"]["Enums"]["gift_key"]
          spiritual_gift_id: number
        }
        Update: {
          gift?: Database["public"]["Enums"]["gift_key"]
          spiritual_gift_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "gift_bridge_spiritual_gift_id_fkey"
            columns: ["spiritual_gift_id"]
            isOneToOne: false
            referencedRelation: "spiritual_gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      gifts: {
        Row: {
          description: string | null
          key: Database["public"]["Enums"]["gift_key"]
          name: string
        }
        Insert: {
          description?: string | null
          key: Database["public"]["Enums"]["gift_key"]
          name: string
        }
        Update: {
          description?: string | null
          key?: Database["public"]["Enums"]["gift_key"]
          name?: string
        }
        Relationships: []
      }
      manifestation_principles: {
        Row: {
          id: number
          order_sequence: number | null
          principle: string
        }
        Insert: {
          id?: number
          order_sequence?: number | null
          principle: string
        }
        Update: {
          id?: number
          order_sequence?: number | null
          principle?: string
        }
        Relationships: []
      }
      manifestations: {
        Row: {
          biblical_references: string | null
          classification: string | null
          definition: string | null
          id: number
          name: string
        }
        Insert: {
          biblical_references?: string | null
          classification?: string | null
          definition?: string | null
          id?: number
          name: string
        }
        Update: {
          biblical_references?: string | null
          classification?: string | null
          definition?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      ministries: {
        Row: {
          biblical_references: string | null
          definition: string | null
          id: number
          name: string
          type: string | null
        }
        Insert: {
          biblical_references?: string | null
          definition?: string | null
          id?: number
          name: string
          type?: string | null
        }
        Update: {
          biblical_references?: string | null
          definition?: string | null
          id?: number
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      misunderstandings: {
        Row: {
          gift_id: number | null
          id: number
          misunderstanding: string
          order_sequence: number | null
        }
        Insert: {
          gift_id?: number | null
          id?: number
          misunderstanding: string
          order_sequence?: number | null
        }
        Update: {
          gift_id?: number | null
          id?: number
          misunderstanding?: string
          order_sequence?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "misunderstandings_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "spiritual_gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      qualities: {
        Row: {
          description: string | null
          gift_id: number | null
          id: number
          order_sequence: number | null
          quality_name: string
        }
        Insert: {
          description?: string | null
          gift_id?: number | null
          id?: number
          order_sequence?: number | null
          quality_name: string
        }
        Update: {
          description?: string | null
          gift_id?: number | null
          id?: number
          order_sequence?: number | null
          quality_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "qualities_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "spiritual_gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      question_gift_map: {
        Row: {
          gift: Database["public"]["Enums"]["gift_key"]
          question_id: number
        }
        Insert: {
          gift: Database["public"]["Enums"]["gift_key"]
          question_id: number
        }
        Update: {
          gift?: Database["public"]["Enums"]["gift_key"]
          question_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_gift_map_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_trait_map: {
        Row: {
          question_id: number
          trait: Database["public"]["Enums"]["quiz_trait"]
        }
        Insert: {
          question_id: number
          trait: Database["public"]["Enums"]["quiz_trait"]
        }
        Update: {
          question_id?: number
          trait?: Database["public"]["Enums"]["quiz_trait"]
        }
        Relationships: [
          {
            foreignKeyName: "question_trait_map_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          id: number
          text: string
        }
        Insert: {
          id: number
          text: string
        }
        Update: {
          id?: number
          text?: string
        }
        Relationships: []
      }
      quiz_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      spiritual_gifts: {
        Row: {
          biblical_references: string | null
          category_id: number | null
          definition: string | null
          id: number
          name: string
        }
        Insert: {
          biblical_references?: string | null
          category_id?: number | null
          definition?: string | null
          id?: number
          name: string
        }
        Update: {
          biblical_references?: string | null
          category_id?: number | null
          definition?: string | null
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "spiritual_gifts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      quiz_results: {
        Row: {
          gift: Database["public"]["Enums"]["gift_key"] | null
          session_id: string | null
          total: number | null
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
      quiz_results_motivations_details: {
        Row: {
          gift: Database["public"]["Enums"]["gift_key"] | null
          gift_definition: string | null
          gift_name: string | null
          session_id: string | null
          spiritual_gift_id: number | null
          total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_bridge_spiritual_gift_id_fkey"
            columns: ["spiritual_gift_id"]
            isOneToOne: false
            referencedRelation: "spiritual_gifts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      algorithm_sign: {
        Args: { signables: string; secret: string; algorithm: string }
        Returns: string
      }
      best_gifts: {
        Args: { p_session_id: string; p_limit?: number }
        Returns: {
          gift: Database["public"]["Enums"]["gift_key"]
          total: number
        }[]
      }
      calculate_quiz_result: {
        Args: { p_session_id: string }
        Returns: {
          gift: Database["public"]["Enums"]["gift_key"]
          total: number
        }[]
      }
      sign: {
        Args: { payload: Json; secret: string; algorithm?: string }
        Returns: string
      }
      try_cast_double: {
        Args: { inp: string }
        Returns: number
      }
      url_decode: {
        Args: { data: string }
        Returns: string
      }
      url_encode: {
        Args: { data: string }
        Returns: string
      }
      verify: {
        Args: { token: string; secret: string; algorithm?: string }
        Returns: {
          header: Json
          payload: Json
          valid: boolean
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
      quiz_trait: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I"
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
      quiz_trait: ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
    },
  },
} as const
