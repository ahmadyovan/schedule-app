'use client'

import Button from "./button"
import { signOut } from "firebase/auth";
import { auth } from "../libs/firebase/firebase";
import { useRouter } from "next/navigation";

const Logout = () => {

    const router = useRouter()

    async function handleLogout() {
        await signOut(auth);
    
        await fetch("/api/logout");
    
        router.push("/login");
    }

    return <button onClick={handleLogout}>log out</button>
}

export default Logout