import React, { useState, useCallback, useMemo } from 'react';
import { useRegisteredCourses } from '@/app/component/hooks/useRegisteredCourse';
import { RegisteredCourse, ExtendedMataKuliah } from '../types';
import { CourseForm } from './courseform';
import useNotRegisteredCourses from '../hooks/useNotRegisteredCourse';
import { db, ref, remove } from '@/app/libs/firebase/firebase';
import { getScheduleFromServer, saveScheduleToFirebase } from '../functions';

interface VerifikasiPageProps {
  programStudi: string;
  onMenuSelect: (menu: 'jadwal') => void;
}

enum CourseIndex {
    KODE,
    PROGRAM_STUDI,
    PERIODE,
    SEMESTER,
    MATA_KULIAH,
    SKS,
    DOSEN,
    HARI,
    WAKTU
}

interface Course {
    [CourseIndex.KODE]: string;
    [CourseIndex.PROGRAM_STUDI]: string;
    [CourseIndex.PERIODE]: string;
    [CourseIndex.SEMESTER]: string;
    [CourseIndex.MATA_KULIAH]: string;
    [CourseIndex.SKS]: string;
    [CourseIndex.DOSEN]: string;
    [CourseIndex.HARI]: string;
    [CourseIndex.WAKTU]: string;
}

type Schedule = {
    [programStudi: string]: Course[];
};

const VerifikasiPage: React.FC<VerifikasiPageProps> = ({ programStudi, onMenuSelect }: VerifikasiPageProps) => {
	const { registeredCourses, isLoading1 } = useRegisteredCourses(programStudi);
	const { notRegisteredCourses, isLoading2} = useNotRegisteredCourses(programStudi);
	const [isLoading, setIsLoading] = useState(false);

	const [activeView, setActiveView] = useState<'registered' | 'notRegistered'>('registered');
	const [sortConfig, setSortConfig] = useState<{ key: keyof RegisteredCourse; direction: 'ascending' | 'descending' } | null>(null);
	const [notRegisteredSortConfig, setNotRegisteredSortConfig] = useState<{ key: keyof ExtendedMataKuliah; direction: 'ascending' | 'descending' } | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [formAction, setFormAction] = useState<'add' | 'update'>('add');
	const [selectedCourse, setSelectedCourse] = useState<ExtendedMataKuliah | RegisteredCourse | null>(null);

	const sortedRegisteredCourses = useMemo(() => {
		const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
		if (!sortConfig) return registeredCourses;
	
		return [...registeredCourses].sort((a, b) => {
		if (sortConfig.key === 'day') {
			return sortConfig.direction === 'ascending'
			? DAYS.indexOf(a[sortConfig.key]) - DAYS.indexOf(b[sortConfig.key])
			: DAYS.indexOf(b[sortConfig.key]) - DAYS.indexOf(a[sortConfig.key]);
		}
	
		if (a[sortConfig.key] < b[sortConfig.key]) {
			return sortConfig.direction === 'ascending' ? -1 : 1;
		}
		if (a[sortConfig.key] > b[sortConfig.key]) {
			return sortConfig.direction === 'ascending' ? 1 : -1;
		}
		return 0;
		});
	}, [registeredCourses, sortConfig]);

	const sortedNotRegisteredCourses = useMemo(() => {
		if (!notRegisteredSortConfig) return notRegisteredCourses;

		return [...notRegisteredCourses].sort((a, b) => {
			if (a[notRegisteredSortConfig.key] < b[notRegisteredSortConfig.key]) {
				return notRegisteredSortConfig.direction === 'ascending' ? -1 : 1;
			}
			if (a[notRegisteredSortConfig.key] > b[notRegisteredSortConfig.key]) {
				return notRegisteredSortConfig.direction === 'ascending' ? 1 : -1;
			}
			return 0;
		});
	}, [notRegisteredCourses, notRegisteredSortConfig]);

	const handleSort = useCallback((key: keyof RegisteredCourse) => {
		setSortConfig(prevConfig => ({
			key,
			direction: prevConfig?.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending',
		}));
	}, []);

	const handleNotRegisteredSort = useCallback((key: keyof ExtendedMataKuliah) => {
		setNotRegisteredSortConfig(prevConfig => ({
			key,
			direction: prevConfig?.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending',
		}));
	}, []);

	const handleShowForm = (course: ExtendedMataKuliah | RegisteredCourse, action: 'add' | 'update') => {
		setSelectedCourse(course);
		setFormAction(action);
		setShowForm(true);
	};

	const sendDataToServer = async (data: any) => {
		const response = await fetch('/api/courses', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
		});
	
		if (!response.ok) {
		throw new Error('Network response was not ok');
		}
		console.log(response.json);
		
		return response.json();
	};

	const handleDeleteCourse = useCallback(async (courseKey: string) => {
		if (window.confirm('Apakah Anda yakin ingin menghapus mata kuliah ini?')) {
		  try {
			const courseRef = ref(db, `registeredCourses/${courseKey}`);
			await remove(courseRef);
			console.log('Course deleted successfully');
			
		  } catch (error) {
			console.error('Failed to delete course:', error);
		  }
		}
	}, []);

	const handleOptimizeSchedule = async () => {
		setIsLoading(true);
		try {
			const dataToSend = {
				programStudi: programStudi,
				registeredCourses: sortedRegisteredCourses,
			};
			const result = await sendDataToServer(dataToSend);
			console.log('Data sent successfully:', result);
			const datawal = await getScheduleFromServer();
			console.log(datawal);
			saveScheduleToFirebase(datawal as Schedule, programStudi);
			
		} catch (error) {
			console.error('Failed to send data:', error);
		
		} finally {
			setIsLoading(false);
			
		}
	};

	const renderTableHeader = () => (
		<div className='w-full flex py-4 gap-2 px-10'>
			<div className='w-[5%]'>No</div>
			<div className='w-[8%] cursor-pointer' onClick={() => handleSort('kode')}>
				Kode {sortConfig?.key === 'kode' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
			</div>
			<div className='w-[20%] cursor-pointer' onClick={() => handleSort('course')}>
				Mata kuliah {sortConfig?.key === 'course' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
			</div>
			<div className='w-[5%] cursor-pointer' onClick={() => handleSort('sks')}>
				Sks {sortConfig?.key === 'sks' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
			</div>
			<div className='w-[20%] cursor-pointer' onClick={() => handleSort('dosen')}>
				Dosen {sortConfig?.key === 'dosen' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
			</div>
			<div className='w-[8%] cursor-pointer' onClick={() => handleSort('semester')}>
				Semester {sortConfig?.key === 'semester' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
			</div>
			<div className='w-[9%] cursor-pointer' onClick={() => handleSort('period')}>
				Periode {sortConfig?.key === 'period' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
			</div>
			<div className='w-[5%] cursor-pointer' onClick={() => handleSort('day')}>
				Hari {sortConfig?.key === 'day' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
			</div>
			<div className='w-[5%] cursor-pointer' onClick={() => handleSort('time')}>
				Waktu {sortConfig?.key === 'time' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
			</div>
			<div className='w-[5%]'></div>
			<div className='w-[5%]'></div>
		</div>
	);

	if (isLoading1 || isLoading2) {
		return <div>Loading...</div>;
	}

	return (
		<div className='h-full w-full flex flex-col justify-center px-24 py-24 items-center gap-5'>
		<h1 className='text-4xl text-white'>{programStudi}</h1>
		<div className="h-full w-full min-w-[1330px] flex flex-col items-center rounded-3xl overflow-hidden border-4 border-gray-300">
			<div className='h-full w-full flex flex-col overflow-hidden bg-neutral-800 text-white'>
			<div className='w-full px-10 flex gap-10 py-5'>
				<button className={`px-3 py-1 rounded-lg ${activeView === 'registered' ? 'bg-neutral-600' : 'bg-neutral-700'}`} onClick={() => setActiveView('registered')}> Mata kuliah yang sudah di ambil </button>
				<button className={`px-3 py-1 rounded-lg ${activeView === 'notRegistered' ? 'bg-neutral-600' : 'bg-neutral-700'}`} onClick={() => setActiveView('notRegistered')}> Mata kuliah yang belum di ambil </button>
			</div>

			{activeView === 'registered' ? (
				<div className='w-full overflow-hidden h-[500px] flex flex-col'>
					{renderTableHeader()}
					<div className='h-full w-[100%] overflow-y-auto no-scrollbar'>
						<div className='w-full'>
							<div className='bg-neutral-800 w-[100%]'>
								{sortedRegisteredCourses.length === 0 ? (
								<p> No registered courses available.</p>
								) : (
								<div className='bg-neutral-800 w-[100%] overflow-y-auto'>
									{sortedRegisteredCourses.map((course, index) => (
									<div key={index} className={`flex gap-2 w-full ${index % 2 === 0 ?  'bg-neutral-700 ' : 'bg-neutral-600'} py-2 px-10`}>
										<div className='w-[5%]'>{index + 1}</div>
										<div className='w-[8%]'>{course.kode}</div>
										<div className='w-[20%]'>{course.course}</div>
										<div className='w-[5%]'>{course.sks}</div>
										<div className='w-[20%]'>{course.dosen}</div>
										<div className='w-[8%]'>{course.semester}</div>
										<div className='w-[9%]'>{course.period}</div>
										<div className='w-[5%]'>{course.day}</div>
										<div className='w-[5%]'>{course.time}</div>
										<div className='w-[5%] cursor-pointer' onClick={() => handleShowForm(course, 'update')}> ubah </div>
										<div className='w-[5%] cursor-pointer text-red-500' onClick={() => handleDeleteCourse(course.key)}> hapus </div>
									</div>
									))}
								</div>
								)}
							</div>
							
						</div>
					</div>
				</div>
			) : (
				<div className='w-full overflow-hidden h-[500px] flex flex-col'>
					<div className='w-full flex py-4 gap-2 px-10'>
						<div className='w-[5%]'>No</div>
						<div className='w-[10%] cursor-pointer' onClick={() => handleNotRegisteredSort('semester')}>
							Semester {notRegisteredSortConfig?.key === 'semester' && (notRegisteredSortConfig.direction === 'ascending' ? '▲' : '▼')}
						</div>
						<div className='w-[10%] cursor-pointer' onClick={() => handleNotRegisteredSort('periode')}>
							Periode {notRegisteredSortConfig?.key === 'periode' && (notRegisteredSortConfig.direction === 'ascending' ? '▲' : '▼')}
						</div>
						<div className='w-[10%] cursor-pointer' onClick={() => handleNotRegisteredSort('KODE')}>
							Kode {notRegisteredSortConfig?.key === 'KODE' && (notRegisteredSortConfig.direction === 'ascending' ? '▲' : '▼')}
						</div>
						<div className='w-[55%] cursor-pointer' onClick={() => handleNotRegisteredSort('MATA KULIAH')}>
							Mata kuliah {notRegisteredSortConfig?.key === 'MATA KULIAH' && (notRegisteredSortConfig.direction === 'ascending' ? '▲' : '▼')}
						</div>
						<div className='w-[5%] cursor-pointer' onClick={() => handleNotRegisteredSort('SKS')}>
							SKS {notRegisteredSortConfig?.key === 'SKS' && (notRegisteredSortConfig.direction === 'ascending' ? '▲' : '▼')}
						</div>
						<div className='w-[5%]'></div>
					</div>
					<div className='h-full w-[100%] overflow-y-auto no-scrollbar'>
						<div className='w-full'>
							<div className='bg-neutral-800 w-[100%]'>
								{sortedNotRegisteredCourses.map((course, index) => (
								<div key={index} className={`flex gap-2 w-full ${index % 2 === 0 ?  'bg-neutral-700 ' : 'bg-neutral-600'} py-2 px-10`}>
									<div className='w-[5%]'>{index + 1}</div>
									<div className='w-[10%]'>{course.semester}</div>
									<div className='w-[10%]'>{course.periode}</div>
									<div className='w-[10%]'>{course.KODE}</div>
									<div className='w-[55%]'>{course['MATA KULIAH']}</div>
									<div className='w-[5%]'>{course.SKS}</div>
									<div className='w-[5%] cursor-pointer' onClick={() => handleShowForm(course, 'add')}> Tambahkan </div>
								</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
			</div>
		</div>

		{showForm && selectedCourse && (
			<CourseForm
			initialCourse={selectedCourse}
			programStudi={programStudi}
			onClose={() => setShowForm(false)}
			action={formAction}
			/>
		)}

		<div className='w-full flex justify-end'>
			{activeView === 'registered' && <button onClick={() => handleOptimizeSchedule()} disabled={isLoading} className='bg-neutral-600 border-4 border-gray-300 px-5 py-4 rounded-2xl text-white'>{isLoading ? 'Memproses...' : 'Buat Jadwal'}</button>}
		</div>
		</div>
	);
};

export default VerifikasiPage;