export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      conflicts: {
        Row: {
          deskripsi: string
          hari: number | null
          id: number
          id_dosen: number | null
          id_jadwal: number | null
          jadwal_a: number | null
          jadwal_b: number | null
        }
        Insert: {
          deskripsi: string
          hari?: number | null
          id?: number
          id_dosen?: number | null
          id_jadwal?: number | null
          jadwal_a?: number | null
          jadwal_b?: number | null
        }
        Update: {
          deskripsi?: string
          hari?: number | null
          id?: number
          id_dosen?: number | null
          id_jadwal?: number | null
          jadwal_a?: number | null
          jadwal_b?: number | null
        }
        Relationships: []
      }
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
      kelas: {
        Row: {
          created_at: string
          id: number
          kode: string | null
          nama: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          kode?: string | null
          nama?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          kode?: string | null
          nama?: string | null
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
