"use client";

import { useRouter } from "next/navigation";

interface HomePageProps {
	uuid: string
	email?: any;
	name: string
  job: string,
  prodi: string
}

export default function HomePage({ uuid, email, name, job, prodi }: HomePageProps) {
    const router = useRouter();
    console.log('role ' + job);
    
    if (job == 'admin') router.push('/admin')
    if (job == 'Dosen') router.push('/dosen')
    if (job == 'Kaprodi') router.push('/kaprodi')

    return (
        <div>
          {uuid}
          <div>{job}</div>
          <h1>{name}</h1>
          <h1>{prodi}</h1>
          <div>{prodi}</div>
        </div>
    );    
}