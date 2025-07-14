'use client';

import { useUser } from '@/app/context/UserContext';
import { useSupabaseTableData } from '@/components/hook/useTableData';
import DosenModal from '@/components/kaprodi/penjadwalan/DosenModal';
import TimeModal from '@/components/kaprodi/penjadwalan/TimeModal';
import { Tables } from '@/types/supabase';
import { insertData, updateData } from '@/utils/functions';
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect, useMemo, } from 'react';

const supabase = createClient();


type MataKuliah = Tables<'mata_kuliah'>;
type Jadwal = Tables<'jadwal'>;
type Dosen = Tables<'dosen'>;
type PrefMatkul = Tables<'prefMatkul'>;

type GabunganMatkul = MataKuliah & {
	pref_dosen: number;
	jadwal_id: number | null;
	id_dosen: number | null;
	nama_dosen: string | null;
	waktu: number | null;
	kelas: number | null;
};

const Home = () => {

	const [activeSemester, setActiveSemester] = useState<number>(1);

	const [selectedMatkul, setSelectedMatkul] = useState<{id: number|null, nama: string|null} | null>(null);
	const [action, setAction] = useState<{state: string, id: number|null} | null>(null);
	const [selected_dosen, setSelected_Dosen] = useState<{id: number, nama: string} | null>(null);

	const [waktu, setWaktu] = useState<number>(1);
	const [kelas, setKelas] = useState<number>(1);
	const [kelasList, setKelasList] = useState<number[]>([1]); 

	const [Open, setOpen] = useState<number>(0)

	const user = useUser();
	const prodi = user.prodi

	const filters_raw_matkul = useMemo(
		() => [
			{ column: 'prodi', value: prodi },
			{ column: 'semester', value: activeSemester }
		],
		[prodi, activeSemester]
	);

	const filters_raw_jadwal = useMemo(
		() => [
			{ column: 'id_waktu', value: waktu },
		],
		[waktu]
	);

	const { data: raw_matkul, loading: loadingMatkul } = useSupabaseTableData<MataKuliah>('mata_kuliah', {filters: filters_raw_matkul});

	const { data: raw_prefmatkul, loading: loadingprefmatkul } = useSupabaseTableData<PrefMatkul>('prefMatkul');

	const { data: raw_jadwal, loading: loadingJadwal, refetch } = useSupabaseTableData<Jadwal>('jadwal', {filters: filters_raw_jadwal});

	const { data: raw_dosen, loading: loadingDosen } = useSupabaseTableData<Dosen>('dosen');

	const [delayedLoading, setDelayedLoading] = useState(true);

	const data: GabunganMatkul[] = useMemo(() => {
		if (!raw_matkul || !raw_jadwal || !raw_dosen || !raw_prefmatkul) return [];

		const result: GabunganMatkul[] = [];

		for (const mk of raw_matkul) {
			const sum = raw_prefmatkul.filter(
				(pref) => pref.id_matkul === mk.id && pref.id_dosen !== null
			).length;

			// Ambil semua jadwal untuk mata kuliah ini (tanpa filter waktu/kelas)
			const jadwalList = raw_jadwal.filter((j) => j.id_matkul === mk.id);

			if (jadwalList.length > 0) {
				for (const jadwal of jadwalList) {
					const dosen = raw_dosen.find((d) => d.id === jadwal.id_dosen);

					result.push({
						...mk,
						pref_dosen: sum,
						jadwal_id: jadwal.id,
						id_dosen: jadwal.id_dosen ?? null,
						nama_dosen: dosen?.nama ?? null,
						waktu: jadwal.id_waktu ?? null,
						kelas: jadwal.id_kelas ?? null,
					});
				}
			} else {
				// Jika tidak ada jadwal untuk matkul ini
				result.push({
					...mk,
					pref_dosen: sum,
					jadwal_id: null,
					id_dosen: null,
					nama_dosen: null,
					waktu: null,
					kelas: null,
				});
			}
		}

		return result;
	}, [raw_matkul, raw_prefmatkul, raw_jadwal, raw_dosen]);

	useEffect(() => {
		if (!data || data.length === 0) {
			setKelasList([1]);
			setKelas(1);
			return;
		}

		// Ambil semua id_kelas unik berdasarkan id_waktu dan activeSemester
		let uniqueIdKelas = Array.from(
			new Set(
				data
					.filter((jadwal) => jadwal.waktu === waktu)
					.filter((jadwal) => jadwal.semester === activeSemester)
					.map((jadwal) => jadwal.kelas)
					.filter((id) => id !== null)
			)
		) as number[];

		// Jika array kosong, tambahkan nilai default 1
		if (uniqueIdKelas.length === 0) {
			uniqueIdKelas = [1];
		}
	
		// Jika hanya ada satu elemen dan bukan 1, tambahkan angka sebelumnya
		if (uniqueIdKelas.length === 1 && uniqueIdKelas[0] > 1) {
			const firstValue = uniqueIdKelas[0];
			uniqueIdKelas = [firstValue - 1, firstValue];
		}

		uniqueIdKelas.sort((a, b) => a - b);
	
		setKelasList((prevKelasList) => {
			// Periksa apakah list berubah sebelum mengupdate state
			if (JSON.stringify(prevKelasList) !== JSON.stringify(uniqueIdKelas)) {
				return uniqueIdKelas;
			}
			return prevKelasList;
		});		
	}, [activeSemester, data, waktu]);

	const filtered_data = useMemo(() => {
		if (!raw_matkul || !raw_prefmatkul || !raw_jadwal || !raw_dosen) return [];

		return raw_matkul.map((mk) => {
			// Hitung jumlah preferensi dosen untuk matkul ini
			const prefCount = raw_prefmatkul.filter(
				(pref) => pref.id_matkul === mk.id && pref.id_dosen !== null
			).length;

			// Cari jadwal untuk matkul ini sesuai waktu dan kelas
			const jadwal = raw_jadwal.find(
				(j) =>
					j.id_matkul === mk.id &&
					j.id_waktu === waktu &&
					j.id_kelas === kelas
			);

			// Ambil nama dosen jika ada
			const dosen = raw_dosen.find((d) => d.id === jadwal?.id_dosen);

			return {
				...mk,
				pref_dosen: prefCount,
				jadwal_id: jadwal?.id ?? null,
				id_dosen: jadwal?.id_dosen ?? null,
				nama_dosen: dosen?.nama ?? null,
				waktu: jadwal?.id_waktu ?? null,
				kelas: jadwal?.id_kelas ?? null,
			};
		});
	}, [raw_matkul, raw_prefmatkul, raw_jadwal, raw_dosen, waktu, kelas]);

	  
	const rawLoading = loadingJadwal || loadingMatkul || loadingprefmatkul || loadingDosen;

	useEffect(() => {
		let timer: NodeJS.Timeout;

		if (rawLoading) {
			setDelayedLoading(true);
		} else {
			// Tambahkan delay 1 detik sebelum loading menjadi false
			timer = setTimeout(() => {
				setDelayedLoading(false);
			}, 200);
		}

		return () => clearTimeout(timer);
	}, [rawLoading]);

	const insertJadwalDosen = async (dosen: number): Promise<boolean> => {
		if (!selectedMatkul) return false;

		const payload = {
			id_matkul: selectedMatkul.id,
			id_dosen: dosen,
			id_waktu: waktu,
			id_kelas: kelas,
			semester: activeSemester,
			prodi: prodi,
		};

		try {
			const response = await insertData({
				table: 'jadwal',
				payload,
			});

			if (response.success) {
				console.log("Berhasil insert jadwal");
				return true;
			} else {
				console.error("Gagal insert jadwal");
				return false;
			}
		} catch (error) {
			console.error("Error saat insert jadwal:", error);
			return false;
		}
	};


	const updateJadwalDosen = async (dosen: number, jadwalId: number): Promise<boolean> => {
		try {
			const response = await updateData({
				table: 'jadwal',
				payload: { id_dosen: dosen },
				filters: [{ column: 'id', value: jadwalId }],
			});

			if (response.success) {
				console.log("Berhasil update jadwal");
				return true;
			} else {
				console.error("Gagal update jadwal");
				return false;
			}
		} catch (error) {
			console.error("Error saat update jadwal:", error);
			return false;
		}
	};


	const handleAssignDosen = async (dosen: number) => {
		console.log('log', dosen, selectedMatkul, action);
		if (!dosen || !selectedMatkul || !action) return;

		let success = false;

		if (action.state === 'update' && action.id !== null) {
			success = await updateJadwalDosen(dosen, action.id);
		} else {
			success = await insertJadwalDosen(dosen);
		}

		if (success) {
			refetch();
			setSelectedMatkul(null);
			setSelected_Dosen(null);
			setAction(null);
		}
	};

	  const Kelas = async (a: string) => {
		if (a === "tambah") {
		  setKelasList((prev) => [...prev, prev.length + 1]);
		  setKelas(kelas + 1);
		}
	  
		if (a === "hapus") {
		  if (kelasList.length > 1) {
			const lastKelas = kelasList[kelasList.length - 1];
	  
			// Hapus dari Supabase
			const { error } = await supabase
			  .from("jadwal")
			  .delete()
			  .eq("id_waktu", waktu)
			  .eq("id_kelas", lastKelas)
			  .eq('prodi', prodi)
			  .eq('semester', activeSemester)
	  
			if (error) {
			  console.error("Gagal menghapus jadwal:", error.message);
			  return;
			}
	  
			// Hapus dari state
			setKelasList((prev) => prev.slice(0, -1));
			setKelas(kelasList[kelasList.length - 2]); // Set kelas sebelumnya sebagai aktif
		  } else {
			console.warn("Minimal harus ada 1 kelas!");
		  }
		}
	  };


	const prodiMap: Record<number, string> = {
		1: "Teknik Mesin",
		2: "Komputer",
		3: "Industri",
		4: "Informatika",
		5: "DKV"
	};
	
	const getprodi = (id: number) => prodiMap[id] || "";

	return (
		<div className="h-full w-full flex flex-col items-center gap-10 xl:text-xl text-black">
			<div className="w-full flex flex-col text-2xl items-center">
				<h1>Penjadwalan Teknik {getprodi(prodi)}</h1>
			</div>
			<div className="min-w-60 w-full px-10">
				<div className="w-full flex gap-3">
					<div className="w-full flex flex-col gap-3">
						<div className="w-full flex flex-col gap-3">
						<div className="w-full flex flex-col gap-3 items-center">
							<div className="flex flex-wrap gap-3"> {/* Container flex untuk semester */}
								{Array.from({ length: 8 }, (_, index) => {
									const semester = index + 1;
									return (
										<button
										key={semester}
										onClick={() => {setActiveSemester(semester); setKelas(1);}}
										className={`px-2 py-2 rounded-md transition-colors
											${
											activeSemester === semester
												? 'bg-[#cefdc2]' // Style saat aktif
												: 'bg-[#E9E9E9] hover:bg-gray-300' // Style normal
											}`}
										>
										Semester {semester}
										</button>
									);
								})}
							</div>
							<div className='flex gap-20'>
								<div className='flex gap-3 items-center'>
									<h1>waktu</h1>
									<button
									className={`px-2 py-2 rounded-md ${
										waktu === 1 ? "bg-gray-500 text-white" : "bg-[#E9E9E9] hover:bg-gray-300"
									}`} onClick={() => {setWaktu(1); setKelas(1);}}
									>
									Pagi
									</button>
									<button
									className={`px-2 py-2 rounded-md ${
										waktu === 2 ? "bg-gray-500 text-white" : "bg-[#E9E9E9] hover:bg-gray-300"
									}`} onClick={() => {setWaktu(2); setKelas(1)}}
									>
									Malam
									</button>
								</div>
								<div className=' flex items-center gap-3'>
									<h1>Kelas</h1>
									{kelasList.map((item, index) => (
										<button
										key={index}
										className={`px-4 py-2 rounded-md ${
											kelas === index + 1 ? "bg-gray-500 text-white" : "bg-[#E9E9E9] hover:bg-gray-300"
										}`}
										onClick={() => setKelas(index + 1)}
										>
										{String.fromCharCode(64 + item)}
										</button>
									))}
									<button className={`px-2 py-2 rounded-md bg-[#E9E9E9] hover:bg-gray-300`} onClick={() => Kelas('tambah')}>
										tambahkan
									</button>
									<button className={`px-2 py-2 rounded-md bg-[#E9E9E9] hover:bg-gray-300`} onClick={() => Kelas('hapus')}>
										hapus
									</button>
								</div>
							</div>
						</div>
						</div>
						<div className='w-full h-20 flex gap-3'>
							<div className='w-full flex flex-col'>
								<div className='w-full flex flex-col gap-3'>
									<div className='bg-[#cefdc2] w-full grid grid-cols-[9fr_1fr_9fr] rounded-md gap-3'>
										<div className='grid grid-cols-[1fr_10rem] items-center rounded-md'>
											<div className="text-center">mata kuliah</div>
											<div className="text-center">jumlah preferensi</div>
										</div>
										<div>

										</div>
										<div className=" grid grid-cols-[1fr_10rem] items-center py-2 rounded">
											<div className="text-center">dosen</div>
											<div className="text-center">jadwal</div>
										</div>
									</div>
									

									{/* Scrollable Table */}
									<div className="h-full min-h-40 max-h-96 w-full flex flex-col gap-3 overflow-hidden">
										<div className="h-full w-full overflow-y-scroll flex flex-col gap-3 scroll-snap-y scroll-snap-mandatory">
										{delayedLoading
											? Array(5)
													.fill(0)
													.map((_, index) => (
														<div key={index} className="w-full">
															<div className="w-full h-10 bg-gray-300 rounded animate-pulse" />
														</div>
													))
											: filtered_data.map((item, index) => (
												<div key={index} className="w-full flex items-center lowercase cursor-pointer">
													<div className='w-full grid grid-cols-[9fr_1fr_9fr] gap-3 group'>
													
														<div className='flex flex-col gap-3'>
															<div className='w-full grid grid-cols-[1fr_10rem] items-center rounded-md px-3 py-2 group-hover:bg-[#F4F4F5] transition-all duration-200'>
																<div className="overflow-hidden text-nowrap group-hover:text-[#000]">
																{item.nama}
																</div>
																<div className='overflow-hidden text-nowrap text-center group-hover:text-[#000]'>
																{item.pref_dosen}
																</div>
															</div>
															<div className='h-[1px] bg-[#C1C1C1]'/>
														</div>
														<div>
															<div className="flex items-center justify-end overflow-hidden">
																<div className="w-full rounded transition-all duration-200">
																{item.nama_dosen? (
																	<button onClick={() => {
																		setSelectedMatkul({id: item.id, nama: item.nama});
																		setAction({state: "update", id: item.jadwal_id});
																		setOpen(1)
																		}} className='w-full py-2 rounded bg-green-500 text-white'>
																	Ubah
																	</button>
																) : (
																	<button onClick={() => {
																		setSelectedMatkul({id: item.id, nama: item.nama});
																		setAction({state: "insert", id: item.jadwal_id});
																		setOpen(1)
																		}} className='w-full py-2 rounded bg-blue-500 text-white '>
																	Pilih
																	</button>
																)}
																</div>
															</div>
														</div>

														<div className='flex flex-col gap-3'>
															{(item.id_dosen && item.nama_dosen)? (<div className='w-full grid grid-cols-[1fr_10rem] items-center gap-3'>
																<div className='overflow-hidden text-nowrap group-hover:text-[#000] rounded-md px-3 py-2 group-hover:bg-[#F4F4F5] transition-all duration-200'>
																	{item.nama_dosen} 
																</div>
																<div className='flex justify-center'>
																	<button className='text-center px-4 py-2 rounded bg-green-500 text-white' 
																	onClick={() => {
																	if (item.id_dosen !== null && item.nama_dosen !== null) {
																		setOpen(2);
																		setSelected_Dosen({
																		id: item.id_dosen,
																		nama: item.nama_dosen,
																		});
																	}
																	}}> lihat</button>
																</div>
															</div>):<div>-</div>}
															<div className='h-[1px] bg-[#C1C1C1]'/>
														</div>
													</div>  
												</div>
											)
										)}
										</div>
										<div className='w-full flex justify-center'>
											<button className='px-4 py-2 rounded-md bg-[#E9E9E9] hover:bg-gray-300'>selesai</button>
										</div>
									</div>
								</div>
							</div>
						</div>	
					</div>
				</div>
			</div>

			{selectedMatkul && selectedMatkul.id && selectedMatkul.nama && <DosenModal isOpen={Open === 1}  matkulId={selectedMatkul.id} matkulName={selectedMatkul.nama} onClose={() => setOpen(0)} result={(dosenId) => {handleAssignDosen(dosenId); setSelectedMatkul(null)}} />}
			{selected_dosen && selected_dosen.id && selected_dosen.nama && <TimeModal isOpen={Open === 2} id={selected_dosen.id} name={selected_dosen.nama} onClose={() => {setSelected_Dosen(null); setOpen(0);}} />}								
			
		</div>
	);
};

export default Home;