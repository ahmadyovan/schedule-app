import { fetchFromApi } from '@/utils/functions';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

type Filter = { column: string; value: unknown };

interface UseSupabaseOptions {
  filters?: Filter[];
  select?: string;
}

export const useSupabaseTableData = <T,>(
  table: string,
  options: UseSupabaseOptions = {}
) => {
    const { filters = [], select = '*' } = options;

    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);

    const filtersRef = useRef<Filter[]>(filters);

    const fetchData = useCallback(async () => {
      setLoading(true);
      const result = await fetchFromApi({
        table,
        selectFields: select,
        filters: filtersRef.current,
      });

      setData((prev) => {
        const isEqual = JSON.stringify(prev) === JSON.stringify(result.data);
        return isEqual ? prev : result.data;
      });

      setLoading(false);
    }, [table, select]);

    const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

    useEffect(() => {
      // Gunakan hasil parse dari filtersKey agar tidak langsung pakai `filters`
      filtersRef.current = JSON.parse(filtersKey);
      fetchData();
    }, [filtersKey, fetchData]);

    return { data, loading, refetch: fetchData };
};
