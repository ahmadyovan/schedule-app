'use client'

import Navbar from "@/components/navbar"
import { useUser } from "@/app/context/UserContext";
import { redirect } from "next/navigation";

const home = async () => {

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const user = useUser();
    
    if (user.job == 'kaprodi') redirect('/kaprodi');
    if (user.job == 'dosen') redirect('/dosen');
    if (user.job == 'admin') redirect('/admin');

    return(
        <div>
            <Navbar />
            <h1>Halaman tidak dapat di akses</h1>
        </div>
    )
}

export default home