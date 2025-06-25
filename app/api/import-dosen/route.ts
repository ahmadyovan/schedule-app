import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Readable } from 'stream';
import csv from 'csv-parser';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  const users: { name: string; email: string }[] = [];

  // Convert buffer to readable stream
  const stream = Readable.from(buffer);

  // Parsing CSV using csv-parser
  const parseCSV = () =>
    new Promise<void>((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => {
          users.push({
            name: row['Nama Dosen'],
            email: row['Email'],
          });
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

  await parseCSV();

  const results = [];

for (const user of users) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: '123456',
    email_confirm: true,
    user_metadata: { full_name: user.name },
  });

  if (error || !data?.user) {
    results.push({ email: user.email, success: false, error: error?.message });
    continue;
  }

  // Insert ke tabel 'user' setelah user berhasil dibuat
  const { id: uid, email, user_metadata } = data.user;

  const insertResult = await supabase.from('user').insert({
    uid,
    name: user_metadata.full_name,
    email,
  });

  if (insertResult.error) {
    results.push({
      email,
      success: false,
      error: `User created but insert failed: ${insertResult.error.message}`,
    });
  } else {
    results.push({ email, success: true });
  }
}


  return NextResponse.json({ results });
}
