'use client'

import { SetStateAction, useCallback, useEffect, useState } from "react";
import { addCourse, updateCourse, deleteCourse, Course, setupRealtimeSubscription } from '@/app/component/clientfunctions'
import { useUser } from "../hooks/useUser";
import { createClientSupabase } from "@/utils/supabase/client";
import EditCoursePopup from "./EditCoursePopup";
import SearchInput from "./SearchInput";
import { Input } from "postcss";

const Checkbox = ({ label, checked, onChange }: any) => {
    return (
		<label>
			<input type="checkbox" checked={checked} onChange={onChange} />
			{label}
		</label>
    );
};

interface Kelas {
	id: number
	prodi: number
	semester: string,
	pagi: number,
	malam: number
}

const CoursesTable = () => {

    const [courses, setCourses] = useState<Course[]>([]);
    const [newCourse, setNewCourse] = useState<Omit<Course, 'course_id'>>({ course_kode: '', course_name: '', course_sks: 0, course_semester: '', course_prodi: 0 });
    const [edit, setEdit] = useState<boolean>();
    const [editCourse, setEditCourse] = useState<Omit<Course, 'course_id'>>({ course_kode: '', course_name: '', course_sks: 0, course_semester: '', course_prodi: 0 });
	const [editCourseId, setEditCourseId] = useState<number>(0);
    const [isCheckedGanjil, setIsCheckedGanjil] = useState(true);
    const [isCheckedGenap, setIsCheckedGenap] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
	const [form, setForm] = useState<boolean>(false)
	const [editingId, setEditingId] = useState<number | null>(null);
    const [modeEdit, setModeEdit] = useState<boolean>(false);
	const [kelas, setKelas] = useState<Kelas[]>()
	const [editableKelas, setEditableKelas] = useState<Kelas[]>([]);
	const [editedPagi, setEditedPagi] = useState<number | ''>(0); // For the pagi input
    const [editedMalam, setEditedMalam] = useState<number | ''>(0); // For the malam input

	const supabase = createClientSupabase()
	const {userData} = useUser()	

	const loadCourses = useCallback(async () => {
        if (!userData) return;

        const { data, error } = await supabase
            .from('course')
            .select('*')
            .eq('course_prodi', userData.user_prodi.prodi_id);

        if (data) {
          console.log(data);
          
            setCourses(data);
        }
        if (error) console.error('Error fetching course:', error);
    }, [userData, supabase]);

	
  
    useEffect(() => {
        loadCourses();

        let unsubscribe: (() => void) | undefined;

        const setup = async () => {
            unsubscribe = await setupRealtimeSubscription(loadCourses);
        };

        setup();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [loadCourses]);

    const isGanjil = (semester: string) => {
		const number = parseInt(semester.split(' ')[1]);
		return number % 2 !== 0;
    };
    
    const isGenap = (semester: string) => {
		const number = parseInt(semester.split(' ')[1]);
		return number % 2 === 0;
    };

	
    
     // Filter courses based on selected checkboxes
	 const filteredCourses = courses.filter(course => {
		const isSemesterMatch = 
		  (isCheckedGanjil && isGanjil(course.course_semester)) || 
		  (isCheckedGenap && isGenap(course.course_semester));
	  
		const isSearchMatch = 
		  searchTerm === '' || 
		  course.course_kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
		  course.course_name.toLowerCase().includes(searchTerm.toLowerCase());
	  
		return isSemesterMatch && isSearchMatch;
	  });

	  const getUniqueSemesters = (courses: Course[]) => {
		return Array.from(new Set(courses.map(course => course.course_semester)))
		  .sort((a, b) => {
			const aNum = parseInt(a.split(' ')[1]);
			const bNum = parseInt(b.split(' ')[1]);
			return aNum - bNum;
		  });
	  };


	  const getfilterkelas = (data: Kelas[], uniqueSemesters: string[]) => {
		return data.filter(kelas => uniqueSemesters.includes(kelas.semester));
	  };

	  const loadkelas = useCallback(async () => {
		if (!userData) return;
			  
		const { data, error } = await supabase
		  .from('kelas')
		  .select('*')
		  .eq('prodi', userData.user_prodi.prodi_id);
	  
		if (data) {

		  const uniqueSemesters = getUniqueSemesters(filteredCourses);
		  const filteredKelas = getfilterkelas(data, uniqueSemesters);
		
		  setKelas(filteredKelas);
		}
		if (error) console.error('Error fetching kelas:', error);
	  }, [userData, supabase, filteredCourses]);

	  useEffect(() => {
		loadkelas();
	  }, [loadkelas, filteredCourses]);


  // Function to check if a semester is ganjil
  

    const handleCheckboxChange = (type: any) => {
        if (type === 'ganjil') {
          setIsCheckedGanjil(!isCheckedGanjil);
        } else if (type === 'genap') {
          setIsCheckedGenap(!isCheckedGenap);
        }
    };
    
    // Handle search term change
    const handleSearch = (term: SetStateAction<string>) => {
      	setSearchTerm(term);
    };

    const handleModeEdit = () => {
        setModeEdit(!modeEdit);
    }

    const handleAddCourse = async () => {
		try {
			console.log(userData?.user_prodi.prodi_id);
			
			setNewCourse({ ...newCourse, course_prodi: userData?.user_prodi.prodi_id })
			await addCourse(newCourse);
			setNewCourse({ course_kode: '', course_name: '', course_sks: 0, course_semester: '', course_prodi: userData?.user_prodi.prodi_id });
		} catch (error) {
			console.error('Error adding course:', error);
		}
    };
  
    const handleUpdateCourse = async (id: number, updatedCourse: Partial<Course>) => {
		try {
			await updateCourse(id, updatedCourse);
			setEdit(false)
		} catch (error) {
			console.error('Error updating course:', error);
		}
    };
  
    const handleDeleteCourse = async (id: number) => {
		try {
			await deleteCourse(id);
		} catch (error) {
			console.error('Error deleting course:', error);
		}
    };

	const handleEnterEditMode = (id: number) => {
		setEditingId(id);
		setEditableKelas(kelas?.map(k => ({ ...k })) || []);
	};

	const handleEditKelas = (id: number, field: 'pagi' | 'malam', value: string) => {
		const updatedKelas = editableKelas.map(kelas => 
		  kelas.id === id ? { ...kelas, [field]: parseInt(value) || 0 } : kelas
		);
		setEditableKelas(updatedKelas);
	};

	const handleSaveKelas = async (id: number) => {
		try {
		  const kelasToUpdate = editableKelas.find(k => k.id === id);
		  if (!kelasToUpdate) return;
	  
		  const { data, error } = await supabase
			.from('kelas')
			.update({ 
			  pagi: kelasToUpdate.pagi, 
			  malam: kelasToUpdate.malam 
			})
			.eq('id', id);
	  
		  if (error) throw error;
	  
		  setKelas(prevKelas => prevKelas?.map(k => k.id === id ? kelasToUpdate : k) || []);
		  setEditingId(null);  // Reset editing state
		} catch (error) {
		  console.error('Error saving kelas:', error);
		}
	  };

    return (
        <div className="h-full px-32 flex justify-center flex-col items-center overflow-hidden gap-10">
            <h1 className="text-2xl font-bold">PENDAFTARAN MATA KULIAH TAHUN 2024/2025</h1>
            <div className="min-h-[550px] min-w-[1330px]  w-full h-[65%] flex flex-col items-center overflow-y-auto px-5">
                <div className="h-fit w-full flex flex-col sticky top-0">
                    <div className="w-full flex bg-neutral-700 pt-5 pb-3 justify-between px-5">
                        <div className="flex gap-5 py-3">
                            <Checkbox
                              label="Ganjil"
                              checked={isCheckedGanjil}
                              onChange={() => handleCheckboxChange('ganjil')}
                            />
                            <Checkbox
                              label="Genap"
                              checked={isCheckedGenap}
                              onChange={() => handleCheckboxChange('genap')}
                            />
                        </div>
                        <div className="flex gap-5">
                            <button className="py-2 bg-blue-500 px-2 rounded-md" onClick={() => setForm(true)}>pembagian jadwal</button>
                            <SearchInput onSearch={handleSearch} />
                            <button className="py-2 bg-blue-500 px-2 rounded-md" onClick={() => {handleModeEdit()}}>mode edit</button>
                        </div>
                    </div>
                    <div className="w-full bg-neutral-800 pb-5 pt-3 flex items-center px-5 gap-5">
                        <div className="w-[5%]">no</div>
                        <div className="w-[10%]">Kode</div>
                        <div className="w-[50%]">Nama</div>
                        <div className="w-[5%]">SKS</div>
                        <div className="w-[15%]">Semester</div>
                        <div className="w-[15%]"></div>
                    </div>
                </div>
                

                <div className="w-full">
                    <div className="">
                        {filteredCourses.map((course, index) => (
                            <div key={course.course_id} className={`flex w-full items-center hover:border-neutral-300 hover:border-2 ${index % 2 === 0 ? 'bg-neutral-700 ' : 'bg-neutral-600'} px-5 gap-5 h-14`}>
                                <div className="w-[5%]">{index + 1}</div>
                                <div className="w-[10%]">{course.course_kode}</div>
                                <div className="w-[50%]">{course.course_name}</div>
                                <div className="w-[5%]">{course.course_sks}</div>
                                <div className="w-[15%]">{course.course_semester}</div>
                                <div className="w-[15%] flex">
                                    { modeEdit == true &&(<div className="w-full flex justify-between">
                                        <button onClick={() => { setEdit(true); setEditCourse(course); setEditCourseId(course.course_id); }} className="bg-blue-500 w-[44%] text-white px-2     py-1 rounded">
									        Ubah
									    </button>
                                        <button onClick={() => handleDeleteCourse(course.course_id)} className="bg-red-500 w-[44%] text-white px-2 py-1 rounded">
                                            Hapus
                                        </button>
                                    </div>)}
									
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
				{ filteredCourses.length > 0 &&(<div className="w-full sticky bottom-0 top-0 px-5 bg-neutral-800 py-5">
                        {modeEdit == true &&(<div className="w-full flex gap-5">
                            <div className="w-[5%]"></div>
                            <input placeholder="Kode" value={newCourse.course_kode || ''} onChange={(e) => setNewCourse({ ...newCourse, course_kode: e.target.value })} className="border w-[10%] py-2 rounded bg-neutral-600 text-white " />
                            <input placeholder="Nama" value={newCourse.course_name || ''} onChange={(e) => setNewCourse({ ...newCourse, course_name: e.target.value })} className="border w-[50%] py-2 rounded bg-neutral-600 text-white" />
                            <input type="number" placeholder="SKS" value={newCourse.course_sks || ''} onChange={(e) => setNewCourse({ ...newCourse, course_sks: parseInt(e.target.value) })} className="border w-[5%] py-2 rounded bg-neutral-600 text-white" />
                            <input placeholder="Semester" value={newCourse.course_semester || ''} onChange={(e) => setNewCourse({ ...newCourse, course_semester: e.target.value })} className="border w-[15%] py-2 rounded bg-neutral-600 text-white" />
                            <button onClick={handleAddCourse} className="bg-green-500 w-[15%] py-2 text-white px-4 rounded">
                                Tambah
                            </button>
                        </div>)}
                    </div>)}
            </div>
			
			{form &&(
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6">
            		<div className="flex flex-col justify-center items-center gap-3 bg-neutral-700 rounded-lg py-6">
						<div>pembagian jadwal</div>
						<div className="flex flex-col gap-5">
							<div className="flex gap-5 px-5">
								<div className="w-40">Semester</div>
								<div className="w-16">Pagi</div>
								<div className="w-16">Malam</div>
								<div className="w-20"></div>
							</div>
							<div className="h-60 overflow-hidden">
								<div className="h-full overflow-auto">
								{kelas?.map((kelas) => (
									<div key={kelas.id} className="flex w-full items-center hover:border-neutral-300 hover:border-2 bg-neutral-700 px-5 gap-5 h-14">
										<div className="w-40 py-1">{kelas.semester}</div>
										<div className="w-16">
										{editingId === kelas.id ? (
											<input type="number" value={editableKelas.find(k => k.id === kelas.id)?.pagi || kelas.pagi} onChange={(e) => handleEditKelas(kelas.id, 'pagi', e.target.value)} className="w-full bg-neutral-600 text-white" />
										) : (
											kelas.pagi
										)}
										</div>
										<div className="w-16">
										{editingId === kelas.id ? (
											<input type="number" value={editableKelas.find(k => k.id === kelas.id)?.malam || kelas.malam} onChange={(e) => handleEditKelas(kelas.id, 'malam', e.target.value)} className="w-full bg-neutral-600 text-white" />
										) : (
											kelas.malam
										)}
										</div>
										<div>
										{editingId === kelas.id ? (
											<button onClick={() => handleSaveKelas(kelas.id)} className="bg-green-500 w-full text-white px-2 py-1 rounded">
											Simpan
											</button>
										) : (
											<button onClick={() => handleEnterEditMode(kelas.id)} className="bg-blue-500 w-full text-white px-2 py-1 rounded">
											Ubah
											</button>
										)}
										</div>
									</div>
								))}
								</div>
							</div>
							<button className="py-2 bg-red-500 px-2 rounded-md text-black" onClick={() => setForm(false)}>kembali</button>
						</div>
					</div>
				</div>
			)}

            {edit && (
                <EditCoursePopup
                    courseData={editCourse}
                    onSave={(updatedCourse) => handleUpdateCourse(editCourseId, updatedCourse)}
                    onCancel={() => setEdit(false)}
                />
            )}
            <div className="w-full flex justify-end">
                <button className="bg-green-500 w-[10%] py-3 text-white px-2 rounded-md">
                    Buka Pengajuan
                </button>
            </div>
        </div>
    );
};

  
  export default CoursesTable;