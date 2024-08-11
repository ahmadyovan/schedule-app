	import React, { useState, useEffect, useCallback } from 'react';
	import { createClientSupabase } from '@/utils/supabase/client';
	import { useUser } from '../hooks/useUser';
	import { setupRealtimeSubscription } from '../clientfunctions';
	import AddCoursePopup from './AddCoursePopup';


	interface Course {
		course_id: number;
		course_kode: string;
		course_name: string;
		course_sks: number | null;
		course_semester: string | null;
	}

	interface User {
		user_id: string;
		user_name: string;
	}

	interface Jadwal {
		jadwal_id: number;
		jadwal_course_id: number;
		jadwal_dosen_id: string;
		jadwal_hari: string;
		jadwal_waktu: string;
		class: string;
		created_at: string;
		course: Course;
		user: User;
	}

	interface AddJadwal {
		jadwal_course_id: number;
		jadwal_dosen_id: string;
		jadwal_hari: string;
		jadwal_waktu: string;
	}

	interface AddParam {
		course_id: number
		course_name: string
	}

	const VerificationPage = () => {
		const [activeTab, setActiveTab] = useState('pengajuan');
		const [registeredCourses, setRegisteredCourses] = useState<Jadwal[]>([]);
		const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
		const [showEditModal, setShowEditModal] = useState(false);
		const [editingCourse, setEditingCourse] = useState<Jadwal | null>(null);
		const [showAddModal, setShowAddModal] = useState(false);
		const [addCourse, setAddCourse] = useState<AddParam>({course_id: 0, course_name: ''})
		const [showDeleteModal, setShowDeleteModal] = useState(false);
		const [deleteCourse, setDeleteCourse] = useState<Jadwal | null>()
		const [showPreferencePopup, setShowPreferencePopup] = useState(false);
		const [currentPreference, setCurrentPreference] = useState<string[] | null>(null);
		const [searchQuery, setSearchQuery] = useState('');
		const [totalSKS, setTotalSKS] = useState(0);
		const [selectedTime, setSelectedTime] = useState<string>('')
		const [selectedDays, setSelectedDays] = useState<string[]>([])

		const Days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

		const supabase = createClientSupabase()
		const {userData} = useUser()		

		useEffect(() => {
			if (userData) {
				fetchRegisteredCourses();
				fetchAvailableCourses();
			}
		}, [userData]);

		const fetchRegisteredCourses = useCallback(async () => {
			if (!userData) return;
		
			const { data, error } = await supabase
				.from('jadwal')
				.select(`
					*,
					course!inner (*),
					user!inner(*)
				`)
				.eq('course.course_prodi', userData.user_prodi.prodi_id)

			if (data) {
				console.log(data);
				
				setRegisteredCourses(data);
			}
			if (error) console.error('Error fetching jadwal:', error);
		}, [userData, supabase]);

		const fetchAvailableCourses = useCallback(async () => {
			if (!userData) return;

			const { data, error } = await supabase
				.from('course')
				.select('*')
				.eq('course_prodi', userData.user_prodi.prodi_id);

			if (data) {
				setAvailableCourses(data);
			}
			if (error) console.error('Error fetching course:', error);
		}, [userData, supabase]);

		const handleRealtimeUpdate = useCallback((table: string) => {
			if (table === 'jadwal') {
				fetchRegisteredCourses();
			} else if (table === 'course') {
				fetchAvailableCourses();
			}
		}, [fetchRegisteredCourses, fetchAvailableCourses]);

		useEffect(() => {
			fetchRegisteredCourses();
			fetchAvailableCourses();

			let unsubscribe: (() => void) | undefined;

			const setup = async () => {
				unsubscribe = await setupRealtimeSubscription(handleRealtimeUpdate);
			};

			setup();

			return () => {
				if (unsubscribe) {
					unsubscribe();
				}
			};
		}, [fetchRegisteredCourses, fetchAvailableCourses, handleRealtimeUpdate]);

		const handleEdit = (jadwal: Jadwal) => {
			setEditingCourse(jadwal);
			setShowEditModal(true);
		};

		const handleSaveEdit = async () => {
			if (editingCourse) {
				const { error } = await supabase
					.from('jadwal')
					.update({
						jadwal_hari: editingCourse.jadwal_hari,
						jadwal_waktu: editingCourse.jadwal_waktu,
					})
					.eq('jadwal_id', editingCourse.jadwal_id);
				
				if (error) {
					console.error('Error updating course:', error);
				} else {
					fetchRegisteredCourses();
					setShowEditModal(false);
				}
			}
		};

		const handleAdd = async (jadwal: AddJadwal) => {

			const { error } = await supabase.from('jadwal').insert({
				jadwal_course_id: jadwal.jadwal_course_id,
				jadwal_dosen_id: jadwal.jadwal_dosen_id,
				jadwal_hari: jadwal.jadwal_hari,
				jadwal_waktu: jadwal.jadwal_waktu
				// 
			});
			
			if (error) {
				console.error('Error adding course:', error);
			} else {
				alert('BERHASIL MENAMBAHKAN JADWAL')
				// setShowAddModal(false)
			}
		};

		const handleDelete = async () => {
			const { error } = await supabase
				.from('jadwal')
				.delete()
				.eq('jadwal_id', deleteCourse?.jadwal_id);
			if (error) {
				console.error('Error deleting course:', error);
			} else {
				setDeleteCourse(null)
			}
		};

		const filteredRegisteredCourses = registeredCourses.filter(jadwal => 
			jadwal.course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			jadwal.course.course_kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
			jadwal.user?.user_name.toLowerCase().includes(searchQuery.toLowerCase())
		);

		const calculateTotalSKS = useCallback(() => {
			const total = filteredRegisteredCourses.reduce((sum, jadwal) => {
				return sum + (jadwal.course.course_sks || 0);
			}, 0);
			setTotalSKS(total);
		}, [filteredRegisteredCourses]);

		useEffect(() => {
			calculateTotalSKS();
		}, [filteredRegisteredCourses, calculateTotalSKS]);

		const PreferencePopup = ({ days, onClose }: { days: string[], onClose: () => void }) => {
			return (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
					<div className="bg-neutral-600 p-6 rounded-lg shadow-xl">
						<h2 className="text-xl font-bold mb-4">Preferensi Hari</h2>
						<ul className=' flex flex-col justify-center gap-2'>
							{days.map((day, index) => (
								<li key={index} className="">{day}</li>
							))}
						</ul>
						<button  onClick={onClose} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" >
							Tutup
						</button>
					</div>
				</div>
			);
		};

		const DeletePopup = () => {
			return (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
					<div className="bg-neutral-600 flex flex-col gap-5 p-6 rounded-lg shadow-xl">
						<div className='flex flex-col justify-center'>
							<h1>apakah anda ingin menghapus jadwal</h1>
							<h2>{deleteCourse?.course.course_name}</h2>
						</div>
						<div className='flex justify-evenly gap-20'>
							<button className="bg-green-500 w-20 hover:bg-green-700 text-white font-bold px-2 rounded" onClick={() => setShowDeleteModal(false)}>Tidak</button>
							<button className="bg-red-500 w-20 hover:bg-red-700 text-white font-bold px-2 rounded" onClick={() => handleDelete()}>Ya</button>
						</div>
					</div>
				</div>
			);
		};

		const handleFinish = async () => {
			if (!userData) return;
			const { error } = await supabase
    		    .from('prodi')
    		    .update({check: 1})
    		    .eq('prodi_id', userData.user_prodi.prodi_id);

    		if (error) {
    		    console.error('Error updating jadwal:', error);
    		} else {
    		    alert('Jadwal berhasil diperbarui!');
    		}
		};

		return (  
			<div className="h-full px-10 flex justify-center flex-col items-center py-14 gap-10">
				<div className="min-h-[600px] min-w-[1330px] w-full h-[100%] flex flex-col items-center">
					<div className='flex flex-col gap-5'>
						<h1>VALIDASI PENJADWALAN TAHUN 2024/2025</h1>
						{userData && (
							<p className=" text-center uppercase">{userData.user_prodi.prodi_name}</p>
						)}
					</div>
					
		
					<div className="w-full flex justify-between px-5 py-5 pr-10">
						<div className='flex gap-5'>
							<button className={`px-4 py-2 mr-2 ${activeTab === 'pengajuan' ? 'bg-blue-500 text-white' : 'bg-blue-400'}`} onClick={() => setActiveTab('pengajuan')}>
								Pengajuan
							</button>
							<button className={`px-4 py-2 ${activeTab === 'jadwal kosong' ? 'bg-blue-500 text-white' : 'bg-blue-400'}`} onClick={() => setActiveTab('jadwal kosong')}>
								tambah jadwal
							</button>
						</div>
						<div>
							<div className='h-full'>
							<input className='h-full bg-neutral-700 px-2 py-1 rounded' type="text" placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
							</div>
						</div>
						
					</div>

					{activeTab === 'pengajuan' && (
						<div className="h-full flex flex-col w-full overflow-y-auto px-5 ">
							<div className="w-full sticky bg-neutral-800 top-0 py-5 flex items-center px-5 gap-5">
								<div className="w-[3%]">no</div>
								<div className="w-[7%]">Semester</div>
								<div className="w-[7%]">Kode</div>
								<div className="w-[22%]">Mata Kuliah</div>
								<div className="w-[3%]">SKS</div>
								<div className="w-[20%]">Dosen</div>
								<div className="w-[7%]">Hari</div>
								<div className="w-[6%]">Jadwal</div>
								<div className="w-[5%]">Waktu</div>
								<div className="w-[10%]"></div>
							</div>
							<div className='h-full bg-neutral-800'>
								<div className='h-fit bg-neutral-700'>
								{filteredRegisteredCourses.map((jadwal, index) => {

									let hariArray = [];
									try {
										hariArray = JSON.parse(jadwal.jadwal_hari);
									} catch (e) {
										hariArray = [jadwal.jadwal_hari];
									}
									
									return (
									<div key={jadwal.jadwal_id} className={`flex hover:border-neutral-300 hover:border-2 ${index % 2 === 0 ? 'bg-neutral-700' : 'bg-neutral-600'} gap-5 py-3 px-5 items-center`}>
										<div className="w-[3%]">{index + 1}</div>
										<div className="w-[7%]">{jadwal.course.course_semester}</div>
										<div className="w-[7%]">{jadwal.course.course_kode}</div>
										<div className="w-[22%]">{jadwal.course.course_name}</div>
										<div className="w-[3%]">{jadwal.course.course_sks}</div>
										<div className="w-[20%]">{jadwal.user?.user_name}</div>
										<div className="w-[7%]">
											{hariArray.length > 1 ? (
												<button onClick={() => {setCurrentPreference(hariArray), setShowPreferencePopup(true);}} className="bg-green-500 py-1 hover:bg-green-700 text-white font-bold px-2 rounded">
													Preferensi
												</button>
												) : (
												<div>
													{jadwal.jadwal_hari}
												</div>
											)}
										</div>
										<div className="w-[6%]">{jadwal.class}</div>
										<div className="w-[5%]">{jadwal.jadwal_waktu}</div>
										<div className="w-[10%] flex justify-between">
											<button className="bg-blue-500 py-1 hover:bg-blue-700 text-white font-bold px-2 rounded" onClick={() => {setCurrentPreference(hariArray), handleEdit(jadwal)}}>Ubah</button>
											<button className="bg-red-500 py-1 hover:bg-red-700 text-white font-bold px-2 rounded" onClick={() => {setShowDeleteModal(true), setDeleteCourse(jadwal)}}>Hapus</button>
										</div>
									</div>
								)})}
								</div>
								<div className='h-[12%] sticky bottom-[-1px] bg-neutral-800 flex items-center px-5'>
									<h1>total sks : {totalSKS}</h1>
								</div>
							</div>
						</div>
					)}

					{activeTab === 'jadwal kosong' && (
						<div className="h-full flex flex-col w-full overflow-y-auto px-5">
							<div className="w-full sticky bg-neutral-800 top-0 py-5 flex items-center px-5 gap-5">
								<div className="w-[3%]">No</div>
								<div className="w-[10%]">Semester</div>
								<div className="w-[10%]">Kode</div>
								<div className="w-[64%]">Mata Kuliah</div>
								<div className="w-[3%]">SKS</div>
								<div className="w-[10%]">Action</div>
							</div>
							<div className='h-full'>
								<div className='h-fit bg-neutral-700'>
								{availableCourses.map((course, index) => (
									<div key={course.course_id} className={`flex hover:border-neutral-300 hover:border-2 ${index % 2 === 0 ? 'bg-neutral-700' : 'bg-neutral-600'} gap-5 py-3 px-5 items-center`}>
										<div className="w-[3%]">{index + 1}</div>
										<div className="w-[10%]">{course.course_semester}</div>
										<div className="w-[10%]">{course.course_kode}</div>
										<div className="w-[64%]">{course.course_name}</div>
										<div className="w-[3%]">{course.course_sks}</div>
										<div className="w-[10%]">
											<button className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded" onClick={() => {setShowAddModal(true), setAddCourse({course_id: course.course_id, course_name: course.course_name})}}>
												Add
											</button>
										</div>
									</div>
								))}
								</div>
								<div className='h-[12%] sticky bottom-[-1px] bg-neutral-800'></div>
							</div>
						</div>
					)}

					{showPreferencePopup && currentPreference && (
						<PreferencePopup 
							days={currentPreference} 
							onClose={() => setShowPreferencePopup(false)} 
						/>
					)}

					{showDeleteModal && deleteCourse && (
						DeletePopup()
					)}

					{showAddModal && addCourse && (
						<AddCoursePopup
							courseId={addCourse}
							onSave={(addCourse) => handleAdd(addCourse)}
							onCancel={() => setShowAddModal(false)} />
					)}

					{showEditModal && editingCourse && (
						<div className="fixed inset-0 bg-gray-600 flex items-center justify-center pb-60 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
							<div className="relative top-20 mx-auto p-5 border w-fit shadow-lg rounded-md bg-neutral-700">
								<div className="text-center flex flex-col gap-5">
									<h3 className="text-lg leading-6 font-medium text-white">Edit Course</h3>
									<div className="py-3 flex justify-evenly gap-5">
										<div className='flex flex-col gap-2'>
											<h1>pilih hari</h1>
											<select value={editingCourse.jadwal_hari || ''} onChange={(e) => setEditingCourse({...editingCourse, jadwal_hari: e.target.value})} className='bg-neutral-800 w-36 py-2 px-1'>
												<option value="">pilih hari</option>
												{currentPreference!.map((day) => (
												<option key={day} value={day}>{day}</option>
												))}
											</select>
										</div>
										<div className='flex flex-col gap-2'>
										<h1>pilih waktu</h1>
											<select value={editingCourse.jadwal_waktu || ''} onChange={(e) => setEditingCourse({...editingCourse, jadwal_waktu: e.target.value})} className='bg-neutral-800 w-36 py-2 px-1'>
												<option value="">pilih waktu</option>
												<option value="pagi">pagi</option>
												<option value="malam">malam</option>
											</select>
										</div>
									</div>
									<div className="items-center flex gap-5 px-4 py-3">
										<button className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-300" onClick={handleSaveEdit} >
											Simpan
										</button >
										<button className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-300" onClick={() => setShowEditModal(false)}>Batal</button>
									</div>
								</div>
							</div>
						</div>
					)}
					<div className='flex w-full justify-end px-10 pt-10'>
						<button onClick={handleFinish} className="px-4 py-2 w-fit bg-green-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-300">Selesai</button>
					</div>
				</div>
			</div>
			
		);
	};

	export default VerificationPage;