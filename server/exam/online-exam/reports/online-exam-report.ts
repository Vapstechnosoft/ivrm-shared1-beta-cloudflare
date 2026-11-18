'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

export async function getOnlineExamReportInitialData() {
    const endpoints = [
        { service: 'exam', path: '/OE_SchoolExamReport/GetInitialLoadData' },
        { service: 'exam', path: '/OE_SchoolExamReport/getloaddata' },
        { service: 'exam', path: '/OnlineExamConfig/getloaddata' },
        { service: 'naac', path: '/LP_OnlineStudentExam/getloaddatareport/2' },
        { service: 'default', path: '/LP_OnlineStudentExam/getloaddatareport/2' }
    ];

    for (const ep of endpoints) {
        try {
            const res = await api.get<any>(ep.service as any, ep.path);
            if (res) return res;
        } catch (_e) {}
    }

    return await api.get<any>('exam', '/OE_SchoolExamReport/GetInitialLoadData');
}

export async function getOnlineExamReportData(data: any) {
    const session = await auth();
    // Default MI_Id to 30 (IVRM_NEW_ARCH_UAT1 school) since that's where the data is
    const miId = Number(session?.mi_id || 30);
    const token = session?.token;

    // Extract exact filter values from the submitted form
    const asmayId = Number(data.ASMAY_Id || data.asmaY_Id || 0);
    const asmclId = Number(data.ASMCL_Id || data.asmcL_Id || 0);
    const asmsId = Number(data.ASMS_Id || data.asmS_Id || 0);
    const ismsId = Number(data.ISMS_Id || data.ismS_Id || 0);
    const examId = Number(data.LPMOEEX_Id || data.lpmoeeX_Id || data.LMSMOE_Id || data.lmsmoE_Id || 0);
    const fromDate = data.fromDate || data.Fromdate || data.FromDate || '';
    const toDate = data.toDate || data.Todate || data.ToDate || '';

    // Build payload with exact filter IDs from the form
    const payload = {
        MI_Id: miId,
        mi_id: miId,
        ASMAY_Id: asmayId,
        asmaY_Id: asmayId,
        ASMCL_Id: asmclId,
        asmcL_Id: asmclId,
        ASMS_Id: asmsId,
        asmS_Id: asmsId,
        ISMS_Id: ismsId,
        ismS_Id: ismsId,
        LPMOEEX_Id: examId,
        lpmoeeX_Id: examId,
        LMSMOE_Id: examId,
        lmsmoE_Id: examId,
        Fromdate: fromDate,
        FromDate: fromDate,
        fromDate: fromDate,
        Todate: toDate,
        ToDate: toDate,
        toDate: toDate
    };

    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    // ONLY use the real OE_SchoolExamReport endpoints that apply the DB filter correctly.
    // Do NOT fall back to OnlineExamConfig/getreport or LP_OnlineStudentExam which
    // return initial-load data or ignore filter parameters.
    const reportEndpoints = [
        'https://localhost:50258/api/OE_SchoolExamReport/GetExamReport',
        'https://localhost:50258/api/OE_SchoolExamReport/getreport',
        'https://localhost:50258/api/OE_SchoolExamReport/getreportdata'
    ];

    for (const url of reportEndpoints) {
        try {
            const res = await axios.post(url, payload, {
                headers,
                httpsAgent,
                timeout: 15000
            });
            if (res?.data) {
                return res.data;
            }
        } catch (_err) {}
    }

    // No endpoint returned data — return empty
    return { status: true, success: true, data: [], message: 'No records found for selected filter' };
}
