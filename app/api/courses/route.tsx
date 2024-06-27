import { NextResponse } from 'next/server';

const FLASK_SERVER_URL = 'https://schedule-backend-7li8qada4-ahmadyovanardiansyahs-projects.vercel.app/';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let flaskRequestBody;

    // Menentukan action berdasarkan tipe request
    if ('programStudi' in body) {
      // Jika ada programStudi, ini adalah request untuk menambah data
      flaskRequestBody = {
        action: 'add_data',
        ...body
      };
    } else {
      // Jika tidak, ini adalah request untuk mendapatkan jadwal
      flaskRequestBody = {
        action: 'get_schedule'
      };
    }

    const flaskResponse = await fetch(`${FLASK_SERVER_URL}/app`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flaskRequestBody),
    });

    if (!flaskResponse.ok) {
      throw new Error('Flask server responded with an error');
    }

    const data = await flaskResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Menghapus fungsi GET karena sekarang semua operasi dilakukan melalui POST