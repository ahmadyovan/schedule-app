'use client'

interface Row {
    style: string,
    type: string,
    placeHolder: string | undefined,
    rowIndex: string | null,
    value: string | undefined,
    editable: boolean,
    DataInput: boolean,
    editableRowIndex: string,
    onChange: (e: any) => void

}

const CourseRow = ({ style, type, placeHolder, rowIndex, value, editable, DataInput, editableRowIndex, onChange}: Row) => {

    return(
        <div className={style}>
            {!DataInput? (
                <div>
                { editable && editableRowIndex == rowIndex? (
                    <input className={`text-black`} type={type} placeholder={placeHolder} value={value} onChange={onChange} />
                ):(
                    <div className="w-full">{value}</div>
                )}
                </div>
            ): (
                <div>
                    <input className={`text-black`} type={type} placeholder={placeHolder} value={value} onChange={onChange} />
                </div>
            )}
        </div> 
    )
}

export default CourseRow