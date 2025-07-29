'use client'

import { useMemo, useState } from "react";
import { useSupabaseTableData } from '@/components/hook/useTableData';
import { Tables } from '@/types/supabase';
import { evaluateSchedule, exportToExcel, splitEvaluationMessages } from '@/utils/functions';
import TimeModal from '@/components/kaprodi/penjadwalan/TimeModal';
import Swapmodal from '@/components/jadwal/swapmodal';
import DayModal from '@/components/jadwal/dayModal';
// import DosenModal from '@/components/kaprodi/jadwal/DosenModal';

type JadwalList = {
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
	data: JadwalList[];
};

const Home = () => {
	const [filterProdi, setFilterProdi] = useState<number[]>([1, 2, 3, 4, 5]);
	const [filterSemester, setFilterSemester] = useState<number[]>([1, 3, 5, 7]);
	const [filterHari, setFilterHari] = useState<number | null>(null);
	const [filterRuangan, setFilterRuangan] = useState<number | null>(null);
	const [waktu, setWaktu] = useState<number>(1);
	const [filterKelas, setFilterKelas] = useState<number[]>([1,2]);
	const [kelasList, setKelasList] = useState<number[]>([1,2]);
	const [searchQuery, setSearchQuery] = useState("");
	const [Open, setOpen] = useState<boolean>(false)
	const [conflictJadwalModal, setconflictJadwalModal] = useState<boolean>(false)
	const [selectedDosen, setselectedDosen] = useState<number>(1);
	const [dosenname, setdosenname] = useState<string>('');
	const [selectedDay, setselectedDay] = useState<number>(1);
	const [selectedTime, setselectedTime] = useState<number>(1);
	const [timeModal, setTimeModal] = useState<boolean>(false);
	const [selectedJadwal, setSelectedJadwal] = useState<JadwalList>({ id: 0, id_matkul: 0, id_dosen: 0, id_kelas: 0, id_hari: 0, id_waktu: 0, semester: 0, create_at: "", prodi: 0, id_ruangan: 0, id_jadwal: 0, jam_mulai: 0, jam_akhir: 0, nama_dosen: "", nama: "", sks: 0, kode: 0,});
	
	const [selectedRuangan, setSelectedRuangan] = useState<number | null>(null);
	const [selectedNewDay, setSelectedNewDay] = useState<number | null>(null);
	const [showOnly, setShowOnly] = useState<"ganjil" | "genap">("ganjil");
	const [jadwalToSwap, setJadwalToSwap] = useState<JadwalList[]>([]);
	const [swapModal, setSwapModal] = useState<boolean>(false);
	const [dayModal, setDayModal] = useState(false);
	

	const prodiMap: Record<number, string> = {
		1: "Mesin",
		2: "Komputer",
		3: "Industri",
		4: "Informatika",
		5: "DKV"
	};

	const hariMap: Record<number, string> = {
		1: "Senin",
		2: "Selasa",
		3: "Rabu",
		4: "Kamis",
		5: "Jumat"
	};

	const columnStyle = 'grid grid-cols-[3rem_7rem_3rem_7rem_1fr_3rem_1fr_4rem_8rem_4rem_7rem]'
	const buttonStyle = 'px-2 py-2 rounded-md cursor-pointer transition-colors bg-gray-500 hover:bg-gray-300 text-white';

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

	const uniqueRuangan = useMemo(() => {
		if (!jadwal || jadwal.length === 0) return [];
		return Array.from(new Set(
			jadwal
			.map(item => item.id_ruangan)
			.filter(id => id !== null && id !== 0) // Exclude null/0 values
			.sort((a, b) => a - b) // Sort numerically
		));
	}, [jadwal]);

	const semesters = showOnly === "ganjil" ? [1, 3, 5, 7] : [2, 4, 6, 8];
	
	const filteredJadwal = useMemo(() => {
		if (!jadwal) return [];

		return jadwal
			.filter((item) =>
				filterProdi.includes(item.prodi) &&
				filterSemester.includes(item.semester) &&
				item.id_waktu === waktu &&
				filterKelas.includes(item.id_kelas) &&
				item.nama_dosen.toLowerCase().includes(searchQuery.toLowerCase()) &&
				(filterRuangan === null || item.id_ruangan === filterRuangan)
			)
			.sort((a, b) => a.prodi - b.prodi || a.semester - b.semester || a.id_hari - b.id_hari ); 
	}, [jadwal, filterProdi, filterSemester, waktu, filterKelas, searchQuery, filterRuangan]);

	const filteredJadwalDosen = useMemo(() => {
		if (!jadwal) return [];
		return jadwal.filter((item) =>
			item.id_dosen === selectedDosen &&
			item.id_hari === selectedDay &&
			item.id_waktu === waktu
		);
	}, [jadwal, selectedDosen, selectedDay, waktu]);	

	const getConflicts = useMemo(() => {
		const emptyConflicts: KonflikByType[] = [
			{ type: "dosen", data: [] },
			{ type: "ruangan", data: [] },
			{ type: "preferensi", data: [] }
		];

		if (
			!Array.isArray(jadwal) || jadwal.length === 0 ||
			!Array.isArray(raw_prefWaktu) || raw_prefWaktu.length === 0
		) {
			return (mode: "data" | "id", input?: number | string): any => {
				if (mode === "data") return emptyConflicts;
				if (mode === "id") return false;
				return null;
			};
		}

		const result = evaluateSchedule(jadwal, raw_prefWaktu);
		const { conflicts_dosen, conflicts_ruangan, preferences } = splitEvaluationMessages(result.messages);

		const konflikByType: KonflikByType[] = [
			{ type: "dosen", data: conflicts_dosen },
			{ type: "ruangan", data: conflicts_ruangan },
			{ type: "preferensi", data: preferences }
		];

		return (mode: "data" | "id", input?: number | string): any => {
			if (mode === "data") return konflikByType;

			if (mode === "id" && input !== undefined) {
				const id = String(input); // pastikan selalu string

				const hasDosenConflict = conflicts_dosen.some(c => String(c.id1) === id || String(c.id2) === id);
				const hasRuanganConflict = conflicts_ruangan.some(c => String(c.id1) === id || String(c.id2) === id);
				const hasPreferensiConflict = preferences.some(p => String(p.id) === id);

				return hasDosenConflict || hasRuanganConflict || hasPreferensiConflict;
			}

			return null;
		};
	}, [jadwal, raw_prefWaktu]);

	const conflictData = getConflicts("data");	
	
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

	function groupByKelas(data: JadwalList[]): Record<number, JadwalList[]> {
	return data.reduce((acc, item) => {
		const key = item.id_kelas ?? 1;
		if (!acc[key]) acc[key] = [];
		acc[key].push(item);
		return acc;
	}, {} as Record<number, JadwalList[]>);
	}

	function getKelasLabel(id_kelas: number): string {
		return String.fromCharCode(64 + id_kelas);
	}

	

	const jadwalmodal = (item: JadwalList) => {
		if(!item) return;
		setSelectedJadwal(item);
		// handleFilterToSwap();
		setJadwalToSwap(jadwal);
		setOpen(true)
	}

	return (
		<div className="h-full w-full bg-white text-black xl:text-xl overflow-hidden">
			<div className="h-full w-full flex flex-col gap-3 py-10 px-20">
				<div className="h-fit w-full flex flex-col gap-3">
					<div className='w-full flex gap-5 items-center justify-center'>
						<div className='flex gap-3 item-center'>
							{Object.entries(prodiMap).map(([key, label]) => {
								const prodi = Number(key);
								const isSelected = filterProdi.includes(prodi);

								const toggleProdi = () => {
									setFilterProdi((prev) =>
										isSelected ? prev.filter((p) => p !== prodi) : [...prev, prodi]
									);
								};

								return (
									<button key={prodi} onClick={toggleProdi} className={`px-2 py-2 rounded-md cursor-pointer transition-colors ${ isSelected ? "bg-[#cefdc2]" : "bg-[#E9E9E9] hover:bg-gray-300" }`}>
										{label}
									</button>
								);
							})}
						</div>
						<div>
							|
						</div>
						<div className='flex gap-3 items-center'>
							<div className="flex gap-3">
								<button
									onClick={() => {
										setShowOnly("ganjil");
										const ganjil = semesters.filter((s) => s % 2 === 1); // filter semester ganjil
										setFilterSemester(ganjil);
									}}
									className={`px-2 py-2 rounded-md cursor-pointer ${showOnly === "ganjil" ? "bg-gray-500 text-white" : "bg-[#E9E9E9] hover:bg-gray-300"}`}>
									Ganjil
								</button>
								<button
									onClick={() => {
										setShowOnly("genap");
										const genap = semesters.filter((s) => s % 2 === 0); // filter semester genap
										setFilterSemester(genap);
									}}
									className={`px-2 py-2 rounded-md cursor-pointer ${showOnly === "genap" ? "bg-gray-500 text-white" : "bg-[#E9E9E9] hover:bg-gray-300"}`}>
									Genap
								</button>
							</div>
							<div className="flex flex-wrap gap-3">
								{semesters.map((semester) => {
									const isSelected = filterSemester.includes(semester);

									const toggle = () => {
										setFilterSemester((prev) =>
											isSelected
												? prev.filter((p) => p !== semester)
												: [...prev, semester]
										);
									};

									return (
										<button
											key={semester}
											onClick={toggle}
											className={`px-2 py-2 rounded-md cursor-pointer transition-colors ${
												isSelected ? 'bg-[#cefdc2]' : 'bg-[#E9E9E9] hover:bg-gray-300'
											}`}>
											Semester {semester}
										</button>
									);
								})}
							</div>
						</div>
					</div>
					<div className="w-full flex justify-center items-center gap-5">
						<div className='flex gap-3 items-center'>
							<h1>waktu</h1>
							<button className={`px-2 py-2 rounded-md cursor-pointer ${waktu === 1 ? "bg-gray-500 text-white" : "bg-[#E9E9E9] hover:bg-gray-300"}`} onClick={() => setWaktu(1)}>
								Pagi
							</button>
							<button className={`px-2 py-2 rounded-md cursor-pointer ${waktu === 2 ? "bg-gray-500 text-white" : "bg-[#E9E9E9] hover:bg-gray-300"}`} onClick={() => setWaktu(2)}>
								Malam
							</button>
						</div>
						<div>
							|
						</div>
						<div>
						{jadwal && jadwal.length > 0 && (
							<div className='flex items-center gap-3'>
								<h1>Kelas</h1>
								{kelasList.map((item) => {
									const isSelected = filterKelas.includes(item);
									const toggleKelas = () => {
										setFilterKelas((prev) =>
											isSelected ? prev.filter((k) => k !== item) : [...prev, item]
										);
									};

									return (
										<button key={item} onClick={toggleKelas} className={`px-4 py-2 rounded-md cursor-pointer ${isSelected ? "bg-[#cefdc2]" : "bg-[#E9E9E9] hover:bg-gray-300"}`}>
											{String.fromCharCode(64 + item)}
										</button>
									);
								})}
							</div>
						)}
						</div>
						<div>
							|
						</div>
						<div className='flex gap-3 items-center'>
							<h1>Ruangan</h1>
							<select value={filterRuangan || ''} onChange={(e) => setFilterRuangan(e.target.value ? Number(e.target.value) : null)} className="px-2 py-2 rounded-md border cursor-pointer" >
							<option className='cursor-pointer' value="">Semua Ruangan</option>
							{uniqueRuangan.map((ruangan) => (
								<option className='cursor-pointer' key={ruangan} value={ruangan}> Ruangan {ruangan}
								</option>
							))}
							</select>
						</div>
						<div>
							|
						</div>
						<div className="flex gap-3 items-center">
							<h1>Hari</h1>
							<select value={filterHari ?? ''} onChange={(e) => setFilterHari(e.target.value ? Number(e.target.value) : null) } className="px-2 py-2 rounded-md border cursor-pointer" >
								<option value="">Semua Hari</option>
								{Object.entries(hariMap).map(([key, value]) => (
								<option key={key} value={key}>
									{value}
								</option>
								))}
							</select>
						</div>
						<div>
							|
						</div>
						<div className="w-1/5">
							<input autoFocus type="text" placeholder="Cari nama dosen..." className="w-full px-4 py-2 border rounded" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
						</div>
					</div>
				</div>
				<div className="h-full w-full flex flex-col gap-2">
					<div className={`bg-[#cefdc2] py-2 w-full ${columnStyle} pr-5 rounded-md gap-3`}>
						<div className="text-center">no</div>
						<div className="text-center">prodi</div>
						<div className="text-center">smt</div>
						<div className="">kode</div>
						<div className="">mata kuliah</div>
						<div className="text-center">sks</div>
						<div className="">dosen</div>
						<div className="">hari</div>
						<div className="">waktu</div>
						<div className="">kelas</div>
						<div className="">ruangan</div>
					</div>

					<div className="h-[32rem] w-full flex flex-col overflow-hidden">
						<div className="h-full overflow-y-auto scroll-snap-y scroll-snap-mandatory">
							{!filteredJadwal ? (
							<p className="text-center">Loading...</p>
							) : (
							<div className="grid grid-cols-1 gap-3 overflow-hidden">
								{filteredJadwal.map((item, index) => (
									<div key={index} onClick={() => jadwalmodal(item)}
									className={`bg-[#E9E9E9] h-13 w-full ${columnStyle} items-center rounded-md gap-3 shadow cursor-pointer ${getConflicts('id', item.id) ? 'bg-red-300' : 'bg-[#E9E9E9]'}`} >
										<div className="text-center">{typeof index === 'number' ? index + 1 : ''}</div>
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
										<div>{String.fromCharCode(64 + item.id_kelas)}</div>
										<div>{item.id_ruangan != 0? item.id_ruangan: "belum di tentukan"}</div>
									</div>
								))}
							</div>
							)}
						</div>
					</div>
				</div>

				<div className='h-fit flex flex-col gap-5 w-full items-center px-32'>
					<div className='flex gap-10 items-center border-solid border-2 py-2 px-2 rounded-md'>
						{conflictData.find((c: { type: string; }) => c.type === "ruangan") && (
							<div className='flex gap-3 items-center'>
							<h1>konflik antar ruangan: {
								conflictData.find((c: { type: string; }) => c.type === "ruangan")?.data.length
							}</h1>
							<button
								onClick={() => setconflictJadwalModal(true)}
								className='px-4 h-fit py-2 rounded bg-gray-500 text-white'
							>
								daftar konflik
							</button>
							</div>
						)}

						{conflictData.find((c: { type: string; }) => c.type === "dosen") && (
							<div className='flex gap-3 items-center'>
							<h1>konflik jadwal dosen: {
								conflictData.find((c: { type: string; }) => c.type === "dosen")?.data.length
							}</h1>
							<button
								onClick={() => setconflictJadwalModal(true)}
								className='px-4 h-fit py-2 rounded bg-gray-500 text-white'
							>
								daftar konflik
							</button>
							</div>
						)}

						{conflictData.find((c: { type: string; }) => c.type === "preferensi") && (
							<div className='flex gap-3 items-center'>
							<h1>konflik preferensi dosen: {
								conflictData.find((c: { type: string; }) => c.type === "preferensi")?.data.length
							}</h1>
							<button
								onClick={() => setconflictJadwalModal(true)}
								className='px-4 h-fit py-2 rounded bg-gray-500 text-white'
							>
								daftar konflik
							</button>
							</div>
						)}
					</div>
					<button onClick={() => exportToExcel(jadwal, 'jadwal-dosen.xlsx')} className="px-4 h-fit py-2 bg-green-500 text-white rounded">
						Export Excel
					</button>
				</div>
				
			</div>

			{ Open && (
				<div className="fixed w-full inset-0 bg-black/50 px-20 flex justify-center items-center">
					<div className="w-full max-w-fit bg-gray-200 p-10 rounded-xl shadow-md flex flex-col gap-5">
						{ selectedJadwal && (<div className='flex gap-10 items-center py-2 px-2 justify-center'>
							{(conflictData.find((c: { type: string; }) => c.type === "ruangan")?.data as any[])?.find(
								(conflict: any) => (conflict.id1 === selectedJadwal.id || conflict.id2 === selectedJadwal.id)
							) && (
								<div className="flex gap-3 items-center">
									<h1 className="lowercase">
										Jadwal mengalami bentrok dengan jadwal lain pada ruangan {selectedRuangan} di hari {getNamaHari(selectedJadwal.id_hari)} {getWaktuPerkuliahan(selectedJadwal.jam_mulai)}
									</h1>

									{/* <div className="flex flex-col">
										{jadwal.filter((j) => j.id_ruangan === selectedJadwal.id_ruangan).length === 0 ? (
										<p className="text-sm text-gray-500">
											Tidak ada jadwal pada ruangan ini.
										</p>
										) : (
										<ul className="text-sm space-y-1 max-h-40 overflow-y-auto border p-2 rounded">
											{jadwal
											.filter((j) => j.id_ruangan === selectedJadwal.id_ruangan)
											.sort((a, b) => {
												if (a.id_hari === b.id_hari) {
												return a.jam_mulai - b.jam_mulai;
												}
												return a.id_hari - b.id_hari;
											})
											.map((j) => (
												<li key={j.id} className="border-b pb-1">
												<span className="font-medium">
													Hari {hariMap[j.id_hari]} | {formatWaktu(j.jam_mulai)} - {formatWaktu(j.jam_akhir)}
												</span>
												<br />
												<span className="text-gray-600">{j.nama} - {j.nama_dosen}</span> 
												</li>
											))}
										</ul>
										)}
									</div> */}
								</div>
							)}
							{(Array.isArray(conflictData.find((c: { type: string }) => c.type === "dosen")?.data) &&
							(conflictData.find((c: { type: string }) => c.type === "dosen")?.data as any[]).find(
									(conflict: any) => conflict.id1 === selectedJadwal.id || conflict.id2 === selectedJadwal.id
								)
							) && (
								<div className='flex gap-3 items-center'>
									<h1 className='lowercase'>
									konflik jadwal dosen, jadwal benrok dengan jadwal lain dengan dosen yang sama pada hari {getNamaHari(selectedJadwal.id_hari)} waktu {getWaktuPerkuliahan(selectedJadwal.jam_mulai)}
									</h1>
								</div>
							)}
							{conflictData.find((c: { type: string }) => c.type === "preferensi")?.data.find((conflict: { id: number }) => conflict.id === selectedJadwal.id) && (
								<div className='flex gap-3 items-center'>
									<h1 className='lowercase'>
									konflik preferensi dosen, dosen {selectedJadwal?.nama_dosen} tidak bisa mengajar pada hari {getNamaHari(selectedJadwal.id_hari)} waktu {getWaktuPerkuliahan(selectedJadwal.jam_mulai)} 
									</h1>
								</div>
							)}
						</div>)}
						<div className='flex gap-5 justify-center'>
							 <div>
								<button onClick={() => setSwapModal(true)} className='px-4 py-2 bg-gray-500 rounded-md text-white cursor-pointer'>Tukar jadwal</button>
							</div>
							<button onClick={() => setDayModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md">
								ubah
							</button>
							<button className='px-4 py-2 bg-gray-500 rounded-md text-white' onClick={() => setOpen(false)}>kembali</button>
						</div>
					</div>
				</div>)
			}


			<Swapmodal isOpen={swapModal}  data={jadwalToSwap} selectedJadwal={selectedJadwal} onView={(id) => getConflicts("id", id)}  onClose={() => setSwapModal(false)} />
			<DayModal isOpen={dayModal} onClose={() => setDayModal(false)} selectedJadwal={selectedJadwal} jadwalData={filteredJadwal} conflictData={conflictData} setSwap={e => setSwapModal(e)} onView={(id) => getConflicts("id", id)} />

			{selectedDosen && dosenname && <TimeModal isOpen={timeModal} id={selectedDosen} name={dosenname} onClose={() => {setselectedDosen(1); setdosenname(''); setTimeModal(false);}} />}
		</div>
	);
};

export default Home;


