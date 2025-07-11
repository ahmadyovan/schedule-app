'use client'

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useEffect, useMemo, useState } from "react";
import { useSupabaseTableData } from '@/components/hook/useTableData';
import { Tables } from '@/types/supabase';
import { evaluateSchedule, splitEvaluationMessages } from '@/utils/functions';
// import DosenModal from '@/components/kaprodi/jadwal/DosenModal';

type JadwalList = {
	id: number;
	id_matkul: number;
	id_dosen: number;
	id_kelas: number;
	id_hari: number | null;      
	id_waktu: number;
	semester: number;
	create_at: string;
	prodi: number;
	id_jadwal: number;
	jam_mulai: number | null;    
	jam_akhir: number | null;    
	nama_dosen: string;
	nama: string;
	sks: number;
	kode: number;
};

const Home = () => {
	const [activeProdi, setActiveProdi] = useState<number>(1);
	const [activeSemester, setActiveSemester] = useState<number>(1);
	const [waktu, setWaktu] = useState<number>(1);
	const [kelas, setKelas] = useState<number>(1);
	const [kelasList, setKelasList] = useState<number[]>([1]);
	const [searchQuery, setSearchQuery] = useState("");
	const [Open, setOpen] = useState<boolean>(false)
	const [selectedDosen, setselectedDosen] = useState<number>(1);
	const [dosenname, setdosenname] = useState<string>('');
	const [selectedDay, setselectedDay] = useState<number>(1);

	const prodiMap: Record<number, string> = {
		1: "Mesin",
		2: "Komputer",
		3: "Industri",
		4: "Informatika",
		5: "DKV"
	};

	// const filtersMatkul = useMemo(
	// 	() => [
	// 		{ column: 'prodi', value: activeProdi },
	// 		{ column: 'semester', value: activeSemester },
	// 		{ column: 'id_waktu', value: waktu },
	// 		{ column: 'id_kelas', value: kelas },
	// 	],
	// [activeProdi, activeSemester, waktu, kelas]);

	const { data: raw_jadwal } = useSupabaseTableData<Tables<'jadwal'>>('jadwal');

	const { data: raw_matkul } = useSupabaseTableData<Tables<'mata_kuliah'>>('mata_kuliah');

	const { data: raw_dosen } = useSupabaseTableData<Tables<'dosen'>>('dosen');

	const { data: raw_prefWaktu } = useSupabaseTableData<Tables<'prefWaktu'>>('prefWaktu');

	const jadwal = useMemo(() => {
		if (!raw_jadwal || !raw_matkul || !raw_dosen) return [];

		return raw_jadwal.map((jadwal) => {
			const matkul = raw_matkul.find((m) => m.id === jadwal.id_matkul);
			const dosen = raw_dosen.find((d) => d.id === jadwal.id_dosen);

			if (!matkul || !dosen) return null;

			return {
				...jadwal,
				id_jadwal: jadwal.id,
				kode: matkul.kode,
				nama: matkul.nama,
				prodi: matkul.prodi,
				semester: matkul.semester,
				sks: matkul.sks,
				nama_dosen: dosen.nama,
			};
		}).filter((item): item is JadwalList => item !== null);
    }, [raw_jadwal, raw_matkul, raw_dosen]);

    

    

	const filteredJadwal = useMemo(() => {
		if (!jadwal) return [];

		return jadwal.filter((item) =>
			item.prodi === activeProdi &&
			item.semester === activeSemester &&
			item.id_waktu === waktu &&
			item.id_kelas === kelas &&
			item.nama_dosen.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [jadwal, activeProdi, activeSemester, waktu, kelas, searchQuery]);

	const filteredJadwalDosen = useMemo(() => {
		if (!jadwal) return [];
		return jadwal.filter((item) =>
			item.id_dosen === selectedDosen &&
			item.id_hari === selectedDay &&
			item.id_waktu === waktu
		);
	}, [jadwal, selectedDosen, selectedDay, waktu]);	

	const conflictIds = useMemo(() => {
		if (!jadwal || !raw_prefWaktu) return [];

		const result = evaluateSchedule(jadwal, raw_prefWaktu);
		const { conflicts, preferences } = splitEvaluationMessages(result.messages);
		const allIds = Array.from(new Set([
			...conflicts.map(c => c.id),
			...preferences.map(p => p.id),
		]));
		return allIds;
	}, [jadwal, raw_prefWaktu]);	
	
	const getprodi = (id: number) => prodiMap[id] || "";

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

	const exportToExcel = (data: JadwalList[], fileName = 'jadwal.xlsx') => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const worksheetData: any[][] = [];
		worksheetData.push(['JADWAL PERKULIAHAN']);
		worksheetData.push([]);
		const grouped = data.reduce((acc, curr) => {
			const sem = curr.semester ?? 'Unknown';
			if (!acc[sem]) acc[sem] = [];
			acc[sem].push(curr);
			return acc;
		}, {} as Record<string | number, JadwalList[]>);

		for (const [semester, items] of Object.entries(grouped)) {
			worksheetData.push([`Semester ${semester}`]);
			worksheetData.push(['kode','Mata Kuliah', 'sks', 'Dosen', 'hari', 'waktu']);
			for (const item of items) {
				const jamMulai = item.jam_mulai ? formatWaktu(item.jam_mulai) : '';
				const jamAkhir = item.jam_akhir ? formatWaktu(item.jam_akhir) : '';
				const waktu = jamMulai && jamAkhir ? `${jamMulai} - ${jamAkhir}` : '';
				worksheetData.push([
					item.kode,
					item.nama,
					item.sks,
					item.nama_dosen,
					item.id_hari !== null ? getNamaHari(item.id_hari) : '-',
					waktu,
				]);
			}
			worksheetData.push([]);
		}

		const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
		worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Jadwal');
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
		saveAs(blob, fileName);
	};

	const jadwaldosenmodal = (dosen: number, nama: string, hari: number | null) => {
		if(!hari) return
		setselectedDosen(dosen); 
		setdosenname(nama)
		setselectedDay(hari);
		setOpen(true)
	}

	useEffect(() => {
		if (!jadwal || jadwal.length === 0) {
			setKelasList([1]);
			setKelas(1);
			return;
		}

		let uniqueIdKelas = Array.from(new Set(
			jadwal.filter((jadwal) => jadwal.id_waktu === waktu)
			.filter((jadwal) => jadwal.semester === activeSemester)
			.map((jadwal) => jadwal.id_kelas)
			.filter((id) => id !== null)
		)) as number[];

		uniqueIdKelas.sort((a, b) => a - b);
		if (uniqueIdKelas.length === 0) uniqueIdKelas = [1];
		
		if (uniqueIdKelas.length === 1 && uniqueIdKelas[0] > 1) {
			const firstValue = uniqueIdKelas[0];
			uniqueIdKelas = [firstValue - 1, firstValue];
		}
		setKelasList((prevKelasList) => {
		if (JSON.stringify(prevKelasList) !== JSON.stringify(uniqueIdKelas)) {
			return uniqueIdKelas;
		}
		return prevKelasList;
		});
	}, [activeSemester, jadwal, waktu]);

	return (
		<div className="h-full w-full flex flex-col bg-white text-black xl:text-xl">
			<div className="h-full w-full flex flex-col justify-center gap-3 pt-5">

				<div className="w-full flex flex-col items-center gap-3">
					<div className='text-2xl'>JADWAL PRODI</div>
					<div className='flex flex-wrap gap-3'>
						{Array.from({ length: 5 }, (_, index) => {
							const prodi = index + 1;
							return (
								<button key={prodi} onClick={() => setActiveProdi(prodi)}
								className={`px-2 py-2 rounded-md transition-colors ${activeProdi === prodi ? 'bg-[#cefdc2]' : 'bg-[#E9E9E9] hover:bg-gray-300'}`}>
								{getprodi(prodi)}
								</button>
							);
						})}
					</div>
					<div className="flex flex-wrap gap-3">
						{Array.from({ length: 8 }, (_, index) => {
						const semester = index + 1;
						return (
							<button key={semester} onClick={() => setActiveSemester(semester)}
							className={`px-2 py-2 rounded-md transition-colors ${activeSemester === semester ? 'bg-[#cefdc2]' : 'bg-[#E9E9E9] hover:bg-gray-300'}`}>
							Semester {semester}
							</button>
						);
						})}
					</div>
					<div className="flex gap-10">
						<div className='flex gap-3 items-center'>
						<h1>waktu</h1>
						<button className={`px-2 py-2 rounded-md ${waktu === 1 ? "bg-gray-500 text-white" : "bg-[#E9E9E9] hover:bg-gray-300"}`} onClick={() => setWaktu(1)}>Pagi</button>
						<button className={`px-2 py-2 rounded-md ${waktu === 2 ? "bg-gray-500 text-white" : "bg-[#E9E9E9] hover:bg-gray-300"}`} onClick={() => setWaktu(2)}>Malam</button>
						</div>
						<div>
						{jadwal && jadwal.length > 0 && (
							<div className='flex items-center gap-3'>
							<h1>Kelas</h1>
							{kelasList.map((item) => (
								<button key={item} onClick={() => setKelas(item)}
								className={`px-4 py-2 rounded-md ${kelas === item ? "bg-gray-500 text-white" : "bg-[#E9E9E9] hover:bg-gray-300"}`}>
								{String.fromCharCode(64 + item)}
								</button>
							))}
							</div>
						)}
						</div>
						<div className="w-full">
							<input autoFocus type="text" placeholder="Cari nama dosen..." className="w-full px-4 py-2 border rounded" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
						</div>
					</div>
				</div>

				<div className="w-full flex flex-col gap-2 px-20">
					<div className="bg-[#cefdc2] py-2 w-full grid grid-cols-[5rem,7rem,1fr,5rem,1fr,5rem,10rem] rounded-md gap-3">
						<div className="text-center">no</div>
						<div className="">kode</div>
						<div className="">mata kuliah</div>
						<div className="text-center">sks</div>
						<div className="">dosen</div>
						<div className="">hari</div>
						<div className="">waktu</div>
					</div>

					<div className={`h-full min-h-40 w-full flex flex-col gap-3 overflow-hidden max-h-[272px]`}>
						<div className='overflow-y-scroll scroll-snap-y scroll-snap-mandatory scrollbar-visible'>
							{!filteredJadwal ? (
							<p className="text-center">Loading...</p>
							) : (
							<div className="grid grid-cols-1 gap-2">
								{filteredJadwal && filteredJadwal.length > 0 ? (
								filteredJadwal.map((item, index) => (
									<div key={index} onClick={() => jadwaldosenmodal(item.id_dosen, item.nama_dosen, item.id_hari)}
									className={`bg-[#E9E9E9] h-12 w-full grid grid-cols-[5rem,7rem,1fr,5rem,1fr,5rem,10rem] items-center rounded-md gap-3 shadow ${conflictIds.includes(item.id) ? 'bg-red-300' : 'bg-[#E9E9E9]'}`} >
										<div className="text-center">{index + 1}</div>
										<div className="">{item.kode}</div>
										<div className="overflow-hidden text-nowrap">{item.nama}</div>
										<div className="text-center">{item.sks}</div>
										<div className="overflow-hidden text-nowrap">{item.nama_dosen}</div>
										<div>{item.id_hari !== null ? getNamaHari(item.id_hari) : '-'}</div>
										<div>
											{item.jam_mulai !== null && item.jam_akhir !== null
											? `${formatWaktu(item.jam_mulai)} - ${formatWaktu(item.jam_akhir)}`
											: '-'}
										</div>
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
			</div>
			<div className='h-full flex justify-between items-center px-32'>
				<div>
					<h1>jumlah konflik jadwal: {conflictIds.length}</h1>
				</div>
				<button onClick={() => exportToExcel(jadwal, 'jadwal-dosen.xlsx')} className="px-4 h-fit py-2 bg-green-500 text-white rounded">
					Export Excel
				</button>
			</div>

			
			{ Open && (
				<div className="fixed w-full inset-0 bg-black bg-opacity-50 px-20 flex justify-center items-center">
					<div className="w-full min-w-3xl bg-gray-200 p-10 rounded shadow-md">
						<div className='w-full flex flex-col justify-center items-center'>
							<h1>{dosenname}</h1>
							<h2>Jadwal hari senin</h2>
						</div>

						<div className='flex flex-col gap-2'>
							<div className="bg-[#cefdc2] py-2 w-full grid grid-cols-[5rem,7rem,7rem,7rem,1fr,5rem,1fr,5rem,10rem] rounded-md gap-3">
								<div className="text-center">no</div>
								<div className="text-center">prodi</div>
								<div className="text-center">semester</div>
								<div className="">kode</div>
								<div className="">mata kuliah</div>
								<div className="text-center">sks</div>
								<div className="">dosen</div>
								<div className="">hari</div>
								<div className="">waktu</div>
							</div>

							<div className={`h-full min-h-40 w-full flex flex-col gap-3 overflow-hidden max-h-[272px]`}>
								<div className='overflow-y-scroll scroll-snap-y scroll-snap-mandatory scrollbar-visible'>
									<div className='grid grid-cols-1 gap-2'>
										{filteredJadwalDosen && (
										filteredJadwalDosen.map((item, index) => (
											<div key={index} className={`h-12 w-full grid grid-cols-[5rem,7rem,7rem,7rem,1fr,5rem,1fr,5rem,10rem] items-center rounded-md gap-3 shadow ${conflictIds.includes(item.id) ? 'bg-red-300' : 'bg-[#E9E9E9]'}`}>
												<div className="text-center">{index + 1}</div>
												<div className="text-center">{getprodi(item.prodi)}</div>
												<div className="text-center">{item.semester}</div>
												<div className="">{item.kode}</div>
												<div className="overflow-hidden text-nowrap">{item.nama}</div>
												<div className="text-center">{item.sks}</div>
												<div className="overflow-hidden text-nowrap">{item.nama_dosen}</div>
												<div>{item.id_hari !== null ? getNamaHari(item.id_hari) : '-'}</div>
												<div>
													{item.jam_mulai !== null && item.jam_akhir !== null
													? `${formatWaktu(item.jam_mulai)} - ${formatWaktu(item.jam_akhir)}`
													: '-'}
												</div>
												<div>
													{}
												</div>
											</div>
										)))}
									</div>
								</div>
							</div>
						</div>
						<div className='w-full flex justify-end'>
							<button className='px-4 h-fit py-2 bg-gray-500 text-white' onClick={() => setOpen(false)}>kembali</button>
						</div>
					</div>
				</div>)

			}
			

			{/* { Open && <DosenModal onClose={() => setOpen(false)} result={(dosenId) => selectedDosen(dosenId) } isOpen={false} /> } */}
		</div>
	);
};

export default Home;


