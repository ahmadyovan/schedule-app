'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/libs/firebase/firebase';
import { signInWithEmailAndPassword } from "firebase/auth"

export default function Login() {
	const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
	const [error, setError] = useState("");
	const router = useRouter()

    const handleLogin = async () => {
		 setError("");
		 setLoading(true);

		if (!email || !password) {
			console.log('masukan email atau password terlebih dahulu');
			setLoading(false);
			return
		}
		
		 try {
		   const credential = await signInWithEmailAndPassword(
			 auth,
			 email,
			 password
		   );

		   const idToken = await credential.user.getIdToken();
	 
		   await fetch("/api/login", {
			 headers: {
			   Authorization: `Bearer ${idToken}`,
			 },
		   });
		   
	 
		   router.push("/");
		 } catch (e) {
		   setError((e as Error).message);
		   alert(error)
		//    const errorCode = e.code;
		//    const errorMessage = e.message;
		//   console.log(errorCode);

		//   if ( errorCode === 'auth/invalid-email' ) alert('Email salah')
		//   if ( errorCode === 'auth/invalid-credential' ) alert('password salah')
		 } finally {
			setLoading(false);
		 }
	  };

    return (
        <div className="h-screen w-screen bg-green-400 flex flex-col items-center justify-center gap-32 text-4xl pb-28 font-semibold">
            <div className="bg-white bg-opacity-20 flex flex-col gap-10 rounded-xl shadow-lg p-10 items-center">
            	<div className="flex flex-col gap-7">
                	<div className="flex flex-col gap-3">
                    	<h3 className="text-gray-800 font-bold">Email:</h3>
                    	<input type="email" placeholder="Masukkan email" value={email} onChange={(e) => setEmail(e.target.value)} className="border text-[1.5rem] text-black border-gray-400 rounded-md pl-2 focus:outline-none focus:ring focus:ring-teal-400" required/>
                	</div>
                	<div className="flex flex-col gap-3">
                    	<h3 className="text-gray-800 font-bold">Password:</h3>
                    	<input type="password" placeholder="Masukkan password" value={password} onChange={(e) => setPassword(e.target.value)} className="border text-[1.5rem] text-black border-gray-400 rounded-md pl-2 focus:outline-none focus:ring focus:ring-teal-400" required/>
                	</div>
                </div>
            	<div className="flex justify-between">
                	<div className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md">
                	    <button disabled={loading} onClick={() => handleLogin()} > {loading ? 'Loading...' : 'Login'}</button>
                	</div>
				</div>
				
            </div>
        </div>
    );
}

			
        