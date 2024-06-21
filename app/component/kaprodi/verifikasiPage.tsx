'use client'

import React, { useEffect, useState } from 'react';
import { fetchRegisteredCourses } from '../functions';


type RegisteredCourse = {
	key: string;
	course: string;
	day: string;
    dosen: string;
	period: string;
	kode: string;
	prodi: string;
	semester: string;
	time: string;
};

interface Proditype {
    programStudi: string
}


const VerifikasiPage = ( {programStudi}: Proditype ) => {
	
	const [registeredCourses, setRegisteredCourses] = useState<RegisteredCourse[]>([]);
    const [sortedCourses, setSortedCourses] = useState<RegisteredCourse[]>([]);
    const [rowIndex, setRowIndex] = useState<number | undefined>();
    const [menu, setMenu] = useState<string>('home');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: keyof RegisteredCourse; direction: 'ascending' | 'descending' } | null>(null);
	const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

	const compareDays = (a: string, b: string) => {
		return dayOrder.indexOf(a) - dayOrder.indexOf(b);
	};

	useEffect(() => {
        const unsubscribe = fetchRegisteredCourses((courses) => {
            setRegisteredCourses(courses);
            setSortedCourses(courses);
        }, programStudi);
        
        return unsubscribe;
    }, [programStudi]);

	const sortData = (key: keyof RegisteredCourse) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });

        const sorted  = [...registeredCourses].sort((a, b) => {
			if (key === 'day') {
				return direction === 'ascending' 
					? compareDays(a[key], b[key]) 
					: compareDays(b[key], a[key]);
			}


            if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
            return 0;
        });

        setSortedCourses(sorted);
    };

	const handlerSendCourse = () => {
        setShowConfirmation(true);
    };

	const handleConfirmation = async (registered: boolean) => {
        setShowConfirmation(false);
		// await addregister(registered)
		if (registered) setMenu('verifikasi');
		if (!registered) setMenu("home")
        
    };
	

	return (
        
		<div className='h-full w-full flex flex-col justify-center px-24 py-24 items-center gap-5'>

            <h1 className='text-4xl text-white'>{programStudi}</h1>

			<div className="h-full w-full min-w-[1330px] flex flex-col items-center rounded-3xl overflow-hidden border-4 border-gray-300">

				<div className='h-full w-full flex flex-col overflow-hidden bg-neutral-800 text-white'>

					<div className='w-full flex py-4 gap-2 px-10'>
					    <div className='w-[3%]'>No</div>
						<div className='w-[10%] cursor-pointer' onClick={() => sortData('kode')}>
					        Kode {sortConfig?.key === 'kode' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
					    </div>
					    <div className='w-[25%] cursor-pointer' onClick={() => sortData('course')}>
					        Mata kuliah {sortConfig?.key === 'course' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
					    </div>
					    <div className='w-[25%] cursor-pointer' onClick={() => sortData('dosen')}>
					        Dosen {sortConfig?.key === 'dosen' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
					    </div>
					    <div className='w-[10%] cursor-pointer' onClick={() => sortData('semester')}>
					        Semester {sortConfig?.key === 'semester' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
					    </div>
					    <div className='w-[12%] cursor-pointer' onClick={() => sortData('period')}>
					        Periode {sortConfig?.key === 'period' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
					    </div>
					    <div className='w-[5%] cursor-pointer' onClick={() => sortData('day')}>
					        Hari {sortConfig?.key === 'day' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
					    </div>
					    <div className='w-[5%] cursor-pointer' onClick={() => sortData('time')}>
					        Waktu {sortConfig?.key === 'time' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
					    </div>
					    <div className='w-[5%]'></div>
					</div>

					<div className='h-full w-[100%] overflow-y-auto flex no-scrollbar'>
    					<div className='w-full'>
					    {sortedCourses.length === 0 ? ( <p>No registered courses available.</p> ) : (
					        <div className='bg-neutral-800 w-[100%]'>
					            {sortedCourses.map((course, index) => ( 
					                <div key={index} className={`flex gap-2 w-full ${index % 2 === 0 ?  'bg-neutral-700 ' : 'bg-neutral-600'} py-2 px-10`}>
					                    <div className='w-[3%]'>{index + 1}</div>
										<div className='w-[10%]'>{course.kode}</div>
					                    <div className='w-[25%]'>{course.course}</div>
					                    <div className='w-[25%]'>{course.dosen}</div>
					                    <div className='w-[10%]'>{course.semester}</div>
					                    <div className='w-[12%]'>{course.period}</div>
					                    <div className='w-[5%]'>{course.day}</div>
					                    <div className='w-[5%]'>{course.time}</div>
					                    <div className='w-[5%] cursor-pointer'>ubah</div>
					                </div>
					            ))}
					        </div>
					    )}
					    </div>						
					</div>
				</div>
			</div>

            <div className='w-full flex justify-end'>
                <button onClick={handlerSendCourse} className='bg-neutral-600 h-20 w-40 rounded-3xl text-white'>Buat Jadwal</button>
            </div>

			{showConfirmation && menu == "home" && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-md text-lg text-neutral-800">
                        <h2 className="text-lg font-bold mb-4">apakah anda ingin memulai pendaftaran</h2>
                        <div className="flex justify-between gap-2">
                            <button onClick={() => handleConfirmation(false)} className="px-4 py-2 w-20 bg-neutral-600 text-white rounded-md" >Tidak</button>
                            <button onClick={() => handleConfirmation(true)} className="px-4 py-2 w-20 bg-green-500 text-white rounded-md"> Ya </button>
                        </div>
                    </div>
                </div>
            )}

			{showConfirmation && menu == "verifikasi" && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-md text-lg text-neutral-800">
                        <h2 className="text-lg font-bold mb-4">apakah anda ingin mengakhiri pendaftaran</h2>
                        <div className="flex justify-between gap-2">
                            <button onClick={() => handleConfirmation(true)} className="px-4 py-2 w-20 bg-neutral-600 text-white rounded-md" >Tidak</button>
                            <button onClick={() => handleConfirmation(false)} className="px-4 py-2 w-20 bg-green-500 text-white rounded-md"> Ya </button>
                        </div>
                    </div>
                </div>
            )}

		</div>
	);
};

export default VerifikasiPage;