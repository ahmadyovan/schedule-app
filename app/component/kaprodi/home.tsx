import { useEffect, useState } from "react";
import CourseRow from "../table/row";
import { Courses, MataKuliah, Prodi } from "../types";
import { addCourse, checkUserRegistration, deleteCourse, deleteregistration, fetchCourses, fetchRegistrationStatus, fetchRegistrationStatus2, updateCourse } from "../functions";
import CustomSelect from "../selection";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaPencil } from "react-icons/fa6";
import { db, get, onValue, ref, set, update } from "@/app/libs/firebase/firebase";

interface Proditype {
    programStudi: string
}

const KaprodiHome = ( {programStudi}: Proditype ) => {

    const [courses, setCourses] = useState<Prodi>({});
  	const [selectedSemester, setSelectedSemester] = useState('');
  	const [selectedPeriod, setSelectedPeriod] = useState('');
    const [editable, setEditable] = useState<boolean>(false);
    const [editableRowIndex, setEditableRowIndex] = useState<string>('');
    const [originalCourse, setOriginalCourse] = useState<MataKuliah>();
    const [newCourse, setNewCourse] = useState<MataKuliah>();
    const [updatedCourse, setUpdatedCourse] = useState<MataKuliah>();
    const [editMode, setEditMode] = useState(false);
    const [toggle, setToggle] = useState<boolean>(false)
    const [showConfirmation, setShowConfirmation] = useState(false);

    const semesters = Array.from( new Set(Object.keys(courses)));
    const periods = Array.from( new Set(Object.keys(courses[selectedSemester] || {}).sort((a, b) => parseInt(a) - parseInt(b))));
    
    const [startRegistration, setStartRegistration] = useState(false);

  useEffect(() => {
    const unsubscribe = fetchRegistrationStatus2(setStartRegistration);

    // Membersihkan listener ketika komponen dilepas dari DOM
    return () => unsubscribe();
  }, []);

    useEffect(() => {
		const unsubscribe = fetchCourses(programStudi, setCourses);
        
		return unsubscribe;
	}, [programStudi]);

    useEffect(() => {
        
      }, []);
      

    const handleAddCourse = async () => {
        if (programStudi && newCourse && selectedSemester && selectedPeriod) {
            await addCourse(programStudi, selectedSemester, selectedPeriod, newCourse);
            setNewCourse({}); // Reset the newCourse state after adding the course
        }
    };

    const handleUpdateCourse = async (row: string, kode: string, mataKuliah: string, sks: string) => {

		const updatedCourse: MataKuliah = {
			'KODE': kode,
			'MATA KULIAH': mataKuliah,
			'SKS': sks
		};

		if (programStudi && selectedSemester && selectedPeriod && row && updatedCourse){
			await updateCourse(programStudi, selectedSemester, selectedPeriod, row, updatedCourse)
			setOriginalCourse({});
		}

        setEditable(false);
	    setEditableRowIndex('');

	};

    const handleDeleteCourse = async (row: string) => {
        await deleteCourse(programStudi, selectedSemester, selectedPeriod, row);
    };

    const handleSemesterChange = (value: string) => {
        setSelectedSemester(value);
        setSelectedPeriod('');
    };

    const handlePeriodChange = (value: string) => {
        setSelectedPeriod(value);
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

    const handlerSendCourse = () => {
        setShowConfirmation(true);
    };

	const handleConfirmation = async (value: boolean) => {
        
        if (value) {
            if(startRegistration == true) setRegistration(false)
            if(startRegistration == false) {
                setRegistration(true)
                deleteregistration()
            } 
        }
        setShowConfirmation(false);
    }

    const setRegistration = async (props: boolean) => {
        try {
            const courseRef = ref(db, '/registration');
            await set(courseRef, {"startRegistration" : props});
        } catch (error) {
            console.error('Error updating course:', error);
        }
    }
    
    return(
        <div className='h-full w-full flex flex-col justify-center px-24 py-24 items-center gap-5'>

            <h1 className='text-4xl text-white'>{programStudi}</h1>

            <div className="h-full w-full min-w-[1330px] flex flex-col items-center rounded-3xl overflow-hidden border-4 border-gray-300">

                <div className='w-full flex justify-between py-10 text-black bg-neutral-700 px-10'>
			    	<div className='h-full flex gap-20'>
			    		<CustomSelect name="Semester" propsvalue={semesters} handlevalue={handleSemesterChange} />
			    		<CustomSelect name="Periode" propsvalue={periods} handlevalue={handlePeriodChange} />
			    	</div>

			    	<div className="text-white cursor-pointer" onClick={() => handleEditMode()}>{editMode? "Keluar mode edit" : "Masuk mode edit"}</div>
        
			    </div>

			    <div className='h-full w-full flex flex-col overflow-hidden bg-neutral-800 text-white'>

			    	<div className='w-full flex py-3 px-10'>
                        <div className="w-[90%] flex gap-5">
                            <div className='w-[5%]'>No</div>
			    		    <div className='w-[15%]'>KODE</div>
                            <div className='w-[75%]'>Mata kuliah</div>
                            <div className='w-[5%]'>SKS</div>
                        </div>
                        
                        <div className='w-[10%]'></div>
               
			    	</div> 

			    	<div className='h-full overflow-y-auto flex no-scrollbar'>
			    		<div className='h-full w-full '>
                            {selectedSemester && selectedPeriod &&
                            courses[selectedSemester] &&
                            courses[selectedSemester][selectedPeriod] &&
                            Object.entries(courses[selectedSemester][selectedPeriod])
                            .sort((a, b) => {const aRowNumber = parseInt(a[0].replace("Row ", "")) || NaN; const bRowNumber = parseInt(b[0].replace("Row ", "")) || NaN; return aRowNumber - bRowNumber;})
                            .map(([row, course]) => {
                                const rowNumber = parseInt(row.replace("Row ", ""));
                                if (Number.isNaN(rowNumber)) {
                                    return null; // Tidak menampilkan baris jika rowNumber adalah NaN
                                }
                                return (
                                <div key={row} className={`flex w-full ${rowNumber % 2 === 0 ?  'bg-neutral-700 ' : 'bg-neutral-600'} px-10 py-2`}>
			    					<div className="w-[90%] flex gap-5">
			    					    <div className="w-[5%]" >{`${rowNumber}`}</div>
			    						<CourseRow style="w-[15%]" placeHolder="" type={"text"} rowIndex={row} DataInput={false} value={course["KODE"]}editable={editable} editableRowIndex={editableRowIndex} onChange={(e) => handleInputChange(e, row, "KODE")} />
			    						<CourseRow style="w-[75%]" placeHolder="" type={"text"} rowIndex={row} DataInput={false} value={course["MATA KULIAH"]} editable={editable} editableRowIndex={editableRowIndex} onChange={(e) => handleInputChange(e, row, "MATA KULIAH")} />
			    						<CourseRow style="w-[5%]" placeHolder="" type={"text"} rowIndex={row} DataInput={false} value={course["SKS"]} editable={editable} editableRowIndex={editableRowIndex} onChange={(e) => handleInputChange(e, row, "SKS")} />
			    					</div>
                            
                                    <div className="w-[10%] flex justify-around">
                                        { editMode && (
                                        <div>
                                            {editable && editableRowIndex == row ? (
                                            <div className="flex justify-around gap-5 px-2">
                                                <button onClick={handleSaveClick}>Simpan</button>
                                                <button onClick={handleCancelClick}>cancel</button>
                                            </div>
                                            ) : (
                                            <div className="flex justify-around gap-5 px-2">
                                                <button onClick={() => handleEditClick(row)}>{<FaPencil />}</button>
                                                <button onClick={() => handleDeleteCourse(row)}>{<FaRegTrashCan />}</button>
                                            </div>
                                            )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                );
                            })}
			    		</div>						
			    	</div>

			    	{editMode && (
                        <div className='w-full py-5 flex items-center text-white'>
                          {editable == false && (
                            <div className='flex w-full px-10'>
                                <div className="w-[90%] flex gap-5">
                                    <div className='w-[5%]'></div>
                                    <div className="w-[15%]">
                                        <CourseRow style="w-full" type={"text"} DataInput={true} placeHolder="Kode" rowIndex={null} value={newCourse?.['KODE'] || ''} editable={editable} editableRowIndex={editableRowIndex} onChange={(e) => setNewCourse({ ...newCourse, 'KODE': e.target.value })} />
                                    </div>
                                    <div className="w-[75%]">
                                        <CourseRow style="w-full" type={"text"} DataInput={true} placeHolder="Mata kuliah" rowIndex={null} value={newCourse?.['MATA KULIAH'] || ''} editable={editable} editableRowIndex={editableRowIndex} onChange={(e) => setNewCourse({ ...newCourse, 'MATA KULIAH': e.target.value })} />
                                    </div>
                                    <div className="w-[5%]">
                                        <CourseRow style="w-fit" type={"text"} DataInput={true} placeHolder="SKS" rowIndex={null} value={newCourse?.['SKS'] || ''} editable={editable} editableRowIndex={editableRowIndex} onChange={(e) => setNewCourse({ ...newCourse, 'SKS': e.target.value })} />
                                    </div>
                                </div>
                                <div className="w-[10%] text-center cursor-pointer" onClick={handleAddCourse}>Tambah</div>
                            </div>
                          )}  
                        </div>
			    	)}
			    </div>
            </div>  

			<div className='w-full flex justify-end'>
            {!startRegistration? (
                <button onClick={handlerSendCourse} className='bg-neutral-600 py-5 px-10 rounded-3xl text-white'>Mulai Pendaftaran</button>
            ):  <button onClick={handlerSendCourse} className='bg-neutral-600 py-5 px-10 rounded-3xl text-white'>Batalkan</button>}
            </div>

            {showConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    {!startRegistration? (
                        <div className="bg-white p-6 rounded-md text-lg text-neutral-800">
                            <h2 className="text-lg font-bold mb-4">memulai pendaftaran</h2>
                            <div className="flex justify-between gap-2">
                                <button onClick={() => handleConfirmation(false)} className="px-4 py-2 w-20 bg-neutral-600 text-white rounded-md" >Tidak</button>
                                <button onClick={() => handleConfirmation(true)} className="px-4 py-2 w-20 bg-green-500 text-white rounded-md"> Ya </button>
                            </div>
                        </div>
                    ): (
                        <div className="bg-white p-6 rounded-md text-lg text-neutral-800">
                            <h2 className="text-lg font-bold mb-4">batalkan pendaftaran</h2>
                            <div className="flex justify-between gap-2">
                                <button onClick={() => handleConfirmation(false)} className="px-4 py-2 w-20 bg-neutral-600 text-white rounded-md" >Tidak</button>
                                <button onClick={() => handleConfirmation(true)} className="px-4 py-2 w-20 bg-green-500 text-white rounded-md"> Ya </button>
                            </div>
                        </div>
                    )}
                    
                </div>
            )}

		</div>
    )
}

export default KaprodiHome