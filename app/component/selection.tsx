import { ChangeEvent, useCallback, useState } from "react";

interface SelectType {
    propsvalue: any[];
    handlevalue: (value: string) => void; // Ubah tipe data handlevalue menjadi fungsi
}

const CustomSelect = ({ propsvalue, handlevalue }: SelectType) => {
    const [value, setValue] = useState<string>("");

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const selectedValue = e.target.value;
            setValue(selectedValue)
            handlevalue(selectedValue); // Panggil fungsi callback handlevalue dengan nilai terpilih
        },
        [handlevalue]
    );

    return (
        <div>
            <select className="max-w-60" id="prodi" value={value} onChange={handleChange}>
                <option value="">Pilih Prodi</option>
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