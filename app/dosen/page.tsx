import { useId } from "react";
import { getnama } from "../component/functions";
import Navbar from "../component/navbar"
import { getToken } from "../component/serverfunction";
import DosenUI from "./UI";

const DosenHome = async () => {

	const tokens = await getToken();
	const user = await getnama(tokens.decodedToken.uid)
	
	return(
		<div className="h-screen w-screen">
			<Navbar nama={user} />
            <DosenUI uid={tokens.decodedToken.uid} namadosen={user}/>
		</div>
		
	)
}

export default DosenHome