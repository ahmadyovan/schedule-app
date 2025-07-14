'use client';

import { useEffect, useMemo, useState } from "react";
import { fetchFromApi } from "@/utils/functions";

type Dosen = {
	id: number;
	nama: string;
};

type Jadwal = {
	id_jadwal: number;
	prodi: number;
	semester: number;
	id_matkul: number;
	nama_matkul: string;
	jumlah_dosen: number;
	dosen: Dosen;
	id_waktu: number;
	id_kelas: number;
};

type Props = {
	isOpen: boolean;
	matkulName: string;
	matkulId: number;
	result: (dosenId: number) => void;
	onClose: () => void;
};

const DosenModal = ({ isOpen, matkulId, matkulName, result, onClose }: Props) => {
	const [data, setData] = useState<Dosen[]>([]);
	const [preference, setPreference] = useState<Jadwal[]>([]);
	const [mode, setMode] = useState<number>(2);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const fetchDosen = async () => {
			const response = await fetchFromApi({
				table: 'dosen',
				selectFields: 'id, nama',
			});
			if (response?.data) setData(response.data);
		};

		const fetchPref = async () => {
			const response = await fetchFromApi({
				table: 'prefMatkul',
				selectFields: 'id_matkul, id_dosen, dosen(id, nama)',
			});
			if (response?.data) setPreference(response.data);
		};

		fetchDosen();
		fetchPref();
	}, []);

	const filteredDosen = useMemo(() => {
		let result: Dosen[] = [];

		if (mode === 1) {
			result = preference
				.filter((item) => item.id_matkul === matkulId && item.dosen !== null)
				.map((item) => ({
					id: item.dosen!.id,
					nama: item.dosen!.nama,
				}));
		} else if (mode === 2) {
			result = data;
		}

		return result.filter((dosen) =>
			dosen.nama.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [mode, preference, data, matkulId, searchQuery]);

	if (!isOpen) return null;

	return (
		<div className="fixed w-full inset-0 bg-black/50 flex justify-center items-center">
			<div className="w-full max-w-3xl bg-gray-200 p-10 rounded shadow-md">
				<h1 className="font-bold text-center text-lg pb-1">{matkulName}</h1>
				<h3 className="font-bold text-center pb-3">Pilih Dosen</h3>

				<div className="w-full flex flex-col gap-3">
					<div className="w-full flex items-center justify-between">
						<div className="w-full flex gap-4">
							<button
								className={`py-2 px-4 rounded ${mode === 1 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
								onClick={() => setMode(1)}
							>
								Preferensi
							</button>
							<button
								className={`py-2 px-4 rounded ${mode === 2 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
								onClick={() => setMode(2)}
							>
								Lainnya
							</button>
						</div>
						<div className="w-full">
							<input
								autoFocus
								type="text"
								placeholder="Cari nama dosen..."
								className="w-full px-4 py-2 border rounded"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>

					<div className="max-h-96 overflow-hidden">
						<div className="h-96 flex flex-col gap-3 overflow-y-scroll">
							{filteredDosen.length > 0 ? (
								filteredDosen.map((dosen, index) => (
									<div key={index} className="flex gap-5 lowercase justify-between items-center text-nowrap">
										<div className="text-2xl">{dosen.nama}</div>
										<button
											className="py-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-700"
											onClick={() => {
												result(dosen.id);
												setSearchQuery('');
											}}
										>
											Pilih
										</button>
									</div>
								))
							) : (
								<div className="text-center text-xl text-gray-500">
									Tidak ada dosen yang tersedia
								</div>
							)}
						</div>
					</div>

					<button
						onClick={onClose}
						className="mt-4 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-700"
					>
						Batal
					</button>
				</div>
			</div>
		</div>
	);
};

export default DosenModal;
