'use server';

import { api } from '@/lib/apiService';
import type { NDS9ReportData, NDS9ReportPayload, NDS9ReportResponse } from '@/types/exam/NDS/NDS_9_ProgressNewCardReport';

function extractDataList(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    if (res.data && typeof res.data === 'object') {
        const arr =
            res.data.getclasslist ||
            res.data.classlist ||
            res.data.classList ||
            res.data.fillclass ||
            res.data.getsectionlist ||
            res.data.sectionlist ||
            res.data.sectionList ||
            res.data.fillsection ||
            res.data.getstudentdetails ||
            res.data.studentlist ||
            res.data.studentList ||
            [];
        if (Array.isArray(arr) && arr.length > 0) return arr;
    }
    if (typeof res === 'object') {
        const arr =
            res.getclasslist ||
            res.classlist ||
            res.classList ||
            res.fillclass ||
            res.getsectionlist ||
            res.sectionlist ||
            res.sectionList ||
            res.fillsection ||
            res.getstudentdetails ||
            res.studentlist ||
            res.studentList ||
            [];
        if (Array.isArray(arr) && arr.length > 0) return arr;
    }
    if (Array.isArray(res.data)) return res.data;
    return [];
}

export async function getNDS9Report(payload: NDS9ReportPayload): Promise<NDS9ReportData> {
    try {
        const response = await api.post<any>('exam', '/JSHSExamReports_/nds_6_8_report', payload);
        if (response) {
            return {
                success: response?.success ?? true,
                data: (response?.data || response) as any as NDS9ReportResponse,
                message: response?.message
            };
        }
    } catch (e) {
        console.warn('POST /JSHSExamReports_/nds_6_8_report failed:', e);
    }

    try {
        const response = await api.post<any>('exam', '/JSHSExamReports/nds_6_8_report', payload);
        return {
            success: response?.success ?? true,
            data: (response?.data || response) as any as NDS9ReportResponse,
            message: response?.message
        };
    } catch (e: any) {
        return {
            success: false,
            data: null as any,
            message: e?.message || 'Failed to generate report'
        };
    }
}
