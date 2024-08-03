import { createServerSupabaseClient } from "@/utils/supabase/server"

const supabase = createServerSupabaseClient();

export const getAuthUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error fetching authenticated user:', error.message);
      return { user: null, error: error.message };
    }
    
    return { user, error: null };
};

export const getUserData = async (userId: string | undefined) => {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      //console.error('Error fetching user data:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
};      

