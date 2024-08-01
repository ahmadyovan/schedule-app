'use client'

import React, { useState, useEffect } from 'react'
import { createClientSupabase } from '@/utils/supabase/client'
import { Tables } from '@/app/component/types/supabase'
import { useCourseStore } from './registeredCourseStore'
import { useUser } from '../component/hooks/useUser'

interface kelasType {
    id: number
    prodi: number
    semester: number
    pagi: number
    malam: number
}

interface Waktu {
    waktu: string
    kelas: string
}

const Interface = () => {
    const [prodis, setProdis] = useState<Tables<'prodi'>[]>([])
    const [semesters, setSemesters] = useState<string[]>([])
    const [courses, setCourses] = useState<Tables<'course'>[]>([])
    const [kelas, setKelas] = useState<kelasType[]>([])
    const [selectedProdi, setSelectedProdi] = useState<number | null>(null)
    const [selectedSemester, setSelectedSemester] = useState<string | null>(null)
    const [selectedCourse, setSelectedCourse] = useState<number | null>(null)
    const [selectedTime, setSelectedTime] = useState<Waktu>()
    const [selectedDays, setSelectedDays] = useState<string[]>([])
    const [formAdd, setFormAdd] = useState<boolean>(false)
    const { user, userData, loading, error } = useUser();
    

    const supabase = createClientSupabase()
    const { registeredCourses, addCourse, removeCourse, clearCourses } = useCourseStore()

    useEffect(() => {
        fetchProdis()
    }, [])

    useEffect(() => {
        if (selectedProdi) {

            fetchSemesters()
        }
    }, [selectedProdi])

    useEffect(() => {
        if (selectedProdi && selectedSemester) {
            fetchCourses()
        }
    }, [selectedProdi, selectedSemester])

    useEffect(() => {
        if (selectedCourse) {
            fetchTime()
        }
    }, [selectedCourse, selectedSemester])

    const fetchProdis = async () => {
            const { data, error } = await supabase.from('prodi').select('*')
            if (error) console.error('Error fetching prodis:', error)
            else setProdis(data)
    }

    const fetchSemesters = async () => {
        const { data, error } = await supabase
            .from('course')
            .select('course_semester')
            .eq('course_prodi', selectedProdi);

            const dataSemester = data
        
        if (error) {
            console.error('Error fetching semesters:', error)
        } else {
            if (!dataSemester) return

            const { data, error } = await supabase
            .from('pendaftaran')
            .select('semester')
            .eq('id', 1)

            if (!data) return

            const filterType = data[0].semester;

            const uniqueSemesters = Array.from(new Set(dataSemester
                .map(item => item.course_semester)
                .filter((semester): semester is string => semester != null)
            ))
    
            const filteredSemesters = uniqueSemesters.filter(semester => {
                const semesterNumber = parseInt(semester.split(' ')[1]);
                if (filterType === 'genap') {
                    return semesterNumber % 2 === 0;
                } else if (filterType === 'gasal') {
                    return semesterNumber % 2 !== 0;
                }
                return true; // 'all' case
            });
    
            setSemesters(filteredSemesters);
        }
    }


    const fetchCourses = async () => {
        const { data, error } = await supabase
        .from('course')
        .select('*')
        .eq('course_prodi', selectedProdi)
        .eq('course_semester', selectedSemester)
        if (error) console.error('Error fetching courses:', error)
        else setCourses(data)
    }

    const fetchTime = async () => {
        const { data, error } = await supabase
        .from('kelas')
        .select('*')
        .eq('prodi', selectedProdi)
        .eq('semester', selectedSemester)
        if (error) console.error('Error fetching courses:', error)
        else setKelas(data)
        console.log(data);
        
    }

    const handleDayChange = (day: string) => {
        setSelectedDays(prev =>
        prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        )
    }

    const handleAddCourse = () => {
        if (selectedCourse && selectedTime) {
          const course = courses.find(c => c.course_id === selectedCourse)
          if (course) {
            addCourse({
                course_semester: course.course_semester,
                course_kode: course.course_kode,
                course_name: course.course_name,
                course_waktu: selectedTime.waktu,
                course_id: course.course_id,
                course_sks: course.course_sks,
                course_kelas: selectedTime.kelas
            })
            setSelectedCourse(null)
            setSelectedTime({waktu: "", kelas: ""})
          }
        }
      }

      const Days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

        const handleSubmit = async () => {                 
            if (userData) {
                if (registeredCourses.length > 0) {
                    const availableDays = Days.filter(day => !selectedDays.includes(day));
                    for (const course of registeredCourses) {
                        const { error } = await supabase.from('jadwal').insert({
                            jadwal_course_id: course.course_id,
                            jadwal_dosen_id: userData.user_id,
                            jadwal_hari: availableDays,
                            jadwal_waktu: course.course_waktu,
                            class: course.course_kelas
                        })
                        if (error) console.error('Error inserting jadwal:', error)
                    }
                    alert('Courses registered successfully!')
                
                    clearCourses()
                }
            }
        }

        const generateOptions = (value: number, type: string) => {
            const options = [];
            for (let i = 1; i <= value; i++) {
                options.push({ waktu: type, kelas: String.fromCharCode(64 + i) }); // Generates 'A', 'B', 'C', etc.
            }
            return options;
        };

        const handleChange = (e: { target: { value: any } }) => {
            const selectedValue = e.target.value;
            try {
                const parsedValue = JSON.parse(selectedValue);
                setSelectedTime(parsedValue);
            } catch (error) {
                console.error('Error parsing selected value:', error);
            }
        };

    return (
        <div className='h-full w-full flex justify-center px-28'>
            <div className="h-full min-w-[1444px] w-full  flex justify-center flex-col items-center gap-10 pb-20">
                <h2 className="text-2xl font-bold">Buat Jadwal Kuliah</h2>
                <div className='w-full min-h-[400px] h-[70%] flex gap-10'>
                    <div className='h-full w-full flex flex-col bg-neutral-800'>
                        <div className='flex items-center gap-5 bg-neutral-700 h-[16%] px-10'>
                            <div className='w-[20%]'>
                                <select value={selectedProdi || ''} onChange={(e) => setSelectedProdi(Number(e.target.value))} className='bg-neutral-800 w-full py-2 px-1'>
                                    <option value="">Select Prodi</option>
                                    {prodis.map((prodi) => (
                                        <option key={prodi.prodi_id} value={prodi.prodi_id}>
                                        {prodi.prodi_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='w-[fit]'>
                                <select value={selectedSemester || ''} onChange={(e) => setSelectedSemester(e.target.value)} className='bg-neutral-800 py-2 px-1'>
                                    <option value="">Select Semester</option>
                                    {semesters.map((semester) => (
                                        <option key={semester} value={semester}>
                                        {semester}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='w-[20%]'>
                                <select value={selectedCourse || ''} onChange={(e) => setSelectedCourse(Number(e.target.value))} className='bg-neutral-800 w-full py-2 px-1'>
                                    <option value="">Select Course</option>
                                    {courses.map((course, index) => (
                                        <option key={index} value={course.course_id}>
                                        {course.course_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='w-[fit]'>
                            <select value={selectedTime ? JSON.stringify(selectedTime) : ''} onChange={handleChange} className="bg-neutral-800 py-2 px-1">
                                <option value="">Select Time</option>
                                {kelas.map((item, index) => (
                                    <React.Fragment key={index}>
                                        {generateOptions(item.pagi, 'Pagi').map((option, idx) => (
                                            <option key={`pagi-${index}-${idx}`} value={JSON.stringify(option)}>
                                                {option.waktu} {option.kelas}
                                            </option>
                                        ))}
                                        {generateOptions(item.malam, 'Malam').map((option, idx) => (
                                            <option key={`malam-${index}-${idx}`} value={JSON.stringify(option)}>
                                                {option.waktu} {option.kelas}
                                            </option>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </select>
                            </div>
                            <button className='bg-green-500 py-2 px-2 rounded-md' onClick={() => handleAddCourse()}>Tambah</button>
                        </div>
                        <div className='flex gap-5 px-5 py-3 bg-neutral-800'>
                            <div className='w-[5%]'>no</div>
                            <div className='w-[10%]'>semester</div>
                            <div className='w-[10%]'>kode</div>
                            <div className='w-[60%]'>matakuliah</div>
                            <div className='w-[5%]'>sks</div>
                            <div className='w-[10%]'>waktu</div>
                            <div className='w-[10%]'></div>
                        </div>
                        <div className='h-full overflow-auto'>
                            <div>
                                {registeredCourses.map((course, index) => (
                                    <div key={index} className={`flex items-center py-2 gap-5 px-5 ${index % 2 === 0 ?  'bg-neutral-700 ' : 'bg-neutral-600'}`}>
                                        <div className='w-[5%]'>{index + 1}</div>
                                        <div className='w-[10%]'>{course.course_semester}</div>
                                        <div className='w-[10%]'>{course.course_kode}</div>
                                        <div className='w-[60%]'>{course.course_name}</div>
                                        <div className='w-[5%]'>{course.course_sks}</div>
                                        <div className='w-[10%]'>{course.course_waktu} {course.course_kelas}</div>
                                        <div className='w-[10%]'>
                                            <button className=' px-2 bg-red-500 rounded-sm'  onClick={() => removeCourse(index)}>Hapus</button>
                                        </div>  

                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className='bg-neutral-600 h-full w-[20%] px-5'>
                        <div className='h-[13%] flex items-center'>
                            <h1>pilih hari libur mengajar</h1>
                        </div>
                        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map((day) => (
                        <label key={day} className='flex gap-2 items-center py-2'>
                            <input className='h-5 w-5' type="checkbox" checked={selectedDays.includes(day)} onChange={() => handleDayChange(day)} />
                            {day}
                        </label>
                        ))}
                    </div>
                </div>
                <div className='w-full flex justify-end'>   
                    <button className='py-3 px-2 bg-green-500 rounded-md' onClick={() => handleSubmit()}>Kirim Jadwal</button>
                </div>
                    
            </div>

            { formAdd && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="flex flex-col justify-center items-center gap-3 bg-neutral-700 rounded-lg py-6">
                        <div>

                        </div>
                        <div>
                            
                        </div>
                    </div>
                </div>
            )}

        </div>
        
    )
}

export default Interface