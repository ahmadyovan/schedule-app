'use client'

import { useState } from "react";
import { Courses, MataKuliah } from '@/app/component/types'
import CourseRow from "./row";

interface CourseTableProps {
    courses: Courses;
    selectedSemester: string;
    selectedPeriod: string;
    editable: boolean;
    editableRowIndex: string;
    editMode: boolean;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, row: string, field: keyof MataKuliah) => void;
    handleEditClick: (row: string) => void;
    handleSaveClick: () => void;
    handleCancelClick: () => void;
    handleDeleteCourse: (row: string) => void;
  }

const CourseTable = ({
    courses,
  	selectedSemester,
  	selectedPeriod,
  	editable,
  	editableRowIndex,
  	editMode,
  	handleInputChange,
  	handleEditClick,
  	handleSaveClick,
  	handleCancelClick,
  	handleDeleteCourse,
}: CourseTableProps) => {

    return(
        <div className='h-60 w-full overflow-y-auto flex'>
			<div className='h-full w-full'>
				{selectedSemester && selectedPeriod &&
				courses[selectedSemester] &&
				courses[selectedSemester][selectedPeriod] &&
				Object.entries(courses[selectedSemester][selectedPeriod]).map(([row, course]) => {
					return (
						<div key={row} className='w-full flex'>
							<div className='w-[90%] flex gap-5'>
								<CourseRow width="w-[15%]" type={"text"} rowIndex={row} value={course['KODE']} editable={editable} editableRowIndex={editableRowIndex} onChange={(e) => handleInputChange(e, row, 'KODE')}/>
								<CourseRow width="w-[15%]" type={"text"} rowIndex={row} value={course['KODE']} editable={editable} editableRowIndex={editableRowIndex} onChange={(e) => handleInputChange(e, row, 'KODE')}/>
								<CourseRow width="w-[15%]" type={"text"} rowIndex={row} value={course['KODE']} editable={editable} editableRowIndex={editableRowIndex} onChange={(e) => handleInputChange(e, row, 'KODE')}/>
							</div>
								
							{ editMode && (<div className='w-[10%] flex justify-around'>
								{ editable && editableRowIndex == row? <button onClick={handleSaveClick}>Simpan</button>: <button onClick={() => handleEditClick(row)}>edit</button> }
								{ editable && editableRowIndex == row? <button onClick={handleCancelClick}>cancel</button> : <button onClick={() => handleDeleteCourse(row)}>delete</button>}
							</div>)}
						</div>
					);
				})}
			</div>						
		</div>
    )
}

export default CourseTable