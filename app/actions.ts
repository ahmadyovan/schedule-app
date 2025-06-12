"use server";

import { getUser, } from "@/utils/supabase/functions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const signIn = async (formData: FormData) => {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const supabase = await createClient();

	if (!email || !password) {
		redirect('/sign-in?error=' + encodeURIComponent('Email dan password harus diisi') + '&type=VALIDATION_ERROR')
	}

	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		console.log('log dari error', error);
		
		let errorMessage = 'Kredensial tidak valid'
		const errorType = 'AUTH_ERROR'
		
		// Menangani berbagai jenis error dari Supabase
		if (error.message.includes('Invalid login credentials')) {
			errorMessage = 'Email atau password salah'
		} else if (error.message.includes('Email not confirmed')) {
			errorMessage = 'Email belum dikonfirmasi'
		} else if (error.message.includes('Too many requests')) {
			errorMessage = 'Terlalu banyak percobaan login. Silakan coba lagi nanti'
		}

		redirect(`/sign-in?error=${encodeURIComponent(errorMessage)}&type=${errorType}`)
	}

	// ✅ Ambil user role setelah login
	const { data: { user } } = await supabase.auth.getUser();

	if (user) {
		const userData = await getUser(user.id)

		if (userData) {

			console.log('user', userData);
			
			// ✅ Redirect berdasarkan role
			switch (userData.job) {
				case "kaprodi":
				return redirect("/kaprodi");
				case "dosen":
				return redirect("/dosen");
				case "admin":
				return redirect("/admin");
				default:
				return redirect("/"); // fallback
			}
			
		} else {
			redirect("/sign-in?error=Gagal mendapatkan role user&type=FETCH_ROLE_ERROR");
		}
	} else {
		redirect("/sign-in?error=Gagal Login&type=FETCH_ERROR");
	}
};

export const signOut = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
