import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../libs/firebase/firebase";
import Logout from "./ButtonLogOut";
import { getToken } from "./serverfunction";

export default async function Navbar() {

    const tokens = await getToken();

    return (
        <nav className="h-[10%] w-full flex justify-end px-10">
             <div className="flex justify-between space-x-10 items-center">
                <h1>{tokens.decodedToken.email}</h1>
                <Logout />
            </div>
        </nav>
    )
  }