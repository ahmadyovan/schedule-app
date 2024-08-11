'use client'

import { useState } from "react";
import SideNavbar from "@/app/component/sidenavbar"
import KaprodiHome from "@/app/component/kaprodi/home";
import VerifikasiPage from "@/app/component/kaprodi/verifikasiPage";
import Jadwal from "@/app/component/kaprodi/jadwal";
import Kelas from "@/app/component/kaprodi/kelas";

const Interface = (UserData: any) => {
    console.log("", UserData);
    
    const [selectedMenu, setSelectedMenu] = useState('matakuliah');
    const handleMenuSelect = (menu: 'matakuliah' | 'verifikasi' | 'jadwal' | 'kelas') => {
        setSelectedMenu(menu);
    };

    return(
        <div className='h-full w-full bg-neutral-500 flex'>
            <div className="h-full">
                <SideNavbar onMenuSelect={handleMenuSelect} />
            </div>
            <div className="h-full w-full border-4">
                { selectedMenu == 'matakuliah' && (<section className="h-full w-full">
                    <KaprodiHome user={UserData} />
                </section>)}

                { selectedMenu == 'verifikasi' && (<section className="h-full w-full">
                    <VerifikasiPage />
                </section>)}

                { selectedMenu == 'jadwal' && (<section className="h-full w-full ">
                    <Jadwal  />
                </section>)}
            </div>
        </div>
    )
}

export default Interface