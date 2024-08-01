import { signOut } from "@/app/auth/action";
import { createServerSupabaseClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation";

export default async function Navbar() {

    const supabase = await createServerSupabaseClient();

    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <nav className="h-[10%] w-full bg-neutral-800 flex justify-end px-10">
             <div className="flex justify-between space-x-10 items-center">
                <h1>{user?.email}</h1>
                <form action={signOut}>
                    <button>Keluar</button>
                </form>
            </div>
        </nav>
    )
  }