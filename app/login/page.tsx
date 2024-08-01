import { redirect } from "next/navigation";
import { getAuthUser, getUserData } from "../component/serverfunction";
import LoginInterface from "./interface"

const LoginPage = async () => {
	// Server-side authentication check
	// const { user, error } = await getAuthUser();
	// if (user) {
	// 	console.log(user);
		
	// 	const { data, error } = await getUserData(user.id)		
	// 	if (data) {
	// 		const user_job = data.user_job
	// 		console.log(user_job);
			
	// 		if (user_job == 'kaprodi') redirect('/kaprodi')
	// 		if (user_job == 'dosen') redirect('/dosen')
	// 	}
	// }

	// If not authenticated, render login interface
	return <LoginInterface />;
}

export default LoginPage