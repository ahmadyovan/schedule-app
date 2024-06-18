import Logout from "./ButtonLogOut";
import { getToken } from "./serverfunction";

interface emailtype {
    email: string | undefined
}

export default async function Navbar({email}: emailtype) {

    return (
        <nav className="h-[10%] w-full bg-neutral-800 flex justify-end px-10">
             <div className="flex justify-between space-x-10 items-center">
                <h1>{email}</h1>
                <Logout />
            </div>
        </nav>
    )
  }