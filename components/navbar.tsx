// app/components/Navbar.tsx
import LogoutButton from '@/components/log-out-button';
import Name from './name';

export default async function Navbar() {

    return (
		<nav className="h-full w-full text-sm flex items-center justify-end gap-5 px-10 bg-[#ccffbc] text-black">
			<Name />
			<LogoutButton /> 
		</nav>
    );
}
