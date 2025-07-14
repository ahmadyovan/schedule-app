import { useState } from "react";

type TimeSlot = {
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  time: 'Pagi' | 'Malam';
};

type Props = {
  isOpen: boolean;
  onResult: (value: TimeSlot) => void;
  onClose: () => void;
};

const days: TimeSlot['day'][] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const times: TimeSlot['time'][] = ['Pagi', 'Malam'];

const PopUp = ({ isOpen, onResult, onClose }: Props) => {
  const [selected, setSelected] = useState<TimeSlot>({ day: 'Senin', time: 'Pagi' });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelected((prev) => ({ ...prev, [name]: value } as TimeSlot));
  };

  const handleSave = () => {
    onResult(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        <h3 className="text-lg font-semibold text-center mb-4">Pilih Hari dan Waktu</h3>
        <div className="flex flex-col gap-4">
          <label>
            Hari:
            <select
              name="day"
              value={selected.day}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
          <label>
            Waktu:
            <select
              name="time"
              value={selected.time}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
            >
              {times.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">
            Batal
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopUp;
