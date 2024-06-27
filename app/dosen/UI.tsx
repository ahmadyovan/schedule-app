'use client'
// import { createJSONStorage} from 'zustand/middleware';
import { useEffect, useState } from "react";
import { Courses, Prodi, Semester, Priode, MataKuliah } from "../component/types";
import { fetchAllCourses, sendDataToFirebase} from "../component/functions";
import { useCoursesStore } from '@/app/libs/store';
import { FaTrash } from "react-icons/fa6";
import { db, ref, get, update } from '@/app/libs/firebase/firebase';
import { child, onValue, push, set } from 'firebase/database';
import CustomSelect from "../component/selection";

interface emailtype {
    uid: string | undefined
    namadosen: string
}

export default function DosenUI ({uid, namadosen}: emailtype) {

    const [courses, setCourses] = useState<Courses>({});
    const [selectedSemester, setSelectedSemester] = useState<string>('');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('');
    const [selectedProdi, setSelectedProdi] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<MataKuliah | undefined>(undefined);
    const [selectedDay, setSelectedDay] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const {coursesData, addCourse, removeCourse } = useCoursesStore((state) => state);

    useEffect(() => {
        const unsubscribe = fetchAllCourses(setCourses);
        return unsubscribe;
    }, [selectedProdi]);

    const prodis = Object.keys(courses);
    const semesters = selectedProdi ? Object.keys((courses[selectedProdi] || {}) as Prodi) : [];
    const periods = selectedSemester ? Object.keys((courses[selectedProdi]?.[selectedSemester] || {}) as Semester) : [];
    const courseList = selectedPeriod ? Object.values((courses[selectedProdi]?.[selectedSemester]?.[selectedPeriod] || {}) as Priode).map(course => course['MATA KULIAH']): [];
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum at'];
    const times = ['Pagi', 'Sore'];

    const handleProdiChange = (value: string) => {
        setSelectedProdi(value);
        setSelectedSemester('');
        setSelectedPeriod('');
        setSelectedCourse(undefined);
        setSelectedDay('');
        setSelectedTime('');
    };

    const handleSemesterChange = (value: string) => {
        setSelectedSemester(value);
        setSelectedPeriod('');
        setSelectedCourse(undefined);
        setSelectedDay('');
        setSelectedTime('');
    };

    const handlePeriodChange = (value: string) => {
        setSelectedPeriod(value);
        setSelectedCourse({});
        setSelectedDay('');
        setSelectedTime('');
    };

    const handleCourseChange = (value: string) => {
        const [mataKuliah, kode] = value.split(' - ');
        const selectedCourseObj = Object.values((courses[selectedProdi]?.[selectedSemester]?.[selectedPeriod] || {}) as Priode)
            .find(course => course['MATA KULIAH'] === mataKuliah && course['KODE'] === kode);
        setSelectedCourse(selectedCourseObj);
        setSelectedDay('');
        setSelectedTime('');
    };

    const handleDayChange = (value: string) => {
        setSelectedDay(value);
        setSelectedTime('');
    };

    const handleTimeChange = (value: string) => {
        setSelectedTime(value);
    };

    const handleAddCourse = () => {
        console.log(selectedCourse, selectedSemester, selectedPeriod, selectedProdi, selectedDay, selectedTime);
        if (
            !selectedCourse ||
            !selectedSemester ||
            !selectedPeriod ||
            !selectedProdi ||
            !selectedDay ||
            !selectedTime
        ) {
            console.log('tidak boleh kosong');
            return;
        }

        const makeCourse = { 
            prodi: selectedProdi,
            semester: selectedSemester,
            period: selectedPeriod,
            dosenID: uid,
            dosen: namadosen,
            kode: selectedCourse['KODE'] || '',
            course: selectedCourse['MATA KULIAH'] || '',
            day: selectedDay,
            time: selectedTime
        };

        addCourse(makeCourse);

        setSelectedCourse(undefined);
        setSelectedDay('');
        setSelectedTime('');
    };

    const handleRemoveCourse = (index: number) => {
        removeCourse(index);
    };

    const handlerSendCourse = () => {
        setShowConfirmation(true);
    };

    const handleConfirmation = async (confirm: boolean) => {
        setShowConfirmation(false);
    
        if (confirm) {
            try {
                const result = await sendDataToFirebase(coursesData);
                console.log(result);
                await set(ref(db, `registeredUsers/${uid}`), true);
                console.log(`User ${uid} registered successfully`);
                setIsSent(true);
                setTimeout(() => {
                    window.location.reload();
                }, 1000); // 1 second delay
              } catch (error) {
                console.error(error);
              }
        }
    };

    return (
        <div className="h-[90%] w-full bg-green-400 flex justify-center px-36 pb-20 pt-10  text-3xl font-semibold">
            <div className="h-full min-w-[1400px] flex gap-16 flex-col items-center justify-center">
                <div className='text-gray-100'>
                    <h1>MENDAFTAR MATA KULIAH</h1>
                    <h1>TAHUN AJARAN 2024/2025</h1>
                </div>

                <div className="h-full w-full flex flex-col items-center gap-5 text-2xl">
                    <div className="flex gap-8">
                        <CustomSelect name="Prodi" propsvalue={prodis} handlevalue={handleProdiChange} />
                        <CustomSelect name="Semester" propsvalue={semesters} handlevalue={handleSemesterChange} />
                        <CustomSelect name="Periode" propsvalue={periods} handlevalue={handlePeriodChange} />
                        <CustomSelect name="Mata kuliah" propsvalue={courseList} handlevalue={handleCourseChange} />
                        <CustomSelect name="Hari" propsvalue={days} handlevalue={handleDayChange} />
                        <CustomSelect name="Waktu" propsvalue={times} handlevalue={handleTimeChange} />
                        <div className="cursor-pointer" onClick={() => handleAddCourse()}>tambahkan</div>
                    </div>
                    <div className="w-full h-full overflow-hidden border-4 flex flex-col border-green-600  text-gray-300 bg-neutral-800 text-xl">
                        <div className='flex gap-5 px-10 bg-neutral-800 py-4'>
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
                            <div key={index} className={`flex gap-5 ${index % 2 === 0 ? 'bg-neutral-700 ' : 'bg-neutral-600'} px-10 py-2 `}>
                                <div className='w-[16%]'>{course.prodi}</div>
                                <div className='w-[7%]'>{course.semester}</div>
                                <div className='w-[9%]'>{course.period}</div>
                                <div className='w-[40%]'>{course.course} - {course.kode}</div>
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
                        <div className="bg-white text-neutral-800  p-6 rounded-md">
                            <h2 className="text-lg font-bold mb-4">Anda telah berhasil mengirimkan jadwal</h2>
                            <button onClick={() => setIsSent(false)} className="px-4 py-2 bg-green-500 text-white rounded-md">OK</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}