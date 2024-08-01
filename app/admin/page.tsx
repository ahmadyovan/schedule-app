import Navbar from "../component/navbar"
import Interface from "./Interface"


const AdminHome = () => {
    return (
        <div className="h-screen w-screen">
            <Navbar  />
			<div className="h-[90%] w-full overflow-hidden">
				<Interface />
			</div>
        </div>
    )
}

export default AdminHome