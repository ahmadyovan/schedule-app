import Logout from "./ButtonLogOut";

interface emailtype {
    nama: string | undefined
}

export default async function Navbar({nama}: emailtype) {

    return (
        <nav className="h-[10%] w-full bg-neutral-800 flex justify-end px-10">
             <div className="flex justify-between space-x-10 items-center">
                <h1>{nama}</h1>
                <Logout />
            </div>
        </nav>
    )
  }