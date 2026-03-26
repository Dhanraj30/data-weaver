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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      billing_document_headers: {
        Row: {
          accounting_document: string | null
          billing_document: string
          billing_document_date: string | null
          billing_document_is_cancelled: string | null
          billing_document_type: string | null
          company_code: string | null
          fiscal_year: string | null
          id: string
          sold_to_party: string | null
          total_net_amount: string | null
          transaction_currency: string | null
        }
        Insert: {
          accounting_document?: string | null
          billing_document: string
          billing_document_date?: string | null
          billing_document_is_cancelled?: string | null
          billing_document_type?: string | null
          company_code?: string | null
          fiscal_year?: string | null
          id?: string
          sold_to_party?: string | null
          total_net_amount?: string | null
          transaction_currency?: string | null
        }
        Update: {
          accounting_document?: string | null
          billing_document?: string
          billing_document_date?: string | null
          billing_document_is_cancelled?: string | null
          billing_document_type?: string | null
          company_code?: string | null
          fiscal_year?: string | null
          id?: string
          sold_to_party?: string | null
          total_net_amount?: string | null
          transaction_currency?: string | null
        }
        Relationships: []
      }
      billing_document_items: {
        Row: {
          billing_document: string
          billing_document_item: string | null
          billing_quantity: string | null
          billing_quantity_unit: string | null
          id: string
          material: string | null
          net_amount: string | null
          reference_sd_document: string | null
          reference_sd_document_item: string | null
          transaction_currency: string | null
        }
        Insert: {
          billing_document: string
          billing_document_item?: string | null
          billing_quantity?: string | null
          billing_quantity_unit?: string | null
          id?: string
          material?: string | null
          net_amount?: string | null
          reference_sd_document?: string | null
          reference_sd_document_item?: string | null
          transaction_currency?: string | null
        }
        Update: {
          billing_document?: string
          billing_document_item?: string | null
          billing_quantity?: string | null
          billing_quantity_unit?: string | null
          id?: string
          material?: string | null
          net_amount?: string | null
          reference_sd_document?: string | null
          reference_sd_document_item?: string | null
          transaction_currency?: string | null
        }
        Relationships: []
      }
      business_partners: {
        Row: {
          business_partner: string
          business_partner_full_name: string | null
          business_partner_name: string | null
          creation_date: string | null
          customer: string | null
          id: string
        }
        Insert: {
          business_partner: string
          business_partner_full_name?: string | null
          business_partner_name?: string | null
          creation_date?: string | null
          customer?: string | null
          id?: string
        }
        Update: {
          business_partner?: string
          business_partner_full_name?: string | null
          business_partner_name?: string | null
          creation_date?: string | null
          customer?: string | null
          id?: string
        }
        Relationships: []
      }
      journal_entry_items: {
        Row: {
          accounting_document: string
          accounting_document_item: string | null
          accounting_document_type: string | null
          amount_in_transaction_currency: string | null
          company_code: string | null
          cost_center: string | null
          fiscal_year: string | null
          gl_account: string | null
          id: string
          posting_date: string | null
          profit_center: string | null
          reference_document: string | null
          transaction_currency: string | null
        }
        Insert: {
          accounting_document: string
          accounting_document_item?: string | null
          accounting_document_type?: string | null
          amount_in_transaction_currency?: string | null
          company_code?: string | null
          cost_center?: string | null
          fiscal_year?: string | null
          gl_account?: string | null
          id?: string
          posting_date?: string | null
          profit_center?: string | null
          reference_document?: string | null
          transaction_currency?: string | null
        }
        Update: {
          accounting_document?: string
          accounting_document_item?: string | null
          accounting_document_type?: string | null
          amount_in_transaction_currency?: string | null
          company_code?: string | null
          cost_center?: string | null
          fiscal_year?: string | null
          gl_account?: string | null
          id?: string
          posting_date?: string | null
          profit_center?: string | null
          reference_document?: string | null
          transaction_currency?: string | null
        }
        Relationships: []
      }
      outbound_delivery_headers: {
        Row: {
          creation_date: string | null
          delivery_document: string
          id: string
          overall_goods_movement_status: string | null
          overall_picking_status: string | null
          shipping_point: string | null
        }
        Insert: {
          creation_date?: string | null
          delivery_document: string
          id?: string
          overall_goods_movement_status?: string | null
          overall_picking_status?: string | null
          shipping_point?: string | null
        }
        Update: {
          creation_date?: string | null
          delivery_document?: string
          id?: string
          overall_goods_movement_status?: string | null
          overall_picking_status?: string | null
          shipping_point?: string | null
        }
        Relationships: []
      }
      outbound_delivery_items: {
        Row: {
          actual_delivery_quantity: string | null
          delivery_document: string
          delivery_document_item: string | null
          delivery_quantity_unit: string | null
          id: string
          plant: string | null
          reference_sd_document: string | null
          reference_sd_document_item: string | null
          storage_location: string | null
        }
        Insert: {
          actual_delivery_quantity?: string | null
          delivery_document: string
          delivery_document_item?: string | null
          delivery_quantity_unit?: string | null
          id?: string
          plant?: string | null
          reference_sd_document?: string | null
          reference_sd_document_item?: string | null
          storage_location?: string | null
        }
        Update: {
          actual_delivery_quantity?: string | null
          delivery_document?: string
          delivery_document_item?: string | null
          delivery_quantity_unit?: string | null
          id?: string
          plant?: string | null
          reference_sd_document?: string | null
          reference_sd_document_item?: string | null
          storage_location?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          accounting_document: string
          accounting_document_item: string | null
          amount_in_transaction_currency: string | null
          clearing_accounting_document: string | null
          clearing_date: string | null
          company_code: string | null
          customer: string | null
          fiscal_year: string | null
          id: string
          posting_date: string | null
          transaction_currency: string | null
        }
        Insert: {
          accounting_document: string
          accounting_document_item?: string | null
          amount_in_transaction_currency?: string | null
          clearing_accounting_document?: string | null
          clearing_date?: string | null
          company_code?: string | null
          customer?: string | null
          fiscal_year?: string | null
          id?: string
          posting_date?: string | null
          transaction_currency?: string | null
        }
        Update: {
          accounting_document?: string
          accounting_document_item?: string | null
          amount_in_transaction_currency?: string | null
          clearing_accounting_document?: string | null
          clearing_date?: string | null
          company_code?: string | null
          customer?: string | null
          fiscal_year?: string | null
          id?: string
          posting_date?: string | null
          transaction_currency?: string | null
        }
        Relationships: []
      }
      plants: {
        Row: {
          id: string
          plant: string
          plant_name: string | null
          sales_organization: string | null
        }
        Insert: {
          id?: string
          plant: string
          plant_name?: string | null
          sales_organization?: string | null
        }
        Update: {
          id?: string
          plant?: string
          plant_name?: string | null
          sales_organization?: string | null
        }
        Relationships: []
      }
      product_descriptions: {
        Row: {
          id: string
          language: string | null
          product: string
          product_description: string | null
        }
        Insert: {
          id?: string
          language?: string | null
          product: string
          product_description?: string | null
        }
        Update: {
          id?: string
          language?: string | null
          product?: string
          product_description?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          creation_date: string | null
          id: string
          product: string
          product_type: string | null
        }
        Insert: {
          creation_date?: string | null
          id?: string
          product: string
          product_type?: string | null
        }
        Update: {
          creation_date?: string | null
          id?: string
          product?: string
          product_type?: string | null
        }
        Relationships: []
      }
      sales_order_headers: {
        Row: {
          creation_date: string | null
          distribution_channel: string | null
          id: string
          organization_division: string | null
          overall_delivery_status: string | null
          sales_order: string
          sales_order_type: string | null
          sales_organization: string | null
          sold_to_party: string | null
          total_net_amount: string | null
          transaction_currency: string | null
        }
        Insert: {
          creation_date?: string | null
          distribution_channel?: string | null
          id?: string
          organization_division?: string | null
          overall_delivery_status?: string | null
          sales_order: string
          sales_order_type?: string | null
          sales_organization?: string | null
          sold_to_party?: string | null
          total_net_amount?: string | null
          transaction_currency?: string | null
        }
        Update: {
          creation_date?: string | null
          distribution_channel?: string | null
          id?: string
          organization_division?: string | null
          overall_delivery_status?: string | null
          sales_order?: string
          sales_order_type?: string | null
          sales_organization?: string | null
          sold_to_party?: string | null
          total_net_amount?: string | null
          transaction_currency?: string | null
        }
        Relationships: []
      }
      sales_order_items: {
        Row: {
          id: string
          material: string | null
          net_amount: string | null
          production_plant: string | null
          requested_quantity: string | null
          requested_quantity_unit: string | null
          sales_order: string
          sales_order_item: string
          storage_location: string | null
          transaction_currency: string | null
        }
        Insert: {
          id?: string
          material?: string | null
          net_amount?: string | null
          production_plant?: string | null
          requested_quantity?: string | null
          requested_quantity_unit?: string | null
          sales_order: string
          sales_order_item: string
          storage_location?: string | null
          transaction_currency?: string | null
        }
        Update: {
          id?: string
          material?: string | null
          net_amount?: string | null
          production_plant?: string | null
          requested_quantity?: string | null
          requested_quantity_unit?: string | null
          sales_order?: string
          sales_order_item?: string
          storage_location?: string | null
          transaction_currency?: string | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const
