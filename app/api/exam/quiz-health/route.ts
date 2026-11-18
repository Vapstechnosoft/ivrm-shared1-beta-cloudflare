import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const res = await fetch('https://examquiz-6b6c.onrender.com/healthz', {
            signal: AbortSignal.timeout(5000)
        });

        const contentType = res.headers.get('content-type');

        // If it's a 200 OK but returns HTML, the service might be hibernating or showing a splash page
        if (res.ok && contentType?.includes('application/json')) {
            return NextResponse.json({ status: 'Live' });
        }

        // Return Offline for HTML or non-OK responses
        return NextResponse.json({ status: 'Offline' }, { status: 503 });
    } catch (error) {
        return NextResponse.json({ status: 'Offline' }, { status: 503 });
    }
}
