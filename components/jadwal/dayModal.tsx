"use client";

import { updateData } from "@/utils/functions";
import React, { useEffect, useMemo, useState } from "react";

type Jadwal = {
	id: number;
	id_matkul: number;
	id_dosen: number;
	id_kelas: number;
	id_hari: number;      
	id_waktu: number;
	semester: number;
	create_at: string;
	prodi: number;
	id_ruangan: number;
	id_jadwal: number;
	jam_mulai: number;    
	jam_akhir: number;    
	nama_dosen: string;
	nama: string;
	sks: number;
	kode: number;
};

type ConflictType = "dosen" | "ruangan" | "preferensi";

type KonflikByType = {
	type: ConflictType;
	data: Jadwal[];
};

const hariMap: Record<number, string> = {
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
};

type HariModalProps = {
    isOpen: boolean;
    onClose: () => void;
    selectedJadwal: Jadwal;
    jadwalData: Jadwal[];
    conflictData: KonflikByType[];
    setSwap: (value: boolean) => void;
    onView: ( value: number) => boolean;
};

export default function HariModal({ isOpen, onClose, selectedJadwal, jadwalData, conflictData, setSwap, onView}: HariModalProps) {
    const [selectedHari, setSelectedHari] = useState<number>(selectedJadwal.id_hari);
    const [selectedJam, setSelectedJam] = useState<{ jam_awal: number; jam_akhir: number }>(() => {
        const jam_awal = selectedJadwal.jam_mulai;
        const jam_akhir = selectedJadwal.jam_akhir;
        return { jam_awal, jam_akhir };
    });
    const [selectedRuangan, setSelectedRuangan] = useState<number>(selectedJadwal.id_ruangan);

    useEffect(() => {
        if (selectedJadwal.id_hari !== undefined) {
            setSelectedHari(selectedJadwal.id_hari);
        }
    }, [selectedJadwal])

    
    useEffect(() => {
        if (
            selectedJadwal.jam_mulai !== undefined &&
            selectedJadwal.jam_akhir !== undefined
        ) {
            setSelectedJam({
                jam_awal: selectedJadwal.jam_mulai,
                jam_akhir: selectedJadwal.jam_akhir,
            });
        }
    }, [selectedJadwal]);

     useEffect(() => {
        if (selectedJadwal.id_ruangan !== undefined) {
            setSelectedRuangan(selectedJadwal.id_ruangan);
        }
    }, [selectedJadwal])

    const jadwalTerfilter = useMemo(() => {
        if (!selectedJadwal || !selectedHari || !jadwalData) return [];

        return jadwalData
            .filter(
            (j) =>
                j.prodi === selectedJadwal.prodi &&
                j.semester === selectedJadwal.semester &&
                j.id_kelas === selectedJadwal.id_kelas &&
                j.id_waktu === selectedJadwal.id_waktu &&
                j.id_hari === selectedHari
            )
            .sort((a, b) => a.jam_mulai - b.jam_mulai);
    }, [selectedJadwal, selectedHari, jadwalData]);

    const formatWaktu = (menit: number): string => {
		const interval = 40;
		const menitTepat = Math.floor(menit / interval) * interval;
		const jam = Math.floor(menitTepat / 60);
		const menitSisa = menitTepat % 60;
		return `${jam.toString().padStart(2, "0")}:${menitSisa.toString().padStart(2, "0")}`;
	};

    const getNamaHari = (hari: number): string => {
		return ["Hari tidak valid", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][hari] || "-";
	};

    const getWaktuPerkuliahan = (menit: number, batasJamMalam = 15): 'pagi' | 'malam' => {
		const jam = Math.floor(menit / 60);
		return jam < batasJamMalam ? 'pagi' : 'malam';
	};

    const uniqueRuangan = useMemo(() => {
        if (!jadwalData || jadwalData.length === 0) return [];
        return Array.from(new Set(
            jadwalData
            .map(item => item.id_ruangan)
            .filter(id => id !== null && id !== 0) // Exclude null/0 values
            .sort((a, b) => a - b) // Sort numerically
        ));
    }, [jadwalData]);

    const sksDuration = selectedJadwal.sks * 40;

    const waktuAwal = selectedJadwal.id_waktu === 1 ? 480 : 1080; // 08.00 or 18.00
    const waktuAkhir = selectedJadwal.id_waktu === 1 ? 720 : 1320; // 12.00 or 22.00

    const options = useMemo(() => {
        const list = [];
        for (let start = waktuAwal; start + sksDuration <= waktuAkhir; start += 40) {
        const end = start + sksDuration;
        list.push({ jam_awal: start, jam_akhir: end });
        }
        return list;
    }, [selectedJadwal]);

    function formatMenit(menit: number) {
        const jam = Math.floor(menit / 60)
        .toString()
        .padStart(2, "0");
        const mnt = (menit % 60).toString().padStart(2, "0");
        return `${jam}.${mnt}`;
    }

    async function UpdateDay(
        jadwal: Jadwal,
        hariBaru: number,
        jamMulaiBaru: number,
        jamAkhirBaru: number,
        ruanganBaru: number
    ) {
        const updatedJadwal: Jadwal = {
            ...jadwal,
            id_hari: hariBaru,
            jam_mulai: jamMulaiBaru,
            jam_akhir: jamAkhirBaru,
            id_ruangan: ruanganBaru,
        };

        const result = await updateData({
            table: 'jadwal',
            payload: {
            id_hari: updatedJadwal.id_hari,
            jam_mulai: updatedJadwal.jam_mulai,
            jam_akhir: updatedJadwal.jam_akhir,
            id_ruangan: updatedJadwal.id_ruangan,
            },
            filters: [{ column: 'id', value: updatedJadwal.id }],
        });

        if (result.success) {
            console.log("Berhasil update jadwal:", updatedJadwal);
            return updatedJadwal;
        } else {
            console.error("Gagal update jadwal:", result.error);
            return null;
        }
    } 

    const handleSubmit = () => {
        console.log("Selected Hari:", selectedHari);
            console.log("Selected Ruangan:", selectedRuangan);
        if (selectedHari && selectedJadwal && jadwalData && selectedRuangan && selectedJam) {
            
            UpdateDay(selectedJadwal, selectedHari, selectedJam.jam_awal, selectedJam.jam_akhir, selectedRuangan);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed w-full inset-0 bg-black/50 px-20 flex justify-center items-center">
            <div className="bg-white w-full max-w-7xl p-6 flex flex-col justify-center items-center gap-5 rounded-lg shadow-md">
                <div>
                    <h2 className="text-xl">Ganti Hari</h2>
                    <div className="flex gap-3">
                        {Object.entries(hariMap).map(([key, label]) => {
                            const hariKey = parseInt(key);
                            const isSelected = selectedHari !== undefined
                            ? selectedHari === hariKey
                            : selectedJadwal.id_hari === hariKey;
                            return (
                            <div
                                key={key} onClick={() => setSelectedHari(hariKey)} className={`cursor-pointer px-4 py-2 rounded border ${
                                isSelected
                                    ? "bg-blue-500 text-white border-blue-600"
                                    : "bg-gray-100 hover:bg-gray-200"
                                }`}>
                                {label}
                            </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mb-4">
                <label className="text-xl">Ganti Jam</label>
                <select
                    className="w-full border border-gray-300 rounded p-2"
                    value={selectedJam.jam_awal}
                    onChange={(e) => {
                    const jam_awal = Number(e.target.value);
                    const jam_akhir = jam_awal + sksDuration;
                    setSelectedJam({ jam_awal, jam_akhir });
                    }}
                >
                    <option value="">-- Pilih Jam --</option>
                    {options.map((opt) => (
                    <option key={opt.jam_awal} value={opt.jam_awal}>
                        {formatMenit(opt.jam_awal)} - {formatMenit(opt.jam_akhir)}
                    </option>
                    ))}
                </select>
                </div>
                
                <div>
                    <div className="mb-4">
                        <label className="text-xl">Ganti Ruangan</label>
                        <select value={selectedRuangan !== null && selectedRuangan !== undefined ? selectedRuangan : (selectedJadwal.id_ruangan)} onChange={(e) => setSelectedRuangan(Number(e.target.value))} className="w-full border border-gray-300 rounded p-2">
                            <option value="">-- Pilih Ruangan --</option>
                            {uniqueRuangan.map((id) => (
                            <option key={id} value={id}>
                                Ruangan {id}
                            </option>
                            ))}
                        </select>
                    </div>

                    {/* {selectedRuangan && (
                        <div className="w-full mt-4">
                            <h3 className="font-semibold text-sm mb-2">Jadwal di Ruangan {selectedRuangan}</h3>
                            <ul className="text-sm space-y-1 max-h-40 overflow-y-auto border p-2 rounded">
                                {jadwalData
                                .filter((j) => j.id_ruangan === selectedRuangan)
                                .sort((a, b) => {
                                    if (a.id_hari === b.id_hari) {
                                    return a.jam_mulai - b.jam_mulai;
                                    }
                                    return a.id_hari - b.id_hari;
                                })
                                .map((j) => (
                                    <li key={j.id} className={`border-b pb-1 ${onView(j.id) ? 'bg-red-300' : 'bg-[#E9E9E9]'}`}>
                                        <span className="font-medium">{j.nama}</span> - {j.nama_dosen}
                                        <br />
                                        <span className="text-gray-600">
                                            {formatWaktu(j.jam_mulai)} - {formatWaktu(j.jam_akhir)} | Hari {hariMap[j.id_hari]}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )} */}
                </div>
                
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" >
                        Batal
                    </button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" >
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
}
