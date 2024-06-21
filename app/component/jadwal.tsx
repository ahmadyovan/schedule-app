import React from 'react';

type MataKuliah = {
    matakuliah: string;
    hari: string;
    waktu: string;
    prodi: string;
};

type Dosen = {
    [key: string]: {
        [key: string]: MataKuliah;
    };
};

const Jadwal = () => {

    const user: Dosen = {
        "ISTUROM ARIF, ST, MT": {
            "mata kuliah 1": {
                "matakuliah": " MT. KULIAH PILIHAN 1 (PEMROG MIKROKONTROLLER)",
                "hari": "Selasa",
                "waktu": "20:00 - 22:00",
                "prodi": "Teknik Informatika"
            }
        },
        "KHAIRIL ANAM, S.Kom, M.Kom": {
            "mata kuliah 1": {
                "matakuliah": "MT. KULIAH PILIHAN 2 (PEMROG ROBOTIKA)",
                "hari": "Kamis",
                "waktu": "18:00 - 20:00",
                "prodi": "Desain Komunikasi Visual"
            }
        },
        "ONNY DWI HARTONO": {
            "mata kuliah 1": {
                "matakuliah": "MOBILE PROGRAMMING",
                "hari": "Kamis",
                "waktu": "20:00 - 22:00",
                "prodi": "Desain Komunikasi Visual"
            }
        },
        "NAMBI SEMBILU, S.Kom, M.Kom": {
            "mata kuliah 1": {
                "matakuliah": "BIG DATA",
                "hari": "Jumat",
                "waktu": "18:00 - 20:00",
                "prodi": "Desain Komunikasi Visual"
            },
            "mata kuliah 2": {
                "matakuliah": "Manajemen",
                "hari": "Selasa",
                "waktu": "18:00 - 20:00",
                "prodi": "Teknik Komputer"
            },
            "mata kuliah 3": {
                "matakuliah": "Bahasa Inggris",
                "hari": "Jumat",
                "waktu": "20:00 - 22:00",
                "prodi": "Teknik Industri"
            }
        }
    };

    const jadwalItems: { dosen: string; matakuliah: string; hari: string; waktu: string; prodi: string }[] = [];

    for (const dosen in user) {
        for (const matkul in user[dosen]) {
            jadwalItems.push({
                dosen: dosen,
                matakuliah: user[dosen][matkul].matakuliah,
                hari: user[dosen][matkul].hari,
                waktu: user[dosen][matkul].waktu,
                prodi: user[dosen][matkul].prodi
            });
        }
    }

    return (
        <table className='h-96 flex w-screen overflow-y-auto justify-center text-white '>
            <div className='w-[70%] flex flex-col items-center gap-5 bg-neutral-800'>
                    <div className='w-full flex h-14'>
                        <th className='w-[20%]'>Dosen</th>
                        <th className='w-[43%]'>Mata Kuliah</th>
                        <th className='w-[10%]'>Hari</th>
                        <th className='w-[15%]'>Waktu</th>
                        <th className='w-[15%]'>Prodi</th>
                    </div>
                <div className='w-full'>
                    {jadwalItems.map((item, index) => (
                        <tr key={index} className={`flex gap-5 w-full ${index % 2 === 0 ?  'bg-neutral-700 ' : 'bg-neutral-600'}  px-10 py-2`}>
                            <td className='w-[20%]'>{item.dosen}</td>
                            <td className='w-[50%]'>{item.matakuliah}</td>
                            <td className='w-[10%]'>{item.hari}</td>
                            <td className='w-[12%]'>{item.waktu}</td>
                            <td className='w-[15%]'>{item.prodi}</td>
                        </tr>
                    ))}
                </div>
            </div>
        </table>
    );
};

export default Jadwal;
