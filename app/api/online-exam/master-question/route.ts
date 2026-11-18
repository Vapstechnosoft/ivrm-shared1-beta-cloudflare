import axios from 'axios';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_EXAM_API_BASE_URL || 'http://localhost:5000/api';
const NAAC_URL = 'http://localhost:5000/api';

function extractArr(val: any): any[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (val.$values && Array.isArray(val.$values)) return val.$values;
    if (val.data) return extractArr(val.data);
    return [];
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const miId = searchParams.get('MI_Id') ? Number(searchParams.get('MI_Id')) : 30;

        let loadData: any = {};
        let questionList: any[] = [];

        // Fetch initial dropdowns & topics
        try {
            const loadRes = await axios.get(`${NAAC_URL}/MasterQuestionFacade/loaddata`, {
                timeout: 10000
            });
            if (loadRes.data?.success && loadRes.data?.data) {
                const rawLoad = loadRes.data.data;
                loadData = {
                    getClass: extractArr(rawLoad.getClass),
                    getSubjects: extractArr(rawLoad.getSubjects),
                    getComplexity: extractArr(rawLoad.getComplexity),
                    getTopics: extractArr(rawLoad.getTopics)
                };
            }
        } catch (err: any) {
            console.warn('[API online-exam master-question GET] loaddata error:', err?.message);
        }

        // Fetch question list
        try {
            const listRes = await axios.get(`${NAAC_URL}/MasterQuestionFacade?page=1&page_size=500`, {
                timeout: 10000
            });
            if (listRes.data?.success && listRes.data?.data) {
                questionList = extractArr(listRes.data.data);
            }
        } catch (err: any) {
            console.warn('[API online-exam master-question GET] list error:', err?.message);
        }

        const data = {
            ...loadData,
            getMasterQuestiondetails: questionList,
            getQuestiondetails: questionList,
            questionList: questionList
        };

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('[API online-exam master-question GET] error:', error?.message);
        return NextResponse.json({ success: false, error: error?.message || 'Backend connection error', data: {} }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const miId = body?.MI_Id ? Number(body.MI_Id) : 30;

        if (body.action === 'toggle' && body.LPMOEQ_Id) {
            const toggleRes = await axios.put(`${NAAC_URL}/MasterQuestionFacade/toggle/${body.LPMOEQ_Id}`, {}, {
                timeout: 10000
            });
            return NextResponse.json(toggleRes.data);
        }

        const payload = {
            MI_Id: miId,
            LPMOEQ_Id: Number(body.LPMOEQ_Id ?? body.LMSMOEQ_Id ?? 0),
            ISMS_Id: Number(body.ISMS_Id ?? body.ismS_Id ?? 0),
            ASMCL_Id: Number(body.ASMCL_Id ?? body.asmcL_Id ?? 0),
            LPMT_Id: Number(body.LPMT_Id ?? body.lpmT_Id ?? 0),
            LPMCOMP_Id: Number(body.LPMCOMP_Id ?? body.lpmcomP_Id ?? body.LMSMOECX_Id ?? 0),
            LPMOEQ_Question: body.LPMOEQ_Question ?? body.LMSMOEQ_Question ?? '',
            LPMOEQ_QuestionDesc: body.LPMOEQ_QuestionDesc ?? body.LMSMOEQ_QuestionDesc ?? '',
            LPMOEQ_Marks: Number(body.LPMOEQ_Marks ?? body.LMSMOEQ_Marks ?? 1),
            LPMOEQ_SubjectiveFlg: Boolean(body.LPMOEQ_SubjectiveFlg ?? false),
            LPMOEQ_MatchTheFollowingFlg: Boolean(body.LPMOEQ_MatchTheFollowingFlg ?? false),
            LPMOEQ_StructuralFlg: body.LPMOEQ_StructuralFlg || '',
            LPMOEQ_Answer: body.LPMOEQ_Answer || '',
            LPMOEQ_NoOfOptions: Number(body.LPMOEQ_NoOfOptions || (body.tempoptionsDTO || body.questionOptions || []).length || 0),
            selectedClassList: (body.selectedClassList || body.classlist || []).map((c: any) => typeof c === 'number' ? c : (c.ASMCL_Id ?? c.asmcL_Id ?? 0)).filter((id: number) => id > 0),
            tempoptionsDTO: (body.tempoptionsDTO || body.questionOptions || []).map((opt: any, idx: number) => ({
                LPMOEQOA_Id: Number(opt.LPMOEQOA_Id ?? opt.lmsmoeqoA_Id ?? 0),
                LPMOEQOA_Option: opt.LPMOEQOA_Option ?? opt.lmsmoeqoA_Option ?? opt.option ?? String.fromCharCode(65 + idx),
                LPMOEQOA_OptionCode: opt.LPMOEQOA_OptionCode ?? opt.lmsmoeqoA_OptionCode ?? opt.answer ?? '',
                LPMOEQOA_AnswerFlag: Boolean(opt.LPMOEQOA_AnswerFlag ?? opt.lmsmoeqoA_AnswerFlag ?? false),
                LPMOEQOA_Marks: Number(opt.LPMOEQOA_Marks ?? opt.lmsmoeqoA_Marks ?? 1),
                LPMOEQOA_ActiveFlg: true,
                tempoptionsfiles: opt.files || opt.tempoptionsfiles || []
            })),
            tempfilesDTO: (body.tempfilesDTO || body.questionFiles || []).map((file: any) => ({
                LPMOEQF_Id: Number(file.LPMOEQF_Id ?? 0),
                LPMOEQF_FileName: file.LPMOEQF_FileName ?? file.fileName ?? '',
                LPMOEQF_FilePath: file.LPMOEQF_FilePath ?? file.filePath ?? '',
                LPMOEQF_ActiveFlag: true
            }))
        };

        const backendRes = await axios.post(`${NAAC_URL}/MasterQuestionFacade`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000
        });

        return NextResponse.json(backendRes.data);
    } catch (error: any) {
        console.error('[API online-exam master-question POST] error:', error?.message);
        return NextResponse.json(
            { success: false, error: error?.message || 'Backend connection error', message: error?.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const id = body.LPMOEQ_Id || body.lpmoeQ_Id;

        if (!id) {
            return NextResponse.json({ success: false, message: 'Missing question ID' }, { status: 400 });
        }

        const res = await axios.delete(`${NAAC_URL}/MasterQuestionFacade/delete/${id}`, {
            timeout: 10000
        });

        return NextResponse.json({
            success: res.data?.success !== false,
            message: res.data?.message || 'Deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting question:', error.message);
        return NextResponse.json(
            {
                success: false,
                message: error.response?.data?.message || error.message || 'Delete failed'
            },
            { status: 500 }
        );
    }
}
