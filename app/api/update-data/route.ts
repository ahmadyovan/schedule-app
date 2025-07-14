import { NextResponse } from 'next/server';
import { update_data } from '@/utils/supabase/functions'; // sesuaikan path

export async function POST(req: Request) {
  try {
    const body = await req.json(); // { table, payload, filters }
    const { table, payload, filters } = body;

    if (!table || !payload || !filters) {
      return NextResponse.json({ success: false, message: 'table, payload, dan filters wajib diisi' }, { status: 400 });
    }

    await update_data(table, payload, filters);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
