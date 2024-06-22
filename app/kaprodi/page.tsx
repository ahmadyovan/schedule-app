import { getProdi, getnama } from "../component/functions";
import Navbar from "../component/navbar"
import { getToken } from "../component/serverfunction";
import KaprodiInterface from "./Interface";

const KaprodiHome = async () => {

	const tokens = await getToken();
  	const userRole = tokens ? await getProdi(tokens.decodedToken.uid) : null;
	const user = await getnama(tokens.decodedToken.uid)

	return(
		<div className="h-screen w-screen">
			<Navbar nama={user} />
			<div className="h-[90%] w-full">
				<KaprodiInterface role={userRole}/>
			</div>
		</div>
		
	)
}

export default KaprodiHome