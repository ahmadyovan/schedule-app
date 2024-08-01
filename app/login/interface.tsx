'use client'

import { useState } from 'react';
import { login } from '@/app/auth/action'
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/router';


function SubmitButton() {
	const { pending } = useFormStatus()
	
	return (
	  <button 
		type="submit" 
		disabled={pending} 
		className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md"
	  >
		{pending ? 'Loading...' : 'MASUK'}
	  </button>
	)
}

export default function LoginIterface() {
	const [error, setError] = useState("");
	
	const handleSubmit = async (formData: FormData) => {
		const result = await login(formData);
		if (result && result.error) {
			setError(result.error);
		}
	}
	return (
		<div className="h-screen w-screen bg-green-400 flex flex-col items-center justify-center gap-32 text-4xl pb-28 font-semibold">
			<form className="bg-white bg-opacity-20 flex flex-col gap-10 rounded-xl shadow-lg p-10 items-center" action={handleSubmit}>
				{error && <p className="text-red-500 text-sm">{error}</p>}
				<div className="flex flex-col gap-7">
					<div className="flex flex-col gap-3">
						<h3 className="text-gray-800 font-bold">Email:</h3>
						<input id="email" name="email" required type="email" placeholder="Masukkan email"  className="border text-[1.5rem] text-black border-gray-400 rounded-md pl-2 focus:outline-none focus:ring focus:ring-teal-400"/>
					</div>
					<div className="flex flex-col gap-3">
						<h3 className="text-gray-800 font-bold">Password:</h3>
						<input id="password" name="password" required type="password" placeholder="Masukkan password" className="border text-[1.5rem] text-black border-gray-400 rounded-md pl-2 focus:outline-none focus:ring focus:ring-teal-400"/>
					</div>
				</div>
				<div className="flex justify-between">
					<div  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md">
						<SubmitButton />
					</div>
				</div>
			</form>
		</div>
	);
}

				
			