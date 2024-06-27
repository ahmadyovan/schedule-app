import { ChangeEvent, useCallback, useState } from "react";

interface SelectType {
    name: string,
    propsvalue: any[];
    handlevalue: (value: string) => void; // Correctly define the handlevalue prop as a function
}

const CustomSelect = ({ name, propsvalue, handlevalue }: SelectType) => {
    const [value, setValue] = useState<string>("");

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const selectedValue = e.target.value;
            setValue(selectedValue);
            handlevalue(selectedValue); // Pass the selected value to the handlevalue function
        },
        [handlevalue]
    );

    return (
        <div className="flex gap-5">
            <select className="max-w-60 bg-neutral-800 text-gray-300"  id="" value={value} onChange={handleChange}>
                { !value && (<option  value="">Pilih {name}</option>)}
                {propsvalue.map((prodi: any) => (
                    <option key={prodi} value={prodi}>
                        {prodi}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CustomSelect;
