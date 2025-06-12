// components/login-status.tsx
'use client'

import { useFormStatus } from 'react-dom'

export type LoginMessage = {
	error?: string
	message?: string
	type?: 'AUTH_ERROR' | 'SERVER_ERROR' | 'VALIDATION_ERROR' | 'SUCCESS'
}

export function LoginStatus({ message }: { message: LoginMessage }) {
	const { pending } = useFormStatus()
	
	if (pending || (!message?.error && !message?.message)) return null

	if (!message?.error && !message?.message) return null

	const statusStyles = {
		AUTH_ERROR: 'bg-orange-100 text-orange-800',
		SERVER_ERROR: 'bg-red-100 text-red-800',
		VALIDATION_ERROR: 'bg-yellow-100 text-yellow-800',
		SUCCESS: 'bg-green-100 text-green-800',
	}

	
	const style = statusStyles[message.type || 'SERVER_ERROR']

	return (
		<div className={`flex items-center space-x-2 ${style} p-3 rounded-md text-sm`}>
			<span>{message.error || message.message}</span>
		</div>
	)
}