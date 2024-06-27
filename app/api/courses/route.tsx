import { NextResponse } from 'next/server';

const FLASK_SERVER_URL = 'https://yovan.pythonanywhere.com/';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const flaskResponse = await fetch(`${FLASK_SERVER_URL}/app`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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

export async function GET() {
    try {
      // Kirim GET request ke /process_schedule
      const processResponse = await fetch(`${FLASK_SERVER_URL}/process_schedule`, {
        method: 'GET',
      });
  
      if (!processResponse.ok) {
        throw new Error('Failed to process schedule');
      }
  
      const processResult = await processResponse.json();
  
      // Jika proses berhasil, ambil jadwal yang telah diproses
      if (processResult.message === 'Semua jadwal telah diproses') {
        const scheduleResponse = await fetch(`${FLASK_SERVER_URL}/get_schedule`);
  
        if (!scheduleResponse.ok) {
          throw new Error('Failed to get processed schedule');
        }
  
        const scheduleData = await scheduleResponse.json();
        return NextResponse.json(scheduleData);
      } else {
        return NextResponse.json(processResult);
      }
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}