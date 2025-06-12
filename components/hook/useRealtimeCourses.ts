'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import { Database } from "@/types/supabase"

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;
type Row<T extends TableName> = Tables[T]['Row'];

type SelectOptions = string;

type FilterOptions<T extends TableName> = {
	column: keyof Tables[T]['Row'] | string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: any;
};

type OrderOptions<T extends TableName> = {
	column: keyof Tables[T]['Row'] | string;
	ascending?: boolean;
};

interface UseRealtimeOptions<T extends TableName> {
	select?: SelectOptions;
	filters?: FilterOptions<T>[];
	orderBy?: OrderOptions<T>;
	limit?: number;
}

export function useRealtime<T extends TableName>(
	tableName: T,
	options?: UseRealtimeOptions<T>
) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const memoizedOptions = useMemo(() => {
		return {
			select: options?.select,
			filters: options?.filters,
			orderBy: options?.orderBy,
			limit: options?.limit,
		};
	}, [options?.select, options?.filters, options?.orderBy, options?.limit]);

	useEffect(() => {
		const supabase = createClient();

		const fetchData = async () => {
		try {
		setLoading(true);

		let query = supabase.from(tableName).select(memoizedOptions.select || '*');

		memoizedOptions.filters?.forEach((filter) => {
			query = query.eq(filter.column as string, filter.value);
		});

		if (memoizedOptions.orderBy) {
			query = query.order(memoizedOptions.orderBy.column as string, {
			ascending: memoizedOptions.orderBy.ascending ?? false,
			});
		}

		if (memoizedOptions.limit) {
			query = query.limit(memoizedOptions.limit);
		}

		const { data: fetchedData, error: fetchError } = await query;
		if (fetchError) throw fetchError;

		setData(fetchedData || []);
		setError(null);
		} catch (err) {
		setError(err instanceof Error ? err : new Error('An error occurred'));
		} finally {
		setLoading(false);
		}
	};

		fetchData();

		// Set up realtime subscription
		const channel = supabase
		.channel(`public:${tableName}`)
		.on(
			'postgres_changes',
			{ event: '*', schema: 'public', table: tableName },
			(payload: RealtimePostgresChangesPayload<Row<T>>) => {
	
			switch (payload.eventType) {
				case 'INSERT':
				// Fetch the full record with relations to ensure complete data
				supabase
					.from(tableName)
					.select(options?.select || '*')
					.eq('id', payload.new.id)
					.single()
					.then(({ data: newData, error }) => {
					if (newData) {
						setData((prev) => [...prev, newData]);
					}
					if (error) {
						console.error('Error fetching new record:', error);
					}
					});
				break;
				case 'UPDATE':
				supabase
					.from(tableName)
					.select(options?.select || '*')
					.eq('id', payload.new.id)
					.single()
					.then(({ data: updatedData, error }) => {
					if (updatedData) {
						setData((prev) =>
						prev.map((item) =>
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore - Assuming id exists on all tables
							item.id === updatedData.id ? updatedData : item
						)
						);
					}
					if (error) {
						console.error('Error fetching updated record:', error);
					}
					});
				break;
				case 'DELETE':
				setData((prev) =>
					prev.filter((item) => 
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore - Assuming id exists on all tables
					item.id !== payload.old.id
					)
				);
				break;
			}
			}
		)
		.subscribe();

		return () => {
		supabase.removeChannel(channel);
		};
	}, [memoizedOptions.filters, memoizedOptions.limit, memoizedOptions.orderBy, memoizedOptions.select, options?.select, tableName]);

	return { data, loading, error };
}