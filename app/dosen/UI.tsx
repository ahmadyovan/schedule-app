'use client'
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useEffect, useState } from "react";
import { Courses, Prodi, Semester, Priode, MataKuliah } from "../component/types";
import { fetchAllCourses, fetchCourses } from "../component/functions";
import CustomSelect from "../component/selection";
import { useCoursesStore } from '@/app/libs/store';
import { FaTrash } from "react-icons/fa6";
import { db, ref } from '@/app/libs/firebase/firebase';
import { child, push, set } from 'firebase/database';
import { setUserId } from 'firebase/analytics';

interface emailtype {
    UID: string | undefined
}

export default function DosenUI ({UID}: emailtype) {

    const [courses, setCourses] = useState<Courses>({});
    const [selectedSemester, setSelectedSemester] = useState<string>('');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('');
    const [selectedProdi, setSelectedProdi] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<string>();
    const [selectedDay, setSelectedDay] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const { coursesData, addCourse, removeCourse } = useCoursesStore((state) => state);

    const useStorage = createJSONStorage(() => sessionStorage);

    useEffect(() => {
        const unsubscribe = fetchAllCourses(setCourses);
        return unsubscribe;
    }, [selectedProdi]);

    const prodis = Object.keys(courses);
    const semesters = selectedProdi ? Object.keys((courses[selectedProdi] || {}) as Prodi) : [];
    const periods = selectedSemester ? Object.keys((courses[selectedProdi]?.[selectedSemester] || {}) as Semester) : [];
    const courseList = selectedPeriod ? Object.values((courses[selectedProdi]?.[selectedSemester]?.[selectedPeriod] || {}) as Priode) : [];
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum at'];
    const times = ['08:00 - 09:40', '10:00 - 11:40', '13:00 - 14:40', '15:00 - 16:40', '17:00 - 18:40'];

    const handleProdiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProdi(e.target.value);
        setSelectedSemester('');
        setSelectedPeriod('');
        setSelectedCourse('');
        setSelectedDay('');
        setSelectedTime('');
    };

    const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSemester(e.target.value);
        setSelectedPeriod('');
        setSelectedCourse('');
        setSelectedDay('');
        setSelectedTime('');
    };

    const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPeriod(e.target.value);
        setSelectedCourse('');
        setSelectedDay('');
        setSelectedTime('');
    };

    const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCourse(e.target.value);
        setSelectedDay('');
        setSelectedTime('');
    };

    const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDay(e.target.value);
        setSelectedTime('');
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTime(e.target.value);
    };

    


    const handleAddCourse  = () => {
        if (
            !selectedSemester ||
            !selectedPeriod ||
            !selectedProdi ||
            !selectedCourse ||
            !selectedDay ||
            !selectedTime
        ) {
            // Tampilkan pesan error atau lakukan tindakan lain jika ada nilai yang kosong
            return;
        }
    
        const makeCourse = {
            prodi: selectedProdi,
            semester: selectedSemester,
            period: selectedPeriod,
            course: selectedCourse,
            day: selectedDay,
            time: selectedTime
        };
    
        addCourse(makeCourse);
    
        // Reset nilai setelah menambahkan course
        setSelectedCourse(undefined);
        setSelectedDay('');
        setSelectedTime('');
    };

    const handleRemoveCourse = (index: number) => {
        removeCourse(index);
    };

    const handlerSendCourse = () => {
        console.log('fffffffffffffffff');
        
        setShowConfirmation(true);
    };

    const handleConfirmation = (confirm: any) => {
        setShowConfirmation(false);
    
        if (confirm) {
          sendDataToFirebase();
          setIsSent(true);
        }
    };

    const sendDataToFirebase = () => {
        if (!UID) return
        const coursesRef = ref(db, 'registeredCourses');
        coursesData.forEach((course) => {
          const newCourseRef = push(child(coursesRef, UID));
          set(newCourseRef, course);
        });
        console.log("berhasil menyimpan");
        
    };



    return (
        <div className="h-[90%] w-full bg-green-400 flex flex-col items-center justify-center px-36 pb-20 pt-10 gap-16 text-3xl font-semibold">
            <div className='text-gray-100'>
                <h1>MENDAFTAR MATA KULIAH</h1>
                <h1>TAHUN AJARAN 2024/2025</h1>
            </div> 
            <div className="h-[60%] w-full flex flex-col items-center gap-5 text-2xl">
                <div className="flex gap-8">
                    <div className='flex gap-5 '>
                        <select className="w-60 py-1 px-2 bg-neutral-600 text-white" id="prodi" value={selectedProdi} onChange={handleProdiChange}>
                            {!selectedProdi && <option value="">Prodi</option>}
                            {prodis.map(prodi => (
                                <option key={prodi} value={prodi}>
                                    {prodi}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='flex gap-5'>
                        <select className="w-44 py-1 px-2 bg-neutral-600 text-white" id="semester" value={selectedSemester} onChange={handleSemesterChange}>
                            {!selectedSemester && <option value="">Semester</option>}
                            {semesters.map(semester => (
                                <option key={semester} value={semester}>
                                    {semester}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='flex gap-5'>
                        <select className="w-44 py-1 px-2 bg-neutral-600 text-white" id="period" value={selectedPeriod} onChange={handlePeriodChange}>
                            <option value="">Periode</option>
                            {periods.map(period => (
                                <option key={period} value={period}>
                                    {period}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='flex gap-5'>
                        <select className="w-64 py-1 px-2 bg-neutral-600 text-white" id="course" value={selectedCourse} onChange={handleCourseChange}>
                            <option value="">Matakuliah</option>
                            {courseList.map((course) => (
                                <option key={course.KODE} value={course['MATA KULIAH']}>
                                    {course['MATA KULIAH']}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='flex gap-5'>
                        <select className="w-44 py-1 px-2 bg-neutral-600 text-white" id="day" value={selectedDay} onChange={handleDayChange}>
                            <option value="">Hari</option>
                            {days.map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='flex gap-5'>
                        <select className="w-48 py-1 px-2 bg-neutral-600 text-white" id="time" value={selectedTime} onChange={handleTimeChange}>
                            <option value="">Waktu</option>
                            {times.map((time) => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="cursor-pointer" onClick={handleAddCourse}>tambahkan</div>
                </div>
                <div className="w-full h-full overflow-hidden border-4 flex flex-col border-green-600  text-gray-300 bg-neutral-800">
                    
                    <div className='h-20 flex gap-5 px-10 bg-neutral-800 py-3'>
                        <div className='w-[16%]'>prodi</div>
                        <div className='w-[7%]'>semester</div>
                        <div className='w-[9%]'>periode</div>
                        <div className='w-[40%]'>Matakuliah</div>
                        <div className='w-[9%]'>hari</div>
                        <div className='w-[11%]'>waktu</div>
                        <div className='w-[3%]'></div>
                    </div>
                    <div className='h-full overflow-y-auto'>
                    {coursesData.map((course, index) => (
                        <div key={index} className={`flex gap-5 ${index % 2 === 0 ? 'bg-neutral-700 ' : 'bg-neutral-600'} px-10 py-2`}>
                            <div className='w-[16%]'>{course.prodi}</div>
                            <div className='w-[7%]'>{course.semester}</div>
                            <div className='w-[9%]'>{course.period}</div>
                            <div className='w-[40%]'>{course.course}</div>
                            <div className='w-[9%]'>{course.day}</div>
                            <div className='w-[11%]'>{course.time}</div>
                            <div className='w-[3%]'>
                                <button className='w-full' onClick={() => handleRemoveCourse(index)}>
                                <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                    </div>
                </div> 
            </div>
            <div className='w-full flex justify-end'>
                <button onClick={handlerSendCourse}>Kirim</button>
            </div>
            {showConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-md text-lg text-neutral-800">
                        <h2 className="text-lg font-bold mb-4">Apakah Anda yakin?</h2>
                        <div className="flex justify-between gap-2">
                            <button onClick={() => handleConfirmation(false)} className="px-4 py-2 w-20 bg-neutral-600 text-white rounded-md" >Tidak</button>
                            <button onClick={() => handleConfirmation(true)} className="px-4 py-2 w-20 bg-green-500 text-white rounded-md"> Ya </button>
                        </div>
                    </div>
                </div>
            )}

            {isSent && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-md">
                        <h2 className="text-lg font-bold mb-4">Anda telah berhasil mengirimkan jadwal</h2>
                        <button onClick={() => setIsSent(false)} className="px-4 py-2 bg-green-500 text-white rounded-md">OK</button>
                    </div>
              </div>
            )}
        </div>
    )
}

// const handleValueChange = (value: string) => console.log(value);
//     const handleValueChange2 = (value: string) => console.log(value);

    // {/* <CustomSelect propsvalue={prodis} handlevalue={handleValueChange} />
    //                 <CustomSelect propsvalue={semesters} handlevalue={handleValueChange2} /> */}