
import { redirect } from "next/navigation";
import { getProdi, getJob, getUserName } from "../component/functions";
import Navbar from "../component/navbar"
import { getToken } from "../component/serverfunction";
import KaprodiInterface from "./Interface";

const KaprodiHome = async () => {

	const tokens = await getToken();
  	const userRole = tokens ? await getProdi(tokens.decodedToken.uid) : null;
	const user = await getUserName(tokens.decodedToken.uid)
	const job = await getJob(tokens.decodedToken.uid)

	if (job != 'Kaprodi') {
		redirect('/login')
	}

	return(
		<div className="h-screen w-screen">
			<Navbar nama={user || ''} />
			<div className="h-[90%] w-full overflow-hidden">
				<KaprodiInterface role={userRole || ''}/>
			</div>
		</div>
	)
}

export default KaprodiHome