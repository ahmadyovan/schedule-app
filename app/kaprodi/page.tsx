import { getProdi } from "../component/functions";
import Navbar from "../component/navbar"
import { getToken } from "../component/serverfunction";
import KaprodiUI from "./UI"

const KaprodiHome = async () => {

	const tokens = await getToken();
  	const userRole = tokens ? await getProdi(tokens.decodedToken.uid) : null;

	return(
		<div className="h-screen w-screen">
			<Navbar />
			<KaprodiUI prodiProps={userRole} />
		</div>
		
	)
}

export default KaprodiHome