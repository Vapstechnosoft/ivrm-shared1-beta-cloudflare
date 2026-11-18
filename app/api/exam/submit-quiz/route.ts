import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const BASE_URL = 'https://examquiz-6b6c.onrender.com';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const res = await fetch(`${BASE_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Submission failed: ${errText}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Submit Exam Proxy Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
