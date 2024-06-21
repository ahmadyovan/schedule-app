'use client'

import { useState } from "react";
import SideNavbar from "../component/sidenavbar"
import KaprodiHome from "../component/kaprodi/home";
import VerifikasiPage from "../component/kaprodi/verifikasiPage";

interface kaprodiRole {
    role: string;
}

const Interface = ({role}: kaprodiRole) => {

    const [selectedMenu, setSelectedMenu] = useState('verifikasi');
    const handleMenuSelect = (menu: 'matakuliah' | 'verifikasi') => {
        setSelectedMenu(menu);
    };

    return(
        <div className='h-full w-full bg-green-400 flex'>
            <div className="h-full">
                <SideNavbar onMenuSelect={handleMenuSelect} />
            </div>
            <div className="h-full w-full border-4">
                { selectedMenu == 'matakuliah' && (<section className="h-full w-full">
                    <KaprodiHome programStudi={role} />
                </section>)}

                { selectedMenu == 'verifikasi' && (<section className="h-full w-full">
                    <VerifikasiPage programStudi={role} />
                </section>)}
            </div>
        </div>
    )
}

export default Interface