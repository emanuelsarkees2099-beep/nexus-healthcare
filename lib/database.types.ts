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
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          user_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          user_type?: string | null
          created_at?: string
          updated_at?: string
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
