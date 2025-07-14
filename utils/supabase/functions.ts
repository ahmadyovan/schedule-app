import { createClient } from "@/utils/supabase/server";



type Filter = {
  column: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
};

export async function getUser(userId: string) {

  const supabase = await createClient()

	const { data, error } = await supabase
		.from('user')
		.select('*')
		.eq('uid', userId)
		.single()

	if (error) {
		console.error('Gagal mengambil user data:', error)
		return null
	}

	return data
}

export async function get_data<T>(
  table: string,
  selectFields: string,
  filters: Filter[] = []
): Promise<T[]> {

  const supabase = await createClient()

   console.log('[DEBUG] supabase client created');
  
  let query = supabase.from(table).select(selectFields);

  for (const filter of filters) {
    query = query.eq(filter.column, filter.value);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[ERROR] get_data failed:', error);
    throw new Error(error.message);
  }

  return data as T[];
}

export async function get_single_data<T>(
    table: string,
    selectFields: string,
    filters: Filter[] = []
): Promise<T> {
    const supabase = await createClient();
    let query = supabase.from(table).select(selectFields);

    for (const filter of filters) {
      query = query.eq(filter.column, filter.value);
    }

    const { data, error } = await query.single();

    if (error) {
      throw new Error(error.message);
    }

    return data as T;
}


export const getUserData = async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const userData = await getUser(user.id);
    return userData;
};

export async function insert_data<T>(table: string, payload: T): Promise<void> {
	const supabase = await createClient();

  console.log("payload",payload);

	const { error } = await supabase.from(table).insert(payload);

	if (error) {
     console.error('[ERROR] get_data failed:', error);
		throw new Error(`Insert failed: ${error.message}`);
	}
}

export async function update_data<T>(
	table: string,
	updates: Partial<T>,
	filters: Filter[]
): Promise<void> {
    const supabase = await createClient();

    console.log('data', updates);
    

    let query = supabase.from(table).update(updates);

    for (const filter of filters) {
      query = query.eq(filter.column, filter.value);
    }

    const { error } = await query;

    console.log('result',error);
    console.log('fill',filters);
    
    
    if (error) {
      throw new Error(`Update failed: ${error.message}`);
    }
}

export async function delete_data(table: string, id: number | string, key: string = "id") {
  const supabase = await createClient();
  const { error } = await supabase
    .from(table)
    .delete()
    .eq(key, id);

  if (error) throw new Error(error.message);
}
