import { type NextRequest, NextResponse } from 'next/server';

// Next.js 15 Route Handler Configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE_URL = 'https://examquiz-6b6c.onrender.com';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Forward to Render API
        const createRes = await fetch(`${BASE_URL}/create-exam`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                title: body.title || 'AI Quiz',
                created_by: 'Teacher_User', // Fallback, could be pulled from session
                duration: Number.parseInt(body.duration) || 30,
                active_from: body.activeFrom,
                active_to: body.activeTo,
                student_ids: body.studentIds || [],
                academic_year_id: body.academicYearId,
                class_id: body.classId,
                section_id: body.sectionId,
                questions: body.questions.map((q: any) => ({
                    question: q.text,
                    options: q.options,
                    answer: q.answer,
                    topic: 'General',
                    difficulty: body.difficulty || 'medium'
                }))
            })
        });

        if (!createRes.ok) {
            const errText = await createRes.text();
            throw new Error(`Failed to create exam on server: ${errText}`);
        }

        const data = await createRes.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Create Exam Proxy Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
