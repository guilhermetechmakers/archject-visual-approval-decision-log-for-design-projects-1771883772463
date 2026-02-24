/**
 * Supabase database types - generated via `supabase gen types typescript`
 * Extended for auth schema (profiles, workspaces, user_workspace_links, admin_users).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          is_email_confirmed: boolean
          two_fa_enabled: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          is_email_confirmed?: boolean
          two_fa_enabled?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          is_email_confirmed?: boolean
          two_fa_enabled?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          user_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          created_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          domain_allowlist: string[]
          branding: Json | null
          owner_user_id: string
          created_at: string
          settings: Json | null
        }
        Insert: {
          id?: string
          name: string
          domain_allowlist?: string[]
          branding?: Json | null
          owner_user_id: string
          created_at?: string
          settings?: Json | null
        }
        Update: {
          id?: string
          name?: string
          domain_allowlist?: string[]
          branding?: Json | null
          owner_user_id?: string
          created_at?: string
          settings?: Json | null
        }
      }
      user_workspace_links: {
        Row: {
          user_id: string
          workspace_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          status: 'active' | 'pending'
          created_at: string
        }
        Insert: {
          user_id: string
          workspace_id: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          status?: 'active' | 'pending'
          created_at?: string
        }
        Update: {
          user_id?: string
          workspace_id?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          status?: 'active' | 'pending'
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          target_id: string | null
          timestamp: string
          details: Json | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          target_id?: string | null
          timestamp?: string
          details?: Json | null
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          target_id?: string | null
          timestamp?: string
          details?: Json | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      workspace_role: 'owner' | 'admin' | 'editor' | 'viewer'
      workspace_status: 'active' | 'pending'
    }
  }
}
