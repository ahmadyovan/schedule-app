'use client';

import { insertData } from "@/utils/functions";
import { useState } from "react";

interface props {
	open: boolean
	prodi: number;
	onClose: () => void;
	onSuccess: () => void;
}

const InsertModal = ({open, prodi, onClose, onSuccess}: props) => {
  
	const [formData, setFormData] = useState({ 
		kode: "", nama: "", prodi: prodi, semester: '',  sks: '',  
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));		
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const payload = {
			...formData,
			sks: Number(formData.sks),
			semester: Number(formData.semester),
		};

		const result = await insertData({
			table: 'mata_kuliah',
			payload,
		});

		if (result.success) {
			console.log('Course added:', result);
			onSuccess();
			onClose();
		} else {
			console.error('Error inserting course:', result.message);
		}
	};

	const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

	const inputFields = [
		{ label: "Kode Mata Kuliah", name: "kode", type: "text", required: true },
		{ label: "Nama Mata Kuliah", name: "nama", type: "text", required: true },
		{ label: "Sks", name: "sks", type: "number", required: true },
	];

	return open ? (
		<div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
			<div className="bg-white p-5 rounded shadow-lg text-xs">
				<h2 className="text-sm mb-5">Tambah Mata Kuliah</h2>
				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<div className="flex flex-col gap-2">
						<div className="flex flex-col gap-1">
							<label className="block text-sm font-medium">Semester</label>
							<select name="semester" className="border border-gray-300 px-2 py-1 focus:outline-none rounded w-full" value={formData.semester}  onChange={handleInputChange}  required >
								<option value={''}>
									pilih semester
								</option>
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
								<input className="border border-gray-300 px-2 py-1 focus:outline-none rounded w-full" type={field.type} name={field.name} autoComplete="off" value={formData[field.name as keyof typeof formData] || ""} onChange={handleInputChange} required={field.required} />
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

export default InsertModal;
