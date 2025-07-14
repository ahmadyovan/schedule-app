'use client';

import { Tables } from '@/types/supabase';
import { useSupabaseTableData } from '../hook/useTableData';
import { useMemo, useState } from 'react';

type Course = Tables<'mata_kuliah'>;
type CoursePartial = Pick<Course, 'id' | 'kode' | 'nama' | 'sks' | 'semester' | 'prodi'>;

type Props = {
  isOpen: boolean;
  onResult: (matkul: CoursePartial) => void;
  onClose: () => void;
};

const MatkulModal = ({ isOpen, onResult, onClose }: Props) => {
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

	const [selected, setSelected] = useState<CoursePartial>({ id: 0, kode: 0, nama: '', sks: 0, semester: 0, prodi: 0 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  const filtersMatkul = useMemo(
	() => [
		{ column: 'prodi', value: selected.prodi },
		{ column: 'semester', value: selected.semester }
	],
	[selected.prodi, selected.semester]
	);

	const { data: raw_matktul } = useSupabaseTableData<Tables<'mata_kuliah'>>(
		'mata_kuliah', { filters: filtersMatkul }
	);

  const { data: raw_prodi } = useSupabaseTableData<Tables<'prodi'>>(
		'prodi'
	);
	

  const result = () => {
    const selectedCourse = raw_matktul.find((course) => course.id === selected.id);

    if (selectedCourse) {
      const updatedMatkul = {
        ...selected,
        kode: selectedCourse.kode,
        nama: selectedCourse.nama,
        sks: selectedCourse.sks,
      };

      setSelected(updatedMatkul);
      onResult(updatedMatkul);
    } else {
      console.log('Mata kuliah tidak ditemukan');
    }
  };

  const inputFields = [
    {
      label: 'Program Studi',
      name: 'prodi',
      options: raw_prodi.map((prodi) => ({
        value: prodi.id,
        label: prodi.nama,
      })),
    },
    {
      label: 'Semester',
      name: 'semester',
      options: semesters.map((sem) => ({
        value: sem,
        label: `Semester ${sem}`,
      })),
    },
    {
      label: 'Mata Kuliah',
      name: 'id',
      options: raw_matktul.map((course) => ({
        value: course.id,
        label: course.nama,
      })),
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numberFields = ['prodi', 'semester', 'id'];

    setSelected((prev) => ({
      ...prev,
      [name]: numberFields.includes(name) ? parseInt(value, 10) : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-4 rounded min-w-32 max:w-1/3">
        <h2 className="text-lg font-bold mb-4">Tambah Jadwal</h2>
        <div className="flex flex-col gap-3">
          {inputFields.map((field) => (
            <label key={field.name}>
              {field.label}
              <select
                name={field.name}
                value={selected[field.name as keyof CoursePartial] || ''}
                onChange={handleChange}
                className="border border-gray-300 px-2 py-1 rounded w-full"
                required
              >
                <option value="" disabled>
                  Pilih {field.label}
                </option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <div className="flex gap-2 justify-end mt-4">
            <button onClick={onClose} className="px-3 py-1 bg-gray-500 text-white rounded">
              Batal
            </button>
            <button onClick={result} className="px-3 py-1 bg-blue-500 text-white rounded">
              Tambah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatkulModal;
