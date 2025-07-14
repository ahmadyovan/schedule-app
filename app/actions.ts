"use server";

import { getUser } from "@/utils/supabase/functions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { resolveRedirectPath } from "@/utils/auth/redirect-by-role";

export const signIn = async (formData: FormData) => {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const supabase = await createClient();

	if (!email || !password) {
		return redirect('/sign-in?error=' + encodeURIComponent('Email dan password harus diisi') + '&type=VALIDATION_ERROR');
	}

	const { error } = await supabase.auth.signInWithPassword({ email, password });

	if (error) {
		let errorMessage = 'Kredensial tidak valid';
		const errorType = 'AUTH_ERROR';

		if (error.message.includes('Invalid login credentials')) {
			errorMessage = 'Email atau password salah';
		} else if (error.message.includes('Email not confirmed')) {
			errorMessage = 'Email belum dikonfirmasi';
		} else if (error.message.includes('Too many requests')) {
			errorMessage = 'Terlalu banyak percobaan login. Silakan coba lagi nanti';
		}

		return redirect(`/sign-in?error=${encodeURIComponent(errorMessage)}&type=${errorType}`);
	}

	const { data: { user } } = await supabase.auth.getUser();

	if (!user) {
		return redirect("/sign-in?error=Gagal Login&type=FETCH_ERROR");
	}

	const userData = await getUser(user.id);
	if (!userData) {
		return redirect("/sign-in?error=Gagal mendapatkan role user&type=FETCH_ROLE_ERROR");
	}

	const redirectPath = await resolveRedirectPath(userData.job);

	if (redirectPath) {
		return redirect(redirectPath);
	}

	return redirect("/sign-in?error=" + encodeURIComponent("Sesi belum tersedia") + "&type=CONFIG_INACTIVE");
};

export const signOut = async () => {
	const supabase = await createClient();
	await supabase.auth.signOut();
	return redirect("/sign-in");
};
