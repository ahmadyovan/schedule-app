import { useCallback, useEffect, useState } from "react";
import { Course } from "../clientfunctions";
import { useUser } from "../hooks/useUser";
import { createClientSupabase } from "@/utils/supabase/client";

interface Jadwal {
    jadwal_course_id: number;
    jadwal_dosen_id: string;
    jadwal_hari: string;
    jadwal_waktu: string;
}

interface AddPopup {
	courseId: AddParam
	onCancel: any
	onSave: (updatedCourse: Jadwal) => void
}

interface User {
    user_id: string
    user_name: string
}

interface AddParam {
	course_id: number
	course_name: string
}

const AddCoursePopup = ({ courseId, onSave, onCancel }: AddPopup) => {
    const [course, setCourse] = useState<AddParam>(courseId);
    
    const [jadwal, setJadwal] = useState<Jadwal>({
        jadwal_course_id: course.course_id,
        jadwal_dosen_id: '',
        jadwal_hari: '',
        jadwal_waktu: ''
    });
    
    const {userData} = useUser()
    const [users, setUsers] = useState<User[]>()
    const supabase = createClientSupabase()
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setJadwal({ ...jadwal, [name]: value });
    };

    const Days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const Time = ['Pagi', 'Malam']

    useEffect(() => {
        if (userData) {
            fetchUsers();
        }
    }, [userData]);

    const fetchUsers = useCallback(async () => {
        if (!userData) return;
	
		const { data, error } = await supabase
			.from('user')
			.select(`*`)
			// .eq('user_prodi', userData.user_prodi.prodi_id)
            .eq('user_job', 'dosen')

		if (data) {
			console.log(data);

            const sortedUsers = data.sort((a, b) => {
                if (a.user_name < b.user_name) return -1;
                if (a.user_name > b.user_name) return 1;
                return 0;
            });
			
			setUsers(sortedUsers);
		}
		if (error) console.error('Error fetching jadwal:', error);
    }, [userData, supabase]);

    const verifi = (jadwal: Jadwal) => {
        if (jadwal.jadwal_dosen_id && jadwal.jadwal_waktu) {
            if (jadwal.jadwal_hari == "") {
                jadwal.jadwal_hari = '["Senin","Selasa","Rabu","Kamis","Jumat"]'
            } 
            onSave(jadwal);
        } else {
            alert('Harap isi semua data yang diperlukan')
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="flex flex-col justify-center items-center gap-3 bg-neutral-700 rounded-lg py-6">
                <div className="">
                    <h2 className="text-xl font-bold mb-4">Buat Jadwal</h2>
                    <p>{course.course_name}</p>
                </div>
                <div className='flex w-full flex-col px-6 gap-2'>
                    <h1>pilih dosen</h1>
                    <select name="jadwal_dosen_id" value={jadwal.jadwal_dosen_id} onChange={handleChange} className='bg-neutral-800 w-72 py-2 px-1 text-white rounded' >
                        <option value="">pilih dosen</option>
                        {users?.map((user) => (
                            <option key={user.user_id} value={user.user_id}>{user.user_name}</option>
                        ))}
                    </select>
                </div>

                <div className='flex w-full flex-col px-6 gap-2'>
                    <h1>pilih hari</h1>
                    <select name="jadwal_hari" value={jadwal.jadwal_hari} onChange={handleChange} className='bg-neutral-800 w-full py-2 px-1 text-white rounded' >
                        <option value="">pilih hari</option>
                        {Days.map((day) => (
                            <option key={day} value={day}>{day}</option>
                        ))}
                    </select>
                </div>
                
                <div className='flex w-full flex-col px-6 gap-2'>
                    <h1>pilih waktu</h1>
                    <select name="jadwal_waktu" value={jadwal.jadwal_waktu} onChange={handleChange} className='bg-neutral-800 w-full py-2 px-1 text-white rounded' >
                        <option value="">pilih waktu</option>
                        {Time.map((time) => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex justify-evenly gap-3 mt-4">
                    <button onClick={onCancel} className="bg-red-500 text-white px-4 py-2 rounded">
                        Batal
                    </button>
                    <button onClick={() => verifi(jadwal)} className="bg-green-500 text-white px-4 py-2 rounded">
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCoursePopup