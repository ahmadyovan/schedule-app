"use client";

import { useRouter } from "next/navigation";

import Logout from "./ButtonLogOut";

interface HomePageProps {
	uuid: string
	email?: any;
	userRole: string
}

export default function HomePage({ uuid, email, userRole }: HomePageProps) {
    const router = useRouter();
    console.log('role ' + userRole);
    
    if (userRole == 'Dosen') router.push('/dosen')
    if (userRole == 'Kaprodi') router.push('/kaprodi')

    return (
        <div>
          {uuid}
          <div>{userRole}</div>
          <Logout />
        </div>
    );    
}