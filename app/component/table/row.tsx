'use client'

interface Row {
    style: string,
    type: string,
    placeHolder: string | undefined,
    rowIndex: number | null,
    value: string | number | undefined,
    editable: boolean,
    DataInput: boolean,
    editableRowIndex: number | undefined,
    onChange: (e: any) => void

}

const CourseRow = ({ style, type, placeHolder, rowIndex, value, editable, DataInput, editableRowIndex, onChange}: Row) => {

    return(
        <div className={style}>
            {!DataInput? (
                <div>
                { editable && editableRowIndex == rowIndex? (
                    <input className={`text-black w-full`} type={type} placeholder={placeHolder} value={value} onChange={onChange} />
                ):(
                    <div className="w-full">{value}</div>
                )}
                </div>
            ): (
                <div className="w-full">
                    <input className={`text-black w-full`} type={type} placeholder={placeHolder} value={value} onChange={onChange} />
                </div>
            )}
        </div> 
    )
}

export default CourseRow