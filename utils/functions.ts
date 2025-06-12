type Filter = {
  column: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
};

interface FetchParams {
  table: string;
  selectFields: string;
  filters?: Filter[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setData: (data: any) => void;
  setLoading?: (loading: boolean) => void;
}

export const fetchFromApi = async ({
  table,
  selectFields,
  filters,
  setData,
  setLoading,
}: FetchParams) => {
  try {
    if (setLoading) setLoading(true);

    const res = await fetch('/api/get-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table,
        selectFields,
        filters,
      }),
    });

    const json = await res.json();

    if (json.success) {
      setData(json.data);
    } else {
      console.error(`Gagal ambil data dari ${table}:`, json.message);
    }
  } catch (err) {
    console.log('error', err);
    
    console.error(`Error saat fetch ${table}:`, err);
  } finally {
    if (setLoading) setLoading(false);
  }
};

interface InsertParams {
  table: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>;
}

export const insertData = async ({ table, payload }: InsertParams) => {
 console.log("payload",payload);
  
  const response = await fetch('/api/insert-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, payload }),
    });
    
    const json = await response.json();
    
    if (!json.success) {
       
      console.error(`Gagal insert ke ${table}:`, json.message);
    }

    return json;
};

interface UpdateParams {
  table: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>;
  filters: Filter[];
}

export const updateData = async ({ table, payload, filters }: UpdateParams) => {
  try {
    const response = await fetch('/api/update-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, payload, filters }),
    });

    const json = await response.json();

    if (!json.success) {
      console.error(`Gagal update ${table}:`, json.message);
    }

    return json;
  } catch (err) {
    console.error(`Error saat update ${table}:`, err);
    return { success: false };
  }
};

interface DeleteParams {
  table: string;
  id: number | string;
  key?: string; // default: 'id'
}

export const deleteData = async ({ table, id, key = 'id' }: DeleteParams) => {
  try {
    const response = await fetch('/api/delete-data', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id, key }),
    });

    const json = await response.json();

    if (!json.success) {
      console.error(`Gagal hapus data dari ${table}:`, json.message);
    }

    return json;
  } catch (err) {
    console.error(`Error saat hapus data dari ${table}:`, err);
    return { success: false };
  }
};

