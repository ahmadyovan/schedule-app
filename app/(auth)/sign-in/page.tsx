// app/(auth)/login/page.tsx
import { signIn } from '@/app/actions'
import SubmitButton from '@/components/submit-button'

export default async function SignIn() {
	return (
		<div className="h-screen w-screen bg-green-400 flex flex-col items-center justify-center gap-32 text-4xl pb-28 font-semibold">
			<form action={signIn} className="bg-white bg-opacity-20 flex flex-col gap-10 rounded-xl shadow-lg p-10 items-center">
				<div className="flex flex-col gap-7">
					<div className="flex flex-col gap-3">
						<label htmlFor="email" className="text-gray-800 font-bold"> Email: </label>
						<input id="email" name="email" required type="email" placeholder="Masukkan email" className="border text-[1.5rem] text-black border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400" />
					</div>
					<div className="flex flex-col gap-3">
						<label htmlFor="password" className="text-gray-800 font-bold"> Password: </label>
						<input id="password" name="password" required type="password" placeholder="Masukkan password" className="border text-[1.5rem] text-black border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400" />
					</div>
				</div>
				<SubmitButton pendingText="Sedang Masuk...">
					Masuk
				</SubmitButton>
			</form>
		</div>
	)
}