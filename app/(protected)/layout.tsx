import { getUserData } from "@/utils/supabase/functions";
import { redirect } from "next/navigation";
import ClientUserProvider from "@/components/ClientUserProvider"; 
import Navbar from "@/components/navbar";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const userData = await getUserData();

  if (!userData) redirect("/sign-in");

  return (
    <ClientUserProvider initialUserData={userData}>
        <div className="h-screen w-screen flex flex-col">
            <div className="h-14"><Navbar /></div>
            <div className="h-full">{children}</div>
        </div>
    </ClientUserProvider>
  );
}
