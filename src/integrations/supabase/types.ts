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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      poll_options: {
        Row: {
          created_at: string | null
          id: string
          option_text: string
          poll_id: string
          vote_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_text: string
          poll_id: string
          vote_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_text?: string
          poll_id?: string
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          category: Database["public"]["Enums"]["poll_category"]
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          max_selections: number | null
          poll_type: Database["public"]["Enums"]["poll_type"]
          required_demographics: boolean | null
          start_date: string | null
          status: Database["public"]["Enums"]["poll_status"]
          title: string
          total_votes: number | null
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["poll_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_selections?: number | null
          poll_type?: Database["public"]["Enums"]["poll_type"]
          required_demographics?: boolean | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["poll_status"]
          title: string
          total_votes?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["poll_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_selections?: number | null
          poll_type?: Database["public"]["Enums"]["poll_type"]
          required_demographics?: boolean | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["poll_status"]
          title?: string
          total_votes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_range: Database["public"]["Enums"]["age_range"] | null
          created_at: string | null
          email: string | null
          employment_status:
            | Database["public"]["Enums"]["employment_status"]
            | null
          full_name: string | null
          id: string
          job_title: string | null
          location: string | null
          occupation_category: string | null
          updated_at: string | null
        }
        Insert: {
          age_range?: Database["public"]["Enums"]["age_range"] | null
          created_at?: string | null
          email?: string | null
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          full_name?: string | null
          id: string
          job_title?: string | null
          location?: string | null
          occupation_category?: string | null
          updated_at?: string | null
        }
        Update: {
          age_range?: Database["public"]["Enums"]["age_range"] | null
          created_at?: string | null
          email?: string | null
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          location?: string | null
          occupation_category?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vote_answers: {
        Row: {
          created_at: string | null
          id: string
          option_id: string
          vote_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id: string
          vote_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string
          vote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vote_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vote_answers_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: false
            referencedRelation: "votes"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string | null
          id: string
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { p_user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_user_voted: {
        Args: { p_poll_id: string; p_voter_id: string }
        Returns: boolean
      }
      increment_poll_votes: { Args: { p_poll_id: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      update_poll_statuses: { Args: never; Returns: undefined }
    }
    Enums: {
      age_range: "18-26" | "27-35" | "36-45" | "46-55" | "56-65" | "65+"
      app_role: "admin" | "moderator" | "user"
      employment_status:
        | "employed"
        | "self_employed"
        | "unemployed"
        | "student"
        | "retired"
        | "other"
      poll_category:
        | "politics"
        | "entertainment"
        | "sports"
        | "technology"
        | "lifestyle"
        | "other"
      poll_status: "draft" | "active" | "scheduled" | "closed"
      poll_type: "single_choice" | "multiple_choice" | "yes_no"
      results_visibility: "live" | "after_close"
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
      age_range: ["18-26", "27-35", "36-45", "46-55", "56-65", "65+"],
      app_role: ["admin", "moderator", "user"],
      employment_status: [
        "employed",
        "self_employed",
        "unemployed",
        "student",
        "retired",
        "other",
      ],
      poll_category: [
        "politics",
        "entertainment",
        "sports",
        "technology",
        "lifestyle",
        "other",
      ],
      poll_status: ["draft", "active", "scheduled", "closed"],
      poll_type: ["single_choice", "multiple_choice", "yes_no"],
      results_visibility: ["live", "after_close"],
    },
  },
} as const
