import { useState, useEffect } from 'react';
import { createClientSupabase } from '@/utils/supabase/client';

import { User } from '@supabase/supabase-js';

type Prodi = {
  prodi_id: number;
  prodi_name: string;
}

type UserData = {
  user_id: string;
  user_name: string;
  user_email: string;
  user_job: string;
  user_prodi: Prodi;
}

interface UserType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
}

export const useUser = (): UserType => {
  const [state, setState] = useState<UserType>({
    user: null,
    userData: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const supabase = await createClientSupabase();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) throw new Error(authError.message);

        
        if (user && isMounted) {
          const { data, error: userDataError } = await supabase
            .from('user')
            .select('*, prodi!inner(*)')
            .eq('user_id', user.id)
            .single();

          if (userDataError) throw new Error(userDataError.message);

          console.log('Fetched User Data:', data);

          // Ensure user_prodi is an object of type Prodi
          const userData: UserData = {
            ...data,
            user_prodi: data.prodi,
          };

          if (isMounted) {
            setState({
              user,
              userData: userData,
              loading: false,
              error: null,
            });
          }
        } else if (isMounted) {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error Fetching User Data:', err);
          setState(prev => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'An unknown error occurred',
          }));
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
};
