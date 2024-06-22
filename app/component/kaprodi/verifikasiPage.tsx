'use client'

import React, { useCallback, useEffect, useState } from 'react';
import { fetchCourses, fetchRegisteredCourses, updateCourseField } from '../functions';
import { Courses, MataKuliah } from '../types';
import { db, onValue, ref, set } from '@/app/libs/firebase/firebase';
import { child, push } from 'firebase/database';


type RegisteredCourse = {
    key: string;
    course: string;
    day: string;
    dosenID: string;
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

interface Dosen {
	uid: string;
	name: string;
  }

  type CourseData = RegisteredCourse | ExtendedMataKuliah;

interface EditCoursePopupProps {
	course: RegisteredCourse;
	onClose: () => void;
	dosenList: {uid: string, name: string}[];
}

interface ExtendedMataKuliah extends MataKuliah {
    semester: string;
    period: string; // Ubah 'periode' menjadi 'period'
}

interface AddCoursePopupProps {
	course: ExtendedMataKuliah;
	onClose: () => void;
	onAddCourse: (newCourse: RegisteredCourse) => void;
	dosenList: {uid: string, name: string}[];
  }

  interface EditCoursePopupProps {
	course: RegisteredCourse; // Sesuaikan dengan tipe data course Anda
	onClose: () => void;
	dosenList: Dosen[]; // Sesuaikan dengan tipe data dosen Anda
	
  }

  interface Course {
	id: number;
	name: string;
	day: string;
	time: string;
  }


  interface Course {
	id: number;
	name: string;
	day: string;
	time: string;
  }

  interface EditCoursePopupProps {
    course: RegisteredCourse;
    onClose: () => void;
    onUpdateCourse: (updatedCourse: RegisteredCourse) => void;
    dosenList: Dosen[];
}

const VerifikasiPage = ( {programStudi}: Proditype ) => {
	
	const [courses, setCourses] = useState<Courses>({});
	const [registeredCourses, setRegisteredCourses] = useState<RegisteredCourse[]>([]);
	const [notRegisteredCourses, setNotRegisteredCourses] = useState<ExtendedMataKuliah[]>([]);
    const [sortedCourses, setSortedCourses] = useState<RegisteredCourse[]>([]);
	const [activeView, setActiveView] = useState<'registered' | 'notRegistered'>('registered');
    const [rowIndex, setRowIndex] = useState<number | undefined>();
    const [menu, setMenu] = useState<string>('home');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: keyof RegisteredCourse; direction: 'ascending' | 'descending' } | null>(null);
	const [showPopup, setShowPopup] = useState(false);
	const [selectedCourse, setSelectedCourse] = useState<RegisteredCourse | null>(null);
	const [showAddPopup, setShowAddPopup] = useState(false);
  	const [selectedNotRegisteredCourse, setSelectedNotRegisteredCourse] = useState<ExtendedMataKuliah | null>(null);
	const [dosenList, setDosenList] = useState<{uid: string, name: string}[]>([]);

	const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
	

	const compareDays = (a: string, b: string) => {
		return dayOrder.indexOf(a) - dayOrder.indexOf(b);
	};

	useEffect(() => {
		const unsubscribeCourses = fetchCourses(programStudi, setCourses);
        const unsubscribeRegisteredCourses = fetchRegisteredCourses((courses) => {
            setRegisteredCourses(courses);
            setSortedCourses(courses);

        }, programStudi);
        
        return () => {
			unsubscribeCourses();
			unsubscribeRegisteredCourses();
		};
    }, [programStudi]);

	const fetchDosenList = useCallback(() => {
		const userRef = ref(db, 'user');
		onValue(userRef, (snapshot) => {
		  const users = snapshot.val();
		  const dosenArray = Object.entries(users)
			.filter(([_, userData]: [string, any]) => userData.Job === "Dosen")
			.map(([uid, userData]: [string, any]) => ({
			  uid,
			  name: userData.name
			}));
		  setDosenList(dosenArray);
		});
	  }, []);

	  useEffect(() => {
		fetchDosenList();
	  }, [fetchDosenList]);

	useEffect(() => {
		if (Object.keys(courses).length > 0 && registeredCourses.length > 0) {
			const notRegistered: ExtendedMataKuliah[] = [];
	
			Object.entries(courses).forEach(([semester, semesterData]) => {
				Object.entries(semesterData).forEach(([period, periodData]) => { // Ubah 'periode' menjadi 'period'
					Object.values(periodData).forEach((row) => {
						if ('KODE' in row && 'MATA KULIAH' in row && 'SKS' in row) {
							const course = row as MataKuliah;
							if (!registeredCourses.some(regCourse => regCourse.kode === course.KODE)) {
								const extendedCourse: ExtendedMataKuliah = {
									...course,
									semester,
									period // Ubah 'periode' menjadi 'period'
								};
								notRegistered.push(extendedCourse);
							}
						}
					});
				});
			});
			
			setNotRegisteredCourses(notRegistered);
		}
	}, [courses, registeredCourses]);
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
            if (a[key] > b[key]) return direction === 'ascending' ? 1  : -1;
            return 0;
        });

        setSortedCourses(sorted);
    };

	const handlerSendCourse = () => {
        setShowConfirmation(true);
    };

	const handleAddCourse = () => {
		setShowAddPopup(false);
	};


	const handleUpdateCourse = (updatedCourse: RegisteredCourse) => {
        setRegisteredCourses(prevCourses => 
            prevCourses.map(c => c.key === updatedCourse.key ? updatedCourse : c)
        );
        setSortedCourses(prevCourses => 
            prevCourses.map(c => c.key === updatedCourse.key ? updatedCourse : c)
        );

        const courseRef = ref(db, `registeredCourses/${updatedCourse.dosenID}/${updatedCourse.key}`);
        set(courseRef, updatedCourse)
            .then(() => {
                console.log('Kursus berhasil diperbarui');
                setShowPopup(false);
            })
            .catch((error) => {
                console.error('Error memperbarui kursus:', error);
            });
    };


	const EditCoursePopup: React.FC<EditCoursePopupProps> = ({ course, onClose, dosenList }) => {
		const [editedCourse, setEditedCourse] = useState<RegisteredCourse>(course);
	  
		const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		  const { name, value } = e.target;
		  if (name === 'dosen') {
			const selectedDosen = dosenList.find(d => d.uid === value);
			if (selectedDosen) {
			  setEditedCourse({ 
				...editedCourse, 
				dosen: selectedDosen.name,
				dosenID: selectedDosen.uid
			  });
			}
		  } else {
			setEditedCourse({ ...editedCourse, [name]: value });
		  }
		};
	  
		const handleSave = () => {
		  const courseRef = ref(db, `registeredCourses/${editedCourse.dosenID}}`); // Menggunakan `course.key` untuk merujuk ke data yang sudah ada
		  set(courseRef, editedCourse)
			.then(() => {
			  console.log("Berhasil memperbarui kursus");
			  onClose();
			})
			.catch((error) => {
			  console.error("Gagal memperbarui kursus:", error);
			});
		};
	  
		const editableFields: (keyof RegisteredCourse)[] = ['dosen', 'time', 'day'];
	  
		return (
		  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-white p-6 rounded-md text-lg text-neutral-800">
			  <h2 className="text-xl font-bold mb-4">Edit Course</h2>
			  {editableFields.map((key) => (
				<div key={key} className="mb-4">
				  <label className="block mb-1">
					{key === 'dosen' ? 'Dosen' :
					key === 'time' ? 'Waktu' :
					key === 'day' ? 'Hari' : 
					key.charAt(0).toUpperCase() + key.slice(1)}:
				  </label>
				  <select
					name={key}
					value={key === 'dosen' ? editedCourse.dosenID : editedCourse[key]}
					onChange={handleInputChange}
					className="w-full p-2 border rounded"
				  >
					{key === 'dosen' && (
					  <>
						<option value="">Pilih dosen</option>
						{dosenList.map((dosen) => (
						  <option key={dosen.uid} value={dosen.uid}>
							{dosen.name}
						  </option>
						))}
					  </>
					)}
					{key === 'time' && (
					  <>
						<option value="">Pilih waktu</option>
						<option value="Pagi">Pagi</option>
						<option value="Sore">Sore</option>
					  </>
					)}
					{key === 'day' && (
					  <>
						<option value="">Pilih hari</option>
						{['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => (
						  <option key={day} value={day}>{day}</option>
						))}
					  </>
					)}
				  </select>
				</div>
			  ))}
			  <div className="flex justify-end gap-2 mt-4">
				<button onClick={onClose} className="px-4 py-2 bg-neutral-600 text-white rounded-md">Cancel</button>
				<button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded-md">Save</button>
			  </div>
			</div>
		  </div>
		);
	  };
	  

	  const AddCoursePopup: React.FC<AddCoursePopupProps> = ({ course, onClose, onAddCourse, dosenList }) => {
		const [dosen, setDosen] = useState<Dosen | null>(null);
		const [day, setDay] = useState('');
		const [time, setTime] = useState('');
	  
		const handleAdd = () => {
			if (dosen) {
				const newCourse = {
				  key: Math.random().toString(36).substr(2, 9),
				  course: course['MATA KULIAH'] || '',
				  day: day,
				  dosenID: dosen.uid,
				  dosen: dosen.name,
				  period: course.period || '',
				  kode: course['KODE'] || '',
				  prodi: "Teknik Informatika",
				  semester: course.semester || '',
				  time: time
				};
		  
				// Simpan ke Firebase
				const coursesRef = ref(db, 'registeredCourses/'+ dosen.uid); // Ubah 'registeredCourses' dengan path yang sesuai di database Anda
				const newCourseRef = push(coursesRef); // Buat referensi baru dengan push
				set(newCourseRef, newCourse) // Simpan data baru ke referensi baru
		  
				onAddCourse(newCourse); // Panggil prop onAddCourse untuk menambahkan ke state lokal
				onClose(); // Tutup popup setelah berhasil menyimpan
			  } else {
				console.error("Dosen is not selected");
			  }
		};
	  
		return (
		  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-white p-6 rounded-md text-lg text-neutral-800">
			  <h2 className="text-xl font-bold mb-4">Tambah Mata Kuliah</h2>
			  <div className="mb-4">
				<label className="block mb-1">Dosen:</label>
				<select
				  value={dosen ? dosen.uid : ''}
				  onChange={(e) => {
					const selectedDosen = dosenList.find(d => d.uid === e.target.value);
					setDosen(selectedDosen || null);
				  }}
				  className="w-full p-2 border rounded">
				  <option value="">Pilih dosen</option>
				  {dosenList.map((dosen) => (
					<option key={dosen.uid} value={dosen.uid}>
					  {dosen.name}
					</option>
				  ))}
				</select>
			  </div>
			  <div className="mb-4">
				<label className="block mb-1">Hari:</label>
				<select
				  value={day}
				  onChange={(e) => setDay(e.target.value)}
				  className="w-full p-2 border rounded"
				>
				  <option value="">Pilih hari</option>
				  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((d) => (
					<option key={d} value={d}>{d}</option>
				  ))}
				</select>
			  </div>
			  <div className="mb-4">
				<label className="block mb-1">Waktu:</label>
				<select
				  value={time}
				  onChange={(e) => setTime(e.target.value)}
				  className="w-full p-2 border rounded"
				>
				  <option value="">Pilih waktu</option>
				  <option value="Pagi">Pagi</option>
				  <option value="Sore">Sore</option>
				</select>
			  </div>
			  <div className="flex justify-end gap-2 mt-4">
				<button onClick={onClose} className="px-4 py-2 bg-neutral-600 text-white rounded-md">Batal</button>
				<button onClick={handleAdd} className="px-4 py-2 bg-green-500 text-white rounded-md">Tambah</button>
			  </div>
			</div>
		  </div>
		);
	  };

	  
	return (
        
		<div className='h-full w-full flex flex-col justify-center px-24 py-24 items-center gap-5'>

            <h1 className='text-4xl text-white'>{programStudi}</h1>

			<div className="h-full w-full min-w-[1330px] flex flex-col items-center rounded-3xl overflow-hidden border-4 border-gray-300">

				<div className='h-full w-full flex flex-col overflow-hidden bg-neutral-800 text-white'>

					<div className='w-full px-10 flex gap-10 py-5'>
						<button 
							className={`px-3 py-1 rounded-lg ${activeView === 'registered' ? 'bg-neutral-600' : 'bg-neutral-700'}`}
							onClick={() => setActiveView('registered')}
						>
							Mata kuliah yang sudah di ambil
						</button>
						<button 
							className={`px-3 py-1 rounded-lg ${activeView === 'notRegistered' ? 'bg-neutral-600' : 'bg-neutral-700'}`}
							onClick={() => setActiveView('notRegistered')}
						>
							Mata kuliah yang belum di ambil
						</button>
					</div>

					{activeView === 'registered' ? (<div className='w-full'>

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
						                    <div className='w-[10%]'>{course.period}</div>
						                    <div className='w-[5%]'>{course.day}</div>
						                    <div className='w-[5%]'>{course.time}</div>
						                    <div 
											  className='w-[5%] cursor-pointer'
											  onClick={() => {
											    setSelectedCourse(course);
											    setShowPopup(true);
											  }}
											>
											  ubah
											</div>
						                </div>
						            ))}
						        </div>
						    )}
						    </div>						
						</div>

					</div>
					) : (
					<div className='w-full overflow-hidden h-[500px] flex flex-col'>
						<div className='w-full flex py-3 px-10'>
							<div className='w-[10%]'>Semester</div>
							<div className='w-[10%]'>Periode</div>
							<div className='w-[10%]'>Kode</div>
							<div className='w-[55%]'>Mata kuliah</div>
							<div className='w-[5%]'>Sks</div>
							<div className='w-[10%]'></div>
						</div>
						<div className='h-full w-[100%] overflow-y-auto no-scrollbar'>
							<div className='w-full \'>
								<div className='bg-neutral-800 w-[100%]'>
									{notRegisteredCourses.map((course, index) => (
										<div key={index} className='flex px-10 py-1'>
											<div className='w-[10%]'>{course.semester}</div>
											<div className='w-[10%]'>{course.period}</div>
											<div className='w-[10%]'>{course['KODE']}</div>
											<div className='w-[55%]'>{course['MATA KULIAH']}</div>
											<div className='w-[5%]'>{course['SKS']}</div>
											<div className='w-[10%] cursor-pointer' onClick={() => {
											  setSelectedNotRegisteredCourse(course);
											  setShowAddPopup(true);
											}}>
											  Tambahkan
											</div>
										</div>
									))}
								</div>
							</div>
							
						</div>
					</div>)}

					{showPopup && selectedCourse && (
                <EditCoursePopup
                    course={selectedCourse}
                    onClose={() => setShowPopup(false)}
                    onUpdateCourse={handleUpdateCourse}
                    dosenList={dosenList}
                />
            )}

            {showAddPopup && selectedNotRegisteredCourse && (
                <AddCoursePopup
                    course={selectedNotRegisteredCourse}
                    onClose={() => setShowAddPopup(false)}
                    onAddCourse={handleAddCourse}
                    dosenList={dosenList} 
                />
            )}
				</div>
			</div>

            <div className='w-full flex justify-end'>
                <button onClick={handlerSendCourse} className='bg-neutral-600 h-20 w-40 rounded-3xl text-white'>Buat Jadwal</button>
            </div>

		</div>
	);
};

export default VerifikasiPage;