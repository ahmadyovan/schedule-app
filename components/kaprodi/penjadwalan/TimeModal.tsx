import { useSupabaseTableData } from "@/components/hook/useTableData";
import { Tables } from "@/types/supabase";
import { useMemo } from "react";

type PrefWaktu = Tables<'prefWaktu'>;

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
  isOpen: boolean;
  id: number;
  name: string;
  onClose: () => void;
};

const TimeModal = ({ isOpen, id, name, onClose }: Props) => {
  const filters_raw_prefwaktu = useMemo(
    () => [{ column: 'id_dosen', value: id }],
    [id]
  );

  const { data: raw_prefwaktu, loading } = useSupabaseTableData<PrefWaktu>("prefWaktu", {
    filters: filters_raw_prefwaktu,
  });

  const formatPrefWaktu = (data: PrefWaktu): StructuredSchedule => {
    const days: Day[] = ["senin", "selasa", "rabu", "kamis", "jumat"];

    const jadwal: Record<Day, TimeSlot> = {} as Record<Day, TimeSlot>;

    days.forEach((day) => {
      jadwal[day] = {
        pagi: data[`${day}_pagi`] ?? false,
        malam: data[`${day}_malam`] ?? false,
      };
    });

    return {
      id_dosen: data.id_dosen as number,
      jadwal,
    };
  };

  if (!isOpen) return null;

  const data = raw_prefwaktu?.[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Jadwal {name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {loading ? (
          <p className="text-gray-500">Memuat data...</p>
        ) : !data ? (
          <p className="text-gray-500">Belum ada data preferensi waktu untuk dosen ini.</p>
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="font-bold">Hari</div>
              <div className="font-bold">Pagi</div>
              <div className="font-bold">Malam</div>
            </div>

            {Object.entries(formatPrefWaktu(data).jadwal).map(([day, times]) => (
              <div className="grid grid-cols-3 gap-4 mb-4" key={day}>
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
        )}
      </div>
    </div>
  );
};

export default TimeModal;
