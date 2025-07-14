import { get_data } from "../supabase/functions";

type Config = {
  menejemen_kurikulum?: boolean;
  menejemen_preferensi?: boolean;
  menejemen_jadwal?: boolean;
  jadwal?: boolean;
};

/**
 * Fungsi ini mengambil path redirect berdasarkan role user dan konfigurasi sistem.
 * Jika tidak memenuhi kondisi apa pun, akan mereturn `null`.
 */
export async function resolveRedirectPath(job: string): Promise<string | null> {
  const config = await get_data<Config>(
    "konfigurasi",
    "menejemen_kurikulum, menejemen_preferensi, menejemen_jadwal, jadwal"
  );

  const {
    menejemen_kurikulum = false,
    menejemen_preferensi = false,
    menejemen_jadwal = false,
  } = config[0] || {};

  if (job === "kaprodi") {
    const bothTrue = menejemen_kurikulum && menejemen_jadwal;
    if (bothTrue) return "/kaprodi";
    if (menejemen_kurikulum) return "/kaprodi/kurikulum";
    if (menejemen_jadwal) return "/kaprodi/penjadwalan";
  }

  if (job === "dosen" && menejemen_preferensi) return "/dosen/preferensi";
  if (job === "admin") return "/admin";

  return null; // fallback jika tidak ada konfigurasi yang cocok
}
