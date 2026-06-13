// Generated type definitions for Supabase database
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          phone: string | null
          user_type: string | null
          created_at: string
          updated_at: string
          /* onboarding fields — added in migration 002 */
          zip_code: string | null
          state_code: string | null
          income_bracket: string | null
          household_size: number | null
          care_needs: string[] | null
          barriers: string[] | null
          preferred_language: string | null
          situation: string | null
          onboarding_completed_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          user_type?: string | null
          created_at?: string
          updated_at?: string
          zip_code?: string | null
          state_code?: string | null
          income_bracket?: string | null
          household_size?: number | null
          care_needs?: string[] | null
          barriers?: string[] | null
          preferred_language?: string | null
          situation?: string | null
          onboarding_completed_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          user_type?: string | null
          created_at?: string
          updated_at?: string
          zip_code?: string | null
          state_code?: string | null
          income_bracket?: string | null
          household_size?: number | null
          care_needs?: string[] | null
          barriers?: string[] | null
          preferred_language?: string | null
          situation?: string | null
          onboarding_completed_at?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          id: string
          user_id: string | null
          type: string
          status: string
          data: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          status?: string
          data?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          status?: string
          data?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          resource_type: string
          resource_id: string
          resource_name: string
          resource_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_type: string
          resource_id: string
          resource_name: string
          resource_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_type?: string
          resource_id?: string
          resource_name?: string
          resource_data?: Json | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
