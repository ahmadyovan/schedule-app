import { useId } from "react";
import Navbar from "@/app/component/navbar"
import DosenUI from "./Interface";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { getAuthUser, getUserData } from "../component/serverfunction";


const DosenHome = async () => {

	const startRegistration = true
	const isRegistered = false
	
	return(
		<div className="h-screen w-screen bg-neutral-500">
			<Navbar />
			
			{startRegistration? <div className="h-[90%] w-full">
				{ !isRegistered? (<DosenUI />
				) : ( <div className="h-full bg-green-400 w-full text-2xl flex justify-center items-center"><h1>ANDA SUDAH MELAKUKAN PENGAJUAN MATA KULIAH</h1></div>)}
			</div>: <div className="h-full bg-green-400 w-full text-2xl flex justify-center items-center">Belum ada pendaftaran</div>}
		</div>
		
	)
}

export default DosenHome