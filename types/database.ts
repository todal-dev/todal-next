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
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      todos: {
        Row: {
          id: string
          user_id: string
          category_id: string
          parent_id: string | null
          text: string
          completed: boolean
          date: string
          start_time: string | null
          end_time: string | null
          recurrence_rule: Json | null
          completed_dates: string[] | null
          skipped_dates: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          parent_id?: string | null
          text: string
          completed?: boolean
          date: string
          start_time?: string | null
          end_time?: string | null
          recurrence_rule?: Json | null
          completed_dates?: string[] | null
          skipped_dates?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          parent_id?: string | null
          text?: string
          completed?: boolean
          date?: string
          start_time?: string | null
          end_time?: string | null
          recurrence_rule?: Json | null
          completed_dates?: string[] | null
          skipped_dates?: string[] | null
          created_at?: string
          updated_at?: string
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
