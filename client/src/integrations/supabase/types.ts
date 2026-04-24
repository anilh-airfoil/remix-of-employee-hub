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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      benefits: {
        Row: {
          created_at: string
          crypto_stipend: number | null
          equipment_status: string | null
          flex_cap: number | null
          id: string
          reimbursement_eligible: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crypto_stipend?: number | null
          equipment_status?: string | null
          flex_cap?: number | null
          id?: string
          reimbursement_eligible?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          crypto_stipend?: number | null
          equipment_status?: string | null
          flex_cap?: number | null
          id?: string
          reimbursement_eligible?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      compensation: {
        Row: {
          contract_type: Database["public"]["Enums"]["contract_type"]
          contract_type_label: string | null
          created_at: string
          currency: string
          guaranteed_hours: number | null
          hourly_rate: number | null
          id: string
          monthly_rate: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contract_type?: Database["public"]["Enums"]["contract_type"]
          contract_type_label?: string | null
          created_at?: string
          currency?: string
          guaranteed_hours?: number | null
          hourly_rate?: number | null
          id?: string
          monthly_rate?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contract_type?: Database["public"]["Enums"]["contract_type"]
          contract_type_label?: string | null
          created_at?: string
          currency?: string
          guaranteed_hours?: number | null
          hourly_rate?: number | null
          id?: string
          monthly_rate?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compensation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          id: string
          type: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          type: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      employment: {
        Row: {
          created_at: string
          employee_type_label: string | null
          end_date: string | null
          id: string
          start_date: string | null
          type: Database["public"]["Enums"]["employment_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          employee_type_label?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          type?: Database["public"]["Enums"]["employment_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          employee_type_label?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          type?: Database["public"]["Enums"]["employment_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          af_id: string | null
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          home_address: string | null
          id: string
          location: string | null
          manager: string | null
          name: string | null
          personal_email: string | null
          role_title: string | null
          slack_contact: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          af_id?: string | null
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          home_address?: string | null
          id?: string
          location?: string | null
          manager?: string | null
          name?: string | null
          personal_email?: string | null
          role_title?: string | null
          slack_contact?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          af_id?: string | null
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          home_address?: string | null
          id?: string
          location?: string | null
          manager?: string | null
          name?: string | null
          personal_email?: string | null
          role_title?: string | null
          slack_contact?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          amount: number
          attachment_url: string | null
          category: string
          created_at: string
          date: string
          id: string
          reimbursement_id: string
          status: Database["public"]["Enums"]["receipt_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          attachment_url?: string | null
          category: string
          created_at?: string
          date: string
          id?: string
          reimbursement_id: string
          status?: Database["public"]["Enums"]["receipt_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          attachment_url?: string | null
          category?: string
          created_at?: string
          date?: string
          id?: string
          reimbursement_id?: string
          status?: Database["public"]["Enums"]["receipt_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_reimbursement_id_fkey"
            columns: ["reimbursement_id"]
            isOneToOne: false
            referencedRelation: "reimbursements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reimbursements: {
        Row: {
          cap: number | null
          created_at: string
          id: string
          month: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          cap?: number | null
          created_at?: string
          id?: string
          month: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          cap?: number | null
          created_at?: string
          id?: string
          month?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "reimbursements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          completed_date: string | null
          created_at: string
          id: string
          meeting_link: string | null
          raise: boolean
          review_date: string | null
          reviewer: string | null
          summary: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          id?: string
          meeting_link?: string | null
          raise?: boolean
          review_date?: string | null
          reviewer?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          id?: string
          meeting_link?: string | null
          raise?: boolean
          review_date?: string | null
          reviewer?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_user_role"]
          status: Database["public"]["Enums"]["app_user_status"]
          updated_at: string
        }
        Insert: {
          auth_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_user_role"]
          status?: Database["public"]["Enums"]["app_user_status"]
          updated_at?: string
        }
        Update: {
          auth_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_user_role"]
          status?: Database["public"]["Enums"]["app_user_status"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_user_role: "owner" | "admin" | "member"
      app_user_status: "active" | "not_active"
      contract_type: "retainer" | "flexible"
      employment_type: "full_time" | "contractor"
      receipt_status: "approved" | "pending" | "rejected"
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
      app_user_role: ["owner", "admin", "member"],
      app_user_status: ["active", "not_active"],
      contract_type: ["retainer", "flexible"],
      employment_type: ["full_time", "contractor"],
      receipt_status: ["approved", "pending", "rejected"],
    },
  },
} as const
