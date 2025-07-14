// components/ClientUserProvider.tsx
"use client";

import { UserProvider, UserData } from "@/app/context/UserContext";

export default function ClientUserProvider({
  children,
  initialUserData,
}: {
  children: React.ReactNode;
  initialUserData: UserData;
}) {
  return <UserProvider initialUserData={initialUserData}>{children}</UserProvider>;
}
