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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_analysis_cache: {
        Row: {
          ai_service_used: string | null
          analysis_version: string | null
          challenges_guidance: string | null
          confidence_score: number | null
          created_at: string | null
          development_plan: string | null
          gift_scores: Json
          id: number
          locale: string | null
          ministry_recommendations: string[] | null
          personalized_insights: string | null
          practical_applications: string[] | null
          primary_gifts: string[]
          session_id: string | null
          strengths_description: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_service_used?: string | null
          analysis_version?: string | null
          challenges_guidance?: string | null
          confidence_score?: number | null
          created_at?: string | null
          development_plan?: string | null
          gift_scores: Json
          id?: number
          locale?: string | null
          ministry_recommendations?: string[] | null
          personalized_insights?: string | null
          practical_applications?: string[] | null
          primary_gifts: string[]
          session_id?: string | null
          strengths_description?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_service_used?: string | null
          analysis_version?: string | null
          challenges_guidance?: string | null
          confidence_score?: number | null
          created_at?: string | null
          development_plan?: string | null
          gift_scores?: Json
          id?: number
          locale?: string | null
          ministry_recommendations?: string[] | null
          personalized_insights?: string | null
          practical_applications?: string[] | null
          primary_gifts?: string[]
          session_id?: string | null
          strengths_description?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_cache_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_reports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          data: Json
          date_range: string
          description: string | null
          download_count: number | null
          error_message: string | null
          expires_at: string | null
          file_path: string | null
          file_size: number | null
          format: string
          generated_by: string | null
          id: string
          last_downloaded_at: string | null
          report_type: string
          status: string | null
          title: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          data: Json
          date_range: string
          description?: string | null
          download_count?: number | null
          error_message?: string | null
          expires_at?: string | null
          file_path?: string | null
          file_size?: number | null
          format: string
          generated_by?: string | null
          id?: string
          last_downloaded_at?: string | null
          report_type: string
          status?: string | null
          title: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          data?: Json
          date_range?: string
          description?: string | null
          download_count?: number | null
          error_message?: string | null
          expires_at?: string | null
          file_path?: string | null
          file_size?: number | null
          format?: string
          generated_by?: string | null
          id?: string
          last_downloaded_at?: string | null
          report_type?: string
          status?: string | null
          title?: string
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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
      biblical_references_detailed: {
        Row: {
          application: string | null
          category: string | null
          created_at: string | null
          gift_key: Database["public"]["Enums"]["gift_key"]
          id: number
          locale: string
          order_sequence: number | null
          reference: string
          updated_at: string | null
          verse_text: string | null
        }
        Insert: {
          application?: string | null
          category?: string | null
          created_at?: string | null
          gift_key: Database["public"]["Enums"]["gift_key"]
          id?: number
          locale?: string
          order_sequence?: number | null
          reference: string
          updated_at?: string | null
          verse_text?: string | null
        }
        Update: {
          application?: string | null
          category?: string | null
          created_at?: string | null
          gift_key?: Database["public"]["Enums"]["gift_key"]
          id?: number
          locale?: string
          order_sequence?: number | null
          reference?: string
          updated_at?: string | null
          verse_text?: string | null
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
      gift_compatibility_analysis: {
        Row: {
          analysis_text: string | null
          compatibility_score: number | null
          created_at: string | null
          id: number
          primary_gift_key: Database["public"]["Enums"]["gift_key"]
          recommendations: string[] | null
          secondary_gift_key: Database["public"]["Enums"]["gift_key"]
          user_id: string | null
        }
        Insert: {
          analysis_text?: string | null
          compatibility_score?: number | null
          created_at?: string | null
          id?: number
          primary_gift_key: Database["public"]["Enums"]["gift_key"]
          recommendations?: string[] | null
          secondary_gift_key: Database["public"]["Enums"]["gift_key"]
          user_id?: string | null
        }
        Update: {
          analysis_text?: string | null
          compatibility_score?: number | null
          created_at?: string | null
          id?: number
          primary_gift_key?: Database["public"]["Enums"]["gift_key"]
          recommendations?: string[] | null
          secondary_gift_key?: Database["public"]["Enums"]["gift_key"]
          user_id?: string | null
        }
        Relationships: []
      }
      gift_orientations: {
        Row: {
          category: string | null
          created_at: string | null
          gift_key: Database["public"]["Enums"]["gift_key"]
          id: number
          locale: string
          order_sequence: number | null
          orientation: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          gift_key: Database["public"]["Enums"]["gift_key"]
          id?: number
          locale?: string
          order_sequence?: number | null
          orientation: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          gift_key?: Database["public"]["Enums"]["gift_key"]
          id?: number
          locale?: string
          order_sequence?: number | null
          orientation?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gift_synergies: {
        Row: {
          compatibility_score: number | null
          created_at: string | null
          description: string | null
          id: number
          locale: string
          primary_gift_key: Database["public"]["Enums"]["gift_key"]
          secondary_gift_key: Database["public"]["Enums"]["gift_key"]
          synergy_level: string | null
          updated_at: string | null
        }
        Insert: {
          compatibility_score?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          locale?: string
          primary_gift_key: Database["public"]["Enums"]["gift_key"]
          secondary_gift_key: Database["public"]["Enums"]["gift_key"]
          synergy_level?: string | null
          updated_at?: string | null
        }
        Update: {
          compatibility_score?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          locale?: string
          primary_gift_key?: Database["public"]["Enums"]["gift_key"]
          secondary_gift_key?: Database["public"]["Enums"]["gift_key"]
          synergy_level?: string | null
          updated_at?: string | null
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
      ministry_growth_areas: {
        Row: {
          created_at: string | null
          growth_area: string
          id: number
          locale: string
          ministry_key: string
          order_sequence: number | null
          resources: string | null
        }
        Insert: {
          created_at?: string | null
          growth_area: string
          id?: number
          locale?: string
          ministry_key: string
          order_sequence?: number | null
          resources?: string | null
        }
        Update: {
          created_at?: string | null
          growth_area?: string
          id?: number
          locale?: string
          ministry_key?: string
          order_sequence?: number | null
          resources?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ministry_growth_areas_ministry_key_locale_fkey"
            columns: ["ministry_key", "locale"]
            isOneToOne: false
            referencedRelation: "ministry_recommendations"
            referencedColumns: ["ministry_key", "locale"]
          },
        ]
      }
      ministry_recommendations: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          locale: string
          max_participants: number | null
          min_participants: number | null
          ministry_key: string
          ministry_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          locale?: string
          max_participants?: number | null
          min_participants?: number | null
          ministry_key: string
          ministry_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          locale?: string
          max_participants?: number | null
          min_participants?: number | null
          ministry_key?: string
          ministry_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ministry_required_gifts: {
        Row: {
          created_at: string | null
          gift_key: Database["public"]["Enums"]["gift_key"]
          id: number
          importance_level: number | null
          is_primary: boolean | null
          locale: string
          ministry_key: string
        }
        Insert: {
          created_at?: string | null
          gift_key: Database["public"]["Enums"]["gift_key"]
          id?: number
          importance_level?: number | null
          is_primary?: boolean | null
          locale?: string
          ministry_key: string
        }
        Update: {
          created_at?: string | null
          gift_key?: Database["public"]["Enums"]["gift_key"]
          id?: number
          importance_level?: number | null
          is_primary?: boolean | null
          locale?: string
          ministry_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "ministry_required_gifts_ministry_key_locale_fkey"
            columns: ["ministry_key", "locale"]
            isOneToOne: false
            referencedRelation: "ministry_recommendations"
            referencedColumns: ["ministry_key", "locale"]
          },
        ]
      }
      ministry_responsibilities: {
        Row: {
          created_at: string | null
          id: number
          locale: string
          ministry_key: string
          order_sequence: number | null
          responsibility: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          locale?: string
          ministry_key: string
          order_sequence?: number | null
          responsibility: string
        }
        Update: {
          created_at?: string | null
          id?: number
          locale?: string
          ministry_key?: string
          order_sequence?: number | null
          responsibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "ministry_responsibilities_ministry_key_locale_fkey"
            columns: ["ministry_key", "locale"]
            isOneToOne: false
            referencedRelation: "ministry_recommendations"
            referencedColumns: ["ministry_key", "locale"]
          },
        ]
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
        Relationships: []
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
      synergy_challenges: {
        Row: {
          challenge: string
          created_at: string | null
          id: number
          locale: string
          order_sequence: number | null
          primary_gift_key: Database["public"]["Enums"]["gift_key"]
          secondary_gift_key: Database["public"]["Enums"]["gift_key"]
          solution_hint: string | null
        }
        Insert: {
          challenge: string
          created_at?: string | null
          id?: number
          locale?: string
          order_sequence?: number | null
          primary_gift_key: Database["public"]["Enums"]["gift_key"]
          secondary_gift_key: Database["public"]["Enums"]["gift_key"]
          solution_hint?: string | null
        }
        Update: {
          challenge?: string
          created_at?: string | null
          id?: number
          locale?: string
          order_sequence?: number | null
          primary_gift_key?: Database["public"]["Enums"]["gift_key"]
          secondary_gift_key?: Database["public"]["Enums"]["gift_key"]
          solution_hint?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "synergy_challenges_primary_gift_key_secondary_gift_key_loc_fkey"
            columns: ["primary_gift_key", "secondary_gift_key", "locale"]
            isOneToOne: false
            referencedRelation: "gift_synergies"
            referencedColumns: [
              "primary_gift_key",
              "secondary_gift_key",
              "locale",
            ]
          },
        ]
      }
      synergy_strengths: {
        Row: {
          created_at: string | null
          id: number
          locale: string
          order_sequence: number | null
          primary_gift_key: Database["public"]["Enums"]["gift_key"]
          secondary_gift_key: Database["public"]["Enums"]["gift_key"]
          strength_area: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          locale?: string
          order_sequence?: number | null
          primary_gift_key: Database["public"]["Enums"]["gift_key"]
          secondary_gift_key: Database["public"]["Enums"]["gift_key"]
          strength_area: string
        }
        Update: {
          created_at?: string | null
          id?: number
          locale?: string
          order_sequence?: number | null
          primary_gift_key?: Database["public"]["Enums"]["gift_key"]
          secondary_gift_key?: Database["public"]["Enums"]["gift_key"]
          strength_area?: string
        }
        Relationships: [
          {
            foreignKeyName: "synergy_strengths_primary_gift_key_secondary_gift_key_loca_fkey"
            columns: ["primary_gift_key", "secondary_gift_key", "locale"]
            isOneToOne: false
            referencedRelation: "gift_synergies"
            referencedColumns: [
              "primary_gift_key",
              "secondary_gift_key",
              "locale",
            ]
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
          activity_description: string | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_description?: string | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_description?: string | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: number
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          role?: string
          updated_at?: string | null
          user_id?: string | null
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
      admin_delete_user: {
        Args: { target_user_id: string }
        Returns: Json
      }
      admin_update_user: {
        Args: {
          display_name?: string
          target_user_id: string
          user_role?: string
          user_status?: string
        }
        Returns: Json
      }
      admin_update_user_role: {
        Args: { new_role: string; target_user_id: string }
        Returns: Json
      }
      calculate_quiz_result: {
        Args: { p_session_id: string }
        Returns: {
          gift: Database["public"]["Enums"]["gift_key"]
          total_weighted: number
        }[]
      }
      cleanup_expired_reports: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      ensure_ai_settings_complete: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      generate_balanced_quiz: {
        Args: {
          questions_per_gift?: number
          target_locale?: string
          user_id_param?: string
        }
        Returns: {
          default_weight: number
          gift_key: Database["public"]["Enums"]["gift_key"]
          question_id: number
          question_order: number
          question_text: string
          quiz_id: string
          reverse_scored: boolean
          weight_class: Database["public"]["Enums"]["weight_class"]
        }[]
      }
      generate_full_quiz: {
        Args: { target_locale?: string }
        Returns: {
          gift_key: Database["public"]["Enums"]["gift_key"]
          question_id: number
          question_order: number
          question_text: string
          quiz_id: string
          weight_class: Database["public"]["Enums"]["weight_class"]
        }[]
      }
      generate_test_quiz: {
        Args: { target_locale?: string }
        Returns: {
          gift_key: Database["public"]["Enums"]["gift_key"]
          question_id: number
          question_order: number
          question_text: string
          quiz_id: string
          weight_class: Database["public"]["Enums"]["weight_class"]
        }[]
      }
      get_activity_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_admin_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_age_demographics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_ai_analysis_by_gift: {
        Args: Record<PropertyKey, never>
        Returns: {
          analysis_count: number
          avg_confidence: number
          gift_key: string
          last_analysis: string
        }[]
      }
      get_ai_analysis_by_session: {
        Args: { p_session_id: string }
        Returns: {
          ai_service_used: string
          challenges_guidance: string
          confidence_score: number
          created_at: string
          development_plan: string
          id: number
          ministry_recommendations: string[]
          personalized_insights: string
          practical_applications: string[]
          strengths_description: string
          updated_at: string
        }[]
      }
      get_ai_analysis_by_user_and_scores: {
        Args: { p_gift_scores: Json; p_user_id: string }
        Returns: {
          ai_service_used: string
          challenges_guidance: string
          confidence_score: number
          created_at: string
          development_plan: string
          id: number
          ministry_recommendations: string[]
          personalized_insights: string
          practical_applications: string[]
          session_id: string
          strengths_description: string
          updated_at: string
        }[]
      }
      get_ai_system_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          ai_button_enabled: boolean
          auto_generate_enabled: boolean
          cache_strategy: string
          system_health_score: number
          total_system_analyses: number
        }[]
      }
      get_ai_usage_stats: {
        Args: Record<PropertyKey, never>
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
        Args: Record<PropertyKey, never>
        Returns: {
          analysis_date: string
          daily_analyses: number
          daily_api_calls: number
          daily_cache_hits: number
        }[]
      }
      get_all_gifts_with_data: {
        Args: { p_locale?: string } | { p_locale?: string }
        Returns: Json
      }
      get_analytics_data: {
        Args: { date_range_param?: string }
        Returns: Json
      }
      get_audit_logs: {
        Args: {
          action_filter?: string
          limit_count?: number
          offset_count?: number
          search_term?: string
          status_filter?: string
        }
        Returns: Json
      }
      get_audit_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
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
        Args: { p_date_range?: string }
        Returns: Json
      }
      get_demographics_analytics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      upsert_user_demographics: {
        Args: {
          p_user_id: string
          p_country?: string
          p_region?: string
          p_city?: string
          p_timezone?: string
          p_latitude?: number
          p_longitude?: number
          p_birth_date?: string
          p_age?: number
          p_ip_address?: string
          p_data_source?: string
        }
        Returns: Json
      }
      get_default_ai_settings: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_geographic_distribution: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
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
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_latest_user_result: {
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
      get_recent_activity: {
        Args: { limit_count?: number }
        Returns: Json
      }
      get_recent_ai_activity: {
        Args: { limit_count?: number }
        Returns: {
          ai_service: string
          confidence_score: number
          created_at: string
          id: string
          is_cached: boolean
          primary_gift: string
          user_email: string
        }[]
      }
      get_system_settings: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_system_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
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
        Returns: Json
      }
      get_user_ai_analysis_history: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          confidence_score: number
          created_at: string
          personalized_insights: string
          primary_gifts: string[]
          session_id: string
        }[]
      }
      get_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_quiz_sessions: {
        Args: { p_user_id: string }
        Returns: {
          completed_at: string
          created_at: string
          id: string
          is_completed: boolean
        }[]
      }
      get_user_results_with_scores: {
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
        Args: Record<PropertyKey, never>
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
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin_backup: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin_safe: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_audit_event: {
        Args:
          | {
              action_name: string
              details_json?: Json
              ip_addr?: string
              resource_name?: string
              status_value?: string
              user_agent_string?: string
            }
          | {
              p_action: string
              p_details?: Json
              p_ip_address?: string
              p_resource: string
              p_status?: string
              p_user_agent?: string
              p_user_email: string
              p_user_id: string
            }
        Returns: string
      }
      log_user_activity: {
        Args:
          | {
              activity_desc: string
              activity_type_name: string
              ip_addr?: string
              metadata_json?: Json
              user_agent_string?: string
            }
          | {
              p_activity_type: string
              p_description?: string
              p_ip_address?: unknown
              p_metadata?: Json
              p_user_agent?: string
              p_user_id: string
            }
        Returns: string
      }
      record_report_download: {
        Args: { p_report_id: string }
        Returns: boolean
      }
      save_ai_analysis: {
        Args: {
          p_ai_service_used: string
          p_challenges_guidance: string
          p_confidence_score: number
          p_development_plan: string
          p_gift_scores: Json
          p_locale: string
          p_ministry_recommendations: string[]
          p_personalized_insights: string
          p_practical_applications: string[]
          p_primary_gifts: string[]
          p_session_id: string
          p_strengths_description: string
          p_user_id: string
        }
        Returns: string
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
      update_system_settings: {
        Args: { new_settings: Json }
        Returns: boolean
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
      user_owns_session: {
        Args: { session_uuid: string }
        Returns: boolean
      }
      validate_multilingual_system: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          is_critical: boolean
          status: string
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
