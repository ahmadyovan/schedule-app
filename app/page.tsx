import { getJob } from "./component/functions";
import { getToken } from "@/app/component/serverfunction"
import HomePage from "./component/homepage";

export default async function Home() {

	const tokens = await getToken();
  	const job = await getJob(tokens.decodedToken.uid);	

	return (
		<HomePage uuid={tokens.decodedToken.uid} email={tokens} userRole={job || ''} />
	);
}
