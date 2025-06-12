import { useState } from "react";
import { useRealtime } from "../hook/useRealtimeCourses";


type MatkulType = {
    id: number;
    kode: number;
    nama: string;
    sks: number;
    semester: number;
	prodi: number;
};

type props = {
    isOpen: boolean;
    onResult: (matkul: MatkulType) => void;
    onClose: () => void;
}

const MatkulModal = ({isOpen, onResult, onClose}: props) => {

    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

    const [matkul, setMatkul] = useState<MatkulType>({
        id: 0,
        kode: 0,
        nama: '',
        sks: 0,
        semester: 0,
        prodi: 0,
        
    });

    const { data: ProdiData } = useRealtime('prodi', {
		orderBy: { column: 'id', ascending: true },
	});

    const { data: CourseData } = useRealtime('mata_kuliah', {
		filters: [{ column: 'prodi', value: matkul.prodi }, { column: 'semester', value: matkul.semester }],
		orderBy: { column: 'id', ascending: true },
	});

    const result = () => {
        const selectedCourse = CourseData.find((course) => course.id === matkul.id);       

        if (selectedCourse) {
            const updatedMatkul = {
                ...matkul,
                kode: selectedCourse.kode,
                nama: selectedCourse.nama,
                sks: selectedCourse.sks,
            };

            setMatkul(updatedMatkul);
            console.log(updatedMatkul);

            onResult(updatedMatkul);
        } else {
            console.log('mata kuliah tidak ada');
        }
    };


    const inputFields = [
        {
            label: "Program Studi",
            name: "prodi",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options: ProdiData.map((prodi: any) => ({ value: prodi.id, label: prodi.nama })),
        },
        {
            label: "Semester",
            name: "semester",
            options: semesters.map((sem) => ({ value: sem, label: `Semester ${sem}` })),
        },
        {
            label: "Mata Kuliah",
            name: "id",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options: CourseData.map((course: any) => ({ value: course.id, label: course.nama })),
        },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;

        // daftar field yang butuh dikonversi ke number
        const numberFields = ["prodi", "semester", "id"];

        setMatkul((prev) => ({
            ...prev,
            [name]: numberFields.includes(name) ? parseInt(value, 10) : value,
        }));
    };

    return isOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded min-w-32 max:w-1/3">
                <h2 className="text-lg font-bold mb-4">Tambah Jadwal</h2>
                <div className="flex flex-col gap-3">
                    {inputFields.map((field) => (
                        <label key={field.name}>
                            {field.label}
                            <select name={field.name} value={matkul[field.name as keyof MatkulType] || ''} onChange={handleChange} className="border border-gray-300 px-2 py-1 rounded w-full" required >
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
                        <button onClick={() => onClose()} className="px-3 py-1 bg-gray-500 text-white rounded">Batal</button>
                        <button onClick={() => result()} className="px-3 py-1 bg-blue-500 text-white rounded">Tambah</button>
                    </div>
                </div>
            </div>
        </div>
    ) : null
}

export default MatkulModal;