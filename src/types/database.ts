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
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          tags: string[]
          is_archived: boolean
          is_pinned: boolean
          is_starred: boolean
          folder_id: string | null
          word_count: number
          reading_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          tags?: string[]
          is_archived?: boolean
          is_pinned?: boolean
          is_starred?: boolean
          folder_id?: string | null
          word_count?: number
          reading_time?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          tags?: string[]
          is_archived?: boolean
          is_pinned?: boolean
          is_starred?: boolean
          folder_id?: string | null
          word_count?: number
          reading_time?: number
          created_at?: string
          updated_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_analysis: {
        Row: {
          id: string
          note_id: string
          summary: string
          key_points: string[]
          todo_items: string[]
          sentiment: string
          created_at: string
        }
        Insert: {
          id?: string
          note_id: string
          summary: string
          key_points: string[]
          todo_items: string[]
          sentiment: string
          created_at?: string
        }
        Update: {
          id?: string
          note_id?: string
          summary?: string
          key_points?: string[]
          todo_items?: string[]
          sentiment?: string
          created_at?: string
        }
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
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
export type Folder = Database['public']['Tables']['folders']['Row']
export type AIAnalysis = Database['public']['Tables']['ai_analysis']['Row']

