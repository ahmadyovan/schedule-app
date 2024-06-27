import { getJob, getProdi, getUserName } from "./component/functions";
import { getToken } from "@/app/component/serverfunction"
import HomePage from "./component/homepage";

export default async function Home() {

	const tokens = await getToken();
	const prodi = await getProdi(tokens.decodedToken.uid);
	const user = await getUserName(tokens.decodedToken.uid)
	const job = await getJob(tokens.decodedToken.uid)

	return (
		<HomePage uuid={tokens.decodedToken.uid} job={job || ''} prodi={prodi || ''} email={tokens} name={user || ''}	 />
	);
}
