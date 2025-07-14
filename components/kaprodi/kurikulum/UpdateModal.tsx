'use client';

import { updateData } from "@/utils/functions";
import { useEffect, useState } from "react";

type Course = {
    id: number;
    kode: number;
    nama: string;
    sks: number;
    semester: number;
};

type Props = {
    open: boolean;
    course: Course;
    onClose: () => void;
    onSuccess: () => void;
};

const UpdateModal = ({ open, course, onClose, onSuccess }: Props) => {

    // State untuk input form
    const [formData, setFormData] = useState<Course>({ 
        id: course.id, kode: course.kode, nama: course.nama, semester: course.semester,  sks: course.sks,  
	}); 

    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

    const inputFields = [
		{ label: "Kode Mata Kuliah", placeholder: 'kode matkul', name: "kode", type: "number", required: true },
		{ label: "Nama Mata Kuliah", placeholder: 'nama matkul', name: "nama", type: "text", required: true },
		{ label: "Sks", name: "sks", placeholder: 'sks matkul', type: "number", required: true },
	];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));		
	};

    useEffect(() => {
        if (course) {
            setFormData({ 
                id: course.id, kode: course.kode, nama: course.nama, semester: course.semester, sks: course.sks,
            });
        }
    }, [course]);

	const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            kode: formData.kode,
            nama: formData.nama,
            semester: Number(formData.semester),
            sks: Number(formData.sks),
        };

        const result = await updateData({
            table: 'mata_kuliah',
            payload,
            filters: [{ column: 'id', value: formData.id }],
        });

        if (result.success) {
            console.log('Berhasil update:', result);
            onSuccess();
            onClose();
        } else {
            console.error('Gagal update:', result.message);
        }
    };

    return open ? (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
			<div className="bg-white p-5 rounded shadow-lg text-xs">
				<h2 className="text-sm mb-5">perbarui Mata Kuliah</h2>
				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<div className="flex flex-col gap-2">
						{/* Dropdown for Semester */}
						<div className="flex flex-col gap-1">
							<label className="block text-sm font-medium">Semester</label>
							<select name="semester" className="border border-gray-300 px-2 py-1 focus:outline-none rounded w-full" value={formData.semester}  onChange={handleInputChange}  required >
								{semesters.map((semester, index) => (
									<option key={index} value={semester} className="text-lg">
										{semester}
									</option>
								))}
							</select>
						</div>
						{inputFields.map((field) => (
							<div className="flex flex-col gap-1" key={field.name}>
								<label className="block text-sm font-medium">{field.label}</label>
								<input className="border border-gray-300 px-2 py-1 focus:outline-none rounded w-full" placeholder={field.placeholder} type={field.type} name={field.name} autoComplete="off" value={formData[field.name as keyof typeof formData] || ""} onChange={handleInputChange} required={field.required} />
							</div>
						))}
					</div>
					<div className="flex gap-4">
						<button type="submit" className="bg-blue-500 text-white px-2 py-2 rounded">Simpan</button>
						<button type="button" className="bg-gray-300 px-2 py-2 rounded" onClick={onClose}>Batal</button>
					</div>
				</form>
			</div>
		</div>
    ) : null
};

export default UpdateModal;
