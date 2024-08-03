import { useId, useState } from "react";
import Navbar from "@/app/component/navbar"
import DosenUI from "./Interface";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { getAuthUser, getUserData } from "../component/serverfunction";


interface User {
	user_id:Number,
	user_prodi: number
}

interface user3 {
	data: User
}

interface user2 {
	userData: user3
}

interface user1 {
	user:  user2
}

const DosenHome = async () => {

	const auth = await getAuthUser()
	const userData = await getUserData(auth.user?.id);

	const user = userData.data
	
	const supabase = createServerSupabaseClient();

	// Check if user is registered in 'registereddosen' table
    const { data: registeredData, error: registeredError } = await supabase
        .from('registereddosen')
        .select('*')
        .eq('dosenID', user.user_id);

	var isRegistered
	if (registeredData) {
		isRegistered = registeredData?.length > 0;
	}

    const currentTime = new Date().toISOString();

    // Check if 'pendaftaran' table is empty or not
    const { data: registrationData, error: registrationError } = await supabase
        .from('pendaftaran')
        .select('*')
        .eq('prodi', user.user_prodi);		

	var isRegistration
	if (registrationData) {
		isRegistration = registrationData?.some(entry => entry.bataswaktu > currentTime);
	}  
	console.log(registrationData);
	console.log('user_prodi : ', user.user_prodi);
	console.log('current time', currentTime);
	
	console.log("isregristasion", isRegistration);
	
	
	
	return(
		<div className="h-screen w-screen bg-neutral-500">
			<Navbar />
			
			{isRegistration? <div className="h-[90%] w-full">
				{ !isRegistered? (<DosenUI user={user} />
				) : ( <div className="h-full bg-green-400 w-full text-2xl flex justify-center items-center"><h1>ANDA SUDAH MELAKUKAN PENGAJUAN MATA KULIAH</h1></div>)}
			</div>: <div className="h-full bg-green-400 w-full text-2xl flex justify-center items-center">Belum ada pendaftaran</div>}
		</div>
		
	)
}

export default DosenHome