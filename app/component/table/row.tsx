'use client'

interface Row {
    style: string,
    type: string,
    rowIndex: string,
    value: string | undefined,
    editable: boolean,
    editableRowIndex: string,
    onChange: (e: any) => void

}

const CourseRow = ({ style, type, rowIndex, value, editable, editableRowIndex, onChange}: Row) => {
    return(
        <div className={style}>
			{ editable && editableRowIndex == rowIndex? (
				<input type={type} value={value} onChange={onChange} />
			):(
				<div>{value}</div>
			)}
		</div>
    )
}

export default CourseRow