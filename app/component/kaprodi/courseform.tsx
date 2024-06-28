    import React, { useEffect, useReducer } from 'react';
    import { ExtendedMataKuliah, RegisteredCourse, Dosen } from '../types';
    import { db, ref, push, set, update } from '@/app/libs/firebase/firebase';
    import { useUsers } from '../hooks/useDosen';

    interface CourseFormProps {
        initialCourse?: ExtendedMataKuliah | RegisteredCourse;
        onClose: () => void;
        programStudi: string;
        action: 'add' | 'update';
    }

    type CourseAction = | { type: 'SET_COURSE', payload: Partial<RegisteredCourse> } | { type: 'UPDATE_FIELD', field: keyof RegisteredCourse, value: string };

    export const CourseForm: React.FC<CourseFormProps> = ({ initialCourse, programStudi, onClose, action }) => {

        const dosenList = useUsers(programStudi, 'Dosen');

        function courseReducer(state: Partial<RegisteredCourse>, action: CourseAction): Partial<RegisteredCourse> {
            switch (action.type) {
              case 'SET_COURSE':
                return { ...state, ...action.payload };
              case 'UPDATE_FIELD':
                return { ...state, [action.field]: action.value };
              default:
                return state;
            }
          }

        const [course, dispatch] = useReducer(courseReducer, {
            key: '',
            course: '',
            day: '',
            dosenID: '',
            dosen: '',
            period: '',
            sks: '',
            kode: '',
            prodi: programStudi,
            semester: '',
            time: ''
        });

        useEffect(() => {
            if (initialCourse) {
                if ('MATA KULIAH' in initialCourse) {
                    // This is an ExtendedMataKuliah
                    dispatch({
                        type: 'SET_COURSE',
                        payload: {
                            course: initialCourse['MATA KULIAH'] || '',
                            kode: initialCourse['KODE'] || '',
                            period: initialCourse.periode || '',
                            semester: initialCourse.semester || '',
                            sks: initialCourse['SKS'] || '',
                            prodi: programStudi
                        }
                    });
                } else {
                    // This is a RegisteredCourse
                    dispatch({ type: 'SET_COURSE', payload: initialCourse });
                }
            }
        }, [initialCourse, programStudi]);

        const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const TIMES = ['Pagi', 'Sore'];

        const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const { name, value } = e.target;
            if (name === 'dosenID') {
                const selectedDosen = dosenList.find(d => d.uid === value);
                dispatch({ type: 'UPDATE_FIELD', field: 'dosenID', value });
                if (selectedDosen) {
                    dispatch({ type: 'UPDATE_FIELD', field: 'dosen', value: selectedDosen.name });
                }
            } else {
                dispatch({ type: 'UPDATE_FIELD', field: name as keyof RegisteredCourse, value });
            }
        };

        const handleSubmit = () => {
            if (!course.dosenID || !course.day || !course.time) {
                console.error("Please fill all required fields");
                return;
            }
        
            const submittedCourse: RegisteredCourse = {
                key: course.key || '',
                course: course.course || '',
                day: course.day,
                dosenID: course.dosenID,
                dosen: course.dosen || '',
                period: course.period || '',
                kode: course.kode || '',
                sks: course.sks || '',
                prodi: course.prodi || '',
                semester: course.semester || '',
                time: course.time
            };

            console.log(submittedCourse);
            
        
            if (action === 'update' && course.key) {
                const courseRef = ref(db, `registeredCourses/${course.key}`);
                update(courseRef, submittedCourse)
                .then(() => {
                    onClose();
                })
                .catch((error) => {
                    console.error("Error updating course:", error);
                });
            } else {
                const coursesRef = ref(db, 'registeredCourses');
                const newCourseRef = push(coursesRef);
                submittedCourse.key = newCourseRef.key || '';
        
                set(newCourseRef, submittedCourse)
                .then(() => {
                   
                    onClose();
                })
                .catch((error) => {
                    console.error("Error adding new course:", error);
                });
            }
        };

        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-md text-lg text-neutral-800">
                    <h2 className="text-xl font-bold mb-4">{action === 'update' ? 'Edit' : 'Tambah'} Mata Kuliah</h2>
                    <div className='text-xl'>{course.course || ''}</div>
                    <div className="mb-4">
                        <label className="block mb-1">Dosen:</label>
                        <select name="dosenID" value={course.dosenID} onChange={handleInputChange} className="w-full p-2 border rounded">
                          <option value="">Pilih dosen</option>
                          {dosenList.map((dosen) => (
                            <option key={dosen.uid} value={dosen.uid}>{dosen.name}</option>
                          ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Hari:</label>
                        <select name="day" value={course.day} onChange={handleInputChange} className="w-full p-2 border rounded">
                            <option value="">Pilih hari</option>
                            {DAYS.map((day) => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Waktu:</label>
                        <select name="time" value={course.time} onChange={handleInputChange} className="w-full p-2 border rounded">
                            <option value="">Pilih waktu</option>
                            {TIMES.map((time) => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={onClose} className="px-4 py-2 bg-neutral-600 text-white rounded-md">Batal</button>
                        <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded-md">
                            {action === 'update' ? 'Simpan' : 'Tambah'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };