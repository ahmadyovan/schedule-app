import Navbar from "../component/navbar"
import { getToken } from "../component/serverfunction";
import DosenUI from "./UI";

const DosenHome = async () => {

	const tokens = await getToken();
    
	return(
		<div className="h-screen w-screen">
			<Navbar email={tokens.decodedToken.email} />
            <DosenUI UID={tokens.decodedToken.uid}/>
		</div>
		
	)
}

export default DosenHome