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
          last_verification_requested_at: string | null
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
          last_verification_requested_at?: string | null
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
          last_verification_requested_at?: string | null
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
      password_reset_tokens: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          expires_at: string
          used_at: string | null
          created_at: string
          created_by_ip: string | null
          device_info: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id: string
          token_hash: string
          expires_at: string
          used_at?: string | null
          created_at?: string
          created_by_ip?: string | null
          device_info?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          token_hash?: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
          created_by_ip?: string | null
          device_info?: string | null
          user_agent?: string | null
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
      user_2fa_config: {
        Row: {
          id: string
          user_id: string
          is_enabled: boolean
          method: 'totp' | 'sms' | null
          totp_secret: string | null
          phone_number: string | null
          phone_verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          is_enabled?: boolean
          method?: 'totp' | 'sms' | null
          totp_secret?: string | null
          phone_number?: string | null
          phone_verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          is_enabled?: boolean
          method?: 'totp' | 'sms' | null
          totp_secret?: string | null
          phone_number?: string | null
          phone_verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recovery_codes: {
        Row: {
          id: string
          user_id: string
          code_hash: string
          used: boolean
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          code_hash: string
          used?: boolean
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          code_hash?: string
          used?: boolean
          used_at?: string | null
          created_at?: string
        }
      }
      otp_attempts: {
        Row: {
          id: string
          user_id: string | null
          method: string
          ip_address: string | null
          success: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          method: string
          ip_address?: string | null
          success: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          method?: string
          ip_address?: string | null
          success?: boolean
          created_at?: string
        }
      }
      email_verification_tokens: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          token_jti: string
          expires_at: string
          used_at: string | null
          created_at: string
          created_by_ip: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id: string
          token_hash: string
          token_jti: string
          expires_at: string
          used_at?: string | null
          created_at?: string
          created_by_ip?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          token_hash?: string
          token_jti?: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
          created_by_ip?: string | null
          user_agent?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          workspace_id: string
          name: string
          client_info: Json
          branding: Json
          template_id: string | null
          quota: Json
          usage: Json
          status: 'active' | 'archived' | 'on_hold'
          created_at: string
          updated_at: string
          archived_at: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          client_info?: Json
          branding?: Json
          template_id?: string | null
          quota?: Json
          usage?: Json
          status?: 'active' | 'archived' | 'on_hold'
          created_at?: string
          updated_at?: string
          archived_at?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          client_info?: Json
          branding?: Json
          template_id?: string | null
          quota?: Json
          usage?: Json
          status?: 'active' | 'archived' | 'on_hold'
          created_at?: string
          updated_at?: string
          archived_at?: string | null
        }
      }
      decisions: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          options: Json
          chosen_option_id: string | null
          status: 'draft' | 'pending' | 'accepted' | 'rejected'
          comments: Json
          due_date: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          approved_at: string | null
          version: number
          metadata: Json
          assignee_id: string | null
          reminder_schedule: Json
          shared: boolean
          share_link_id: string | null
          last_edited_by: string | null
          deleted_at: string | null
          priority: string | null
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          options?: Json
          chosen_option_id?: string | null
          status?: 'draft' | 'pending' | 'accepted' | 'rejected'
          comments?: Json
          due_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          approved_at?: string | null
          version?: number
          metadata?: Json
          assignee_id?: string | null
          reminder_schedule?: Json
          shared?: boolean
          share_link_id?: string | null
          last_edited_by?: string | null
          deleted_at?: string | null
          priority?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          options?: Json
          chosen_option_id?: string | null
          status?: 'draft' | 'pending' | 'accepted' | 'rejected'
          comments?: Json
          due_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          approved_at?: string | null
          version?: number
          metadata?: Json
          assignee_id?: string | null
          reminder_schedule?: Json
          shared?: boolean
          share_link_id?: string | null
          last_edited_by?: string | null
          deleted_at?: string | null
          priority?: string | null
        }
      }
      decision_options: {
        Row: {
          id: string
          decision_id: string
          title: string
          description: string | null
          image_url: string | null
          specs_url: string | null
          layout_url: string | null
          position: number
          metadata: Json
          is_recommended: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          decision_id: string
          title: string
          description?: string | null
          image_url?: string | null
          specs_url?: string | null
          layout_url?: string | null
          position?: number
          metadata?: Json
          is_recommended?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          decision_id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          specs_url?: string | null
          layout_url?: string | null
          position?: number
          metadata?: Json
          is_recommended?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      decision_share_links: {
        Row: {
          id: string
          decision_id: string
          token: string
          expires_at: string | null
          created_by: string | null
          revocation_flag: boolean
          scope: string
          remaining_uses: number | null
          created_at: string
        }
        Insert: {
          id?: string
          decision_id: string
          token: string
          expires_at?: string | null
          created_by?: string | null
          revocation_flag?: boolean
          scope?: string
          remaining_uses?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          decision_id?: string
          token?: string
          expires_at?: string | null
          created_by?: string | null
          revocation_flag?: boolean
          scope?: string
          remaining_uses?: number | null
          created_at?: string
        }
      }
      project_files: {
        Row: {
          id: string
          project_id: string
          filename: string
          size: number
          mime_type: string | null
          storage_path: string
          uploaded_by: string | null
          version: number
          uploaded_at: string
          associated_decision_id: string | null
        }
        Insert: {
          id?: string
          project_id: string
          filename: string
          size?: number
          mime_type?: string | null
          storage_path: string
          uploaded_by?: string | null
          version?: number
          uploaded_at?: string
          associated_decision_id?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          filename?: string
          size?: number
          mime_type?: string | null
          storage_path?: string
          uploaded_by?: string | null
          version?: number
          uploaded_at?: string
          associated_decision_id?: string | null
        }
      }
      project_invitations: {
        Row: {
          id: string
          project_id: string
          email: string
          role: 'owner' | 'admin' | 'editor' | 'viewer' | 'client'
          token: string
          expires_at: string
          status: 'pending' | 'accepted' | 'expired'
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          email: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer' | 'client'
          token: string
          expires_at: string
          status?: 'pending' | 'accepted' | 'expired'
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          email?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer' | 'client'
          token?: string
          expires_at?: string
          status?: 'pending' | 'accepted' | 'expired'
          created_at?: string
        }
      }
      project_rbac: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          scopes: Json
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: string
          scopes?: Json
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string
          scopes?: Json
          created_at?: string
        }
      }
      client_links: {
        Row: {
          id: string
          project_id: string
          decision_id: string | null
          token: string
          expires_at: string | null
          otp_required: boolean
          created_at: string
          used_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          project_id: string
          decision_id?: string | null
          token: string
          expires_at?: string | null
          otp_required?: boolean
          created_at?: string
          used_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          project_id?: string
          decision_id?: string | null
          token?: string
          expires_at?: string | null
          otp_required?: boolean
          created_at?: string
          used_at?: string | null
          is_active?: boolean
        }
      }
      saved_searches: {
        Row: {
          id: string
          user_id: string
          workspace_id: string | null
          name: string
          query: string
          filters: Json
          is_shared: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workspace_id?: string | null
          name: string
          query?: string
          filters?: Json
          is_shared?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workspace_id?: string | null
          name?: string
          query?: string
          filters?: Json
          is_shared?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      search_audit_log: {
        Row: {
          id: string
          user_id: string | null
          query: string | null
          filters: Json
          result_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          query?: string | null
          filters?: Json
          result_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          query?: string | null
          filters?: Json
          result_count?: number | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      search_unified: {
        Args: {
          p_query: string
          p_entity_types: string[] | null
          p_project_id: string | null
          p_status: string[] | null
          p_page: number
          p_page_size: number
          p_sort_field: string
          p_sort_order: string
        }
        Returns: {
          id: string
          entity_type: string
          project_id: string
          project_name: string | null
          title: string
          excerpt: string
          status: string
          created_at: string
          updated_at: string
          author_id: string | null
          href: string
        }[]
      }
      search_unified_count: {
        Args: {
          p_query: string
          p_entity_types: string[] | null
          p_project_id: string | null
          p_status: string[] | null
        }
        Returns: number
      }
      search_autocomplete: {
        Args: {
          p_query: string
          p_entity_types: string[] | null
          p_limit: number
        }
        Returns: {
          id: string
          entity_type: string
          title: string
          excerpt: string
          href: string
        }[]
      }
    }
    Enums: {
      workspace_role: 'owner' | 'admin' | 'editor' | 'viewer'
      workspace_status: 'active' | 'pending'
    }
  }
}
