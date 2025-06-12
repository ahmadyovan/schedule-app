'use client';

import { useUser } from '@/app/context/UserContext';
import { useRealtime } from '@/components/hook/useRealtimeCourses';
import DosenModal from '@/components/kaprodi/penjadwalan/DosenModal';
import TimeModal from '@/components/kaprodi/penjadwalan/TimeModal';
import { fetchFromApi, insertData, updateData } from '@/utils/functions';
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect, } from 'react';

const supabase = createClient();

type Dosen = {
	id: number;
	nama: string;
};

type MataKuliah = {
	id: number;
	nama: string;
	semester: number;
	prodi: number;
	prefMatkul?: { id_matkul: number }[];
};

type Jadwal = {
	id_jadwal: number;
	prodi: number
	semester: number;
	id_matkul: number;
	nama_matkul: string;
	jumlah_dosen: number;
	dosen: Dosen;
	id_waktu: number;
	id_kelas: number;
};


  
const Home = () => {

	const [activeSemester, setActiveSemester] = useState<number>(1);

	const [data, setData] = useState<MataKuliah[]>([]);
	const [jadwal, setJadwal] = useState<Jadwal[]>([]);

	const [selectedMatkul, setSelectedMatkul] = useState<{id: number, nama: string} | null>(null);
	const [action, setAction] = useState<{state: string, id: number} | null>(null);
	const [selected_dosen, setSelected_Dosen] = useState<{id: number, name: string} | null>(null);

	const [waktu, setWaktu] = useState<number>(1);
	const [kelas, setKelas] = useState<number>(1);
	const [kelasList, setKelasList] = useState<number[]>([1]); 

	const [Open, setOpen] = useState<number>(0)

	const [isLoading, setIsLoading] = useState(false);

	const user = useUser();

	const prodi = user.prodi

	const { data: JADWAL_DOSEN, loading: loadingJadwal } = useRealtime('jadwal', {
		select: 'id, id_matkul, id_dosen, id_kelas, id_waktu, prodi, dosen:id_dosen(id, nama), semester',
		filters: [{ column: 'id_waktu', value: waktu }],
	});

	useEffect(() => {
		fetchFromApi({
			table: 'mata_kuliah',
			selectFields: 'id, nama, semester, prodi, prefMatkul(id_matkul)',
			filters: [
				{ column: 'prodi', value: prodi },
				{ column: 'semester', value: activeSemester },
			],
			setData: setData,
			setLoading: setIsLoading,
		});
	}, [activeSemester, prodi]);

	useEffect(() => {
		const Matkul = data;
		const Jadwal = JADWAL_DOSEN;
	
		if (Matkul.length === 0) return;
	
		const Penjadwalan = Matkul.map((matkul) => {
			const jadwalTerkait = Jadwal?.find(
				(jadwal) => jadwal.id_matkul === matkul.id && jadwal.id_kelas === kelas
			);
	
			if (!jadwalTerkait) {
				return {
					id_jadwal: null,
					prodi: matkul.prodi,
					semester: null,
					id_matkul: matkul.id,
					nama_matkul: matkul.nama,
					jumlah_dosen: matkul.prefMatkul?.length || 0,
					dosen: {
						id: null,
						nama: null
					},
					id_waktu: null,
					id_kelas: null,
				};
			}
	
			return {
				id_jadwal: jadwalTerkait.id,
				prodi: matkul.prodi,
				semester: jadwalTerkait.semester,
				id_matkul: matkul.id,
				nama_matkul: matkul.nama,
				jumlah_dosen: matkul.prefMatkul?.length || 0,
				dosen: {
					id: jadwalTerkait.dosen.id,
					nama: jadwalTerkait.dosen.nama,
				},
				id_waktu: jadwalTerkait.id_waktu,
				id_kelas: jadwalTerkait.id_kelas,
			};
		});
	
		setJadwal(Penjadwalan);
	}, [data, JADWAL_DOSEN, kelas]);
	

	  useEffect(() => {
		if (!JADWAL_DOSEN || JADWAL_DOSEN.length === 0) {
			setKelasList([1]); // Default kelasList jika tidak ada data
			setKelas(1)
			return;
		}
	
		// Ambil semua id_kelas unik berdasarkan id_waktu dan activeSemester
		let uniqueIdKelas = Array.from(
			new Set(
				JADWAL_DOSEN
					.filter((jadwal) => jadwal.id_waktu === waktu)
					.filter((jadwal) => jadwal.semester === activeSemester)
					.filter((jadwal) => jadwal.prodi == prodi)
					.map((jadwal) => jadwal.id_kelas)
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
	}, [JADWAL_DOSEN, activeSemester, prodi, waktu]);
	  
	const loading = loadingJadwal || isLoading;

	const handleAssignDosen = async (dosen: number) => {
		if (dosen && selectedMatkul && action) {
			
			if (action.state == 'update' && action.id != 0) {
				await updateData({
					table: 'jadwal',
					payload: { id_dosen: dosen },
					filters: [{ column: 'id', value: action.id }],
				});
			} else {
				await insertData({
					table: 'jadwal',
					payload: {
						id_matkul: selectedMatkul.id,
						id_dosen: dosen,
						id_waktu: waktu,
						id_kelas: kelas,
						semester: activeSemester,
						prodi: prodi,
					},
				});
			}
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
			<div className="min-w-60 w-full">
				<div className="w-full flex gap-3">
					<div className="w-full flex flex-col gap-3">
						<div className="w-full flex flex-col gap-3">
						<div className="w-full flex flex-col gap-3">
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
									<div className='bg-[#cefdc2] w-full grid grid-cols-[9fr,1fr,9fr] rounded-md gap-3'>
										<div className='grid grid-cols-[1fr,10rem] items-center rounded-md'>
											<div className="text-center">mata kuliah</div>
											<div className="text-center">jumlah preferensi</div>
										</div>
										<div>

										</div>
										<div className=" grid grid-cols-[1fr,10rem] items-center py-2 rounded">
											<div className="text-center">dosen</div>
											<div className="text-center">jadwal</div>
										</div>
									</div>
									

									{/* Scrollable Table */}
									<div className="h-full min-h-40 max-h-96 w-full flex flex-col gap-3 overflow-hidden">
										<div className="h-full w-full overflow-y-scroll flex flex-col gap-3 scroll-snap-y scroll-snap-mandatory">
										{loading
											? Array(5)
													.fill(0)
													.map((_, index) => (
														<div key={index} className="w-full">
															<div className="w-full h-10 bg-gray-300 rounded animate-pulse" />
														</div>
													))
											: jadwal.map((item, index) => (
												<div key={index} className="w-full flex items-center lowercase cursor-pointer">
													<div className='w-full grid grid-cols-[9fr,1fr,9fr] gap-3 group'>
													
														<div className='flex flex-col gap-3'>
															<div className='w-full grid grid-cols-[1fr,10rem] items-center rounded-md px-3 py-2 group-hover:bg-[#F4F4F5] transition-all duration-200'>
																<div className="overflow-hidden text-nowrap group-hover:text-[#000]">
																{item.nama_matkul}
																</div>
																<div className='overflow-hidden text-nowrap text-center group-hover:text-[#000]'>
																{item.jumlah_dosen}
																</div>
															</div>
															<div className='h-[1px] bg-[#C1C1C1]'/>
														</div>

													
														<div>
														<div className="flex items-center justify-end overflow-hidden">
															<div className="w-full rounded transition-all duration-200">
															{item.dosen.id && item.dosen.nama? (
																<button onClick={() => {
																	setSelectedMatkul({id: item.id_matkul, nama: item.nama_matkul});
																	setAction({state: "update", id: item.id_jadwal});
																	setOpen(1)
																	}} className='w-full py-2 rounded bg-green-500 text-white'>
																Ubah
																</button>
															) : (
																<button onClick={() => {
																	setSelectedMatkul({id: item.id_matkul, nama: item.nama_matkul});
																	setAction({state: "insert", id: item.id_jadwal});
																	setOpen(1)
																	}} className='w-full py-2 rounded bg-blue-500 text-white '>
																Pilih
																</button>
															)}
															</div>
														</div>
														</div>

														
														<div className='flex flex-col gap-3'>
															<div className='w-full grid grid-cols-[1fr,10rem] items-center gap-3'>
															<div className='overflow-hidden text-nowrap group-hover:text-[#000] rounded-md px-3 py-2 group-hover:bg-[#F4F4F5] transition-all duration-200'>
																{item.dosen.nama ?? '-'} 
															</div>
															<div className='flex justify-center'>
																{item.dosen.id && item.dosen.nama && (
																	<button className='text-center px-4 py-2 rounded bg-green-500 text-white' 
																	onClick={() => {setOpen(2); setSelected_Dosen({id: item.dosen.id, name: item.dosen.nama})}}> lihat</button>)
											    				}
															</div>
															</div>
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

			{selectedMatkul && <DosenModal isOpen={Open === 1}  matkulId={selectedMatkul.id} matkulName={selectedMatkul.nama} onClose={() => setOpen(0)} result={(dosenId) => {handleAssignDosen(dosenId); setSelectedMatkul(null)}} />}
			{selected_dosen && <TimeModal isOpen={Open === 2} id={selected_dosen?.id} name={selected_dosen?.name} onClose={() => {setSelected_Dosen(null); setOpen(0); console.log(Open);
			}} />}								
			
		</div>
	);
};

export default Home;