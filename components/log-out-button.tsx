// app/components/LogoutButton.tsx
'use client';

import { signOut } from '@/app/actions';
import { useFormStatus } from 'react-dom';

export default function LogoutButton() {
	// const { setUser } = useUser();
	const { pending } = useFormStatus();

	return (
		<form action={signOut}>
			<button type="submit" disabled={pending} className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded">
				{pending ? '...' : 'Keluar'}
			</button>
		</form>
		
	);
}
