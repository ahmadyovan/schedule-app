import { NextResponse } from 'next/server';
import { insert_data } from '@/utils/supabase/functions'; // sesuaikan path

export async function POST(req: Request) {
  console.log("payload",req);
  try {
    const body = await req.json(); // { table, payload }
    const { table, payload } = body;

    if (!table || !payload) {
      return NextResponse.json({ success: false, message: 'table dan payload wajib diisi' }, { status: 400 });
    }

    await insert_data(table, payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
