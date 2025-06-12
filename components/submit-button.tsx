'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton({
	children,
	pendingText,
}: {
	children: React.ReactNode
	pendingText: string
}) {
	const { pending } = useFormStatus()

	return (
		<button type="submit" className="bg-green-700 flex items-center justify-center text-2xl px-5 py-2 font-medium hover:bg-green-800 transition-colors text-white rounded-md text-foreground" disabled={pending} >
			{pending ? pendingText : children}
		</button>
	)
}