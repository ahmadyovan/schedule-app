import { NextResponse } from 'next/server';
import { get_data } from '@/utils/supabase/functions'; // path ke file get_data

export async function POST(req: Request) {
    try {
      const body = await req.json(); // <-- bisa error kalau tidak valid JSON
      const { table, selectFields, filters } = body;
  
      const data = await get_data(table, selectFields, filters);
      return NextResponse.json({ success: true, data });
    } catch (error) {
      return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
  }
