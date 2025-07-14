import { useState } from "react";
import PopUp from "./popup";

type Day = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
type Time = 'Pagi' | 'Malam';

type TimeSlot = {
  day: Day;
  time: Time;
};

type TimeSlotArray = TimeSlot[];

type Props = {
	isOpen: boolean;
	onResult: (timeSlots: TimeSlotArray) => void;
	onClose: () => void;
};

const TimeModal = ({ isOpen, onResult, onClose }: Props) => {
	const [timeSlots, setTimeSlots] = useState<TimeSlotArray>([]);
	const [showPopUp, setShowPopUp] = useState(false);

	const handleRemoveTimeSlot = (index: number) => {
		setTimeSlots((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSave = () => {
		onResult(timeSlots);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
			<div className="bg-white p-6 rounded-lg max-w-md w-full flex flex-col">
				<h2 className="text-xl text-center font-semibold mb-4">
					Apakah Anda Ingin Menambahkan Jam Kosong Mengajar?
				</h2>

				<div className="flex flex-col gap-4">
					<button
						onClick={() => setShowPopUp(true)}
						className="px-4 py-2 bg-blue-500 text-white rounded self-center"
					>
						Tambah Jam Kosong
					</button>

					<ul className="list-disc pl-5">
						{timeSlots.map((slot, index) => (
							<li key={index} className="flex justify-between items-center">
								<span>{slot.day} - {slot.time}</span>
								<button
									onClick={() => handleRemoveTimeSlot(index)}
									className="text-red-500"
								>
									Hapus
								</button>
							</li>
						))}
					</ul>
				</div>

				<div className="flex justify-center gap-4 mt-4">
					<button
						onClick={handleSave}
						className="px-4 py-2 bg-blue-500 text-white rounded"
					>
						Simpan
					</button>
					<button
						onClick={onClose}
						className="px-4 py-2 bg-gray-500 text-white rounded"
					>
						Kembali
					</button>
				</div>
			</div>

			<PopUp
				isOpen={showPopUp}
				onResult={(value) => {
					setTimeSlots((prev) => [...prev, value]);
					setShowPopUp(false);
				}}
				onClose={() => setShowPopUp(false)}
			/>
		</div>
	);
};

export default TimeModal;
