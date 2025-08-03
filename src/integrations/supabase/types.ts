export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booked_at: string | null
          booking_status: Database["public"]["Enums"]["booking_status"] | null
          bus_id: number
          coins_earned: number | null
          coins_used: number | null
          contact_info: Json
          id: string
          passenger_details: Json
          payment_id: string | null
          payment_status: string | null
          selected_seats: string[]
          stripe_session_id: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booked_at?: string | null
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          bus_id: number
          coins_earned?: number | null
          coins_used?: number | null
          contact_info: Json
          id?: string
          passenger_details: Json
          payment_id?: string | null
          payment_status?: string | null
          selected_seats: string[]
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booked_at?: string | null
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          bus_id?: number
          coins_earned?: number | null
          coins_used?: number | null
          contact_info?: Json
          id?: string
          passenger_details?: Json
          payment_id?: string | null
          payment_status?: string | null
          selected_seats?: string[]
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
        ]
      }
      bus_seats: {
        Row: {
          bus_id: number
          id: string
          is_available: boolean | null
          seat_number: string
          seat_type: string | null
        }
        Insert: {
          bus_id: number
          id?: string
          is_available?: boolean | null
          seat_number: string
          seat_type?: string | null
        }
        Update: {
          bus_id?: number
          id?: string
          is_available?: boolean | null
          seat_number?: string
          seat_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bus_seats_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
        ]
      }
      buses: {
        Row: {
          arrival_time: string
          bus_name: string
          departure_time: string
          destination: string
          id: number
          price: number
          source: string
        }
        Insert: {
          arrival_time: string
          bus_name: string
          departure_time: string
          destination: string
          id?: never
          price: number
          source: string
        }
        Update: {
          arrival_time?: string
          bus_name?: string
          departure_time?: string
          destination?: string
          id?: never
          price?: number
          source?: string
        }
        Relationships: []
      }
      Buses: {
        Row: {
          arrival_time: string | null
          bus_name: string | null
          departure_time: string | null
          destination: string | null
          id: number
          price: number | null
          source: string | null
        }
        Insert: {
          arrival_time?: string | null
          bus_name?: string | null
          departure_time?: string | null
          destination?: string | null
          id: number
          price?: number | null
          source?: string | null
        }
        Update: {
          arrival_time?: string | null
          bus_name?: string | null
          departure_time?: string | null
          destination?: string | null
          id?: number
          price?: number | null
          source?: string | null
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          description: string | null
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coin_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          coins: number | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          phone_verified: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coins?: number | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coins?: number | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seat_locks: {
        Row: {
          bus_id: number
          expires_at: string | null
          id: string
          locked_at: string | null
          seat_number: string
          user_id: string
        }
        Insert: {
          bus_id: number
          expires_at?: string | null
          id?: string
          locked_at?: string | null
          seat_number: string
          user_id: string
        }
        Update: {
          bus_id?: number
          expires_at?: string | null
          id?: string
          locked_at?: string | null
          seat_number?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_locks_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_coins_to_user: {
        Args: {
          p_user_id: string
          p_amount: number
          p_booking_id?: string
          p_transaction_type?: string
          p_description?: string
        }
        Returns: undefined
      }
      clean_expired_seat_locks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      confirm_booking: {
        Args: { p_booking_id: string; p_payment_id: string }
        Returns: undefined
      }
      lock_seats: {
        Args: { p_bus_id: number; p_seat_numbers: string[]; p_user_id: string }
        Returns: boolean
      }
      release_seat_locks: {
        Args: { p_bus_id: number; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "refunded"
      seat_status: "available" | "locked" | "booked"
      user_role: "user" | "admin"
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
      booking_status: ["pending", "confirmed", "cancelled", "refunded"],
      seat_status: ["available", "locked", "booked"],
      user_role: ["user", "admin"],
    },
  },
} as const
