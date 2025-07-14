type Filter = {
  column: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
};

interface FetchParams {
  table: string;
  selectFields?: string;
  filters?: Filter[];
};

export const fetchFromApi = async ({ table, selectFields = '*', filters = [] }: FetchParams) => {
  const response = await fetch('/api/get-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, selectFields, filters }),
  });

  const json = await response.json();

  if (!json.success) {
    console.error(`Gagal fetch dari ${table}:`, json.message);
  }

  return json;
};

interface InsertParams {
  table: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>;
}

export const insertData = async ({ table, payload }: InsertParams) => {
 console.log("payload",payload);
  
  const response = await fetch('/api/insert-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, payload }),
    });
    
    const json = await response.json();
    
    if (!json.success) {
       
      console.error(`Gagal insert ke ${table}:`, json.message);
    }

    return json;
};

interface UpdateParams {
  table: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>;
  filters: Filter[];
}

export const updateData = async ({ table, payload, filters }: UpdateParams) => {
  try {
    const response = await fetch('/api/update-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, payload, filters }),
    });

    const json = await response.json();

    if (!json.success) {
      console.error(`Gagal update ${table}:`, json.message);
    }

    return json;
  } catch (err) {
    console.error(`Error saat update ${table}:`, err);
    return { success: false };
  }
};

interface DeleteParams {
  table: string;
  id: number | string;
  key?: string; // default: 'id'
}

export const deleteData = async ({ table, id, key = 'id' }: DeleteParams) => {
  try {
    const response = await fetch('/api/delete-data', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id, key }),
    });

    const json = await response.json();

    if (!json.success) {
      console.error(`Gagal hapus data dari ${table}:`, json.message);
    }

    return json;
  } catch (err) {
    console.error(`Error saat hapus data dari ${table}:`, err);
    return { success: false };
  }
};


// evaluate schedule


// Versi JavaScript dari evaluasi jadwal Rust

function isOverlap(a: { jam_mulai: number; jam_akhir: number; }, b: { jam_akhir: number; jam_mulai: number; }) {
  return a.jam_mulai < b.jam_akhir && b.jam_mulai < a.jam_akhir;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function evaluateSchedule(schedule: any, timePreferences: any) {
  const totalMessages = [];
  let totalPenalty = 0;
  const checkedPairs = new Set();
  const timePrefMap = new Map();
  for (const pref of timePreferences) {
    timePrefMap.set(pref.id_dosen, pref);
  }

  if (!schedule || !Array.isArray(schedule)) {
    console.error('Invalid schedule data');
  }

  const oddSemester = schedule.filter((c: { semester: number; }) => c.semester % 2 === 1);
  const evenSemester = schedule.filter((c: { semester: number; }) => c.semester % 2 === 0);

  for (const group of [oddSemester, evenSemester]) {
    console.log(group);
    
    for (let i = 0; i < group.length; i++) {
      const a = group[i];

      // Cek konflik antar dosen
      for (let j = i + 1; j < group.length; j++) {
        const b = group[j];
        
        
        if (a.id_hari !== b.id_hari || !isOverlap(a, b)) continue;      
        
        if (a.id_dosen === b.id_dosen) {
          const key = `${Math.min(a.id, b.id)}-${Math.max(a.id, b.id)}`;
          if (!checkedPairs.has(key)) {
            checkedPairs.add(key);
            totalPenalty += 100;
            totalMessages.push({
              type: 'Conflict',
              id1: a.id,
              id2: b.id,
              deskripsi: `Konflik dosen antara jadwal ${a.id} dan ${b.id} pada hari ke-${a.id_hari} antara ${formatTime(a.jam_mulai)}-${formatTime(a.jam_akhir)} dan ${formatTime(b.jam_mulai)}-${formatTime(b.jam_akhir)}`
            });
          }
        }
      }

      // Cek preferensi waktu
      const pref = timePrefMap.get(a.id_dosen);
      if (pref) {
        const hariIdx = a.hari - 1;
        const isPagi = a.jam_mulai < 1080;
        const preferensi = isPagi
          ? [pref.senin_pagi, pref.selasa_pagi, pref.rabu_pagi, pref.kamis_pagi, pref.jumat_pagi][hariIdx]
          : [pref.senin_malam, pref.selasa_malam, pref.rabu_malam, pref.kamis_malam, pref.jumat_malam][hariIdx];

        if (!preferensi) {
          totalPenalty += 100;
          const hariStr = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'][hariIdx] || 'Tidak Dikenal';
          const waktuStr = isPagi ? 'pagi' : 'malam';

          totalMessages.push({
            type: 'Preference',
            id: a.id,
            id_dosen: a.id_dosen,
            hari: a.id_hari,
            jam_mulai: a.jam_mulai,
            deskripsi: `Dosen ${a.id_dosen} tidak prefer jadwal ${hariStr} ${waktuStr}.`,
          });
        }
      }
    }
  }

  return {
    total_penalty: totalPenalty,
    messages: totalMessages,
  };
}

function formatTime(menit: number) {
  const jam = Math.floor(menit / 60).toString().padStart(2, '0');
  const mnt = (menit % 60).toString().padStart(2, '0');
  return `${jam}:${mnt}`;
}

// Export juga fungsi untuk memisahkan pesan berdasarkan tipe
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function splitEvaluationMessages(messages: any) {
  const conflicts = [];
  const preferences = [];

  for (const msg of messages) {
    if (msg.type === 'Conflict') conflicts.push(msg);
    else if (msg.type === 'Preference') preferences.push(msg);
  }

  return { conflicts, preferences };
}
