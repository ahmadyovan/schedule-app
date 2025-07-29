import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useMemo, useState } from "react";
import { Database } from '@/types/supabase';

type JadwalType = Database["public"]["Tables"]["jadwal"]["Row"] &
  Pick<Database["public"]["Tables"]["mata_kuliah"]["Row"], "nama" | "sks" | "kode"> & {
    nama_dosen: string;
};


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
        
        if (a.id_ruangan === b.id_ruangan) {
          const key = `${Math.min(a.id, b.id)}-${Math.max(a.id, b.id)}`;
          if (!checkedPairs.has(key)) {
            checkedPairs.add(key);
            totalPenalty += 100;
            totalMessages.push({
              type: 'Conflict_ruangan',
              id1: a.id,
              id2: b.id,
              deskripsi: `Konflik ruangan, jadwal ${a.id} dan ${b.id} pada hari ke-${a.id_hari} antara ${formatTime(a.jam_mulai)}-${formatTime(a.jam_akhir)} dan ${formatTime(b.jam_mulai)}-${formatTime(b.jam_akhir)}`
            });
          }
        }
        
        if (a.id_dosen === b.id_dosen) {
          const key = `${Math.min(a.id, b.id)}-${Math.max(a.id, b.id)}`;
          if (!checkedPairs.has(key)) {
            checkedPairs.add(key);
            totalPenalty += 100;
            totalMessages.push({
              type: 'Conflict_dosen',
              id1: a.id,
              id2: b.id,
              deskripsi: `Konflik dosen, jadwal ${a.id} dan ${b.id} pada hari ke-${a.id_hari} antara ${formatTime(a.jam_mulai)}-${formatTime(a.jam_akhir)} dan ${formatTime(b.jam_mulai)}-${formatTime(b.jam_akhir)}`
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

        if (preferensi) {
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
  const conflicts_dosen = [];
  const preferences = [];
  const conflicts_ruangan = [];

  for (const msg of messages) {
    if (msg.type === 'Conflict_dosen') conflicts_dosen.push(msg);
    else if (msg.type === 'Conflict_ruangan') conflicts_ruangan.push(msg);
    else if (msg.type === 'Preference') preferences.push(msg);
  }

  return { conflicts_dosen, conflicts_ruangan, preferences };
}


const prodiMap: Record<number, string> = {
		1: "Mesin",
		2: "Komputer",
		3: "Industri",
		4: "Informatika",
		5: "DKV"
	};

const getprodi = (id: number) => prodiMap[id] || "";

	const formatWaktu = (menit: number): string => {
		const interval = 40;
		const menitTepat = Math.floor(menit / interval) * interval;
		const jam = Math.floor(menitTepat / 60);
		const menitSisa = menitTepat % 60;
		return `${jam.toString().padStart(2, "0")}:${menitSisa.toString().padStart(2, "0")}`;
	};

	const getWaktuPerkuliahan = (menit: number, batasJamMalam = 15): 'pagi' | 'malam' => {
		const jam = Math.floor(menit / 60);
		return jam < batasJamMalam ? 'pagi' : 'malam';
	};

	const getNamaHari = (hari: number): string => {
		return ["Hari tidak valid", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][hari] || "-";
	};

	function groupByKelas(data: JadwalType[]): Record<number, JadwalType[]> {
	return data.reduce((acc, item) => {
		const key = item.id_kelas ?? 1;
		if (!acc[key]) acc[key] = [];
		acc[key].push(item);
		return acc;
	}, {} as Record<number, JadwalType[]>);
	}

	function getKelasLabel(id_kelas: number): string {
		return String.fromCharCode(64 + id_kelas);
	}

export const exportToExcel = (data: JadwalType[], fileName = 'jadwal.xlsx') => {
		const workbook = XLSX.utils.book_new();

		Object.entries(prodiMap).forEach(([prodiId, prodiName]) => {
			const prodiData = data.filter(j => j.prodi === Number(prodiId));
			if (prodiData.length === 0) return;

			const pagiData = prodiData.filter(j => j.jam_mulai !== null && j.jam_mulai < 1080);
			const malamData = prodiData.filter(j => j.jam_mulai !== null && j.jam_mulai >= 1080);

			const semesters = [1, 3, 5, 7, 2, 4, 6, 8];
			const columnsHeader = ['KODE', 'MATA KULIAH', 'SKS', 'DOSEN', 'HARI', 'WAKTU'];

			const worksheetData: any[][] = [];
			worksheetData.push([`JADWAL PERKULIAHAN PRODI ${prodiName.toUpperCase()}`]);
			worksheetData.push([]);
			worksheetData.push(['PAGI', '', '', '', '', '', 'MALAM', '', '', '', '', '']);
			worksheetData.push([...columnsHeader, ...columnsHeader]);

			const buildRows = (list: JadwalType[]) =>
			list.map(item => {
				const waktu = item.jam_mulai !== null && item.jam_akhir !== null
				? `${formatWaktu(item.jam_mulai)} - ${formatWaktu(item.jam_akhir)}`
				: '';
				return [
				item.kode,
				item.nama,
				item.sks,
				item.nama_dosen,
				item.id_hari != null ? getNamaHari(item.id_hari) : '-',
				waktu,
				item.id_ruangan
				];
			});

			for (const semester of semesters) {
			const pagiSemester = pagiData.filter(j => j.semester === semester);
			const malamSemester = malamData.filter(j => j.semester === semester);

			// Kelompokkan berdasarkan kelas
			const pagiKelasMap = groupByKelas(pagiSemester);
			const malamKelasMap = groupByKelas(malamSemester);

			const maxKelas = Math.max(
				Object.keys(pagiKelasMap).length,
				Object.keys(malamKelasMap).length
			);

			// Loop per kelas (A, B, C...)
			const kelasKeys = Array.from({ length: maxKelas }, (_, i) => i + 1);

			for (const kelas of kelasKeys) {
				const kelasLabel = getKelasLabel(kelas);

				const pagiRows = buildRows(pagiKelasMap[kelas] || []);
				const malamRows = buildRows(malamKelasMap[kelas] || []);
				const maxRows = Math.max(pagiRows.length, malamRows.length);

				const pagiHeader = pagiRows.length > 0
				? [`SEMESTER ${semester} - KELAS ${kelasLabel}`, '', '', '', '', '']
				: ['', '', '', '', '', ''];
				const malamHeader = malamRows.length > 0
				? [`SEMESTER ${semester} - KELAS ${kelasLabel}`, '', '', '', '', '']
				: ['', '', '', '', '', ''];

				worksheetData.push([...pagiHeader, ...malamHeader]);

				for (let i = 0; i < maxRows; i++) {
				const pagi = pagiRows[i] ?? ['', '', '', '', '', ''];
				const malam = malamRows[i] ?? ['', '', '', '', '', ''];
				worksheetData.push([...pagi, ...malam]);
				}

				worksheetData.push([]); 
			}
			}

			const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

			// Merge judul utama
			worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }];

			// Auto column width
			const colWidths: number[] = [];
			worksheetData.forEach(row => {
			row.forEach((cell, idx) => {
				const len = cell?.toString().length ?? 0;
				colWidths[idx] = Math.max(colWidths[idx] || 10, len + 2);
			});
			});
			worksheet['!cols'] = colWidths.map(w => ({ wch: w }));

			XLSX.utils.book_append_sheet(workbook, worksheet, prodiName);
		});

		const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName);
	};	