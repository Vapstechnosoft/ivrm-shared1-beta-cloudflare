'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

const getMiId = async () => {
    const session = await auth();
    const id = Number(session?.mi_id);
    return id > 0 ? id : 30;
};

export async function getPublishInitialData() {
    let baseData: any = {};

    // 1. Try 'exam' service endpoints
    const initialEndpoints = [
        '/LP_OnlineExamPublishToStudent/GetInitialLoadData',
        '/OE_AnswerPaperCorrection/GetInitialLoadData',
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

    // Fallback to naac service if needed
    if (!baseData?.getyear && !baseData?.yearList) {
        try {
            const res: any = await api.get('naac', '/MasterOEExamFacade/GetInitialLoadData');
            if (res?.data) baseData = res.data;
            else if (res) baseData = res;
        } catch (e) {}
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
    } catch (e) {}

    return { data: baseData };
}

export async function getPublishStudentList(data: any) {
    return await api.post('exam', '/LP_OnlineExamPublishToStudent/getstudentlist', { MI_Id: await getMiId(), ...data });
}

export async function savePublishToStudent(data: any) {
    return await api.post<any>('exam', '/LP_OnlineExamPublishToStudent/savedata', { MI_Id: await getMiId(), ...data });
}

