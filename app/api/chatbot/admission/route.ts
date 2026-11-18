import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { question, mi_id } = body;

        const payload = {
            conversation_id: 'demo-conversation',
            question: question || '',
            mi_id: mi_id ? mi_id.toString() : ''
        };

        const response = await fetch('http://admissisionhelpmenu.vapssmartecampus.com:5003/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Admission API error:', errText);
            return NextResponse.json({ error: `Failed to fetch from admission API: ${response.statusText}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Admission API handler error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
