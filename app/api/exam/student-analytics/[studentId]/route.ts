import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const BASE_URL = 'https://examquiz-6b6c.onrender.com';

export async function GET(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
    try {
        const { studentId } = await params;
        const res = await fetch(`${BASE_URL}/analytics/student/${studentId}`, {
            headers: { Accept: 'application/json' },
            next: { revalidate: 0 }
        });

        if (!res.ok) {
            throw new Error(`Student analytics error: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Student Analytics Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
