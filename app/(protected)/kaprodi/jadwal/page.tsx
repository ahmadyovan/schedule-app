'use client'

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { useRealtime } from "@/components/hook/useRealtimeCourses";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const prodi = 4;
const supabase = createClient();

type JadwalList = {
    id: number;
    id_matkul: number;
    id_dosen: number;
    id_kelas: number;
    id_hari: number;
    id_ruangan: number | null;
    id_waktu: number;
    semester: number;
    prodi: number;
    jam_mulai: string | null;
    jam_akhir: string | null;
    dosen: {
      id: number;
      nama: string;
    };
    mata_kuliah: {
      id: number;
      nama: string;
      sks: number;
      kode: number;
    };
  };

const Home = () => {

    const [activeSemester, setActiveSemester] = useState<number>(1);
    const [waktu, setWaktu] = useState<number>(1);
	const [kelas, setKelas] = useState<number>(1);
	const [kelasList, setKelasList] = useState<number[]>([1]);
    const [conflictIds, setConflictIds] = useState<number[]>([]);

    const { data, loading } = useRealtime('jadwal', {
        select: '*, mata_kuliah(id, kode, nama, sks), dosen(id, nama)',
        filters: [
          { column: 'prodi', value: prodi},
          {column: 'semester', value: activeSemester},
          {column: 'id_waktu', value: waktu},
        ],
      });

      const prodiMap: Record<number, string> = {
        1: "Teknik Mesin",
        2: "Komputer",
        3: "Industri",
        4: "Informatika",
        5: "DKV"
      };
      
      const getprodi = (id: number) => prodiMap[id] || "";

      const formatWaktu = (menit: number): string => {
        // Pastikan menit selalu dalam interval 40 menit
        const interval = 40;
        const menitTepat = Math.floor(menit / interval) * interval;
    
        const jam = Math.floor(menitTepat / 60);
        const menitSisa = menitTepat % 60;
    
        return `${jam.toString().padStart(2, "0")}:${menitSisa.toString().padStart(2, "0")}`;
    };

    const getNamaHari = (hari: number): string => {
        return ["Hari tidak valid", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][hari] || "-";
    };

      const exportToExcel = (data: JadwalList[], fileName = 'jadwal.xlsx') => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const worksheetData: any[][] = [];
      
        // Judul utama
        worksheetData.push(['JADWAL PERKULIAHAN']);
        worksheetData.push([]); // baris kosong opsional
      
        // Kelompokkan berdasarkan semester
        const grouped = data.reduce((acc, curr) => {
          const sem = curr.semester ?? 'Unknown';
          if (!acc[sem]) acc[sem] = [];
          acc[sem].push(curr);
          return acc;
        }, {} as Record<string | number, JadwalList[]>);
      
        for (const [semester, items] of Object.entries(grouped)) {
          worksheetData.push([`Semester ${semester}`]); // header semester
          worksheetData.push(['kode','Mata Kuliah', 'sks', 'Dosen', 'hari', 'waktu', 'ruangan']); // header kolom                  
      
          for (const item of items) {

            const jamMulai = item.jam_mulai ? formatWaktu(Number(item.jam_mulai)) : '';
            const jamAkhir = item.jam_akhir ? formatWaktu(Number(item.jam_akhir)) : '';
            const waktu = jamMulai && jamAkhir ? `${jamMulai} - ${jamAkhir}` : '';

            worksheetData.push([
                item.mata_kuliah.kode ?? '',
                item.mata_kuliah?.nama ?? '',
                item.mata_kuliah?.sks ?? '',
                item.dosen?.nama ?? '',
                getNamaHari(item.id_hari),
                waktu,
                item.id_ruangan ?? '',

            ]);
          }
      
          worksheetData.push([]); // baris kosong antar semester
        }
      
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
        // Merge A1–C1 untuk judul utama
        worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
      
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Jadwal');
      
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, fileName);
      };

      useEffect(() => {
        if (!data || data.length === 0) {
            setKelasList([1]); // Default kelasList jika tidak ada data
            setKelas(1);
            return;
        }        
    
        // Ambil semua id_kelas unik berdasarkan id_waktu dan activeSemester
        let uniqueIdKelas = Array.from(
            new Set(
                data
                    .filter((jadwal) => jadwal.id_waktu === waktu)
                    .filter((jadwal) => jadwal.semester === activeSemester)
                    .map((jadwal) => jadwal.id_kelas)
                    .filter((id) => id !== null)
            )
        ) as number[];
    
        // Urutkan berdasarkan angka agar nanti diubah ke alfabet dengan benar
        uniqueIdKelas.sort((a, b) => a - b);
    
        // Jika array kosong, tambahkan nilai default 1
        if (uniqueIdKelas.length === 0) {
            uniqueIdKelas = [1];
        }
    
        // Jika hanya ada satu elemen dan bukan 1, tambahkan angka sebelumnya
        if (uniqueIdKelas.length === 1 && uniqueIdKelas[0] > 1) {
            const firstValue = uniqueIdKelas[0];
            uniqueIdKelas = [firstValue - 1, firstValue];
        }
    
        setKelasList((prevKelasList) => {
            // Periksa apakah list berubah sebelum mengupdate state
            if (JSON.stringify(prevKelasList) !== JSON.stringify(uniqueIdKelas)) {
                return uniqueIdKelas;
            }
            return prevKelasList;
        });
    }, [activeSemester, data, waktu]);

    useEffect(() => {
        const fetchConflicts = async () => {
          const { data, error } = await supabase.from('conflicts').select('jadwal_a');
          if (error) {
            console.error('Gagal mengambil data konflik:', error.message);
          } else {
            const ids = data.map(item => item.jadwal_a);
            setConflictIds(ids);
          }
        };
      
        fetchConflicts();
      }, []);

    const filteredData = data.filter((item) => item.id_kelas === kelas).sort((a, b) => a.id_hari - b.id_hari);
    return (
        <div className="h-screen w-screen flex flex-col text-black xl:text-xl">
            <h1 className="text-2xl font-bold text-center">JADWAL PERKULIAHAN {getprodi(prodi)}</h1>
            <div className="flex flex-col gap-3">
                <div className="w-full flex flex-col gap-3">
                    <div className="flex flex-wrap gap-3">
                    {Array.from({ length: 8 }, (_, index) => {
                        const semester = index + 1;
                        return (
                            <button
                            key={semester}
                            onClick={() => setActiveSemester(semester)}
                            className={`px-2 py-2 rounded-md transition-colors
                                ${
                                activeSemester === semester
                                    ? 'bg-[#cefdc2]'
                                    : 'bg-[#E9E9E9] hover:bg-gray-300'
                                }`}
                            >
                            Semester {semester}
                            </button>
                        );
                    })}
                    </div>
                    <div className="flex gap-10">
                        <div className='flex gap-3 items-center'>
                            <h1>waktu</h1>
                            <button
                            className={`px-2 py-2 rounded-md ${
                                waktu === 1 ? "bg-gray-500 text-white" : "bg-[#E9E9E9] hover:bg-gray-300"
                            }`} onClick={() => setWaktu(1)}
                            >
                            Pagi
                            </button>
                            <button
                            className={`px-2 py-2 rounded-md ${
                                waktu === 2 ? "bg-gray-500 text-white" : "bg-[#E9E9E9] hover:bg-gray-300"
                            }`} onClick={() => setWaktu(2)}
                            >
                            Malam
                            </button>
                        </div>
                        <div>
                        {filteredData && filteredData.length > 0 ? (
                            <div className='flex items-center gap-3'>
                                <h1>Kelas</h1>
                                {kelasList.map((item) => (
                                    <button
                                        key={item}
                                        className={`px-4 py-2 rounded-md ${
                                            kelas === item ? "bg-gray-500 text-white" : "bg-[#E9E9E9] hover:bg-gray-300"
                                        }`}
                                        onClick={() => setKelas(item)}
                                    >
                                        {String.fromCharCode(64 + item)}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                        </div>                 
                    </div>
                </div>
                <div className="w-full flex flex-col gap-3">
                    <div className="bg-[#cefdc2] py-2 w-full grid grid-cols-[5rem,7rem,1fr,5rem,1fr,5rem,10rem,5rem] rounded-md gap-3">
                        <div className="text-center">no</div>
                        <div className="">kode</div>
                        <div className="">mata kuliah</div>
                        <div className="text-center">sks</div>
                        <div className="">dosen</div>
                        <div className="">hari</div>
                        <div className="">waktu</div>
                        <div className="">ruangan</div>
                    </div>
                    <div>
                    {loading ? (
                        <p className="text-center">Loading...</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {filteredData && filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
                                    <div key={index} className={`bg-[#E9E9E9] py-2 w-full grid grid-cols-[5rem,7rem,1fr,5rem,1fr,5rem,10rem,5rem] rounded-md gap-3 shadow ${ conflictIds.includes(item.id) ? 'bg-red-300' : 'bg-[#E9E9E9]'} `}>
                                        <div className="text-center">{index + 1}</div>
                                        <div className="">{item.mata_kuliah.kode}</div>
                                        <div className="overflow-hidden text-nowrap">{item.mata_kuliah.nama}</div>
                                        <div className="text-center">{item.mata_kuliah.sks}</div>
                                        <div className="overflow-hidden text-nowrap">{item.dosen.nama}</div>
                                        <div>{getNamaHari(item.id_hari)}</div>
                                        <div>{`${formatWaktu(item.jam_mulai)} - ${formatWaktu(item.jam_akhir)}`}</div>
                                        <div className="">{item.id_ruangan ?? '-'}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 p-4">Tidak ada jadwal</div>
                            )}
                        </div>
                    )}
                    </div>
                </div>              
			</div>
            <button
                onClick={() => exportToExcel(data, 'jadwal-dosen.xlsx')}
                className="px-4 py-2 bg-green-600 text-white rounded"
                >
                Export Excel
                </button>

        </div>
    );
};

export default Home;
