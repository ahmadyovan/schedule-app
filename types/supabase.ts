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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      dosen: {
        Row: {
          created_at: string
          id: number
          nama: string
          prodi: number | null
          uid: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          nama: string
          prodi?: number | null
          uid?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          nama?: string
          prodi?: number | null
          uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dosen_prodi_fkey"
            columns: ["prodi"]
            isOneToOne: false
            referencedRelation: "prodi"
            referencedColumns: ["id"]
          },
        ]
      }
      jadwal: {
        Row: {
          create_at: string
          id: number
          id_dosen: number
          id_hari: number | null
          id_kelas: number
          id_matkul: number
          id_ruangan: number | null
          id_waktu: number
          jam_akhir: number | null
          jam_mulai: number | null
          prodi: number
          semester: number
        }
        Insert: {
          create_at?: string
          id?: number
          id_dosen?: number
          id_hari?: number | null
          id_kelas?: number
          id_matkul?: number
          id_ruangan?: number | null
          id_waktu?: number
          jam_akhir?: number | null
          jam_mulai?: number | null
          prodi?: number
          semester?: number
        }
        Update: {
          create_at?: string
          id?: number
          id_dosen?: number
          id_hari?: number | null
          id_kelas?: number
          id_matkul?: number
          id_ruangan?: number | null
          id_waktu?: number
          jam_akhir?: number | null
          jam_mulai?: number | null
          prodi?: number
          semester?: number
        }
        Relationships: [
          {
            foreignKeyName: "jadwal_id_dosen_fkey"
            columns: ["id_dosen"]
            isOneToOne: false
            referencedRelation: "dosen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jadwal_id_matkul_fkey"
            columns: ["id_matkul"]
            isOneToOne: false
            referencedRelation: "mata_kuliah"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jadwal_id_waktu_fkey"
            columns: ["id_waktu"]
            isOneToOne: false
            referencedRelation: "waktu"
            referencedColumns: ["id"]
          },
        ]
      }
      kaprodi: {
        Row: {
          created_at: string
          id: number
          name: string
          prodi: number
          st: number | null
          uid: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          prodi: number
          st?: number | null
          uid: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          prodi?: number
          st?: number | null
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "kaprodi_prodi_fkey"
            columns: ["prodi"]
            isOneToOne: false
            referencedRelation: "prodi"
            referencedColumns: ["id"]
          },
        ]
      }
      konfigurasi: {
        Row: {
          created_at: string
          id: number
          jadwal: boolean
          menejemen_jadwal: boolean
          menejemen_kurikulum: boolean
          menejemen_preferensi: boolean
          tahun: string
        }
        Insert: {
          created_at?: string
          id?: number
          jadwal?: boolean
          menejemen_jadwal?: boolean
          menejemen_kurikulum?: boolean
          menejemen_preferensi?: boolean
          tahun?: string
        }
        Update: {
          created_at?: string
          id?: number
          jadwal?: boolean
          menejemen_jadwal?: boolean
          menejemen_kurikulum?: boolean
          menejemen_preferensi?: boolean
          tahun?: string
        }
        Relationships: []
      }
      mata_kuliah: {
        Row: {
          created_at: string
          id: number
          kode: number
          nama: string
          prodi: number
          semester: number
          sks: number
        }
        Insert: {
          created_at?: string
          id?: number
          kode: number
          nama: string
          prodi: number
          semester: number
          sks: number
        }
        Update: {
          created_at?: string
          id?: number
          kode?: number
          nama?: string
          prodi?: number
          semester?: number
          sks?: number
        }
        Relationships: []
      }
      prefMatkul: {
        Row: {
          created_at: string
          id: number
          id_dosen: number | null
          id_matkul: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          id_dosen?: number | null
          id_matkul?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          id_dosen?: number | null
          id_matkul?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prefMatkul_id_dosen_fkey"
            columns: ["id_dosen"]
            isOneToOne: false
            referencedRelation: "dosen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prefMatkul_id_matkul_fkey"
            columns: ["id_matkul"]
            isOneToOne: false
            referencedRelation: "mata_kuliah"
            referencedColumns: ["id"]
          },
        ]
      }
      prefWaktu: {
        Row: {
          created_at: string
          id: number
          id_dosen: number | null
          jumat_malam: boolean | null
          jumat_pagi: boolean | null
          kamis_malam: boolean | null
          kamis_pagi: boolean | null
          rabu_malam: boolean | null
          rabu_pagi: boolean | null
          selasa_malam: boolean | null
          selasa_pagi: boolean | null
          senin_malam: boolean | null
          senin_pagi: boolean | null
        }
        Insert: {
          created_at?: string
          id?: number
          id_dosen?: number | null
          jumat_malam?: boolean | null
          jumat_pagi?: boolean | null
          kamis_malam?: boolean | null
          kamis_pagi?: boolean | null
          rabu_malam?: boolean | null
          rabu_pagi?: boolean | null
          selasa_malam?: boolean | null
          selasa_pagi?: boolean | null
          senin_malam?: boolean | null
          senin_pagi?: boolean | null
        }
        Update: {
          created_at?: string
          id?: number
          id_dosen?: number | null
          jumat_malam?: boolean | null
          jumat_pagi?: boolean | null
          kamis_malam?: boolean | null
          kamis_pagi?: boolean | null
          rabu_malam?: boolean | null
          rabu_pagi?: boolean | null
          selasa_malam?: boolean | null
          selasa_pagi?: boolean | null
          senin_malam?: boolean | null
          senin_pagi?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "prefWaktu_id_dosen_fkey"
            columns: ["id_dosen"]
            isOneToOne: false
            referencedRelation: "dosen"
            referencedColumns: ["id"]
          },
        ]
      }
      prodi: {
        Row: {
          created_at: string
          id: number
          nama: string
        }
        Insert: {
          created_at?: string
          id?: number
          nama: string
        }
        Update: {
          created_at?: string
          id?: number
          nama?: string
        }
        Relationships: []
      }
      ruangan: {
        Row: {
          created_at: string
          id: number
          nama: string
        }
        Insert: {
          created_at?: string
          id?: number
          nama?: string
        }
        Update: {
          created_at?: string
          id?: number
          nama?: string
        }
        Relationships: []
      }
      user: {
        Row: {
          created_at: string
          email: string | null
          id: number
          job: string | null
          name: string | null
          prodi: number | null
          uid: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          job?: string | null
          name?: string | null
          prodi?: number | null
          uid?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          job?: string | null
          name?: string | null
          prodi?: number | null
          uid?: string | null
        }
        Relationships: []
      }
      waktu: {
        Row: {
          created_at: string
          id: number
          nama: string
        }
        Insert: {
          created_at?: string
          id?: number
          nama: string
        }
        Update: {
          created_at?: string
          id?: number
          nama?: string
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
