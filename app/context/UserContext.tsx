// context/UserContext.tsx
"use client";

import React, { createContext, useContext } from "react";

// ✅ Definisi tipe data user
export type UserData = {
  id: number;
  created_at: string;
  uid: string;
  name: string;
  email: string | null;
  job: string;
  prodi: number;
};

// ✅ Buat context dan beri tipe yang sesuai
const UserContext = createContext<UserData | null>(null);

// ✅ Custom hook untuk mengakses user
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === null) {
        throw new Error("useUser harus digunakan di dalam <UserProvider>");
    }
    return context;
};

// ✅ Komponen Provider
export const UserProvider = ({
  children,
  initialUserData,
}: {
  children: React.ReactNode;
  initialUserData: UserData;
}) => {
  return (
    <UserContext.Provider value={initialUserData}>
      {children}
    </UserContext.Provider>
  );
};

// ✅ Export context jika ingin digunakan langsung (misalnya untuk debugging atau SSR)
export { UserContext };
