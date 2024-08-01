export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      course: {
        Row: {
          course_id: number
          course_kode: string
          course_name: string
          course_prodi: number | null
          course_semester: string | null
          course_sks: number | null
          created_at: string
        }
        Insert: {
          course_id?: number
          course_kode: string
          course_name: string
          course_prodi?: number | null
          course_semester?: string | null
          course_sks?: number | null
          created_at?: string
        }
        Update: {
          course_id?: number
          course_kode?: string
          course_name?: string
          course_prodi?: number | null
          course_semester?: string | null
          course_sks?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_course_prodi_fkey"
            columns: ["course_prodi"]
            isOneToOne: false
            referencedRelation: "prodi"
            referencedColumns: ["prodi_id"]
          },
        ]
      }
      jadwal: {
        Row: {
          created_at: string
          id: number
          jadwal_course_id: number
          jadwal_dosen_id: string | null
          jadwal_hari: string | null
          jadwal_jam: string | null
          jadwal_waktu: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          jadwal_course_id: number
          jadwal_dosen_id?: string | null
          jadwal_hari?: string | null
          jadwal_jam?: string | null
          jadwal_waktu?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          jadwal_course_id?: number
          jadwal_dosen_id?: string | null
          jadwal_hari?: string | null
          jadwal_jam?: string | null
          jadwal_waktu?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jadwal_jadwal_dosen_fkey"
            columns: ["jadwal_dosen_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "jadwal_jadwal_matakuliah_fkey"
            columns: ["jadwal_course_id"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["course_id"]
          },
        ]
      }
      preferensi: {
        Row: {
          created_at: string | null
          preferensi_dosen_id: string | null
          preferensi_hari: string[] | null
          preferensi_id: number
        }
        Insert: {
          created_at?: string | null
          preferensi_dosen_id?: string | null
          preferensi_hari?: string[] | null
          preferensi_id?: number
        }
        Update: {
          created_at?: string | null
          preferensi_dosen_id?: string | null
          preferensi_hari?: string[] | null
          preferensi_id?: number
        }
        Relationships: []
      }
      prodi: {
        Row: {
          created_at: string
          prodi_id: number
          prodi_name: string
        }
        Insert: {
          created_at?: string
          prodi_id?: number
          prodi_name: string
        }
        Update: {
          created_at?: string
          prodi_id?: number
          prodi_name?: string
        }
        Relationships: []
      }
      user: {
        Row: {
          created_at: string
          user_email: string
          user_id: string
          user_job: string | null
          user_name: string
          user_prodi: number | null
        }
        Insert: {
          created_at?: string
          user_email: string
          user_id: string
          user_job?: string | null
          user_name: string
          user_prodi?: number | null
        }
        Update: {
          created_at?: string
          user_email?: string
          user_id?: string
          user_job?: string | null
          user_name?: string
          user_prodi?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_user_prodi_fkey"
            columns: ["user_prodi"]
            isOneToOne: false
            referencedRelation: "prodi"
            referencedColumns: ["prodi_id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
