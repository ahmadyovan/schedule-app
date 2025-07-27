import { updateData } from "@/utils/functions";
import { useMemo, useState } from "react";

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

type Props = {
    isOpen: boolean;
    data : JadwalList[];
    selectedJadwal: JadwalList;
    onView: ( value: number) => boolean;
    onClose: (e: boolean) => void;
}

const Modal = ({isOpen, data, selectedJadwal, onView, onClose}: Props) => {

    const [filterProdi, setFilterProdi] = useState<number[]>([1, 2, 3, 4, 5]);
    const [filterSemester, setFilterSemester] = useState<number[]>([1, 3, 5, 7]);
    const [filterHari, setFilterHari] = useState<number | null>(null);
    const [filterRuangan, setFilterRuangan] = useState<number | null>(null);
    const [kelasList, setKelasList] = useState<number[]>([1,2]);
    const [showOnly, setShowOnly] = useState<"ganjil" | "genap">("ganjil");
    const [filterKelas, setFilterKelas] = useState<number[]>([1,2]);
    const [searchQuery, setSearchQuery] = useState("");

    function swapJadwalData(j1: JadwalList, j2: JadwalList): [JadwalList, JadwalList] {
		// Buat salinan agar data asli tidak berubah
		const updatedJ1 = { ...j1 };
		const updatedJ2 = { ...j2 };

		// Simpan sementara nilai milik j1
		const temp = {
			id_hari: updatedJ1.id_hari,
			jam_mulai: updatedJ1.jam_mulai,
			jam_akhir: updatedJ1.jam_akhir,
		};

		// Tukar nilai dari j2 ke j1
		updatedJ1.id_hari = updatedJ2.id_hari;
		updatedJ1.jam_mulai = updatedJ2.jam_mulai;
		updatedJ1.jam_akhir = updatedJ2.jam_akhir;

		// Tukar nilai dari j1 (temp) ke j2
		updatedJ2.id_hari = temp.id_hari;
		updatedJ2.jam_mulai = temp.jam_mulai;
		updatedJ2.jam_akhir = temp.jam_akhir;

		return [updatedJ1, updatedJ2];
	}

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

    const semesters = showOnly === "ganjil" ? [1, 3, 5, 7] : [2, 4, 6, 8];

    async function swapJadwal(jadwal1: JadwalList, jadwal2: JadwalList) {
        if (!jadwal1 || !jadwal2) return;

        // 1. Tukar data secara lokal
        const [jadwal1Baru, jadwal2Baru] = swapJadwalData(jadwal1, jadwal2);

        // 2. Siapkan array update
        const updates = [
            {
                id: jadwal1.id,
                payload: {
                    id_hari: jadwal1Baru.id_hari,
                    jam_mulai: jadwal1Baru.jam_mulai,
                    jam_akhir: jadwal1Baru.jam_akhir,
                },
            },
            {
                id: jadwal2.id,
                payload: {
                    id_hari: jadwal2Baru.id_hari,
                    jam_mulai: jadwal2Baru.jam_mulai,
                    jam_akhir: jadwal2Baru.jam_akhir,
                },
            },
        ];

        // 3. Jalankan update secara berurutan dengan for loop
        for (const update of updates) {
            await updateData({
                table: 'jadwal',
                payload: update.payload,
                filters: [{ column: 'id', value: update.id }],
            });
        }

        // 4. Tutup modal
        onClose(false);
    }

    const filteredJadwal = useMemo(() => {
        if (!data) return [];

        return data
            .filter((item) =>
                filterProdi.includes(item.prodi) &&
                semesters.includes(item.semester) &&
                item.id_waktu === selectedJadwal.id_waktu &&
                filterKelas.includes(item.id_kelas) &&
                item.nama_dosen.toLowerCase().includes(searchQuery.toLowerCase()) &&
                (filterRuangan === null || item.id_ruangan === filterRuangan)
            )
            .sort((a, b) => a.prodi - b.prodi || a.semester - b.semester || a.id_hari - b.id_hari ); 
    }, [data, filterProdi, filterSemester, selectedJadwal, filterKelas, searchQuery, filterRuangan]);

    const getprodi = (id: number) => prodiMap[id] || "";

    const getNamaHari = (hari: number): string => {
        return ["Hari tidak valid", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][hari] || "-";
    };

    const formatWaktu = (menit: number): string => {
		const interval = 40;
		const menitTepat = Math.floor(menit / interval) * interval;
		const jam = Math.floor(menitTepat / 60);
		const menitSisa = menitTepat % 60;
		return `${jam.toString().padStart(2, "0")}:${menitSisa.toString().padStart(2, "0")}`;
	};

    const uniqueRuangan = useMemo(() => {
        if (!data || data.length === 0) return [];
        return Array.from(new Set(
            data
            .map(item => item.id_ruangan)
            .filter(id => id !== null && id !== 0) // Exclude null/0 values
            .sort((a, b) => a - b) // Sort numerically
        ));
    }, [data]);

    return (
        isOpen && (
        <div className="fixed w-full inset-0 bg-black/50 px-20 flex justify-center items-center">
			<div className="w-full bg-gray-200 p-10 rounded shadow-md">
				<div className='w-full text-center mb-5'>
					<h1>Konflik Jadwal</h1>
				</div>
				<div className="w-full flex flex-col gap-3">
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
								<button onClick={() => {setShowOnly("ganjil"); setFilterSemester(semesters)}}  className={`px-2 py-2 rounded-md cursor-pointer ${showOnly === "ganjil" ? "bg-gray-500 text-white" : "bg-[#E9E9E9] hover:bg-gray-300"}`}>
									Ganjil
								</button>
								<button onClick={() => {setShowOnly("genap"); setFilterSemester(semesters)}} className={`px-2 py-2 rounded-md cursor-pointer ${showOnly === "genap" ? "bg-gray-500 text-white" : "bg-[#E9E9E9] hover:bg-gray-300"}`}>
									Genap
								</button>
							</div>
							<div className="flex flex-wrap gap-3">
								{semesters.map((semester) => {
									const isSelected = semesters.includes(semester);

									const toggle = () => {
										setFilterSemester((prev) =>
											isSelected ? prev.filter((p) => p !== semester) : [...prev, semester]
										);
									};

									return (
										<button key={semester} onClick={toggle} className={`px-2 py-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-[#cefdc2]' : 'bg-[#E9E9E9] hover:bg-gray-300'}`}>
											Semester {semester}
										</button>
									);
								})}
							</div>
						</div>
					</div>
					<div className="w-full flex justify-center items-center gap-5">
						<div>
						{data && data.length > 0 && (
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
				<div className='flex flex-col gap-2'>
					 <div>
						<div className="bg-[#cefdc2] py-2 w-full grid grid-cols-[5rem_7rem_7rem_7rem_1fr_5rem_1fr_5rem_10rem_7rem_15rem] rounded-md gap-3 pr-4">
							<div className="text-center">no</div>
							<div className="text-center">prodi</div>
							<div className="text-center">semester</div>
							<div className="">kode</div>
							<div className="">mata kuliah</div>
							<div className="text-center">sks</div>
							<div className="">hari</div>
							<div className="">dosen</div>
							<div className="">waktu</div>
							<div className="">kelas</div>
							<div className="">ruangan</div>
						</div>
						<div className={`h-full min-h-40 w-full flex flex-col gap-3 overflow-hidden max-h-[272px]`}>
							<div className='overflow-y-scroll scroll-snap-y scroll-snap-mandatory scrollbar-visible'>
								<div className='grid grid-cols-1 gap-2'>
									{data && (
									data.map((item: JadwalList, index) => (
										<div key={index} onClick={() => swapJadwal(selectedJadwal, item)}
										className={`h-12 w-full grid grid-cols-[5rem_7rem_7rem_7rem_1fr_5rem_1fr_5rem_10rem_7rem_15rem] cursor-pointer items-center rounded-md gap-3 shadow ${onView(item.id) ? 'bg-red-300' : 'bg-[#E9E9E9]'}`}>
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
									)))}
								</div>
							</div>
						</div>
					</div> 
				</div>
				<div className='w-full flex justify-end'>
					<button className='px-4 h-fit py-2 bg-gray-500 text-white cursor-pointer' onClick={() => onClose(false)}>kembali</button>
				</div>
			</div>
		</div>)
    );
}

export default Modal;
