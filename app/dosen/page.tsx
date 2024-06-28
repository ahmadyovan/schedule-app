import { useId } from "react";
import { getUserName, getJob, fetchRegistrationStatus, } from "../component/functions";
import Navbar from "../component/navbar"
import { getToken } from "../component/serverfunction";
import DosenUI from "./UI";
import { checkUserRegistration } from "../component/functions";
import { redirect } from "next/navigation";

const DosenHome = async () => {

	const tokens = await getToken();
	const user = await getUserName(tokens.decodedToken.uid)

	const job = await getJob(tokens.decodedToken.uid)

	if (job != 'Dosen') {
		redirect('/login')
	}

	const isRegistered = await checkUserRegistration(tokens.decodedToken.uid);
	const startRegistration = await fetchRegistrationStatus()
	
	return(
		<div className="h-screen w-screen">
			<Navbar nama={user || ''} />
			{startRegistration? <div className="h-[90%] w-full">
				{ !isRegistered? (<DosenUI uid={tokens.decodedToken.uid} namadosen={user || ''}/>
				) : ( <div className="h-full bg-green-400 w-full text-2xl flex justify-center items-center"><h1>ANDA SUDAH MELAKUKAN PENGAJUAN MATA KULIAH</h1></div>)}
			</div>: <div className="h-full bg-green-400 w-full text-2xl flex justify-center items-center">Belum ada pendaftaran</div>}
		</div>
		
	)
}

export default DosenHome