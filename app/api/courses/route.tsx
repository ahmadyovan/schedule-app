import { NextResponse } from 'next/server';

const FLASK_SERVER_URL = 'https://schedule-app-backend.vercel.app/';

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
    const scheduleResponse = await fetch(`${FLASK_SERVER_URL}/get_schedule`);

    if (!scheduleResponse.ok) {
      throw new Error('Failed to get processed schedule');
    }

    const scheduleData = await scheduleResponse.json();
    console.log(scheduleData);
    return NextResponse.json(scheduleData);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}