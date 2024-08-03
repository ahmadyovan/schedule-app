
import Navbar from "@/app/component/navbar"
import KaprodiInterface from "./Interface";
import { getUserData, getAuthUser } from "../component/serverfunction";

const KaprodiHome = async () => {

	const auth = await getAuthUser()
	const userData = await getUserData(auth.user?.id);

	console.log(auth);
	console.log("dddd", userData.data);
	

	return(
		<div className="h-screen w-screen">
			<Navbar  />
			<div className="h-[90%] w-full overflow-hidden">
				<KaprodiInterface userData={userData} />
			</div>
		</div>
	)
}

export default KaprodiHome