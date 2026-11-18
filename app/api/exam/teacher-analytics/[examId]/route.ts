import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const BASE_URL = 'https://examquiz-6b6c.onrender.com';

export async function GET(req: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
    try {
        const { examId } = await params;
        const res = await fetch(`${BASE_URL}/analytics/teacher/${examId}`, {
            headers: { Accept: 'application/json' },
            next: { revalidate: 0 } // Don't cache analytics
        });

        if (!res.ok) {
            throw new Error(`Analytics server error: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Analytics Fetch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
