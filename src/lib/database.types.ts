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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_analysis_cache: {
        Row: {
          ai_service_used: string
          analysis_version: string
          challenges_guidance: string | null
          confidence_score: number
          created_at: string
          development_plan: string
          gift_scores: Json
          id: string
          locale: string
          ministry_recommendations: string[] | null
          personalized_insights: string
          practical_applications: string[] | null
          primary_gifts: string[]
          session_id: string | null
          strengths_description: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_service_used?: string
          analysis_version?: string
          challenges_guidance?: string | null
          confidence_score?: number
          created_at?: string
          development_plan: string
          gift_scores: Json
          id?: string
          locale?: string
          ministry_recommendations?: string[] | null
          personalized_insights: string
          practical_applications?: string[] | null
          primary_gifts: string[]
          session_id?: string | null
          strengths_description: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_service_used?: string
          analysis_version?: string
          challenges_guidance?: string | null
          confidence_score?: number
          created_at?: string
          development_plan?: string
          gift_scores?: Json
          id?: string
          locale?: string
          ministry_recommendations?: string[] | null
          personalized_insights?: string
          practical_applications?: string[] | null
          primary_gifts?: string[]
          session_id?: string | null
          strengths_description?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_cache_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_reports: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          expires_at: string | null
          id: string
          parameters: Json | null
          report_type: string
          result: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          id?: string
          parameters?: Json | null
          report_type: string
          result?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          id?: string
          parameters?: Json | null
          report_type?: string
          result?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: number
          ip_address: unknown
          resource: string
          status: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: number
          ip_address?: unknown
          resource: string
          status?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: number
          ip_address?: unknown
          resource?: string
          status?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      biblical_activities: {
        Row: {
          activity_name: string
          biblical_reference: string | null
          biblical_text: string | null
          id: number
          key: string
          locale: string
        }
        Insert: {
          activity_name: string
          biblical_reference?: string | null
          biblical_text?: string | null
          id?: number
          key: string
          locale?: string
        }
        Update: {
          activity_name?: string
          biblical_reference?: string | null
          biblical_text?: string | null
          id?: number
          key?: string
          locale?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          description: string | null
          greek_term: string | null
          id: number
          key: string
          locale: string
          name: string
          purpose: string | null
        }
        Insert: {
          description?: string | null
          greek_term?: string | null
          id?: number
          key: string
          locale?: string
          name: string
          purpose?: string | null
        }
        Update: {
          description?: string | null
          greek_term?: string | null
          id?: number
          key?: string
          locale?: string
          name?: string
          purpose?: string | null
        }
        Relationships: []
      }
      characteristics: {
        Row: {
          characteristic: string
          gift_key: Database["public"]["Enums"]["gift_key"]
          id: number
          locale: string
          order_sequence: number | null
        }
        Insert: {
          characteristic: string
          gift_key: Database["public"]["Enums"]["gift_key"]
          id?: number
          locale?: string
          order_sequence?: number | null
        }
        Update: {
          characteristic?: string
          gift_key?: Database["public"]["Enums"]["gift_key"]
          id?: number
          locale?: string
          order_sequence?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_characteristics_gift"
            columns: ["gift_key", "locale"]
            isOneToOne: false
            referencedRelation: "spiritual_gifts"
            referencedColumns: ["gift_key", "locale"]
          },
        ]
      }
      dangers: {
        Row: {
          danger: string
          gift_key: Database["public"]["Enums"]["gift_key"]
          id: number
          locale: string
          order_sequence: number | null
        }
        Insert: {
          danger: string
          gift_key: Database["public"]["Enums"]["gift_key"]
          id?: number
          locale?: string
          order_sequence?: number | null
        }
        Update: {
          danger?: string
          gift_key?: Database["public"]["Enums"]["gift_key"]
          id?: number
          locale?: string
          order_sequence?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_dangers_gift"
            columns: ["gift_key", "locale"]
            isOneToOne: false
            referencedRelation: "spiritual_gifts"
            referencedColumns: ["gift_key", "locale"]
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
      educational_content: {
        Row: {
          biblical_reference: string | null
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          order_index: number
          section_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          biblical_reference?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index: number
          section_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          biblical_reference?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          section_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      educational_content_translations: {
        Row: {
          biblical_reference: string | null
          content: string
          content_id: string
          created_at: string | null
          id: string
          locale: string
          title: string
          updated_at: string | null
        }
        Insert: {
          biblical_reference?: string | null
          content: string
          content_id: string
          created_at?: string | null
          id?: string
          locale: string
          title: string
          updated_at?: string | null
        }
        Update: {
          biblical_reference?: string | null
          content?: string
          content_id?: string
          created_at?: string | null
          id?: string
          locale?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "educational_content_translations_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "educational_content"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_bible_verses: {
        Row: {
          context_note: string | null
          created_at: string
          gift_key: Database["public"]["Enums"]["gift_key"]
          id: string
          locale: string
          relevance_score: number | null
          updated_at: string
          verse_reference: string
          verse_text: string
        }
        Insert: {
          context_note?: string | null
          created_at?: string
          gift_key: Database["public"]["Enums"]["gift_key"]
          id?: string
          locale?: string
          relevance_score?: number | null
          updated_at?: string
          verse_reference: string
          verse_text: string
        }
        Update: {
          context_note?: string | null
          created_at?: string
          gift_key?: Database["public"]["Enums"]["gift_key"]
          id?: string
          locale?: string
          relevance_score?: number | null
          updated_at?: string
          verse_reference?: string
          verse_text?: string
        }
        Relationships: []
      }
      gift_compatibility_analysis: {
        Row: {
          analysis_data: Json | null
          analysis_text: string | null
          compatibility_score: number
          created_at: string
          id: string
          primary_gift_key: Database["public"]["Enums"]["gift_key"]
          recommendations: string[] | null
          secondary_gift_key: Database["public"]["Enums"]["gift_key"]
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          analysis_text?: string | null
          compatibility_score: number
          created_at?: string
          id?: string
          primary_gift_key: Database["public"]["Enums"]["gift_key"]
          recommendations?: string[] | null
          secondary_gift_key: Database["public"]["Enums"]["gift_key"]
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          analysis_text?: string | null
          compatibility_score?: number
          created_at?: string
          id?: string
          primary_gift_key?: Database["public"]["Enums"]["gift_key"]
          recommendations?: string[] | null
          secondary_gift_key?: Database["public"]["Enums"]["gift_key"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gift_content_cache: {
        Row: {
          ai_generated: boolean | null
          ai_model: string | null
          content_data: Json
          content_type: string
          created_at: string
          gift_key: Database["public"]["Enums"]["gift_key"]
          id: string
          locale: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean | null
          ai_model?: string | null
          content_data: Json
          content_type: string
          created_at?: string
          gift_key: Database["public"]["Enums"]["gift_key"]
          id?: string
          locale?: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean | null
          ai_model?: string | null
          content_data?: Json
          content_type?: string
          created_at?: string
          gift_key?: Database["public"]["Enums"]["gift_key"]
          id?: string
          locale?: string
          updated_at?: string
        }
        Relationships: []
      }
      manifestation_principles: {
        Row: {
          id: number
          locale: string
          order_sequence: number | null
          principle: string
        }
        Insert: {
          id?: number
          locale?: string
          order_sequence?: number | null
          principle: string
        }
        Update: {
          id?: number
          locale?: string
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
          key: string
          locale: string
          name: string
        }
        Insert: {
          biblical_references?: string | null
          classification?: string | null
          definition?: string | null
          id?: number
          key: string
          locale?: string
          name: string
        }
        Update: {
          biblical_references?: string | null
          classification?: string | null
          definition?: string | null
          id?: number
          key?: string
          locale?: string
          name?: string
        }
        Relationships: []
      }
      ministries: {
        Row: {
          biblical_references: string | null
          definition: string | null
          id: number
          key: string
          locale: string
          name: string
          type: string | null
        }
        Insert: {
          biblical_references?: string | null
          definition?: string | null
          id?: number
          key: string
          locale?: string
          name: string
          type?: string | null
        }
        Update: {
          biblical_references?: string | null
          definition?: string | null
          id?: number
          key?: string
          locale?: string
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      misunderstandings: {
        Row: {
          gift_key: Database["public"]["Enums"]["gift_key"]
          id: number
          locale: string
          misunderstanding: string
          order_sequence: number | null
        }
        Insert: {
          gift_key: Database["public"]["Enums"]["gift_key"]
          id?: number
          locale?: string
          misunderstanding: string
          order_sequence?: number | null
        }
        Update: {
          gift_key?: Database["public"]["Enums"]["gift_key"]
          id?: number
          locale?: string
          misunderstanding?: string
          order_sequence?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_misunderstandings_gift"
            columns: ["gift_key", "locale"]
            isOneToOne: false
            referencedRelation: "spiritual_gifts"
            referencedColumns: ["gift_key", "locale"]
          },
        ]
      }
      profiles: {
        Row: {
          age_range: string | null
          avatar_url: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          state_province: string | null
          updated_at: string
        }
        Insert: {
          age_range?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          state_province?: string | null
          updated_at?: string
        }
        Update: {
          age_range?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          state_province?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      qualities: {
        Row: {
          description: string | null
          gift_key: Database["public"]["Enums"]["gift_key"]
          id: number
          locale: string
          order_sequence: number | null
          quality_name: string
        }
        Insert: {
          description?: string | null
          gift_key: Database["public"]["Enums"]["gift_key"]
          id?: number
          locale?: string
          order_sequence?: number | null
          quality_name: string
        }
        Update: {
          description?: string | null
          gift_key?: Database["public"]["Enums"]["gift_key"]
          id?: number
          locale?: string
          order_sequence?: number | null
          quality_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_qualities_gift"
            columns: ["gift_key", "locale"]
            isOneToOne: false
            referencedRelation: "spiritual_gifts"
            referencedColumns: ["gift_key", "locale"]
          },
        ]
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
      spiritual_gifts: {
        Row: {
          biblical_references: string | null
          category_key: string
          definition: string | null
          gift_key: Database["public"]["Enums"]["gift_key"]
          id: number
          locale: string
          name: string
        }
        Insert: {
          biblical_references?: string | null
          category_key: string
          definition?: string | null
          gift_key: Database["public"]["Enums"]["gift_key"]
          id?: number
          locale?: string
          name: string
        }
        Update: {
          biblical_references?: string | null
          category_key?: string
          definition?: string | null
          gift_key?: Database["public"]["Enums"]["gift_key"]
          id?: number
          locale?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_spiritual_gifts_category"
            columns: ["category_key", "locale"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["key", "locale"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string | null
          id: number
          settings: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          settings?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          settings?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_demographics: {
        Row: {
          birth_year: number | null
          city: string | null
          country: string | null
          created_at: string
          gender: string | null
          region: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_year?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          gender?: string | null
          region?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_year?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          gender?: string | null
          region?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      admin_delete_user: { Args: { target_user_id: string }; Returns: Json }
      admin_update_user: {
        Args: {
          display_name?: string
          target_user_id: string
          user_role?: string
          user_status?: string
        }
        Returns: Json
      }
      calculate_quiz_result: {
        Args: { p_session_id: string }
        Returns: {
          avg_weighted: number
          gift: Database["public"]["Enums"]["gift_key"]
          question_count: number
          total_raw: number
          total_weighted: number
        }[]
      }
      cleanup_expired_reports: { Args: never; Returns: undefined }
      generate_balanced_quiz: {
        Args: {
          questions_per_gift?: number
          target_locale?: string
          user_id_param?: string
        }
        Returns: {
          gift_key: Database["public"]["Enums"]["gift_key"]
          question_id: number
          question_order: number
          question_text: string
          quiz_id: string
          weight_class: Database["public"]["Enums"]["weight_class"]
        }[]
      }
      get_activity_stats: { Args: never; Returns: Json }
      get_admin_stats: {
        Args: never
        Returns: {
          activeusers: number
          adminusers: number
          averagescore: number
          completedtoday: number
          mostpopulargift: string
          newusersthismonth: number
          totalquizzes: number
          totalusers: number
        }[]
      }
      get_age_demographics: {
        Args: never
        Returns: {
          age_range: string
          percentage: number
          user_count: number
        }[]
      }
      get_ai_analysis_by_gift: {
        Args: never
        Returns: {
          count: number
          gift_key: string
        }[]
      }
      get_ai_analysis_by_session: {
        Args: { p_session_id: string }
        Returns: {
          challenges_guidance: string
          confidence_score: number
          created_at: string
          development_plan: string
          id: string
          ministry_recommendations: string[]
          personalized_insights: string
          practical_applications: string[]
          strengths_description: string
        }[]
      }
      get_ai_analysis_by_user_and_scores: {
        Args: { p_gift_scores: Json; p_user_id: string }
        Returns: {
          challenges_guidance: string
          confidence_score: number
          created_at: string
          development_plan: string
          id: string
          ministry_recommendations: string[]
          personalized_insights: string
          practical_applications: string[]
          strengths_description: string
        }[]
      }
      get_ai_system_status: {
        Args: never
        Returns: {
          error_rate: number
          latency_ms: number
          status: string
        }[]
      }
      get_ai_usage_stats: {
        Args: never
        Returns: {
          analyses_this_month: number
          analyses_this_week: number
          analyses_today: number
          api_calls: number
          avg_confidence_score: number
          cache_hit_rate: number
          cache_hits: number
          most_analyzed_gift: string
          total_analyses: number
          unique_users: number
        }[]
      }
      get_ai_usage_timeline: {
        Args: never
        Returns: {
          count: number
          date: string
        }[]
      }
      get_all_gifts_with_data: { Args: { p_locale?: string }; Returns: Json }
      get_analytics_data: { Args: { date_range_param?: string }; Returns: Json }
      get_audit_logs: {
        Args: {
          filter_action?: string
          filter_status?: string
          filter_user?: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          action: string
          created_at: string
          details: Json
          id: number
          ip_address: string
          resource: string
          status: string
          user_agent: string
          user_email: string
          user_id: string
        }[]
      }
      get_audit_stats: { Args: never; Returns: Json }
      get_categories_by_locale: {
        Args: { p_locale?: string }
        Returns: {
          description: string
          greek_term: string
          key: string
          name: string
          purpose: string
        }[]
      }
      get_comprehensive_analytics_data: {
        Args: { p_date_range: string }
        Returns: Json
      }
      get_demographics_analytics: { Args: never; Returns: Json }
      get_educational_content: {
        Args: { p_locale?: string; p_section_type?: string }
        Returns: Json
      }
      get_geographic_demographics: {
        Args: never
        Returns: {
          city: string
          country: string
          percentage: number
          state_province: string
          user_count: number
        }[]
      }
      get_geographic_distribution: { Args: never; Returns: Json }
      get_gift_compatibility: {
        Args: {
          p_locale?: string
          p_primary_gift: Database["public"]["Enums"]["gift_key"]
          p_secondary_gift: Database["public"]["Enums"]["gift_key"]
        }
        Returns: Json
      }
      get_gift_complete_data: {
        Args: {
          p_gift_key: Database["public"]["Enums"]["gift_key"]
          p_locale?: string
        }
        Returns: Json
      }
      get_gift_distribution: {
        Args: never
        Returns: {
          count: number
          gift_id: number
          gift_name: string
          percentage: number
        }[]
      }
      get_latest_result_data: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          session_id: string
          top_gifts_keys: string[]
          top_gifts_names: string[]
          total_scores: Json
        }[]
      }
      get_manifestations_by_locale: {
        Args: { p_locale?: string }
        Returns: {
          biblical_references: string
          classification: string
          definition: string
          key: string
          name: string
        }[]
      }
      get_ministries_by_locale: {
        Args: { p_locale?: string }
        Returns: {
          biblical_references: string
          definition: string
          key: string
          name: string
          type: string
        }[]
      }
      get_ministry_recommendations: {
        Args: {
          p_locale?: string
          p_user_gifts: Database["public"]["Enums"]["gift_key"][]
        }
        Returns: Json
      }
      get_questions_by_locale: {
        Args: { target_locale?: string }
        Returns: {
          default_weight: number
          gift: Database["public"]["Enums"]["gift_key"]
          id: number
          is_active: boolean
          pclass: Database["public"]["Enums"]["weight_class"]
          reverse_scored: boolean
          source: Database["public"]["Enums"]["source_type"]
          text: string
        }[]
      }
      get_quiz_result_by_id: {
        Args: { p_session_id: string }
        Returns: {
          completed_at: string
          created_at: string
          gift_key: string
          session_id: string
          total_weighted: number
          user_id: string
        }[]
      }
      get_recent_activity: {
        Args: { limit_count?: number }
        Returns: {
          action: string
          created_at: string
          id: string
          type: string
          user_email: string
          user_name: string
        }[]
      }
      get_recent_ai_activity: {
        Args: { limit_count?: number }
        Returns: {
          confidence_score: number
          created_at: string
          id: string
          user_id: string
        }[]
      }
      get_system_settings: { Args: never; Returns: Json }
      get_system_status: { Args: never; Returns: Json }
      get_top_gift_details: {
        Args: { p_locale?: string; p_session_id: string }
        Returns: {
          biblical_references: string
          category_name: string
          definition: string
          gift_key: Database["public"]["Enums"]["gift_key"]
          gift_name: string
          greek_term: string
          question_count: number
          total_weighted: number
        }[]
      }
      get_user_activities: {
        Args: { limit_count?: number }
        Returns: {
          activity_description: string
          activity_type: string
          created_at: string
          id: string
          ip_address: string
          metadata: Json
          user_agent: string
          user_id: string
          users: Json
        }[]
      }
      get_user_profile: { Args: never; Returns: Json }
      get_user_results_data: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          session_id: string
          top_gifts_keys: string[]
          top_gifts_names: string[]
          total_scores: Json
        }[]
      }
      get_users_with_stats: {
        Args: never
        Returns: {
          avg_score: number
          created_at: string
          email: string
          id: string
          last_sign_in_at: string
          quiz_count: number
          status: string
          user_metadata: Json
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_user_admin_safe: { Args: never; Returns: boolean }
      log_audit_event: {
        Args: {
          p_action: string
          p_details?: Json
          p_ip_address?: string
          p_resource: string
          p_status?: string
          p_user_agent?: string
          p_user_email: string
          p_user_id: string
        }
        Returns: undefined
      }
      record_report_download: {
        Args: { p_report_id: string }
        Returns: undefined
      }
      submit_complete_quiz: {
        Args: { p_answers: Json; p_quiz_id?: string; p_user_id: string }
        Returns: {
          completed_at: string
          session_id: string
          top_gifts_keys: string[]
          top_gifts_names: string[]
          total_scores: Json
        }[]
      }
      update_system_settings: { Args: { new_settings: Json }; Returns: boolean }
      upsert_user_demographics: {
        Args: {
          p_birth_year?: number
          p_city?: string
          p_country?: string
          p_gender?: string
          p_region?: string
          p_user_id: string
        }
        Returns: Json
      }
      upsert_user_profile: {
        Args: {
          p_age_range?: string
          p_birth_date?: string
          p_city?: string
          p_country?: string
          p_state_province?: string
        }
        Returns: Json
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
