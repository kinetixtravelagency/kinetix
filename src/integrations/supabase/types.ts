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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      application_documents: {
        Row: {
          application_id: string
          created_at: string
          doc_type: string
          file_name: string
          file_path: string
          id: string
          note: string | null
          status: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          doc_type: string
          file_name: string
          file_path: string
          id?: string
          note?: string | null
          status?: string
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          doc_type?: string
          file_name?: string
          file_path?: string
          id?: string
          note?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          birth_date: string | null
          created_at: string
          deposit_paid: boolean
          deposit_paid_at: string | null
          discount_percent: number
          education: string | null
          full_name: string | null
          id: string
          installments: number
          notes: string | null
          partner_id: string | null
          passport_number: string | null
          payment_plan: string
          phone: string | null
          program_id: string
          promo_code: string | null
          stage: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          deposit_paid?: boolean
          deposit_paid_at?: string | null
          discount_percent?: number
          education?: string | null
          full_name?: string | null
          id?: string
          installments?: number
          notes?: string | null
          partner_id?: string | null
          passport_number?: string | null
          payment_plan?: string
          phone?: string | null
          program_id: string
          promo_code?: string | null
          stage?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          deposit_paid?: boolean
          deposit_paid_at?: string | null
          discount_percent?: number
          education?: string | null
          full_name?: string | null
          id?: string
          installments?: number
          notes?: string | null
          partner_id?: string | null
          passport_number?: string | null
          payment_plan?: string
          phone?: string | null
          program_id?: string
          promo_code?: string | null
          stage?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          amount: number
          application_id: string | null
          created_at: string
          currency: string
          id: string
          note: string | null
          partner_id: string
          status: string
        }
        Insert: {
          amount?: number
          application_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          note?: string | null
          partner_id: string
          status?: string
        }
        Update: {
          amount?: number
          application_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          note?: string | null
          partner_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          created_at: string
          description_ar: string
          description_en: string
          documents_en: string[]
          eligibility_en: string[]
          flag: string
          id: string
          image_key: string
          name_ar: string
          name_en: string
          published: boolean
          slug: string
          sort_order: number
          tagline_ar: string
          tagline_en: string
          timeline_en: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_ar?: string
          description_en?: string
          documents_en?: string[]
          eligibility_en?: string[]
          flag?: string
          id?: string
          image_key?: string
          name_ar?: string
          name_en: string
          published?: boolean
          slug: string
          sort_order?: number
          tagline_ar?: string
          tagline_en?: string
          timeline_en?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_ar?: string
          description_en?: string
          documents_en?: string[]
          eligibility_en?: string[]
          flag?: string
          id?: string
          image_key?: string
          name_ar?: string
          name_en?: string
          published?: boolean
          slug?: string
          sort_order?: number
          tagline_ar?: string
          tagline_en?: string
          timeline_en?: Json
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          country_interest: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          partner_id: string
          phone: string | null
          status: string
          track: string | null
          updated_at: string
        }
        Insert: {
          country_interest?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          partner_id: string
          phone?: string | null
          status?: string
          track?: string | null
          updated_at?: string
        }
        Update: {
          country_interest?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          partner_id?: string
          phone?: string | null
          status?: string
          track?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_levels: {
        Row: {
          client_discount: number
          commission_rate: number
          created_at: string
          id: string
          min_leads: number
          name: string
          name_ar: string
          sort_order: number
        }
        Insert: {
          client_discount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          min_leads?: number
          name: string
          name_ar?: string
          sort_order?: number
        }
        Update: {
          client_discount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          min_leads?: number
          name?: string
          name_ar?: string
          sort_order?: number
        }
        Relationships: []
      }
      partners: {
        Row: {
          active: boolean
          city: string | null
          commission_rate: number
          created_at: string
          experience: string | null
          id: string
          level: string
          payout_details: string | null
          payout_method: string | null
          promo_code: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          city?: string | null
          commission_rate?: number
          created_at?: string
          experience?: string | null
          id?: string
          level?: string
          payout_details?: string | null
          payout_method?: string | null
          promo_code: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          city?: string | null
          commission_rate?: number
          created_at?: string
          experience?: string | null
          id?: string
          level?: string
          payout_details?: string | null
          payout_method?: string | null
          promo_code?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          category_ar: string
          category_en: string
          country_id: string
          created_at: string
          deposit: number
          duration: string
          id: string
          max_installments: number
          price: number
          published: boolean
          slug: string
          title_ar: string
          title_en: string
          track: string
          updated_at: string
        }
        Insert: {
          category_ar?: string
          category_en?: string
          country_id: string
          created_at?: string
          deposit?: number
          duration?: string
          id?: string
          max_installments?: number
          price?: number
          published?: boolean
          slug: string
          title_ar?: string
          title_en: string
          track?: string
          updated_at?: string
        }
        Update: {
          category_ar?: string
          category_en?: string
          country_id?: string
          created_at?: string
          deposit?: number
          duration?: string
          id?: string
          max_installments?: number
          price?: number
          published?: boolean
          slug?: string
          title_ar?: string
          title_en?: string
          track?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "partner" | "customer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "partner", "customer"],
    },
  },
} as const
