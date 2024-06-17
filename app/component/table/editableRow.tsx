"use client"

interface row {
    value: string | undefined,
    onChange: (e: any) => void
}

const EditableRow = ({value, onChange}: row) => {
    return(
        <div>
            <input type="text" value={value} onChange={onChange} />
        </div>
    )
}