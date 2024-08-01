
import Navbar from "@/app/component/navbar"
import KaprodiInterface from "./Interface";

const KaprodiHome = async () => {

	return(
		<div className="h-screen w-screen">
			<Navbar  />
			<div className="h-[90%] w-full overflow-hidden">
				<KaprodiInterface />
			</div>
		</div>
	)
}

export default KaprodiHome