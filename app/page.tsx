import { getUserRole } from "./component/functions";
import { getToken } from "@/app/component/serverfunction"
import HomePage from "./component/homepage";



export default async function Home() {

	const tokens = await getToken();
  	const userRole = tokens ? await getUserRole(tokens.decodedToken.uid) : null;

	return (
		<HomePage email={tokens.decodedToken.email} userRole={userRole} />
	);
}
