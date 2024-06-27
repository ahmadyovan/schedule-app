import { useState, useEffect } from 'react';
import { db, onValue, ref } from '@/app/libs/firebase/firebase';

interface User {
  uid: string;
  name: string;
  prodi: string;
  job: string;
}

export const useUsers = (filterProdi?: string, filterJob?: string) => {
  const [userList, setUserList] = useState<User[]>([]);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const users = snapshot.val();
      if (users) {
        const userArray = Object.entries(users)
          .map(([_, userData]: [string, any]) => ({
            uid: userData.localId,
            name: userData.name,
            prodi: userData.prodi,
            job: userData.job
          }))
          .filter(user => {
            if (filterProdi && filterJob) {
              return user.prodi === filterProdi && user.job === filterJob;
            } else if (filterProdi) {
              return user.prodi === filterProdi;
            } else if (filterJob) {
              return user.job === filterJob;
            }
            return true;
          });
        setUserList(userArray);
      } else {
        setUserList([]);
      }
    });

    return () => unsubscribe();
  }, [filterProdi, filterJob]);

  return userList;
};