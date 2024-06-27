import { useId } from "react";
import { getUserName, getJob } from "../component/functions";
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
	
	return(
		<div className="h-screen w-screen">
			<Navbar nama={user || ''} />
            { !isRegistered? (<DosenUI uid={tokens.decodedToken.uid} namadosen={user || ''}/>
			) : (
			<div className="h-[90%] bg-green-400 w-full text-2xl flex justify-center items-center"><h1>ANDA SUDAH MELAKUKAN PENGAJUAN MATA KULIAH</h1></div>)}
		</div>
		
	)
}

export default DosenHome