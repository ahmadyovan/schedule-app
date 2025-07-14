'use client'

import { redirect } from "next/navigation"

const Home = () => {
    return(
        <div className="flex flex-col gap-5 text-black text-2xl">
            <button onClick={() => redirect('/kaprodi/kurikulum')}>Kurikulum</button>
            <button onClick={() => redirect('/kaprodi/penjadwalan')}>Penjadwalan</button>
        </div>
    )
}

export default Home