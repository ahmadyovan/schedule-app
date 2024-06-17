"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../libs/firebase/firebase";

interface HomePageProps {
  email?: string;
  userRole: string
}

export default function HomePage({ email, userRole }: HomePageProps) {
    const router = useRouter();

    if (userRole == 'Dosen') router.push('/dosen')
    if (userRole == 'Kaprodi') router.push('/kaprodi')

    return (
        <div>
        
        </div>
    );    
}