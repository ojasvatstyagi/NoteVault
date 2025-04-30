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
      notes: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string | null
          is_pinned: boolean
          is_archived: boolean
          color: string
          tags: string[]
          created_at: string
          updated_at: string
          reminder: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          content?: string | null
          is_pinned?: boolean
          is_archived?: boolean
          color?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
          reminder?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string | null
          is_pinned?: boolean
          is_archived?: boolean
          color?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
          reminder?: string | null
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