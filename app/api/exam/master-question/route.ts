import { auth } from '@/lib/auth';
import { type NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_BASE = (process.env.LESSONPLANNER_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        const token = session?.token;
        const { searchParams } = new URL(req.url);
        const miId = searchParams.get('MI_Id') ? Number(searchParams.get('MI_Id')) : 30;

        const [loadDataRes, listRes] = await Promise.all([
            axios.get(`${BACKEND_BASE}/MasterQuestionFacade/loaddata`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${BACKEND_BASE}/MasterQuestionFacade?MI_Id=${miId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);

        const data = {
            ...(loadDataRes.data?.data || loadDataRes.data || {}),
            questionList: listRes.data?.data || listRes.data || []
        };
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('[API master-question GET] error:', error?.message);
        return NextResponse.json({ success: false, error: error?.message || 'Backend connection error', data: {} }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const token = session?.token;
        const body = await req.json();
        const miId = body?.MI_Id ? Number(body.MI_Id) : 30;

        let endpoint = '/MasterQuestionFacade/loaddata';
        let method = 'get';
        let payload: any = null;

        if (body.action === 'save' || body.LPMOEQ_Question || body.LMSMOEQ_Question) {
            endpoint = '/MasterQuestionFacade';
            method = 'post';
            payload = {
                MI_Id: miId,
                Userid: body.Userid || 231,
                LPMOEQ_Id: Number(body.LPMOEQ_Id ?? body.lmsmoeQ_Id ?? body.LMSMOEQ_Id ?? 0),
                ISMS_Id: Number(body.ISMS_Id ?? body.ismS_Id ?? 0),
                ASMCL_Id: Number(body.ASMCL_Id ?? body.asmcL_Id ?? (body.classIds && body.classIds[0]) ?? 397),
                LPMT_Id: Number(body.LPMT_Id ?? body.lpmT_Id ?? body.topic_Id ?? 16),
                LPMCOMP_Id: Number(body.LPMCOMP_Id ?? body.lpmcomP_Id ?? body.lmsmoecX_Id ?? body.LMSMOECX_Id ?? 1),
                LPMOEQ_Question: body.LPMOEQ_Question ?? body.lmsmoeQ_Question ?? body.LMSMOEQ_Question ?? '',
                LPMOEQ_QuestionDesc: body.LPMOEQ_QuestionDesc ?? body.lmsmoeQ_QuestionDesc ?? body.LMSMOEQ_QuestionDesc ?? '',
                LPMOEQ_Marks: Number(body.LPMOEQ_Marks ?? body.lmsmoeQ_Marks ?? body.LMSMOEQ_Marks ?? 1),
                LPMOEQ_SubjectiveFlg: Boolean(body.LPMOEQ_SubjectiveFlg ?? body.subjectiveFlg ?? body.LPMOEEXQNS_SubjectiveFlg ?? false),
                LPMOEQ_MatchTheFollowingFlg: Boolean(body.LPMOEQ_MatchTheFollowingFlg ?? body.matchTheFollowingFlg ?? body.LPMOEEXQNS_MatchTheFollowingFlg ?? false),
                LPMOEQ_StructuralFlg: body.LPMOEQ_StructuralFlg || (body.isStructuralType ? 'Structural' : ''),
                LPMOEQ_Answer: body.LPMOEQ_Answer || body.subjectiveAnswer || '',
                LPMOEQ_NoOfOptions: Number(body.LPMOEQ_NoOfOptions || body.lmsmoeQ_NoOfOptions || body.LPMOEEXQNS_NoOfOptions || 0),
                LPMOEQ_MFRowCount: Number(body.LPMOEQ_MFRowCount || body.noOfRows || body.LPMOEEXQNS_NoOfRows || 0),
                LPMOEQ_MFColumnCount: Number(body.LPMOEQ_MFColumnCount || body.noOfColumns || body.LPMOEEXQNS_NoOfColumns || 0),
                classlist: (body.classlist || [{ ASMCL_Id: Number(body.ASMCL_Id ?? body.asmcL_Id ?? 397) }]).map((c: any) => ({
                    ASMCL_Id: typeof c === 'number' ? c : (c.ASMCL_Id ?? c.asmcL_Id ?? 397)
                })),
                tempoptionsDTO: (body.tempoptionsDTO || body.questionOptions || []).map((opt: any, idx: number) => ({
                    LPMOEQOA_Id: Number(opt.LPMOEQOA_Id ?? opt.lmsmoeqoA_Id ?? 0),
                    LPMOEQOA_Option: opt.LPMOEQOA_Option ?? opt.lmsmoeqoA_Option ?? opt.option ?? String.fromCharCode(65 + idx),
                    LPMOEQOA_OptionCode: opt.LPMOEQOA_OptionCode ?? opt.lmsmoeqoA_OptionCode ?? opt.answer ?? '',
                    LPMOEQOA_AnswerFlag: Boolean(opt.LPMOEQOA_AnswerFlag ?? opt.lmsmoeqoA_AnswerFlag ?? false),
                    LPMOEQOA_Marks: Number(opt.LPMOEQOA_Marks ?? opt.lmsmoeqoA_Marks ?? 1),
                    LPMOEQOA_Order: idx + 1,
                    tempoptionsfiles: opt.files || opt.tempoptionsfiles || []
                })),
                tempfilesDTO: (body.tempfilesDTO || body.questionFiles || []).map((file: any) => ({
                    LPMOEQF_Id: Number(file.LPMOEQF_Id ?? 0),
                    LPMOEQF_FileName: file.LPMOEQF_FileName ?? file.fileName ?? '',
                    LPMOEQF_FilePath: file.LPMOEQF_FilePath ?? file.filePath ?? '',
                    LPMOEQF_ActiveFlag: true
                }))
            };
        } else if (body.action === 'options') {
            endpoint = '/MasterQuestionFacade/options';
            method = 'post';
            payload = { MI_Id: miId, LPMOEQ_Id: body.LPMOEQ_Id };
        } else if (body.action === 'toggle') {
            endpoint = `/MasterQuestionFacade/toggle/${body.LPMOEQ_Id}`;
            method = 'put';
        }

        const backendRes = await axios({
            method,
            url: BACKEND_BASE + endpoint,
            data: payload,
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            timeout: 15000
        });

        const data = backendRes.data || {};
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('[API master-question POST] error:', error?.message);
        return NextResponse.json(
            { success: false, error: error?.message || 'Backend connection error', message: error?.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        const token = session?.token;
        const body = await req.json();
        const { LPMOEQ_Id } = body;
        
        const backendRes = await axios.delete(`${BACKEND_BASE}/MasterQuestionFacade/delete/${LPMOEQ_Id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return NextResponse.json({ success: true, data: backendRes.data });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error?.message || 'Backend connection error', message: 'Delete failed' },
            { status: 500 }
        );
    }
}
