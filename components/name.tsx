'use client'

import { useUser } from "@/app/context/UserContext";

const Name = () => {
    const user = useUser();

    return <div>{user.name}</div>
}

export default Name