'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

const getMiId = async () => {
    const session = await auth();
    const id = Number(session?.mi_id);
    return id > 0 ? id : 30;
};

export async function getAnswerPaperInitialData() {
    let baseData: any = {};

    // 1. Fetch primary dropdown data (years, classes, sections, subjects) from 'exam' service
    const initialEndpoints = [
        '/OE_AnswerPaperCorrection/GetInitialLoadData',
        '/LP_OnlineExamPublishToStudent/GetInitialLoadData',
        '/OE_SchoolExamReport/GetInitialLoadData'
    ];

    for (const ep of initialEndpoints) {
        try {
            const res: any = await api.get('exam', ep);
            const data = res?.data || res;
            if (data?.getyear || data?.getclass || data?.yearList) {
                baseData = data;
                break;
            }
        } catch (e) {}
    }

    if (!baseData?.getyear && !baseData?.yearList) {
        try {
            const naacRes: any = await api.get('naac', '/MasterOEExamFacade/GetInitialLoadData');
            if (naacRes?.data) baseData = naacRes.data;
            else if (naacRes) baseData = naacRes;
        } catch (e) {
            console.error('Error fetching NAAC initial load data:', e);
        }
    }

    // 2. Fetch master online exams list (LP_Master_OE_Exam)
    try {
        const miId = await getMiId();
        const examRes: any = await api.post('exam', '/MasterOEExamFacade/GetMasterExamList', { MI_Id: miId, mi_id: miId });
        const examList = examRes?.data?.$values || examRes?.data || examRes;
        if (Array.isArray(examList) && examList.length > 0) {
            baseData.getexams = examList;
            baseData.getexam = examList;
            baseData.masterExamList = examList;
        }
    } catch (e) {
        console.error('Error fetching MasterOEExamFacade exam list:', e);
    }

    return { data: baseData };
}

export async function getStudentSubmissions(data: any) {
    return await api.post<any>('exam', '/LP_OnlineExamAnswerPaperCorrection/getstudentlist', { MI_Id: await getMiId(), ...data });
}

export async function getStudentAnswerSheet(data: any) {
    return await api.post<any>('exam', '/LP_OnlineExamAnswerPaperCorrection/getstudentanswers', { MI_Id: await getMiId(), ...data });
}

export async function saveEvaluatedMarks(data: any) {
    return await api.post<any>('exam', '/LP_OnlineExamAnswerPaperCorrection/saveevaluatedmarks', { MI_Id: await getMiId(), ...data });
}


