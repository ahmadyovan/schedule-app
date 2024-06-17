'use client'

import React, { useEffect, useState } from 'react';
import { db, ref, get, set, update, remove } from '@/app/libs/firebase/firebase';
import { Courses, MataKuliah } from '@/app/component/types';
import { fetchCourses, addCourse, updateCourse, deleteCourse } from '../component/functions';
import CourseRow from '../component/table/row';

interface Proditype {
    prodiProps: string
}

const KaprodiUI = ( {prodiProps}: Proditype ) => {
	
  	const [courses, setCourses] = useState<Courses>({});
  	const [selectedSemester, setSelectedSemester] = useState('');
  	const [selectedPeriod, setSelectedPeriod] = useState('');
	const [editable, setEditable] = useState<boolean>(false);
	const [editableRowIndex, setEditableRowIndex] = useState<string>('');
	const [originalCourse, setOriginalCourse] = useState<MataKuliah>();
	const [newCourse, setNewCourse] = useState<MataKuliah>();
	const [updatedCourse, setUpdatedCourse] = useState<MataKuliah>();
	const [editMode, setEditMode] = useState(false);

	const prodi = prodiProps
    console.log(prodi);
    

	useEffect(() => {
		const unsubscribe = fetchCourses(prodi, setCourses);
	
		return unsubscribe;
	}, [prodi]);

  	const semesters = Array.from( new Set(Object.keys(courses)));

  	const periods = Array.from( new Set(Object.keys(courses[selectedSemester] || {}).sort((a, b) => parseInt(a) - parseInt(b))));

	  const handleAddCourse = async () => {
		if (prodi && newCourse && selectedSemester && selectedPeriod) {
		  await addCourse(prodi, selectedSemester, selectedPeriod, newCourse);
		  setNewCourse({}); // Reset the newCourse state after adding the course
		}
	  };
	  
	  const handleUpdateCourse = async (row: string, kode: string, mataKuliah: string, sks: string) => {

        const updatedCourse: MataKuliah = {
            'KODE': kode,
            'MATA KULIAH': mataKuliah,
            'SKS': sks
        };

        if (prodi && selectedSemester && selectedPeriod && row && updatedCourse){
            await updateCourse(prodi, selectedSemester, selectedPeriod, row, updatedCourse)
            setEditable(false);
		    setEditableRowIndex('');
		    setOriginalCourse({});
        }
	   };
	  
	  const handleDeleteCourse = async (row: string) => {
        await deleteCourse(prodi, selectedSemester, selectedPeriod, row);
	  };

  	const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  	  	setSelectedSemester(e.target.value);
		setSelectedPeriod(''); // Reset selectedPeriod when semester changes
		console.log(selectedSemester);
  	};

  	const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  	  	setSelectedPeriod(e.target.value);
		console.log(selectedPeriod);
  	};

	  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, row: string, field: keyof MataKuliah) => {
		const newValue = e.target.value;
	  
		setUpdatedCourse((prevCourse) => ({
			...prevCourse,
			[field]: newValue
		  }));
		 
		  const updatedCourses = {
			...courses,
			[selectedSemester]: {
			  ...courses[selectedSemester],
			  [selectedPeriod]: {
				...courses[selectedSemester][selectedPeriod],
				[row]: {
				  ...courses[selectedSemester][selectedPeriod][row],
				  [field]: newValue
				}
			  }
			}
		  };
		  setCourses(updatedCourses);
	  };

	  const handleEditMode = () => {
		setEditMode(!editMode)
	  };
	  
	  const handleEditClick = (row: string) => {
		setEditable(true);
		defaultValue(editableRowIndex)
		setEditableRowIndex(row);
		setOriginalCourse({ ...courses[selectedSemester][selectedPeriod][row] });
	  };

	  const handleSaveClick = () => {
		const updatedCourse = courses[selectedSemester][selectedPeriod][editableRowIndex];
		if (updatedCourse) {
			handleUpdateCourse(
				editableRowIndex,
				updatedCourse['KODE'] ?? '',
				updatedCourse['MATA KULIAH'] ?? '',
				updatedCourse['SKS'] ?? ''
			);
		  	setEditable(false);
		  	setEditableRowIndex('');
		  	setOriginalCourse({});
		}
	  };

	  const defaultValue = (e: string) => {
		if (originalCourse) {
			const updatedCourses = {
			  ...courses,
			  [selectedSemester]: {
				...courses[selectedSemester],
				[selectedPeriod]: {
				  ...courses[selectedSemester][selectedPeriod],
				  [e]: originalCourse,
				},
			  },
			};
			setCourses(updatedCourses);
		}
	  }
	  
	  const handleCancelClick = () => {
		defaultValue(editableRowIndex)
		setEditable(false);
		setEditableRowIndex('');
		setOriginalCourse({});
	  };
	

	return (
        
		<div className='h-[90%] w-screen bg-white flex flex-col justify-center items-center overflow-hidden text-black px-40'>
            <h1>{prodi}</h1>
			<div className='h-[70%] w-full flex flex-col justify-center items-center gap-5'>
				<div className='w-[85%] flex justify-between'>
					<div className='flex gap-20'>
						<div className='flex gap-5'>
							<label htmlFor="semester">pilih semester</label>
							<select id="semester" value={selectedSemester} onChange={handleSemesterChange}>
							<option value="">Pilih Semester</option>
							{semesters.map(semester => (
								<option key={semester} value={semester}>
								{semester}
								</option>
							))}
							</select>
						</div>

						<div className='flex gap-5'>
							<label htmlFor="period">Pilih priode</label>
							<select id="period" value={selectedPeriod} onChange={handlePeriodChange}>
							<option value="">Pilih Periode</option>
							{periods.map(period => (
								<option key={period} value={period}>
								{period}
								</option>
							))} 
							</select>
						</div>
					</div>

					<div>
						<button onClick={() => handleEditMode()}>{editMode? "Keluar mode edit" : "Masuk mode edit"}</button>
					</div>
					
				</div>

				<div className='min-h-96 w-[85%] flex flex-col gap-3 overflow-hidden border-4 px-8 py-6'>
					<div className='flex w-[90%] bg-slate-200 gap-5'>
                        <div className='w-[5%] text-center'>No</div>
						<div className='w-[15%] text-center'>KODE</div>
						<div className='w-[75%] text-center'>MATA KULIAH</div>
						<div className='w-[5%] text-center'>SKS</div>
					</div>

					<div className='h-60 w-full overflow-y-auto flex'>
						<div className='h-full w-full'>

                            {selectedSemester && selectedPeriod &&
                            courses[selectedSemester] &&
                            courses[selectedSemester][selectedPeriod] &&
                            Object.entries(courses[selectedSemester][selectedPeriod])
                            .sort((a, b) => {const aRowNumber = parseInt(a[0].replace("Row ", "")) || NaN; const bRowNumber = parseInt(b[0].replace("Row ", "")) || NaN; return aRowNumber - bRowNumber;})
                            .map(([row, course]) => {
                                const rowNumber = parseInt(row.replace("Row ", "")) || NaN;
                                return (
                                <div key={row} className="w-full flex">
                                    <div className="w-[90%] flex gap-5">
                                    <div className="w-[5%]">{`${rowNumber}`}</div>
                                        <CourseRow style="w-[15%]" type={"text"} rowIndex={row} value={course["KODE"]}editable={editable} editableRowIndex={editableRowIndex} onChange={(e) => handleInputChange(e, row, "KODE")} />
                                        <CourseRow style="w-[75%]" type={"text"} rowIndex={row} value={course["MATA KULIAH"]} editable={editable} editableRowIndex={editableRowIndex} onChange={(e) => handleInputChange(e, row, "MATA KULIAH")} />
                                        <CourseRow style="w-[5%]" type={"text"} rowIndex={row} value={course["SKS"]} editable={editable} editableRowIndex={editableRowIndex} onChange={(e) => handleInputChange(e, row, "SKS")} />
                                    </div>
                                
                                    {editMode && (
                                    <div className="w-[10%] flex justify-around">
                                        {editable && editableRowIndex == row ? (
                                        <>
                                            <button onClick={handleSaveClick}>Simpan</button>
                                            <button onClick={handleCancelClick}>cancel</button>
                                        </>
                                        ) : (
                                        <>
                                            <button onClick={() => handleEditClick(row)}>edit</button>
                                            <button onClick={() => handleDeleteCourse(row)}>delete</button>
                                        </>
                                        )}
                                    </div>
                                    )}
                                </div>
                                );
                            })}

						</div>						
					</div>

					{editMode && editable == false && (
                        <div className='w-full flex'>
                            <div className='flex w-[90%] gap-5'>
                                <div className='w-[5%]'></div>
                            <div className='w-[15%]'>
                                <input
                                type="text" 
                                placeholder='kode'
                                className='w-full px-2 py-1'
                                value={newCourse?.KODE || ''}
                                onChange={(e) => setNewCourse({ ...newCourse, KODE: e.target.value })}
                                />
                            </div>
                            <div className='w-[75%]'>
                                <input
                                type="text"
                                placeholder='mata kuliah'
                                className='w-full px-2 py-1'
                                value={newCourse?.['MATA KULIAH'] || ''}
                                onChange={(e) => setNewCourse({ ...newCourse, 'MATA KULIAH': e.target.value })}
                                />
                            </div>
                            <div className='w-[5%]'>
                                <input
                                type="text"
                                placeholder='sks'
                                className='w-full px-2 py-1'
                                value={newCourse?.SKS || ''}
                                onChange={(e) => setNewCourse({ ...newCourse, SKS: e.target.value })}
                                />
                            </div>
                            </div>
                            <div className='w-[10%] flex items-center pl-3'>
                            <button onClick={handleAddCourse} className='h-full'>
                                Tambah
                            </button>
                            </div>
                        </div>
					)}
				</div>
			</div>
            <div className='w-full flex justify-end px-40'>
                <button>Mulai Pendaftaran</button>
            </div>
		</div>
	);
};

export default KaprodiUI;