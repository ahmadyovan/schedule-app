"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../libs/firebase/firebase";
import Logout from "./ButtonLogOut";

interface HomePageProps {
  email?: any;
  userRole: string
}

export default function HomePage({ email, userRole }: HomePageProps) {
    const router = useRouter();
    console.log('role ' + userRole);
    
    if (userRole == 'Dosen') router.push('/dosen')
    if (userRole == 'Kaprodi') router.push('/kaprodi')

    return (
        <div>
          <div>{userRole}</div>
          <Logout />
        </div>
    );    
}