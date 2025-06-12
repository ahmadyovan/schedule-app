import { fetchFromApi } from "@/utils/functions";
import { useEffect, useState } from "react";

type ScheduleAvailability = {
	id: number;
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
};

type Day = "senin" | "selasa" | "rabu" | "kamis" | "jumat";

type TimeSlot = {
  pagi: boolean;
  malam: boolean;
};

type StructuredSchedule = {
  id_dosen: number;
  jadwal: Record<Day, TimeSlot>;
};

type Props = {
    isOpen : boolean;
    id: number;
    name: string;
    onClose: () => void;
}

const TimeModal = ({ isOpen, id, name, onClose}: Props) => {

    const [pref_waktu, setPref_Waktu] = useState<ScheduleAvailability[]>([])

    useEffect(() => {
		fetchFromApi({
			table: 'prefWaktu',
			selectFields: '*',
			setData: setPref_Waktu,
		});
	}, []);

    const formatPrefWaktu = (data: ScheduleAvailability): StructuredSchedule => {
		const days: Day[] = ["senin", "selasa", "rabu", "kamis", "jumat"];
	  
		const jadwal: Record<Day, TimeSlot> = {} as Record<Day, TimeSlot>;
	  
		days.forEach((day) => {
		  jadwal[day] = {
			pagi: data[`${day}_pagi`],
			malam: data[`${day}_malam`],
		  };
		});
	  
		return {
		  id_dosen: data.id_dosen,
		  jadwal,
		};
	};

    return isOpen ? (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-bold">Jadwal {name}</h2>
				<button onClick={() => onClose()} className="text-gray-500 hover:text-gray-700">✕</button>
			</div>
			{(() => {
				const data = pref_waktu.find(item => item.id_dosen === id);
				// Jika tidak ada data, buat default semua true
				const structured = formatPrefWaktu(
				data ?? {
					id: 0,
					id_dosen: id,
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
				}
				);
				return (
				<div>
					<div className="grid grid-cols-3 gap-4 mb-4">
						<div className="font-bold">Hari</div>
						<div className="font-bold">Pagi</div>
						<div className="font-bold">Malam</div>
					</div>
					
					<div>
						{Object.entries(structured.jadwal).map(([day, times]) => (
							<div className='grid grid-cols-3 gap-4 mb-4' key={day}>
								<div className="font-medium text-gray-600 capitalize">{day}</div>
								<div className={`p-2 rounded ${times.pagi ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
									{times.pagi ? 'Tersedia' : 'Tidak'}
								</div>
								<div className={`p-2 rounded ${times.malam ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
									{times.malam ? 'Tersedia' : 'Tidak'}
								</div>
							</div>
						))}
					</div>
					
					
				</div>
				);
			})()}
			</div>
		</div>
	): null
}

export default TimeModal;