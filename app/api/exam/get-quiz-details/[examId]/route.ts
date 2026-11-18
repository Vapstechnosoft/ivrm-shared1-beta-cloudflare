import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const BASE_URL = 'https://examquiz-6b6c.onrender.com';

export async function GET(req: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
    try {
        const { examId } = await params;
        const res = await fetch(`${BASE_URL}/exam/${examId}`, {
            headers: { Accept: 'application/json' },
            next: { revalidate: 60 } // Cache for 1 min
        });

        if (!res.ok) {
            throw new Error(`Exam not found: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Fetch Exam Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
