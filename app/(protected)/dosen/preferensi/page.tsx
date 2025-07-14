'use client'

import { useCallback, useEffect, useState } from "react";
import MatkulModal from "@/components/dosen/MatkulModal";
import TimeModal from "@/components/dosen/TimeModal";
import { useUser } from "@/app/context/UserContext";
import { fetchFromApi, insertData } from "@/utils/functions";

type MatkulType = {
    id: number;
    kode: number;
    nama: string;
    sks: number;
    semester: number;
	prodi: number;
};

type Day = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
type Time = 'Pagi' | 'Malam';

type TimeSlot = {
  day: Day;
  time: Time;
};

type TimeSlotArray = TimeSlot[];

interface TimePreferrence {
    id_dosen: number;
    senin_pagi: boolean;
    senin_malam: boolean;
    selasa_pagi: boolean;
    selasa_malam: boolean;
    rabu_pagi: boolean;
    rabu_malam: boolean;
    kamis_pagi: boolean;
    kamis_malam: boolean;
    jumat_pagi: boolean;
    jumat_malam: boolean;
    [key: string]: boolean | number; // Add index signature
}


const STORAGE_KEY = 'jadwal';
const MAX_SKS = 20;

const Penjadwalan = () => {

    const [items, setItems] = useState<MatkulType[]>([]);
	const [totalSKS, setTotalSKS] = useState<number>(0);
	const [dosen, set_dosen] = useState<number>(0);

	const [isOpen, setIsOpen] = useState(0)

	const user = useUser();

	const UID = user.uid

	useEffect(() => {
		const fetchDosen = async () => {
			const response = await fetchFromApi({
				table: 'dosen',
				selectFields: 'id',
				filters: [{column: 'uid',value: UID}]
			});
			if (response?.data[0].id) set_dosen(response.data[0].id);
		};

		fetchDosen();
	}, [UID])
	console.log('dosen', dosen);

	const calculateTotalSKS = useCallback((data: MatkulType[]) => {
		const total = data.reduce((sum, item) => sum + item.sks, 0);
		setTotalSKS(total);
	}, []);

	useEffect(() => {
		const storedData = localStorage.getItem(STORAGE_KEY);
		if (storedData) {
			try {
				const parsedItems: MatkulType[] = JSON.parse(storedData);
				setItems(parsedItems);
				calculateTotalSKS(parsedItems);
			} catch (error) {
				console.error('Failed to parse local storage data', error);
			}
		}
	}, [calculateTotalSKS]);


	const saveData = useCallback((newItems: MatkulType[]) => {
		setItems(newItems);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
		calculateTotalSKS(newItems);
	}, [calculateTotalSKS]);

	const prodiMap: Record<number, string> = {
		1: "Mesin",
		2: "Komputer",
		3: "Industri",
		4: "Informatika",
		5: "DKV"
	};
	
	const getprodi = (id: number) => prodiMap[id] || "";

	const addItem = (matkul: MatkulType) => {
		if (!matkul) {
			alert('Mata kuliah tidak valid');
			return;
		}

		if (items.some((item) => item.id === matkul.id)) {
			alert('Mata kuliah sudah dipilih.');
			return;
		}

		if (totalSKS + matkul.sks > MAX_SKS) {
			alert('Total SKS melebihi batas maksimum.');
			return;
		}

		const newItem: MatkulType = { ...matkul };
		saveData([...items, newItem]);
		setIsOpen(0);
	};

	const deleteItem = useCallback((id: number) => {
		const updatedItems = items.filter((item) => item.id !== id);
		saveData(updatedItems);
	}, [items, saveData]);

	const handleSaveSchedule = async (times: TimeSlotArray) => {
		try {
			const newSchedule: TimePreferrence = {
				id_dosen: dosen,
				senin_pagi: true,
				senin_malam: true,
				selasa_pagi: true,
				selasa_malam: true,
				rabu_pagi: true,
				rabu_malam: true,
				kamis_pagi: true,
				kamis_malam: true,
				jumat_pagi: true,
				jumat_malam: true,
			};

			// Tandai waktu yang tidak tersedia
			times.forEach((slot) => {
				const day = slot.day.toLowerCase() as Day;
				const time = slot.time.toLocaleLowerCase() as Time;
				const key = `${day}_${time}` as keyof TimePreferrence;
				newSchedule[key] = false;
			});

			// Simpan preferensi waktu ke tabel 'prefWaktu'
			const waktuResult = await insertData({
				table: 'prefWaktu',
				payload: newSchedule,
			});

			if (!waktuResult.success) {
				alert('Gagal menyimpan preferensi waktu');
			} else {
				alert('Preferensi waktu berhasil disimpan!');
				setIsOpen(0)
			}

			// Siapkan data preferensi mata kuliah
			const prevMatkul = items.map((item) => ({
				id_matkul: item.id,
				id_dosen: dosen,
			}));

			// Simpan preferensi matkul ke tabel 'prefMatkul'
			const matkulResult = await insertData({
				table: 'prefMatkul',
				payload: prevMatkul,
			});

			if (!matkulResult.success) {
				alert('Gagal menyimpan preferensi matkul');
			} else {
				alert('Preferensi matkul berhasil disimpan!');
				setIsOpen(0)
			}
		} catch (error) {
			console.error('Unexpected error:', error);
			alert('Terjadi kesalahan saat menyimpan jadwal!');
		}
	};


	const tablestyle = 'w-10/12 grid grid-cols-[1fr_2fr_5fr_1fr_2fr_1fr]';
    
    return(
        <div className="h-full w-full flex flex-col items-center text-black xl:text-xl">
            <div className="w-full flex flex-col px-5 items-center sm:px-10">
                <div className="text-center py-3 pt-10">
                    <h1>MENEGEMEN PEREFERENSI</h1>
                </div>
                <div className="w-full min-w-60 max-w-7xl flex flex-col gap-3">

					<div className='w-full flex flex-col gap-2'>
						<div className="w-full bg-[#cefdc2] rounded-md">
							<div className={` ${tablestyle} items-center py-2 rounded-md`}>
								<div className='text-center'>No</div>
								<div className='text-center'>kode</div>
								<div>Mata Kuliah</div>
								<div className="text-center">semester</div>
								<div className="text-center">prodi</div>
								<div className='text-center'>SKS</div>
							</div>
						</div>
                        
                        <div className="w-full flex flex-col gap-3">
							{items.map((item, index) => (
								<div key={item.id} className='flex flex-col gap-3'>
									<div className="w-full flex items-center gap-3">
										<div className={` ${tablestyle} hover:bg-[#F4F4F4] py-2 rounded-md`}>
											<div className='text-center'>{index + 1}</div>
											<div className='text-center'>{item.kode}</div>
											<div className="overflow-hidden lowercase text-nowrap">{item.nama}</div>
											<div className='text-center'>{item.semester}</div>
											<div className="overflow-hidden text-center lowercase text-nowrap">{getprodi(item.prodi)}</div>
											<div className='text-center'>{item.sks}</div>
										</div>
										<button onClick={() => deleteItem(item.id)} className="flex-1 bg-[#ffbcbc] py-2 rounded hover:bg-[#e0a4a4] transition-colors"> hapus </button>
									</div>
									
									<div className='h-[1px] bg-[#C1C1C1]'/>
								</div>
							))}
                        </div>
						<div className="w-full flex gap-3 py-3">
							<div className='w-10/12 grid grid-cols-[1fr,5rem] items-center'>
								<div className='flex justify-center'>
									<button onClick={() => setIsOpen(1)} className='px-4 py-2 rounded-md bg-[#E9E9E9] hover:bg-gray-300'>Tambah</button>
								</div>
								<div className="w-full flex justify-end pr-10">
									<div className='text-center'>{totalSKS}</div>
								</div>
								
							</div>
							
							<button onClick={() => setIsOpen(2)} className='flex-1 py-2 rounded-md bg-[#E9E9E9] hover:bg-gray-300'>tentukan waktu</button>
						</div>
                    </div>
					<MatkulModal isOpen={isOpen == 1} onResult={(matkul: MatkulType) => {addItem(matkul)}} onClose={() => setIsOpen(0)}/>
                    <TimeModal isOpen={isOpen == 2} onResult={(times: TimeSlotArray) => handleSaveSchedule(times)} onClose={() => setIsOpen(0)} />
                </div>
            </div>
        </div>
    )
}

export default Penjadwalan