import { NextResponse } from 'next/server';
import { delete_data } from '@/utils/supabase/functions'; // sesuaikan path

export async function DELETE(req: Request) {
  try {
    const body = await req.json(); // { table, id, key? }
    const { table, id, key } = body;

    if (!table || id === undefined || id === null) {
      return NextResponse.json({ success: false, message: 'table dan id wajib diisi' }, { status: 400 });
    }

    await delete_data(table, id, key);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
