'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createServerSupabaseClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
	const supabase = createServerSupabaseClient()

	// type-casting here for convenience
	// in practice, you should validate your inputs
	const data = {
		email: formData.get('email') as string,
		password: formData.get('password') as string,
	}
	
	console.log(data);
	

	const { error } = await supabase.auth.signInWithPassword(data)

	if (error) {
		return { error: error.message }
	}

	revalidatePath('/', 'layout')
	redirect('/')
}

export async function signup(formData: FormData) {
	const supabase = createServerSupabaseClient()

	// type-casting here for convenience
	// in practice, you should validate your inputs
	const data = {
		email: formData.get('email') as string,
		password: formData.get('password') as string,
	}

	const { error } = await supabase.auth.signUp(data)

	if (error) {
		redirect('/error')
	}

	revalidatePath('/', 'layout')
	redirect('/')
}

export async function signOut() {
	const supabase = createServerSupabaseClient()
	await supabase.auth.signOut()
	redirect('/login')
}