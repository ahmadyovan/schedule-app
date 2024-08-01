import { useState } from "react";
import { Course } from "../clientfunctions";
import { useUser } from "../hooks/useUser";

interface EditPopup {
	courseData: Omit<Course, 'course_id'>
	onCancel: any
	onSave: (updatedCourse: Omit<Course, 'course_id'>) => void
}

const EditCoursePopup = ({ courseData, onSave, onCancel }: EditPopup) => {
    const [course, setCourse] = useState<Omit<Course, 'course_id'>>(courseData);
    const {userData} = useUser()

    const getSemester = () => {
        if (userData) {
            const prodi = userData.user_prodi.prodi_id;
            return prodi !== 4
                ? ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"]
                : ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6"];
        }
        return [];
    };
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCourse({ ...course, [name]: value });
    };

    const semesters = getSemester();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="flex flex-col gap-3 bg-neutral-700 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Edit Course</h2>
                <div className='flex w-full flex-col gap-2'>
                    <h1>perbarui semester</h1>
                    <select name="course_semester" value={course.course_semester} onChange={handleChange} className='bg-neutral-800 w-36 py-2 px-1 text-white rounded' >
                        <option value="">pilih semester</option>
                        {semesters.map((semester) => (
                            <option key={semester} value={semester}>{semester}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full bg-neutral-600 text-white rounded" >
                    <h1>perbarui kode mata kuliah</h1>
                    <input name="course_kode" value={course.course_kode} onChange={handleChange} placeholder="Kode" />
                </div>
                <div className="w-full bg-neutral-600 text-white rounded">
                    <h1>perbarui nama mata kuliah</h1>
                    <input name="course_name" value={course.course_name} onChange={handleChange} placeholder="Nama" />
                </div>
                
                <div className="w-ful bg-neutral-600 text-white rounded">
                    <h1>perbarui sks mata kuliah</h1>
                    <input name="course_sks" type="number" value={course.course_sks} onChange={handleChange} placeholder="SKS" />
                </div>
                
                <div className="flex justify-evenly gap-2 mt-4">
                    <button onClick={() => onSave(course)} className="bg-green-500 text-white px-4 py-2 rounded">
                        Simpan
                    </button>
                    <button onClick={onCancel} className="bg-red-500 text-white px-4 py-2 rounded">
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditCoursePopup